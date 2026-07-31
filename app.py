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
    status TEXT DEFAULT 'Новичок',
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
    "free": {"common": (1, 1), "rare": (2, 2), "epic": (3, 3), "legendary": (100, 100), "legendary_chance": 0.0001},
    "wood": {"common": (20, 30), "rare": (30, 40), "epic": (40, 60), "legendary": (200, 200), "legendary_chance": 0.0001},
    "silver": {"common": (40, 60), "rare": (60, 80), "epic": (80, 120), "legendary": (500, 500), "legendary_chance": 0.0001},
    "gold": {"common": (150, 200), "rare": (200, 300), "epic": (300, 500), "legendary": (1000, 1000), "legendary_chance": 0.0001},
    "diamond": {"common": (350, 500), "rare": (500, 800), "epic": (800, 1200), "legendary": (2000, 2000), "legendary_chance": 0.0001},
    "netherite": {"common": (1000, 2000), "rare": (2000, 4000), "epic": (4000, 8000), "legendary": (25000, 25000), "legendary_chance": 0.0001}
}

def get_prize(case_type):
    data = CASE_RANGES[case_type]
    rnd = random.random()
    if rnd < data["legendary_chance"]:
        return random.randint(data["legendary"][0], data["legendary"][1])
    if case_type == "free":
        if rnd < 0.6:
            return 1
        elif rnd < 0.85:
            return 2
        elif rnd < 0.95:
            return 3
        else:
            return 5
    if rnd < 0.6:
        return random.randint(data["common"][0], data["common"][1])
    elif rnd < 0.9:
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
    kb.add(InlineKeyboardButton("🎮 Открыть приложение", web_app=WebAppInfo("https://randevu-bot-production.up.railway.app")))
    kb.add(InlineKeyboardButton("💳 Пополнить звёзды", callback_data="topup"))
    bot.send_message(msg.chat.id, "Добро пожаловать в RANDEVU!", reply_markup=kb)

@bot.callback_query_handler(func=lambda call: call.data == "topup")
def topup_callback(call):
    bot.answer_callback_query(call.id)
    bot.send_message(call.message.chat.id, "💳 Введите сумму пополнения (от 50 до 5000⭐):")
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

    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("🔙 Назад", callback_data="cancel_topup"))

    bot.send_invoice(
        chat_id=uid,
        title=f"Пополнение на {amount}⭐",
        description=f"Ты получишь {amount} внутриигровых звёзд.",
        invoice_payload=f"stars_{uid}_{int(time.time())}",
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice(label=f"{amount} Stars", amount=amount)],
        start_parameter="buy_stars",
        reply_markup=kb
    )

@bot.callback_query_handler(func=lambda call: call.data == "cancel_topup")
def cancel_topup(call):
    bot.answer_callback_query(call.id)
    bot.send_message(call.message.chat.id, "❌ Пополнение отменено.")

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

@app.route('/check_balance', methods=['POST'])
def check_balance():
    data = request.get_json()
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    user = get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    prices = {"free":0, "silver":50, "gold":200, "wood":30, "diamond":500, "netherite":2000}
    price = prices.get(case_type, 0)
    if user[1] < price:
        return jsonify({'error': 'Недостаточно звёзд!', 'can_open': False}), 400
    if case_type == "free" and time.time() - user[4] < 14400:
        wait = int((14400 - (time.time() - user[4])) // 60)
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
        prices = {"free":0, "silver":50, "gold":200, "wood":30, "diamond":500, "netherite":2000}
        price = prices.get(case_type, 0)
        if user[1] < price:
            return jsonify({'error': 'Недостаточно звёзд!'}), 400
        if case_type == "free":
            if time.time() - user[4] < 14400:
                wait = int((14400 - (time.time() - user[4])) // 60)
                return jsonify({'error': f'Жди {wait} мин'}), 400
        prize = get_prize(case_type)
        new_bal = user[1] - price + prize
        if case_type == "free":
            new_total = user[2] + 1
            new_streak = user[3] + 1
            status = "Новичок"
            if new_total >= 30:
                status = "Легенда"
            elif new_streak >= 7:
                status = "Мастер фортуны"
            elif new_streak >= 3:
                status = "Сталкер халявы"
            elif new_total >= 10:
                status = "Везунчик"
            elif new_total >= 5:
                status = "Кейс-охотник"
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
    threading.Thread(target=bot.polling, kwargs={'none_stop': True}).start()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
