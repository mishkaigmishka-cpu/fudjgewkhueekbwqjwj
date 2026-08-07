// ===============================
// RANDEVU — FINAL SCRIPT v9.0
// ВСЕ ИСПРАВЛЕНИЯ ВНЕСЕНЫ
// КРАШ: ПАУЗА 5 СЕКУНД, СТАВКИ ТОЛЬКО В ПАУЗЕ
// БИТВА С БОТОМ: АНИМАЦИЯ 8.5 СЕКУНД
// БИТВА PVP: ИСПРАВЛЕНА СЕТЕВАЯ ОШИБКА
// ===============================

const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;

if (!user_id) {
    showCustomAlert('❌ Ошибка: не удалось получить ID пользователя.');
}

// ===== КОНФИГУРАЦИЯ =====
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
        'bedrock': [1000,1200,1400,1600,1800,2000,2200,2400,2500,2600,2800,3000,3200,3500,4000,4500,5000,5500,6000,7000,8000,9000,10000,12000,15000,18000,20000,22000,25000,28000,30000,50000,100000]
    },
    CASE_PRICES: {
        'free':0,'mud':5,'wood':9,'stone':19,'bronze':49,'silver':99,'gold':249,'diamond':499,'netherite':999,'bedrock':2499
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
        'bedrock': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(52,73,94,0.7)', titleColor:'#5d6d7e', itemColor:'#aeb6bf', highlightColor:'#ffd700', glowColor:'rgba(52,73,94,0.4)', shadowColor:'rgba(52,73,94,0.6)', icon:'⛏️', bgGradient:'radial-gradient(circle at 50% 50%, rgba(52,73,94,0.1), transparent 70%)' }
    },
    MINES_MULTIPLIERS: {
        3: {1:1.05, 2:1.15, 3:1.30, 4:1.50, 5:1.75, 6:2.10, 7:2.50, 8:3.00, 9:3.50, 10:4.20, 11:5.00, 12:6.00},
        4: {1:1.10, 2:1.20, 3:1.40, 4:1.70, 5:2.00, 6:2.40, 7:3.00, 8:3.80, 9:4.50, 10:5.50, 11:6.50, 12:8.00},
        5: {1:1.15, 2:1.30, 3:1.55, 4:1.90, 5:2.30, 6:2.80, 7:3.50, 8:4.50, 9:5.50, 10:6.50, 11:8.00, 12:10.00},
        6: {1:1.20, 2:1.40, 3:1.70, 4:2.10, 5:2.60, 6:3.20, 7:4.00, 8:5.00, 9:6.50, 10:8.00, 11:10.00, 12:12.00},
        7: {1:1.25, 2:1.50, 3:1.85, 4:2.30, 5:2.90, 6:3.60, 7:4.50, 8:5.50, 9:7.50, 10:9.00, 11:12.00, 12:15.00},
        8: {1:1.30, 2:1.60, 3:2.00, 4:2.50, 5:3.20, 6:4.00, 7:5.00, 8:6.50, 9:8.50, 10:10.00, 11:14.00, 12:18.00}
    }
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const getPrizes = (type) => CONFIG.CASE_PRIZES[type] || [1,10,100];
const getStyle = (type) => CONFIG.CASE_STYLES[type] || CONFIG.CASE_STYLES['free'];
const getPrice = (type) => CONFIG.CASE_PRICES[type] || 0;
const getMinesMultiplier = (opened, mines) => CONFIG.MINES_MULTIPLIERS[mines]?.[opened] || 1.00;

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

const createCardElement = (value, style, width = 90, height = 140) => {
    const isLarge = value > 1000;
    const fontSize = isLarge ? '16px' : '20px';
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.value = value;
    Object.assign(div.style, {
        width: width + 'px',
        height: height + 'px',
        flexShrink: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: fontSize,
        fontWeight: '700',
        color: style.itemColor,
        textShadow: `0 0 20px ${style.glowColor}`,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '0 4px'
    });
    div.textContent = value + '⭐';
    return div;
};

const animateTrack = (track, shift, duration = 6000) => {
    if (!track) return;
    track.style.transition = `transform ${duration}ms cubic-bezier(0.1, 1, 0.1, 1)`;
    track.style.transform = `translateX(-${shift}px)`;
};

// ===== КАСТОМНОЕ ОКНО В ПРИЛОЖЕНИИ =====
function showCustomAlert(message, isSuccess = false) {
    const overlay = document.createElement('div');
    overlay.id = 'customAlertOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    
    const color = isSuccess ? '#4caf50' : '#ff6b6b';
    const icon = isSuccess ? '✅' : '❌';
    
    overlay.innerHTML = `
        <div style="font-size:48px; margin-bottom:10px;">${icon}</div>
        <div style="font-size:20px; font-weight:600; color:${color}; text-align:center; max-width:350px; word-wrap:break-word;">${message}</div>
        <button onclick="this.closest('#customAlertOverlay').remove()" style="margin-top:20px; padding:12px 40px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.2s;">
            OK
        </button>
    `;
    
    document.body.appendChild(overlay);
}

// ===== DOM КЭШ =====
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
    crashBestMultiplier: document.getElementById('crashBestMultiplier')
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
    pvpData: null
};

// ===== ЗАКРЫТИЕ ВСЕХ ОВЕРЛЕЕВ =====
function closeAllOverlays() {
    const ids = [
        'tapeContainer',
        'resultContainer',
        'battlePreviewOverlay',
        'battleRouletteOverlay',
        'botRouletteOverlay',
        'battleResultOverlay',
        'botBattleResultOverlay',
        'minesResultOverlay',
        'crashResultOverlay',
        'result',
        'customAlertOverlay'
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
        DOM.minesCashoutBtn.style.display = 'none';
        DOM.minesStartBtn.textContent = '🎮 НАЧАТЬ ИГРУ';
        DOM.minesBetDisplay.textContent = '0';
        DOM.minesCountDisplay.textContent = '0';
        DOM.minesTotalSafe.textContent = '0';
        DOM.minesOpenedDisplay.textContent = '0';
        DOM.minesMultiplierDisplay.textContent = 'x1.0';
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
        updateAllBalances(data.balance);
        if (DOM.profileCases) DOM.profileCases.textContent = data.total_cases;
        if (DOM.profileStatus) DOM.profileStatus.textContent = data.status;
        if (DOM.profileRefs) DOM.profileRefs.textContent = data.refs;
        if (DOM.inviteLink) DOM.inviteLink.value = 'https://t.me/Randevucase_bot?start=' + user_id;
    }
}

function updateAllBalances(newBalance) {
    if (DOM.balance) DOM.balance.textContent = '⭐ ' + newBalance;
    if (DOM.balanceValue) DOM.balanceValue.textContent = newBalance + ' ⭐';
    if (DOM.profileBalance) DOM.profileBalance.textContent = newBalance;
}

// ===== КЕЙСЫ =====
async function checkBalance(type) {
    const data = await apiRequest('/check_balance', { case_type: type });
    if (data.error) { showCustomAlert('❌ ' + data.error); return false; }
    if (!data.can_open) { showCustomAlert('❌ Недостаточно звёзд или время не прошло!'); return false; }
    return true;
}

async function fetchRealPrize(type) {
    const data = await apiRequest('/get_prize', { case_type: type });
    if (data.error) { showCustomAlert('❌ ' + data.error); return null; }
    return data.prize;
}

function previewCase(type) {
    if (state.isOpening) return;
    closeAllOverlays();
    showTape(type, 'preview');
}

function showTape(type, mode = 'preview') {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    const price = getPrice(type);
    closeAllOverlays();

    const tapeContainer = document.createElement('div');
    tapeContainer.id = 'tapeContainer';
    state.tapeContainer = tapeContainer;
    Object.assign(tapeContainer.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: style.bg,
        backgroundImage: style.bgGradient,
        backdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999',
        padding: '20px',
        border: 'none',
        animation: 'fadeIn 0.3s ease'
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
        fontSize: '24px',
        fontWeight: '800',
        color: style.titleColor,
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        textShadow: `0 0 40px ${style.glowColor}`,
        textAlign: 'center',
        flexShrink: '0'
    });
    title.textContent = `${style.icon} ${type.toUpperCase()} CASE`;
    tapeContainer.appendChild(title);

    const balanceDisplay = document.createElement('div');
    Object.assign(balanceDisplay.style, {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255,255,255,0.08)',
        padding: '10px 20px',
        borderRadius: '30px',
        fontSize: '18px',
        fontWeight: '700',
        color: '#FFD700',
        border: '1px solid rgba(255,215,0,0.2)',
        backdropFilter: 'blur(10px)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        zIndex: '10'
    });
    balanceDisplay.textContent = `💰 ${DOM.balance.textContent}`;
    tapeContainer.appendChild(balanceDisplay);

    const viewport = document.createElement('div');
    Object.assign(viewport.style, {
        width: '95%',
        maxWidth: '1400px',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.3)',
        height: mode === 'preview' ? '200px' : '150px',
        margin: '0 auto',
        flexShrink: '0'
    });

    const cardWidth = mode === 'preview' ? 90 : 130;
    const cardGap = mode === 'preview' ? 6 : 8;
    const totalItems = prizes.length;
    const oneSetWidth = totalItems * (cardWidth + cardGap);

    const track = document.createElement('div');
    track.id = 'track';
    Object.assign(track.style, {
        display: 'flex',
        gap: cardGap + 'px',
        padding: '20px 0',
        willChange: 'transform',
        position: 'relative',
        top: mode === 'preview' ? '15px' : '10px'
    });

    const repeats = mode === 'preview' ? 20 : 60;
    const winPosition = 40;
    let cards = [];
    for (let i = 0; i < repeats; i++) {
        let value;
        if (mode === 'preview') {
            value = prizes[i % prizes.length];
        } else {
            if (i === winPosition && state.currentPrize !== null) {
                value = state.currentPrize;
            } else {
                value = prizes[Math.floor(Math.random() * prizes.length)];
            }
        }
        const el = createCardElement(value, style, cardWidth, mode === 'preview' ? 140 : 120);
        cards.push(el);
    }
    cards.forEach(c => track.appendChild(c));
    viewport.appendChild(track);

    if (mode === 'preview') {
        const scrollStyle = document.createElement('style');
        scrollStyle.id = 'previewScrollStyle';
        scrollStyle.textContent = `
            @keyframes scrollTapeForward {
                0% { transform: translateX(0); }
                100% { transform: translateX(-${oneSetWidth}px); }
            }
        `;
        document.head.appendChild(scrollStyle);
        track.style.animation = `scrollTapeForward 7.875s linear infinite`;
    } else {
        const marker = document.createElement('div');
        Object.assign(marker.style, {
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '36px',
            color: style.highlightColor,
            textShadow: `0 0 30px ${style.highlightColor}`,
            zIndex: '10',
            pointerEvents: 'none',
            lineHeight: '1'
        });
        marker.textContent = '▼';
        viewport.appendChild(marker);
        tapeContainer._track = track;
        tapeContainer._viewport = viewport;
    }

    tapeContainer.appendChild(viewport);

    const bottomSection = document.createElement('div');
    Object.assign(bottomSection.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: mode === 'preview' ? '20px 0 8px 0' : '16px 0 8px 0',
        flexShrink: '0'
    });

    if (mode === 'preview') {
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex; gap:14px; flex-wrap:wrap; justify-content:center;';
        const userBalance = parseInt(DOM.balance.textContent.replace('⭐ ', ''));
        const hasEnough = userBalance >= price;

        if (hasEnough) {
            const openBtn = document.createElement('button');
            openBtn.textContent = `🎲 Открыть (${price}⭐)`;
            Object.assign(openBtn.style, {
                background: `linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd)`,
                color: '#fff',
                border: 'none',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 4px 30px ${style.shadowColor}`,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                minWidth: '170px'
            });
            openBtn.onclick = () => openCaseDirect(type);
            btnContainer.appendChild(openBtn);
        } else {
            const lockedBtn = document.createElement('button');
            lockedBtn.textContent = `🔒 Недостаточно (${price}⭐)`;
            Object.assign(lockedBtn.style, {
                background: 'rgba(255,0,0,0.12)',
                color: '#888',
                border: '2px solid rgba(255,0,0,0.25)',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'not-allowed',
                minWidth: '170px'
            });
            btnContainer.appendChild(lockedBtn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '🔙 Назад';
        Object.assign(closeBtn.style, {
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '14px 40px',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '170px'
        });
        closeBtn.onclick = () => { closeAllOverlays(); showMain(); };
        btnContainer.appendChild(closeBtn);
        bottomSection.appendChild(btnContainer);

        const previewLabel = document.createElement('div');
        previewLabel.textContent = '👀 Предпросмотр наград';
        Object.assign(previewLabel.style, {
            color: style.titleColor,
            fontSize: '14px',
            fontWeight: '500',
            opacity: '0.5',
            textAlign: 'center',
            letterSpacing: '1px',
            marginTop: '4px'
        });
        bottomSection.appendChild(previewLabel);
    } else {
        const loadingLabel = document.createElement('div');
        loadingLabel.textContent = '🎰 Открытие...';
        Object.assign(loadingLabel.style, {
            color: style.titleColor,
            fontSize: '16px',
            fontWeight: '600',
            opacity: '0.6',
            textAlign: 'center',
            letterSpacing: '1px'
        });
        bottomSection.appendChild(loadingLabel);
    }

    tapeContainer.appendChild(bottomSection);
    document.body.appendChild(tapeContainer);

    if (!document.getElementById('tapeFadeStyle')) {
        const fadeStyle = document.createElement('style');
        fadeStyle.id = 'tapeFadeStyle';
        fadeStyle.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;
        document.head.appendChild(fadeStyle);
    }
}

function openCaseDirect(type) {
    if (state.isOpening) return;
    state.isOpening = true;
    state.lastOpenedCase = type;
    
    checkBalance(type).then(canOpen => {
        if (!canOpen) { state.isOpening = false; return; }
        fetchRealPrize(type).then(prize => {
            if (prize === null) { state.isOpening = false; return; }
            state.currentPrize = prize;
            closeAllOverlays();
            showTape(type, 'roulette');
            setTimeout(() => startFinalSpin(type), 300);
        });
    });
}

function startFinalSpin(type) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    const tapeContainer = document.getElementById('tapeContainer');
    if (!tapeContainer) return;

    const track = tapeContainer._track;
    const viewport = tapeContainer._viewport;
    const targetPrize = state.currentPrize;
    if (targetPrize === null) { showCustomAlert('❌ Ошибка: награда не получена'); closeAllOverlays(); return; }

    const cardWidth = 130;
    const cardGap = 8;
    const totalCardWidth = cardWidth + cardGap;
    const totalCards = 60;
    const winPosition = 40;

    const newCards = [];
    for (let i = 0; i < totalCards; i++) {
        let value;
        if (i === winPosition) {
            value = targetPrize;
        } else {
            value = prizes[Math.floor(Math.random() * prizes.length)];
        }
        const el = createCardElement(value, style, 130, 120);
        newCards.push(el);
    }
    track.innerHTML = '';
    newCards.forEach(c => track.appendChild(c));

    const viewportWidth = viewport.offsetWidth || 700;
    const centerOffset = viewportWidth / 2;
    const shift = (winPosition * totalCardWidth) - centerOffset + (cardWidth / 2);
    const noise = Math.floor(Math.random() * 40) - 20;
    const finalShift = shift + noise;

    animateTrack(track, finalShift);

    let finished = false;
    const onFinish = () => {
        if (finished) return;
        finished = true;
        track.removeEventListener('transitionend', onFinish);
        showResultAndClaim(type, targetPrize, style, track, winPosition);
    };
    track.addEventListener('transitionend', onFinish);
    setTimeout(() => {
        if (!finished) {
            finished = true;
            track.removeEventListener('transitionend', onFinish);
            showResultAndClaim(type, targetPrize, style, track, winPosition);
        }
    }, 7000);
}

function showResultAndClaim(type, targetPrize, style, track, winPosition) {
    const cards = track.querySelectorAll('.card');
    cards.forEach(el => {
        el.style.background = 'rgba(255,255,255,0.04)';
        el.style.border = '1px solid rgba(255,255,255,0.06)';
        el.style.color = style.itemColor;
        el.style.textShadow = `0 0 20px ${style.glowColor}`;
    });

    const winCard = cards[winPosition];
    if (winCard) {
        winCard.style.background = 'rgba(255,215,0,0.15)';
        winCard.style.border = `2px solid ${style.highlightColor}`;
        winCard.style.color = '#FFFFFF';
        winCard.style.textShadow = `0 0 30px ${style.highlightColor}`;
    }

    setTimeout(() => {
        const resultContainer = document.createElement('div');
        resultContainer.id = 'resultContainer';
        Object.assign(resultContainer.style, {
            position: 'fixed',
            top: '0', left: '0', right: '0', bottom: '0',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
            padding: '30px',
            animation: 'fadeIn 0.3s ease'
        });

        const balanceDisplay = document.createElement('div');
        Object.assign(balanceDisplay.style, {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: '700',
            color: '#FFD700',
            border: '1px solid rgba(255,215,0,0.2)',
            backdropFilter: 'blur(10px)',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        });
        balanceDisplay.textContent = `💰 ${DOM.balance.textContent}`;
        resultContainer.appendChild(balanceDisplay);

        const winText = document.createElement('div');
        Object.assign(winText.style, {
            fontSize: '64px',
            fontWeight: '900',
            color: '#FFD700',
            textShadow: '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3)',
            marginBottom: '10px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textAlign: 'center'
        });
        winText.textContent = `⭐ ${targetPrize}`;

        const subText = document.createElement('div');
        Object.assign(subText.style, {
            fontSize: '24px',
            fontWeight: '600',
            color: '#FFF8E7',
            textShadow: '0 0 20px rgba(255,215,0,0.3)',
            marginBottom: '30px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        });
        subText.textContent = 'Ты выиграл!';

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex; gap:16px; flex-wrap:wrap; justify-content:center;';

        const price = getPrice(type);
        const againBtn = document.createElement('button');
        againBtn.textContent = `🎲 Открыть ещё (${price}⭐)`;
        Object.assign(againBtn.style, {
            background: `linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd)`,
            color: '#fff',
            border: 'none',
            padding: '14px 36px',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: `0 4px 30px ${style.shadowColor}`,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            minWidth: '160px'
        });
        againBtn.onclick = function() {
            closeAllOverlays();
            setTimeout(() => {
                openCaseDirect(type);
            }, 300);
        };

        const backBtn = document.createElement('button');
        backBtn.textContent = '🔙 Назад';
        Object.assign(backBtn.style, {
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '14px 36px',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '160px'
        });
        backBtn.onclick = function() {
            closeAllOverlays();
            showMain();
        };

        btnContainer.appendChild(againBtn);
        btnContainer.appendChild(backBtn);

        resultContainer.appendChild(winText);
        resultContainer.appendChild(subText);
        resultContainer.appendChild(btnContainer);
        document.body.appendChild(resultContainer);

        setTimeout(async () => {
            try {
                const res = await fetch('/open_case', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user_id: user_id, 
                        case_type: type,
                        prize: targetPrize
                    })
                });
                const data = await res.json();
                if (data.error) {
                    showCustomAlert('❌ ' + data.error);
                } else {
                    updateAllBalances(data.new_balance);
                    const balanceDisplayEl = resultContainer.querySelector('div[style*="position: absolute"]');
                    if (balanceDisplayEl) {
                        balanceDisplayEl.textContent = `💰 ⭐ ${data.new_balance}`;
                    }
                }
            } catch(e) {
                showCustomAlert('❌ Ошибка при открытии кейса');
            }
        }, 300);

    }, 300);
}

function closeTape() {
    closeAllOverlays();
}

function closeResult() {
    closeAllOverlays();
}

function openAgain() {
    closeAllOverlays();
    if (state.lastOpenedCase) {
        setTimeout(() => {
            openCaseDirect(state.lastOpenedCase);
        }, 300);
    }
}

// ===== БИТВЫ =====
function loadBattleData() {
    apiRequest('/get_battle_data').then(data => {
        document.getElementById('battleWins').textContent = data.wins || 0;
        document.getElementById('battleLosses').textContent = data.losses || 0;
        document.getElementById('battleCommission').textContent = data.commission || 0;
        renderBattleList(data.active_battles || []);
        renderBattleHistory(data.history || []);
    });
}

function renderBattleList(battles) {
    const container = document.getElementById('battleList');
    if (!battles || battles.length === 0) {
        container.innerHTML = '<div class="empty-state">⚔️ Нет активных битв</div>';
        return;
    }
    container.innerHTML = battles.map(b => `
        <div class="battle-card">
            <div class="battle-info">
                <span>👤 ${b.player1} vs ${b.player2}</span>
                <span>📦 ${b.case_type || 'выбор...'}</span>
                <span class="status ${b.status}">${b.status}</span>
            </div>
        </div>
    `).join('');
}

function renderBattleHistory(history) {
    const container = document.getElementById('battleHistory');
    if (!history || history.length === 0) {
        container.innerHTML = '<div class="empty-state">📜 Нет истории битв</div>';
        return;
    }
    container.innerHTML = history.map(h => `
        <div class="history-item ${h.won ? 'win' : 'lose'}">
            <span>${h.won ? '🏆' : '💀'} ${h.opponent}</span>
            <span>${h.won ? '+' : '-'}${h.stars}⭐</span>
        </div>
    `).join('');
}

// ===== КОМНАТЫ =====
function loadBattleRooms() {
    apiRequest('/get_battle_rooms').then(data => {
        const list = document.getElementById('battleRoomsList');
        const rooms = data.rooms || [];
        
        let html = '';
        const myRooms = rooms.filter(r => r.is_my_room);
        const otherRooms = rooms.filter(r => !r.is_my_room);
        
        if (myRooms.length > 0) {
            html += `<div style="color: #ffd700; font-size: 14px; margin-bottom: 8px;">⭐ ТВОИ КОМНАТЫ:</div>`;
            myRooms.forEach(r => {
                html += `
                    <div class="room-item" style="border-color: rgba(255,215,0,0.3);">
                        <span class="room-creator">👤 Игрок 1 vs Игрок 2</span>
                        <span class="room-case">📦 ${r.case_type}</span>
                        <span class="room-players">👥 ${r.players_count}/2</span>
                        <button class="btn-join" onclick="joinBattleRoom('${r.room_id}')">⚔️ ВЕРНУТЬСЯ</button>
                    </div>
                `;
            });
        }
        
        if (otherRooms.length > 0) {
            html += `<div style="color: #aaa; font-size: 14px; margin: 8px 0;">📋 ДРУГИЕ КОМНАТЫ:</div>`;
            otherRooms.forEach(r => {
                html += `
                    <div class="room-item">
                        <span class="room-creator">👤 Игрок 1</span>
                        <span class="room-case">📦 ${r.case_type}</span>
                        <span class="room-players">👥 ${r.players_count}/2</span>
                        <button class="btn-join" onclick="joinBattleRoom('${r.room_id}')">⚔️ ПРИСОЕДИНИТЬСЯ</button>
                    </div>
                `;
            });
        }
        
        if (!html) {
            html = '<div class="empty-state">🏠 Нет активных комнат. Создай свою!</div>';
        }
        
        list.innerHTML = html;
    });
}

function checkActiveRoom() {
    apiRequest('/get_user_room').then(data => {
        if (data.room_id) {
            const room = data.room;
            showBattlePreview(data.room_id, room.case_type, room.player1, room.player2, false);
            startListeningForOpponent(data.room_id);
            startOpponentChecker(data.room_id);
        }
    });
}

function showCreateBattle() {
    document.getElementById('createBattleModal').classList.add('active');
}

function closeCreateBattle() {
    document.getElementById('createBattleModal').classList.remove('active');
}

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
    
    apiRequest('/create_battle_room', { case_type }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        if (!data.room_id) {
            showCustomAlert('❌ Не удалось создать комнату');
            return;
        }
        state.currentRoomId = data.room_id;
        closeCreateBattle();
        showWaitingRoom(data.room_id, data.case_type);
        startListeningForOpponent(data.room_id);
        startOpponentChecker(data.room_id);
    });
}

function showWaitingRoom(room_id, case_type) {
    document.getElementById('waitingRoom').style.display = 'block';
    document.getElementById('waitingRoomRoomId').textContent = room_id;
    document.getElementById('waitingRoomCase').textContent = case_type.toUpperCase();
    document.getElementById('battlesScreen').querySelector('.battle-stats').style.display = 'none';
    document.getElementById('battlesScreen').querySelector('.battle-actions').style.display = 'none';
    document.getElementById('battlesScreen').querySelector('#battleRoomsList').style.display = 'none';
}

function exitWaitingRoom() {
    if (window.opponentInterval) clearInterval(window.opponentInterval);
    if (window.opponentChecker) clearInterval(window.opponentChecker);
    
    if (state.currentRoomId) {
        apiRequest('/exit_battle_room', { room_id: state.currentRoomId }).then(() => {
            state.currentRoomId = null;
            document.getElementById('waitingRoom').style.display = 'none';
            document.getElementById('battlesScreen').querySelector('.battle-stats').style.display = 'flex';
            document.getElementById('battlesScreen').querySelector('.battle-actions').style.display = 'flex';
            document.getElementById('battlesScreen').querySelector('#battleRoomsList').style.display = 'block';
            showBattles();
        });
    } else {
        document.getElementById('waitingRoom').style.display = 'none';
        document.getElementById('battlesScreen').querySelector('.battle-stats').style.display = 'flex';
        document.getElementById('battlesScreen').querySelector('.battle-actions').style.display = 'flex';
        document.getElementById('battlesScreen').querySelector('#battleRoomsList').style.display = 'block';
        showBattles();
    }
}

function joinBattleRoom(room_id) {
    apiRequest('/join_battle_room', { room_id }).then(data => {
        if (data.error) {
            if (data.already_in_room) {
                showCustomAlert('⚠️ Ты уже в этой комнате');
                return;
            }
            showCustomAlert('❌ ' + data.error);
            return;
        }
        if (data.success) {
            state.currentRoomId = data.room_id;
            showBattlePreview(data.room_id, data.case_type, 'Игрок 1', 'Игрок 2', false);
            syncPreviewStart(data.room_id);
            startOpponentChecker(data.room_id);
        }
    });
}

// ===== ПРЕДПРОСМОТР БИТВЫ =====
function showBattlePreview(room_id, case_type, player1, player2, isBot) {
    const style = getStyle(case_type);
    const prizes = getPrizes(case_type);
    
    const overlay = document.createElement('div');
    overlay.id = 'battlePreviewOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: style.bg,
        backgroundImage: style.bgGradient,
        backdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999',
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
    });
    
    const title = document.createElement('div');
    Object.assign(title.style, {
        fontSize: '24px',
        fontWeight: '800',
        color: style.titleColor,
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        textShadow: `0 0 40px ${style.glowColor}`,
        textAlign: 'center'
    });
    title.textContent = isBot ? '🤖 БИТВА С БОТОМ' : '⚔️ БИТВА КЕЙСОВ';
    overlay.appendChild(title);
    
    const readyIndicator = document.createElement('div');
    readyIndicator.style.cssText = 'display:flex; justify-content:space-between; width:100%; max-width:700px; margin-bottom:8px;';
    readyIndicator.innerHTML = `
        <span id="player1Ready" style="color:#888; font-size:13px;">⏳ ${player1}: ОЖИДАНИЕ...</span>
        <span id="player2Ready" style="color:#888; font-size:13px;">⏳ ${player2}: ОЖИДАНИЕ...</span>
    `;
    overlay.appendChild(readyIndicator);
    
    const playersContainer = document.createElement('div');
    playersContainer.style.cssText = 'display:flex; gap:20px; justify-content:center; align-items:stretch; width:100%; max-width:700px; margin-bottom:16px;';
    
    const p1Container = document.createElement('div');
    p1Container.style.cssText = 'flex:1; text-align:center; display:flex; flex-direction:column;';
    let p1Cards = '';
    for (let r = 0; r < 4; r++) {
        prizes.forEach(p => {
            const isLarge = p > 1000;
            p1Cards += `<div class="preview-card" style="width:70px; height:100px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${isLarge ? '16px' : '20px'}; font-weight:700; color:${style.itemColor}; text-shadow:0 0 20px ${style.glowColor};">${p}⭐</div>`;
        });
    }
    const totalWidth = prizes.length * 76 * 4;
    p1Container.innerHTML = `
        <div style="font-size:14px; color:#aaa; margin-bottom:6px;">👤 ${player1}</div>
        <div style="position:relative; overflow:hidden; border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); height:120px; flex:1;">
            <div id="previewTrack1" style="display:flex; gap:6px; padding:10px 0; animation:scrollTapeForward ${prizes.length * 2}s linear infinite; will-change:transform; position:relative; width:${totalWidth}px;">
                ${p1Cards}
            </div>
            <div style="position:absolute; top:-6px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 20px ${style.highlightColor}; pointer-events:none; line-height:1;">▼</div>
        </div>
    `;
    playersContainer.appendChild(p1Container);
    
    const vsDiv = document.createElement('div');
    vsDiv.style.cssText = 'display:flex; align-items:center; font-size:28px; font-weight:900; color:#ff6b6b; text-shadow:0 0 30px rgba(255,0,0,0.3); flex-shrink:0;';
    vsDiv.textContent = isBot ? '🤖' : '⚔️';
    playersContainer.appendChild(vsDiv);
    
    const p2Container = document.createElement('div');
    p2Container.style.cssText = 'flex:1; text-align:center; display:flex; flex-direction:column;';
    let p2Cards = '';
    for (let r = 0; r < 4; r++) {
        prizes.forEach(p => {
            const isLarge = p > 1000;
            p2Cards += `<div class="preview-card" style="width:70px; height:100px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${isLarge ? '16px' : '20px'}; font-weight:700; color:${style.itemColor}; text-shadow:0 0 20px ${style.glowColor};">${p}⭐</div>`;
        });
    }
    p2Container.innerHTML = `
        <div style="font-size:14px; color:#aaa; margin-bottom:6px;">👤 ${player2}</div>
        <div style="position:relative; overflow:hidden; border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); height:120px; flex:1;">
            <div id="previewTrack2" style="display:flex; gap:6px; padding:10px 0; animation:scrollTapeForward ${prizes.length * 2}s linear infinite; will-change:transform; position:relative; width:${totalWidth}px;">
                ${p2Cards}
            </div>
            <div style="position:absolute; top:-6px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 20px ${style.highlightColor}; pointer-events:none; line-height:1;">▼</div>
        </div>
    `;
    playersContainer.appendChild(p2Container);
    
    overlay.appendChild(playersContainer);
    
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'color:#aaa; font-size:14px; text-align:center; margin-bottom:16px;';
    infoDiv.textContent = `📦 Кейс: ${case_type.toUpperCase()}`;
    overlay.appendChild(infoDiv);
    
    const readyBtn = document.createElement('button');
    readyBtn.id = 'battleReadyBtn';
    readyBtn.textContent = '✅ ГОТОВ';
    readyBtn.style.cssText = 'padding:14px 40px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-size:18px; font-weight:700; cursor:pointer; transition:all 0.2s; margin-bottom:10px;';
    readyBtn.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
    readyBtn.onmouseout = function() { this.style.transform = 'scale(1)'; };
    
    if (isBot) {
        readyBtn.onclick = function() {
            this.textContent = '⏳ ОЖИДАНИЕ...';
            this.style.background = 'linear-gradient(135deg, #ff9800, #e65100)';
            this.disabled = true;
            const statusEl = document.getElementById('battlePreviewStatus');
            if (statusEl) statusEl.textContent = '🤖 Бот готов! Битва начинается...';
            setTimeout(() => {
                closeAllOverlays();
                startBotBattleAnimation(state.selectedBotCase);
            }, 500);
        };
        const statusEl = document.getElementById('battlePreviewStatus');
        if (statusEl) statusEl.textContent = '🤖 Бот готов! Нажми «ГОТОВ», чтобы начать';
    } else {
        readyBtn.onclick = function() {
            this.textContent = '⏳ ОЖИДАНИЕ...';
            this.style.background = 'linear-gradient(135deg, #ff9800, #e65100)';
            this.disabled = true;
            const statusEl = document.getElementById('battlePreviewStatus');
            if (statusEl) statusEl.textContent = '⏳ Ожидание соперника...';
            sendBattleReady(room_id);
        };
    }
    overlay.appendChild(readyBtn);
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'battlePreviewStatus';
    statusDiv.style.cssText = 'color:#666; font-size:14px; text-align:center;';
    statusDiv.textContent = isBot ? 'Нажми «ГОТОВ», чтобы начать битву с ботом' : 'Нажми «ГОТОВ», чтобы начать битву';
    overlay.appendChild(statusDiv);
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 НАЗАД';
    backBtn.style.cssText = 'padding:12px 30px; border:none; border-radius:12px; background:rgba(255,255,255,0.06); color:#888; font-size:14px; font-weight:600; cursor:pointer; margin-top:6px; transition:all 0.2s;';
    backBtn.onmouseover = function() { this.style.background = 'rgba(255,255,255,0.12)'; };
    backBtn.onmouseout = function() { this.style.background = 'rgba(255,255,255,0.06)'; };
    backBtn.onclick = function() {
        if (window.opponentInterval) clearInterval(window.opponentInterval);
        if (window.opponentChecker) clearInterval(window.opponentChecker);
        
        if (state.currentRoomId) {
            apiRequest('/exit_battle_room', { room_id: state.currentRoomId }).then(() => {
                state.currentRoomId = null;
                closeAllOverlays();
                showBattles();
            });
        } else {
            closeAllOverlays();
            showBattles();
        }
    };
    overlay.appendChild(backBtn);
    
    document.body.appendChild(overlay);
}

function sendBattleReady(room_id) {
    apiRequest('/battle_ready', { room_id }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            if (data.error.includes('не в этой комнате') || data.error.includes('не найдена')) {
                showCustomAlert('❌ Соперник вышел из комнаты!');
                closeAllOverlays();
                showBattles();
            }
            const btn = document.getElementById('battleReadyBtn');
            if (btn) {
                btn.textContent = '✅ ГОТОВ';
                btn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
                btn.disabled = false;
            }
            return;
        }
        
        if (data.ready) {
            const statusEl = document.getElementById('battlePreviewStatus');
            if (statusEl) statusEl.textContent = '✅ Оба игрока готовы! Битва начинается...';
            setTimeout(() => {
                closeAllOverlays();
                startPvpBattle(room_id);
            }, 1000);
        } else {
            const statusEl = document.getElementById('battlePreviewStatus');
            if (statusEl) statusEl.textContent = '⏳ Ожидание соперника...';
        }
    });
}

function syncPreviewStart(room_id) {
    apiRequest('/sync_battle_preview', { room_id }).then(data => {
        if (data.error) {
            console.error('Sync error:', data.error);
            return;
        }
        updatePreviewNames(data.me, data.opponent);
        updateReadyStatus(data.ready_status);
    });
}

function updatePreviewNames(me, opponent) {
    const p1Ready = document.getElementById('player1Ready');
    const p2Ready = document.getElementById('player2Ready');
    if (p1Ready) p1Ready.textContent = '⏳ ' + me + ': ОЖИДАНИЕ...';
    if (p2Ready) p2Ready.textContent = '⏳ ' + opponent + ': ОЖИДАНИЕ...';
}

function updateReadyStatus(readyStatus) {
    const p1El = document.getElementById('player1Ready');
    const p2El = document.getElementById('player2Ready');
    const btn = document.getElementById('battleReadyBtn');
    
    if (!p1El || !p2El) return;
    
    const p1Name = p1El.textContent.replace('⏳ ', '').replace(': ОЖИДАНИЕ...', '').replace(': ГОТОВ', '');
    const p2Name = p2El.textContent.replace('⏳ ', '').replace(': ОЖИДАНИЕ...', '').replace(': ГОТОВ', '');
    
    if (readyStatus && readyStatus[0]) {
        p1El.textContent = '✅ ' + p1Name + ': ГОТОВ';
        p1El.style.color = '#4caf50';
    } else {
        p1El.textContent = '⏳ ' + p1Name + ': ОЖИДАНИЕ...';
        p1El.style.color = '#888';
    }
    
    if (readyStatus && readyStatus[1]) {
        p2El.textContent = '✅ ' + p2Name + ': ГОТОВ';
        p2El.style.color = '#4caf50';
    } else {
        p2El.textContent = '⏳ ' + p2Name + ': ОЖИДАНИЕ...';
        p2El.style.color = '#888';
    }
    
    if (readyStatus && readyStatus[0] && readyStatus[1]) {
        if (btn) {
            btn.textContent = '✅ ОБА ГОТОВЫ';
            btn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
            btn.disabled = true;
        }
        const statusEl = document.getElementById('battlePreviewStatus');
        if (statusEl) statusEl.textContent = '✅ Оба игрока готовы! Битва начинается...';
    } else if (readyStatus && (readyStatus[0] || readyStatus[1])) {
        if (btn) {
            btn.textContent = '⏳ ОЖИДАНИЕ...';
            btn.style.background = 'linear-gradient(135deg, #ff9800, #e65100)';
            btn.disabled = true;
        }
        const statusEl = document.getElementById('battlePreviewStatus');
        if (statusEl) statusEl.textContent = '⏳ Ожидание соперника...';
    }
}

function startOpponentChecker(room_id) {
    if (window.opponentChecker) clearInterval(window.opponentChecker);
    window.opponentChecker = setInterval(() => {
        apiRequest('/check_room_status', { room_id }).then(data => {
            if (data.error || !data.room_exists) {
                clearInterval(window.opponentChecker);
                showCustomAlert('❌ Комната была удалена');
                closeAllOverlays();
                showBattles();
                return;
            }
            
            if (data.opponent_left) {
                clearInterval(window.opponentChecker);
                showCustomAlert('❌ Ваш соперник вышел из комнаты!');
                closeAllOverlays();
                showBattles();
                return;
            }
            
            if (data.opponent_joined === false && data.players_count === 1) {
                clearInterval(window.opponentChecker);
                showCustomAlert('❌ Ваш соперник вышел из комнаты!');
                closeAllOverlays();
                showBattles();
            }
        });
    }, 3000);
}

function startListeningForOpponent(room_id) {
    if (window.opponentInterval) clearInterval(window.opponentInterval);
    window.opponentInterval = setInterval(() => {
        apiRequest('/check_room_status', { room_id }).then(data => {
            if (data.error) {
                clearInterval(window.opponentInterval);
                return;
            }
            if (data.opponent_joined) {
                clearInterval(window.opponentInterval);
                document.getElementById('waitingRoom').style.display = 'none';
                document.getElementById('battlesScreen').querySelector('.battle-stats').style.display = 'flex';
                document.getElementById('battlesScreen').querySelector('.battle-actions').style.display = 'flex';
                document.getElementById('battlesScreen').querySelector('#battleRoomsList').style.display = 'block';
                
                showBattlePreview(room_id, data.case_type, 'ТЫ', data.player2, false);
                const btn = document.getElementById('battleReadyBtn');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = '✅ ГОТОВ';
                    btn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
                }
                const statusEl = document.getElementById('battlePreviewStatus');
                if (statusEl) statusEl.textContent = 'Нажми «ГОТОВ», чтобы начать битву';
                startOpponentChecker(room_id);
            }
        });
    }, 2000);
}

// ===== БИТВА С БОТОМ =====
function showBotBattle() {
    document.getElementById('botBattleModal').classList.add('active');
}

function closeBotBattle() {
    document.getElementById('botBattleModal').classList.remove('active');
}

function startBotBattle() {
    const case_type = state.selectedBotCase;
    let price = getPrice(case_type);
    if (price === 0) price = 5;
    
    apiRequest('/check_balance_simple', { amount: price }).then(data => {
        if (data.error || !data.has_enough) {
            showCustomAlert('❌ Недостаточно звёзд для открытия кейса!');
            return;
        }
        closeBotBattle();
        showBattlePreview(null, case_type, 'ТЫ', 'БОТ', true);
    });
}

function startBotBattleAnimation(case_type) {
    const style = getStyle(case_type);
    const prizes = getPrizes(case_type);
    
    apiRequest('/start_bot_battle', { case_type }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        
        const playerPrize = data.player_prize;
        const botPrize = data.bot_prize;
        const playerPos = prizes.indexOf(playerPrize);
        const botPos = prizes.indexOf(botPrize);
        const winPos1 = playerPos !== -1 ? playerPos : Math.floor(Math.random() * prizes.length);
        const winPos2 = botPos !== -1 ? botPos : Math.floor(Math.random() * prizes.length);
        
        const overlay = document.createElement('div');
        overlay.id = 'botRouletteOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: ${style.bg};
            background-image: ${style.bgGradient};
            backdrop-filter: blur(30px);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            z-index: 999; padding: 16px 20px;
            animation: fadeIn 0.3s ease;
        `;
        
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 22px; font-weight: 800; color: ${style.titleColor};
            margin-bottom: 12px; text-transform: uppercase; letter-spacing: 3px;
            text-shadow: 0 0 40px ${style.glowColor}; text-align: center;
            flex-shrink: 0;
        `;
        title.textContent = `🤖 ${case_type.toUpperCase()} BATTLE`;
        overlay.appendChild(title);
        
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex; flex-direction: column; gap: 8px;
            width: 100%; max-width: 600px; flex: 1; justify-content: center;
        `;
        
        const totalCards = 60;
        const cardWidth = 120;
        const cardGap = 8;
        
        function createTrack(winPrize, winPosition, isPlayer) {
            let html = '';
            for (let i = 0; i < totalCards; i++) {
                let value;
                if (i === winPosition) {
                    value = winPrize;
                } else {
                    value = prizes[Math.floor(Math.random() * prizes.length)];
                }
                const isLarge = value > 1000;
                const fontSize = isLarge ? '18px' : '24px';
                const color = isPlayer ? style.itemColor : style.itemColor;
                html += `<div class="roulette-card" style="width:${cardWidth}px; height:90px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${fontSize}; font-weight:700; color:${color}; text-shadow:0 0 20px ${style.glowColor};">${value}⭐</div>`;
            }
            return html;
        }
        
        const p1Wrapper = document.createElement('div');
        p1Wrapper.style.cssText = `
            flex: 1; display: flex; flex-direction: column; min-height: 0;
            border: 2px solid rgba(76,175,80,0.3); border-radius: 12px;
            padding: 6px; background: rgba(76,175,80,0.05);
        `;
        p1Wrapper.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#4caf50; text-align:center; margin-bottom:4px; flex-shrink:0; background:rgba(76,175,80,0.1); padding:4px 0; border-radius:6px;">👤 ИГРОК</div>
            <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); flex:1; min-height:100px;">
                <div id="botRouletteTrack1" style="display:flex; gap:${cardGap}px; padding:8px 0; transition:transform 8s cubic-bezier(0.1, 1, 0.1, 1); will-change:transform; position:relative; width:${totalCards * (cardWidth + cardGap)}px; height:100%; align-items:center;">
                    ${createTrack(playerPrize, winPos1, true)}
                </div>
                <div style="position:absolute; top:-4px; left:50%; transform:translateX(-50%); font-size:28px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1; z-index:5;">▼</div>
            </div>
        `;
        container.appendChild(p1Wrapper);
        
        const vsDiv = document.createElement('div');
        vsDiv.style.cssText = `
            text-align:center; font-size:28px; font-weight:900;
            color:#ff6b6b; text-shadow:0 0 30px rgba(255,0,0,0.3);
            flex-shrink:0; padding:4px 0;
        `;
        vsDiv.textContent = '🤖 VS';
        container.appendChild(vsDiv);
        
        const p2Wrapper = document.createElement('div');
        p2Wrapper.style.cssText = `
            flex: 1; display: flex; flex-direction: column; min-height: 0;
            border: 2px solid rgba(244,67,54,0.3); border-radius: 12px;
            padding: 6px; background: rgba(244,67,54,0.05);
        `;
        p2Wrapper.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:#f44336; text-align:center; margin-bottom:4px; flex-shrink:0; background:rgba(244,67,54,0.1); padding:4px 0; border-radius:6px;">🤖 БОТ</div>
            <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); flex:1; min-height:100px;">
                <div id="botRouletteTrack2" style="display:flex; gap:${cardGap}px; padding:8px 0; transition:transform 8s cubic-bezier(0.1, 1, 0.1, 1); will-change:transform; position:relative; width:${totalCards * (cardWidth + cardGap)}px; height:100%; align-items:center;">
                    ${createTrack(botPrize, winPos2, false)}
                </div>
                <div style="position:absolute; top:-4px; left:50%; transform:translateX(-50%); font-size:28px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1; z-index:5;">▼</div>
            </div>
        `;
        container.appendChild(p2Wrapper);
        
        overlay.appendChild(container);
        
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
            color:#888; font-size:14px; text-align:center; margin-top:8px;
            flex-shrink:0;
        `;
        infoDiv.textContent = `📦 ${case_type.toUpperCase()}`;
        overlay.appendChild(infoDiv);
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'botRouletteStatus';
        statusDiv.style.cssText = `
            color: ${style.titleColor}; font-size:16px; font-weight:600;
            opacity:0.6; text-align:center; letter-spacing:1px;
            flex-shrink:0; margin-top:4px;
        `;
        statusDiv.textContent = '🎰 Открытие...';
        overlay.appendChild(statusDiv);
        
        document.body.appendChild(overlay);
        
        const viewportWidth = window.innerWidth * 0.85;
        const centerOffset = viewportWidth / 2;
        const shift1 = (winPos1 * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
        const shift2 = (winPos2 * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
        
        setTimeout(() => {
            const track1 = document.getElementById('botRouletteTrack1');
            const track2 = document.getElementById('botRouletteTrack2');
            
            if (track1) {
                track1.style.transition = 'transform 8s cubic-bezier(0.1, 1, 0.1, 1)';
                track1.style.transform = `translateX(-${shift1}px)`;
            }
            if (track2) {
                track2.style.transition = 'transform 8s cubic-bezier(0.1, 1, 0.1, 1)';
                track2.style.transform = `translateX(-${shift2}px)`;
            }
        }, 300);
        
        setTimeout(() => {
            const track1 = document.getElementById('botRouletteTrack1');
            const track2 = document.getElementById('botRouletteTrack2');
            
            if (track1) {
                const cards1 = track1.querySelectorAll('.roulette-card');
                if (cards1[winPos1]) {
                    cards1[winPos1].style.background = 'rgba(255,215,0,0.2)';
                    cards1[winPos1].style.border = '2px solid #ffd700';
                    cards1[winPos1].style.color = '#ffd700';
                    cards1[winPos1].style.textShadow = '0 0 30px #ffd700';
                    cards1[winPos1].style.transform = 'scale(1.1)';
                }
            }
            
            if (track2) {
                const cards2 = track2.querySelectorAll('.roulette-card');
                if (cards2[winPos2]) {
                    cards2[winPos2].style.background = 'rgba(255,215,0,0.2)';
                    cards2[winPos2].style.border = '2px solid #ffd700';
                    cards2[winPos2].style.color = '#ffd700';
                    cards2[winPos2].style.textShadow = '0 0 30px #ffd700';
                    cards2[winPos2].style.transform = 'scale(1.1)';
                }
            }
            
            setTimeout(() => {
                overlay.remove();
                showBotBattleResult(data);
            }, 1500);
        }, 8500);
    });
}

function showBotBattleResult(data) {
    const overlay = document.createElement('div');
    overlay.id = 'botBattleResultOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    
    const iconMap = { 'win': '🎉', 'lose': '😢', 'draw': '🤝' };
    const titleMap = { 'win': 'ПОБЕДА!', 'lose': 'ПОРАЖЕНИЕ...', 'draw': 'НИЧЬЯ!' };
    const colorMap = { 'win': '#4caf50', 'lose': '#f44336', 'draw': '#ffd700' };
    
    const commissionHtml = data.commission !== undefined && data.commission > 0 
        ? `<div style="color:#888; font-size:12px;">💸 Комиссия: ${data.commission}⭐</div>` 
        : '';
    
    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${iconMap[data.result]}</div>
        <div style="font-size:32px; font-weight:800; color:${colorMap[data.result]}; margin-bottom:20px;">
            ${titleMap[data.result]}
        </div>
        <div style="display:flex; gap:40px; margin-bottom:20px;">
            <div style="text-align:center;">
                <div style="font-size:40px;">👤</div>
                <div style="font-weight:700; color:${data.result === 'win' ? '#4caf50' : '#aaa'};">ТЫ</div>
                <div style="font-size:28px; font-weight:800; color:#ffd700;">${data.player_prize}⭐</div>
            </div>
            <div style="display:flex; align-items:center; font-size:36px; color:#ff6b6b;">🤖</div>
            <div style="text-align:center;">
                <div style="font-size:40px;">🤖</div>
                <div style="font-weight:700; color:${data.result === 'lose' ? '#4caf50' : '#aaa'};">БОТ</div>
                <div style="font-size:28px; font-weight:800; color:#ffd700;">${data.bot_prize}⭐</div>
            </div>
        </div>
        <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center;">
            <div style="color:#aaa; font-size:14px;">${data.result_text}</div>
            ${commissionHtml}
            ${data.result === 'win' ? `<div style="color:#4caf50; font-size:16px; font-weight:700;">🏆 Ты получил: ${data.winnings}⭐</div>` : ''}
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeAllOverlays(); showBotBattle();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b388ff, #7c4dff); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                🤖 СНОВА
            </button>
            <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                🔙 НАЗАД
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    loadBattleData();
}

// ===== БИТВА PVP — ИСПРАВЛЕНА =====
function startPvpBattle(room_id) {
    if (!room_id) {
        showCustomAlert('❌ Ошибка: ID комнаты не передан');
        return;
    }
    
    apiRequest('/check_room_status', { room_id }).then(check => {
        if (check.error || !check.room_exists) {
            showCustomAlert('❌ Комната не найдена или уже удалена');
            closeAllOverlays();
            showBattles();
            return;
        }
        
        apiRequest('/get_pvp_prizes', { room_id }).then(prizeData => {
            if (prizeData.error) {
                showCustomAlert('❌ ' + prizeData.error);
                return;
            }
            
            apiRequest('/get_battle_animation_data', { room_id }).then(data => {
                if (data.error) {
                    showCustomAlert('❌ ' + data.error);
                    return;
                }
                
                const case_type = data.case_type;
                const style = getStyle(case_type);
                const prizes = getPrizes(case_type);
                
                const player1Prize = prizeData.player1_prize;
                const player2Prize = prizeData.player2_prize;
                
                const pos1 = prizes.indexOf(player1Prize);
                const pos2 = prizes.indexOf(player2Prize);
                const winPos1 = pos1 !== -1 ? pos1 : Math.floor(Math.random() * prizes.length);
                const winPos2 = pos2 !== -1 ? pos2 : Math.floor(Math.random() * prizes.length);
                
                const overlay = document.createElement('div');
                overlay.id = 'battleRouletteOverlay';
                overlay.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: ${style.bg};
                    background-image: ${style.bgGradient};
                    backdrop-filter: blur(30px);
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    z-index: 999; padding: 16px 20px;
                    animation: fadeIn 0.3s ease;
                `;
                
                const title = document.createElement('div');
                title.style.cssText = `
                    font-size: 20px; font-weight: 800; color: ${style.titleColor};
                    margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;
                    text-shadow: 0 0 40px ${style.glowColor}; text-align: center;
                    flex-shrink: 0;
                `;
                title.textContent = `⚔️ ${case_type.toUpperCase()} BATTLE`;
                overlay.appendChild(title);
                
                const container = document.createElement('div');
                container.style.cssText = `
                    display: flex; flex-direction: column; gap: 6px;
                    width: 100%; max-width: 600px; flex: 1; justify-content: center;
                `;
                
                const totalCards = 60;
                const cardWidth = 110;
                const cardGap = 8;
                
                function createTrack(winPrize, winPosition, color) {
                    let html = '';
                    for (let i = 0; i < totalCards; i++) {
                        let value;
                        if (i === winPosition) {
                            value = winPrize;
                        } else {
                            value = prizes[Math.floor(Math.random() * prizes.length)];
                        }
                        const isLarge = value > 1000;
                        const fontSize = isLarge ? '16px' : '22px';
                        html += `<div class="roulette-card" style="width:${cardWidth}px; height:85px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${fontSize}; font-weight:700; color:${color}; text-shadow:0 0 20px ${style.glowColor}; transition:all 0.2s ease;">${value}⭐</div>`;
                    }
                    return html;
                }
                
                const p1Wrapper = document.createElement('div');
                p1Wrapper.style.cssText = `
                    flex: 1; display: flex; flex-direction: column; min-height: 0;
                    border: 2px solid rgba(179,136,255,0.3); border-radius: 12px;
                    padding: 6px; background: rgba(179,136,255,0.05);
                `;
                p1Wrapper.innerHTML = `
                    <div style="font-size:15px; font-weight:700; color:#b388ff; text-align:center; margin-bottom:3px; flex-shrink:0; background:rgba(179,136,255,0.1); padding:3px 0; border-radius:6px;">👤 ИГРОК 1</div>
                    <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); flex:1; min-height:95px;">
                        <div id="rouletteTrack1" style="display:flex; gap:${cardGap}px; padding:6px 0; transition:transform 8s cubic-bezier(0.1, 1, 0.1, 1); will-change:transform; position:relative; width:${totalCards * (cardWidth + cardGap)}px; height:100%; align-items:center;">
                            ${createTrack(player1Prize, winPos1, style.itemColor)}
                        </div>
                        <div style="position:absolute; top:-4px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1; z-index:5;">▼</div>
                    </div>
                `;
                container.appendChild(p1Wrapper);
                
                const vsDiv = document.createElement('div');
                vsDiv.style.cssText = `
                    text-align:center; font-size:24px; font-weight:900;
                    color:#ff6b6b; text-shadow:0 0 30px rgba(255,0,0,0.3);
                    flex-shrink:0; padding:3px 0;
                `;
                vsDiv.textContent = '⚔️ VS';
                container.appendChild(vsDiv);
                
                const p2Wrapper = document.createElement('div');
                p2Wrapper.style.cssText = `
                    flex: 1; display: flex; flex-direction: column; min-height: 0;
                    border: 2px solid rgba(179,136,255,0.3); border-radius: 12px;
                    padding: 6px; background: rgba(179,136,255,0.05);
                `;
                p2Wrapper.innerHTML = `
                    <div style="font-size:15px; font-weight:700; color:#b388ff; text-align:center; margin-bottom:3px; flex-shrink:0; background:rgba(179,136,255,0.1); padding:3px 0; border-radius:6px;">👤 ИГРОК 2</div>
                    <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); flex:1; min-height:95px;">
                        <div id="rouletteTrack2" style="display:flex; gap:${cardGap}px; padding:6px 0; transition:transform 8s cubic-bezier(0.1, 1, 0.1, 1); will-change:transform; position:relative; width:${totalCards * (cardWidth + cardGap)}px; height:100%; align-items:center;">
                            ${createTrack(player2Prize, winPos2, style.itemColor)}
                        </div>
                        <div style="position:absolute; top:-4px; left:50%; transform:translateX(-50%); font-size:24px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1; z-index:5;">▼</div>
                    </div>
                `;
                container.appendChild(p2Wrapper);
                
                overlay.appendChild(container);
                
                const infoDiv = document.createElement('div');
                infoDiv.style.cssText = `
                    color:#888; font-size:13px; text-align:center; margin-top:8px;
                    flex-shrink:0;
                `;
                infoDiv.textContent = `📦 ${case_type.toUpperCase()}`;
                overlay.appendChild(infoDiv);
                
                const statusDiv = document.createElement('div');
                statusDiv.id = 'battleRouletteStatus';
                statusDiv.style.cssText = `
                    color: ${style.titleColor}; font-size:15px; font-weight:600;
                    opacity:0.6; text-align:center; letter-spacing:1px;
                    flex-shrink:0; margin-top:4px;
                `;
                statusDiv.textContent = '🎰 Открытие...';
                overlay.appendChild(statusDiv);
                
                document.body.appendChild(overlay);
                
                const viewportWidth = window.innerWidth * 0.85;
                const centerOffset = viewportWidth / 2;
                const shift1 = (winPos1 * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
                const shift2 = (winPos2 * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
                
                setTimeout(() => {
                    const track1 = document.getElementById('rouletteTrack1');
                    const track2 = document.getElementById('rouletteTrack2');
                    
                    if (track1) {
                        track1.style.transition = 'transform 8s cubic-bezier(0.1, 1, 0.1, 1)';
                        track1.style.transform = `translateX(-${shift1}px)`;
                    }
                    if (track2) {
                        track2.style.transition = 'transform 8s cubic-bezier(0.1, 1, 0.1, 1)';
                        track2.style.transform = `translateX(-${shift2}px)`;
                    }
                }, 300);
                
                setTimeout(() => {
                    const track1 = document.getElementById('rouletteTrack1');
                    const track2 = document.getElementById('rouletteTrack2');
                    
                    if (track1) {
                        const cards1 = track1.querySelectorAll('.roulette-card');
                        if (cards1[winPos1]) {
                            cards1[winPos1].style.background = 'rgba(255,215,0,0.2)';
                            cards1[winPos1].style.border = '2px solid #ffd700';
                            cards1[winPos1].style.color = '#ffd700';
                            cards1[winPos1].style.textShadow = '0 0 30px #ffd700';
                            cards1[winPos1].style.transform = 'scale(1.1)';
                        }
                    }
                    
                    if (track2) {
                        const cards2 = track2.querySelectorAll('.roulette-card');
                        if (cards2[winPos2]) {
                            cards2[winPos2].style.background = 'rgba(255,215,0,0.2)';
                            cards2[winPos2].style.border = '2px solid #ffd700';
                            cards2[winPos2].style.color = '#ffd700';
                            cards2[winPos2].style.textShadow = '0 0 30px #ffd700';
                            cards2[winPos2].style.transform = 'scale(1.1)';
                        }
                    }
                    
                    setTimeout(() => {
                        apiRequest('/get_battle_result', {}).then(result => {
                            if (result.error) {
                                showCustomAlert('❌ ' + result.error);
                                overlay.remove();
                                showBattles();
                                return;
                            }
                            if (result.pending) {
                                setTimeout(() => {
                                    apiRequest('/get_battle_result', {}).then(finalResult => {
                                        if (finalResult.result) {
                                            overlay.remove();
                                            showBattleResult(finalResult);
                                        } else {
                                            showCustomAlert('❌ Не удалось получить результат битвы');
                                            overlay.remove();
                                            showBattles();
                                        }
                                    });
                                }, 3000);
                                return;
                            }
                            if (result.result) {
                                overlay.remove();
                                showBattleResult(result);
                            }
                        });
                    }, 500);
                }, 8500);
            });
        });
    });
}

function showBattleResult(data) {
    document.getElementById('waitingRoom').style.display = 'none';
    document.getElementById('battlesScreen').querySelector('.battle-stats').style.display = 'flex';
    document.getElementById('battlesScreen').querySelector('.battle-actions').style.display = 'flex';
    document.getElementById('battlesScreen').querySelector('#battleRoomsList').style.display = 'block';
    state.currentRoomId = null;
    
    const overlay = document.createElement('div');
    overlay.id = 'battleResultOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    
    const isWin = data.is_winner;
    const isDraw = data.is_draw;
    
    if (isDraw) {
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">🤝</div>
            <div style="font-size:32px; font-weight:800; color:#ffd700; margin-bottom:20px;">НИЧЬЯ!</div>
            <div style="display:flex; gap:40px; margin-bottom:20px;">
                <div style="text-align:center;">
                    <div style="font-size:40px;">👤</div>
                    <div style="font-weight:700; color:#aaa;">Игрок 1</div>
                    <div style="font-size:28px; font-weight:800; color:#ffd700;">${data.player1_prize}⭐</div>
                </div>
                <div style="display:flex; align-items:center; font-size:36px; color:#ff6b6b;">⚔️</div>
                <div style="text-align:center;">
                    <div style="font-size:40px;">👤</div>
                    <div style="font-weight:700; color:#aaa;">Игрок 2</div>
                    <div style="font-size:28px; font-weight:800; color:#ffd700;">${data.player2_prize}⭐</div>
                </div>
            </div>
            <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center; color:#aaa;">
                ${data.result_text || 'Ничья!'}
            </div>
            <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); showBattles();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b388ff, #7c4dff); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    ⚔️ НОВАЯ БИТВА
                </button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔙 НАЗАД
                </button>
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
                <div style="text-align:center;">
                    <div style="font-size:40px;">👤</div>
                    <div style="font-weight:700; color:${isWin ? '#4caf50' : '#aaa'};">ТЫ</div>
                    <div style="font-size:28px; font-weight:800; color:#ffd700;">${isWin ? data.winner_prize : data.loser_prize}⭐</div>
                </div>
                <div style="display:flex; align-items:center; font-size:36px; color:#ff6b6b;">⚔️</div>
                <div style="text-align:center;">
                    <div style="font-size:40px;">👤</div>
                    <div style="font-weight:700; color:${!isWin ? '#4caf50' : '#aaa'};">СОПЕРНИК</div>
                    <div style="font-size:28px; font-weight:800; color:#ffd700;">${!isWin ? data.winner_prize : data.loser_prize}⭐</div>
                </div>
            </div>
            <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center;">
                <div style="color:#aaa; font-size:14px;">${data.result_text}</div>
                <div style="color:#888; font-size:12px;">💸 Комиссия: ${data.commission || 0}⭐</div>
                ${isWin ? `<div style="color:#4caf50; font-size:16px; font-weight:700;">🏆 Ты получил: ${data.winner_winnings}⭐</div>` : ''}
            </div>
            <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); showBattles();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b388ff, #7c4dff); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    ⚔️ НОВАЯ БИТВА
                </button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔙 НАЗАД
                </button>
            </div>
        `;
    }
    
    document.body.appendChild(overlay);
    loadBattleData();
}

// ===== МИНЁР =====
function initMinesBoard() {
    const board = DOM.minesBoard;
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
    let val = parseInt(input.value);
    if (isNaN(val) || val < 3) val = 3;
    if (val > 1000) val = 1000;
    input.value = val;
    return val;
}

DOM.betInput.addEventListener('change', function() {
    let val = parseInt(this.value);
    if (isNaN(val) || val < 3) val = 3;
    if (val > 1000) val = 1000;
    this.value = val;
});

document.querySelectorAll('.mines-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.mines-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.selectedMines = parseInt(this.dataset.mines);
    });
});

function startMinesGame() {
    const bet = getBetFromInput();
    const mines = state.selectedMines;
    
    if (bet < 3 || bet > 1000) {
        showCustomAlert('❌ Ставка должна быть от 3 до 1000⭐');
        return;
    }
    if (mines < 3 || mines > 8) {
        showCustomAlert('❌ X должно быть от 3 до 8');
        return;
    }
    
    apiRequest('/check_balance_simple', { amount: bet }).then(data => {
        if (data.error || !data.has_enough) {
            showCustomAlert('❌ Недостаточно звёзд!');
            return;
        }
        
        apiRequest('/start_mines_game', { bet, mines }).then(gameData => {
            if (gameData.error) {
                showCustomAlert('❌ ' + gameData.error);
                return;
            }
            
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
            
            DOM.minesBetDisplay.textContent = bet;
            DOM.minesCountDisplay.textContent = mines;
            DOM.minesTotalSafe.textContent = 25 - mines;
            DOM.minesOpenedDisplay.textContent = '0';
            DOM.minesMultiplierDisplay.textContent = 'x1.0';
            
            DOM.minesCashoutBtn.style.display = 'inline-block';
            DOM.minesStartBtn.textContent = '🔄 ИГРАТЬ СНОВА';
            
            renderMinesBoard();
            updateMinesCashoutAmount();
        });
    });
}

function renderMinesBoard() {
    const board = DOM.minesBoard;
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
    
    apiRequest('/open_mines_cell', { 
        game_id: state.minesGameData.game_id,
        index 
    }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        
        state.minesGameData.board = data.board;
        state.minesGameData.openedCells = data.opened;
        state.minesGameData.opened = data.opened_count;
        state.minesGameData.multiplier = data.multiplier;
        
        DOM.minesOpenedDisplay.textContent = state.minesGameData.opened;
        DOM.minesMultiplierDisplay.textContent = 'x' + state.minesGameData.multiplier;
        
        if (data.game_over) {
            state.minesGameData.active = false;
            state.minesGameData.game_over = true;
            if (data.won === false) {
                state.minesGameData.exploded = true;
            }
            DOM.minesCashoutBtn.style.display = 'none';
            
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
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    
    let boardHTML = '';
    if (board) {
        boardHTML = `
            <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px; max-width:350px; margin:16px auto; width:100%;">
                ${board.map((cell, i) => {
                    const isMine = cell === 1;
                    const isOpened = openedCells && openedCells[i] === 1;
                    let bgColor = 'rgba(255,255,255,0.04)';
                    let borderColor = 'rgba(255,255,255,0.06)';
                    let textColor = '#888';
                    let symbol = '❓';
                    
                    if (isOpened) {
                        if (isMine) {
                            bgColor = 'rgba(255,0,0,0.2)';
                            borderColor = 'rgba(255,0,0,0.3)';
                            textColor = '#ff4444';
                            symbol = '💣';
                        } else {
                            bgColor = 'rgba(0,255,0,0.08)';
                            borderColor = 'rgba(0,255,0,0.15)';
                            textColor = '#4caf50';
                            symbol = '💎';
                        }
                    } else if (isMine) {
                        bgColor = 'rgba(255,0,0,0.15)';
                        borderColor = 'rgba(255,0,0,0.2)';
                        textColor = '#ff4444';
                        symbol = '💣';
                    }
                    
                    return `
                        <div style="
                            aspect-ratio:1;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:36px;
                            background:${bgColor};
                            border-radius:10px;
                            border:2px solid ${borderColor};
                            color:${textColor};
                            transition:all 0.2s;
                            font-weight:700;
                        ">
                            ${symbol}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${icon}</div>
        <div style="font-size:32px; font-weight:800; color:${color}; margin-bottom:10px;">${title}</div>
        <div style="color:#aaa; font-size:18px; margin-bottom:10px; text-align:center;">${text}</div>
        ${boardHTML}
        <div style="color:#666; font-size:13px; margin-bottom:16px;">💣 — мины | 💎 — безопасные клетки</div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeAllOverlays(); startMinesGame();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                🔄 ИГРАТЬ СНОВА
            </button>
            <button onclick="closeAllOverlays(); showMines();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                🔙 НАЗАД
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function cashoutMinesGame() {
    if (!state.minesGameData || !state.minesGameData.active || state.minesGameData.game_over) return;
    if (state.minesGameData.opened < 3) {
        showCustomAlert('❌ Нужно открыть минимум 3 клетки!');
        return;
    }
    if (state.minesGameData.exploded) {
        showCustomAlert('❌ Игра уже завершена!');
        return;
    }
    
    apiRequest('/cashout_mines', { game_id: state.minesGameData.game_id }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        
        state.minesGameData.active = false;
        state.minesGameData.game_over = true;
        DOM.minesCashoutBtn.style.display = 'none';
        
        showMinesResult('💰', 'ВЫИГРЫШ!', `Ты забрал ${data.winnings}⭐ (x${data.multiplier})`, '#ffd700');
        loadBalance();
        loadMinesStats();
    });
}

function updateMinesCashoutAmount() {
    if (!state.minesGameData) return;
    const amount = Math.floor(state.minesGameData.bet * state.minesGameData.multiplier);
    document.getElementById('minesCashoutAmount').textContent = amount;
}

function loadMinesStats() {
    apiRequest('/get_mines_stats').then(data => {
        document.getElementById('minesGames').textContent = data.games || 0;
        document.getElementById('minesWins').textContent = data.wins || 0;
        document.getElementById('minesLosses').textContent = data.losses || 0;
        document.getElementById('minesBestMultiplier').textContent = 'x' + (data.best_multiplier || 1.0);
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
        if (i === 0) {
            crashCtx.moveTo(x, y);
        } else {
            crashCtx.lineTo(x, y);
        }
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
    
    const bet = parseInt(DOM.crashBetDisplay.textContent) || 0;
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
    if (crashChartData.length > 200) {
        crashChartData.shift();
    }
    drawCrashChart();
}

function resetCrashChart() {
    crashChartData = [];
    drawCrashChart();
    const multiplierEl = document.getElementById('crashMultiplier');
    if (multiplierEl) {
        multiplierEl.textContent = 'x1.00';
        multiplierEl.style.color = '#b388ff';
    }
    const progressEl = document.getElementById('crashProgressBar');
    if (progressEl) {
        progressEl.style.width = '0%';
    }
    const winDisplay = document.getElementById('crashPotentialWin');
    if (winDisplay) {
        winDisplay.textContent = '0⭐';
        winDisplay.style.color = '#4caf50';
    }
}

function resetCrashUI() {
    DOM.crashMultiplier.textContent = 'x1.00';
    DOM.crashMultiplier.className = '';
    DOM.crashStatus.textContent = '⏳ Ожидание нового раунда...';
    DOM.crashTimer.textContent = '⏱ 0.0 сек';
    DOM.crashBetDisplay.textContent = '0';
    DOM.crashMultiplierDisplay.textContent = 'x1.00';
    DOM.crashStartBtn.style.display = 'inline-block';
    DOM.crashCashoutBtn.style.display = 'none';
    DOM.crashStartBtn.disabled = true;
    DOM.crashStartBtn.textContent = '⏳ ОЖИДАНИЕ...';
    state.crashRunning = false;
    state.crashGameId = null;
    if (state.crashInterval) {
        clearInterval(state.crashInterval);
        state.crashInterval = null;
    }
    resetCrashChart();
}

function getCrashBet() {
    const input = DOM.crashBetInput;
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 1000) val = 1000;
    input.value = val;
    return val;
}

DOM.crashBetInput.addEventListener('change', function() {
    let val = parseInt(this.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 1000) val = 1000;
    this.value = val;
});

function startCrashPolling() {
    if (state.crashPollingInterval) clearInterval(state.crashPollingInterval);
    
    state.crashPollingInterval = setInterval(() => {
        apiRequest('/crash_status', {}).then(status => {
            if (status.error) {
                return;
            }
            
            const multiplier = status.multiplier || 1.00;
            DOM.crashMultiplier.textContent = `x${multiplier}`;
            DOM.crashMultiplierDisplay.textContent = `x${multiplier}`;
            
            updateCrashChart(multiplier);
            
            const bet = parseInt(DOM.crashBetDisplay.textContent) || 0;
            const potentialWin = Math.floor(bet * multiplier * 0.95);
            const winDisplay = document.getElementById('crashPotentialWin');
            if (winDisplay) {
                winDisplay.textContent = potentialWin + '⭐';
                winDisplay.style.color = potentialWin > bet * 2 ? '#4caf50' : '#ffd700';
            }
            
            const timerEl = document.getElementById('crashTimer');
            if (timerEl) {
                if (status.crashed) {
                    timerEl.textContent = '💥 КРАШ!';
                    timerEl.style.color = '#f44336';
                    DOM.crashStatus.textContent = '💥 Краш! Новый раунд через 5 сек...';
                    DOM.crashStartBtn.disabled = true;
                    DOM.crashStartBtn.textContent = '⏳ 5 СЕК';
                    DOM.crashMultiplier.className = 'crashed';
                    DOM.crashCashoutBtn.style.display = 'none';
                } else if (status.active) {
                    const elapsed = Math.floor((Date.now() - (state._crashStartTime || Date.now())) / 1000);
                    timerEl.textContent = `⏱ ${elapsed} сек`;
                    timerEl.style.color = '#666';
                    DOM.crashStatus.textContent = '📈 Множитель растёт...';
                    DOM.crashStartBtn.disabled = true;
                    DOM.crashStartBtn.textContent = '⏳ ИГРА ИДЁТ...';
                    DOM.crashMultiplier.className = '';
                } else if (status.waiting) {
                    const waitTime = status.time_to_new_round || 5;
                    timerEl.textContent = `⏳ ${Math.ceil(waitTime)} СЕК`;
                    timerEl.style.color = '#ffd700';
                    DOM.crashStatus.textContent = `⏳ Новый раунд через ${Math.ceil(waitTime)} сек...`;
                    DOM.crashStartBtn.disabled = false;
                    DOM.crashStartBtn.textContent = '🚀 СТАРТ';
                    DOM.crashMultiplier.className = '';
                } else {
                    timerEl.textContent = '⏳ ОЖИДАНИЕ...';
                    timerEl.style.color = '#888';
                    DOM.crashStatus.textContent = '⏳ Ожидание нового раунда...';
                    DOM.crashStartBtn.disabled = true;
                    DOM.crashStartBtn.textContent = '⏳ ОЖИДАНИЕ...';
                }
            }
        });
    }, 100);
}

function startCrashGame() {
    if (state.crashRunning) return;
    
    const bet = getCrashBet();
    
    apiRequest('/check_balance_simple', { amount: bet }).then(data => {
        if (data.error || !data.has_enough) {
            showCustomAlert('❌ Недостаточно звёзд!');
            return;
        }
        
        apiRequest('/start_crash', { bet }).then(gameData => {
            if (gameData.error) {
                showCustomAlert('❌ ' + gameData.error);
                return;
            }
            
            state.crashGameId = gameData.game_id;
            state.crashRunning = true;
            state._crashStartTime = Date.now();
            
            resetCrashChart();
            
            DOM.crashStartBtn.disabled = true;
            DOM.crashStartBtn.textContent = '⏳ ИГРА ИДЁТ...';
            DOM.crashCashoutBtn.style.display = 'inline-block';
            DOM.crashBetDisplay.textContent = bet;
            DOM.crashStatus.textContent = '📈 Множитель растёт...';
            DOM.crashMultiplier.className = '';
            
            if (state.crashInterval) clearInterval(state.crashInterval);
            state.crashInterval = setInterval(() => {
                apiRequest('/crash_status', { game_id: state.crashGameId }).then(status => {
                    if (status.error) {
                        clearInterval(state.crashInterval);
                        state.crashRunning = false;
                        DOM.crashStatus.textContent = '❌ ' + status.error;
                        return;
                    }
                    
                    const elapsed = (Date.now() - state._crashStartTime) / 1000;
                    DOM.crashTimer.textContent = `⏱ ${elapsed.toFixed(1)} сек`;
                    
                    updateCrashChart(status.multiplier);
                    DOM.crashMultiplierDisplay.textContent = `x${status.multiplier}`;
                    
                    if (status.crashed) {
                        clearInterval(state.crashInterval);
                        state.crashRunning = false;
                        DOM.crashMultiplier.className = 'crashed';
                        DOM.crashStatus.textContent = '💥 КРАШ!';
                        DOM.crashCashoutBtn.style.display = 'none';
                        DOM.crashStartBtn.disabled = false;
                        DOM.crashStartBtn.textContent = '⏳ ОЖИДАНИЕ...';
                        showCrashResult('lose', 0, status.multiplier);
                        loadBalance();
                        loadCrashStats();
                    }
                });
            }, 100);
        });
    });
}

function cashoutCrash() {
    if (!state.crashRunning || !state.crashGameId) return;
    
    apiRequest('/cashout_crash', { game_id: state.crashGameId }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        
        state.crashRunning = false;
        if (state.crashInterval) {
            clearInterval(state.crashInterval);
            state.crashInterval = null;
        }
        
        DOM.crashMultiplier.className = 'win';
        DOM.crashStatus.textContent = `💰 Выигрыш: ${data.winnings}⭐ (x${data.multiplier})`;
        DOM.crashCashoutBtn.style.display = 'none';
        DOM.crashStartBtn.disabled = false;
        DOM.crashStartBtn.textContent = '⏳ ОЖИДАНИЕ...';
        
        showCrashResult('win', data.winnings, data.multiplier);
        loadBalance();
        loadCrashStats();
    });
}

function showCrashResult(result, winnings, multiplier) {
    const overlay = document.createElement('div');
    overlay.id = 'crashResultOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '30px',
        animation: 'fadeIn 0.3s ease'
    });
    
    if (result === 'win') {
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">💰</div>
            <div style="font-size:32px; font-weight:800; color:#4caf50; margin-bottom:10px;">ВЫИГРЫШ!</div>
            <div style="font-size:28px; font-weight:700; color:#ffd700;">${winnings}⭐</div>
            <div style="color:#aaa; font-size:16px; margin-top:4px;">Множитель: x${multiplier}</div>
            <div style="display:flex; gap:16px; margin-top:20px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); resetCrashUI();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔄 ИГРАТЬ СНОВА
                </button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔙 НАЗАД
                </button>
            </div>
        `;
    } else {
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">💥</div>
            <div style="font-size:32px; font-weight:800; color:#f44336; margin-bottom:10px;">КРАШ!</div>
            <div style="color:#aaa; font-size:16px;">Множитель: x${multiplier}</div>
            <div style="color:#888; font-size:14px; margin-top:4px;">Ты потерял ставку</div>
            <div style="display:flex; gap:16px; margin-top:20px; flex-wrap:wrap; justify-content:center;">
                <button onclick="closeAllOverlays(); resetCrashUI();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #ff6b6b, #ee5a24); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔄 ИГРАТЬ СНОВА
                </button>
                <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔙 НАЗАД
                </button>
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
    document.querySelector('.profile-card').style.display = 'none';
    document.getElementById('inviteSection').style.display = 'block';
}
function hideInvite() {
    document.querySelector('.profile-card').style.display = 'block';
    document.getElementById('inviteSection').style.display = 'none';
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
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        padding: '30px',
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
    const amount = parseInt(input.value);
    if (isNaN(amount) || amount < 1000) {
        showCustomAlert('❌ Минимальная сумма — 1000⭐');
        return;
    }
    const overlay = document.getElementById('withdrawOverlay');
    if (overlay) overlay.remove();
    
    apiRequest('/withdraw_request', { amount: amount }).then(data => {
        if (data.success) {
            showCustomAlert('✅ Заявка отправлена! Админ свяжется с вами.', true);
        } else {
            showCustomAlert('❌ ' + data.error);
        }
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
initMinesBoard();
loadBalance();
loadMinesStats();
loadCrashStats();
initCrashChart();
startCrashPolling();
tg.ready();
