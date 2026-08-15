import telebot
import random
import sqlite3
import time
import os
import threading
from flask import Flask, request, jsonify, send_from_directory
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, LabeledPrice

TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TOKEN:
    raise ValueError("TELEGRAM_TOKEN не установлен!")

WEBAPP_URL = os.environ.get("WEBAPP_URL")
if not WEBAPP_URL:
    raise ValueError("WEBAPP_URL не установлен!")
WEBAPP_URL = WEBAPP_URL.rstrip('/')

ADMIN_ID = 7819642052
DB_PATH = os.environ.get("DB_PATH", "cases.db")

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

# ===== БД: SQLite WAL + thread-local соединения + Lock на записи =====
_db_local = threading.local()
write_lock = threading.RLock()

def get_conn():
    conn = getattr(_db_local, 'conn', None)
    if conn is None:
        conn = sqlite3.connect(DB_PATH, timeout=30, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        _db_local.conn = conn
    return conn

def q(sql, params=()):
    """SELECT-запрос (чтение)."""
    return get_conn().execute(sql, params)

def qw(sql, params=()):
    """Запрос на запись с коммитом (под write_lock)."""
    with write_lock:
        cur = get_conn().execute(sql, params)
        get_conn().commit()
    return cur

def init_db():
    conn = get_conn()
    with write_lock:
        conn.execute('''CREATE TABLE IF NOT EXISTS users (
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
            luck_boost REAL DEFAULT 1.0
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS invited (
            inviter_id INTEGER,
            invited_id INTEGER,
            PRIMARY KEY (inviter_id, invited_id)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS battle_stats (
            user_id INTEGER PRIMARY KEY,
            battles_played INTEGER DEFAULT 0,
            battles_won INTEGER DEFAULT 0,
            battles_lost INTEGER DEFAULT 0,
            total_won_stars INTEGER DEFAULT 0,
            total_lost_stars INTEGER DEFAULT 0,
            commission_paid INTEGER DEFAULT 0
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS mines_stats (
            user_id INTEGER PRIMARY KEY,
            games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            best_multiplier REAL DEFAULT 1.0,
            total_won INTEGER DEFAULT 0,
            total_lost INTEGER DEFAULT 0
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS crash_stats (
            user_id INTEGER PRIMARY KEY,
            games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            best_multiplier REAL DEFAULT 1.0,
            total_won INTEGER DEFAULT 0,
            total_lost INTEGER DEFAULT 0
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS promo_codes (
            code TEXT PRIMARY KEY,
            reward INTEGER DEFAULT 20,
            created_by INTEGER,
            created_at INTEGER,
            max_uses INTEGER DEFAULT 1,
            used_count INTEGER DEFAULT 0
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS promo_spend (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            promo_code TEXT,
            spent INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS level_wins (
            user_id INTEGER,
            case_type TEXT,
            wins INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, case_type)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS completed_quests (
            user_id INTEGER,
            quest_id TEXT,
            completed_at INTEGER,
            PRIMARY KEY (user_id, quest_id)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS case_stats (
            user_id INTEGER,
            case_type TEXT,
            opened INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, case_type)
        )''')
        conn.execute('''CREATE TABLE IF NOT EXISTS level_progress (
            user_id INTEGER,
            case_type TEXT,
            opened INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, case_type)
        )''')
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_promo_spend_user ON promo_spend(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_level_wins_user ON level_wins(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_completed_quests_user ON completed_quests(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_case_stats_user ON case_stats(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_level_progress_user ON level_progress(user_id)")
        conn.commit()

init_db()

# ===== КЕЙСЫ =====
ads = ["💎 Крипто-обменник: https://t.me/exchange", "🎁 Халява каждый день: https://t.me/free_stuff", "🔥 Скины со скидкой: https://t.me/skins"]

CASE_PRICES = {"free": 0, "mud": 5, "wood": 9, "stone": 19, "bronze": 49, "silver": 99, "gold": 249, "diamond": 499, "netherite": 999, "obsidian": 2499, "bedrock": 10000}

LEVEL_ORDER = ['mud', 'wood', 'stone', 'bronze', 'silver', 'gold', 'diamond', 'netherite', 'obsidian', 'bedrock']

FREE_CASE_COOLDOWN = 7200  # 2 часа
DAILY_REWARD = 10
DAILY_COOLDOWN = 86400  # 24 часа
BATTLE_PROGRESS_COST = 10
WINS_TO_UNLOCK = 3

CASE_RANGES = {
    "free": {"common": [1, 2], "rare": [3, 4], "epic": [5, 6, 7, 8, 9, 10], "legendary": [100], "jackpot": [1000], "common_chance": 0.599, "rare_chance": 0.299, "epic_chance": 0.0999, "legendary_chance": 0.0001, "jackpot_chance": 0.00000001},

    "mud": {"common": [1, 2, 3, 4, 5, 6, 7], "rare": [10, 12, 13], "epic": [16, 18, 20, 22, 24, 27], "legendary": [50], "jackpot": [500], "common_chance": 0.70, "rare_chance": 0.25, "epic_chance": 0.0499, "legendary_chance": 0.001, "jackpot_chance": 0.000001},

    "wood": {"common": [2, 4, 5, 6, 7, 8, 9, 10], "rare": [12, 13, 15], "epic": [20, 50], "legendary": [100, 500], "jackpot": [1000], "common_chance": 0.75, "rare_chance": 0.19, "epic_chance": 0.05, "legendary_chance": 0.00001, "jackpot_chance": 0.000001},

    "stone": {"common": [11, 13, 15, 16, 17, 18, 19], "rare": [21, 23, 24, 25], "epic": [30, 50, 100, 250], "legendary": [500, 1000], "jackpot": [2500], "common_chance": 0.80, "rare_chance": 0.15, "epic_chance": 0.05, "legendary_chance": 0.00001, "jackpot_chance": 0.000001},

    "bronze": {"common": [20, 25, 30], "rare": [35, 40, 45, 50], "epic": [55, 60, 65, 75, 100], "legendary": [222, 333, 444, 555, 1000, 1500, 2000], "jackpot": [5000], "common_chance": 0.89, "rare_chance": 0.10, "epic_chance": 0.009999, "legendary_chance": 0.000001, "jackpot_chance": 0.0000001},

    "silver": {"common": [40, 50, 60, 70], "rare": [70, 80, 90, 100], "epic": [100, 110, 120, 130, 140, 150], "legendary": [200, 250, 333, 444, 555, 666, 777, 888, 999, 1488, 2011, 5000], "jackpot": [10000], "common_chance": 0.25, "rare_chance": 0.6745, "epic_chance": 0.0749, "legendary_chance": 0.0005, "jackpot_chance": 0.00000001},

    "gold": {"common": [75, 100], "rare": [150, 169, 190, 220, 251], "epic": [300, 400, 500, 777], "legendary": [999, 1000, 2000, 5000, 10000, 12500], "jackpot": [25000], "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001},

    "diamond": {"common": [250, 300, 333], "rare": [350, 444, 505], "epic": [1000, 1488, 2222], "legendary": [2500, 5000, 10000, 12500, 25000], "jackpot": [50000], "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001},

    "netherite": {"common": [500, 550, 600], "rare": [650, 700, 750, 800, 850], "epic": [900, 950, 1000, 1500], "legendary": [2000, 2500, 3000, 3200, 3500, 4000, 5000, 10000, 15000, 20000], "jackpot": [25000], "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001},

    "obsidian": {"common": [500, 1000, 1500], "rare": [2000, 2500, 3000], "epic": [4000, 5000, 7500], "legendary": [10000, 15000], "jackpot": [25000], "common_chance": 0.35, "rare_chance": 0.35, "epic_chance": 0.2, "legendary_chance": 0.09, "jackpot_chance": 0.01},

    "bedrock": {"common": [5000], "rare": [10000, 25000], "epic": [50000, 100000], "legendary": [250000], "jackpot": [1000000], "common_chance": 0.999, "rare_chance": 0.0009, "epic_chance": 0.00009, "legendary_chance": 0.000009, "jackpot_chance": 0.000001}
}

def get_prize(case_type, user_id=None):
    data = CASE_RANGES[case_type]
    rnd = random.random()

    if user_id:
        row = q("SELECT luck_boost FROM users WHERE id=?", (user_id,)).fetchone()
        if row and row[0] > 1.0:
            rnd = rnd / row[0]
            if rnd > 1.0:
                rnd = 0.9999

    if rnd < data["jackpot_chance"]:
        return random.choice(data["jackpot"])
    elif rnd < data["jackpot_chance"] + data["legendary_chance"]:
        return random.choice(data["legendary"])
    elif rnd < data["common_chance"]:
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
    elif rnd < data["common_chance"] + data["rare_chance"]:
        return random.choice(data["rare"])
    else:
        return random.choice(data["epic"])

# ===== ПОЛЬЗОВАТЕЛИ =====
def get_user(uid):
    return q("SELECT * FROM users WHERE id=?", (uid,)).fetchone()

def get_user_by_username(username):
    return q("SELECT * FROM users WHERE username=?", (username,)).fetchone()

def update_user(uid, **kwargs):
    if not kwargs:
        return
    sets = ', '.join(f"{k}=?" for k in kwargs)
    vals = list(kwargs.values()) + [uid]
    qw(f"UPDATE users SET {sets} WHERE id=?", vals)

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

# ===== УРОВНИ =====
def get_level_wins(uid):
    rows = q("SELECT case_type, wins FROM level_wins WHERE user_id=?", (uid,)).fetchall()
    return {r[0]: r[1] for r in rows}

def get_unlocked_levels(uid):
    """mud открыт всегда; уровень i открыт, если wins[i-1] >= 3. Цепочка прерывается на первом закрытом."""
    wins = get_level_wins(uid)
    unlocked = ['mud']
    for i in range(1, len(LEVEL_ORDER)):
        if wins.get(LEVEL_ORDER[i - 1], 0) >= WINS_TO_UNLOCK:
            unlocked.append(LEVEL_ORDER[i])
        else:
            break
    return unlocked

def add_case_stats(uid, case_type, n=1):
    qw("INSERT INTO case_stats (user_id, case_type, opened) VALUES (?, ?, ?) "
       "ON CONFLICT(user_id, case_type) DO UPDATE SET opened = opened + ?",
       (uid, case_type, n, n))

def add_level_progress(uid, case_type, n=1):
    qw("INSERT INTO level_progress (user_id, case_type, opened) VALUES (?, ?, ?) "
       "ON CONFLICT(user_id, case_type) DO UPDATE SET opened = opened + ?",
       (uid, case_type, n, n))

def get_level_progress(uid, case_type):
    row = q("SELECT opened FROM level_progress WHERE user_id=? AND case_type=?", (uid, case_type)).fetchone()
    return row[0] if row else 0

def register_case_opening(uid, case_type, n=1):
    """case_stats += n ВСЕГДА; level_progress += n ТОЛЬКО если уровень открыт у пользователя."""
    add_case_stats(uid, case_type, n)
    if case_type in LEVEL_ORDER and case_type in get_unlocked_levels(uid):
        add_level_progress(uid, case_type, n)

# ===== СТАТИСТИКА ИГР =====
def _update_game_stats(table, user_id, won, multiplier, stars):
    """stars — выигранные (при победе) или проигранные (при поражении) звёзды."""
    assert table in ('mines_stats', 'crash_stats')
    qw(f"""INSERT INTO {table}
            (user_id, games, wins, losses, best_multiplier, total_won, total_lost)
            VALUES (?, 1, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                games = games + 1,
                wins = wins + ?,
                losses = losses + ?,
                best_multiplier = MAX(best_multiplier, ?),
                total_won = total_won + ?,
                total_lost = total_lost + ?""",
       (user_id,
        1 if won else 0, 0 if won else 1, multiplier,
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
            VALUES (?, 1, ?, ?, ?, ?, 0)
            ON CONFLICT(user_id) DO UPDATE SET
                battles_played = battles_played + 1,
                battles_won = battles_won + ?,
                battles_lost = battles_lost + ?,
                total_won_stars = total_won_stars + ?,
                total_lost_stars = total_lost_stars + ?""",
       (user_id,
        1 if won else 0, 0 if won else 1,
        stars if won else 0, 0 if won else stars,
        1 if won else 0, 0 if won else 1,
        stars if won else 0, 0 if won else stars))

    if won and case_type:
        qw("INSERT INTO level_wins (user_id, case_type, wins) VALUES (?, ?, 1) "
           "ON CONFLICT(user_id, case_type) DO UPDATE SET wins = wins + 1",
           (user_id, case_type))

# ===== ГЛОБАЛЬНЫЕ ДАННЫЕ =====
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
        3: {1: 1.05, 2: 1.15, 3: 1.30, 4: 1.50, 5: 1.75, 6: 2.10, 7: 2.50, 8: 3.00, 9: 3.50, 10: 4.20, 11: 5.00, 12: 6.00},
        4: {1: 1.10, 2: 1.20, 3: 1.40, 4: 1.70, 5: 2.00, 6: 2.40, 7: 3.00, 8: 3.80, 9: 4.50, 10: 5.50, 11: 6.50, 12: 8.00},
        5: {1: 1.15, 2: 1.30, 3: 1.55, 4: 1.90, 5: 2.30, 6: 2.80, 7: 3.50, 8: 4.50, 9: 5.50, 10: 6.50, 11: 8.00, 12: 10.00},
        6: {1: 1.20, 2: 1.40, 3: 1.70, 4: 2.10, 5: 2.60, 6: 3.20, 7: 4.00, 8: 5.00, 9: 6.50, 10: 8.00, 11: 10.00, 12: 12.00},
        7: {1: 1.25, 2: 1.50, 3: 1.85, 4: 2.30, 5: 2.90, 6: 3.60, 7: 4.50, 8: 5.50, 9: 7.50, 10: 9.00, 11: 12.00, 12: 15.00},
        8: {1: 1.30, 2: 1.60, 3: 2.00, 4: 2.50, 5: 3.20, 6: 4.00, 7: 5.00, 8: 6.50, 9: 8.50, 10: 10.00, 11: 14.00, 12: 18.00}
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

# ===== КОМАНДЫ TELEGRAM =====
@bot.message_handler(commands=['start'])
def start(msg):
    uid = msg.from_user.id
    username = msg.from_user.username or ""
    args = msg.text.split()
    qw("INSERT OR IGNORE INTO users (id) VALUES (?)", (uid,))
    bonus_text = ""
    if len(args) > 1:
        try:
            inviter_id = int(args[1])
            if inviter_id != uid:
                cur = qw("INSERT OR IGNORE INTO invited (inviter_id, invited_id) VALUES (?, ?)", (inviter_id, uid))
                inviter = get_user(inviter_id)
                if cur.rowcount > 0 and inviter:
                    update_user(inviter_id, balance=inviter[1] + 10, refs=inviter[6] + 1)
                    try:
                        bot.send_message(inviter_id, f"⭐ Ты получил 10 звёзд за приглашение @{username}!")
                    except Exception:
                        pass
                    user = get_user(uid)
                    update_user(uid, balance=user[1] + 5)
                    bonus_text = "\n🎉 +5⭐ за регистрацию по ссылке!"
        except Exception:
            pass
    update_user(uid, username=username)

    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("🎮 Играть", web_app=WebAppInfo(WEBAPP_URL)),
        InlineKeyboardButton("💎 Пополнить", callback_data="deposit_menu")
    )

    caption = f"🎰 <b>Добро пожаловать в RANDEVU!</b>{bonus_text}\n\nОткрывай кейсы, играй в мини-игры и выигрывай!"

    logo_path = "static/assets/logo.png"
    try:
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as photo:
                bot.send_photo(msg.chat.id, photo, caption=caption, reply_markup=kb, parse_mode="HTML")
        else:
            bot.send_message(msg.chat.id, caption, reply_markup=kb, parse_mode="HTML")
    except Exception:
        bot.send_message(msg.chat.id, caption, reply_markup=kb, parse_mode="HTML")

# ===== ПОПОЛНЕНИЕ ЧЕРЕЗ TELEGRAM STARS =====
deposit_state = {}

@bot.callback_query_handler(func=lambda call: call.data == "deposit_menu")
def deposit_menu(call):
    uid = call.from_user.id
    deposit_state[uid] = True
    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton("🔙 Назад", callback_data="back_to_start"))
    try:
        bot.edit_message_caption(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            caption="💎 <b>Пополнение баланса</b>\n\nВведи сумму от <b>1</b> до <b>5000</b> звёзд.\n1 звезда = 1 монета\n\n<i>Напиши число в чат...</i>",
            reply_markup=kb,
            parse_mode="HTML"
        )
    except Exception:
        bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text="💎 <b>Пополнение баланса</b>\n\nВведи сумму от <b>1</b> до <b>5000</b> звёзд.\n1 звезда = 1 монета\n\n<i>Напиши число в чат...</i>",
            reply_markup=kb,
            parse_mode="HTML"
        )

@bot.callback_query_handler(func=lambda call: call.data == "back_to_start")
def back_to_start(call):
    uid = call.from_user.id
    deposit_state.pop(uid, None)
    kb = InlineKeyboardMarkup(row_width=2)
    kb.add(
        InlineKeyboardButton("🎮 Играть", web_app=WebAppInfo(WEBAPP_URL)),
        InlineKeyboardButton("💎 Пополнить", callback_data="deposit_menu")
    )
    caption = "🎰 <b>Добро пожаловать в RANDEVU!</b>\n\nОткрывай кейсы, играй в мини-игры и выигрывай!"
    try:
        bot.edit_message_caption(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            caption=caption,
            reply_markup=kb,
            parse_mode="HTML"
        )
    except Exception:
        try:
            bot.edit_message_text(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                text=caption,
                reply_markup=kb,
                parse_mode="HTML"
            )
        except Exception:
            bot.send_message(call.message.chat.id, caption, reply_markup=kb, parse_mode="HTML")

@bot.message_handler(content_types=['text'], func=lambda msg: msg.from_user.id in deposit_state)
def process_deposit_amount(msg):
    uid = msg.from_user.id
    text = msg.text.strip()
    deposit_state.pop(uid, None)

    try:
        amount = int(text)
    except ValueError:
        bot.reply_to(msg, "❌ Введи число от 1 до 5000.")
        return

    if amount < 1 or amount > 5000:
        bot.reply_to(msg, "❌ Сумма должна быть от 1 до 5000 звёзд.")
        return

    prices = [LabeledPrice(label=f"{amount} монет", amount=amount)]
    bot.send_invoice(
        msg.chat.id,
        title="Пополнение баланса RANDEVU",
        description=f"Покупка {amount} монет за {amount} Telegram Stars",
        invoice_payload=f"deposit_{uid}_{amount}",
        provider_token="",
        currency="XTR",
        prices=prices,
        start_parameter="deposit"
    )

@bot.pre_checkout_query_handler(func=lambda query: True)
def checkout(pre_checkout_query):
    bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)

@bot.message_handler(content_types=['successful_payment'])
def got_payment(msg):
    uid = msg.from_user.id
    payload = msg.successful_payment.invoice_payload
    try:
        _, user_id, amount = payload.split("_")
        amount = int(amount)
        user = get_user(uid)
        if user:
            new_balance = user[1] + amount
            update_user(uid, balance=new_balance)
            bot.send_message(
                msg.chat.id,
                f"✅ <b>Баланс пополнен!</b>\n\n+{amount}⭐\n💰 Текущий баланс: {new_balance}⭐",
                parse_mode="HTML"
            )
    except Exception as e:
        print(f"Payment error: {e}")
        bot.send_message(msg.chat.id, "❌ Ошибка при зачислении. Обратись в поддержку.")

@bot.message_handler(commands=['promo'])
def promo_handler(msg):
    uid = msg.from_user.id
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Введи промокод: /promo RANDEVU20")
        return

    code = args[1].upper()

    promo = q("SELECT reward, max_uses, used_count FROM promo_codes WHERE code=?", (code,)).fetchone()
    if not promo:
        bot.reply_to(msg, "❌ Неверный промокод!")
        return

    reward, max_uses, used_count = promo

    if max_uses > 0 and used_count >= max_uses:
        bot.reply_to(msg, "❌ Промокод уже использован максимальное количество раз!")
        return

    user = get_user(uid)
    if not user:
        bot.reply_to(msg, "Напиши /start")
        return

    if user[9] == 1:
        bot.reply_to(msg, "❌ Ты уже использовал промокод!")
        return

    update_user(uid, balance=user[1] + reward, promo_used=1, promo_code=code)
    qw("UPDATE promo_codes SET used_count = used_count + 1 WHERE code=?", (code,))

    bot.reply_to(msg, f"✅ Промокод активирован! Ты получил {reward}⭐")

@bot.message_handler(commands=['balance'])
def balance_cmd(msg):
    user = get_user(msg.from_user.id)
    if not user:
        bot.reply_to(msg, "Напиши /start")
        return
    bot.reply_to(msg, f"💰 Баланс: {user[1]}⭐\n📦 Открыто кейсов: {user[2]}\n🏆 Статус: {user[5]}\n👥 Рефералов: {user[6]}")

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

    qw("INSERT OR IGNORE INTO promo_codes (code, reward, created_by, created_at, max_uses) VALUES (?, ?, ?, ?, ?)",
       (code, reward, ADMIN_ID, int(time.time()), max_uses))

    bot.reply_to(msg, f"✅ Промокод {code} создан!\n🎁 Награда: {reward}⭐\n📊 Макс. использований: {max_uses}")

@bot.message_handler(commands=['give'])
def give_to_user(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 3:
        bot.reply_to(msg, "❌ Формат: /give @username 500")
        return
    username = args[1].replace('@', '')
    try:
        amount = int(args[2])
    except ValueError:
        bot.reply_to(msg, "❌ Сумма должна быть числом")
        return
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], balance=user[1] + amount)
    bot.reply_to(msg, f"✅ @{username} получил {amount}⭐\n💰 Баланс: {user[1] + amount}⭐")
    try:
        bot.send_message(user[0], f"💰 Админ выдал тебе {amount}⭐!\nНовый баланс: {user[1] + amount}⭐")
    except Exception:
        pass

@bot.message_handler(commands=['set_status'])
def set_status(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 3:
        bot.reply_to(msg, "❌ Формат: /set_status @username Легенда")
        return
    username = args[1].replace('@', '')
    status = ' '.join(args[2:])
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], status=status)
    bot.reply_to(msg, f"✅ Статус @{username} изменён на {status}")

@bot.message_handler(commands=['boost'])
def boost_player(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 3:
        bot.reply_to(msg, "❌ Формат: /boost @username 2.0")
        return
    username = args[1].replace('@', '')
    try:
        boost = float(args[2])
    except ValueError:
        bot.reply_to(msg, "❌ Множитель должен быть числом (например, 2.0)")
        return
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], luck_boost=boost)
    bot.reply_to(msg, f"✅ Шансы @{username} увеличены в {boost}x!")

@bot.message_handler(commands=['promo_stats'])
def promo_stats(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /promo_stats CODE")
        return
    code = args[1].upper()
    promo = q("SELECT reward, max_uses, used_count, created_at FROM promo_codes WHERE code=?", (code,)).fetchone()
    if not promo:
        bot.reply_to(msg, "❌ Промокод не найден")
        return
    reward, max_uses, used_count, created_at = promo
    spend_data = q("SELECT user_id, spent FROM promo_spend WHERE promo_code=?", (code,)).fetchall()
    total_spent = sum([s[1] for s in spend_data]) if spend_data else 0
    text = f"📊 **СТАТИСТИКА ПРОМОКОДА {code}**\n\n"
    text += f"🎁 Награда: {reward}⭐\n"
    text += f"📊 Макс. использований: {max_uses}\n"
    text += f"✅ Использовано: {used_count}\n"
    text += f"💰 Всего потрачено: {total_spent}⭐\n"
    text += f"👥 Пользователей: {len(spend_data) if spend_data else 0}\n"
    bot.reply_to(msg, text)

@bot.message_handler(commands=['list_promo'])
def list_promo(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    promos = q("SELECT code, reward, max_uses, used_count FROM promo_codes ORDER BY created_at DESC").fetchall()
    if not promos:
        bot.reply_to(msg, "❌ Нет созданных промокодов")
        return
    text = "📋 **СПИСОК ПРОМОКОДОВ:**\n\n"
    for code, reward, max_uses, used_count in promos:
        status = "✅" if max_uses == 0 or used_count < max_uses else "❌"
        text += f"{status} `{code}` — {reward}⭐ (исп. {used_count}/{max_uses if max_uses > 0 else '∞'})\n"
    bot.reply_to(msg, text)

# ===== ЭНДПОИНТЫ =====
@app.route('/health')
def health():
    return 'ok'

@app.route('/get_balance', methods=['POST'])
def get_balance():
    data = request.get_json()
    user = get_user(data.get('user_id'))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'balance': user[1], 'total_cases': user[2], 'status': user[5], 'refs': user[6]})

@app.route('/check_balance', methods=['POST'])
def check_balance():
    data = request.get_json()
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    user = get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    price = CASE_PRICES.get(case_type, 0)
    if user[1] < price:
        return jsonify({'error': 'Недостаточно звёзд!', 'can_open': False}), 400
    if case_type == "free" and time.time() - user[4] < FREE_CASE_COOLDOWN:
        wait = int((FREE_CASE_COOLDOWN - (time.time() - user[4])) // 60)
        return jsonify({'error': f'Жди {wait} мин', 'can_open': False}), 400
    return jsonify({'can_open': True})

@app.route('/check_balance_simple', methods=['POST'])
def check_balance_simple():
    data = request.get_json()
    uid = data.get('user_id')
    amount = data.get('amount', 0)
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'has_enough': user[1] >= amount})

@app.route('/get_prize', methods=['POST'])
def get_prize_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    case_type = data.get('case_type')
    uid = data.get('user_id')
    if case_type not in CASE_RANGES:
        return jsonify({'error': 'Invalid case type'}), 400
    prize = get_prize(case_type, uid)
    return jsonify({'prize': prize})

@app.route('/open_case', methods=['POST'])
def open_case():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        case_type = data.get('case_type')
        if case_type not in CASE_RANGES:
            return jsonify({'error': 'Invalid case type'}), 400
        with write_lock:
            user = get_user(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404

            if case_type == "free":
                if time.time() - user[4] < FREE_CASE_COOLDOWN:
                    wait = int((FREE_CASE_COOLDOWN - (time.time() - user[4])) // 60)
                    return jsonify({'error': f'Жди {wait} мин'}), 400
                prize = get_prize(case_type, user_id)
                new_bal = user[1] + prize
                new_total = user[2] + 1
                new_streak = user[3] + 1
                register_case_opening(user_id, case_type, 1)
                update_user(user_id, balance=new_bal, total_cases=new_total, streak=new_streak, last_open=int(time.time()))
                update_status(user_id, new_total)
                ad = random.choice(ads) if ads else ""
                return jsonify({'prize': prize, 'new_balance': new_bal, 'ad': ad})

            price = CASE_PRICES.get(case_type, 0)
            if user[1] < price:
                return jsonify({'error': 'Недостаточно звёзд!'}), 400
            prize = get_prize(case_type, user_id)
            new_bal = user[1] - price + prize
            new_total = user[2] + 1
            new_streak = user[3] + 1

            register_case_opening(user_id, case_type, 1)

            update_user(user_id, balance=new_bal, total_cases=new_total, streak=new_streak, last_open=int(time.time()))
            update_status(user_id, new_total)
            return jsonify({'prize': prize, 'new_balance': new_bal})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/open_10_cases', methods=['POST'])
def open_10_cases():
    data = request.get_json()
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    if case_type == "free":
        return jsonify({'error': 'Нельзя открыть 10 бесплатных кейсов'}), 400
    if case_type not in CASE_RANGES:
        return jsonify({'error': 'Invalid case type'}), 400
    with write_lock:
        user = get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        price = CASE_PRICES.get(case_type, 0)
        total_price = price * 10
        if user[1] < total_price:
            return jsonify({'error': f'Недостаточно звёзд! Нужно {total_price}⭐'}), 400
        total_prize = 0
        prizes = []
        for i in range(10):
            prize = get_prize(case_type, user_id)
            prizes.append(prize)
            total_prize += prize

        register_case_opening(user_id, case_type, 10)

        new_bal = user[1] - total_price + total_prize
        new_total = user[2] + 10
        new_streak = user[3] + 10
        update_user(user_id, balance=new_bal, total_cases=new_total, streak=new_streak, last_open=int(time.time()))
        update_status(user_id, new_total)
        return jsonify({
            'prizes': prizes,
            'total_prize': total_prize,
            'new_balance': new_bal
        })

@app.route('/get_levels_data', methods=['POST'])
def get_levels_data():
    data = request.get_json()
    uid = data.get('user_id')
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    level_wins = get_level_wins(uid)
    unlocked_levels = get_unlocked_levels(uid)

    rows = q("SELECT case_type, opened FROM level_progress WHERE user_id=?", (uid,)).fetchall()
    progress_all = {r[0]: r[1] for r in rows}
    level_progress = {lvl: progress_all.get(lvl, 0) for lvl in unlocked_levels}

    return jsonify({
        'unlocked_levels': unlocked_levels,
        'level_wins': level_wins,
        'level_progress': level_progress
    })

@app.route('/start_bot_battle', methods=['POST'])
def start_bot_battle():
    data = request.get_json()
    uid = data.get('user_id')
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
        qw("UPDATE level_progress SET opened = opened - ? WHERE user_id=? AND case_type=?",
           (BATTLE_PROGRESS_COST, uid, case_type))

        player_prize = get_prize(case_type, uid)
        bot_prize = get_prize(case_type, None)
        total = player_prize + bot_prize

        result = 'lose'
        result_text = ''

        if player_prize > bot_prize:
            user = get_user(uid)
            update_user(uid, balance=user[1] + total, last_open=int(time.time()))
            update_battle_stats(uid, won=True, stars=total, case_type=case_type)
            result = 'win'
            result_text = '🎉 Ты выиграл!'
        elif bot_prize > player_prize:
            update_user(uid, last_open=int(time.time()))
            update_battle_stats(uid, won=False, stars=player_prize, case_type=case_type)
            result = 'lose'
            result_text = '😢 Ты проиграл!'
        else:
            user = get_user(uid)
            update_user(uid, balance=user[1] + player_prize, last_open=int(time.time()))
            update_battle_stats(uid, won=False, stars=0, case_type=case_type)
            result = 'draw'
            result_text = '🤝 Ничья!'

        row = q("SELECT wins FROM level_wins WHERE user_id=? AND case_type=?", (uid, case_type)).fetchone()
        wins_after = row[0] if row else 0
        level_unlocked = wins_after >= WINS_TO_UNLOCK

        return jsonify({
            'result': result,
            'result_text': result_text,
            'player_prize': player_prize,
            'bot_prize': bot_prize,
            'wins': wins_after,
            'level_unlocked': level_unlocked,
            'needed_wins': WINS_TO_UNLOCK
        })

@app.route('/get_quests_data', methods=['POST'])
def get_quests_data():
    data = request.get_json()
    uid = data.get('user_id')
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    total_cases = user[2]
    refs = user[6]
    level_wins = get_level_wins(uid)
    completed = q("SELECT quest_id FROM completed_quests WHERE user_id=?", (uid,)).fetchall()
    claimed_quests = [row[0] for row in completed]
    return jsonify({
        'total_cases': total_cases,
        'refs': refs,
        'level_wins': level_wins,
        'claimed_statuses': [quest for quest in claimed_quests if quest.startswith('status_')],
        'claimed_levels': [quest for quest in claimed_quests if quest.startswith('level_')],
        'claimed_friends': [quest for quest in claimed_quests if quest.startswith('friends_')]
    })

@app.route('/claim_quest', methods=['POST'])
def claim_quest():
    data = request.get_json()
    uid = data.get('user_id')
    quest_id = data.get('quest_id')
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        if q("SELECT * FROM completed_quests WHERE user_id=? AND quest_id=?", (uid, quest_id)).fetchone():
            return jsonify({'error': 'Задание уже выполнено'}), 400
        reward = get_quest_reward(uid, quest_id)
        if reward is None:
            return jsonify({'error': 'Условие не выполнено'}), 400
        update_user(uid, balance=user[1] + reward)
        qw("INSERT INTO completed_quests (user_id, quest_id, completed_at) VALUES (?, ?, ?)",
           (uid, quest_id, int(time.time())))
        return jsonify({'success': True, 'reward': reward})

def get_quest_reward(uid, quest_id):
    user = get_user(uid)
    if not user:
        return None
    if quest_id.startswith('status_'):
        status_targets = {
            'status_hunter': 10, 'status_lucky': 100, 'status_stalker': 444,
            'status_master': 1000, 'status_legend': 2500
        }
        rewards = {
            'status_hunter': 10, 'status_lucky': 30, 'status_stalker': 50,
            'status_master': 100, 'status_legend': 200
        }
        if user[2] >= status_targets.get(quest_id, 0):
            return rewards.get(quest_id, 0)
    elif quest_id.startswith('level_'):
        level_map = {
            'level_mud': 'mud', 'level_wood': 'wood', 'level_stone': 'stone',
            'level_bronze': 'bronze', 'level_silver': 'silver', 'level_gold': 'gold',
            'level_diamond': 'diamond', 'level_netherite': 'netherite',
            'level_obsidian': 'obsidian', 'level_bedrock': 'bedrock'
        }
        level_rewards = {
            'level_mud': 15, 'level_wood': 27, 'level_stone': 57,
            'level_bronze': 147, 'level_silver': 297, 'level_gold': 747,
            'level_diamond': 1497, 'level_netherite': 2997,
            'level_obsidian': 7497, 'level_bedrock': 30000
        }
        case_type = level_map.get(quest_id)
        if case_type:
            row = q("SELECT wins FROM level_wins WHERE user_id=? AND case_type=?", (uid, case_type)).fetchone()
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
    data = request.get_json()
    uid = data.get('user_id')
    promo_code = data.get('promo_code', '').upper()
    with write_lock:
        user = get_user(uid)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        promo = q("SELECT reward, max_uses, used_count FROM promo_codes WHERE code=?", (promo_code,)).fetchone()
        if not promo:
            return jsonify({'error': 'Неверный промокод!'}), 400
        reward, max_uses, used_count = promo
        if max_uses > 0 and used_count >= max_uses:
            return jsonify({'error': 'Промокод уже использован максимальное количество раз!'}), 400
        if user[9] == 1:
            return jsonify({'error': 'Ты уже использовал промокод!'}), 400
        update_user(uid, balance=user[1] + reward, promo_used=1, promo_code=promo_code)
        qw("UPDATE promo_codes SET used_count = used_count + 1 WHERE code=?", (promo_code,))
        return jsonify({'success': True, 'reward': reward})

# ===== MINES =====
@app.route('/start_mines_game', methods=['POST'])
def start_mines_game():
    data = request.get_json()
    uid = data.get('user_id')
    bet = data.get('bet')
    mines = data.get('mines')
    if not isinstance(bet, int) or not isinstance(mines, int):
        return jsonify({'error': 'Некорректные параметры'}), 400
    if bet < 3 or bet > 1000:
        return jsonify({'error': 'Ставка от 3 до 1000⭐'}), 400
    if mines < 3 or mines > 8:
        return jsonify({'error': 'Мин от 3 до 8'}), 400
    with write_lock:
        user = get_user(uid)
        if not user or user[1] < bet:
            return jsonify({'error': 'Недостаточно звёзд'}), 400
        with mines_lock:
            for gid, game in active_mines_games.items():
                if game['user_id'] == uid and game['status'] == 'active':
                    return jsonify({'error': 'У тебя уже есть активная игра!'}), 400
            update_user(uid, balance=user[1] - bet)
            board = [0] * 25
            positions = random.sample(range(25), mines)
            for pos in positions:
                board[pos] = 1
            game_id = int(time.time() * 1000)
            active_mines_games[game_id] = {
                'user_id': uid,
                'bet': bet,
                'mines': mines,
                'board': board,
                'opened': [0] * 25,
                'opened_count': 0,
                'multiplier': 1.0,
                'status': 'active'
            }
        return jsonify({
            'game_id': game_id,
            'balance': user[1] - bet
        })

@app.route('/open_mines_cell', methods=['POST'])
def open_mines_cell():
    data = request.get_json()
    uid = data.get('user_id')
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
                return jsonify({
                    'status': 'mine',
                    'cell': index,
                    'opened_count': game['opened_count'],
                    'multiplier': 0,
                    'game_over': True,
                    'won': False,
                    'bet': game['bet'],
                    'balance': user[1],
                    'mines_positions': [i for i, v in enumerate(game['board']) if v == 1]
                })

            opened = game['opened_count']
            game['multiplier'] = get_mines_multiplier(opened, game['mines'])
            safe_cells = 25 - game['mines']
            if game['opened_count'] == safe_cells:
                raw_winnings = int(game['bet'] * game['multiplier'])
                final_winnings = min(raw_winnings, 5000)
                user = get_user(uid)
                new_bal = user[1] + final_winnings
                update_user(uid, balance=new_bal, last_open=int(time.time()))
                game['status'] = 'won'
                update_mines_stats(uid, won=True, multiplier=game['multiplier'], stars=final_winnings)
                return jsonify({
                    'status': 'safe',
                    'cell': index,
                    'opened_count': game['opened_count'],
                    'multiplier': game['multiplier'],
                    'game_over': True,
                    'won': True,
                    'winnings': final_winnings,
                    'bet': game['bet'],
                    'balance': new_bal,
                    'mines_positions': [i for i, v in enumerate(game['board']) if v == 1]
                })
            user = get_user(uid)
            return jsonify({
                'status': 'safe',
                'cell': index,
                'opened_count': game['opened_count'],
                'multiplier': game['multiplier'],
                'game_over': False,
                'won': False,
                'balance': user[1]
            })

@app.route('/cashout_mines', methods=['POST'])
def cashout_mines():
    data = request.get_json()
    uid = data.get('user_id')
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
            final_winnings = min(raw_winnings, 5000)
            user = get_user(uid)
            new_bal = user[1] + final_winnings
            update_user(uid, balance=new_bal, last_open=int(time.time()))
            game['status'] = 'won'
            multiplier = game['multiplier']
            update_mines_stats(uid, won=True, multiplier=multiplier, stars=final_winnings)
            mines_positions = [i for i, v in enumerate(game['board']) if v == 1]
            del active_mines_games[game_id]
            return jsonify({
                'win': final_winnings,
                'balance': new_bal,
                'multiplier': multiplier,
                'game_over': True,
                'won': True,
                'mines_positions': mines_positions
            })

@app.route('/exit_mines', methods=['POST'])
def exit_mines():
    data = request.get_json()
    game_id = data.get('game_id')
    with mines_lock:
        game = active_mines_games.pop(game_id, None)
    if game and game['status'] == 'active':
        return jsonify({
            'success': True,
            'mines_positions': [i for i, v in enumerate(game['board']) if v == 1]
        })
    return jsonify({'success': True})

@app.route('/get_mines_stats', methods=['POST'])
def get_mines_stats():
    data = request.get_json()
    uid = data.get('user_id')
    stats = q("SELECT * FROM mines_stats WHERE user_id=?", (uid,)).fetchone()
    if not stats:
        return jsonify({'games': 0, 'wins': 0, 'losses': 0, 'best_multiplier': 1.0, 'total_won': 0, 'total_lost': 0})
    return jsonify({'games': stats[1], 'wins': stats[2], 'losses': stats[3], 'best_multiplier': stats[4], 'total_won': stats[5], 'total_lost': stats[6]})

# ===== CRASH =====
@app.route('/make_crash_bet', methods=['POST'])
def make_crash_bet():
    global crash_data
    data = request.get_json()
    uid = data.get('user_id')
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
        update_user(uid, balance=user[1] - bet, last_open=int(time.time()))

    return jsonify({'success': True})

@app.route('/crash_status', methods=['POST'])
def crash_status():
    global crash_data
    data = request.get_json(silent=True) or {}
    uid = data.get('user_id')
    with crash_lock:
        now = time.time()
        waiting_time = 0
        if crash_data['phase'] == 'waiting':
            waiting_time = max(0, crash_data['waiting_time'] - now)

        return jsonify({
            'phase': crash_data['phase'],
            'multiplier': crash_data['multiplier'],
            'waiting_time': round(waiting_time, 1),
            'crash_multiplier_at_crash': crash_data.get('crash_multiplier_at_crash', 1.00),
            'game_count': crash_data['game_count'],
            'my_bet': crash_data['bets'].get(uid, 0) if uid else 0
        })

@app.route('/cashout_crash', methods=['POST'])
def cashout_crash():
    global crash_data
    data = request.get_json()
    uid = data.get('user_id')
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

    return jsonify({
        'win': final_winnings,
        'balance': new_bal,
        'multiplier': multiplier
    })

@app.route('/get_crash_stats', methods=['POST'])
def get_crash_stats():
    data = request.get_json()
    uid = data.get('user_id')
    stats = q("SELECT * FROM crash_stats WHERE user_id=?", (uid,)).fetchone()
    if not stats:
        return jsonify({'games': 0, 'wins': 0, 'losses': 0, 'best_multiplier': 1.0, 'total_won': 0, 'total_lost': 0})
    return jsonify({'games': stats[1], 'wins': stats[2], 'losses': stats[3], 'best_multiplier': stats[4], 'total_won': stats[5], 'total_lost': stats[6]})

# ===== UPGRADE =====
@app.route('/upgrade_calculate', methods=['POST'])
def upgrade_calculate():
    data = request.get_json()
    uid = data.get('user_id')
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
    data = request.get_json()
    uid = data.get('user_id')
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
            result = 'lose'
            message = f'❌ ПРОВАЛ! Ты потерял {bet}⭐'
        return jsonify({
            'result': result,
            'chance': round(chance, 2),
            'bet': bet,
            'target': target,
            'new_balance': new_balance,
            'message': message
        })

# ===== СТАТИКА / WEBHOOK =====
@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

@app.route('/webhook', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = telebot.types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    return '', 400

# ===== ЗАПУСК =====
_start_lock = threading.Lock()
_threads_started = False

def _telegram_call_with_retry(func, *args, retries=3, pause=5, **kwargs):
    """Сетевой вызов Telegram API с retry. Не бросает исключение наружу."""
    for attempt in range(1, retries + 1):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"Telegram API error ({func.__name__}, попытка {attempt}/{retries}): {e}")
            if attempt < retries:
                time.sleep(pause)
    return None

def run_polling():
    """Polling в daemon-потоке: все сетевые вызовы внутри, с retry. Импорт модуля не зависит от Telegram API."""
    _telegram_call_with_retry(bot.remove_webhook)
    while True:
        try:
            bot.infinity_polling(skip_pending=True, timeout=30, long_polling_timeout=30)
        except Exception as e:
            print(f"Polling error: {e}")
            time.sleep(5)

def run_webhook_setup():
    """Установка webhook в daemon-потоке: все сетевые вызовы внутри, с retry."""
    if _telegram_call_with_retry(bot.remove_webhook) is None:
        print("⚠️ remove_webhook не удался после 3 попыток, пробую set_webhook всё равно")
    if _telegram_call_with_retry(bot.set_webhook, url=WEBAPP_URL + "/webhook") is not None:
        print(f"✅ Webhook mode: {WEBAPP_URL}/webhook")
    else:
        print("❌ set_webhook не удался после 3 попыток (Flask продолжает работать)")

def start_background_threads():
    """Защита от двойного запуска потоков (в т.ч. под gunicorn): флаг на уровне процесса.
    Все сетевые вызовы Telegram выполняются только внутри daemon-потоков."""
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

start_background_threads()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"✅ БОТ ЗАПУЩЕН на порту {port}")
    app.run(host="0.0.0.0", port=port)
