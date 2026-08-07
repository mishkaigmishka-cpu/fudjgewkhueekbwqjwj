import os
import sqlite3
import random
import time
import threading
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = 'database.db'
logging.basicConfig(level=logging.INFO)

# ============================
# ИНИЦИАЛИЗАЦИЯ БД
# ============================
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        balance INTEGER DEFAULT 5,
        total_cases INTEGER DEFAULT 0,
        refs INTEGER DEFAULT 0,
        status TEXT DEFAULT '🟢 Новичок',
        last_free_case_time INTEGER DEFAULT 0
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS battle_rooms (
        room_id TEXT PRIMARY KEY,
        creator_id INTEGER,
        player1_id INTEGER,
        player2_id INTEGER DEFAULT 0,
        case_type TEXT,
        status TEXT DEFAULT 'waiting',
        player1_ready INTEGER DEFAULT 0,
        player2_ready INTEGER DEFAULT 0,
        player1_prize INTEGER DEFAULT 0,
        player2_prize INTEGER DEFAULT 0,
        winner_id INTEGER DEFAULT 0,
        created_at INTEGER
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS battle_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        opponent TEXT,
        stars INTEGER,
        won INTEGER,
        timestamp INTEGER
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS battle_stats (
        user_id INTEGER PRIMARY KEY,
        battles_played INTEGER DEFAULT 0,
        battles_won INTEGER DEFAULT 0,
        battles_lost INTEGER DEFAULT 0,
        total_won_stars INTEGER DEFAULT 0,
        total_lost_stars INTEGER DEFAULT 0,
        commission_paid INTEGER DEFAULT 0
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS mines_games (
        game_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        bet INTEGER,
        mines INTEGER,
        opened INTEGER DEFAULT 0,
        multiplier REAL DEFAULT 1.0,
        board TEXT,
        opened_cells TEXT,
        active INTEGER DEFAULT 1,
        won INTEGER DEFAULT 0,
        winnings INTEGER DEFAULT 0,
        created_at INTEGER
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS crash_games (
        game_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        bet INTEGER,
        multiplier REAL DEFAULT 1.0,
        status TEXT DEFAULT 'active',
        winnings INTEGER DEFAULT 0,
        created_at INTEGER
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS mines_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        best_multiplier REAL DEFAULT 1.0
    )''')
    c.execute("INSERT OR IGNORE INTO mines_stats (id, games, wins, losses, best_multiplier) VALUES (1, 0, 0, 0, 1.0)")
    
    c.execute('''CREATE TABLE IF NOT EXISTS crash_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        best_multiplier REAL DEFAULT 1.0
    )''')
    c.execute("INSERT OR IGNORE INTO crash_stats (id, games, wins, losses, best_multiplier) VALUES (1, 0, 0, 0, 1.0)")
    
    c.execute('''CREATE TABLE IF NOT EXISTS system_balance (
        id INTEGER PRIMARY KEY,
        balance INTEGER DEFAULT 0
    )''')
    c.execute("INSERT OR IGNORE INTO system_balance (id, balance) VALUES (1, 0)")
    
    c.execute('''CREATE TABLE IF NOT EXISTS commission_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount INTEGER,
        timestamp INTEGER
    )''')
    
    conn.commit()
    conn.close()

init_db()

# ============================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ============================
def get_user(user_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return {
            'user_id': row[0],
            'balance': row[1],
            'total_cases': row[2],
            'refs': row[3],
            'status': row[4],
            'last_free_case_time': row[5]
        }
    return None

def create_user(user_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO users (user_id, balance, total_cases, refs, status, last_free_case_time) VALUES (?, 5, 0, 0, '🟢 Новичок', 0)", (user_id,))
    conn.commit()
    conn.close()

def update_balance(user_id, amount):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE users SET balance = balance + ? WHERE user_id = ?", (amount, user_id))
    conn.commit()
    conn.close()

def get_status(total_cases):
    if total_cases >= 5000: return '👑 Легенда'
    if total_cases >= 1000: return '💎 Алмаз'
    if total_cases >= 500: return '🥇 Золото'
    if total_cases >= 100: return '🥈 Серебро'
    if total_cases >= 25: return '🥉 Бронза'
    if total_cases >= 5: return '🟢 Новичок'
    return '🟢 Новичок'

def generate_room_id():
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def add_commission(amount):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE system_balance SET balance = balance + ? WHERE id = 1", (amount,))
    c.execute("INSERT INTO commission_log (amount, timestamp) VALUES (?, ?)", (amount, int(time.time())))
    conn.commit()
    conn.close()

def update_battle_stats(user_id, won, stars):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM battle_stats WHERE user_id = ?", (user_id,))
    stats = c.fetchone()
    if not stats:
        c.execute('''INSERT INTO battle_stats 
                    (user_id, battles_played, battles_won, battles_lost, total_won_stars, total_lost_stars, commission_paid)
                    VALUES (?, 1, ?, 0, ?, 0, 0)''',
                    (user_id, 1 if won else 0, stars if won else 0))
    else:
        battles_played = stats[1] + 1
        battles_won = stats[2] + (1 if won else 0)
        battles_lost = stats[3] + (0 if won else 1)
        total_won_stars = stats[4] + (stars if won else 0)
        total_lost_stars = stats[5] + (0 if won else stars)
        c.execute('''UPDATE battle_stats SET 
                    battles_played=?, battles_won=?, battles_lost=?, 
                    total_won_stars=?, total_lost_stars=?
                    WHERE user_id=?''', 
                    (battles_played, battles_won, battles_lost, total_won_stars, total_lost_stars, user_id))
    conn.commit()
    conn.close()

def update_mines_stats(user_id, won, multiplier, stars):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM mines_stats WHERE user_id=?", (user_id,))
    stats = c.fetchone()
    if not stats:
        c.execute('''INSERT INTO mines_stats 
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
        c.execute('''UPDATE mines_stats SET 
                    games=?, wins=?, losses=?, best_multiplier=?, total_won=?, total_lost=?
                    WHERE user_id=?''',
                    (games, wins, losses, best_multiplier, total_won, total_lost, user_id))
    conn.commit()
    conn.close()

def update_crash_stats(user_id, won, multiplier, stars):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM crash_stats WHERE user_id=?", (user_id,))
    stats = c.fetchone()
    if not stats:
        c.execute('''INSERT INTO crash_stats 
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
        c.execute('''UPDATE crash_stats SET 
                    games=?, wins=?, losses=?, best_multiplier=?, total_won=?, total_lost=?
                    WHERE user_id=?''',
                    (games, wins, losses, best_multiplier, total_won, total_lost, user_id))
    conn.commit()
    conn.close()

def get_battle_room(room_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM battle_rooms WHERE room_id = ?", (room_id,))
    row = c.fetchone()
    conn.close()
    if row:
        return {
            'room_id': row[0],
            'creator_id': row[1],
            'player1_id': row[2],
            'player2_id': row[3],
            'case_type': row[4],
            'status': row[5],
            'player1_ready': row[6],
            'player2_ready': row[7],
            'player1_prize': row[8],
            'player2_prize': row[9],
            'winner_id': row[10],
            'created_at': row[11]
        }
    return None

def delete_battle_room(room_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM battle_rooms WHERE room_id = ?", (room_id,))
    conn.commit()
    conn.close()

def get_user_room(user_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT room_id FROM battle_rooms WHERE (player1_id = ? OR player2_id = ?) AND status = 'waiting'", (user_id, user_id))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None

# ============================
# КОНФИГ КЕЙСОВ
# ============================
CASE_PRICES = {
    'free': 0, 'mud': 5, 'wood': 9, 'stone': 19,
    'bronze': 49, 'silver': 99, 'gold': 249,
    'diamond': 499, 'netherite': 999, 'bedrock': 2499
}

CASE_PRIZES = {
    'free': [1,2,3,4,5,6,7,8,9,10,100,1000],
    'mud': [1,2,3,4,5,6,7,10,12,13,16,18,20,22,24,27,50,500],
    'wood': [2,4,5,6,7,8,9,10,12,13,15,20,50,100,500,1000],
    'stone': [11,13,15,16,17,18,19,21,23,24,25,30,50,100,250,500,1000,2500],
    'bronze': [20,25,30,35,40,45,50,55,60,65,75,100,222,333,444,555,1000,1500,2000,5000],
    'silver': [40,50,60,70,80,90,100,110,120,130,140,150,200,250,333,444,555,666,777,888,999,1488,2011,5000,10000],
    'gold': [75,100,150,169,190,220,251,300,400,500,777,999,1000,2000,5000,10000,12500,25000],
    'diamond': [250,300,333,350,444,505,1000,1488,2222,2500,5000,10000,12500,25000,50000],
    'netherite': [500,550,600,650,700,750,800,850,900,950,1000,1500,2000,2500,3000,3200,3500,4000,5000,10000,15000,20000,25000],
    'bedrock': [1000,1200,1400,1600,1800,2000,2200,2400,2500,2600,2800,3000,3200,3500,4000,4500,5000,5500,6000,7000,8000,9000,10000,12000,15000,18000,20000,22000,25000,28000,30000,50000,100000]
}

def get_prize(case_type, user_id=None):
    prizes = CASE_PRIZES.get(case_type, [1, 10, 100])
    return random.choice(prizes)

# ============================
# МНОЖИТЕЛИ МИНЁРА
# ============================
def get_mines_multiplier(opened, mines):
    multipliers = {
        3: {1:1.05, 2:1.15, 3:1.30, 4:1.50, 5:1.75, 6:2.10, 7:2.50, 8:3.00, 9:3.50, 10:4.20, 11:5.00, 12:6.00},
        4: {1:1.10, 2:1.20, 3:1.40, 4:1.70, 5:2.00, 6:2.40, 7:3.00, 8:3.80, 9:4.50, 10:5.50, 11:6.50, 12:8.00},
        5: {1:1.15, 2:1.30, 3:1.55, 4:1.90, 5:2.30, 6:2.80, 7:3.50, 8:4.50, 9:5.50, 10:6.50, 11:8.00, 12:10.00},
        6: {1:1.20, 2:1.40, 3:1.70, 4:2.10, 5:2.60, 6:3.20, 7:4.00, 8:5.00, 9:6.50, 10:8.00, 11:10.00, 12:12.00},
        7: {1:1.25, 2:1.50, 3:1.85, 4:2.30, 5:2.90, 6:3.60, 7:4.50, 8:5.50, 9:7.50, 10:9.00, 11:12.00, 12:15.00},
        8: {1:1.30, 2:1.60, 3:2.00, 4:2.50, 5:3.20, 6:4.00, 7:5.00, 8:6.50, 9:8.50, 10:10.00, 11:14.00, 12:18.00}
    }
    return multipliers.get(mines, {}).get(opened, 1.00)

# ============================
# КРАШ
# ============================
crash_data = {
    'active': False,
    'multiplier': 1.00,
    'crashed': False,
    'start_time': 0,
    'crash_point': 1.20,
    'bets': {},
    'round_id': 0
}

def generate_crash_point():
    rnd = random.random()
    if rnd < 0.60:
        return round(1.10 + random.random() * 0.40, 2)  # 1.10-1.50 (60%)
    elif rnd < 0.85:
        return round(1.50 + random.random() * 1.00, 2)  # 1.50-2.50 (25%)
    elif rnd < 0.95:
        return round(2.50 + random.random() * 2.50, 2)  # 2.50-5.00 (10%)
    else:
        return round(5.00 + random.random() * 7.00, 2)  # 5.00-12.00 (5%)

def get_crash_multiplier(elapsed):
    if elapsed < 1.0:
        return round(1.00 + elapsed * 0.20, 2)
    elif elapsed < 3.0:
        return round(1.20 + (elapsed - 1.0) * 0.10, 2)
    elif elapsed < 6.0:
        return round(1.40 + (elapsed - 3.0) * 0.07, 2)
    elif elapsed < 10.0:
        return round(1.61 + (elapsed - 6.0) * 0.05, 2)
    else:
        return round(1.81 + (elapsed - 10.0) * 0.03, 2)

def crash_timer():
    global crash_data
    while True:
        if crash_data['active'] and not crash_data['crashed']:
            elapsed = time.time() - crash_data['start_time']
            crash_data['multiplier'] = get_crash_multiplier(elapsed)
            
            if crash_data['multiplier'] >= crash_data['crash_point']:
                crash_data['crashed'] = True
                crash_data['active'] = False
                
                for uid in list(crash_data['bets'].keys()):
                    update_crash_stats(uid, won=False, multiplier=0, stars=0)
                crash_data['bets'] = {}
                
                def start_new_round():
                    global crash_data
                    crash_data['active'] = True
                    crash_data['crashed'] = False
                    crash_data['start_time'] = time.time()
                    crash_data['multiplier'] = 1.00
                    crash_data['crash_point'] = generate_crash_point()
                    crash_data['bets'] = {}
                    crash_data['round_id'] += 1
                
                threading.Timer(3.0, start_new_round).start()
        
        time.sleep(0.05)

threading.Thread(target=crash_timer, daemon=True).start()

# ============================
# БИТВЫ (PVP)
# ============================
def start_battle(room_id):
    room = get_battle_room(room_id)
    if not room:
        return
    
    p1_prize = room['player1_prize']
    p2_prize = room['player2_prize']
    
    if p1_prize == 0 or p2_prize == 0:
        prizes = CASE_PRIZES.get(room['case_type'], [1, 10, 100])
        p1_prize = random.choice(prizes)
        p2_prize = random.choice(prizes)
    
    if p1_prize > p2_prize:
        winner_id = room['player1_id']
    elif p2_prize > p1_prize:
        winner_id = room['player2_id']
    else:
        winner_id = 0
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    if winner_id != 0:
        total_drop = p1_prize + p2_prize
        commission = int(total_drop * 0.10)
        winner_winnings = total_drop - commission
        
        loser_id = room['player2_id'] if winner_id == room['player1_id'] else room['player1_id']
        
        update_balance(winner_id, winner_winnings)
        add_commission(commission)
        update_battle_stats(winner_id, won=True, stars=winner_winnings)
        update_battle_stats(loser_id, won=False, stars=p2_prize if winner_id == room['player1_id'] else p1_prize)
        
        c.execute("INSERT INTO battle_history (user_id, opponent, stars, won, timestamp) VALUES (?, ?, ?, 1, ?)",
                  (winner_id, str(loser_id), winner_winnings, int(time.time())))
        c.execute("INSERT INTO battle_history (user_id, opponent, stars, won, timestamp) VALUES (?, ?, ?, 0, ?)",
                  (loser_id, str(winner_id), 0, int(time.time())))
    else:
        commission1 = int(p1_prize * 0.10)
        commission2 = int(p2_prize * 0.10)
        update_balance(room['player1_id'], -commission1)
        update_balance(room['player2_id'], -commission2)
        add_commission(commission1 + commission2)
        update_battle_stats(room['player1_id'], won=False, stars=commission1)
        update_battle_stats(room['player2_id'], won=False, stars=commission2)
        c.execute("INSERT INTO battle_history (user_id, opponent, stars, won, timestamp) VALUES (?, ?, 0, 0, ?)",
                  (room['player1_id'], str(room['player2_id']), int(time.time())))
        c.execute("INSERT INTO battle_history (user_id, opponent, stars, won, timestamp) VALUES (?, ?, 0, 0, ?)",
                  (room['player2_id'], str(room['player1_id']), int(time.time())))
    
    c.execute("UPDATE battle_rooms SET status = 'finished', winner_id = ? WHERE room_id = ?", (winner_id, room_id))
    conn.commit()
    conn.close()

# ============================
# ЭНДПОИНТЫ
# ============================

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

@app.route('/get_balance', methods=['POST'])
def get_balance():
    data = request.json
    user_id = data.get('user_id')
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    return jsonify({
        'balance': user['balance'],
        'total_cases': user['total_cases'],
        'status': get_status(user['total_cases']),
        'refs': user['refs']
    })

@app.route('/check_balance', methods=['POST'])
def check_balance():
    data = request.json
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    
    price = CASE_PRICES.get(case_type, 0)
    if user['balance'] < price:
        return jsonify({'error': 'Недостаточно звёзд', 'can_open': False})
    
    if case_type == 'free':
        now = int(time.time())
        if user['last_free_case_time'] and (now - user['last_free_case_time']) < 7200:
            wait = int((7200 - (now - user['last_free_case_time'])) // 60)
            return jsonify({'error': f'Жди {wait} мин', 'can_open': False})
    
    return jsonify({'can_open': True})

@app.route('/get_prize', methods=['POST'])
def get_prize_endpoint():
    data = request.json
    case_type = data.get('case_type')
    user_id = data.get('user_id')
    prize = get_prize(case_type, user_id)
    return jsonify({'prize': prize})

@app.route('/open_case', methods=['POST'])
def open_case():
    data = request.json
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    prize = data.get('prize')
    
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    
    price = CASE_PRICES.get(case_type, 0)
    if user['balance'] < price:
        return jsonify({'error': 'Недостаточно звёзд'})
    
    if case_type == 'free':
        now = int(time.time())
        if user['last_free_case_time'] and (now - user['last_free_case_time']) < 7200:
            return jsonify({'error': 'Бесплатный кейс раз в 2 часа'})
        update_balance(user_id, prize)
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("UPDATE users SET last_free_case_time = ?, total_cases = total_cases + 1 WHERE user_id = ?", (now, user_id))
        conn.commit()
        conn.close()
    else:
        update_balance(user_id, prize - price)
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("UPDATE users SET total_cases = total_cases + 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        conn.close()
    
    user = get_user(user_id)
    return jsonify({'new_balance': user['balance']})

# ===== БИТВЫ PVP =====
@app.route('/create_battle_room', methods=['POST'])
def create_battle_room():
    data = request.json
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    
    price = CASE_PRICES.get(case_type, 0)
    if user['balance'] < price:
        return jsonify({'error': f'Недостаточно звёзд! Нужно {price}⭐'})
    
    existing = get_user_room(user_id)
    if existing:
        return jsonify({'error': 'У тебя уже есть активная комната'})
    
    room_id = generate_room_id()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO battle_rooms (room_id, creator_id, player1_id, case_type, status, created_at) VALUES (?, ?, ?, ?, 'waiting', ?)",
              (room_id, user_id, user_id, case_type, int(time.time())))
    conn.commit()
    conn.close()
    
    update_balance(user_id, -price)
    
    return jsonify({'room_id': room_id, 'case_type': case_type})

@app.route('/get_battle_rooms', methods=['POST'])
def get_battle_rooms():
    data = request.json
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM battle_rooms WHERE status = 'waiting' ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    
    rooms = []
    for row in rows:
        rooms.append({
            'room_id': row[0],
            'creator_id': row[1],
            'case_type': row[4],
            'players_count': 2 if row[3] != 0 else 1,
            'is_my_room': row[2] == user_id or row[3] == user_id
        })
    
    return jsonify({'rooms': rooms})

@app.route('/join_battle_room', methods=['POST'])
def join_battle_room():
    data = request.json
    user_id = data.get('user_id')
    room_id = data.get('room_id')
    
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    
    room = get_battle_room(room_id)
    if not room:
        return jsonify({'error': 'Комната не найдена'})
    
    if room['status'] != 'waiting':
        return jsonify({'error': 'Битва уже началась'})
    
    if room['player2_id'] != 0:
        return jsonify({'error': 'Комната полна'})
    
    if room['player1_id'] == user_id:
        return jsonify({'already_in_room': True})
    
    price = CASE_PRICES.get(room['case_type'], 0)
    if user['balance'] < price:
        return jsonify({'error': f'Недостаточно звёзд! Нужно {price}⭐'})
    
    update_balance(user_id, -price)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE battle_rooms SET player2_id = ? WHERE room_id = ?", (user_id, room_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'room_id': room_id, 'case_type': room['case_type']})

@app.route('/exit_battle_room', methods=['POST'])
def exit_battle_room():
    data = request.json
    user_id = data.get('user_id')
    room_id = data.get('room_id')
    
    room = get_battle_room(room_id)
    if not room:
        return jsonify({'error': 'Комната не найдена'})
    
    if room['status'] == 'playing':
        return jsonify({'error': 'Нельзя выйти во время битвы'})
    
    if room['status'] == 'waiting':
        price = CASE_PRICES.get(room['case_type'], 0)
        if room['player1_id'] == user_id or room['player2_id'] == user_id:
            update_balance(user_id, price)
    
    delete_battle_room(room_id)
    return jsonify({'success': True})

@app.route('/battle_ready', methods=['POST'])
def battle_ready():
    data = request.json
    user_id = data.get('user_id')
    room_id = data.get('room_id')
    
    room = get_battle_room(room_id)
    if not room:
        return jsonify({'error': 'Комната не найдена'})
    
    if room['status'] != 'waiting':
        return jsonify({'error': 'Битва уже началась'})
    
    if room['player2_id'] == 0:
        return jsonify({'error': 'Нет соперника'})
    
    # Проверяем, не прошло ли 30 секунд с создания комнаты
    if time.time() - room['created_at'] > 30:
        delete_battle_room(room_id)
        return jsonify({'error': 'Время ожидания истекло'})
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    if room['player1_id'] == user_id:
        c.execute("UPDATE battle_rooms SET player1_ready = 1 WHERE room_id = ?", (room_id,))
    elif room['player2_id'] == user_id:
        c.execute("UPDATE battle_rooms SET player2_ready = 1 WHERE room_id = ?", (room_id,))
    else:
        return jsonify({'error': 'Вы не в этой комнате'})
    
    conn.commit()
    conn.close()
    
    room = get_battle_room(room_id)
    if room['player1_ready'] and room['player2_ready']:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("UPDATE battle_rooms SET status = 'playing' WHERE room_id = ?", (room_id,))
        conn.commit()
        conn.close()
        start_battle(room_id)
        return jsonify({'ready': True})
    
    return jsonify({'ready': False})

@app.route('/get_pvp_prizes', methods=['POST'])
def get_pvp_prizes():
    data = request.json
    room_id = data.get('room_id')
    
    room = get_battle_room(room_id)
    if not room:
        return jsonify({'error': 'Комната не найдена'})
    
    prizes = CASE_PRIZES.get(room['case_type'], [1, 10, 100])
    p1_prize = random.choice(prizes)
    p2_prize = random.choice(prizes)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE battle_rooms SET player1_prize = ?, player2_prize = ? WHERE room_id = ?",
              (p1_prize, p2_prize, room_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        'player1_prize': p1_prize,
        'player2_prize': p2_prize
    })

@app.route('/get_battle_animation_data', methods=['POST'])
def get_battle_animation_data():
    data = request.json
    room_id = data.get('room_id')
    
    room = get_battle_room(room_id)
    if not room:
        return jsonify({'error': 'Комната не найдена'})
    
    return jsonify({
        'case_type': room['case_type'],
        'player1': room['player1_id'],
        'player2': room['player2_id']
    })

@app.route('/get_battle_result', methods=['POST'])
def get_battle_result():
    data = request.json
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM battle_rooms WHERE (player1_id = ? OR player2_id = ?) AND status = 'finished' ORDER BY created_at DESC LIMIT 1",
              (user_id, user_id))
    row = c.fetchone()
    conn.close()
    
    if not row:
        return jsonify({'pending': True})
    
    room = {
        'room_id': row[0],
        'player1_id': row[2],
        'player2_id': row[3],
        'winner_id': row[10],
        'player1_prize': row[8],
        'player2_prize': row[9]
    }
    
    is_winner = room['winner_id'] == user_id
    is_draw = room['winner_id'] == 0
    
    if is_draw:
        return jsonify({
            'result': 'draw',
            'is_draw': True,
            'player1_prize': room['player1_prize'],
            'player2_prize': room['player2_prize'],
            'winner_id': 0,
            'result_text': 'Ничья!'
        })
    
    return jsonify({
        'result': 'win' if is_winner else 'lose',
        'is_draw': False,
        'winner_id': room['winner_id'],
        'player1_prize': room['player1_prize'],
        'player2_prize': room['player2_prize'],
        'winner_prize': room['player1_prize'] if room['winner_id'] == room['player1_id'] else room['player2_prize'],
        'loser_prize': room['player2_prize'] if room['winner_id'] == room['player1_id'] else room['player1_prize'],
        'result_text': 'Победа!',
        'is_winner': is_winner
    })

# ===== БИТВА С БОТОМ =====
@app.route('/start_bot_battle', methods=['POST'])
def start_bot_battle():
    data = request.json
    user_id = data.get('user_id')
    case_type = data.get('case_type')
    
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    
    price = CASE_PRICES.get(case_type, 0)
    if user['balance'] < price:
        return jsonify({'error': f'Недостаточно звёзд! Нужно {price}⭐'})
    
    prizes = CASE_PRIZES.get(case_type, [1, 10, 100])
    player_prize = random.choice(prizes)
    bot_prize = random.choice(prizes)
    
    update_balance(user_id, -price)
    
    if player_prize > bot_prize:
        total = player_prize + bot_prize
        commission = int(total * 0.05)
        winnings = total - commission
        update_balance(user_id, winnings)
        add_commission(commission)
        result = 'win'
        result_text = f'🎉 Ты выиграл! +{winnings}⭐'
    elif bot_prize > player_prize:
        result = 'lose'
        result_text = f'😢 Ты проиграл! -{price}⭐'
    else:
        commission = int(player_prize * 0.10)
        update_balance(user_id, player_prize - commission)
        add_commission(commission)
        result = 'draw'
        result_text = f'🤝 Ничья! Ты получил {player_prize - commission}⭐'
    
    return jsonify({
        'result': result,
        'result_text': result_text,
        'player_prize': player_prize,
        'bot_prize': bot_prize,
        'commission': commission if result != 'lose' else 0,
        'winnings': winnings if result == 'win' else 0
    })

# ===== МИНЁР =====
active_mines_games = {}

@app.route('/start_mines_game', methods=['POST'])
def start_mines_game():
    data = request.json
    user_id = data.get('user_id')
    bet = data.get('bet')
    mines = data.get('mines')
    
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    
    if user['balance'] < bet:
        return jsonify({'error': 'Недостаточно звёзд'})
    if bet < 3 or bet > 1000:
        return jsonify({'error': 'Ставка от 3 до 1000⭐'})
    if mines < 3 or mines > 8:
        return jsonify({'error': 'Мин от 3 до 8'})
    
    for gid, game in active_mines_games.items():
        if game['user_id'] == user_id and game['status'] == 'active':
            return jsonify({'error': 'У тебя уже есть активная игра'})
    
    update_balance(user_id, -bet)
    
    board = [0] * 25
    positions = random.sample(range(25), mines)
    for pos in positions:
        board[pos] = 1
    
    game_id = int(time.time())
    active_mines_games[game_id] = {
        'user_id': user_id,
        'bet': bet,
        'mines': mines,
        'board': board,
        'opened': [0] * 25,
        'opened_count': 0,
        'multiplier': 1.0,
        'status': 'active',
        'exploded': False
    }
    
    return jsonify({
        'game_id': game_id,
        'board': board,
        'opened': [0] * 25,
        'bet': bet,
        'mines': mines,
        'multiplier': 1.0
    })

@app.route('/open_mines_cell', methods=['POST'])
def open_mines_cell():
    data = request.json
    user_id = data.get('user_id')
    game_id = data.get('game_id')
    index = data.get('index')
    
    game = active_mines_games.get(game_id)
    if not game or game['status'] != 'active':
        return jsonify({'error': 'Игра не активна'})
    if game['user_id'] != user_id:
        return jsonify({'error': 'Не твоя игра'})
    if game['opened'][index] == 1:
        return jsonify({'error': 'Клетка уже открыта'})
    
    game['opened'][index] = 1
    game['opened_count'] += 1
    
    if game['board'][index] == 1:
        game['status'] = 'lost'
        game['exploded'] = True
        update_mines_stats(user_id, won=False, multiplier=0, stars=0)
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
        update_balance(user_id, final_winnings)
        game['status'] = 'won'
        update_mines_stats(user_id, won=True, multiplier=game['multiplier'], stars=final_winnings)
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

@app.route('/cashout_mines', methods=['POST'])
def cashout_mines():
    data = request.json
    user_id = data.get('user_id')
    game_id = data.get('game_id')
    
    game = active_mines_games.get(game_id)
    if not game or game['status'] != 'active':
        return jsonify({'error': 'Игра не активна'})
    if game['user_id'] != user_id:
        return jsonify({'error': 'Не твоя игра'})
    if game.get('exploded', False):
        return jsonify({'error': 'Игра уже завершена'})
    if game['opened_count'] < 3:
        return jsonify({'error': 'Нужно открыть минимум 3 клетки!'})
    
    raw_winnings = int(game['bet'] * game['multiplier'])
    final_winnings = min(raw_winnings, 5000)
    update_balance(user_id, final_winnings)
    game['status'] = 'won'
    update_mines_stats(user_id, won=True, multiplier=game['multiplier'], stars=final_winnings)
    
    del active_mines_games[game_id]
    
    return jsonify({
        'winnings': final_winnings,
        'multiplier': game['multiplier'],
        'game_over': True,
        'won': True
    })

@app.route('/get_mines_stats', methods=['POST'])
def get_mines_stats_endpoint():
    data = request.json
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM mines_stats WHERE user_id=?", (user_id,))
    stats = c.fetchone()
    conn.close()
    
    if not stats:
        return jsonify({'games': 0, 'wins': 0, 'losses': 0, 'best_multiplier': 1.0})
    
    return jsonify({
        'games': stats[1],
        'wins': stats[2],
        'losses': stats[3],
        'best_multiplier': stats[4]
    })

# ===== КРАШ =====
@app.route('/start_crash', methods=['POST'])
def start_crash():
    data = request.json
    user_id = data.get('user_id')
    bet = data.get('bet')
    
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    
    if bet < 1 or bet > 1000:
        return jsonify({'error': 'Ставка от 1 до 1000⭐'})
    if user['balance'] < bet:
        return jsonify({'error': 'Недостаточно звёзд'})
    if crash_data['active'] and not crash_data['crashed']:
        return jsonify({'error': 'Дождись окончания раунда!'})
    if user_id in crash_data['bets']:
        return jsonify({'error': 'Ты уже сделал ставку!'})
    
    update_balance(user_id, -bet)
    crash_data['bets'][user_id] = bet
    
    if not crash_data['active'] and crash_data['crashed']:
        crash_data['active'] = True
        crash_data['crashed'] = False
        crash_data['start_time'] = time.time()
        crash_data['multiplier'] = 1.00
        crash_data['crash_point'] = generate_crash_point()
        crash_data['round_id'] += 1
    
    return jsonify({
        'game_id': crash_data['round_id'],
        'success': True
    })

@app.route('/crash_status', methods=['POST'])
def crash_status():
    return jsonify({
        'multiplier': crash_data['multiplier'],
        'crashed': crash_data['crashed'],
        'active': crash_data['active']
    })

@app.route('/cashout_crash', methods=['POST'])
def cashout_crash():
    data = request.json
    user_id = data.get('user_id')
    
    if crash_data['crashed']:
        return jsonify({'error': 'Краш уже произошёл!'})
    if not crash_data['active']:
        return jsonify({'error': 'Раунд неактивен'})
    if user_id not in crash_data['bets']:
        return jsonify({'error': 'Ты не делал ставку'})
    
    bet = crash_data['bets'][user_id]
    multiplier = crash_data['multiplier']
    
    raw_winnings = int(bet * multiplier)
    commission = int(raw_winnings * 0.05)
    winnings = raw_winnings - commission
    final_winnings = min(winnings, 5000)
    
    update_balance(user_id, final_winnings)
    update_crash_stats(user_id, won=True, multiplier=multiplier, stars=final_winnings)
    add_commission(commission)
    
    del crash_data['bets'][user_id]
    
    return jsonify({
        'winnings': final_winnings,
        'multiplier': multiplier,
        'commission': commission
    })

@app.route('/get_crash_stats', methods=['POST'])
def get_crash_stats_endpoint():
    data = request.json
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM crash_stats WHERE user_id=?", (user_id,))
    stats = c.fetchone()
    conn.close()
    
    if not stats:
        return jsonify({'games': 0, 'wins': 0, 'losses': 0, 'best_multiplier': 1.0})
    
    return jsonify({
        'games': stats[1],
        'wins': stats[2],
        'losses': stats[3],
        'best_multiplier': stats[4]
    })

# ===== ПРОЧЕЕ =====
@app.route('/check_balance_simple', methods=['POST'])
def check_balance_simple():
    data = request.json
    user_id = data.get('user_id')
    amount = data.get('amount', 0)
    user = get_user(user_id)
    if not user:
        create_user(user_id)
        user = get_user(user_id)
    return jsonify({'has_enough': user['balance'] >= amount})

@app.route('/get_battle_data', methods=['POST'])
def get_battle_data():
    data = request.json
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT battles_won, battles_lost, commission_paid FROM battle_stats WHERE user_id=?", (user_id,))
    stats = c.fetchone()
    conn.close()
    
    if not stats:
        return jsonify({'wins': 0, 'losses': 0, 'commission': 0})
    
    return jsonify({
        'wins': stats[0] or 0,
        'losses': stats[1] or 0,
        'commission': stats[2] or 0
    })

@app.route('/withdraw_request', methods=['POST'])
def withdraw_request():
    data = request.json
    user_id = data.get('user_id')
    amount = data.get('amount')
    
    user = get_user(user_id)
    if not user:
        return jsonify({'error': 'Пользователь не найден'})
    if user['balance'] < amount:
        return jsonify({'error': f'Недостаточно звёзд. У тебя {user["balance"]}⭐'})
    if amount < 1000:
        return jsonify({'error': 'Минимальная сумма вывода — 1000⭐'})
    
    return jsonify({'success': True})

@app.route('/get_user_room', methods=['POST'])
def get_user_room_endpoint():
    data = request.json
    user_id = data.get('user_id')
    room_id = get_user_room(user_id)
    if not room_id:
        return jsonify({'room_id': None})
    return jsonify({'room_id': room_id})

@app.route('/check_room_status', methods=['POST'])
def check_room_status():
    data = request.json
    room_id = data.get('room_id')
    
    room = get_battle_room(room_id)
    if not room:
        return jsonify({'error': 'Комната не найдена', 'room_exists': False})
    
    return jsonify({
        'opponent_joined': room['player2_id'] != 0,
        'room_exists': True,
        'players_count': 2 if room['player2_id'] != 0 else 1,
        'case_type': room['case_type'],
        'opponent_left': False
    })

@app.route('/sync_battle_preview', methods=['POST'])
def sync_battle_preview():
    data = request.json
    room_id = data.get('room_id')
    user_id = data.get('user_id')
    
    room = get_battle_room(room_id)
    if not room:
        return jsonify({'error': 'Комната не найдена'})
    
    return jsonify({
        'me': 'ТЫ',
        'opponent': 'СОПЕРНИК',
        'ready_status': [room['player1_ready'], room['player2_ready']],
        'players_count': 2 if room['player2_id'] != 0 else 1
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
