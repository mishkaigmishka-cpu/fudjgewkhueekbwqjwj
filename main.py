import telebot
import random
import sqlite3
import time
import os
import threading
from flask import Flask, request, jsonify, send_from_directory
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, LabeledPrice

TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TOKEN:
    raise ValueError("TELEGRAM_TOKEN не установлен!")

ADMIN_ID = 7819642052

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

# ===================== CORS =====================
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

conn = sqlite3.connect('cases.db', check_same_thread=False)
cursor = conn.cursor()

# ===================== ТАБЛИЦЫ БД =====================
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    balance INTEGER DEFAULT 10,
    total_cases INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_open INTEGER DEFAULT 0,
    status TEXT DEFAULT '🟢 Новичок',
    refs INTEGER DEFAULT 0,
    daily_claimed INTEGER DEFAULT 0,
    username TEXT DEFAULT '',
    promo_used INTEGER DEFAULT 0
)''')
conn.commit()

cursor.execute('''CREATE TABLE IF NOT EXISTS invited (
    inviter_id INTEGER,
    invited_id INTEGER,
    PRIMARY KEY (inviter_id, invited_id)
)''')
conn.commit()

cursor.execute('''CREATE TABLE IF NOT EXISTS battle_stats (
    user_id INTEGER PRIMARY KEY,
    battles_played INTEGER DEFAULT 0,
    battles_won INTEGER DEFAULT 0,
    battles_lost INTEGER DEFAULT 0,
    total_won_stars INTEGER DEFAULT 0,
    total_lost_stars INTEGER DEFAULT 0,
    commission_paid INTEGER DEFAULT 0
)''')
conn.commit()

cursor.execute('''CREATE TABLE IF NOT EXISTS mines_stats (
    user_id INTEGER PRIMARY KEY,
    games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    best_multiplier REAL DEFAULT 1.0,
    total_won INTEGER DEFAULT 0,
    total_lost INTEGER DEFAULT 0
)''')
conn.commit()

cursor.execute('''CREATE TABLE IF NOT EXISTS system_balance (
    id INTEGER PRIMARY KEY,
    balance INTEGER DEFAULT 0
)''')
conn.commit()
cursor.execute("INSERT OR IGNORE INTO system_balance (id, balance) VALUES (1, 0)")
conn.commit()

cursor.execute('''CREATE TABLE IF NOT EXISTS commission_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER,
    timestamp INTEGER
)''')
conn.commit()

# ===================== КЕЙСЫ =====================
ads = ["💎 Крипто-обменник: https://t.me/exchange", "🎁 Халява каждый день: https://t.me/free_stuff", "🔥 Скины со скидкой: https://t.me/skins"]

CASE_RANGES = {
    "free": {
        "common": [1, 2], "rare": [3, 4], "epic": [5, 6, 7, 8, 9, 10], "legendary": [100], "jackpot": [1000],
        "common_chance": 0.599, "rare_chance": 0.299, "epic_chance": 0.0999, "legendary_chance": 0.0001, "jackpot_chance": 0.00000001
    },
    "mud": {
        "common": [1, 2, 3, 4, 5, 6, 7], "rare": [10, 12, 13], "epic": [16, 18, 20, 22, 24, 27], "legendary": [50], "jackpot": [500],
        "common_chance": 0.7, "rare_chance": 0.25, "epic_chance": 0.0499, "legendary_chance": 0.001, "jackpot_chance": 0.00000001
    },
    "wood": {
        "common": [2, 4, 5, 6, 7, 8, 9, 10], "rare": [12, 13, 15], "epic": [20, 50], "legendary": [100, 500], "jackpot": [1000],
        "common_chance": 0.6, "rare_chance": 0.3, "epic_chance": 0.099, "legendary_chance": 0.00001, "jackpot_chance": 0.00000001
    },
    "stone": {
        "common": [11, 13, 15, 16, 17, 18, 19], "rare": [21, 23, 24, 25], "epic": [30, 50, 100, 250], "legendary": [500, 1000], "jackpot": [2500],
        "common_chance": 0.6, "rare_chance": 0.3, "epic_chance": 0.099, "legendary_chance": 0.00001, "jackpot_chance": 0.00000001
    },
    "bronze": {
        "common": [20, 25, 30], "rare": [35, 40, 45, 50], "epic": [55, 60, 65, 75, 100], "legendary": [222, 333, 444, 555, 1000, 1500, 2000], "jackpot": [5000],
        "common_chance": 0.25, "rare_chance": 0.6499, "epic_chance": 0.09999, "legendary_chance": 0.000001, "jackpot_chance": 0.000000001
    },
    "silver": {
        "common": [40, 50, 60, 70], "rare": [70, 80, 90, 100], "epic": [100, 110, 120, 130, 140, 150], "legendary": [200, 250, 333, 444, 555, 666, 777, 888, 999, 1488, 2011, 5000], "jackpot": [10000],
        "common_chance": 0.25, "rare_chance": 0.6745, "epic_chance": 0.0749, "legendary_chance": 0.0005, "jackpot_chance": 0.00000001
    },
    "gold": {
        "common": [75, 100], "rare": [150, 169, 190, 220, 251], "epic": [300, 400, 500, 777], "legendary": [999, 1000, 2000, 5000, 10000, 12500], "jackpot": [25000],
        "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001
    },
    "diamond": {
        "common": [250, 300, 333], "rare": [350, 444, 505], "epic": [1000, 1488, 2222], "legendary": [2500, 5000, 10000, 12500, 25000], "jackpot": [50000],
        "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001
    },
    "netherite": {
        "common": [500, 550, 600], "rare": [650, 700, 750, 800, 850], "epic": [900, 950, 1000, 1500], "legendary": [2000, 2500, 3000, 3200, 3500, 4000, 5000, 10000, 15000, 20000], "jackpot": [25000],
        "common_chance": 0.2499, "rare_chance": 0.6749, "epic_chance": 0.07, "legendary_chance": 0.005, "jackpot_chance": 0.00000001
    },
    "bedrock": {
        "common": [1000, 1200, 1400], "rare": [1600, 1800, 2000, 2200, 2400], "epic": [2500, 2600, 2800, 3000, 3200, 3500], "legendary": [4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000], "jackpot": [10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 50000, 100000],
        "common_chance": 0.25, "rare_chance": 0.6745, "epic_chance": 0.0749, "legendary_chance": 0.0045, "jackpot_chance": 0.00000001
    }
}

def get_prize(case_type):
    data = CASE_RANGES[case_type]
    rnd = random.random()
    if rnd < data["jackpot_chance"]:
        return random.choice(data["jackpot"])
    elif rnd < data["jackpot_chance"] + data["legendary_chance"]:
        return random.choice(data["legendary"])
    elif rnd < data["common_chance"]:
        return random.choice(data["common"])
    elif rnd < data["common_chance"] + data["rare_chance"]:
        return random.choice(data["rare"])
    else:
        return random.choice(data["epic"])

def get_user(uid):
    cursor.execute("SELECT * FROM users WHERE id=?", (uid,))
    return cursor.fetchone()

def get_user_by_username(username):
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    return cursor.fetchone()

def update_user(uid, **kwargs):
    user = get_user(uid)
    if not user:
        return
    data = list(user)
    for key, val in kwargs.items():
        if key == 'balance':
            data[1] = val
        elif key == 'total_cases':
            data[2] = val
        elif key == 'streak':
            data[3] = val
        elif key == 'last_open':
            data[4] = val
        elif key == 'status':
            data[5] = val
        elif key == 'refs':
            data[6] = val
        elif key == 'daily_claimed':
            data[7] = val
        elif key == 'username':
            data[8] = val
        elif key == 'promo_used':
            data[9] = val
    cursor.execute("UPDATE users SET balance=?, total_cases=?, streak=?, last_open=?, status=?, refs=?, daily_claimed=?, username=?, promo_used=? WHERE id=?",
                   (data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], uid))
    conn.commit()

def update_status(uid, total_cases):
    if total_cases >= 100:
        status = "👑 Легенда"
    elif total_cases >= 50:
        status = "🟣 Мастер фортуны"
    elif total_cases >= 30:
        status = "🔴 Сталкер халявы"
    elif total_cases >= 10:
        status = "🟠 Везунчик"
    elif total_cases >= 5:
        status = "🟡 Кейс-охотник"
    else:
        status = "🟢 Новичок"
    update_user(uid, status=status)

def add_commission(amount):
    cursor.execute("UPDATE system_balance SET balance = balance + ? WHERE id = 1", (amount,))
    conn.commit()
    cursor.execute("INSERT INTO commission_log (amount, timestamp) VALUES (?, ?)", (amount, int(time.time())))
    conn.commit()

PROMO_CODE = "RANDEVU50"

# ===================== ГЛОБАЛЬНЫЕ ДАННЫЕ =====================
active_battles = {}
pending_battles = {}
user_battles = {}
bot_battles = {}
active_mines_games = {}
battle_rooms = {}
battle_results = {}
battle_ready_status = {}

# ===================== МИНЁР — МНОЖИТЕЛИ (ИСПРАВЛЕНО) =====================
def get_mines_multiplier(opened, mines):
    base_multipliers = {
        1: 1.05, 2: 1.10, 3: 1.20, 4: 1.35, 5: 1.55,
        6: 1.80, 7: 2.20, 8: 2.70, 9: 3.30, 10: 4.00,
        11: 4.50, 12: 5.00
    }
    if opened > 12:
        base = 5.00
    else:
        base = base_multipliers.get(opened, 1.00)
    
    mine_boost = {
        3: 1.0,
        4: 1.2,
        5: 1.5,
        6: 1.8,
        7: 2.2,
        8: 2.8
    }
    boost = mine_boost.get(mines, 1.0)
    
    total = base * boost
    return round(total, 2)

def update_mines_stats(user_id, won, multiplier, stars):
    cursor.execute("SELECT * FROM mines_stats WHERE user_id=?", (user_id,))
    stats = cursor.fetchone()
    if not stats:
        cursor.execute('''INSERT INTO mines_stats 
                        (user_id, games, wins, losses, best_multiplier, total_won, total_lost)
                        VALUES (?, 1, ?, 0, ?, ?, 0)''',
                        (user_id, 1 if won else 0, multiplier, stars if won else 0))
    else:
        games = stats[1] + 1
        wins = stats[2] + (1 if won else 0)
        losses = stats[3] + (0 if won else 1)
        best_multiplier = max(stats[4], multiplier)
        total_won = stats[5] + (stars if won else 0)
        total_lost = stats[6] + (0 if won else 0)
        cursor.execute('''UPDATE mines_stats SET 
                        games=?, wins=?, losses=?, best_multiplier=?, total_won=?, total_lost=?
                        WHERE user_id=?''',
                        (games, wins, losses, best_multiplier, total_won, total_lost, user_id))
    conn.commit()

def update_battle_stats(user_id, won, stars):
    cursor.execute("SELECT * FROM battle_stats WHERE user_id=?", (user_id,))
    stats = cursor.fetchone()
    if not stats:
        cursor.execute('''INSERT INTO battle_stats 
                        (user_id, battles_played, battles_won, battles_lost, total_won_stars, total_lost_stars, commission_paid)
                        VALUES (?, 1, ?, 0, ?, 0, 0)''',
                        (user_id, 1 if won else 0, stars if won else 0))
    else:
        battles_played = stats[1] + 1
        battles_won = stats[2] + (1 if won else 0)
        battles_lost = stats[3] + (0 if won else 1)
        total_won_stars = stats[4] + (stars if won else 0)
        total_lost_stars = stats[5] + (0 if won else stars)
        cursor.execute('''UPDATE battle_stats SET 
                        battles_played=?, battles_won=?, battles_lost=?, 
                        total_won_stars=?, total_lost_stars=?
                        WHERE user_id=?''', 
                        (battles_played, battles_won, battles_lost, total_won_stars, total_lost_stars, user_id))
    conn.commit()

def battle_cleaner():
    while True:
        current_time = time.time()
        for room_id, room in list(battle_rooms.items()):
            if room['status'] == 'waiting' and current_time - room['created_at'] > 900:
                del battle_rooms[room_id]
        time.sleep(60)

threading.Thread(target=battle_cleaner, daemon=True).start()

# ===================== КОМАНДЫ TELEGRAM =====================
@bot.message_handler(commands=['start'])
def start(msg):
    uid = msg.from_user.id
    username = msg.from_user.username or ""
    args = msg.text.split()
    cursor.execute("INSERT OR IGNORE INTO users (id) VALUES (?)", (uid,))
    conn.commit()
    user = get_user(uid)
    if len(args) > 1:
        try:
            inviter_id = int(args[1])
            if inviter_id != uid:
                cursor.execute("INSERT OR IGNORE INTO invited (inviter_id, invited_id) VALUES (?, ?)", (inviter_id, uid))
                conn.commit()
                inviter = get_user(inviter_id)
                if inviter:
                    update_user(inviter_id, balance=inviter[1] + 30, refs=inviter[6] + 1)
                    try:
                        bot.send_message(inviter_id, f"⭐ Ты получил 30 звёзд за приглашение @{username}!")
                    except:
                        pass
                    update_user(uid, balance=user[1] + 50)
                    try:
                        bot.send_message(uid, f"🎉 Ты получил 50 звёзд за регистрацию по ссылке!")
                    except:
                        pass
        except:
            pass
    update_user(uid, username=username)
    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton(
        "🎮 Открыть кейсы", 
        web_app={"url": "https://randevu-bot-production.up.railway.app"}
    ))
    kb.add(InlineKeyboardButton("💳 Пополнить звёзды", callback_data="topup"))
    bot.send_message(msg.chat.id, "Добро пожаловать в RANDEVU!", reply_markup=kb)

@bot.callback_query_handler(func=lambda call: call.data == "topup")
def topup_callback(call):
    bot.answer_callback_query(call.id)
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("🔙 Назад", callback_data="cancel_topup"))
    msg = bot.send_message(call.message.chat.id, "💳 Введите сумму пополнения (от 1 до 5000⭐):", reply_markup=kb)
    bot.register_next_step_handler(msg, process_topup_amount, msg.message_id)

def process_topup_amount(message, msg_id):
    uid = message.from_user.id
    try:
        amount = int(message.text.strip())
    except:
        bot.edit_message_text("❌ Введите число!", chat_id=uid, message_id=msg_id)
        return
    if amount < 1 or amount > 5000:
        bot.edit_message_text("❌ Сумма должна быть от 1 до 5000⭐!", chat_id=uid, message_id=msg_id)
        return
    bot.edit_message_text("💰 Ожидайте оплаты...", chat_id=uid, message_id=msg_id)
    bot.send_invoice(chat_id=uid, title=f"Пополнение на {amount}⭐", description=f"Ты получишь {amount} звёзд.", invoice_payload=f"stars_{uid}_{int(time.time())}", provider_token="", currency="XTR", prices=[LabeledPrice(label=f"{amount} Stars", amount=amount)], start_parameter="buy_stars")

@bot.callback_query_handler(func=lambda call: call.data == "cancel_topup")
def cancel_topup(call):
    bot.answer_callback_query(call.id)
    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton(
        "🎮 Открыть кейсы", 
        web_app={"url": "https://randevu-bot-production.up.railway.app"}
    ))
    kb.add(InlineKeyboardButton("💳 Пополнить звёзды", callback_data="topup"))
    bot.edit_message_text("Добро пожаловать в RANDEVU!", chat_id=call.message.chat.id, message_id=call.message.message_id, reply_markup=kb)

@bot.pre_checkout_query_handler(func=lambda query: True)
def handle_pre_checkout(query):
    bot.answer_pre_checkout_query(query.id, ok=True)

@bot.message_handler(content_types=['successful_payment'])
def handle_payment(message):
    uid = message.from_user.id
    amount = message.successful_payment.total_amount
    user = get_user(uid)
    if user:
        update_user(uid, balance=user[1] + amount)
        bot.send_message(uid, f"✅ Пополнено на {amount}⭐\n💰 Новый баланс: {user[1] + amount}⭐")

@bot.message_handler(commands=['promo'])
def promo_handler(msg):
    uid = msg.from_user.id
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Введи промокод: /promo RANDEVU50")
        return
    if args[1] != PROMO_CODE:
        bot.reply_to(msg, "❌ Неверный промокод!")
        return
    user = get_user(uid)
    if not user:
        bot.reply_to(msg, "Напиши /start")
        return
    if user[9] == 1:
        bot.reply_to(msg, "❌ Ты уже использовал промокод!")
        return
    update_user(uid, balance=user[1] + 50, promo_used=1)
    bot.reply_to(msg, f"✅ Промокод активирован! Ты получил 50⭐")

@bot.message_handler(commands=['add_ad'])
def add_ad(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    parts = msg.text.split(maxsplit=1)
    if len(parts) < 2:
        bot.reply_to(msg, "Формат: /add_ad текст")
        return
    ads.append(parts[1])
    bot.reply_to(msg, "✅ Реклама добавлена")

@bot.message_handler(commands=['give_me'])
def give_me(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Укажи сумму: /give_me 500")
        return
    try:
        amount = int(args[1])
    except:
        bot.reply_to(msg, "❌ Сумма должна быть числом")
        return
    user = get_user(msg.from_user.id)
    if user:
        update_user(msg.from_user.id, balance=user[1] + amount)
        bot.reply_to(msg, f"✅ Ты получил {amount}⭐\n💰 Баланс: {user[1] + amount}⭐")

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
    except:
        bot.reply_to(msg, "❌ Сумма должна быть числом")
        return
    user = get_user_by_username(username)
    if not user:
        bot.reply_to(msg, f"❌ Пользователь @{username} не найден")
        return
    update_user(user[0], balance=user[1] + amount)
    bot.reply_to(msg, f"✅ @{username} получил {amount}⭐\n💰 Баланс: {user[1] + amount}⭐")

@bot.message_handler(commands=['balance'])
def balance_cmd(msg):
    user = get_user(msg.from_user.id)
    if not user:
        bot.reply_to(msg, "Напиши /start")
        return
    bot.reply_to(msg, f"💰 Баланс: {user[1]}⭐\n📦 Открыто кейсов: {user[2]}\n🏆 Статус: {user[5]}\n👥 Рефералов: {user[6]}")

@bot.message_handler(commands=['treasury'])
def treasury_cmd(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    cursor.execute("SELECT balance FROM system_balance WHERE id=1")
    balance = cursor.fetchone()
    cursor.execute("SELECT COUNT(*) FROM commission_log")
    total_transactions = cursor.fetchone()[0]
    text = f"🏦 **КАЗНА БОТА:**\n💰 Баланс: {balance[0]}⭐\n📊 Всего транзакций: {total_transactions}"
    bot.reply_to(msg, text)

@bot.message_handler(commands=['treasury_withdraw'])
def treasury_withdraw(msg):
    if msg.from_user.id != ADMIN_ID:
        return
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Формат: /treasury_withdraw 500")
        return
    try:
        amount = int(args[1])
    except:
        bot.reply_to(msg, "❌ Сумма должна быть числом")
        return
    cursor.execute("SELECT balance FROM system_balance WHERE id=1")
    balance = cursor.fetchone()[0]
    if balance < amount:
        bot.reply_to(msg, f"❌ В казне только {balance}⭐")
        return
    cursor.execute("UPDATE system_balance SET balance = balance - ? WHERE id = 1", (amount,))
    conn.commit()
    admin = get_user(ADMIN_ID)
    update_user(ADMIN_ID, balance=admin[1] + amount)
    bot.reply_to(msg, f"✅ Выведено {amount}⭐ из казны")

@bot.message_handler(commands=['battle_stats'])
def battle_stats_cmd(msg):
    uid = msg.from_user.id
    cursor.execute("SELECT * FROM battle_stats WHERE user_id=?", (uid,))
    stats = cursor.fetchone()
    if not stats:
        bot.reply_to(msg, "⚔️ Ты ещё не участвовал в битвах!")
        return
    text = f"⚔️ **ТВОЯ СТАТИСТИКА БИТВ:**\n\n🎮 Всего битв: {stats[1]}\n🏆 Побед: {stats[2]}\n💀 Поражений: {stats[3]}\n⭐ Выиграно звёзд: {stats[4]}\n💸 Проиграно звёзд: {stats[5]}\n💰 Комиссии уплачено: {stats[6]}⭐\n\nПроцент побед: {int(stats[2] / stats[1] * 100) if stats[1] > 0 else 0}%"
    bot.reply_to(msg, text)

@bot.message_handler(commands=['mines_stats'])
def mines_stats_cmd(msg):
    uid = msg.from_user.id
    cursor.execute("SELECT * FROM mines_stats WHERE user_id=?", (uid,))
    stats = cursor.fetchone()
    if not stats:
        bot.reply_to(msg, "💣 Ты ещё не играл в Минёр!")
        return
    text = f"💣 **СТАТИСТИКА МИНЁРА:**\n\n🎮 Всего игр: {stats[1]}\n🏆 Побед: {stats[2]}\n💀 Поражений: {stats[3]}\n🔥 Лучший множитель: x{stats[4]}\n⭐ Выиграно звёзд: {stats[5]}\n💸 Проиграно звёзд: {stats[6]}\n\nПроцент побед: {int(stats[2] / stats[1] * 100) if stats[1] > 0 else 0}%"
    bot.reply_to(msg, text)

# ===================== КОМНАТЫ (БИТВЫ) =====================
@app.route('/create_battle_room', methods=['POST', 'OPTIONS'])
def create_battle_room():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    case_type = data.get('case_type')
    
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404
    
    prices = {"free": 0, "mud": 5, "wood": 9, "stone": 19, "bronze": 49, "silver": 99, "gold": 249, "diamond": 499, "netherite": 999, "bedrock": 2499}
    price = prices.get(case_type, 0)
    if user[1] < price:
        return jsonify({'error': f'Недостаточно звёзд! Нужно {price}⭐ для открытия кейса'}), 400
    
    for rid, room in battle_rooms.items():
        if room['creator'] == uid and room['status'] == 'waiting':
            return jsonify({'error': 'У тебя уже есть активная комната'}), 400
    
    room_id = f"#{random.randint(1000, 9999)}"
    battle_rooms[room_id] = {
        'creator': uid,
        'case_type': case_type,
        'players': [uid],
        'status': 'waiting',
        'created_at': time.time()
    }
    return jsonify({'room_id': room_id, 'case_type': case_type})

@app.route('/get_battle_rooms', methods=['POST', 'OPTIONS'])
def get_battle_rooms():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    rooms = []
    
    for rid, room in battle_rooms.items():
        if room['status'] == 'waiting' and len(room['players']) < 2:
            p1 = get_user(room['players'][0])
            p2 = get_user(room['players'][1]) if len(room['players']) > 1 else None
            
            rooms.append({
                'room_id': rid,
                'creator_id': room['creator'],
                'case_type': room['case_type'],
                'players_count': len(room['players']),
                'player1': p1[8] if p1 else f"ID{room['players'][0]}",
                'player2': p2[8] if p2 else 'ОЖИДАНИЕ...',
                'is_my_room': uid in room['players']
            })
    
    return jsonify({'rooms': rooms})

@app.route('/join_battle_room', methods=['POST', 'OPTIONS'])
def join_battle_room():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    room_id = data.get('room_id')
    
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'Пользователь не найден. Напишите /start'}), 404
    
    if room_id not in battle_rooms:
        return jsonify({'error': 'Комната не найдена'}), 404
    
    room = battle_rooms[room_id]
    if room['status'] != 'waiting' and room['status'] != 'active':
        return jsonify({'error': 'Битва уже началась или завершена'}), 400
    if len(room['players']) >= 2:
        return jsonify({'error': 'Комната полна'}), 400
    if uid in room['players']:
        return jsonify({'error': 'Ты уже в этой комнате', 'already_in_room': True}), 400
    
    prices = {"free": 0, "mud": 5, "wood": 9, "stone": 19, "bronze": 49, "silver": 99, "gold": 249, "diamond": 499, "netherite": 999, "bedrock": 2499}
    price = prices.get(room['case_type'], 0)
    if user[1] < price:
        return jsonify({'error': f'Недостаточно звёзд! Нужно {price}⭐ для открытия кейса'}), 400
    
    room['players'].append(uid)
    room['status'] = 'active'
    
    p1 = get_user(room['players'][0])
    p2 = get_user(room['players'][1])
    
    return jsonify({
        'success': True,
        'room_id': room_id,
        'case_type': room['case_type'],
        'player1': p1[8] if p1 else f"ID{room['players'][0]}",
        'player2': p2[8] if p2 else f"ID{room['players'][1]}"
    })

@app.route('/exit_battle_room', methods=['POST', 'OPTIONS'])
def exit_battle_room():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    room_id = data.get('room_id')
    
    if room_id not in battle_rooms:
        return jsonify({'error': 'Комната не найдена'}), 404
    
    room = battle_rooms[room_id]
    
    if uid in room['players']:
        room['players'].remove(uid)
    
    if len(room['players']) == 0:
        del battle_rooms[room_id]
        return jsonify({'success': True, 'room_kept': False})
    else:
        room['status'] = 'waiting'
        return jsonify({'success': True, 'room_kept': True})

# ===== ИСПРАВЛЕНО: BATTLE_READY (ВЫЛЕТ ПРИ ГОТОВ) =====
@app.route('/battle_ready', methods=['POST', 'OPTIONS'])
def battle_ready():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    room_id = data.get('room_id')
    
    if room_id not in battle_rooms:
        return jsonify({'error': 'Комната не найдена'}), 404
    
    room = battle_rooms[room_id]
    if uid not in room['players']:
        return jsonify({'error': 'Ты не в этой комнате'}), 403
    
    if room_id not in battle_ready_status:
        battle_ready_status[room_id] = [False, False]
    
    if uid == room['players'][0]:
        battle_ready_status[room_id][0] = True
    else:
        battle_ready_status[room_id][1] = True
    
    if all(battle_ready_status[room_id]):
        battle_ready_status[room_id] = [False, False]
        
        if room_id not in battle_rooms:
            return jsonify({'error': 'Комната удалена'}), 404
        
        room = battle_rooms[room_id]
        room['status'] = 'active'
        
        import threading
        threading.Thread(target=start_battle_opening, args=(room_id,), daemon=True).start()
        
        return jsonify({'ready': True})
    
    return jsonify({'ready': False})

@app.route('/start_bot_battle', methods=['POST', 'OPTIONS'])
def start_bot_battle():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    case_type = data.get('case_type')
    
    user = get_user(uid)
    prices = {"free": 0, "mud": 5, "wood": 9, "stone": 19, "bronze": 49, "silver": 99, "gold": 249, "diamond": 499, "netherite": 999, "bedrock": 2499}
    price = prices.get(case_type, 0)
    if user[1] < price:
        return jsonify({'error': f'Недостаточно звёзд! Нужно {price}⭐ для открытия кейса'}), 400
    
    player_prize = get_prize(case_type)
    bot_prize = get_prize(case_type)
    
    update_user(uid, balance=user[1] - price + player_prize)
    
    if player_prize > bot_prize:
        commission = int(player_prize * 0.10)
        winnings = (player_prize - commission) + bot_prize
        user = get_user(uid)
        update_user(uid, balance=user[1] + bot_prize - commission)
        add_commission(commission)
        update_battle_stats(uid, won=True, stars=winnings)
        result = 'win'
        result_text = f'🎉 Ты выиграл! +{winnings}⭐'
    elif bot_prize > player_prize:
        user = get_user(uid)
        update_user(uid, balance=user[1] - player_prize)
        update_battle_stats(uid, won=False, stars=player_prize)
        result = 'lose'
        result_text = f'😢 Ты проиграл! -{player_prize}⭐'
    else:
        commission = int(player_prize * 0.10)
        user = get_user(uid)
        update_user(uid, balance=user[1] - commission)
        add_commission(commission)
        update_battle_stats(uid, won=False, stars=commission)
        result = 'draw'
        result_text = f'🤝 Ничья! Ты получил {player_prize - commission}⭐'
    
    return jsonify({
        'result': result,
        'result_text': result_text,
        'player_prize': player_prize,
        'bot_prize': bot_prize,
        'commission': commission if result != 'win' else 0,
        'winnings': winnings if result == 'win' else 0
    })

@app.route('/check_room_status', methods=['POST', 'OPTIONS'])
def check_room_status():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    room_id = data.get('room_id')
    
    if room_id not in battle_rooms:
        return jsonify({'error': 'Комната не найдена'}), 404
    
    room = battle_rooms[room_id]
    p1 = get_user(room['players'][0])
    p2 = get_user(room['players'][1]) if len(room['players']) > 1 else None
    
    return jsonify({
        'opponent_joined': len(room['players']) >= 2,
        'player1': p1[8] if p1 else f"ID{room['players'][0]}",
        'player2': p2[8] if p2 else 'ОЖИДАНИЕ...',
        'room_exists': True,
        'players_count': len(room['players']),
        'case_type': room['case_type']
    })

@app.route('/sync_battle_preview', methods=['POST', 'OPTIONS'])
def sync_battle_preview():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    room_id = data.get('room_id')
    uid = data.get('user_id')
    
    if room_id not in battle_rooms:
        return jsonify({'error': 'Комната не найдена'}), 404
    
    room = battle_rooms[room_id]
    p1 = get_user(room['players'][0])
    p2 = get_user(room['players'][1]) if len(room['players']) > 1 else None
    
    if uid == room['players'][0]:
        me = p1[8] if p1 else f"ID{room['players'][0]}"
        opponent = p2[8] if p2 else 'ОЖИДАНИЕ...'
    else:
        me = p2[8] if p2 else f"ID{room['players'][1]}"
        opponent = p1[8] if p1 else 'ОЖИДАНИЕ...'
    
    return jsonify({
        'me': me,
        'opponent': opponent,
        'players_count': len(room['players']),
        'case_type': room['case_type'],
        'ready_status': battle_ready_status.get(room_id, [False, False])
    })

@app.route('/exit_battle_room_notify', methods=['POST', 'OPTIONS'])
def exit_battle_room_notify():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    room_id = data.get('room_id')
    
    if room_id not in battle_rooms:
        return jsonify({'error': 'Комната не найдена'}), 404
    
    room = battle_rooms[room_id]
    opponent_id = room['players'][1] if len(room['players']) > 1 else None
    
    del battle_rooms[room_id]
    
    return jsonify({
        'success': True,
        'opponent_left': True,
        'opponent_id': opponent_id
    })

@app.route('/get_user_room', methods=['POST', 'OPTIONS'])
def get_user_room():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    
    for rid, room in battle_rooms.items():
        if uid in room['players'] and room['status'] != 'finished':
            p1 = get_user(room['players'][0])
            p2 = get_user(room['players'][1]) if len(room['players']) > 1 else None
            return jsonify({
                'room_id': rid,
                'room': {
                    'case_type': room['case_type'],
                    'player1': p1[8] if p1 else f"ID{room['players'][0]}",
                    'player2': p2[8] if p2 else 'ОЖИДАНИЕ...',
                    'players_count': len(room['players'])
                }
            })
    
    return jsonify({'room_id': None})

# ===== ИСПРАВЛЕНО: START_BATTLE_OPENING (ЗАЩИТА ОТ ПОВТОРНОГО ЗАПУСКА) =====
def start_battle_opening(room_id):
    if room_id not in battle_rooms:
        print(f"⚠️ Комната {room_id} уже удалена")
        return
    
    room = battle_rooms.get(room_id)
    if not room:
        return
    
    if room.get('status') != 'active':
        print(f"⚠️ Битва в комнате {room_id} уже не активна")
        return
    
    case_type = room['case_type']
    players = room['players']
    p1 = players[0]
    p2 = players[1]
    
    p1_user = get_user(p1)
    p2_user = get_user(p2)
    if not p1_user or not p2_user:
        return
    
    prize1 = get_prize(case_type)
    prize2 = get_prize(case_type)
    
    if prize1 > prize2:
        winner = p1
        loser = p2
        winner_prize = prize1
        loser_prize = prize2
        is_draw = False
    elif prize2 > prize1:
        winner = p2
        loser = p1
        winner_prize = prize2
        loser_prize = prize1
        is_draw = False
    else:
        is_draw = True
        commission1 = int(prize1 * 0.10)
        commission2 = int(prize2 * 0.10)
        total_commission = commission1 + commission2
        user1 = get_user(p1)
        user2 = get_user(p2)
        update_user(p1, balance=user1[1] - commission1)
        update_user(p2, balance=user2[1] - commission2)
        add_commission(total_commission)
        update_battle_stats(p1, won=False, stars=commission1)
        update_battle_stats(p2, won=False, stars=commission2)
        
        draw_result = {
            'result': 'draw',
            'result_text': f'🤝 Ничья! Оба получили по {prize1 - commission1}⭐',
            'player1_prize': prize1,
            'player2_prize': prize2,
            'commission1': commission1,
            'commission2': commission2,
            'winner_id': None,
            'loser_id': None,
            'is_draw': True
        }
        battle_results[p1] = draw_result
        battle_results[p2] = draw_result
        
        del battle_rooms[room_id]
        return
    
    total_drop = winner_prize + loser_prize
    commission = int(total_drop * 0.10)
    winner_winnings = total_drop - commission
    winner_user = get_user(winner)
    loser_user = get_user(loser)
    update_user(winner, balance=winner_user[1] + winner_winnings)
    update_user(loser, balance=loser_user[1] - loser_prize)
    add_commission(commission)
    update_battle_stats(winner, won=True, stars=winner_winnings)
    update_battle_stats(loser, won=False, stars=loser_prize)
    
    result_data = {
        'result': 'win' if winner == p1 else 'lose',
        'result_text': f'🏆 Победитель получил {winner_winnings}⭐!',
        'player1_prize': prize1,
        'player2_prize': prize2,
        'winner_id': winner,
        'loser_id': loser,
        'winner_prize': winner_prize,
        'loser_prize': loser_prize,
        'commission': commission,
        'winner_winnings': winner_winnings,
        'is_draw': False
    }
    battle_results[p1] = result_data
    battle_results[p2] = result_data
    
    del battle_rooms[room_id]

@app.route('/get_battle_result', methods=['POST', 'OPTIONS'])
def get_battle_result():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    if uid in battle_results:
        result = battle_results[uid]
        del battle_results[uid]
        return jsonify(result)
    return jsonify({'pending': True})

@app.route('/get_battle_animation_data', methods=['POST', 'OPTIONS'])
def get_battle_animation_data():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    room_id = data.get('room_id')
    
    if room_id not in battle_rooms:
        return jsonify({'error': 'Комната не найдена'}), 404
    
    room = battle_rooms[room_id]
    if room['status'] != 'active':
        return jsonify({'error': 'Битва ещё не началась'}), 400
    
    p1 = get_user(room['players'][0])
    p2 = get_user(room['players'][1])
    
    return jsonify({
        'case_type': room['case_type'],
        'player1': p1[8] if p1 else f"ID{room['players'][0]}",
        'player2': p2[8] if p2 else f"ID{room['players'][1]}"
    })

# ===================== МИНЁР (ЭНДПОИНТЫ) =====================
@app.route('/start_mines_game', methods=['POST', 'OPTIONS'])
def start_mines_game():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    bet = data.get('bet')
    mines = data.get('mines')
    
    user = get_user(uid)
    if not user or user[1] < bet:
        return jsonify({'error': 'Недостаточно звёзд'}), 400
    if bet < 3 or bet > 1000:
        return jsonify({'error': 'Ставка от 3 до 1000⭐'}), 400
    if mines < 3 or mines > 8:
        return jsonify({'error': 'Мин от 3 до 8'}), 400
    
    update_user(uid, balance=user[1] - bet)
    
    board = [0] * 25
    positions = random.sample(range(25), mines)
    for pos in positions:
        board[pos] = 1
    
    game_id = int(time.time())
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
        'board': board,
        'opened': [0] * 25,
        'bet': bet,
        'mines': mines,
        'multiplier': 1.0
    })

@app.route('/open_mines_cell', methods=['POST', 'OPTIONS'])
def open_mines_cell():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    game_id = data.get('game_id')
    index = data.get('index')
    
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
        update_mines_stats(uid, won=False, multiplier=0, stars=0)
        return jsonify({
            'board': game['board'],
            'opened': game['opened'],
            'opened_count': game['opened_count'],
            'multiplier': 0,
            'game_over': True,
            'won': False,
            'bet': game['bet']
        })
    
    opened = game['opened_count']
    game['multiplier'] = get_mines_multiplier(opened, game['mines'])
    
    safe_cells = 25 - game['mines']
    if game['opened_count'] == safe_cells:
        raw_winnings = int(game['bet'] * game['multiplier'])
        final_winnings = min(raw_winnings, 5000)
        user = get_user(uid)
        update_user(uid, balance=user[1] + final_winnings, last_open=int(time.time()))
        game['status'] = 'won'
        update_mines_stats(uid, won=True, multiplier=game['multiplier'], stars=final_winnings)
        return jsonify({
            'board': game['board'],
            'opened': game['opened'],
            'opened_count': game['opened_count'],
            'multiplier': game['multiplier'],
            'game_over': True,
            'won': True,
            'winnings': final_winnings,
            'bet': game['bet']
        })
    
    return jsonify({
        'board': game['board'],
        'opened': game['opened'],
        'opened_count': game['opened_count'],
        'multiplier': game['multiplier'],
        'game_over': False,
        'won': False
    })

@app.route('/cashout_mines', methods=['POST', 'OPTIONS'])
def cashout_mines():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    game_id = data.get('game_id')
    
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
    update_user(uid, balance=user[1] + final_winnings)
    game['status'] = 'won'
    update_mines_stats(uid, won=True, multiplier=game['multiplier'], stars=final_winnings)
    
    del active_mines_games[game_id]
    
    return jsonify({
        'winnings': final_winnings,
        'multiplier': game['multiplier'],
        'game_over': True,
        'won': True
    })

@app.route('/exit_mines', methods=['POST', 'OPTIONS'])
def exit_mines():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    game_id = data.get('game_id')
    if game_id in active_mines_games:
        del active_mines_games[game_id]
    return jsonify({'success': True})

@app.route('/get_mines_stats', methods=['POST', 'OPTIONS'])
def get_mines_stats():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    cursor.execute("SELECT * FROM mines_stats WHERE user_id=?", (uid,))
    stats = cursor.fetchone()
    if not stats:
        return jsonify({'games': 0, 'wins': 0, 'losses': 0, 'best_multiplier': 1.0, 'total_won': 0, 'total_lost': 0})
    return jsonify({'games': stats[1], 'wins': stats[2], 'losses': stats[3], 'best_multiplier': stats[4], 'total_won': stats[5], 'total_lost': stats[6]})

# ===================== ОБЫЧНЫЕ КЕЙСЫ (ЭНДПОИНТЫ) =====================
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

@app.route('/get_prize', methods=['POST', 'OPTIONS'])
def get_prize_endpoint():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    case_type = data.get('case_type')
    if case_type not in CASE_RANGES:
        return jsonify({'error': 'Invalid case type'}), 400
    prize = get_prize(case_type)
    return jsonify({'prize': prize})

@app.route('/check_balance', methods=['POST', 'OPTIONS'])
def check_balance():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    user = get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    prices = {"free": 0, "mud": 5, "wood": 9, "stone": 19, "bronze": 49, "silver": 99, "gold": 249, "diamond": 499, "netherite": 999, "bedrock": 2499}
    price = prices.get(case_type, 0)
    if user[1] < price:
        return jsonify({'error': 'Недостаточно звёзд!', 'can_open': False}), 400
    if case_type == "free" and time.time() - user[4] < 7200:
        wait = int((7200 - (time.time() - user[4])) // 60)
        return jsonify({'error': f'Жди {wait} мин', 'can_open': False}), 400
    return jsonify({'can_open': True})

@app.route('/open_case', methods=['POST', 'OPTIONS'])
def open_case():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        case_type = data.get('case_type')
        
        user = get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        prices = {"free": 0, "mud": 5, "wood": 9, "stone": 19, "bronze": 49, "silver": 99, "gold": 249, "diamond": 499, "netherite": 999, "bedrock": 2499}
        price = prices.get(case_type, 0)
        if user[1] < price:
            return jsonify({'error': 'Недостаточно звёзд!'}), 400
        if case_type == "free" and time.time() - user[4] < 7200:
            wait = int((7200 - (time.time() - user[4])) // 60)
            return jsonify({'error': f'Жди {wait} мин'}), 400
        
        prize = get_prize(case_type)
        
        new_bal = user[1] - price + prize
        new_total = user[2] + 1
        new_streak = user[3] + 1
        if case_type == "free":
            update_user(user_id, balance=new_bal, total_cases=new_total, streak=new_streak, last_open=int(time.time()))
        else:
            update_user(user_id, balance=new_bal, total_cases=new_total, streak=new_streak)
        update_status(user_id, new_total)
        ad = random.choice(ads) if case_type == "free" and ads else ""
        return jsonify({'prize': prize, 'new_balance': new_bal, 'ad': ad})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_balance', methods=['POST', 'OPTIONS'])
def get_balance():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    user = get_user(data.get('user_id'))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'balance': user[1], 'total_cases': user[2], 'status': user[5], 'refs': user[6]})

@app.route('/withdraw_request', methods=['POST', 'OPTIONS'])
def withdraw_request():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    user_id = data.get('user_id')
    amount = data.get('amount')
    user = get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user[1] < amount:
        return jsonify({'error': f'Недостаточно звёзд. У тебя {user[1]}⭐'}), 400
    if amount < 1000:
        return jsonify({'error': 'Минимальная сумма вывода — 1000⭐'}), 400
    username = user[8] or "Неизвестный"
    try:
        bot.send_message(ADMIN_ID, f"💸 НОВАЯ ЗАЯВКА НА ВЫВОД!\n\n👤 Пользователь: @{username} (ID: {user_id})\n⭐ Сумма: {amount} звёзд\n💰 Баланс пользователя: {user[1]}⭐")
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check_balance_simple', methods=['POST', 'OPTIONS'])
def check_balance_simple():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    amount = data.get('amount', 0)
    user = get_user(uid)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'has_enough': user[1] >= amount})

@app.route('/get_battle_data', methods=['POST', 'OPTIONS'])
def get_battle_data():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    cursor.execute("SELECT * FROM battle_stats WHERE user_id=?", (uid,))
    stats = cursor.fetchone()
    wins = stats[2] if stats else 0
    losses = stats[3] if stats else 0
    commission = stats[6] if stats else 0
    active = []
    for bid, battle in active_battles.items():
        if (battle['player1'] == uid or battle['player2'] == uid) and battle['status'] != 'finished':
            p1 = get_user(battle['player1'])
            p2 = get_user(battle['player2'])
            active.append({
                'id': bid,
                'player1': p1[8] if p1 else str(battle['player1']),
                'player2': p2[8] if p2 else str(battle['player2']),
                'case_type': battle['case_type'],
                'status': battle['status']
            })
    history = []
    for bid, battle in list(active_battles.items()):
        if battle['status'] == 'finished' and (battle['player1'] == uid or battle['player2'] == uid):
            if battle['winner_id'] == uid:
                won = True
                stars = battle['prize1'] if battle['player1'] == uid else battle['prize2']
            else:
                won = False
                stars = battle['prize2'] if battle['player1'] == uid else battle['prize1']
            opponent = battle['player2'] if battle['player1'] == uid else battle['player1']
            opp_user = get_user(opponent)
            history.append({
                'won': won,
                'stars': stars,
                'opponent': opp_user[8] if opp_user else str(opponent)
            })
    return jsonify({'wins': wins, 'losses': losses, 'commission': commission, 'active_battles': active, 'history': history})

@app.route('/create_battle', methods=['POST', 'OPTIONS'])
def create_battle():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    username = data.get('username')
    target = get_user_by_username(username)
    if not target:
        return jsonify({'error': 'Пользователь не найден'}), 404
    if target[0] == uid:
        return jsonify({'error': 'Нельзя вызвать себя'}), 400
    for bid, battle in active_battles.items():
        if (battle['player1'] == uid or battle['player2'] == uid) and battle['status'] != 'finished':
            return jsonify({'error': 'У тебя уже есть активная битва'}), 400
    battle_id = int(time.time())
    battle_data = {
        'id': battle_id,
        'player1': uid,
        'player2': target[0],
        'case_type': None,
        'status': 'waiting',
        'winner_id': None,
        'prize1': None,
        'prize2': None,
        'bet': 0,
        'created_at': time.time(),
        'finished_at': None,
        'player1_ready': False,
        'player2_ready': False
    }
    active_battles[battle_id] = battle_data
    pending_battles[target[0]] = battle_data
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("⚔️ ПРИНЯТЬ БОЙ", callback_data=f"battle_accept_{battle_id}"), InlineKeyboardButton("❌ ОТКЛОНИТЬ", callback_data=f"battle_decline_{battle_id}"))
    user = get_user(uid)
    bot.send_message(target[0], f"⚔️ @{user[8]} вызывает тебя на БИТВУ КЕЙСОВ!\n\n🔥 Без ставок! Победитель забирает свой дроп + дроп соперника - 10% комиссии", reply_markup=kb)
    return jsonify({'success': True})

@app.route('/get_pending_battles', methods=['POST', 'OPTIONS'])
def get_pending_battles():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    battles = []
    for bid, battle in pending_battles.items():
        if battle['player2'] == uid and battle['status'] == 'waiting':
            user = get_user(battle['player1'])
            battles.append({'id': bid, 'username': user[8] if user else str(battle['player1'])})
    return jsonify({'battles': battles})

@app.route('/accept_battle', methods=['POST', 'OPTIONS'])
def accept_battle():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.get_json()
    uid = data.get('user_id')
    battle_id = data.get('battle_id')
    battle = active_battles.get(battle_id)
    if not battle:
        return jsonify({'error': 'Битва не найдена'}), 404
    if battle['player2'] != uid:
        return jsonify({'error': 'Не твой вызов'}), 403
    battle['status'] = 'case_selection'
    kb = InlineKeyboardMarkup(row_width=3)
    kb.add(
        InlineKeyboardButton("🟫 Грязь", callback_data=f"battle_case_{battle_id}_mud"),
        InlineKeyboardButton("🌳 Дерево", callback_data=f"battle_case_{battle_id}_wood"),
        InlineKeyboardButton("🪨 Камень", callback_data=f"battle_case_{battle_id}_stone"),
        InlineKeyboardButton("🥉 Бронза", callback_data=f"battle_case_{battle_id}_bronze"),
        InlineKeyboardButton("🔘 Серебро", callback_data=f"battle_case_{battle_id}_silver"),
        InlineKeyboardButton("👑 Золото", callback_data=f"battle_case_{battle_id}_gold"),
        InlineKeyboardButton("💎 Алмаз", callback_data=f"battle_case_{battle_id}_diamond"),
        InlineKeyboardButton("🔥 Незерит", callback_data=f"battle_case_{battle_id}_netherite"),
        InlineKeyboardButton("⛏️ Бедрок", callback_data=f"battle_case_{battle_id}_bedrock")
    )
    for player_id in [battle['player1'], battle['player2']]:
        bot.send_message(player_id, "⚔️ **ВЫБЕРИТЕ КЕЙС ДЛЯ БИТВЫ:**\nВажно выбрать ОДИНАКОВЫЙ кейс!", reply_markup=kb)
    return jsonify({'success': True})

# ===================== ЗАПУСК =====================
if __name__ == "__main__":
    import threading
    print("✅ БОТ ЗАПУЩЕН (POLLING MODE)")
    bot.remove_webhook()
    
    def run_flask():
        app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
    
    threading.Thread(target=run_flask, daemon=True).start()
    bot.polling(none_stop=True, interval=0)
