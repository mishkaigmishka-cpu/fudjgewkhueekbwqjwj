import telebot
import random
import sqlite3
import time
import threading
import os
from flask import Flask, request, jsonify, send_from_directory
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, LabeledPrice, PreCheckoutQuery, WebAppInfo

TOKEN = os.environ.get("TELEGRAM_TOKEN")
if not TOKEN:
    raise ValueError("TELEGRAM_TOKEN не установлен!")

ADMIN_ID = 7819642052
BOT_USERNAME = "Randevucase_bot"

bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

conn = sqlite3.connect('cases.db', check_same_thread=False)
cursor = conn.cursor()

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

ads = ["💎 Крипто-обменник: https://t.me/exchange", "🎁 Халява каждый день: https://t.me/free_stuff", "🔥 Скины со скидкой: https://t.me/skins"]

CASE_RANGES = {
    "free": {
        "common": (1, 2),
        "rare": (3, 4),
        "epic": (5, 10),
        "legendary": (100, 100),
        "jackpot": (1000, 1000),
        "common_chance": 0.5999,
        "rare_chance": 0.2999,
        "epic_chance": 0.0999,
        "legendary_chance": 0.0001,
        "jackpot_chance": 0.000000001
    },
    "mud": {
        "common": (1, 3),
        "rare": (3, 5),
        "epic": (5, 7),
        "legendary": (50, 50),
        "jackpot": (500, 500),
        "common_chance": 0.1499,
        "rare_chance": 0.65,
        "epic_chance": 0.19999,
        "legendary_chance": 0.00000001,
        "jackpot_chance": 0.000000001
    },
    "wood": {
        "common": (1, 5),
        "rare": (5, 10),
        "epic": (10, 15),
        "legendary": (1000, 1000),
        "jackpot": (10000, 10000),
        "common_chance": 0.2499,
        "rare_chance": 0.6499,
        "epic_chance": 0.0999,
        "legendary_chance": 0.00000001,
        "jackpot_chance": 0.000000001
    },
    "stone": {
        "common": (10, 15),
        "rare": (15, 23),
        "epic": (23, 35),
        "legendary": (2500, 2500),
        "jackpot": (25000, 25000),
        "common_chance": 0.2499,
        "rare_chance": 0.6499,
        "epic_chance": 0.0999,
        "legendary_chance": 0.000001,
        "jackpot_chance": 0.000000001
    },
    "bronze": {
        "common": (20, 30),
        "rare": (30, 50),
        "epic": (50, 75),
        "legendary": (5000, 5000),
        "jackpot": (50000, 50000),
        "common_chance": 0.2499,
        "rare_chance": 0.6499,
        "epic_chance": 0.09999999,
        "legendary_chance": 0.000000001,
        "jackpot_chance": 0.000000001
    },
    "silver": {
        "common": (40, 70),
        "rare": (70, 100),
        "epic": (100, 150),
        "legendary": (10000, 10000),
        "jackpot": (100000, 100000),
        "common_chance": 0.2499,
        "rare_chance": 0.6749,
        "epic_chance": 0.0749,
        "legendary_chance": 0.000000001,
        "jackpot_chance": 0.000000001
    },
    "gold": {
        "common": (75, 150),
        "rare": (150, 250),
        "epic": (250, 400),
        "legendary": (25000, 25000),
        "jackpot": (250000, 250000),
        "common_chance": 0.2499,
        "rare_chance": 0.6749,
        "epic_chance": 0.0749,
        "legendary_chance": 0.00000001,
        "jackpot_chance": 0.000000001
    },
    "diamond": {
        "common": (299, 349),
        "rare": (349, 500),
        "epic": (500, 1000),
        "legendary": (50000, 50000),
        "jackpot": (500000, 500000),
        "common_chance": 0.2749,
        "rare_chance": 0.6499,
        "epic_chance": 0.0749,
        "legendary_chance": 0.00000001,
        "jackpot_chance": 0.000000001
    },
    "netherite": {
        "common": (500, 750),
        "rare": (750, 1000),
        "epic": (1000, 1500),
        "legendary": (100000, 100000),
        "jackpot": (1000000, 1000000),
        "common_chance": 0.7,
        "rare_chance": 0.25,
        "epic_chance": 0.04999,
        "legendary_chance": 0.000001,
        "jackpot_chance": 0.000000001
    },
    "bedrock": {
        "common": (250, 2500),
        "rare": (2500, 5000),
        "epic": (250000, 250000),
        "legendary": (2500000, 2500000),
        "common_chance": 0.99999,
        "rare_chance": 0.0000001,
        "epic_chance": 0.000001,
        "legendary_chance": 0.000000001,
        "jackpot_chance": 0.000000001
    }
}

def get_prize(case_type):
    data = CASE_RANGES[case_type]
    rnd = random.random()
    
    if case_type == "mud":
        if rnd < data["jackpot_chance"]:
            return random.randint(data["jackpot"][0], data["jackpot"][1])
        elif rnd < data["jackpot_chance"] + data["legendary_chance"]:
            return random.randint(data["legendary"][0], data["legendary"][1])
        elif rnd < data["common_chance"]:
            return random.randint(data["common"][0], data["common"][1])
        elif rnd < data["common_chance"] + data["rare_chance"]:
            return random.randint(data["rare"][0], data["rare"][1])
        else:
            return random.randint(data["epic"][0], data["epic"][1])
    
    # Остальные кейсы
    if rnd < data["jackpot_chance"]:
        return random.randint(data["jackpot"][0], data["jackpot"][1])
    elif rnd < data["jackpot_chance"] + data["legendary_chance"]:
        return random.randint(data["legendary"][0], data["legendary"][1])
    elif rnd < data["common_chance"]:
        return random.randint(data["common"][0], data["common"][1])
    elif rnd < data["common_chance"] + data["rare_chance"]:
        return random.randint(data["rare"][0], data["rare"][1])
    else:
        return random.randint(data["epic"][0], data["epic"][1])

def get_user(uid):
    cursor.execute("SELECT * FROM users WHERE id=?", (uid,))
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

def is_already_invited(inviter_id, invited_id):
    cursor.execute("SELECT * FROM invited WHERE inviter_id=? AND invited_id=?", (inviter_id, invited_id))
    return cursor.fetchone() is not None

def add_invited(inviter_id, invited_id):
    cursor.execute("INSERT OR IGNORE INTO invited (inviter_id, invited_id) VALUES (?, ?)", (inviter_id, invited_id))
    conn.commit()

PROMO_CODE = "RANDEVU50"

@bot.message_handler(commands=['start'])
def start(msg):
    uid = msg.from_user.id
    username = msg.from_user.username or ""
    args = msg.text.split()

    cursor.execute("INSERT OR IGNORE INTO users (id) VALUES (?)", (uid,))
    conn.commit()
    user = get_user(uid)
    if not user:
        return

    if len(args) > 1:
        try:
            inviter_id = int(args[1])
            if inviter_id != uid and not is_already_invited(inviter_id, uid):
                add_invited(inviter_id, uid)
                inviter = get_user(inviter_id)
                if inviter:
                    new_bal_inviter = inviter[1] + 30
                    update_user(inviter_id, balance=new_bal_inviter, refs=inviter[6] + 1)
                    try:
                        bot.send_message(inviter_id, f"⭐ Ты получил 30 звёзд за приглашение @{username}!")
                    except:
                        pass

                    new_bal_user = user[1] + 50
                    update_user(uid, balance=new_bal_user)
                    try:
                        bot.send_message(uid, f"🎉 Ты получил 50 звёзд за регистрацию по ссылке!")
                    except:
                        pass
        except:
            pass

    update_user(uid, username=username)
    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton("🎮 Открыть кейсы", web_app=WebAppInfo("https://randevu-bot-production.up.railway.app")))
    kb.add(InlineKeyboardButton("💳 Пополнить звёзды", callback_data="topup"))
    bot.send_message(msg.chat.id, "Добро пожаловать в RANDEVU!", reply_markup=kb)

@bot.callback_query_handler(func=lambda call: call.data == "topup")
def topup_callback(call):
    bot.answer_callback_query(call.id)
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("🔙 Назад", callback_data="cancel_topup"))
    bot.send_message(
        call.message.chat.id,
        "💳 Введите сумму пополнения (от 50 до 5000⭐):",
        reply_markup=kb
    )
    bot.register_next_step_handler(call.message, process_topup_amount)

def process_topup_amount(msg):
    uid = msg.from_user.id
    try:
        amount = int(msg.text.strip())
    except:
        bot.reply_to(msg, "❌ Введите число!")
        return

    if amount < 50 or amount > 5000:
        bot.reply_to(msg, "❌ Сумма должна быть от 50 до 5000⭐!")
        return

    bot.send_invoice(
        chat_id=uid,
        title=f"Пополнение на {amount}⭐",
        description=f"Ты получишь {amount} внутриигровых звёзд.",
        invoice_payload=f"stars_{uid}_{int(time.time())}",
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice(label=f"{amount} Stars", amount=amount)],
        start_parameter="buy_stars"
    )

@bot.callback_query_handler(func=lambda call: call.data == "cancel_topup")
def cancel_topup(call):
    bot.answer_callback_query(call.id)
    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton("🎮 Открыть кейсы", web_app=WebAppInfo("https://randevu-bot-production.up.railway.app")))
    kb.add(InlineKeyboardButton("💳 Пополнить звёзды", callback_data="topup"))
    bot.edit_message_text(
        "Добро пожаловать в RANDEVU!",
        chat_id=call.message.chat.id,
        message_id=call.message.message_id,
        reply_markup=kb
    )

@bot.pre_checkout_query_handler(func=lambda query: True)
def handle_pre_checkout(query):
    bot.answer_pre_checkout_query(query.id, ok=True)

@bot.message_handler(content_types=['successful_payment'])
def handle_payment(message):
    uid = message.from_user.id
    amount = message.successful_payment.total_amount
    user = get_user(uid)
    if user:
        new_bal = user[1] + amount
        update_user(uid, balance=new_bal)
        bot.send_message(uid, f"✅ Пополнено на {amount}⭐\n💰 Новый баланс: {new_bal}⭐")

@bot.message_handler(commands=['promo'])
def promo_handler(msg):
    uid = msg.from_user.id
    args = msg.text.split()
    if len(args) < 2:
        bot.reply_to(msg, "❌ Введи промокод: /promo RANDEVU50")
        return
    code = args[1]
    if code != PROMO_CODE:
        bot.reply_to(msg, "❌ Неверный промокод!")
        return
    user = get_user(uid)
    if not user:
        bot.reply_to(msg, "Напиши /start")
        return
    if user[9] == 1:
        bot.reply_to(msg, "❌ Ты уже использовал промокод!")
        return
    new_bal = user[1] + 50
    update_user(uid, balance=new_bal, promo_used=1)
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
        new_bal = user[1] + amount
        update_user(msg.from_user.id, balance=new_bal)
        bot.reply_to(msg, f"✅ Ты получил {amount}⭐\n💰 Баланс: {new_bal}⭐")

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
    new_bal = user[1] + amount
    update_user(user[0], balance=new_bal)
    bot.reply_to(msg, f"✅ @{username} получил {amount}⭐\n💰 Баланс: {new_bal}⭐")

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

@app.route('/check_balance', methods=['POST'])
def check_balance():
    data = request.get_json()
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    user = get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    prices = {
        "free": 0,
        "mud": 5,
        "wood": 9,
        "stone": 19,
        "bronze": 49,
        "silver": 99,
        "gold": 249,
        "diamond": 499,
        "netherite": 999,
        "bedrock": 2499
    }
    price = prices.get(case_type, 0)
    if user[1] < price:
        return jsonify({'error': 'Недостаточно звёзд!', 'can_open': False}), 400
    if case_type == "free" and time.time() - user[4] < 7200:
        wait = int((7200 - (time.time() - user[4])) // 60)
        return jsonify({'error': f'Жди {wait} мин', 'can_open': False}), 400
    return jsonify({'can_open': True})

@app.route('/open_case', methods=['POST'])
def open_case():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        case_type = data.get('case_type')
        user = get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        prices = {
            "free": 0,
            "mud": 5,
            "wood": 9,
            "stone": 19,
            "bronze": 49,
            "silver": 99,
            "gold": 249,
            "diamond": 499,
            "netherite": 999,
            "bedrock": 2499
        }
        price = prices.get(case_type, 0)
        if user[1] < price:
            return jsonify({'error': 'Недостаточно звёзд!'}), 400
        if case_type == "free":
            if time.time() - user[4] < 7200:
                wait = int((7200 - (time.time() - user[4])) // 60)
                return jsonify({'error': f'Жди {wait} мин'}), 400
        prize = get_prize(case_type)
        new_bal = user[1] - price + prize
        if case_type == "free":
            new_total = user[2] + 1
            new_streak = user[3] + 1
            
            if new_total >= 100:
                status = "👑 Легенда"
            elif new_total >= 50:
                status = "🟣 Мастер фортуны"
            elif new_total >= 30:
                status = "🔴 Сталкер халявы"
            elif new_total >= 10:
                status = "🟠 Везунчик"
            elif new_total >= 5:
                status = "🟡 Кейс-охотник"
            else:
                status = "🟢 Новичок"
            
            update_user(user_id, balance=new_bal, total_cases=new_total, streak=new_streak, last_open=int(time.time()), status=status)
        else:
            update_user(user_id, balance=new_bal)
        ad = random.choice(ads) if case_type == "free" and ads else ""
        return jsonify({'prize': prize, 'new_balance': new_bal, 'ad': ad})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_balance', methods=['POST'])
def get_balance():
    data = request.get_json()
    user = get_user(data.get('user_id'))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'balance': user[1], 'total_cases': user[2], 'status': user[5], 'refs': user[6]})

@app.route('/withdraw_request', methods=['POST'])
def withdraw_request():
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

if __name__ == "__main__":
    print("✅ БОТ ЗАПУЩЕН (ВЕБ-ХУК)")
    bot.remove_webhook()
    bot.set_webhook(url="https://randevu-bot-production.up.railway.app/webhook")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
