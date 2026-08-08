// ===============================
// RANDEVU — ФИНАЛЬНЫЙ script.js v12.0
// ПОЛНАЯ ВЕРСИЯ — ВСЕ ИСПРАВЛЕНИЯ
// ===============================

const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;
const username = tg.initDataUnsafe?.user?.username || '';

if (!user_id) {
    alert('❌ Ошибка: не удалось получить ID пользователя.');
}

if (username) {
    fetch('/update_username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, username })
    });
}

// ===== КОНФИГ =====
const CONFIG = {
    CASE_PRIZES: {
        'free': [1,2,3,4,5,6,7,8,9,10,100,1000],
        'mud': [1,2,3,4,5,6,7,10,12,13,16,18,20,22,24,27,50,500],
        'wood': [2,4,5,6,7,8,9,10,12,13,15,20,50,100,500,1000],
        'stone': [11,13,15,16,17,18,19,21,23,24,25,30,50,100,250,500,1000,2500],
        'bronze': [20,25,30,35,40,45,50,55,60,65,75,100,222,333,444,555,1000,1500,2000,5000],
        'silver': [40,50,60,70,80,90,100,110,120,130,140,150,200,250,333,444,555,666,777,888,999,1488,2011,5000,10000],
        'gold': [75,100,150,169,190,220,251,300,400,500,777,999,1000,2000,5000,10000,12500,25000],
        'diamond': [250,300,333,350,444,505,1000,1488,2222,2500,5000,10000,12500,25000,50000],
        'netherite': [500,550,600,650,700,750,800,850,900,950,1000,1500,2000,2500,3000,3200,3500,4000,5000,10000,15000,20000,25000],
        'obsidian': [1000,1200,1400,1600,1800,2000,2200,2400,2500,2600,2800,3000,3200,3500,4000,4500,5000,5500,6000,7000,8000,9000,10000,12000,15000,18000,20000,22000,25000,28000,30000,50000,100000],
        'bedrock': [5000, 10000, 25000, 50000, 100000, 500000, 1000000]
    },
    CASE_PRICES: {
        'free': 0, 'mud': 5, 'wood': 9, 'stone': 19,
        'bronze': 49, 'silver': 99, 'gold': 249,
        'diamond': 499, 'netherite': 999,
        'obsidian': 2499, 'bedrock': 10000
    },
    CASE_STYLES: {
        'free': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(46,204,113,0.7)', titleColor:'#2ecc71', itemColor:'#6bcbff', highlightColor:'#ffd700', glowColor:'rgba(46,204,113,0.3)', shadowColor:'rgba(46,204,113,0.5)', icon:'🎁', bgGradient:'radial-gradient(circle at 50% 50%, rgba(46,204,113,0.08), transparent 70%)' },
        'mud': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(142,68,173,0.7)', titleColor:'#8e44ad', itemColor:'#c39bd3', highlightColor:'#ff6b6b', glowColor:'rgba(142,68,173,0.3)', shadowColor:'rgba(142,68,173,0.5)', icon:'🟫', bgGradient:'radial-gradient(circle at 50% 50%, rgba(142,68,173,0.08), transparent 70%)' },
        'wood': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(211,84,0,0.7)', titleColor:'#d35400', itemColor:'#f39c12', highlightColor:'#ffd700', glowColor:'rgba(211,84,0,0.3)', shadowColor:'rgba(211,84,0,0.5)', icon:'🌳', bgGradient:'radial-gradient(circle at 50% 50%, rgba(211,84,0,0.08), transparent 70%)' },
        'stone': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(127,140,141,0.7)', titleColor:'#7f8c8d', itemColor:'#bdc3c7', highlightColor:'#ffd700', glowColor:'rgba(127,140,141,0.3)', shadowColor:'rgba(127,140,141,0.5)', icon:'🪨', bgGradient:'radial-gradient(circle at 50% 50%, rgba(127,140,141,0.08), transparent 70%)' },
        'bronze': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(205,127,50,0.7)', titleColor:'#cd7f32', itemColor:'#f0c27f', highlightColor:'#ffd700', glowColor:'rgba(205,127,50,0.3)', shadowColor:'rgba(205,127,50,0.5)', icon:'🥉', bgGradient:'radial-gradient(circle at 50% 50%, rgba(205,127,50,0.08), transparent 70%)' },
        'silver': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(189,195,199,0.7)', titleColor:'#bdc3c7', itemColor:'#ecf0f1', highlightColor:'#ffd700', glowColor:'rgba(189,195,199,0.3)', shadowColor:'rgba(189,195,199,0.5)', icon:'🔘', bgGradient:'radial-gradient(circle at 50% 50%, rgba(189,195,199,0.08), transparent 70%)' },
        'gold': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(241,196,15,0.7)', titleColor:'#f1c40f', itemColor:'#f9e79f', highlightColor:'#ffd700', glowColor:'rgba(241,196,15,0.4)', shadowColor:'rgba(241,196,15,0.6)', icon:'👑', bgGradient:'radial-gradient(circle at 50% 50%, rgba(241,196,15,0.1), transparent 70%)' },
        'diamond': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(52,152,219,0.7)', titleColor:'#3498db', itemColor:'#85c1e9', highlightColor:'#00d4ff', glowColor:'rgba(52,152,219,0.3)', shadowColor:'rgba(52,152,219,0.5)', icon:'💎', bgGradient:'radial-gradient(circle at 50% 50%, rgba(52,152,219,0.08), transparent 70%)' },
        'netherite': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(44,62,80,0.7)', titleColor:'#e74c3c', itemColor:'#f1948a', highlightColor:'#ff6b35', glowColor:'rgba(231,76,60,0.3)', shadowColor:'rgba(231,76,60,0.5)', icon:'🔥', bgGradient:'radial-gradient(circle at 50% 50%, rgba(231,76,60,0.08), transparent 70%)' },
        'obsidian': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(52,73,94,0.7)', titleColor:'#5d6d7e', itemColor:'#aeb6bf', highlightColor:'#ffd700', glowColor:'rgba(52,73,94,0.4)', shadowColor:'rgba(52,73,94,0.6)', icon:'🔮', bgGradient:'radial-gradient(circle at 50% 50%, rgba(52,73,94,0.1), transparent 70%)' },
        'bedrock': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(255,215,0,0.8)', titleColor:'#ffd700', itemColor:'#ffd700', highlightColor:'#ff6b00', glowColor:'rgba(255,215,0,0.6)', shadowColor:'rgba(255,215,0,0.8)', icon:'⛏️', bgGradient:'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.15), transparent 70%)' }
    }
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const getPrizes = (type) => CONFIG.CASE_PRIZES[type] || [1,10,100];
const getStyle = (type) => CONFIG.CASE_STYLES[type] || CONFIG.CASE_STYLES['free'];
const getPrice = (type) => CONFIG.CASE_PRICES[type] || 0;
const getJackpot = (type) => {
    const jackpots = {
        'free': '1000⭐', 'mud': '500⭐', 'wood': '1000⭐', 'stone': '2500⭐',
        'bronze': '5000⭐', 'silver': '10000⭐', 'gold': '25000⭐',
        'diamond': '50000⭐', 'netherite': '25000⭐',
        'obsidian': '100000⭐', 'bedrock': '1 000 000⭐'
    };
    return jackpots[type] || '0⭐';
};

const apiRequest = async (endpoint, body = {}) => {
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, ...body })
        });
        return await res.json();
    } catch {
        return { error: 'Сетевая ошибка' };
    }
};

function showCustomAlert(message, isSuccess = false) {
    const overlay = document.createElement('div');
    overlay.id = 'customAlertOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '9999', padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    const color = isSuccess ? '#4caf50' : '#ff6b6b';
    const icon = isSuccess ? '✅' : '❌';
    overlay.innerHTML = `
        <div style="font-size:48px; margin-bottom:10px;">${icon}</div>
        <div style="font-size:20px; font-weight:600; color:${color}; text-align:center; max-width:350px; word-wrap:break-word;">${message}</div>
        <button onclick="this.closest('#customAlertOverlay').remove()" style="margin-top:20px; padding:12px 40px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-size:16px; font-weight:600; cursor:pointer;">OK</button>
    `;
    document.body.appendChild(overlay);
}

// ===== DOM =====
const DOM = {
    balance: document.getElementById('balance'),
    balanceValue: document.getElementById('balanceValue'),
    profileBalance: document.getElementById('profileBalance'),
    profileCases: document.getElementById('profileCases'),
    profileStatus: document.getElementById('profileStatus'),
    profileRefs: document.getElementById('profileRefs'),
    inviteLink: document.getElementById('inviteLink'),
    minesCashoutBtn: document.getElementById('minesCashoutBtn'),
    minesStartBtn: document.getElementById('minesStartBtn'),
    minesBetDisplay: document.getElementById('minesBetDisplay'),
    minesCountDisplay: document.getElementById('minesCountDisplay'),
    minesTotalSafe: document.getElementById('minesTotalSafe'),
    minesOpenedDisplay: document.getElementById('minesOpenedDisplay'),
    minesMultiplierDisplay: document.getElementById('minesMultiplierDisplay'),
    minesBoard: document.getElementById('minesBoard'),
    betInput: document.getElementById('betInput'),
    crashBetInput: document.getElementById('crashBetInput'),
    crashMultiplier: document.getElementById('crashMultiplier'),
    crashStatus: document.getElementById('crashStatus'),
    crashTimer: document.getElementById('crashTimer'),
    crashBetDisplay: document.getElementById('crashBetDisplay'),
    crashMultiplierDisplay: document.getElementById('crashMultiplierDisplay'),
    crashStartBtn: document.getElementById('crashStartBtn'),
    crashCashoutBtn: document.getElementById('crashCashoutBtn'),
    crashGames: document.getElementById('crashGames'),
    crashWins: document.getElementById('crashWins'),
    crashLosses: document.getElementById('crashLosses'),
    crashBestMultiplier: document.getElementById('crashBestMultiplier'),
    battleWins: document.getElementById('battleWins'),
    battleLosses: document.getElementById('battleLosses'),
    battleCommission: document.getElementById('battleCommission'),
    battleRoomsList: document.getElementById('battleRoomsList'),
    waitingRoom: document.getElementById('waitingRoom'),
    waitingRoomRoomId: document.getElementById('waitingRoomRoomId'),
    waitingRoomCase: document.getElementById('waitingRoomCase'),
    minesGames: document.getElementById('minesGames'),
    minesWins: document.getElementById('minesWins'),
    minesLosses: document.getElementById('minesLosses'),
    minesBestMultiplier: document.getElementById('minesBestMultiplier')
};

// ===== СОСТОЯНИЕ =====
let state = {
    lastOpenedCase: null,
    currentPrize: null,
    isOpening: false,
    tapeContainer: null,
    minesGameData: null,
    selectedMines: 4,
    selectedBattleCase: 'gold',
    selectedBotCase: 'gold',
    currentRoomId: null,
    crashGameId: null,
    crashRunning: false,
    crashInterval: null,
    crashPollingInterval: null,
    intervals: {},
    _crashStartTime: null,
    balance: 5
};

// ===== ЗАКРЫТИЕ ОВЕРЛЕЕВ =====
function closeAllOverlays() {
    const ids = [
        'tapeContainer', 'resultContainer', 'battlePreviewOverlay',
        'battleRouletteOverlay', 'botRouletteOverlay', 'battleResultOverlay',
        'botBattleResultOverlay', 'minesResultOverlay', 'crashResultOverlay',
        'result', 'customAlertOverlay'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    state.isOpening = false;
    state.tapeContainer = null;
    state.crashRunning = false;
    if (state.crashInterval) {
        clearInterval(state.crashInterval);
        state.crashInterval = null;
    }
    if (state.crashPollingInterval) {
        clearInterval(state.crashPollingInterval);
        state.crashPollingInterval = null;
    }
    if (window.opponentInterval) clearInterval(window.opponentInterval);
    if (window.opponentChecker) clearInterval(window.opponentChecker);
    if (window.battleResultInterval) clearInterval(window.battleResultInterval);
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'flex';
}

// ===== НАВИГАЦИЯ =====
function showMain() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('mainScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="main"]').classList.add('active');
    loadBalance();
}

function showBattles() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('battlesScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="battles"]').classList.add('active');
    loadBattleData();
    loadBattleRooms();
    checkActiveRoom();
    clearInterval(state.intervals.battle);
    state.intervals.battle = setInterval(loadBattleRooms, 5000);
}

function showMines() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('minesScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="mines"]').classList.add('active');
    loadMinesStats();
    if (!state.minesGameData || !state.minesGameData.active) {
        state.minesGameData = null;
        if (DOM.minesCashoutBtn) DOM.minesCashoutBtn.style.display = 'none';
        if (DOM.minesStartBtn) DOM.minesStartBtn.textContent = '🎮 НАЧАТЬ ИГРУ';
        if (DOM.minesBetDisplay) DOM.minesBetDisplay.textContent = '0';
        if (DOM.minesCountDisplay) DOM.minesCountDisplay.textContent = '0';
        if (DOM.minesTotalSafe) DOM.minesTotalSafe.textContent = '0';
        if (DOM.minesOpenedDisplay) DOM.minesOpenedDisplay.textContent = '0';
        if (DOM.minesMultiplierDisplay) DOM.minesMultiplierDisplay.textContent = 'x1.0';
        initMinesBoard();
    }
}

function showCrash() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('crashScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="crash"]').classList.add('active');
    loadCrashStats();
    resetCrashUI();
    startCrashPolling();
}

function showProfile() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('profileScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="profile"]').classList.add('active');
    loadBalance();
}

function goBack() {
    closeAllOverlays();
    showMain();
}

// ===== БАЛАНС =====
async function loadBalance() {
    const data = await apiRequest('/get_balance');
    if (data.balance !== undefined) {
        state.balance = data.balance;
        updateAllBalances(data.balance);
        if (DOM.profileCases) DOM.profileCases.textContent = data.total_cases || 0;
        if (DOM.profileStatus) DOM.profileStatus.textContent = data.status || '🟢 Новичок';
        if (DOM.profileRefs) DOM.profileRefs.textContent = data.refs || 0;
        if (DOM.inviteLink) DOM.inviteLink.value = 'https://t.me/Randevucase_bot?start=' + user_id;
    }
}

function updateAllBalances(newBalance) {
    state.balance = newBalance;
    if (DOM.balance) DOM.balance.textContent = '⭐ ' + newBalance;
    if (DOM.balanceValue) DOM.balanceValue.textContent = newBalance + ' ⭐';
    if (DOM.profileBalance) DOM.profileBalance.textContent = newBalance;
}

// ===== КЕЙСЫ =====
function previewCase(type) {
    if (state.isOpening) return;
    closeAllOverlays();
    const style = getStyle(type);
    const price = getPrice(type);
    const prizes = getPrizes(type);
    const overlay = document.createElement('div');
    overlay.id = 'tapeContainer';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: style.bg,
        backgroundImage: style.bgGradient,
        backdropFilter: 'blur(30px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '999', padding: '20px',
        animation: 'fadeIn 0.3s ease'
    });
    overlay.innerHTML = `
        <div style="font-size:24px; font-weight:800; color:${style.titleColor}; margin-bottom:20px; text-transform:uppercase; letter-spacing:3px; text-shadow:0 0 40px ${style.glowColor};">${style.icon} ${type.toUpperCase()} CASE</div>
        <div style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.08); padding:10px 20px; border-radius:30px; font-size:18px; font-weight:700; color:#FFD700; border:1px solid rgba(255,215,0,0.2); backdrop-filter:blur(10px);">💰 ${DOM.balance.textContent}</div>
        <div style="width:95%; max-width:1400px; overflow:hidden; border-radius:16px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); height:200px; margin:0 auto;">
            <div style="display:flex; gap:6px; padding:20px 0; animation:scrollTapeForward ${prizes.length * 0.5}s linear infinite; will-change:transform; width:${prizes.length * 96}px;">
                ${prizes.map(p => `<div style="width:90px; height:140px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:10px; border:1px solid rgba(255,255,255,0.06); font-size:${p > 1000 ? '16px' : '20px'}; font-weight:700; color:${style.itemColor}; text-shadow:0 0 20px ${style.glowColor};">${p}⭐</div>`).join('')}
            </div>
        </div>
        <div style="display:flex; gap:14px; margin-top:20px; flex-wrap:wrap; justify-content:center;">
            ${state.balance >= price ? `<button onclick="openCaseDirect('${type}')" style="background:linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd); color:#fff; border:none; padding:14px 40px; border-radius:14px; font-size:18px; font-weight:700; cursor:pointer; box-shadow:0 4px 30px ${style.shadowColor}; min-width:170px;">🎲 Открыть (${price}⭐)</button>` : `<button style="background:rgba(255,0,0,0.12); color:#888; border:2px solid rgba(255,0,0,0.25); padding:14px 40px; border-radius:14px; font-size:18px; font-weight:700; cursor:not-allowed; min-width:170px;">🔒 Недостаточно (${price}⭐)</button>`}
            <button onclick="closeAllOverlays(); showMain();" style="background:rgba(255,255,255,0.06); color:#fff; border:1px solid rgba(255,255,255,0.08); padding:14px 40px; border-radius:14px; font-size:18px; font-weight:700; cursor:pointer; min-width:170px;">🔙 Назад</button>
        </div>
        <div style="color:${style.titleColor}; font-size:14px; opacity:0.5; margin-top:8px; letter-spacing:1px;">👀 Предпросмотр | Джекпот: ${getJackpot(type)}</div>
    `;
    document.body.appendChild(overlay);
    state.tapeContainer = overlay;
}

function openCaseDirect(type) {
    if (state.isOpening) return;
    state.isOpening = true;
    state.lastOpenedCase = type;
    apiRequest('/check_balance', { case_type: type }).then(data => {
        if (data.error) { showCustomAlert('❌ ' + data.error); state.isOpening = false; return; }
        if (!data.can_open) { showCustomAlert('❌ Недостаточно звёзд или время не прошло!'); state.isOpening = false; return; }
        apiRequest('/get_prize', { case_type: type }).then(prizeData => {
            if (prizeData.error) { showCustomAlert('❌ ' + prizeData.error); state.isOpening = false; return; }
            state.currentPrize = prizeData.prize;
            closeAllOverlays();
            const style = getStyle(type);
            const prizes = getPrizes(type);
            const targetPrize = state.currentPrize;
            const overlay = document.createElement('div');
            overlay.id = 'tapeContainer';
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                background: style.bg,
                backgroundImage: style.bgGradient,
                backdropFilter: 'blur(30px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: '999', padding: '20px',
                animation: 'fadeIn 0.3s ease'
            });
            const totalCards = 60;
            const winPosition = 40;
            let cardsHTML = '';
            for (let i = 0; i < totalCards; i++) {
                let value = i === winPosition ? targetPrize : prizes[Math.floor(Math.random() * prizes.length)];
                const isLarge = value > 1000;
                cardsHTML += `<div style="width:130px; height:120px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:10px; border:1px solid rgba(255,255,255,0.06); font-size:${isLarge ? '16px' : '20px'}; font-weight:700; color:${style.itemColor}; text-shadow:0 0 20px ${style.glowColor};">${value}⭐</div>`;
            }
            overlay.innerHTML = `
                <div style="font-size:24px; font-weight:800; color:${style.titleColor}; margin-bottom:20px; text-transform:uppercase; letter-spacing:3px; text-shadow:0 0 40px ${style.glowColor};">${style.icon} ${type.toUpperCase()} CASE</div>
                <div style="position:relative; width:95%; max-width:1400px; overflow:hidden; border-radius:16px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); height:150px; margin:0 auto;">
                    <div id="rouletteTrack" style="display:flex; gap:8px; padding:15px 0; transition:transform 6s cubic-bezier(0.1, 1, 0.1, 1); will-change:transform; position:relative; top:5px; width:${totalCards * 138}px;">${cardsHTML}</div>
                    <div style="position:absolute; top:-8px; left:50%; transform:translateX(-50%); font-size:36px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1;">▼</div>
                </div>
                <div style="margin-top:16px; color:${style.titleColor}; font-size:16px; opacity:0.6; letter-spacing:1px;">🎰 Открытие...</div>
            `;
            document.body.appendChild(overlay);
            setTimeout(() => {
                const track = document.getElementById('rouletteTrack');
                const viewportWidth = window.innerWidth * 0.85;
                const centerOffset = viewportWidth / 2;
                const shift = (winPosition * 138) - centerOffset + 65;
                if (track) track.style.transform = `translateX(-${shift}px)`;
            }, 300);
            setTimeout(() => {
                apiRequest('/open_case', { case_type: type, prize: targetPrize }).then(res => {
                    if (res.error) { showCustomAlert('❌ ' + res.error); } else { updateAllBalances(res.new_balance); }
                });
                const resultOverlay = document.createElement('div');
                resultOverlay.id = 'resultContainer';
                Object.assign(resultOverlay.style, {
                    position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: '1000', padding: '30px',
                    animation: 'fadeIn 0.3s ease'
                });
                resultOverlay.innerHTML = `
                    <div style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.08); padding:10px 20px; border-radius:30px; font-size:18px; font-weight:700; color:#FFD700; border:1px solid rgba(255,215,0,0.2); backdrop-filter:blur(10px);">💰 ${DOM.balance.textContent}</div>
                    <div style="font-size:64px; font-weight:900; color:#FFD700; text-shadow:0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3); margin-bottom:10px; text-align:center;">⭐ ${targetPrize}</div>
                    <div style="font-size:24px; font-weight:600; color:#FFF8E7; text-shadow:0 0 20px rgba(255,215,0,0.3); margin-bottom:30px;">Ты выиграл!</div>
                    <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
                        <button onclick="closeAllOverlays(); openCaseDirect('${type}')" style="background:linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd); color:#fff; border:none; padding:14px 36px; border-radius:14px; font-size:18px; font-weight:700; cursor:pointer; box-shadow:0 4px 30px ${style.shadowColor}; min-width:160px;">🎲 Открыть ещё (${getPrice(type)}⭐)</button>
                        <button onclick="closeAllOverlays(); showMain();" style="background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:14px 36px; border-radius:14px; font-size:18px; font-weight:700; cursor:pointer; min-width:160px;">🔙 Назад</button>
                    </div>
                `;
                document.body.appendChild(resultOverlay);
                const tape = document.getElementById('tapeContainer');
                if (tape) tape.remove();
                state.isOpening = false;
            }, 6500);
        });
    });
}

function closeResult() { closeAllOverlays(); }
function openAgain() { closeAllOverlays(); if (state.lastOpenedCase) { setTimeout(() => openCaseDirect(state.lastOpenedCase), 300); } }

// ===== БИТВЫ =====
function loadBattleData() {
    apiRequest('/get_battle_data').then(data => {
        if (DOM.battleWins) DOM.battleWins.textContent = data.wins || 0;
        if (DOM.battleLosses) DOM.battleLosses.textContent = data.losses || 0;
        if (DOM.battleCommission) DOM.battleCommission.textContent = data.commission || 0;
    });
}

function loadBattleRooms() {
    apiRequest('/get_battle_rooms').then(data => {
        const list = DOM.battleRoomsList;
        if (!list) return;
        const rooms = data.rooms || [];
        let html = '';
        const myRooms = rooms.filter(r => r.is_my_room);
        const otherRooms = rooms.filter(r => !r.is_my_room);
        if (myRooms.length > 0) {
            html += `<div style="color: #ffd700; font-size: 14px; margin-bottom: 8px;">⭐ ТВОИ КОМНАТЫ:</div>`;
            myRooms.forEach(r => {
                html += `<div class="room-item" style="border-color: rgba(255,215,0,0.3);">
                    <span class="room-creator">👤 ${r.player1} ${r.player2 !== 'ОЖИДАНИЕ...' ? 'vs ' + r.player2 : '— ожидание'}</span>
                    <span class="room-case">📦 ${r.case_type}</span>
                    <span class="room-players">👥 ${r.players_count}/2</span>
                    <button class="btn-join" onclick="joinBattleRoom('${r.room_id}')">⚔️ ВЕРНУТЬСЯ</button>
                </div>`;
            });
        }
        if (otherRooms.length > 0) {
            html += `<div style="color: #aaa; font-size: 14px; margin: 8px 0;">📋 ДРУГИЕ КОМНАТЫ:</div>`;
            otherRooms.forEach(r => {
                html += `<div class="room-item">
                    <span class="room-creator">👤 ${r.player1}</span>
                    <span class="room-case">📦 ${r.case_type}</span>
                    <span class="room-players">👥 ${r.players_count}/2</span>
                    <button class="btn-join" onclick="joinBattleRoom('${r.room_id}')">⚔️ ПРИСОЕДИНИТЬСЯ</button>
                </div>`;
            });
        }
        if (!html) html = '<div class="empty-state">🏠 Нет активных комнат. Создай свою!</div>';
        list.innerHTML = html;
    });
}

function checkActiveRoom() {
    apiRequest('/get_user_room').then(data => {
        if (data.room_id) {
            state.currentRoomId = data.room_id;
            showWaitingRoom(data.room_id, data.room?.case_type || 'gold');
            startListeningForOpponent(data.room_id);
            startOpponentChecker(data.room_id);
        }
    });
}

function showCreateBattle() { const modal = document.getElementById('createBattleModal'); if (modal) modal.classList.add('active'); }
function closeCreateBattle() { const modal = document.getElementById('createBattleModal'); if (modal) modal.classList.remove('active'); }

document.querySelectorAll('.battle-case-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.battle-case-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.selectedBattleCase = this.dataset.case;
    });
});

document.querySelectorAll('.bot-case-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.bot-case-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.selectedBotCase = this.dataset.case;
    });
});

function createBattleRoom() {
    const case_type = state.selectedBattleCase;
    const btn = document.querySelector('#createBattleModal .modal-buttons button:first-child');
    if (btn) { btn.textContent = '⏳ СОЗДАНИЕ...'; btn.disabled = true; }
    apiRequest('/create_battle_room', { case_type }).then(data => {
        if (btn) { btn.textContent = '✅ СОЗДАТЬ'; btn.disabled = false; }
        if (data.error) {
            if (data.error.includes('уже есть активная комната')) {
                showCustomAlert('⚠️ У тебя уже есть активная комната!');
                apiRequest('/get_user_room', {}).then(roomData => {
                    if (roomData.room_id) {
                        state.currentRoomId = roomData.room_id;
                        showWaitingRoom(roomData.room_id, roomData.room?.case_type || 'gold');
                    }
                });
                return;
            }
            showCustomAlert('❌ ' + data.error);
            return;
        }
        if (!data.room_id) { showCustomAlert('❌ Не удалось создать комнату'); return; }
        state.currentRoomId = data.room_id;
        closeCreateBattle();
        showWaitingRoom(data.room_id, data.case_type);
        startListeningForOpponent(data.room_id);
        startOpponentChecker(data.room_id);
    });
}

function showWaitingRoom(room_id, case_type) {
    if (DOM.waitingRoom) { DOM.waitingRoom.style.display = 'block'; if (DOM.waitingRoomRoomId) DOM.waitingRoomRoomId.textContent = room_id; if (DOM.waitingRoomCase) DOM.waitingRoomCase.textContent = case_type.toUpperCase(); }
    const stats = document.querySelector('#battlesScreen .battle-stats');
    const actions = document.querySelector('#battlesScreen .battle-actions');
    const list = DOM.battleRoomsList;
    if (stats) stats.style.display = 'none';
    if (actions) actions.style.display = 'none';
    if (list) list.style.display = 'none';
}

function exitWaitingRoom() {
    if (window.opponentInterval) clearInterval(window.opponentInterval);
    if (window.opponentChecker) clearInterval(window.opponentChecker);
    if (state.currentRoomId) {
        apiRequest('/exit_battle_room', { room_id: state.currentRoomId }).then(() => {
            state.currentRoomId = null;
            if (DOM.waitingRoom) DOM.waitingRoom.style.display = 'none';
            const stats = document.querySelector('#battlesScreen .battle-stats');
            const actions = document.querySelector('#battlesScreen .battle-actions');
            const list = DOM.battleRoomsList;
            if (stats) stats.style.display = 'flex';
            if (actions) actions.style.display = 'flex';
            if (list) list.style.display = 'block';
            showBattles();
        });
    } else {
        if (DOM.waitingRoom) DOM.waitingRoom.style.display = 'none';
        const stats = document.querySelector('#battlesScreen .battle-stats');
        const actions = document.querySelector('#battlesScreen .battle-actions');
        const list = DOM.battleRoomsList;
        if (stats) stats.style.display = 'flex';
        if (actions) actions.style.display = 'flex';
        if (list) list.style.display = 'block';
        showBattles();
    }
}

function joinBattleRoom(room_id) {
    const btn = document.querySelector(`.btn-join[onclick*="${room_id}"]`);
    if (btn) { btn.textContent = '⏳ ПОДКЛЮЧЕНИЕ...'; btn.disabled = true; }
    apiRequest('/join_battle_room', { room_id }).then(data => {
        if (btn) { btn.textContent = '⚔️ ПРИСОЕДИНИТЬСЯ'; btn.disabled = false; }
        if (data.error) {
            if (data.already_in_room) {
                showCustomAlert('⚠️ Ты уже в этой комнате');
                apiRequest('/get_user_room', {}).then(roomData => {
                    if (roomData.room_id) { state.currentRoomId = roomData.room_id; showWaitingRoom(roomData.room_id, roomData.room?.case_type || 'gold'); }
                });
                return;
            }
            showCustomAlert('❌ ' + data.error);
            return;
        }
        if (data.success) {
            state.currentRoomId = data.room_id;
            showBattlePreview(data.room_id, data.case_type, data.player1, data.player2, false);
            syncPreviewStart(data.room_id);
            startOpponentChecker(data.room_id);
        }
    });
}

function showBattlePreview(room_id, case_type, player1, player2, isBot) {
    const style = getStyle(case_type);
    const prizes = getPrizes(case_type);
    const overlay = document.createElement('div');
    overlay.id = 'battlePreviewOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: style.bg, backgroundImage: style.bgGradient,
        backdropFilter: 'blur(30px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '999', padding: '20px',
        animation: 'fadeIn 0.3s ease'
    });
    overlay.innerHTML = `
        <div style="font-size:24px; font-weight:800; color:${style.titleColor}; margin-bottom:16px; text-transform:uppercase; letter-spacing:3px; text-shadow:0 0 40px ${style.glowColor}; text-align:center;">${isBot ? '🤖 БИТВА С БОТОМ' : '⚔️ БИТВА КЕЙСОВ'}</div>
        <div style="display:flex; justify-content:space-between; width:100%; max-width:700px; margin-bottom:8px;">
            <span id="player1Ready" style="color:#888; font-size:13px;">⏳ ${player1}: ОЖИДАНИЕ...</span>
            <span id="player2Ready" style="color:#888; font-size:13px;">⏳ ${player2}: ОЖИДАНИЕ...</span>
        </div>
        <div style="display:flex; gap:20px; justify-content:center; align-items:stretch; width:100%; max-width:700px; margin-bottom:16px;">
            <div style="flex:1; text-align:center; display:flex; flex-direction:column;">
                <div style="font-size:14px; color:#aaa; margin-bottom:6px;">👤 ${player1}</div>
                <div style="position:relative; overflow:hidden; border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); height:120px; flex:1;">
                    <div style="display:flex; gap:6px; padding:10px 0; animation:scrollTapeForward ${prizes.length * 0.5}s linear infinite; will-change:transform; width:${prizes.length * 76}px;">${prizes.map(p => `<div style="width:70px; height:100px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${p > 1000 ? '16px' : '20px'}; font-weight:700; color:${style.itemColor}; text-shadow:0 0 20px ${style.glowColor};">${p}⭐</div>`).join('')}</div>
                    <div style="position:absolute; top:-6px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 20px ${style.highlightColor}; pointer-events:none; line-height:1;">▼</div>
                </div>
            </div>
            <div style="display:flex; align-items:center; font-size:28px; font-weight:900; color:#ff6b6b; text-shadow:0 0 30px rgba(255,0,0,0.3); flex-shrink:0;">${isBot ? '🤖' : '⚔️'}</div>
            <div style="flex:1; text-align:center; display:flex; flex-direction:column;">
                <div style="font-size:14px; color:#aaa; margin-bottom:6px;">👤 ${player2}</div>
                <div style="position:relative; overflow:hidden; border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); height:120px; flex:1;">
                    <div style="display:flex; gap:6px; padding:10px 0; animation:scrollTapeForward ${prizes.length * 0.5}s linear infinite; will-change:transform; width:${prizes.length * 76}px;">${prizes.map(p => `<div style="width:70px; height:100px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${p > 1000 ? '16px' : '20px'}; font-weight:700; color:${style.itemColor}; text-shadow:0 0 20px ${style.glowColor};">${p}⭐</div>`).join('')}</div>
                    <div style="position:absolute; top:-6px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 20px ${style.highlightColor}; pointer-events:none; line-height:1;">▼</div>
                </div>
            </div>
        </div>
        <div style="color:#aaa; font-size:14px; text-align:center; margin-bottom:16px;">📦 Кейс: ${case_type.toUpperCase()}</div>
        <button id="battleReadyBtn" onclick="${isBot ? 'startBotBattleAction()' : `sendBattleReady('${room_id}')`}" style="padding:14px 40px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-size:18px; font-weight:700; cursor:pointer; transition:all 0.2s; margin-bottom:10px;">✅ ГОТОВ</button>
        <div id="battlePreviewStatus" style="color:#666; font-size:14px; text-align:center;">${isBot ? 'Нажми «ГОТОВ», чтобы начать битву с ботом' : 'Нажми «ГОТОВ», чтобы начать битву'}</div>
        <button onclick="closeAllOverlays(); showBattles();" style="padding:12px 30px; border:none; border-radius:12px; background:rgba(255,255,255,0.06); color:#888; font-size:14px; font-weight:600; cursor:pointer; margin-top:6px;">🔙 НАЗАД</button>
    `;
    document.body.appendChild(overlay);
}

function sendBattleReady(room_id) {
    const btn = document.getElementById('battleReadyBtn');
    if (btn) { btn.textContent = '⏳ ОЖИДАНИЕ...'; btn.style.background = 'linear-gradient(135deg, #ff9800, #e65100)'; btn.disabled = true; }
    apiRequest('/battle_ready', { room_id }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            if (btn) { btn.textContent = '✅ ГОТОВ'; btn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)'; btn.disabled = false; }
            return;
        }
        if (data.ready) {
            document.getElementById('battlePreviewStatus').textContent = '✅ Оба игрока готовы! Битва начинается...';
            setTimeout(() => { closeAllOverlays(); startPvpBattle(room_id); }, 1000);
        } else {
            document.getElementById('battlePreviewStatus').textContent = '⏳ Ожидание соперника...';
        }
    });
}

function syncPreviewStart(room_id) {
    apiRequest('/sync_battle_preview', { room_id }).then(data => {
        if (data.error) return;
        const p1 = document.getElementById('player1Ready');
        const p2 = document.getElementById('player2Ready');
        if (p1) p1.textContent = `⏳ ${data.me}: ОЖИДАНИЕ...`;
        if (p2) p2.textContent = `⏳ ${data.opponent}: ОЖИДАНИЕ...`;
    });
}

function startOpponentChecker(room_id) {
    if (window.opponentChecker) clearInterval(window.opponentChecker);
    window.opponentChecker = setInterval(() => {
        apiRequest('/check_room_status', { room_id }).then(data => {
            if (data.error || !data.room_exists) { clearInterval(window.opponentChecker); showCustomAlert('❌ Комната была удалена'); closeAllOverlays(); showBattles(); return; }
            if (data.opponent_left) { clearInterval(window.opponentChecker); showCustomAlert('❌ Ваш соперник вышел из комнаты!'); closeAllOverlays(); showBattles(); return; }
            if (data.opponent_joined && data.players_count === 2) {
                clearInterval(window.opponentChecker);
                if (DOM.waitingRoom) DOM.waitingRoom.style.display = 'none';
                const stats = document.querySelector('#battlesScreen .battle-stats');
                const actions = document.querySelector('#battlesScreen .battle-actions');
                const list = DOM.battleRoomsList;
                if (stats) stats.style.display = 'flex';
                if (actions) actions.style.display = 'flex';
                if (list) list.style.display = 'block';
                showBattlePreview(room_id, data.case_type, 'ТЫ', data.player2, false);
                const btn = document.getElementById('battleReadyBtn');
                if (btn) { btn.textContent = '✅ ГОТОВ'; btn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)'; btn.disabled = false; }
            }
        });
    }, 3000);
}

function startListeningForOpponent(room_id) {
    if (window.opponentInterval) clearInterval(window.opponentInterval);
    window.opponentInterval = setInterval(() => {
        apiRequest('/check_room_status', { room_id }).then(data => {
            if (data.error) { clearInterval(window.opponentInterval); return; }
            if (data.opponent_joined) {
                clearInterval(window.opponentInterval);
                if (DOM.waitingRoom) DOM.waitingRoom.style.display = 'none';
                const stats = document.querySelector('#battlesScreen .battle-stats');
                const actions = document.querySelector('#battlesScreen .battle-actions');
                const list = DOM.battleRoomsList;
                if (stats) stats.style.display = 'flex';
                if (actions) actions.style.display = 'flex';
                if (list) list.style.display = 'block';
                showBattlePreview(room_id, data.case_type, 'ТЫ', data.player2, false);
                const btn = document.getElementById('battleReadyBtn');
                if (btn) { btn.textContent = '✅ ГОТОВ'; btn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)'; btn.disabled = false; }
                startOpponentChecker(room_id);
            }
        });
    }, 2000);
}

// ===== БИТВА С БОТОМ =====
function showBotBattle() { const modal = document.getElementById('botBattleModal'); if (modal) modal.classList.add('active'); }
function closeBotBattle() { const modal = document.getElementById('botBattleModal'); if (modal) modal.classList.remove('active'); }

function startBotBattle() {
    const case_type = state.selectedBotCase;
    const price = getPrice(case_type) || 5;
    apiRequest('/check_balance_simple', { amount: price }).then(data => {
        if (data.error || !data.has_enough) { showCustomAlert('❌ Недостаточно звёзд!'); return; }
        closeBotBattle();
        showBattlePreview(null, case_type, 'ТЫ', 'БОТ', true);
    });
}

function startBotBattleAction() {
    const case_type = state.selectedBotCase || 'gold';
    const btn = document.getElementById('battleReadyBtn');
    if (btn) { btn.textContent = '⏳ ОЖИДАНИЕ...'; btn.style.background = 'linear-gradient(135deg, #ff9800, #e65100)'; btn.disabled = true; }
    apiRequest('/start_bot_battle', { case_type }).then(data => {
        if (data.error) { showCustomAlert('❌ ' + data.error); return; }
        document.getElementById('battlePreviewStatus').textContent = '🎰 Битва началась!';
        setTimeout(() => { closeAllOverlays(); showBotBattleResult(data); }, 1500);
    });
}

function showBotBattleResult(data) {
    const overlay = document.createElement('div');
    overlay.id = 'botBattleResultOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '1000', padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    const iconMap = { 'win': '🎉', 'lose': '😢', 'draw': '🤝' };
    const titleMap = { 'win': 'ПОБЕДА!', 'lose': 'ПОРАЖЕНИЕ...', 'draw': 'НИЧЬЯ!' };
    const colorMap = { 'win': '#4caf50', 'lose': '#f44336', 'draw': '#ffd700' };
    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${iconMap[data.result]}</div>
        <div style="font-size:32px; font-weight:800; color:${colorMap[data.result]}; margin-bottom:20px;">${titleMap[data.result]}</div>
        <div style="display:flex; gap:40px; margin-bottom:20px;">
            <div style="text-align:center;"><div style="font-size:40px;">👤</div><div style="font-weight:700; color:${data.result === 'win' ? '#4caf50' : '#aaa'};">ТЫ</div><div style="font-size:28px; font-weight:800; color:#ffd700;">${data.player_prize}⭐</div></div>
            <div style="display:flex; align-items:center; font-size:36px; color:#ff6b6b;">🤖</div>
            <div style="text-align:center;"><div style="font-size:40px;">🤖</div><div style="font-weight:700; color:${data.result === 'lose' ? '#4caf50' : '#aaa'};">БОТ</div><div style="font-size:28px; font-weight:800; color:#ffd700;">${data.bot_prize}⭐</div></div>
        </div>
        <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center;"><div style="color:#aaa; font-size:14px;">${data.result_text}</div>${data.result === 'win' ? `<div style="color:#4caf50; font-size:16px; font-weight:700;">🏆 Ты получил: ${data.winnings}⭐</div>` : ''}</div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeAllOverlays(); showBotBattle();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b388ff, #7c4dff); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🤖 СНОВА</button>
            <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
        </div>
    `;
    document.body.appendChild(overlay);
    loadBattleData();
}

// ===== PVP БИТВА =====
function startPvpBattle(room_id) {
    apiRequest('/get_pvp_prizes', { room_id }).then(prizeData => {
        if (prizeData.error) { showCustomAlert('❌ ' + prizeData.error); return; }
        apiRequest('/get_battle_animation_data', { room_id }).then(data => {
            if (data.error) { showCustomAlert('❌ ' + data.error); return; }
            const style = getStyle(data.case_type);
            const prizes = getPrizes(data.case_type);
            const p1Prize = prizeData.player1_prize;
            const p2Prize = prizeData.player2_prize;
            const pos1 = prizes.indexOf(p1Prize);
            const pos2 = prizes.indexOf(p2Prize);
            const winPos1 = pos1 !== -1 ? pos1 : Math.floor(Math.random() * prizes.length);
            const winPos2 = pos2 !== -1 ? pos2 : Math.floor(Math.random() * prizes.length);
            const overlay = document.createElement('div');
            overlay.id = 'battleRouletteOverlay';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: ${style.bg}; background-image: ${style.bgGradient};
                backdrop-filter: blur(30px);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                z-index: 999; padding: 16px 20px;
                animation: fadeIn 0.3s ease;
            `;
            const totalCards = 60;
            const cardWidth = 110;
            const cardGap = 8;
            function createTrack(winPrize, winPos, color) {
                let html = '';
                for (let i = 0; i < totalCards; i++) {
                    let value = i === winPos ? winPrize : prizes[Math.floor(Math.random() * prizes.length)];
                    const isLarge = value > 1000;
                    html += `<div style="width:${cardWidth}px; height:85px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${isLarge ? '16px' : '22px'}; font-weight:700; color:${color}; text-shadow:0 0 20px ${style.glowColor}; transition:all 0.2s ease;">${value}⭐</div>`;
                }
                return html;
            }
            overlay.innerHTML = `
                <div style="font-size:20px; font-weight:800; color:${style.titleColor}; margin-bottom:10px; text-transform:uppercase; letter-spacing:2px; text-shadow:0 0 40px ${style.glowColor}; text-align:center; flex-shrink:0;">⚔️ ${data.case_type.toUpperCase()} BATTLE</div>
                <div style="display:flex; flex-direction:column; gap:6px; width:100%; max-width:600px; flex:1; justify-content:center;">
                    <div style="flex:1; display:flex; flex-direction:column; min-height:0; border:2px solid rgba(179,136,255,0.3); border-radius:12px; padding:6px; background:rgba(179,136,255,0.05);">
                        <div style="font-size:15px; font-weight:700; color:#b388ff; text-align:center; margin-bottom:3px; flex-shrink:0; background:rgba(179,136,255,0.1); padding:3px 0; border-radius:6px;">👤 ${data.player1}</div>
                        <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); flex:1; min-height:95px;">
                            <div id="rouletteTrack1" style="display:flex; gap:${cardGap}px; padding:6px 0; transition:transform 6s cubic-bezier(0.1, 1, 0.1, 1); will-change:transform; position:relative; width:${totalCards * (cardWidth + cardGap)}px; height:100%; align-items:center;">${createTrack(p1Prize, winPos1, style.itemColor)}</div>
                            <div style="position:absolute; top:-4px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1; z-index:5;">▼</div>
                        </div>
                    </div>
                    <div style="text-align:center; font-size:24px; font-weight:900; color:#ff6b6b; text-shadow:0 0 30px rgba(255,0,0,0.3); flex-shrink:0; padding:3px 0;">⚔️ VS</div>
                    <div style="flex:1; display:flex; flex-direction:column; min-height:0; border:2px solid rgba(179,136,255,0.3); border-radius:12px; padding:6px; background:rgba(179,136,255,0.05);">
                        <div style="font-size:15px; font-weight:700; color:#b388ff; text-align:center; margin-bottom:3px; flex-shrink:0; background:rgba(179,136,255,0.1); padding:3px 0; border-radius:6px;">👤 ${data.player2}</div>
                        <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); flex:1; min-height:95px;">
                            <div id="rouletteTrack2" style="display:flex; gap:${cardGap}px; padding:6px 0; transition:transform 6s cubic-bezier(0.1, 1, 0.1, 1); will-change:transform; position:relative; width:${totalCards * (cardWidth + cardGap)}px; height:100%; align-items:center;">${createTrack(p2Prize, winPos2, style.itemColor)}</div>
                            <div style="position:absolute; top:-4px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1; z-index:5;">▼</div>
                        </div>
                    </div>
                </div>
                <div style="color:#888; font-size:13px; text-align:center; margin-top:8px; flex-shrink:0;">📦 ${data.case_type.toUpperCase()}</div>
                <div style="color:${style.titleColor}; font-size:15px; font-weight:600; opacity:0.6; text-align:center; letter-spacing:1px; flex-shrink:0; margin-top:4px;">🎰 Открытие...</div>
            `;
            document.body.appendChild(overlay);
            const viewportWidth = window.innerWidth * 0.85;
            const centerOffset = viewportWidth / 2;
            const shift1 = (winPos1 * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
            const shift2 = (winPos2 * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
            setTimeout(() => {
                const t1 = document.getElementById('rouletteTrack1');
                const t2 = document.getElementById('rouletteTrack2');
                if (t1) { t1.style.transition = 'transform 6s cubic-bezier(0.1, 1, 0.1, 1)'; t1.style.transform = `translateX(-${shift1}px)`; }
                if (t2) { t2.style.transition = 'transform 6s cubic-bezier(0.1, 1, 0.1, 1)'; t2.style.transform = `translateX(-${shift2}px)`; }
            }, 300);
            setTimeout(() => {
                const t1 = document.getElementById('rouletteTrack1');
                const t2 = document.getElementById('rouletteTrack2');
                if (t1 && t1.children[winPos1]) { t1.children[winPos1].style.background = 'rgba(255,215,0,0.2)'; t1.children[winPos1].style.border = '2px solid #ffd700'; t1.children[winPos1].style.color = '#ffd700'; t1.children[winPos1].style.textShadow = '0 0 30px #ffd700'; t1.children[winPos1].style.transform = 'scale(1.1)'; }
                if (t2 && t2.children[winPos2]) { t2.children[winPos2].style.background = 'rgba(255,215,0,0.2)'; t2.children[winPos2].style.border = '2px solid #ffd700'; t2.children[winPos2].style.color = '#ffd700'; t2.children[winPos2].style.textShadow = '0 0 30px #ffd700'; t2.children[winPos2].style.transform = 'scale(1.1)'; }
            }, 6500);
            setTimeout(() => {
                apiRequest('/get_battle_result', {}).then(result => {
                    if (result.pending) {
                        setTimeout(() => {
                            apiRequest('/get_battle_result', {}).then(final => {
                                if (final.result) { overlay.remove(); showBattleResult(final); }
                            });
                        }, 3000);
                        return;
                    }
                    if (result.result) { overlay.remove(); showBattleResult(result); }
                });
            }, 7000);
        });
    });
}

function showBattleResult(data) {
    if (DOM.waitingRoom) DOM.waitingRoom.style.display = 'none';
    const stats = document.querySelector('#battlesScreen .battle-stats');
    const actions = document.querySelector('#battlesScreen .battle-actions');
    const list = DOM.battleRoomsList;
    if (stats) stats.style.display = 'flex';
    if (actions) actions.style.display = 'flex';
    if (list) list.style.display = 'block';
    state.currentRoomId = null;
    const overlay = document.createElement('div');
    overlay.id = 'battleResultOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '1000', padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    const isWin = data.is_winner;
    const isDraw = data.is_draw;
    if (isDraw) {
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">🤝</div>
            <div style="font-size:32px; font-weight:800; color:#ffd700; margin-bottom:20px;">НИЧЬЯ!</div>
            <div style="display:flex; gap:40px; margin-bottom:20px;">
                <div style="text-align:center;"><div style="font-size:40px;">👤</div><div style="font-weight:700; color:#aaa;">Игрок 1</div><div style="font-size:28px; font-weight:800; color:#ffd700;">${data.player1_prize}⭐</div></div>
                <div style="display:flex; align-items:center; font-size:36px; color:#ff6b6b;">⚔️</div>
                <div style="text-align:center;"><div style="font-size:40px;">👤</div><div style="font-weight:700; color:#aaa;">Игрок 2</div><div style="font-size:28px; font-weight:800; color:#ffd700;">${data.player2_prize}⭐</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center; color:#aaa;">${data.result_text || 'Ничья!'}</div>
            <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); showBattles();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b388ff, #7c4dff); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">⚔️ НОВАЯ БИТВА</button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
            </div>
        `;
    } else {
        const icon = isWin ? '🎉' : '😢';
        const title = isWin ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ...';
        const color = isWin ? '#4caf50' : '#f44336';
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">${icon}</div>
            <div style="font-size:32px; font-weight:800; color:${color}; margin-bottom:20px;">${title}</div>
            <div style="display:flex; gap:40px; margin-bottom:20px;">
                <div style="text-align:center;"><div style="font-size:40px;">👤</div><div style="font-weight:700; color:${isWin ? '#4caf50' : '#aaa'};">ТЫ</div><div style="font-size:28px; font-weight:800; color:#ffd700;">${isWin ? data.winner_prize : data.loser_prize}⭐</div></div>
                <div style="display:flex; align-items:center; font-size:36px; color:#ff6b6b;">⚔️</div>
                <div style="text-align:center;"><div style="font-size:40px;">👤</div><div style="font-weight:700; color:${!isWin ? '#4caf50' : '#aaa'};">СОПЕРНИК</div><div style="font-size:28px; font-weight:800; color:#ffd700;">${!isWin ? data.winner_prize : data.loser_prize}⭐</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center;">
                <div style="color:#aaa; font-size:14px;">${data.result_text}</div>
                <div style="color:#888; font-size:12px;">💸 Комиссия: ${data.commission || 0}⭐</div>
                ${isWin ? `<div style="color:#4caf50; font-size:16px; font-weight:700;">🏆 Ты получил: ${data.winner_winnings}⭐</div>` : ''}
            </div>
            <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); showBattles();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b388ff, #7c4dff); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">⚔️ НОВАЯ БИТВА</button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
            </div>
        `;
    }
    document.body.appendChild(overlay);
    loadBattleData();
}

// ===== МИНЁР =====
function initMinesBoard() {
    const board = DOM.minesBoard;
    if (!board) return;
    board.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'mines-cell';
        cell.dataset.index = i;
        cell.textContent = '❓';
        cell.onclick = () => openMinesCell(i);
        board.appendChild(cell);
    }
}

function getBetFromInput() {
    const input = DOM.betInput;
    if (!input) return 100;
    let val = parseInt(input.value);
    if (isNaN(val) || val < 3) val = 3;
    if (val > 1000) val = 1000;
    input.value = val;
    return val;
}

if (DOM.betInput) {
    DOM.betInput.addEventListener('change', function() {
        let val = parseInt(this.value);
        if (isNaN(val) || val < 3) val = 3;
        if (val > 1000) val = 1000;
        this.value = val;
    });
}

document.querySelectorAll('.mines-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.mines-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.selectedMines = parseInt(this.dataset.mines);
    });
});

function startMinesGame() {
    const bet = getBetFromInput();
    const mines = state.selectedMines || 4;
    if (bet < 3 || bet > 1000) { showCustomAlert('❌ Ставка должна быть от 3 до 1000⭐'); return; }
    if (mines < 3 || mines > 8) { showCustomAlert('❌ X должно быть от 3 до 8'); return; }
    apiRequest('/check_balance_simple', { amount: bet }).then(data => {
        if (data.error || !data.has_enough) { showCustomAlert('❌ Недостаточно звёзд!'); return; }
        apiRequest('/start_mines_game', { bet, mines }).then(gameData => {
            if (gameData.error) { showCustomAlert('❌ ' + gameData.error); return; }
            state.minesGameData = {
                game_id: gameData.game_id,
                bet: gameData.bet,
                mines: gameData.mines,
                opened: 0,
                safe_cells: 25 - gameData.mines,
                multiplier: 1.0,
                board: gameData.board,
                openedCells: gameData.opened,
                active: true,
                game_over: false,
                exploded: false
            };
            if (DOM.minesBetDisplay) DOM.minesBetDisplay.textContent = bet;
            if (DOM.minesCountDisplay) DOM.minesCountDisplay.textContent = mines;
            if (DOM.minesTotalSafe) DOM.minesTotalSafe.textContent = 25 - mines;
            if (DOM.minesOpenedDisplay) DOM.minesOpenedDisplay.textContent = '0';
            if (DOM.minesMultiplierDisplay) DOM.minesMultiplierDisplay.textContent = 'x1.0';
            if (DOM.minesCashoutBtn) DOM.minesCashoutBtn.style.display = 'inline-block';
            if (DOM.minesStartBtn) DOM.minesStartBtn.textContent = '🔄 ИГРАТЬ СНОВА';
            renderMinesBoard();
            updateMinesCashoutAmount();
        });
    });
}

function renderMinesBoard() {
    const board = DOM.minesBoard;
    if (!board) return;
    const cells = board.querySelectorAll('.mines-cell');
    if (!state.minesGameData) {
        cells.forEach(cell => {
            cell.textContent = '❓';
            cell.className = 'mines-cell';
            cell.onclick = () => openMinesCell(parseInt(cell.dataset.index));
        });
        return;
    }
    const { board: dataBoard, openedCells } = state.minesGameData;
    cells.forEach((cell, i) => {
        if (openedCells[i] === 1) {
            cell.classList.add('opened');
            if (dataBoard[i] === 1) {
                cell.textContent = '💣';
                cell.classList.add('mine');
                cell.onclick = null;
            } else {
                cell.textContent = '💎';
                cell.classList.add('safe');
                cell.onclick = null;
            }
        } else {
            cell.textContent = '❓';
            cell.className = 'mines-cell';
            cell.onclick = () => openMinesCell(i);
        }
    });
}

function openMinesCell(index) {
    if (!state.minesGameData || !state.minesGameData.active || state.minesGameData.game_over) return;
    if (state.minesGameData.openedCells[index] === 1) return;
    apiRequest('/open_mines_cell', { game_id: state.minesGameData.game_id, index }).then(data => {
        if (data.error) { showCustomAlert('❌ ' + data.error); return; }
        state.minesGameData.board = data.board;
        state.minesGameData.openedCells = data.opened;
        state.minesGameData.opened = data.opened_count;
        state.minesGameData.multiplier = data.multiplier;
        if (DOM.minesOpenedDisplay) DOM.minesOpenedDisplay.textContent = state.minesGameData.opened;
        if (DOM.minesMultiplierDisplay) DOM.minesMultiplierDisplay.textContent = 'x' + state.minesGameData.multiplier;
        if (data.game_over) {
            state.minesGameData.active = false;
            state.minesGameData.game_over = true;
            if (data.won === false) { state.minesGameData.exploded = true; }
            if (DOM.minesCashoutBtn) DOM.minesCashoutBtn.style.display = 'none';
            if (!data.won) {
                for (let i = 0; i < 25; i++) {
                    if (state.minesGameData.board[i] === 1) {
                        state.minesGameData.openedCells[i] = 1;
                    }
                }
            }
            renderMinesBoard();
            if (data.won) {
                showMinesResult('🎉', 'ПОБЕДА!', `Ты выиграл ${data.winnings}⭐!`, '#4caf50');
            } else {
                showMinesResult('💥', 'ВЗРЫВ!', `Ты потерял ${data.bet}⭐`, '#f44336');
            }
            loadBalance();
            return;
        }
        renderMinesBoard();
        updateMinesCashoutAmount();
    });
}

function showMinesResult(icon, title, text, color) {
    const board = state.minesGameData ? state.minesGameData.board : null;
    const openedCells = state.minesGameData ? state.minesGameData.openedCells : null;
    const overlay = document.createElement('div');
    overlay.id = 'minesResultOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '1000', padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    let boardHTML = '';
    if (board) {
        boardHTML = `<div style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px; max-width:350px; margin:16px auto; width:100%;">
            ${board.map((cell, i) => {
                const isMine = cell === 1;
                const isOpened = openedCells && openedCells[i] === 1;
                let bgColor = 'rgba(255,255,255,0.04)';
                let borderColor = 'rgba(255,255,255,0.06)';
                let symbol = '❓';
                if (isOpened) {
                    if (isMine) { bgColor = 'rgba(255,0,0,0.2)'; borderColor = 'rgba(255,0,0,0.3)'; symbol = '💣'; }
                    else { bgColor = 'rgba(0,255,0,0.08)'; borderColor = 'rgba(0,255,0,0.15)'; symbol = '💎'; }
                } else if (isMine) { bgColor = 'rgba(255,0,0,0.15)'; borderColor = 'rgba(255,0,0,0.2)'; symbol = '💣'; }
                return `<div style="aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:36px; background:${bgColor}; border-radius:10px; border:2px solid ${borderColor}; transition:all 0.2s; font-weight:700;">${symbol}</div>`;
            }).join('')}
        </div>`;
    }
    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${icon}</div>
        <div style="font-size:32px; font-weight:800; color:${color}; margin-bottom:10px;">${title}</div>
        <div style="color:#aaa; font-size:18px; margin-bottom:10px; text-align:center;">${text}</div>
        ${boardHTML}
        <div style="color:#666; font-size:13px; margin-bottom:16px;">💣 — мины | 💎 — безопасные клетки</div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeAllOverlays(); startMinesGame();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔄 ИГРАТЬ СНОВА</button>
            <button onclick="closeAllOverlays(); showMines();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function cashoutMinesGame() {
    if (!state.minesGameData || !state.minesGameData.active || state.minesGameData.game_over) return;
    if (state.minesGameData.opened < 3) { showCustomAlert('❌ Нужно открыть минимум 3 клетки!'); return; }
    if (state.minesGameData.exploded) { showCustomAlert('❌ Игра уже завершена!'); return; }
    apiRequest('/cashout_mines', { game_id: state.minesGameData.game_id }).then(data => {
        if (data.error) { showCustomAlert('❌ ' + data.error); return; }
        state.minesGameData.active = false;
        state.minesGameData.game_over = true;
        if (DOM.minesCashoutBtn) DOM.minesCashoutBtn.style.display = 'none';
        showMinesResult('💰', 'ВЫИГРЫШ!', `Ты забрал ${data.winnings}⭐ (x${data.multiplier})`, '#ffd700');
        loadBalance();
        loadMinesStats();
    });
}

function updateMinesCashoutAmount() {
    if (!state.minesGameData) return;
    const amount = Math.floor(state.minesGameData.bet * state.minesGameData.multiplier);
    const el = document.getElementById('minesCashoutAmount');
    if (el) el.textContent = amount;
}

function loadMinesStats() {
    apiRequest('/get_mines_stats').then(data => {
        if (DOM.minesGames) DOM.minesGames.textContent = data.games || 0;
        if (DOM.minesWins) DOM.minesWins.textContent = data.wins || 0;
        if (DOM.minesLosses) DOM.minesLosses.textContent = data.losses || 0;
        if (DOM.minesBestMultiplier) DOM.minesBestMultiplier.textContent = 'x' + (data.best_multiplier || 1.0);
    });
}

// ===== КРАШ =====
let crashChartData = [];
let crashCanvas = null;
let crashCtx = null;

function initCrashChart() {
    crashCanvas = document.getElementById('crashCanvas');
    if (!crashCanvas) return;
    crashCtx = crashCanvas.getContext('2d');
    crashChartData = [];
    drawCrashChart();
}

function drawCrashChart() {
    if (!crashCtx) return;
    const w = crashCanvas.width;
    const h = crashCanvas.height;
    crashCtx.clearRect(0, 0, w, h);
    if (crashChartData.length < 2) {
        crashCtx.fillStyle = 'rgba(255,255,255,0.05)';
        crashCtx.font = '14px sans-serif';
        crashCtx.textAlign = 'center';
        crashCtx.fillText('Ожидание игры...', w/2, h/2 + 5);
        return;
    }
    const maxVal = Math.max(...crashChartData, 1);
    const scaleY = (h - 20) / (maxVal * 1.2);
    const scaleX = (w - 20) / (crashChartData.length - 1);
    crashCtx.beginPath();
    crashCtx.strokeStyle = '#b388ff';
    crashCtx.lineWidth = 2.5;
    crashCtx.shadowColor = 'rgba(179,136,255,0.3)';
    crashCtx.shadowBlur = 10;
    crashChartData.forEach((val, i) => {
        const x = 10 + i * scaleX;
        const y = h - 10 - (val * scaleY);
        if (i === 0) crashCtx.moveTo(x, y);
        else crashCtx.lineTo(x, y);
    });
    crashCtx.stroke();
    const lastX = 10 + (crashChartData.length - 1) * scaleX;
    const lastY = h - 10 - (crashChartData[crashChartData.length - 1] * scaleY);
    crashCtx.lineTo(lastX, h - 10);
    crashCtx.lineTo(10, h - 10);
    crashCtx.closePath();
    crashCtx.fillStyle = 'rgba(179,136,255,0.08)';
    crashCtx.fill();
    const currentVal = crashChartData[crashChartData.length - 1] || 1.00;
    const color = currentVal < 2 ? '#4caf50' : currentVal < 5 ? '#ffd700' : currentVal < 8 ? '#ff9800' : '#f44336';
    crashCtx.beginPath();
    crashCtx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    crashCtx.fillStyle = color;
    crashCtx.shadowColor = color;
    crashCtx.shadowBlur = 15;
    crashCtx.fill();
    crashCtx.shadowBlur = 0;
    const multiplierEl = document.getElementById('crashMultiplier');
    if (multiplierEl) {
        multiplierEl.textContent = `x${currentVal.toFixed(2)}`;
        multiplierEl.style.color = color;
    }
    const progressEl = document.getElementById('crashProgressBar');
    if (progressEl) {
        const progress = Math.min((currentVal / 12) * 100, 100);
        progressEl.style.width = progress + '%';
    }
    const bet = parseInt(DOM.crashBetDisplay?.textContent || 0);
    const potentialWin = Math.floor(bet * currentVal * 0.95);
    const winDisplay = document.getElementById('crashPotentialWin');
    if (winDisplay) {
        winDisplay.textContent = potentialWin + '⭐';
        if (potentialWin > 0) {
            winDisplay.style.color = potentialWin > bet * 2 ? '#4caf50' : '#ffd700';
        }
    }
}

function updateCrashChart(multiplier) {
    crashChartData.push(multiplier);
    if (crashChartData.length > 200) crashChartData.shift();
    drawCrashChart();
}

function resetCrashChart() {
    crashChartData = [];
    drawCrashChart();
    const multiplierEl = document.getElementById('crashMultiplier');
    if (multiplierEl) { multiplierEl.textContent = 'x1.00'; multiplierEl.style.color = '#b388ff'; }
    const progressEl = document.getElementById('crashProgressBar');
    if (progressEl) progressEl.style.width = '0%';
    const winDisplay = document.getElementById('crashPotentialWin');
    if (winDisplay) { winDisplay.textContent = '0⭐'; winDisplay.style.color = '#4caf50'; }
}

function resetCrashUI() {
    if (DOM.crashMultiplier) DOM.crashMultiplier.textContent = 'x1.00';
    if (DOM.crashMultiplier) DOM.crashMultiplier.className = '';
    if (DOM.crashStatus) DOM.crashStatus.textContent = '⏳ Ожидание нового раунда...';
    if (DOM.crashTimer) DOM.crashTimer.textContent = '⏱ 0.0 сек';
    if (DOM.crashBetDisplay) DOM.crashBetDisplay.textContent = '0';
    if (DOM.crashMultiplierDisplay) DOM.crashMultiplierDisplay.textContent = 'x1.00';
    if (DOM.crashStartBtn) { DOM.crashStartBtn.style.display = 'inline-block'; DOM.crashStartBtn.disabled = true; DOM.crashStartBtn.textContent = '⏳ ЗАГРУЗКА...'; }
    if (DOM.crashCashoutBtn) DOM.crashCashoutBtn.style.display = 'none';
    state.crashRunning = false;
    state.crashGameId = null;
    if (state.crashInterval) { clearInterval(state.crashInterval); state.crashInterval = null; }
    resetCrashChart();
}

function getCrashBet() {
    const input = DOM.crashBetInput;
    if (!input) return 10;
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 1000) val = 1000;
    input.value = val;
    return val;
}

if (DOM.crashBetInput) {
    DOM.crashBetInput.addEventListener('change', function() {
        let val = parseInt(this.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 1000) val = 1000;
        this.value = val;
    });
}

function startCrashPolling() {
    if (state.crashPollingInterval) clearInterval(state.crashPollingInterval);
    state.crashPollingInterval = setInterval(() => {
        apiRequest('/crash_status', {}).then(status => {
            if (status.error) return;
            const multiplier = status.multiplier || 1.00;
            const crashed = status.crashed || false;
            const active = status.active || false;
            const countdown = status.countdown || 0;
            const waiting = status.waiting || false;
            if (DOM.crashMultiplier) DOM.crashMultiplier.textContent = `x${multiplier}`;
            if (DOM.crashMultiplierDisplay) DOM.crashMultiplierDisplay.textContent = `x${multiplier}`;
            updateCrashChart(multiplier);
            const bet = parseInt(DOM.crashBetDisplay?.textContent || 0);
            const potentialWin = Math.floor(bet * multiplier * 0.95);
            const winDisplay = document.getElementById('crashPotentialWin');
            if (winDisplay) { winDisplay.textContent = potentialWin + '⭐'; winDisplay.style.color = potentialWin > bet * 2 ? '#4caf50' : '#ffd700'; }
            const timerEl = DOM.crashTimer;
            const statusEl = DOM.crashStatus;
            const startBtn = DOM.crashStartBtn;
            const cashoutBtn = DOM.crashCashoutBtn;
            if (waiting && countdown > 0) {
                if (timerEl) { timerEl.textContent = `⏳ ${countdown} сек`; timerEl.style.color = '#ffd700'; }
                if (statusEl) statusEl.textContent = `🔄 Новый раунд через ${countdown} сек...`;
                if (startBtn) { startBtn.disabled = false; startBtn.textContent = `🚀 СТАРТ (${countdown})`; }
                if (cashoutBtn) cashoutBtn.style.display = 'none';
                if (DOM.crashMultiplier) DOM.crashMultiplier.className = '';
                state.crashRunning = false;
                return;
            }
            if (active && !crashed) {
                const elapsed = Math.floor((Date.now() - (state._crashStartTime || Date.now())) / 1000);
                if (timerEl) { timerEl.textContent = `⏱ ${elapsed} сек`; timerEl.style.color = '#666'; }
                if (statusEl) statusEl.textContent = '📈 Множитель растёт...';
                if (startBtn) { startBtn.disabled = true; startBtn.textContent = '⏳ ИГРА ИДЁТ...'; }
                if (DOM.crashMultiplier) DOM.crashMultiplier.className = '';
                if (state.crashRunning && cashoutBtn) cashoutBtn.style.display = 'inline-block';
                return;
            }
            if (crashed && !active && !waiting) {
                if (timerEl) { timerEl.textContent = '💥 КРАШ!'; timerEl.style.color = '#f44336'; }
                if (statusEl) statusEl.textContent = '💥 Краш! Новый раунд через 5 сек...';
                if (startBtn) { startBtn.disabled = true; startBtn.textContent = '⏳ 5 СЕК'; }
                if (DOM.crashMultiplier) DOM.crashMultiplier.className = 'crashed';
                if (cashoutBtn) cashoutBtn.style.display = 'none';
                state.crashRunning = false;
                return;
            }
            if (!active && !crashed && !waiting) {
                if (timerEl) { timerEl.textContent = '⏳ ОЖИДАНИЕ...'; timerEl.style.color = '#888'; }
                if (statusEl) statusEl.textContent = '⏳ Ожидание нового раунда...';
                if (startBtn) { startBtn.disabled = true; startBtn.textContent = '⏳ ЗАГРУЗКА...'; }
                if (cashoutBtn) cashoutBtn.style.display = 'none';
            }
        });
    }, 100);
}

function startCrashGame() {
    if (state.crashRunning) return;
    apiRequest('/crash_status', {}).then(status => {
        if (!status.waiting || status.countdown <= 0) {
            showCustomAlert('❌ Дождись обратного отсчёта!');
            return;
        }
        const bet = getCrashBet();
        if (bet < 1 || bet > 1000) { showCustomAlert('❌ Ставка от 1 до 1000⭐'); return; }
        apiRequest('/check_balance_simple', { amount: bet }).then(data => {
            if (data.error || !data.has_enough) { showCustomAlert('❌ Недостаточно звёзд!'); return; }
            apiRequest('/start_crash', { bet }).then(gameData => {
                if (gameData.error) { showCustomAlert('❌ ' + gameData.error); return; }
                state.crashGameId = gameData.game_id;
                state.crashRunning = true;
                state._crashStartTime = Date.now();
                resetCrashChart();
                if (DOM.crashStartBtn) { DOM.crashStartBtn.disabled = true; DOM.crashStartBtn.textContent = '⏳ ИГРА ИДЁТ...'; }
                if (DOM.crashCashoutBtn) DOM.crashCashoutBtn.style.display = 'inline-block';
                if (DOM.crashBetDisplay) DOM.crashBetDisplay.textContent = bet;
                if (DOM.crashStatus) DOM.crashStatus.textContent = '📈 Множитель растёт...';
                if (DOM.crashMultiplier) DOM.crashMultiplier.className = '';
                if (state.crashInterval) clearInterval(state.crashInterval);
                state.crashInterval = setInterval(() => {
                    apiRequest('/crash_status', { game_id: state.crashGameId }).then(status => {
                        if (status.error) { clearInterval(state.crashInterval); state.crashRunning = false; if (DOM.crashStatus) DOM.crashStatus.textContent = '❌ ' + status.error; return; }
                        const elapsed = (Date.now() - state._crashStartTime) / 1000;
                        if (DOM.crashTimer) DOM.crashTimer.textContent = `⏱ ${elapsed.toFixed(1)} сек`;
                        updateCrashChart(status.multiplier);
                        if (DOM.crashMultiplierDisplay) DOM.crashMultiplierDisplay.textContent = `x${status.multiplier}`;
                        if (status.crashed) {
                            clearInterval(state.crashInterval);
                            state.crashRunning = false;
                            if (DOM.crashMultiplier) DOM.crashMultiplier.className = 'crashed';
                            if (DOM.crashStatus) DOM.crashStatus.textContent = '💥 КРАШ!';
                            if (DOM.crashCashoutBtn) DOM.crashCashoutBtn.style.display = 'none';
                            if (DOM.crashStartBtn) { DOM.crashStartBtn.disabled = true; DOM.crashStartBtn.textContent = '⏳ 5 СЕК'; }
                            showCrashResult('lose', 0, status.multiplier);
                            loadBalance();
                            loadCrashStats();
                        }
                    });
                }, 100);
            });
        });
    });
}

function cashoutCrash() {
    if (!state.crashRunning || !state.crashGameId) return;
    apiRequest('/cashout_crash', { game_id: state.crashGameId }).then(data => {
        if (data.error) { showCustomAlert('❌ ' + data.error); return; }
        state.crashRunning = false;
        if (state.crashInterval) { clearInterval(state.crashInterval); state.crashInterval = null; }
        if (DOM.crashMultiplier) DOM.crashMultiplier.className = 'win';
        if (DOM.crashStatus) DOM.crashStatus.textContent = `💰 Выигрыш: ${data.winnings}⭐ (x${data.multiplier})`;
        if (DOM.crashCashoutBtn) DOM.crashCashoutBtn.style.display = 'none';
        if (DOM.crashStartBtn) { DOM.crashStartBtn.disabled = false; DOM.crashStartBtn.textContent = '🔄 ИГРАТЬ СНОВА'; }
        showCrashResult('win', data.winnings, data.multiplier);
        loadBalance();
        loadCrashStats();
    });
}

function showCrashResult(result, winnings, multiplier) {
    const overlay = document.createElement('div');
    overlay.id = 'crashResultOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '1000', padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    if (result === 'win') {
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">💰</div>
            <div style="font-size:32px; font-weight:800; color:#4caf50; margin-bottom:10px;">ВЫИГРЫШ!</div>
            <div style="font-size:28px; font-weight:700; color:#ffd700;">${winnings}⭐</div>
            <div style="color:#aaa; font-size:16px; margin-top:4px;">Множитель: x${multiplier}</div>
            <div style="display:flex; gap:16px; margin-top:20px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); resetCrashUI();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔄 ИГРАТЬ СНОВА</button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
            </div>
        `;
    } else {
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">💥</div>
            <div style="font-size:32px; font-weight:800; color:#f44336; margin-bottom:10px;">КРАШ!</div>
            <div style="color:#aaa; font-size:16px;">Множитель: x${multiplier}</div>
            <div style="color:#888; font-size:14px; margin-top:4px;">Ты потерял ставку</div>
            <div style="display:flex; gap:16px; margin-top:20px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); resetCrashUI();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #ff6b6b, #ee5a24); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔄 ИГРАТЬ СНОВА</button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
            </div>
        `;
    }
    document.body.appendChild(overlay);
}

function loadCrashStats() {
    apiRequest('/get_crash_stats').then(data => {
        if (DOM.crashGames) DOM.crashGames.textContent = data.games || 0;
        if (DOM.crashWins) DOM.crashWins.textContent = data.wins || 0;
        if (DOM.crashLosses) DOM.crashLosses.textContent = data.losses || 0;
        if (DOM.crashBestMultiplier) DOM.crashBestMultiplier.textContent = 'x' + (data.best_multiplier || 1.0);
    });
}

// ===== ПРОФИЛЬ =====
function showInvite() {
    const profile = document.querySelector('.profile-card');
    const invite = document.getElementById('inviteSection');
    if (profile) profile.style.display = 'none';
    if (invite) invite.style.display = 'block';
}

function hideInvite() {
    const profile = document.querySelector('.profile-card');
    const invite = document.getElementById('inviteSection');
    if (profile) profile.style.display = 'block';
    if (invite) invite.style.display = 'none';
}

function copyInvite() {
    const link = 'https://t.me/Randevucase_bot?start=' + user_id;
    navigator.clipboard.writeText(link).then(() => {
        showCustomAlert('✅ Ссылка скопирована!', true);
    }).catch(() => {
        showCustomAlert('❌ Не удалось скопировать');
    });
}

function showWithdraw() {
    const overlay = document.createElement('div');
    overlay.id = 'withdrawOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: '9999', padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    overlay.innerHTML = `
        <div style="background:rgba(255,255,255,0.05); border-radius:24px; padding:30px; max-width:380px; width:100%;">
            <h2 style="color:#fff; text-align:center; font-size:22px; margin-bottom:16px;">💸 ВЫВОД СРЕДСТВ</h2>
            <div style="color:#aaa; font-size:14px; text-align:center; margin-bottom:12px;">Минимальная сумма — 1000⭐</div>
            <input id="withdrawAmount" type="number" min="1000" placeholder="Введите сумму" style="width:100%; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; text-align:center;">
            <div style="display:flex; gap:12px; margin-top:16px;">
                <button onclick="submitWithdraw()" style="flex:1; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">✅ Отправить</button>
                <button onclick="this.closest('#withdrawOverlay').remove()" style="flex:1; padding:14px; border:none; border-radius:12px; background:rgba(255,0,0,0.15); color:#ff6b6b; font-weight:700; font-size:16px; cursor:pointer;">❌ Отмена</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function submitWithdraw() {
    const input = document.getElementById('withdrawAmount');
    if (!input) return;
    const amount = parseInt(input.value);
    if (isNaN(amount) || amount < 1000) { showCustomAlert('❌ Минимальная сумма — 1000⭐'); return; }
    const overlay = document.getElementById('withdrawOverlay');
    if (overlay) overlay.remove();
    apiRequest('/withdraw_request', { amount }).then(data => {
        if (data.success) {
            showCustomAlert('✅ Заявка отправлена! Админ свяжется с вами.', true);
        } else {
            showCustomAlert('❌ ' + data.error);
        }
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
initCrashChart();
loadBalance();
loadMinesStats();
loadCrashStats();
startCrashPolling();
initMinesBoard();
tg.ready();

console.log('🚀 RANDEVU v12.0 загружен!');
console.log('👤 ID:', user_id);
console.log('📛 Username:', username);
