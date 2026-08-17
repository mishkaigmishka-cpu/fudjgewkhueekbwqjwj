import telebot
import random
import psycopg2
import psycopg2.pool
import time
import os
import threading
import hmac
import hashlib
import urllib.parse
import uuid
import ipaddress
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, LabeledPrice
from cachetools import TTLCache

TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TOKEN:
    raise ValueError("TELEGRAM_TOKEN не установлен!")

WEBAPP_URL = os.environ.get("WEBAPP_URL")
if not WEBAPP_URL:
    raise ValueError("WEBAPP_URL не установлен!")
WEBAPP_URL = WEBAPP_URL.rstrip('/')

ADMIN_ID = int(os.environ.get("ADMIN_ID", "0"))

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL не установлен!")

WEBAPP_SECRET = hmac.new(b"WebAppData", TOKEN.encode(), hashlib.sha256).digest()

TG_NETWORKS = [
    ipaddress.ip_network("149.154.160.0/20"),
    ipaddress.ip_network("91.108.4.0/22")
]

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per minute"]
)

# ===== АВТОУДАЛЕНИЕ =====
def delete_message_after(chat_id, message_id, delay=60):
    def delete():
        time.sleep(delay)
        try:
            bot.delete_message(chat_id, message_id)
        except Exception:
            pass
    threading.Thread(target=delete, daemon=True).start()

def safe_delete(chat_id, message_id):
    try:
        bot.delete_message(chat_id, message_id)
    except Exception:
        pass

main_message_ids = TTLCache(maxsize=10000, ttl=3600)

# ===== БАНЫ =====
def is_banned(uid):
    row = qone("SELECT banned FROM users WHERE id=%s", (uid,))
    return row and row[0] == 1

def show_main_menu(chat_id):
    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("🎮 Играть", web_app=WebAppInfo(WEBAPP_URL)),
        InlineKeyboardButton("💎 Пополнить", callback_data="deposit_menu")
    )
    caption = "🎰 <b>Добро пожаловать в RANDEVU!</b>\n\nОткрывай кейсы, играй в мини-игры и выигрывай!"
    logo_path = "static/assets/20260815T144844044172Z-ipython-tmp-29c96895207449b9923f8ffa5b30a84e.png"

    if chat_id in main_message_ids:
        try:
            bot.delete_message(chat_id, main_message_ids[chat_id])
        except Exception:
            pass
        main_message_ids.pop(chat_id, None)

    try:
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as photo:
                msg = bot.send_photo(chat_id, photo, caption=caption, reply_markup=kb, parse_mode="HTML")
        else:
            msg = bot.send_message(chat_id, caption, reply_markup=kb, parse_mode="HTML")
    except Exception:
        msg = bot.send_message(chat_id, caption, reply_markup=kb, parse_mode="HTML")

    main_message_ids[chat_id] = msg.message_id

# ===== ВЕРИФИКАЦИЯ TELEGRAM =====
def verify_telegram_init_data(init_data_str: str) -> dict:
    if not init_data_str:
        return None
    try:
        parsed = dict(urllib.parse.parse_qsl(init_data_str, keep_blank_values=True))
        received_hash = parsed.pop('hash', None)
        if not received_hash:
            return None
        data_check_string = '\n'.join(f"{k}={v}" for k, v in sorted(parsed.items()))
        expected_hash = hmac.new(WEBAPP_SECRET, data_check_string.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_hash, received_hash):
            return None
        user_data = parsed.get('user', '{}')
        if isinstance(user_data, str):
            user_data = json.loads(user_data)
        return {
            'user_id': user_data.get('id'),
            'username': user_data.get('username', ''),
            'first_name': user_data.get('first_name', ''),
            'auth_date': int(parsed.get('auth_date', 0))
        }
    except Exception:
        return None

def get_authenticated_user_id() -> int:
    init_data = request.headers.get('X-Telegram-Init-Data', '')
    if not init_data:
        data = request.get_json(silent=True) or {}
        init_data = data.get('init_data', '')
    if not init_data:
        return None
    verified = verify_telegram_init_data(init_data)
    if not verified:
        return None
    if time.time() - verified.get('auth_date', 0) > 86400:
        return None
    return verified.get('user_id')

# ===== БД =====
_db_pool = psycopg2.pool.ThreadedConnectionPool(
    minconn=2, maxconn=20, dsn=DATABASE_URL
)
_db_local = threading.local()
write_lock = threading.RLock()

def get_conn():
    conn = getattr(_db_local, 'conn', None)
    if conn is None or conn.closed:
        conn = _db_pool.getconn()
        _db_local.conn = conn
    return conn

def release_conn():
    conn = getattr(_db_local, 'conn', None)
    if conn is not None:
        _db_pool.putconn(conn)
        _db_local.conn = None

def q(sql, params=()):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        release_conn()

def qone(sql, params=()):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchone()
    finally:
        release_conn()

def qw(sql, params=()):
    with write_lock:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                conn.commit()
                return cur
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            release_conn()

def qwone(sql, params=()):
    with write_lock:
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                conn.commit()
                return cur.fetchone()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            release_conn()

def init_db():
    conn = get_conn()
    with write_lock:
        cur = conn.cursor()
        
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")
        users_exists = cur.fetchone()[0]
        
        if users_exists:
            cur.execute("SELECT COUNT(*) FROM users")
            user_count = cur.fetchone()[0]
            print(f"✅ База данных цела. Пользователей: {user_count}")
        else:
            print("🆕 Создаём новую базу данных...")
        
        cur.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            balance INTEGER DEFAULT 5,
            total_cases INTEGER DEFAULT 0,
            streak INTEGER DEFAULT 0,
            last_open INTEGER DEFAULT 0,
            status TEXT DEFAULT '🟢 Новичок',
            refs INTEGER DEFAULT 0,
            daily_claimed INTEGER DEFAULT 0,
            username TEXT DEFAULT '',
            promo_used INTEGER DEFAULT 0,
            promo_code TEXT DEFAULT '',
            total_spent INTEGER DEFAULT 0,
            luck_boost REAL DEFAULT 1.0,
            banned INTEGER DEFAULT 0,
            total_deposit INTEGER DEFAULT 0,
            claimed_deposit TEXT DEFAULT '',
            last_free_case INTEGER DEFAULT 0
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS invited (
            inviter_id INTEGER,
            invited_id INTEGER,
            PRIMARY KEY (inviter_id, invited_id)
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS battle_stats (
            user_id INTEGER PRIMARY KEY,
            battles_played INTEGER DEFAULT 0,
            battles_won INTEGER DEFAULT 0,
            battles_lost INTEGER DEFAULT 0,
            total_won_stars INTEGER DEFAULT 0,
            total_lost_stars INTEGER DEFAULT 0,
            commission_paid INTEGER DEFAULT 0
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS mines_stats (
            user_id INTEGER PRIMARY KEY,
            games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            best_multiplier REAL DEFAULT 1.0,
            total_won INTEGER DEFAULT 0,
            total_lost INTEGER DEFAULT 0
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS crash_stats (
            user_id INTEGER PRIMARY KEY,
            games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            best_multiplier REAL DEFAULT 1.0,
            total_won INTEGER DEFAULT 0,
            total_lost INTEGER DEFAULT 0
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS promo_codes (
            code TEXT PRIMARY KEY,
            reward INTEGER DEFAULT 20,
            created_by INTEGER,
            created_at INTEGER,
            max_uses INTEGER DEFAULT 1,
            used_count INTEGER DEFAULT 0
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS used_promos (
            user_id INTEGER,
            promo_code TEXT,
            used_at INTEGER,
            PRIMARY KEY (user_id, promo_code)
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS promo_spend (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            promo_code TEXT,
            spent INTEGER DEFAULT 0
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS level_wins (
            user_id INTEGER,
            case_type TEXT,
            wins INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, case_type)
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS completed_quests (
            user_id INTEGER,
            quest_id TEXT,
            completed_at INTEGER,
            PRIMARY KEY (user_id, quest_id)
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS case_stats (
            user_id INTEGER,
            case_type TEXT,
            opened INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, case_type)
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS level_progress (
            user_id INTEGER,
            case_type TEXT,
            opened INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, case_type)
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS user_tracking (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            event_type TEXT,
            event_data TEXT DEFAULT '',
            created_at INTEGER
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS admin_logs (
            id SERIAL PRIMARY KEY,
            admin_id INTEGER,
            action TEXT,
            target_id INTEGER,
            details TEXT,
            created_at INTEGER
        )''')
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_used_promos_user ON used_promos(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_promo_spend_user ON promo_spend(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_level_wins_user ON level_wins(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_completed_quests_user ON completed_quests(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_case_stats_user ON case_stats(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_level_progress_user ON level_progress(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_user_tracking_user ON user_tracking(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_admin_logs_time ON admin_logs(created_at DESC)")
        conn.commit()

init_db()

# ===== ОТСЛЕЖИВАНИЕ ПОЛЬЗОВАТЕЛЕЙ =====
def track_user(user_id, event_type, event_data=''):
    try:
        qw("INSERT INTO user_tracking (user_id, event_type, event_data, created_at) VALUES (%s, %s, %s, %s)",
           (user_id, event_type, event_data, int(time.time())))
    except Exception:
        pass

def admin_log(action: str, target_id: int = None, details: str = ""):
    try:
        qw("INSERT INTO admin_logs (admin_id, action, target_id, details, created_at) VALUES (%s, %s, %s, %s, %s)",
           (ADMIN_ID, action, target_id, details, int(time.time())))
    except Exception as e:
        print(f"[ADMIN LOG ERROR] {e}")

# ===== КЕЙСЫ =====
ads = ["💎 Крипто-обменник: https://t.me/exchange", "🎁 Халява каждый день: https://t.me/free_stuff", "🔥 Скины со скидкой: https://t.me/skins"]

CASE_PRICES = {"free": 0, "mud": 5, "wood": 9, "stone": 19, "bronze": 49, "silver": 99, "gold": 249, "diamond": 499, "netherite": 999, "obsidian": 2499, "bedrock": 10000}

LEVEL_ORDER = ['mud', 'wood', 'stone', 'bronze', 'silver', 'gold', 'diamond', 'netherite', 'obsidian', 'bedrock']

FREE_CASE_COOLDOWN = 7200
BATTLE_PROGRESS_COST = 10
WINS_TO_UNLOCK = 3

CASE_RANGES = {
    "free": {"common": [1, 2], "rare": [3, 4], "epic": [5, 6, 7, 8, 9, 10], "legendary": [100], "jackpot": [1000], "common_chance": 0.599, "rare_chance": 0.299, "epic_chance": 0.0999, "legendary_chance": 0.0001, "jackpot_chance": 0.00000001},

    "mud": {"common": [1, 2, 3, 4, 5, 6, 7], "rare": [10, 12, 13], "epic": [16, 18, 20, 22, 24, 27], "legendary": [50], "jackpot": [500], "common_chance": 0.876, "rare_chance": 0.089, "epic_chance": 0.03, "legendary_chance": 0.005, "jackpot_chance": 0.000001},

    "wood": {"common": [2, 4, 5, 6, 7, 8, 9, 10], "rare": [12, 13, 15], "epic": [20, 50], "legendary": [100, 500], "jackpot": [1000], "common_chance": 0.80, "rare_chance": 0.14, "epic_chance": 0.05, "legendary_chance": 0.01, "jackpot_chance": 0.000001},

    "stone": {"common": [11, 13, 15, 16, 17, 18, 19], "rare": [21, 23, 24, 25], "epic": [30, 50, 100], "legendary": [250, 500, 1000], "jackpot": [2500], "common_chance": 0.80, "rare_chance": 0.15, "epic_chance": 0.045, "legendary_chance": 0.005, "jackpot_chance": 0.000001},

    "bronze": {"common": [20, 25, 30], "rare": [35, 40, 45, 50], "epic": [55, 60, 65, 75, 100], "legendary": [222, 333, 444, 555, 1000, 1500, 2000], "jackpot": [5000], "common_chance": 0.89, "rare_chance": 0.10, "epic_chance": 0.009999, "legendary_chance": 0.000001, "jackpot_chance": 0.0000001},

    "silver": {"common": [40, 50, 60, 70], "rare": [70, 80, 90, 100], "epic": [100, 110, 120, 130, 140, 150], "legendary": [200, 250, 333, 444, 555, 666, 777, 888, 999, 1488, 2011, 5000], "jackpot": [10000], "common_chance": 0.25, "rare_chance": 0.6745, "epic_chance": 0.0749, "legendary_chance": 0.0005, "jackpot_chance": 0.00000001},

    "gold": {"common": [75, 100], "rare": [150, 169, 190, 220, 251], "epic": [300, 400, 500, 777], "legendary": [999, 1000, 2000, 5000, 10000, 12500], "jackpot": [25000], "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001},

    "diamond": {"common": [250, 300, 333], "rare": [350, 444, 505], "epic": [1000, 1488, 2222], "legendary": [2500, 5000, 10000, 12500, 25000], "jackpot": [50000], "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001},

    "netherite": {"common": [500, 550, 600], "rare": [650, 700, 750, 800, 850], "epic": [900, 950, 1000, 1500], "legendary": [2000, 2500, 3000, 3200, 3500, 4000, 5000, 10000, 15000, 20000], "jackpot": [25000], "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001},

    "obsidian": {"common": [500, 1000, 1500], "rare": [2000, 2500, 3000], "epic": [4000, 5000, 7500], "legendary": [10000, 15000], "jackpot": [25000], "common_chance": 0.59999, "rare_chance": 0.35, "epic_chance": 0.05, "legendary_chance": 0.000001, "jackpot_chance": 0.000009},

    "bedrock": {"common": [5000], "rare": [10000, 25000], "epic": [50000, 100000], "legendary": [250000], "jackpot": [1000000], "common_chance": 0.999, "rare_chance": 0.0009, "epic_chance": 0.00009, "legendary_chance": 0.000009, "jackpot_chance": 0.000001}
}

# Нормализация шансов
for case_type, data in CASE_RANGES.items():
    total = (data['common_chance'] + data['rare_chance'] + 
             data['epic_chance'] + data['legendary_chance'] + data['jackpot_chance'])
    if abs(total - 1.0) > 1e-9:
        factor = 1.0 / total
        data['common_chance'] *= factor
        data['rare_chance'] *= factor
        data['epic_chance'] *= factor
        data['legendary_chance'] *= factor
        data['jackpot_chance'] *= factor

def get_prize(case_type, user_id=None):
    data = CASE_RANGES[case_type]
    rnd = random.random()

    c = data["common_chance"]
    r = data["rare_chance"]
    e = data["epic_chance"]
    l = data["legendary_chance"]
    j = data["jackpot_chance"]

    if user_id:
        row = qone("SELECT luck_boost FROM users WHERE id=%s", (user_id,))
        if row and row[0] > 1.0:
            c = max(0, c - 0.21)
            r = r + 0.07
            e = e + 0.05
            l = l + 0.05
            j = j + 0.01
            total = c + r + e + l + j
            if total > 1.0:
                factor = 1.0 / total
                c *= factor
                r *= factor
                e *= factor
                l *= factor
                j *= factor

    if rnd < j:
        return random.choice(data["jackpot"])
    elif rnd < j + l:
        return random.choice(data["legendary"])
    elif rnd < j + l + c:
        if case_type == "mud":
            if random.random() < 0.39 / 0.70:
                return random.choice([1, 2])
            else:
                return random.choice([3, 4, 5, 6, 7])
        elif case_type == "wood":
            if random.random() < 0.39 / 0.75:
                return random.choice([2, 4, 5])
            else:
                return random.choice([6, 7, 8, 9, 10])
        elif case_type == "stone":
            if random.random() < 0.55 / 0.80:
                return random.choice([11, 13, 15])
            else:
                return random.choice([16, 17, 18, 19])
        elif case_type == "bronze":
            if random.random() < 0.29 / 0.89:
                return random.choice([20, 25, 30])
            else:
                return random.choice([35, 40, 45, 50])
        else:
            return random.choice(data["common"])
    elif rnd < j + l + c + r:
        return random.choice(data["rare"])
    else:
        return random.choice(data["epic"])

def get_user(uid):
    return qone("SELECT * FROM users WHERE id=%s", (uid,))

def get_user_by_username(username):
    return qone("SELECT * FROM users WHERE username=%s", (username,))

ALLOWED_USER_FIELDS = {
    'balance', 'total_cases', 'streak', 'last_open', 'status',
    'refs', 'daily_claimed', 'username', 'promo_used', 'promo_code',
    'total_spent', 'luck_boost', 'banned', 'total_deposit',
    'claimed_deposit', 'last_free_case'
}

def update_user(uid, **kwargs):
    if not kwargs:
        return
    safe = {k: v for k, v in kwargs.items() if k in ALLOWED_USER_FIELDS}
    if not safe:
        return
    sets = ', '.join(f"{k}=%s" for k in safe)
    vals = list(safe.values()) + [uid]
    qw(f"UPDATE users SET {sets} WHERE id=%s", vals)

def update_status(uid, total_cases):
    if total_cases >= 2500:
        status = "👑 Легенда"
    elif total_cases >= 1000:
        status = "🟣 Мастер фортуны"
    elif total_cases >= 444:
        status = "🔴 Сталкер халявы"
    elif total_cases >= 100:
        status = "🟠 Везунчик"
    elif total_cases >= 10:
        status = "🟡 Кейс-охотник"
    else:
        status = "🟢 Новичок"
    update_user(uid, status=status)

def get_level_wins(uid):
    rows = q("SELECT case_type, wins FROM level_wins WHERE user_id=%s", (uid,))
    return {r[0]: r[1] for r in rows}

def get_unlocked_levels(uid):
    wins = get_level_wins(uid)
    unlocked = ['mud']
    for i in range(1, len(LEVEL_ORDER)):
        if wins.get(LEVEL_ORDER[i - 1], 0) >= WINS_TO_UNLOCK:
            unlocked.append(LEVEL_ORDER[i])
        else:
            break
    return unlocked

def add_case_stats(uid, case_type, n=1):
    qw("INSERT INTO case_stats (user_id, case_type, opened) VALUES (%s, %s, %s) ON CONFLICT (user_id, case_type) DO UPDATE SET opened = case_stats.opened + %s", (uid, case_type, n, n))

def add_level_progress(uid, case_type, n=1):
    qw("INSERT INTO level_progress (user_id, case_type, opened) VALUES (%s, %s, %s) ON CONFLICT (user_id, case_type) DO UPDATE SET opened = level_progress.opened + %s", (uid, case_type, n, n))

def get_level_progress(uid, case_type):
    row = qone("SELECT opened FROM level_progress WHERE user_id=%s AND case_type=%s", (uid, case_type))
    return row[0] if row else 0

def register_case_opening(uid, case_type, n=1):
    add_case_stats(uid, case_type, n)
    if case_type in LEVEL_ORDER and case_type in get_unlocked_levels(uid):
        add_level_progress(uid, case_type, n)

def _update_game_stats(table, user_id, won, multiplier, stars):
    assert table in ('mines_stats', 'crash_stats')
    qw(f"""INSERT INTO {table}
            (user_id, games, wins, losses, best_multiplier, total_won, total_lost)
            VALUES (%s, 1, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                games = {table}.games + 1,
                wins = {table}.wins + %s,
                losses = {table}.losses + %s,
                best_multiplier = GREATEST({table}.best_multiplier, %s),
                total_won = {table}.total_won + %s,
                total_lost = {table}.total_lost + %s""",
       (user_id, 1 if won else 0, 0 if won else 1, multiplier,
        stars if won else 0, 0 if won else stars,
        1 if won else 0, 0 if won else 1, multiplier,
        stars if won else 0, 0 if won else stars))

def update_mines_stats(user_id, won, multiplier, stars):
    _update_game_stats('mines_stats', user_id, won, multiplier, stars)

def update_crash_stats(user_id, won, multiplier, stars):
    _update_game_stats('crash_stats', user_id, won, multiplier, stars)

def update_battle_stats(user_id, won, stars, case_type=None):
    qw("""INSERT INTO battle_stats
            (user_id, battles_played, battles_won, battles_lost, total_won_stars, total_lost_stars, commission_paid)
            VALUES (%s, 1, %s, %s, %s, %s, 0)
            ON CONFLICT (user_id) DO UPDATE SET
                battles_played = battle_stats.battles_played + 1,
                battles_won = battle_stats.battles_won + %s,
                battles_lost = battle_stats.battles_lost + %s,
                total_won_stars = battle_stats.total_won_stars + %s,
                total_lost_stars = battle_stats.total_lost_stars + %s""",
       (user_id, 1 if won else 0, 0 if won else 1,
        stars if won else 0, 0 if won else stars,
        1 if won else 0, 0 if won else 1,
        stars if won else 0, 0 if won else stars))
    if won and case_type:
        qw("INSERT INTO level_wins (user_id, case_type, wins) VALUES (%s, %s, 1) ON CONFLICT (user_id, case_type) DO UPDATE SET wins = level_wins.wins + 1", (user_id, case_type))

active_mines_games = {}
mines_lock = threading.Lock()
crash_lock = threading.Lock()

crash_data = {
    'phase': 'preview',
    'multiplier': 1.00,
    'crash_point': 1.00,
    'start_time': 0,
    'crash_time': 0,
    'bets': {},
    'waiting_time': 0,
    'game_count': 0,
    'preview_start': 0,
    'crash_multiplier_at_crash': 1.00,
    'crashed_until': 0,
    'first_visit': True
}

def generate_crash_point():
    rnd = random.random()
    if rnd < 0.35:
        return round(1.05 + rnd * 0.50, 2)
    elif rnd < 0.70:
        return round(1.50 + (rnd - 0.35) * 4.00, 2)
    elif rnd < 0.90:
        return round(3.00 + (rnd - 0.70) * 10.00, 2)
    elif rnd < 0.98:
        return round(6.00 + (rnd - 0.90) * 25.00, 2)
    else:
        return round(10.00 + (rnd - 0.98) * 60.00, 2)

def get_crash_multiplier(elapsed):
    if elapsed < 1.0:
        multiplier = 1.00 + elapsed * 0.06
    elif elapsed < 2.0:
        multiplier = 1.06 + (elapsed - 1.0) * 0.08
    elif elapsed < 3.5:
        multiplier = 1.14 + (elapsed - 2.0) * 0.09
    elif elapsed < 5.0:
        multiplier = 1.275 + (elapsed - 3.5) * 0.10
    elif elapsed < 6.5:
        multiplier = 1.425 + (elapsed - 5.0) * 0.11
    elif elapsed < 8.0:
        multiplier = 1.59 + (elapsed - 6.5) * 0.12
    elif elapsed < 10.0:
        multiplier = 1.77 + (elapsed - 8.0) * 0.13
    elif elapsed < 12.0:
        multiplier = 2.03 + (elapsed - 10.0) * 0.15
    elif elapsed < 14.5:
        multiplier = 2.33 + (elapsed - 12.0) * 0.20
    elif elapsed < 17.0:
        multiplier = 2.83 + (elapsed - 14.5) * 0.28
    elif elapsed < 20.0:
        multiplier = 3.53 + (elapsed - 17.0) * 0.40
    elif elapsed < 23.5:
        multiplier = 4.73 + (elapsed - 20.0) * 0.60
    elif elapsed < 27.5:
        multiplier = 6.83 + (elapsed - 23.5) * 0.90
    else:
        multiplier = 12.00
    return round(min(multiplier, 12.00), 2)

def get_mines_multiplier(opened, mines):
    multipliers = {
        4: {1: 1.05, 2: 1.15, 3: 1.30, 4: 1.50, 5: 1.75, 6: 2.10, 7: 2.50, 8: 3.00, 9: 3.50, 10: 4.20, 11: 5.00, 12: 6.00},
        5: {1: 1.10, 2: 1.20, 3: 1.40, 4: 1.70, 5: 2.00, 6: 2.40, 7: 3.00, 8: 3.80, 9: 4.50, 10: 5.50, 11: 6.50, 12: 8.00},
        6: {1: 1.15, 2: 1.30, 3: 1.55, 4: 1.90, 5: 2.30, 6: 2.80, 7: 3.50, 8: 4.50, 9: 5.50, 10: 6.50, 11: 8.00, 12: 10.00},
        7: {1: 1.20, 2: 1.40, 3: 1.70, 4: 2.10, 5: 2.60, 6: 3.20, 7: 4.00, 8: 5.00, 9: 6.50, 10: 8.00, 11: 10.00, 12: 12.00},
        8: {1: 1.25, 2: 1.50, 3: 1.85, 4: 2.30, 5: 2.90, 6: 3.60, 7: 4.50, 8: 5.50, 9: 7.50, 10: 9.00, 11: 12.00, 12: 15.00},
        9: {1: 1.30, 2: 1.60, 3: 2.00, 4: 2.50, 5: 3.20, 6: 4.00, 7: 5.00, 8: 6.50, 9: 8.50, 10: 10.00, 11: 14.00, 12: 18.00}
    }
    return multipliers.get(mines, {}).get(opened, 1.00)

def crash_timer():
    global crash_data
    while True:
        with crash_lock:
            now = time.time()
            if crash_data['phase'] == 'preview':
                if not crash_data.get('preview_start'):
                    crash_data['preview_start'] = now
                    crash_data['multiplier'] = 1.00
                    crash_data['crash_point'] = generate_crash_point()
                elapsed = now - crash_data['preview_start']
                crash_data['multiplier'] = get_crash_multiplier(elapsed)
                if crash_data['multiplier'] >= crash_data['crash_point'] or crash_data['multiplier'] >= 12.00:
                    crash_data['phase'] = 'waiting'
                    crash_data['waiting_time'] = now + 10
                    crash_data['multiplier'] = crash_data['crash_point']
                    crash_data['crash_multiplier_at_crash'] = crash_data['multiplier']
                    crash_data['first_visit'] = False
            elif crash_data['phase'] == 'waiting':
                if now >= crash_data['waiting_time']:
                    crash_data['phase'] = 'active'
                    crash_data['start_time'] = now
                    crash_data['multiplier'] = 1.00
                    crash_data['crash_point'] = generate_crash_point()
                    crash_data['crash_multiplier_at_crash'] = 1.00
                else:
                    crash_data['multiplier'] = 1.00
            elif crash_data['phase'] == 'active':
                elapsed = now - crash_data['start_time']
                crash_data['multiplier'] = get_crash_multiplier(elapsed)
                if crash_data['multiplier'] >= crash_data['crash_point'] or crash_data['multiplier'] >= 12.00:
                    crash_multiplier = crash_data['multiplier']
                    crash_data['phase'] = 'crashed'
                    crash_data['crashed_until'] = now + 4
                    crash_data['crash_multiplier_at_crash'] = crash_multiplier
                    crash_data['game_count'] += 1
                    lost_bets = list(crash_data['bets'].items())
                    crash_data['bets'] = {}
                    for bet_uid, bet_amount in lost_bets:
                        try:
                            update_crash_stats(bet_uid, won=False, multiplier=crash_multiplier, stars=bet_amount)
                        except Exception as e:
                            print(f"crash loss stats error: {e}")
            elif crash_data['phase'] == 'crashed':
                if now >= crash_data.get('crashed_until', 0):
                    crash_data['phase'] = 'waiting'
                    crash_data['waiting_time'] = now + 10
                    crash_data['multiplier'] = 1.00
        time.sleep(0.05)

@bot.message_handler(commands=['start'])
def start(msg):
    uid = msg.from_user.id
    username = msg.from_user.username or ""
    args = msg.text.split()
    qw("INSERT INTO users (id) VALUES (%s) ON CONFLICT (id) DO NOTHING", (uid,))
    track_user(uid, 'start', f"ref:{args[1] if len(args) > 1 else 'direct'}")
    if len(args) > 1:
        try:
            inviter_id = int(args[1])
            if inviter_id != uid:
                cur = qw("INSERT INTO invited (inviter_id, invited_id) VALUES (%s, %s) ON CONFLICT (inviter_id, invited_id) DO NOTHING", (inviter_id, uid))
                inviter = get_user(inviter_id)
                if cur.rowcount > 0 and inviter:
                    update_user(inviter_id, balance=inviter[1] + 10, refs=inviter[6] + 1)
                    try:
                        bot.send_message(inviter_id, f"⭐ Ты получил 10 звёзд за приглашение @{username}!")
                    except Exception:
                        pass
                    user = get_user(uid)
                    update_user(uid, balance=user[1] + 5)
        except Exception:
            pass
    update_user(uid, username=username)
    show_main_menu(msg.chat.id)
    try:
        bot.delete_message(msg.chat.id, msg.message_id)
    except Exception:
        pass

deposit_state = TTLCache(maxsize=10000, ttl=300)

@bot.callback_query_handler(func=lambda call: call.data == "deposit_menu")
def deposit_menu(call):
    uid = call.from_user.id
    deposit_state[uid] = True

    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton("🔙 Назад", callback_data="back_to_deposit"))

    msg = bot.send_message(
        call.message.chat.id,
        "💎 <b>Пополнение баланса</b>\n\nВведи сумму от <b>1</b> до <b>5000</b> звёзд.\n1 звезда = 1 монета\n\n<i>Напиши число в чат...</i>",
        reply_markup=kb,
        parse_mode="HTML"
    )
    delete_message_after(call.message.chat.id, msg.message_id, 60)

@bot.callback_query_handler(func=lambda call: call.data == "back_to_deposit")
def back_to_deposit(call):
    uid = call.from_user.id
    deposit_state.pop(uid, None)
    safe_delete(call.message.chat.id, call.message.message_id)
    show_main_menu(call.message.chat.id)

@bot.message_handler(content_types=['text'], func=lambda msg: msg.from_user.id in deposit_state)
def process_deposit_amount(msg):
    uid = msg.from_user.id
    text = msg.text.strip()
    safe_delete(msg.chat.id, msg.message_id)

    try:
        amount = int(text)
    except ValueError:
        kb = InlineKeyboardMarkup(row_width=1)
        kb.add(InlineKeyboardButton("🔙 Назад", callback_data="back_to_deposit"))
        error_msg = bot.reply_to(
            msg,
            "❌ Введи число от 1 до 5000.\n\n💎 <b>Пополнение баланса</b>\n\nВведи сумму от <b>1</b> до <b>5000</b> звёзд.\n1 звезда = 1 монета\n\n<i>Напиши число в чат...</i>",
            reply_markup=kb,
            parse_mode="HTML"
        )
        delete_message_after(msg.chat.id, error_msg.message_id, 60)
        return

    if amount < 1 or amount > 5000:
        kb = InlineKeyboardMarkup(row_width=1)
        kb.add(InlineKeyboardButton("🔙 Назад", callback_data="back_to_deposit"))
        error_msg = bot.reply_to(
            msg,
            f"❌ Сумма должна быть от 1 до 5000 звёзд. Ты ввёл {amount}\n\n💎 <b>Пополнение баланса</b>\n\nВведи сумму от <b>1</b> до <b>5000</b> звёзд.\n1 звезда = 1 монета\n\n<i>Напиши число в чат...</i>",
            reply_markup=kb,
            parse_mode="HTML"
        )
        delete_message_after(msg.chat.id, error_msg.message_id, 60)
        return

    deposit_state.pop(uid, None)
    prices = [LabeledPrice(label=f"{amount} монет", amount=amount)]
    invoice_msg = bot.send_invoice(
        msg.chat.id,
        title="Пополнение баланса RANDEVU",
        description=f"Покупка {amount} монет за {amount} Telegram Stars",
        invoice_payload=f"deposit_{uid}_{amount}",
        provider_token="",
        currency="XTR",
        prices=prices,
        start_parameter="deposit"
    )
    delete_message_after(msg.chat.id, invoice_msg.message_id, 60)

@bot.pre_checkout_query_handler(func=lambda query: True)
def checkout(pre_checkout_query):
    bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)

@bot.message_handler(content_types=['successful_payment'])
def got_payment(msg):
    uid = msg.from_user.id
    payload = msg.successful_payment.invoice_payload
    safe_delete(msg.chat.id, msg.message_id)
    try:
        _, payload_uid, amount = payload.split("_")
        amount = int(amount)
        payload_uid = int(payload_uid)
        if payload_uid != uid:
            return
        user = get_user(uid)
        if user:
            qw("UPDATE users SET balance = balance + %s, total_deposit = total_deposit + %s WHERE id = %s", (amount, amount, uid))
            confirm_msg = bot.send_message(
                msg.chat.id,
                f"✅ <b>Баланс пополнен!</b>\n\n+{amount}⭐\n💰 Текущий баланс: {user[1] + amount}⭐",
                parse_mode="HTML"
            )
            delete_message_after(msg.chat.id, confirm_msg.message_id, 60)
            show_main_menu(msg.chat.id)
    except Exception as e:
        print(f"Payment error: {e}")
        error_msg = bot.send_message(msg.chat.id, "❌ Ошибка при зачислении. Обратись в поддержку.")
        delete_message_after(msg.chat.id, error_msg.message_id, 60)

@bot.message_handler(commands=['ban'])
def ban_user(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /ban @username")
        return
    username = args[1].replace('@', '')
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], banned=1)
    admin_log('ban', user[0], f"Забанен @{username}")
    bot.reply_to(msg, f"✅ @{username} забанен!")

@bot.message_handler(commands=['unban'])
def unban_user(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /unban @username")
        return
    username = args[1].replace('@', '')
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], banned=0)
    admin_log('unban', user[0], f"Разбанен @{username}")
    bot.reply_to(msg, f"✅ @{username} разбанен!")

@bot.message_handler(commands=['reset'])
def reset_user(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /reset @username")
        return
    username = args[1].replace('@', '')
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], balance=0, total_cases=0, streak=0, status="🟢 Новичок", refs=0, total_spent=0, total_deposit=0, claimed_deposit='')
    qw("DELETE FROM level_wins WHERE user_id=%s", (user[0],))
    qw("DELETE FROM level_progress WHERE user_id=%s", (user[0],))
    qw("DELETE FROM completed_quests WHERE user_id=%s", (user[0],))
    qw("DELETE FROM case_stats WHERE user_id=%s", (user[0],))
    qw("DELETE FROM mines_stats WHERE user_id=%s", (user[0],))
    qw("DELETE FROM crash_stats WHERE user_id=%s", (user[0],))
    qw("DELETE FROM battle_stats WHERE user_id=%s", (user[0],))
    qw("DELETE FROM used_promos WHERE user_id=%s", (user[0],))
    qw("DELETE FROM promo_spend WHERE user_id=%s", (user[0],))
    qw("DELETE FROM invited WHERE inviter_id=%s OR invited_id=%s", (user[0], user[0]))
    admin_log('reset', user[0], f"Сброшен @{username}")
    bot.reply_to(msg, f"✅ @{username} сброшен!")

@bot.message_handler(commands=['luck'])
def luck_boost(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /luck @username")
        return
    username = args[1].replace('@', '')
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    if user[12] > 1.0:
        bot.reply_to(msg, f"❌ У @{username} уже повышены шансы!")
        return
    update_user(user[0], luck_boost=5.0)
    admin_log('luck', user[0], f"Шансы x5 для @{username}")
    bot.reply_to(msg, f"✅ Шансы @{username} увеличены в 5x!")

@bot.message_handler(commands=['unluck'])
def unluck_boost(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /unluck @username")
        return
    username = args[1].replace('@', '')
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], luck_boost=1.0)
    admin_log('unluck', user[0], f"Шансы сброшены для @{username}")
    bot.reply_to(msg, f"✅ Шансы @{username} сброшены!")

@bot.message_handler(commands=['give'])
def give_stars(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 3:
        bot.reply_to(msg, "❌ Формат: /give @username сумма")
        return
    username = args[1].replace('@', '')
    try:
        amount = int(args[2])
    except ValueError:
        bot.reply_to(msg, "❌ Сумма должна быть числом")
        return
    if amount < 1 or amount > 1000:
        bot.reply_to(msg, "❌ Сумма должна быть от 1 до 1000⭐")
        return
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    new_balance = user[1] + amount
    update_user(user[0], balance=new_balance)
    admin_log('give', user[0], f"Начислено {amount}⭐ @{username}")
    bot.reply_to(msg, f"✅ Начислено {amount}⭐ @{username}!\nНовый баланс: {new_balance}⭐")
    try:
        bot.send_message(user[0], f"🎁 Администратор начислил тебе {amount}⭐!\nТекущий баланс: {new_balance}⭐")
    except Exception:
        pass

@bot.message_handler(commands=['bonus'])
def bonus(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    bot.reply_to(msg, f"✅ Ты ADMIN! Твой ID: {ADMIN_ID}")

@bot.message_handler(commands=['addbalance'])
def add_balance(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 3:
        bot.reply_to(msg, "❌ Формат: /addbalance @username сумма")
        return
    username = args[1].replace('@', '')
    try:
        amount = int(args[2])
    except ValueError:
        bot.reply_to(msg, "❌ Сумма должна быть числом")
        return
    if amount < 1 or amount > 1000:
        bot.reply_to(msg, "❌ Сумма должна быть от 1 до 1000⭐")
        return
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    new_balance = user[1] + amount
    update_user(user[0], balance=new_balance)
    admin_log('addbalance', user[0], f"Начислено {amount}⭐ @{username}")
    bot.reply_to(msg, f"✅ Начислено {amount}⭐ @{username}!\nНовый баланс: {new_balance}⭐")
    try:
        bot.send_message(user[0], f"🎁 Администратор начислил тебе {amount}⭐!\nТекущий баланс: {new_balance}⭐")
    except Exception:
        pass

@bot.message_handler(commands=['take'])
def take_stars(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 3:
        bot.reply_to(msg, "Формат: /take @username сумма [причина]")
        return
    username = args[1].replace('@', '')
    try:
        amount = int(args[2])
    except ValueError:
        bot.reply_to(msg, "Сумма должна быть числом")
        return
    if amount < 1:
        bot.reply_to(msg, "Сумма должна быть положительной")
        return
    reason = ' '.join(args[3:]) if len(args) > 3 else 'Вывод средств'
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"Пользователь @{username} не найден")
        return
    uid = user[0]
    current_balance = user[1]
    if current_balance < amount:
        bot.reply_to(msg, f"У @{username} недостаточно звёзд! Баланс: {current_balance}, требуется: {amount}")
        return
    new_balance = current_balance - amount
    update_user(uid, balance=new_balance)
    admin_log('take', uid, f"Списано {amount}⭐. Причина: {reason}. Было: {current_balance}, стало: {new_balance}")
    bot.reply_to(msg, f"Списано {amount}⭐ у @{username}! Новый баланс: {new_balance}⭐")
    try:
        bot.send_message(uid, f"С вашего баланса списано {amount}⭐\nПричина: {reason}\nТекущий баланс: {new_balance}⭐")
    except Exception:
        pass

@bot.message_handler(commands=['userinfo'])
def user_info(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "Формат: /userinfo @username")
        return
    username = args[1].replace('@', '')
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"Пользователь @{username} не найден")
        return
    uid = user[0]
    balance = user[1]
    total_cases = user[2]
    status = user[5]
    refs = user[6]
    total_spent = user[11]
    total_deposit = user[14]
    luck_boost = user[12]
    banned = "ДА" if user[13] == 1 else "Нет"
    mines = qone("SELECT games, wins, losses, best_multiplier, total_won, total_lost FROM mines_stats WHERE user_id=%s", (uid,))
    crash = qone("SELECT games, wins, losses, best_multiplier, total_won, total_lost FROM crash_stats WHERE user_id=%s", (uid,))
    battle = qone("SELECT battles_played, battles_won, battles_lost, total_won_stars, total_lost_stars FROM battle_stats WHERE user_id=%s", (uid,))
    text = f"""ИНФОРМАЦИЯ: @{username}
ID: {uid}
Баланс: {balance}⭐
Всего кейсов: {total_cases}
Статус: {status}
Рефералов: {refs}
Потрачено: {total_spent}⭐
Пополнено: {total_deposit}⭐
Удача: x{luck_boost}
Бан: {banned}

МИНЁР: Игр: {mines[0] if mines else 0} | Побед: {mines[1] if mines else 0} | Поражений: {mines[2] if mines else 0}
КРАШ: Игр: {crash[0] if crash else 0} | Побед: {crash[1] if crash else 0} | Поражений: {crash[2] if crash else 0}
БИТВЫ: Игр: {battle[0] if battle else 0} | Побед: {battle[1] if battle else 0} | Поражений: {battle[2] if battle else 0}"""
    admin_log('userinfo', uid, f"Просмотр инфо @{username}")
    bot.reply_to(msg, text)

@bot.message_handler(commands=['top'])
def top_users(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    limit = 10
    if len(args) >= 2:
        try:
            limit = min(int(args[1]), 50)
        except ValueError:
            pass
    top_balance = q("SELECT username, balance, total_deposit, total_cases FROM users WHERE banned=0 ORDER BY balance DESC LIMIT %s", (limit,))
    top_deposit = q("SELECT username, total_deposit, balance FROM users WHERE banned=0 ORDER BY total_deposit DESC LIMIT %s", (limit,))
    total_users = qone("SELECT COUNT(*) FROM users")[0]
    total_balance = qone("SELECT COALESCE(SUM(balance), 0) FROM users")[0]
    total_deposited = qone("SELECT COALESCE(SUM(total_deposit), 0) FROM users")[0]
    text = f"СТАТИСТИКА:\nВсего пользователей: {total_users}\nОбщий баланс: {total_balance}⭐\nОбщие депозиты: {total_deposited}⭐\n\nТОП ПО БАЛАНСУ:\n"
    for i, (uname, bal, dep, cases) in enumerate(top_balance, 1):
        text += f"{i}. @{uname or 'N/A'} - {bal}⭐ (деп: {dep}⭐)\n"
    text += "\nТОП ПО ДЕПОЗИТАМ:\n"
    for i, (uname, dep, bal) in enumerate(top_deposit, 1):
        text += f"{i}. @{uname or 'N/A'} - {dep}⭐ (бал: {bal}⭐)\n"
    admin_log('top', None, f"Просмотр топ-{limit}")
    bot.reply_to(msg, text)

@bot.message_handler(commands=['adminlogs'])
def admin_logs_cmd(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    logs = q("SELECT action, target_id, details, created_at FROM admin_logs ORDER BY created_at DESC LIMIT 20")
    if not logs:
        bot.reply_to(msg, "Логов пока нет")
        return
    text = "ПОСЛЕДНИЕ ДЕЙСТВИЯ АДМИНА:\n\n"
    for action, target_id, details, created_at in logs:
        date_str = datetime.fromtimestamp(created_at).strftime('%d.%m %H:%M')
        text += f"{date_str} | {action}"
        if target_id:
            text += f" | ID:{target_id}"
        if details:
            text += f" | {details}"
        text += "\n"
    bot.reply_to(msg, text)

@bot.message_handler(commands=['create_promo'])
def create_promo(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /create_promo CODE [reward] [max_uses]")
        return
    code = args[1].upper()
    reward = 20
    max_uses = 1
    if len(args) >= 3:
        try:
            reward = int(args[2])
        except ValueError:
            pass
    if len(args) >= 4:
        try:
            max_uses = int(args[3])
        except ValueError:
            pass
    qw("INSERT INTO promo_codes (code, reward, created_by, created_at, max_uses) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (code) DO NOTHING",
       (code, reward, ADMIN_ID, int(time.time()), max_uses))
    admin_log('create_promo', None, f"Создан промокод {code} на {reward}⭐, макс. {max_uses} использований")
    bot.reply_to(msg, f"✅ Промокод {code} создан!\n🎁 Награда: {reward}⭐\n📊 Макс. использований: {max_uses}")

@bot.message_handler(commands=['promo_stats'])
def promo_stats(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /promo_stats CODE")
        return
    code = args[1].upper()
    promo = qone("SELECT reward, max_uses, used_count, created_at FROM promo_codes WHERE code=%s", (code,))
    if not promo:
        bot.reply_to(msg, "❌ Промокод не найден")
        return
    reward, max_uses, used_count, created_at = promo
    spend_data = q("SELECT user_id, spent FROM promo_spend WHERE promo_code=%s", (code,))
    total_spent = sum([s[1] for s in spend_data]) if spend_data else 0
    text = f"📊 СТАТИСТИКА ПРОМОКОДА {code}\n\n🎁 Награда: {reward}⭐\n📊 Макс. использований: {max_uses}\n✅ Использовано: {used_count}\n💰 Всего потрачено: {total_spent}⭐\n👥 Пользователей: {len(spend_data) if spend_data else 0}"
    bot.reply_to(msg, text)

@bot.message_handler(commands=['list_promo'])
def list_promo(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    promos = q("SELECT code, reward, max_uses, used_count FROM promo_codes ORDER BY created_at DESC")
    if not promos:
        bot.reply_to(msg, "❌ Нет созданных промокодов")
        return
    text = "📋 СПИСОК ПРОМОКОДОВ:\n\n"
    for code, reward, max_uses, used_count in promos:
        status = "✅" if max_uses == 0 or used_count < max_uses else "❌"
        text += f"{status} {code} — {reward}⭐ (исп. {used_count}/{max_uses if max_uses > 0 else '∞'})\n"
    bot.reply_to(msg, text)

@app.route('/health')
def health():
    return 'ok'

@app.route('/get_balance', methods=['POST'])
@limiter.limit("30 per minute")
def get_balance():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'balance': user[1], 'total_cases': user[2], 'status': user[5], 'refs': user[6]})

@app.route('/check_balance', methods=['POST'])
@limiter.limit("30 per minute")
def check_balance():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!', 'can_open': False}), 403
    data = request.get_json(silent=True) or {}
    case_type = data.get('case_type')
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    price = CASE_PRICES.get(case_type, 0)
    if user[1] < price:
        return jsonify({'error': 'Недостаточно звёзд!', 'can_open': False}), 400
    if case_type == "free":
        last_free = user[16] if len(user) > 16 else 0
        if time.time() - last_free < FREE_CASE_COOLDOWN:
            wait = int((FREE_CASE_COOLDOWN - (time.time() - last_free)) // 60)
            return jsonify({'error': f'Жди {wait} мин', 'can_open': False}), 400
    return jsonify({'can_open': True})

@app.route('/check_balance_simple', methods=['POST'])
@limiter.limit("30 per minute")
def check_balance_simple():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    amount = data.get('amount', 0)
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'has_enough': user[1] >= amount})

@app.route('/open_case', methods=['POST'])
@limiter.limit("20 per minute")
def open_case():
    try:
        uid = get_authenticated_user_id()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        if is_banned(uid):
            return jsonify({'error': 'Ты забанен!'}), 403
        data = request.get_json(silent=True) or {}
        case_type = data.get('case_type')
        if case_type not in CASE_RANGES:
            return jsonify({'error': 'Invalid case type'}), 400
        
        with write_lock:
            if case_type == "free":
                prize = get_prize(case_type, uid)
                result = qwone("""
                    UPDATE users SET balance = balance + %s, total_cases = total_cases + 1, last_free_case = %s
                    WHERE id = %s AND (last_free_case = 0 OR %s - last_free_case >= %s)
                    RETURNING balance, total_cases
                """, (prize, int(time.time()), uid, int(time.time()), FREE_CASE_COOLDOWN))
                if not result:
                    user = get_user(uid)
                    last_free = user[16] if len(user) > 16 else 0
                    wait = int((FREE_CASE_COOLDOWN - (time.time() - last_free)) // 60)
                    return jsonify({'error': f'Жди {wait} мин'}), 400
                register_case_opening(uid, case_type, 1)
                update_status(uid, result[1])
                return jsonify({'prize': prize, 'new_balance': result[0]})
            else:
                price = CASE_PRICES.get(case_type, 0)
                prize = get_prize(case_type, uid)
                result = qwone("""
                    UPDATE users SET balance = balance - %s + %s, total_cases = total_cases + 1, total_spent = total_spent + %s
                    WHERE id = %s AND balance >= %s
                    RETURNING balance, total_cases
                """, (price, prize, price, uid, price))
                if not result:
                    return jsonify({'error': 'Недостаточно звёзд!'}), 400
                register_case_opening(uid, case_type, 1)
                update_status(uid, result[1])
                return jsonify({'prize': prize, 'new_balance': result[0]})
    except Exception as e:
        return jsonify({'error': 'Internal error'}), 500

@app.route('/open_10_cases', methods=['POST'])
@limiter.limit("10 per minute")
def open_10_cases():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    case_type = data.get('case_type')
    if case_type == "free":
        return jsonify({'error': 'Нельзя открыть 10 бесплатных кейсов'}), 400
    if case_type not in CASE_RANGES:
        return jsonify({'error': 'Invalid case type'}), 400
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        price = CASE_PRICES.get(case_type, 0)
        total_price = price * 10
        if user[1] < total_price:
            return jsonify({'error': f'Недостаточно звёзд! Нужно {total_price}⭐'}), 400
        total_prize = 0
        prizes = []
        for i in range(10):
            prize = get_prize(case_type, uid)
            prizes.append(prize)
            total_prize += prize
        register_case_opening(uid, case_type, 10)
        result = qwone("""
            UPDATE users SET balance = balance - %s + %s, total_cases = total_cases + 10, total_spent = total_spent + %s
            WHERE id = %s            RETURNING balance, total_cases
        """, (total_price, total_prize, total_price, uid))
        update_status(uid, result[1] if result else user[2] + 10)
        return jsonify({'prizes': prizes, 'total_prize': total_prize, 'new_balance': result[0] if result else user[1] - total_price + total_prize})

@app.route('/get_levels_data', methods=['POST'])
def get_levels_data():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    level_wins = get_level_wins(uid)
    unlocked_levels = get_unlocked_levels(uid)
    rows = q("SELECT case_type, opened FROM level_progress WHERE user_id=%s", (uid,))
    progress_all = {r[0]: r[1] for r in rows}
    level_progress = {lvl: progress_all.get(lvl, 0) for lvl in unlocked_levels}
    return jsonify({'unlocked_levels': unlocked_levels, 'level_wins': level_wins, 'level_progress': level_progress})

@app.route('/start_bot_battle', methods=['POST'])
def start_bot_battle():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    case_type = data.get('case_type')
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        if case_type not in LEVEL_ORDER:
            return jsonify({'error': 'Неизвестный уровень!'}), 400
        if case_type not in get_unlocked_levels(uid):
            return jsonify({'error': 'Уровень закрыт!'}), 400
        progress = get_level_progress(uid, case_type)
        if progress < BATTLE_PROGRESS_COST:
            return jsonify({'error': f'Нужно открыть {BATTLE_PROGRESS_COST} кейсов {case_type}! (открыто {progress})'}), 400
        qw("UPDATE level_progress SET opened = opened - %s WHERE user_id=%s AND case_type=%s", (BATTLE_PROGRESS_COST, uid, case_type))
        player_prize = get_prize(case_type, uid)
        bot_prize = get_prize(case_type, None)
        total = player_prize + bot_prize
        result = 'lose'
        result_text = ''
        if player_prize > bot_prize:
            user = get_user(uid)
            update_user(uid, balance=user[1] + total)
            update_battle_stats(uid, won=True, stars=total, case_type=case_type)
            result = 'win'
            result_text = '🎉 Ты выиграл!'
        elif bot_prize > player_prize:
            update_battle_stats(uid, won=False, stars=player_prize, case_type=case_type)
            result = 'lose'
            result_text = '😢 Ты проиграл!'
        else:
            user = get_user(uid)
            update_user(uid, balance=user[1] + player_prize)
            update_battle_stats(uid, won=False, stars=0, case_type=case_type)
            result = 'draw'
            result_text = '🤝 Ничья!'
        row = qone("SELECT wins FROM level_wins WHERE user_id=%s AND case_type=%s", (uid, case_type))
        wins_after = row[0] if row else 0
        level_unlocked = wins_after >= WINS_TO_UNLOCK
        return jsonify({'result': result, 'result_text': result_text, 'player_prize': player_prize, 'bot_prize': bot_prize, 'wins': wins_after, 'level_unlocked': level_unlocked, 'needed_wins': WINS_TO_UNLOCK})

@app.route('/get_quests_data', methods=['POST'])
def get_quests_data():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    total_cases = user[2]
    refs = user[6]
    level_wins = get_level_wins(uid)
    completed = q("SELECT quest_id FROM completed_quests WHERE user_id=%s", (uid,))
    claimed_quests = [row[0] for row in completed]
    return jsonify({'total_cases': total_cases, 'refs': refs, 'level_wins': level_wins,
                    'claimed_statuses': [q for q in claimed_quests if q.startswith('status_')],
                    'claimed_levels': [q for q in claimed_quests if q.startswith('level_')],
                    'claimed_friends': [q for q in claimed_quests if q.startswith('friends_')]})

@app.route('/claim_quest', methods=['POST'])
def claim_quest():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    quest_id = data.get('quest_id')
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        if qone("SELECT * FROM completed_quests WHERE user_id=%s AND quest_id=%s", (uid, quest_id)):
            return jsonify({'error': 'Задание уже выполнено'}), 400
        reward = get_quest_reward(uid, quest_id)
        if reward is None:
            return jsonify({'error': 'Условие не выполнено'}), 400
        update_user(uid, balance=user[1] + reward)
        qw("INSERT INTO completed_quests (user_id, quest_id, completed_at) VALUES (%s, %s, %s)", (uid, quest_id, int(time.time())))
        return jsonify({'success': True, 'reward': reward})

def get_quest_reward(uid, quest_id):
    user = get_user(uid)
    if not user:
        return None
    if quest_id.startswith('status_'):
        status_targets = {'status_hunter': 10, 'status_lucky': 100, 'status_stalker': 444, 'status_master': 1000, 'status_legend': 2500}
        rewards = {'status_hunter': 10, 'status_lucky': 30, 'status_stalker': 50, 'status_master': 100, 'status_legend': 200}
        if user[2] >= status_targets.get(quest_id, 0):
            return rewards.get(quest_id, 0)
    elif quest_id.startswith('level_'):
        level_map = {'level_mud': 'mud', 'level_wood': 'wood', 'level_stone': 'stone', 'level_bronze': 'bronze', 'level_silver': 'silver', 'level_gold': 'gold', 'level_diamond': 'diamond', 'level_netherite': 'netherite', 'level_obsidian': 'obsidian', 'level_bedrock': 'bedrock'}
        level_rewards = {'level_mud': 15, 'level_wood': 27, 'level_stone': 57, 'level_bronze': 147, 'level_silver': 297, 'level_gold': 747, 'level_diamond': 1497, 'level_netherite': 2997, 'level_obsidian': 7497, 'level_bedrock': 30000}
        case_type = level_map.get(quest_id)
        if case_type:
            row = qone("SELECT wins FROM level_wins WHERE user_id=%s AND case_type=%s", (uid, case_type))
            wins = row[0] if row else 0
            if wins >= WINS_TO_UNLOCK:
                return level_rewards.get(quest_id, 0)
    elif quest_id.startswith('friends_'):
        targets = {'friends_3': 3, 'friends_5': 5, 'friends_10': 10, 'friends_100': 100}
        rewards = {'friends_3': 15, 'friends_5': 20, 'friends_10': 30, 'friends_100': 300}
        if user[6] >= targets.get(quest_id, 0):
            return rewards.get(quest_id, 0)
    return None

@app.route('/apply_promo', methods=['POST'])
def apply_promo():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    promo_code = data.get('promo_code', '').upper()
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        promo = qone("SELECT reward, max_uses, used_count FROM promo_codes WHERE code=%s", (promo_code,))
        if not promo:
            return jsonify({'error': 'Неверный промокод!'}), 400
        reward, max_uses, used_count = promo
        if max_uses > 0 and used_count >= max_uses:
            return jsonify({'error': 'Промокод уже использован максимальное количество раз!'}), 400
        used = qone("SELECT * FROM used_promos WHERE user_id=%s AND promo_code=%s", (uid, promo_code))
        if used:
            return jsonify({'error': 'Ты уже использовал этот промокод!'}), 400
        update_user(uid, balance=user[1] + reward)
        qw("UPDATE promo_codes SET used_count = used_count + 1 WHERE code=%s", (promo_code,))
        qw("INSERT INTO used_promos (user_id, promo_code, used_at) VALUES (%s, %s, %s)", (uid, promo_code, int(time.time())))
        return jsonify({'success': True, 'reward': reward})

@app.route('/claim_promo_webapp', methods=['POST'])
def claim_promo_webapp():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    code = data.get('code', '').upper()
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        promo = qone("SELECT reward, max_uses, used_count FROM promo_codes WHERE code=%s", (code,))
        if not promo:
            return jsonify({'error': 'Неверный промокод!'}), 400
        reward, max_uses, used_count = promo
        if max_uses > 0 and used_count >= max_uses:
            return jsonify({'error': 'Промокод уже использован максимальное количество раз!'}), 400
        used = qone("SELECT * FROM used_promos WHERE user_id=%s AND promo_code=%s", (uid, code))
        if used:
            return jsonify({'error': 'Ты уже использовал этот промокод!'}), 400
        update_user(uid, balance=user[1] + reward)
        qw("UPDATE promo_codes SET used_count = used_count + 1 WHERE code=%s", (code,))
        qw("INSERT INTO used_promos (user_id, promo_code, used_at) VALUES (%s, %s, %s)", (uid, code, int(time.time())))
        qw("INSERT INTO promo_spend (user_id, promo_code, spent) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING", (uid, code, 0))
        return jsonify({'success': True, 'reward': reward, 'message': f'✅ +{reward}⭐ за промокод!'})

@app.route('/withdraw', methods=['POST'])
def withdraw():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    amount = data.get('amount', 0)
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        if amount < 1000:
            return jsonify({'error': 'Минимум 1000⭐ для вывода!'}), 400
        if user[1] < amount:
            return jsonify({'error': 'Недостаточно звёзд!'}), 400
        update_user(uid, balance=user[1] - amount)
        try:
            bot.send_message(ADMIN_ID, f"💸 ЗАЯВКА НА ВЫВОД\nПользователь: @{user[8]}\nСумма: {amount}⭐\nID: {uid}")
        except Exception:
            pass
        admin_log('withdraw', uid, f"Заявка на вывод {amount}⭐")
        return jsonify({'success': True, 'message': f'✅ Заявка на вывод {amount}⭐ отправлена!'})

@app.route('/get_deposit_rewards', methods=['POST'])
def get_deposit_rewards():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    tiers = [
        {'amount': 100, 'reward': 10},
        {'amount': 250, 'reward': 25},
        {'amount': 500, 'reward': 50},
        {'amount': 1000, 'reward': 100},
        {'amount': 2500, 'reward': 250},
        {'amount': 10000, 'reward': 1000}
    ]
    claimed = [int(x) for x in user[15].split(',') if x] if user[15] else []
    return jsonify({
        'tiers': tiers,
        'claimed': claimed,
        'total_spent': user[14]
    })

@app.route('/claim_deposit_reward', methods=['POST'])
def claim_deposit_reward():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    amount = data.get('amount', 0)
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        tiers = {100: 10, 250: 25, 500: 50, 1000: 100, 2500: 250, 10000: 1000}
        if amount not in tiers:
            return jsonify({'error': 'Неверная награда'}), 400
        claimed = [int(x) for x in user[15].split(',') if x] if user[15] else []
        if amount in claimed:
            return jsonify({'error': 'Награда уже получена'}), 400
        if user[14] < amount:
            return jsonify({'error': 'Недостаточно пополнений'}), 400
        reward = tiers[amount]
        new_claimed = user[15] + f",{amount}" if user[15] else str(amount)
        update_user(uid, balance=user[1] + reward, claimed_deposit=new_claimed)
        return jsonify({'success': True, 'reward': reward})

# ===== MINES =====
@app.route('/start_mines_game', methods=['POST'])
def start_mines_game():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    bet = data.get('bet')
    mines = data.get('mines')
    if not isinstance(bet, int) or not isinstance(mines, int):
        return jsonify({'error': 'Некорректные параметры'}), 400
    if bet < 3 or bet > 1000:
        return jsonify({'error': 'Ставка от 3 до 1000⭐'}), 400
    if mines < 4 or mines > 9:
        return jsonify({'error': 'Мин от 4 до 9'}), 400
    with write_lock:
        user = get_user(uid)
        if not user or user[1] < bet:
            return jsonify({'error': 'Недостаточно звёзд'}), 400
        with mines_lock:
            for gid, game in active_mines_games.items():
                if game['user_id'] == uid and game['status'] == 'active':
                    return jsonify({'error': 'У тебя уже есть активная игра!'}), 400
            qwone("UPDATE users SET balance = balance - %s WHERE id = %s AND balance >= %s", (bet, uid, bet))
            total_spent = user[11] + bet
            update_user(uid, total_spent=total_spent)
            board = [0] * 25
            positions = random.sample(range(25), mines)
            for pos in positions:
                board[pos] = 1
            game_id = str(uuid.uuid4())
            max_mult = get_mines_multiplier(3, mines)
            active_mines_games[game_id] = {'user_id': uid, 'bet': bet, 'mines': mines, 'board': board, 'opened': [0] * 25, 'opened_count': 0, 'multiplier': 1.0, 'max_multiplier': max_mult, 'status': 'active'}
        user_after = get_user(uid)
        return jsonify({'game_id': game_id, 'balance': user_after[1] if user_after else user[1] - bet})

@app.route('/open_mines_cell', methods=['POST'])
def open_mines_cell():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    game_id = data.get('game_id')
    index = data.get('cell', data.get('index'))
    if not isinstance(index, int) or index < 0 or index > 24:
        return jsonify({'error': 'Некорректная клетка'}), 400
    with write_lock:
        with mines_lock:
            game = active_mines_games.get(game_id)
            if not game or game['status'] != 'active':
                return jsonify({'error': 'Игра не активна'}), 400
            if game['user_id'] != uid:
                return jsonify({'error': 'Не твоя игра'}), 403
            if game['opened'][index] == 1:
                return jsonify({'error': 'Клетка уже открыта'}), 400
            game['opened'][index] = 1
            game['opened_count'] += 1
            if game['board'][index] == 1:
                game['status'] = 'lost'
                update_user(uid, last_open=int(time.time()))
                update_mines_stats(uid, won=False, multiplier=0, stars=game['bet'])
                user = get_user(uid)
                mines_positions = [i for i, v in enumerate(game['board']) if v == 1]
                del active_mines_games[game_id]
                return jsonify({'status': 'mine', 'cell': index, 'opened_count': game['opened_count'], 'multiplier': 0, 'game_over': True, 'won': False, 'bet': game['bet'], 'balance': user[1], 'mines_positions': mines_positions})
            opened = game['opened_count']
            game['multiplier'] = get_mines_multiplier(opened, game['mines'])
            safe_cells = 25 - game['mines']
            if game['opened_count'] == safe_cells:
                raw_winnings = int(game['bet'] * game['multiplier'])
                capped = int(game['bet'] * game['max_multiplier'])
                final_winnings = min(raw_winnings, capped, 5000)
                user = get_user(uid)
                new_bal = user[1] + final_winnings
                update_user(uid, balance=new_bal, last_open=int(time.time()))
                game['status'] = 'won'
                update_mines_stats(uid, won=True, multiplier=game['multiplier'], stars=final_winnings)
                mines_positions = [i for i, v in enumerate(game['board']) if v == 1]
                del active_mines_games[game_id]
                return jsonify({'status': 'safe', 'cell': index, 'opened_count': game['opened_count'], 'multiplier': game['multiplier'], 'game_over': True, 'won': True, 'winnings': final_winnings, 'bet': game['bet'], 'balance': new_bal, 'mines_positions': mines_positions})
            user = get_user(uid)
            return jsonify({'status': 'safe', 'cell': index, 'opened_count': game['opened_count'], 'multiplier': game['multiplier'], 'game_over': False, 'won': False, 'balance': user[1]})

@app.route('/cashout_mines', methods=['POST'])
def cashout_mines():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    game_id = data.get('game_id')
    with write_lock:
        with mines_lock:
            game = active_mines_games.get(game_id)
            if not game or game['status'] != 'active':
                return jsonify({'error': 'Игра не активна'}), 400
            if game['user_id'] != uid:
                return jsonify({'error': 'Не твоя игра'}), 403
            if game['opened_count'] < 3:
                return jsonify({'error': 'Нужно открыть минимум 3 клетки!'}), 400
            raw_winnings = int(game['bet'] * game['multiplier'])
            capped = int(game['bet'] * game['max_multiplier'])
            final_winnings = min(raw_winnings, capped, 5000)
            user = get_user(uid)
            new_bal = user[1] + final_winnings
            update_user(uid, balance=new_bal, last_open=int(time.time()))
            game['status'] = 'won'
            multiplier = game['multiplier']
            update_mines_stats(uid, won=True, multiplier=multiplier, stars=final_winnings)
            mines_positions = [i for i, v in enumerate(game['board']) if v == 1]
            del active_mines_games[game_id]
            return jsonify({'win': final_winnings, 'balance': new_bal, 'multiplier': multiplier, 'game_over': True, 'won': True, 'mines_positions': mines_positions})

@app.route('/exit_mines', methods=['POST'])
def exit_mines():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json(silent=True) or {}
    game_id = data.get('game_id')
    with mines_lock:
        game = active_mines_games.get(game_id)
        if game and game['user_id'] != uid:
            return jsonify({'error': 'Не твоя игра'}), 403
        game = active_mines_games.pop(game_id, None)
    if game and game['status'] == 'active':
        return jsonify({'success': True, 'mines_positions': [i for i, v in enumerate(game['board']) if v == 1]})
    return jsonify({'success': True})

@app.route('/get_mines_stats', methods=['POST'])
def get_mines_stats():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    stats = qone("SELECT * FROM mines_stats WHERE user_id=%s", (uid,))
    if not stats:
        return jsonify({'games': 0, 'wins': 0, 'losses': 0, 'best_multiplier': 1.0, 'total_won': 0, 'total_lost': 0})
    return jsonify({'games': stats[1], 'wins': stats[2], 'losses': stats[3], 'best_multiplier': stats[4], 'total_won': stats[5], 'total_lost': stats[6]})

# ===== CRASH =====
@app.route('/make_crash_bet', methods=['POST'])
def make_crash_bet():
    global crash_data
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    bet = data.get('bet')
    if not isinstance(bet, int):
        return jsonify({'error': 'Некорректная ставка'}), 400
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404
    if bet < 1 or bet > 1000:
        return jsonify({'error': 'Ставка от 1 до 1000⭐'}), 400
    if user[1] < bet:
        return jsonify({'error': 'Недостаточно звёзд'}), 400
    with crash_lock:
        if crash_data['phase'] != 'waiting':
            return jsonify({'error': 'Сейчас нельзя сделать ставку!'}), 400
        if uid in crash_data['bets']:
            return jsonify({'error': 'Ты уже сделал ставку'}), 400
        crash_data['bets'][uid] = bet
        update_user(uid, balance=user[1] - bet)
        total_spent = user[11] + bet
        update_user(uid, total_spent=total_spent)
    return jsonify({'success': True})

@app.route('/crash_status', methods=['POST'])
def crash_status():
    global crash_data
    uid = get_authenticated_user_id()
    if uid and is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    with crash_lock:
        now = time.time()
        waiting_time = 0
        if crash_data['phase'] == 'waiting':
            waiting_time = max(0, crash_data['waiting_time'] - now)
        return jsonify({'phase': crash_data['phase'], 'multiplier': crash_data['multiplier'], 'waiting_time': round(waiting_time, 1), 'crash_multiplier_at_crash': crash_data.get('crash_multiplier_at_crash', 1.00), 'game_count': crash_data['game_count'], 'my_bet': crash_data['bets'].get(uid, 0) if uid else 0})

@app.route('/cashout_crash', methods=['POST'])
def cashout_crash():
    global crash_data
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    with crash_lock:
        if crash_data['phase'] != 'active':
            return jsonify({'error': 'Игра не активна'}), 400
        if uid not in crash_data['bets']:
            return jsonify({'error': 'Ты не делал ставку'}), 400
        bet = crash_data['bets'][uid]
        multiplier = crash_data['multiplier']
        final_winnings = min(int(bet * multiplier), 5000)
        user = get_user(uid)
        new_bal = user[1] + final_winnings
        update_user(uid, balance=new_bal, last_open=int(time.time()))
        update_crash_stats(uid, won=True, multiplier=multiplier, stars=final_winnings)
        del crash_data['bets'][uid]
    return jsonify({'win': final_winnings, 'balance': new_bal, 'multiplier': multiplier})

@app.route('/get_crash_stats', methods=['POST'])
def get_crash_stats():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    stats = qone("SELECT * FROM crash_stats WHERE user_id=%s", (uid,))
    if not stats:
        return jsonify({'games': 0, 'wins': 0, 'losses': 0, 'best_multiplier': 1.0, 'total_won': 0, 'total_lost': 0})
    return jsonify({'games': stats[1], 'wins': stats[2], 'losses': stats[3], 'best_multiplier': stats[4], 'total_won': stats[5], 'total_lost': stats[6]})

# ===== UPGRADE =====
@app.route('/upgrade_calculate', methods=['POST'])
def upgrade_calculate():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    bet = data.get('bet')
    target = data.get('target')
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404
    if not isinstance(bet, int) or not isinstance(target, int):
        return jsonify({'error': 'Некорректные параметры'}), 400
    if bet < 1 or bet > 1000:
        return jsonify({'error': 'Ставка от 1 до 1000⭐'}), 400
    if target < bet + 1 or target > 2000:
        return jsonify({'error': f'Цель должна быть от {bet + 1} до 2000⭐'}), 400
    if user[1] < bet:
        return jsonify({'error': 'Недостаточно звёзд'}), 400
    raw_chance = (bet / target) * 100
    chance = min(max(raw_chance, 1.0), 70.0)
    return jsonify({'chance': round(chance, 2), 'bet': bet, 'target': target, 'balance': user[1]})

@app.route('/upgrade_execute', methods=['POST'])
def upgrade_execute():
    uid = get_authenticated_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    if is_banned(uid):
        return jsonify({'error': 'Ты забанен!'}), 403
    data = request.get_json(silent=True) or {}
    bet = data.get('bet')
    target = data.get('target')
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        if not isinstance(bet, int) or not isinstance(target, int):
            return jsonify({'error': 'Некорректные параметры'}), 400
        if bet < 1 or bet > 1000:
            return jsonify({'error': 'Ставка от 1 до 1000⭐'}), 400
        if target < bet + 1 or target > 2000:
            return jsonify({'error': f'Цель должна быть от {bet + 1} до 2000⭐'}), 400
        if user[1] < bet:
            return jsonify({'error': 'Недостаточно звёзд'}), 400
        raw_chance = (bet / target) * 100
        chance = min(max(raw_chance, 1.0), 70.0)
        rand = random.random() * 100
        success = rand <= chance
        if success:
            new_balance = user[1] + (target - bet)
            update_user(uid, balance=new_balance)
            result = 'win'
            message = f'✅ УСПЕХ! Ты получил {target}⭐ (+{target - bet}⭐)'
        else:
            new_balance = user[1] - bet
            update_user(uid, balance=new_balance)
            total_spent = user[11] + bet
            update_user(uid, total_spent=total_spent)
            result = 'lose'
            message = f'❌ ПРОВАЛ! Ты потерял {bet}⭐'
        return jsonify({'result': result, 'chance': round(chance, 2), 'bet': bet, 'target': target, 'new_balance': new_balance, 'message': message})

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

@app.route('/webhook', methods=['POST'])
def webhook():
    if request.headers.get('content-type') != 'application/json':
        return '', 400
    src_ip = ipaddress.ip_address(request.remote_addr)
    if not any(src_ip in net for net in TG_NETWORKS):
        return '', 403
    try:
        json_string = request.get_data().decode('utf-8')
        update = telebot.types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    except Exception:
        return '', 400

_start_lock = threading.Lock()
_threads_started = False

def _telegram_call_with_retry(func, *args, retries=3, pause=5, **kwargs):
    for attempt in range(1, retries + 1):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"Telegram API error ({func.__name__}, попытка {attempt}/{retries}): {e}")
            if attempt < retries:
                time.sleep(pause)
    return None

def run_polling():
    _telegram_call_with_retry(bot.remove_webhook)
    while True:
        try:
            bot.infinity_polling(skip_pending=True, timeout=30, long_polling_timeout=30)
        except Exception as e:
            print(f"Polling error: {e}")
            time.sleep(5)

def run_webhook_setup():
    if _telegram_call_with_retry(bot.remove_webhook) is None:
        print("⚠️ remove_webhook не удался после 3 попыток, пробую set_webhook всё равно")
    if _telegram_call_with_retry(bot.set_webhook, url=WEBAPP_URL + "/webhook") is not None:
        print(f"✅ Webhook mode: {WEBAPP_URL}/webhook")
    else:
        print("❌ set_webhook не удался после 3 попыток (Flask продолжает работать)")

def start_background_threads():
    global _threads_started
    with _start_lock:
        if _threads_started:
            return
        _threads_started = True
    threading.Thread(target=crash_timer, daemon=True).start()
    if os.environ.get("SET_WEBHOOK") == "1":
        threading.Thread(target=run_webhook_setup, daemon=True).start()
    else:
        threading.Thread(target=run_polling, daemon=True).start()
        print("✅ Polling mode (запуск в фоновом потоке)")

if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RAILWAY_SERVICE_NAME"):
    start_background_threads()
elif __name__ == "__main__":
    start_background_threads()
    port = int(os.environ.get("PORT", 8080))
    print(f"✅ БОТ ЗАПУЩЕН на порту {port}")
    app.run(host="0.0.0.0", port=port)
