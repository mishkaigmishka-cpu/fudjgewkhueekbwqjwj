// ===============================
// RANDEVU — FINAL SCRIPT v10.0
// ВСЕ ИСПРАВЛЕНИЯ ВНЕСЕНЫ
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
        'obsidian': [500,1000,1500,2000,2500,3000,4000,5000,7500,10000,15000,25000],
        'bedrock': [5000,10000,25000,50000,100000,250000,1000000]
    },
    CASE_PRICES: {
        'free':0,'mud':5,'wood':9,'stone':19,'bronze':49,'silver':99,'gold':249,'diamond':499,'netherite':999,'obsidian':2499,'bedrock':10000
    },
    CASE_STYLES: {
        'free': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(46,204,113,0.7)', titleColor:'#2ecc71', itemColor:'#6bcbff', highlightColor:'#ffd700', glowColor:'rgba(46,204,113,0.3)', shadowColor:'rgba(46,204,113,0.5)', icon:'🎁', bgGradient:'radial-gradient(circle at 50% 50%, rgba(46,204,113,0.08), transparent 70%)' },
        'mud': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(142,68,173,0.7)', titleColor:'#8e44ad', itemColor:'#c39bd3', highlightColor:'#ff6b6b', glowColor:'rgba(142,68,173,0.3)', shadowColor:'rgba(142,68,173,0.5)', icon:'🟫', bgGradient:'radial-gradient(circle at 50% 50%, rgba(142,68,173,0.08), transparent 70%)' },
        'wood': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(211,84,0,0.7)', titleColor:'#d35400', itemColor:'#f39c12', highlightColor:'#ffd700', glowColor:'rgba(211,84,0,0.3)', shadowColor:'rgba(211,84,0,0.5)', icon:'🌳', bgGradient:'radial-gradient(circle at 50% 50%, rgba(211,84,0,0.08), transparent 70%)' },
        'stone': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(127,140,141,0.7)', titleColor:'#7f8c8d', itemColor:'#bdc3c7', highlightColor:'#ffd700', glowColor:'rgba(127,140,141,0.3)', shadowColor:'rgba(127,140,141,0.5)', icon:'🗿', bgGradient:'radial-gradient(circle at 50% 50%, rgba(127,140,141,0.08), transparent 70%)' },
        'bronze': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(205,127,50,0.7)', titleColor:'#cd7f32', itemColor:'#f0c27f', highlightColor:'#ffd700', glowColor:'rgba(205,127,50,0.3)', shadowColor:'rgba(205,127,50,0.5)', icon:'🥉', bgGradient:'radial-gradient(circle at 50% 50%, rgba(205,127,50,0.08), transparent 70%)' },
        'silver': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(189,195,199,0.7)', titleColor:'#bdc3c7', itemColor:'#ecf0f1', highlightColor:'#ffd700', glowColor:'rgba(189,195,199,0.3)', shadowColor:'rgba(189,195,199,0.5)', icon:'🔘', bgGradient:'radial-gradient(circle at 50% 50%, rgba(189,195,199,0.08), transparent 70%)' },
        'gold': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(241,196,15,0.7)', titleColor:'#f1c40f', itemColor:'#f9e79f', highlightColor:'#ffd700', glowColor:'rgba(241,196,15,0.4)', shadowColor:'rgba(241,196,15,0.6)', icon:'👑', bgGradient:'radial-gradient(circle at 50% 50%, rgba(241,196,15,0.1), transparent 70%)' },
        'diamond': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(52,152,219,0.7)', titleColor:'#3498db', itemColor:'#85c1e9', highlightColor:'#00d4ff', glowColor:'rgba(52,152,219,0.3)', shadowColor:'rgba(52,152,219,0.5)', icon:'💎', bgGradient:'radial-gradient(circle at 50% 50%, rgba(52,152,219,0.08), transparent 70%)' },
        'netherite': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(44,62,80,0.7)', titleColor:'#e74c3c', itemColor:'#f1948a', highlightColor:'#ff6b35', glowColor:'rgba(231,76,60,0.3)', shadowColor:'rgba(231,76,60,0.5)', icon:'🔥', bgGradient:'radial-gradient(circle at 50% 50%, rgba(231,76,60,0.08), transparent 70%)' },
        'obsidian': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(139,139,158,0.7)', titleColor:'#8b8b9e', itemColor:'#c8c8d4', highlightColor:'#ffd700', glowColor:'rgba(139,139,158,0.4)', shadowColor:'rgba(139,139,158,0.6)', icon:'🔮', bgGradient:'radial-gradient(circle at 50% 50%, rgba(139,139,158,0.08), transparent 70%)' },
        'bedrock': { bg:'rgba(0,0,0,0.95)', border:'3px solid rgba(20,20,30,0.9)', titleColor:'#8b8b9e', itemColor:'#c8c8d4', highlightColor:'#ff6b6b', glowColor:'rgba(139,139,158,0.4)', shadowColor:'rgba(139,139,158,0.6)', icon:'⛏️', bgGradient:'radial-gradient(circle at 50% 50%, rgba(20,20,30,0.15), transparent 70%)' }
    },
    MINES_MULTIPLIERS: {
        3: {1:1.05,2:1.15,3:1.30,4:1.50,5:1.75,6:2.10,7:2.50,8:3.00,9:3.50,10:4.20,11:5.00,12:6.00},
        4: {1:1.10,2:1.20,3:1.40,4:1.70,5:2.00,6:2.40,7:3.00,8:3.80,9:4.50,10:5.50,11:6.50,12:8.00},
        5: {1:1.15,2:1.30,3:1.55,4:1.90,5:2.30,6:2.80,7:3.50,8:4.50,9:5.50,10:6.50,11:8.00,12:10.00},
        6: {1:1.20,2:1.40,3:1.70,4:2.10,5:2.60,6:3.20,7:4.00,8:5.00,9:6.50,10:8.00,11:10.00,12:12.00},
        7: {1:1.25,2:1.50,3:1.85,4:2.30,5:2.90,6:3.60,7:4.50,8:5.50,9:7.50,10:9.00,11:12.00,12:15.00},
        8: {1:1.30,2:1.60,3:2.00,4:2.50,5:3.20,6:4.00,7:5.00,8:6.50,9:8.50,10:10.00,11:14.00,12:18.00}
    }
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const getPrizes = (type) => CONFIG.CASE_PRIZES[type] || [1,10,100];
const getStyle = (type) => CONFIG.CASE_STYLES[type] || CONFIG.CASE_STYLES['free'];
const getPrice = (type) => CONFIG.CASE_PRICES[type] || 0;

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

// ===== КАСТОМНОЕ ОКНО =====
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
    inviteLink: document.getElementById('inviteLink')
};

// ===== СОСТОЯНИЕ =====
let state = {
    lastOpenedCase: null,
    currentPrize: null,
    isOpening: false,
    tapeContainer: null,
    selectedMines: 4,
    selectedBotCase: 'gold',
    crashGameId: null,
    crashRunning: false,
    crashBetPlaced: false,
    crashWaitingForStart: false,
    crashGameStarted: false,
    crashInterval: null,
    crashPollingInterval: null,
    _crashStartTime: null,
    _resultShown: false
};

// ===== ЗАКРЫТИЕ ОВЕРЛЕЕВ =====
function closeAllOverlays() {
    const ids = [
        'tapeContainer',
        'resultContainer',
        'botRouletteOverlay',
        'botBattleResultOverlay',
        'minesResultOverlay',
        'crashResultOverlay',
        'result',
        'customAlertOverlay',
        'gameCrashResultOverlay'
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

function showLevels() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('levelsScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="levels"]').classList.add('active');
    loadLevels();
}

function showGames() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('gamesScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="games"]').classList.add('active');
    
    document.getElementById('gamesMenu').style.display = 'flex';
    document.getElementById('crashGameContainer').style.display = 'none';
    document.getElementById('minesGameContainer').style.display = 'none';
    document.getElementById('upgradeGameContainer').style.display = 'none';
}

function showQuests() {
    closeAllOverlays();
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('questsScreen').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="quests"]').classList.add('active');
    
    const activeTab = document.querySelector('.quest-tab.active');
    if (activeTab) {
        loadQuestTab(activeTab.dataset.tab);
    } else {
        loadQuestTab('status');
    }
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
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
        const id = activeScreen.id;
        if (id === 'levelsScreen' || id === 'questsScreen' || id === 'profileScreen') {
            showMain();
        } else if (id === 'gamesScreen') {
            showGames();
        } else if (id === 'crashGameContainer' || id === 'minesGameContainer' || id === 'upgradeGameContainer') {
            showGames();
        } else {
            showMain();
        }
    } else {
        showMain();
    }
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
        const totalPrice = price * 10;
        const hasEnoughFor10 = userBalance >= totalPrice;

        // Кнопка "Открыть" (1 кейс)
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

        // Кнопка "Открыть ×10"
        if (type !== 'free' && hasEnoughFor10) {
            const open10Btn = document.createElement('button');
            open10Btn.textContent = `🎲 Открыть ×10 (${totalPrice}⭐)`;
            Object.assign(open10Btn.style, {
                background: 'linear-gradient(135deg, #ffd700, #f9a825)',
                color: '#000',
                border: 'none',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 30px rgba(255,215,0,0.3)',
                minWidth: '170px'
            });
            open10Btn.onclick = () => {
                closeAllOverlays();
                setTimeout(() => open10Cases(type), 300);
            };
            btnContainer.appendChild(open10Btn);
        } else if (type !== 'free' && !hasEnoughFor10) {
            const locked10Btn = document.createElement('button');
            locked10Btn.textContent = `🔒 ×10 (${totalPrice}⭐)`;
            Object.assign(locked10Btn.style, {
                background: 'rgba(255,0,0,0.08)',
                color: '#666',
                border: '2px solid rgba(255,0,0,0.15)',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'not-allowed',
                minWidth: '170px'
            });
            btnContainer.appendChild(locked10Btn);
        }

        // Кнопка "Назад"
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
    if (targetPrize === null) { tg.showAlert('❌ Ошибка: награда не получена'); closeAllOverlays(); return; }

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

    track.style.transition = `transform 6000ms cubic-bezier(0.1, 1, 0.1, 1)`;
    track.style.transform = `translateX(-${finalShift}px)`;

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

// ===== ОТКРЫТИЕ 10 КЕЙСОВ =====
async function open10Cases(type) {
    if (state.isOpening) return;
    state.isOpening = true;
    
    const data = await apiRequest('/open_10_cases', { case_type: type });
    if (data.error) {
        showCustomAlert('❌ ' + data.error);
        state.isOpening = false;
        return;
    }
    
    show10CasesAnimation(type, data);
    loadBalance();
    state.isOpening = false;
}

function show10CasesAnimation(type, data) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    
    const overlay = document.createElement('div');
    overlay.id = 'tapeContainer';
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
        border: 'none',
        animation: 'fadeIn 0.3s ease'
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
        fontSize: '20px',
        fontWeight: '800',
        color: style.titleColor,
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textShadow: `0 0 40px ${style.glowColor}`,
        textAlign: 'center',
        flexShrink: '0'
    });
    title.textContent = `🎰 ${type.toUpperCase()} ×10`;
    overlay.appendChild(title);

    const balanceDisplay = document.createElement('div');
    Object.assign(balanceDisplay.style, {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255,255,255,0.08)',
        padding: '8px 16px',
        borderRadius: '30px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#FFD700',
        border: '1px solid rgba(255,215,0,0.2)',
        backdropFilter: 'blur(10px)',
        zIndex: '10'
    });
    balanceDisplay.textContent = `💰 ${DOM.balance.textContent}`;
    overlay.appendChild(balanceDisplay);

    // 10 маленьких рулеток
    const gridContainer = document.createElement('div');
    Object.assign(gridContainer.style, {
        width: '95%',
        maxWidth: '650px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        margin: '0 auto 16px',
        flexShrink: '0'
    });

    const cardWidth = 55;
    const cardGap = 4;
    const totalItems = prizes.length;
    const tracks = [];

    for (let r = 0; r < 10; r++) {
        const viewport = document.createElement('div');
        Object.assign(viewport.style, {
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.3)',
            height: '60px',
            flexShrink: '0'
        });

        const track = document.createElement('div');
        track.className = 'mini-track';
        track.dataset.index = r;
        Object.assign(track.style, {
            display: 'flex',
            gap: cardGap + 'px',
            padding: '6px 0',
            willChange: 'transform',
            position: 'relative',
            top: '2px',
            width: (totalItems * 3 * (cardWidth + cardGap)) + 'px'
        });

        const targetPrize = data.prizes[r] || prizes[0];
        const targetIndex = prizes.indexOf(targetPrize);
        const winPos = Math.floor(totalItems * 1.5) + targetIndex;
        
        for (let i = 0; i < totalItems * 3; i++) {
            let value;
            if (i === winPos) {
                value = targetPrize;
            } else {
                value = prizes[Math.floor(Math.random() * prizes.length)];
            }
            const isLarge = value > 1000;
            const fontSize = isLarge ? '10px' : '12px';
            const card = document.createElement('div');
            Object.assign(card.style, {
                width: cardWidth + 'px',
                height: '48px',
                flexShrink: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: fontSize,
                fontWeight: '700',
                color: style.itemColor,
                textShadow: `0 0 20px ${style.glowColor}`,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                padding: '0 2px'
            });
            card.textContent = value + '⭐';
            track.appendChild(card);
        }

        const marker = document.createElement('div');
        Object.assign(marker.style, {
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '18px',
            color: style.highlightColor,
            textShadow: `0 0 20px ${style.highlightColor}`,
            pointerEvents: 'none',
            lineHeight: '1',
            zIndex: '5'
        });
        marker.textContent = '▼';

        viewport.appendChild(track);
        viewport.appendChild(marker);
        gridContainer.appendChild(viewport);
        tracks.push(track);
    }

    overlay.appendChild(gridContainer);

    const statusText = document.createElement('div');
    Object.assign(statusText.style, {
        color: style.titleColor,
        fontSize: '16px',
        fontWeight: '600',
        opacity: '0.6',
        textAlign: 'center',
        letterSpacing: '1px',
        flexShrink: '0',
        marginBottom: '4px'
    });
    statusText.textContent = '🎰 Открытие...';
    overlay.appendChild(statusText);

    document.body.appendChild(overlay);

    // Запускаем анимацию
    setTimeout(() => {
        tracks.forEach((track, index) => {
            const targetPrize = data.prizes[index] || prizes[0];
            const targetIndex = prizes.indexOf(targetPrize);
            const winPos = Math.floor(totalItems * 1.5) + targetIndex;
            
            const viewportWidth = track.parentElement.offsetWidth || 200;
            const centerOffset = viewportWidth / 2;
            const shift = (winPos * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
            const noise = Math.floor(Math.random() * 30) - 15;
            const finalShift = shift + noise;
            
            track.style.transition = `transform ${5000 + Math.random() * 2000}ms cubic-bezier(0.1, 1, 0.1, 1)`;
            track.style.transform = `translateX(-${finalShift}px)`;
        });

        // Подсветка выигрышей
        setTimeout(() => {
            tracks.forEach((track, index) => {
                const cards = track.querySelectorAll('.mini-track > div');
                const targetPrize = data.prizes[index] || prizes[0];
                const targetIndex = prizes.indexOf(targetPrize);
                const winPos = Math.floor(totalItems * 1.5) + targetIndex;
                
                if (cards[winPos]) {
                    cards[winPos].style.background = 'rgba(255,215,0,0.2)';
                    cards[winPos].style.border = '2px solid #ffd700';
                    cards[winPos].style.color = '#FFFFFF';
                    cards[winPos].style.textShadow = '0 0 30px #ffd700';
                }
            });

            // Показываем результат
            setTimeout(() => {
                const totalPrize = data.total_prize || data.prizes.reduce((a, b) => a + b, 0);
                
                overlay.innerHTML = '';
                overlay.style.justifyContent = 'center';
                overlay.style.gap = '10px';
                
                overlay.innerHTML = `
                    <div style="font-size:48px; margin-bottom:4px;">🎉</div>
                    <div style="font-size:28px; font-weight:800; color:#ffd700; text-shadow:0 0 40px rgba(255,215,0,0.3);">+${totalPrize}⭐</div>
                    <div style="font-size:16px; color:#aaa; margin-bottom:12px; display:flex; flex-wrap:wrap; justify-content:center; gap:6px; max-width:400px;">
                        ${data.prizes.map(p => `<span style="background:rgba(255,255,255,0.04); padding:4px 12px; border-radius:8px; border:1px solid rgba(255,215,0,0.1); font-size:14px; font-weight:600; color:${style.itemColor};">${p}⭐</span>`).join('')}
                    </div>
                    <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
                        <button onclick="closeAllOverlays(); openCaseDirect('${type}');" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #ff6b6b, #ee5a24); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🎲 ЕЩЁ</button>
                        <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
                    </div>
                `;
                
                loadBalance();
                
            }, 800);
        }, 6000);
    }, 300);
}

// ===== УРОВНИ =====
const LEVELS = [
    { id: 'mud', name: 'Грязь', icon: '🟫', caseType: 'mud', starName: 'Грязевая звезда', requiredCases: 10, price: 5 },
    { id: 'wood', name: 'Дерево', icon: '🌳', caseType: 'wood', starName: 'Древесная звезда', requiredCases: 10, price: 9 },
    { id: 'stone', name: 'Камень', icon: '🗿', caseType: 'stone', starName: 'Каменная звезда', requiredCases: 10, price: 19 },
    { id: 'bronze', name: 'Бронза', icon: '🥉', caseType: 'bronze', starName: 'Бронзовая звезда', requiredCases: 10, price: 49 },
    { id: 'silver', name: 'Серебро', icon: '🔘', caseType: 'silver', starName: 'Серебряная звезда', requiredCases: 10, price: 99 },
    { id: 'gold', name: 'Золото', icon: '👑', caseType: 'gold', starName: 'Золотая звезда', requiredCases: 10, price: 249 },
    { id: 'diamond', name: 'Алмаз', icon: '💎', caseType: 'diamond', starName: 'Алмазная звезда', requiredCases: 10, price: 499 },
    { id: 'netherite', name: 'Незерит', icon: '🔥', caseType: 'netherite', starName: 'Незеритовая звезда', requiredCases: 10, price: 999 },
    { id: 'obsidian', name: 'Обсидиан', icon: '🔮', caseType: 'obsidian', starName: 'Обсидиановая звезда', requiredCases: 10, price: 2499 },
    { id: 'bedrock', name: 'Бедрок', icon: '⛏️', caseType: 'bedrock', starName: 'Бедроковая звезда', requiredCases: 10, price: 10000 }
];

async function loadLevels() {
    const data = await apiRequest('/get_levels_data');
    const caseCounts = data.case_counts || {};
    const levelStars = data.level_stars || {};
    const levelWins = data.level_wins || {};
    
    const container = document.getElementById('levelsList');
    container.innerHTML = '';
    
    let prevCompleted = true;
    
    LEVELS.forEach((level) => {
        const opened = caseCounts[level.caseType] || 0;
        const stars = levelStars[level.id] || 0;
        const wins = levelWins[level.caseType] || 0;
        const isCompleted = wins >= 3;
        const isUnlocked = prevCompleted || isCompleted;
        const progressToStar = opened;
        const progressPercent = Math.min((opened / 10) * 100, 100);
        
        let statusText, statusClass, playDisabled = true;
        let starDisplay = '';
        
        if (isCompleted) {
            statusText = '✅ Пройден';
            statusClass = 'completed';
            playDisabled = false;
            starDisplay = `⭐ Звёзд: ${stars}`;
        } else if (isUnlocked && stars > 0) {
            statusText = `⭐ Доступен (${stars} звёзд)`;
            statusClass = 'unlocked';
            playDisabled = false;
            starDisplay = `⭐ Звёзд: ${stars}`;
        } else if (isUnlocked) {
            statusText = `📦 ${opened}/10 кейсов`;
            statusClass = 'unlocked';
            playDisabled = true;
            starDisplay = `⭐ Звёзд: ${stars}`;
        } else {
            statusText = '🔒 Заблокирован';
            statusClass = 'locked';
            playDisabled = true;
            starDisplay = `⭐ Звёзд: ${stars}`;
        }
        
        const card = document.createElement('div');
        card.className = `level-card ${isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <div class="level-icon">${level.icon}</div>
            <div class="level-info">
                <div class="level-name">${level.name}</div>
                <div class="level-progress">
                    ${statusText}
                    ${!isCompleted ? `
                        <div class="progress-bar">
                            <div class="fill" style="width:${progressPercent}%"></div>
                        </div>
                    ` : `
                        <div style="color:#ffd700; margin-top:4px;">✅ Уровень пройден!</div>
                    `}
                    ${starDisplay}
                    ${wins > 0 && !isCompleted ? `<div style="font-size:11px; color:#666;">Побед: ${wins}/3</div>` : ''}
                </div>
            </div>
            <div class="level-status ${statusClass}">${statusText}</div>
            ${!isCompleted && stars > 0 ? `
                <button class="level-play-btn" onclick="startLevelWithStar('${level.id}')">
                    ⭐ ИГРАТЬ ЗА ЗВЕЗДУ
                </button>
            ` : `
                <button class="level-play-btn" ${playDisabled ? 'disabled' : ''} onclick="startLevel('${level.id}')">
                    ${isCompleted ? '🔄 ПРОЙТИ' : '▶️ ИГРАТЬ'}
                </button>
            `}
        `;
        
        container.appendChild(card);
        
        if (isCompleted) {
            prevCompleted = true;
        } else {
            prevCompleted = false;
        }
    });
}

function startLevel(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    showBotBattlePreview(level.caseType, false);
}

function startLevelWithStar(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    showBotBattlePreview(level.caseType, true);
}

// ===== БИТВА С БОТОМ =====
function showBotBattlePreview(case_type, useStar = false) {
    const style = getStyle(case_type);
    const price = getPrice(case_type);
    
    const overlay = document.createElement('div');
    overlay.id = 'botBattlePreviewOverlay';
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
    
    overlay.innerHTML = `
        <div style="font-size:24px; font-weight:800; color:${style.titleColor}; margin-bottom:16px; text-transform:uppercase; letter-spacing:3px; text-shadow:0 0 40px ${style.glowColor}; text-align:center;">
            🆚 ${case_type.toUpperCase()}
        </div>
        <div style="display:flex; gap:40px; align-items:center; margin-bottom:16px;">
            <div style="text-align:center;">
                <div style="font-size:40px;">👤</div>
                <div style="font-weight:700; color:#4caf50;">ТЫ</div>
            </div>
            <div style="font-size:36px; font-weight:900; color:#ff6b6b;">VS</div>
            <div style="text-align:center;">
                <div style="font-size:40px;">🤖</div>
                <div style="font-weight:700; color:#f44336;">БОТ</div>
            </div>
        </div>
        <div style="color:#aaa; font-size:14px; margin-bottom:16px;">
            📦 Кейс: ${case_type.toUpperCase()} 
            ${useStar ? '⭐ (ЗА ЗВЕЗДУ — БЕСПЛАТНО!)' : `(${price}⭐)`}
        </div>
        <button onclick="startBotBattle('${case_type}', ${useStar})" style="padding:14px 40px; border:none; border-radius:14px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; font-size:18px; font-weight:700; cursor:pointer; box-shadow:0 4px 20px rgba(76,175,80,0.2);">
            ⚔️ НАЧАТЬ БИТВУ
        </button>
        <button onclick="this.closest('#botBattlePreviewOverlay').remove()" style="padding:12px 30px; border:none; border-radius:12px; background:rgba(255,255,255,0.06); color:#888; font-size:14px; font-weight:600; cursor:pointer; margin-top:10px;">
            🔙 НАЗАД
        </button>
    `;
    
    document.body.appendChild(overlay);
}

function startBotBattle(case_type, useStar = false) {
    const overlay = document.getElementById('botBattlePreviewOverlay');
    if (overlay) overlay.remove();
    
    apiRequest('/start_bot_battle', { case_type, use_star: useStar }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        showBotBattleResult(data, case_type);
    });
}

function showBotBattleResult(data, case_type) {
    const style = getStyle(case_type);
    
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
    
    let progressHTML = '';
    if (data.wins !== undefined) {
        const wins = data.wins;
        const needed = data.needed_wins || 3;
        const filled = '⭐'.repeat(Math.min(wins, needed));
        const empty = '☆'.repeat(Math.max(0, needed - wins));
        progressHTML = `
            <div style="margin-top:10px; margin-bottom:10px; font-size:20px; letter-spacing:4px;">
                ${filled}${empty}
            </div>
            <div style="color:#888; font-size:13px;">
                Побед: ${wins}/${needed} ${wins >= needed ? '✅ УРОВЕНЬ ПРОЙДЕН!' : ''}
            </div>
        `;
    }
    
    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${iconMap[data.result]}</div>
        <div style="font-size:32px; font-weight:800; color:${colorMap[data.result]}; margin-bottom:20px;">${titleMap[data.result]}</div>
        <div style="display:flex; gap:40px; margin-bottom:20px;">
            <div style="text-align:center;">
                <div style="font-size:40px;">👤</div>
                <div style="font-weight:700; color:${data.result === 'win' ? '#4caf50' : '#aaa'};">ТЫ</div>
                <div style="font-size:28px; font-weight:800; color:#ffd700;">${data.player_prize}⭐</div>
            </div>
            <div style="display:flex; align-items:center; font-size:36px; color:#ff6b6b;">VS</div>
            <div style="text-align:center;">
                <div style="font-size:40px;">🤖</div>
                <div style="font-weight:700; color:${data.result === 'lose' ? '#4caf50' : '#aaa'};">БОТ</div>
                <div style="font-size:28px; font-weight:800; color:#ffd700;">${data.bot_prize}⭐</div>
            </div>
        </div>
        ${data.use_star ? `<div style="color:#b388ff; font-size:14px; margin-bottom:6px;">⭐ Битва за звезду!</div>` : ''}
        ${progressHTML}
        <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center;">
            <div style="color:#aaa; font-size:14px;">${data.result_text}</div>
            ${data.commission ? `<div style="color:#888; font-size:12px;">💸 Комиссия: ${data.commission}⭐</div>` : ''}
            ${data.result === 'win' ? `<div style="color:#4caf50; font-size:16px; font-weight:700;">🏆 Ты получил: ${data.winnings}⭐</div>` : ''}
            ${data.level_unlocked ? `<div style="color:#ffd700; font-size:16px; font-weight:700; margin-top:4px;">🎉 НОВЫЙ УРОВЕНЬ ОТКРЫТ!</div>` : ''}
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeAllOverlays(); showLevels();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #ff6b6b, #ee5a24); color:#fff; font-weight:700; font-size:16px; cursor:pointer; box-shadow:0 4px 20px rgba(255,107,107,0.2);">
                🎯 УРОВНИ
            </button>
            <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                🔙 НАЗАД
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    loadBalance();
    loadLevels();
}

// ===== ЗАДАНИЯ =====
function switchQuestTab(tab) {
    document.querySelectorAll('.quest-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.quest-tab-content').forEach(el => {
        el.classList.remove('active');
    });
    const tabName = tab.charAt(0).toUpperCase() + tab.slice(1);
    const target = document.getElementById('questTab' + tabName);
    if (target) target.classList.add('active');
    
    loadQuestTab(tab);
}

async function loadQuestTab(tab) {
    const data = await apiRequest('/get_quests_data');
    if (data.error) {
        showCustomAlert('❌ ' + data.error);
        return;
    }
    
    switch(tab) {
        case 'status':
            renderStatusQuests(data);
            break;
        case 'levels':
            renderLevelQuests(data);
            break;
        case 'friends':
            renderFriendsQuests(data);
            break;
        case 'deposits':
            renderDepositQuests(data);
            break;
    }
}

function renderStatusQuests(data) {
    const container = document.getElementById('questTabStatus');
    if (!container) return;
    container.innerHTML = '';
    
    const statuses = [
        { id: 'status_hunter', name: 'Кейс-охотник', desc: 'Открой 10 кейсов', target: 10, reward: 10 },
        { id: 'status_lucky', name: 'Везунчик', desc: 'Открой 100 кейсов', target: 100, reward: 30 },
        { id: 'status_stalker', name: 'Сталкер халявы', desc: 'Открой 444 кейса', target: 444, reward: 50 },
        { id: 'status_master', name: 'Мастер фортуны', desc: 'Открой 1000 кейсов', target: 1000, reward: 100 },
        { id: 'status_legend', name: 'Легенда', desc: 'Открой 2500 кейсов', target: 2500, reward: 200 }
    ];
    
    const totalCases = data.total_cases || 0;
    const claimed = data.claimed_statuses || [];
    
    statuses.forEach(status => {
        const isComplete = totalCases >= status.target;
        const isClaimed = claimed.includes(status.id);
        const progressPercent = Math.min((totalCases / status.target) * 100, 100);
        
        const item = document.createElement('div');
        item.className = `quest-item ${isClaimed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name">${status.name}</div>
                <div class="quest-desc">${status.desc}</div>
                <div class="quest-reward">🎁 ${status.reward}⭐</div>
                <div class="quest-progress-bar">
                    <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                </div>
                <div style="font-size:12px; color:#666; margin-top:2px;">${totalCases}/${status.target}</div>
            </div>
            <button class="quest-btn ${isClaimed ? 'claimed' : ''}" ${(!isComplete || isClaimed) ? 'disabled' : ''} onclick="claimQuest('${status.id}', ${status.reward})">
                ${isClaimed ? '✅ Завершено' : isComplete ? '🎁 ЗАБРАТЬ' : `${totalCases}/${status.target}`}
            </button>
        `;
        
        container.appendChild(item);
    });
}

function renderLevelQuests(data) {
    const container = document.getElementById('questTabLevels');
    if (!container) return;
    container.innerHTML = '';
    
    const levelQuests = [
        { id: 'level_mud', name: 'Грязевой уровень', desc: 'Победи бота 3 раза в Грязи', caseType: 'mud', target: 3, reward: 15 },
        { id: 'level_wood', name: 'Деревянный уровень', desc: 'Победи бота 3 раза в Дереве', caseType: 'wood', target: 3, reward: 27 },
        { id: 'level_stone', name: 'Каменный уровень', desc: 'Победи бота 3 раза в Камне', caseType: 'stone', target: 3, reward: 57 },
        { id: 'level_bronze', name: 'Бронзовый уровень', desc: 'Победи бота 3 раза в Бронзе', caseType: 'bronze', target: 3, reward: 147 },
        { id: 'level_silver', name: 'Серебряный уровень', desc: 'Победи бота 3 раза в Серебре', caseType: 'silver', target: 3, reward: 297 },
        { id: 'level_gold', name: 'Золотой уровень', desc: 'Победи бота 3 раза в Золоте', caseType: 'gold', target: 3, reward: 747 },
        { id: 'level_diamond', name: 'Алмазный уровень', desc: 'Победи бота 3 раза в Алмазе', caseType: 'diamond', target: 3, reward: 1497 },
        { id: 'level_netherite', name: 'Незеритовый уровень', desc: 'Победи бота 3 раза в Незерите', caseType: 'netherite', target: 3, reward: 2997 },
        { id: 'level_obsidian', name: 'Обсидиановый уровень', desc: 'Победи бота 3 раза в Обсидиане', caseType: 'obsidian', target: 3, reward: 7497 },
        { id: 'level_bedrock', name: 'Бедроковый уровень', desc: 'Победи бота 3 раза в Бедроке', caseType: 'bedrock', target: 3, reward: 30000 }
    ];
    
    const levelWins = data.level_wins || {};
    const claimed = data.claimed_levels || [];
    
    let prevCompleted = true;
    
    levelQuests.forEach((quest) => {
        const wins = levelWins[quest.caseType] || 0;
        const isUnlocked = prevCompleted;
        const isComplete = wins >= quest.target;
        const isClaimed = claimed.includes(quest.id);
        const progressPercent = Math.min((wins / quest.target) * 100, 100);
        
        const item = document.createElement('div');
        item.className = `quest-item ${isClaimed ? 'completed' : ''}`;
        if (!isUnlocked) {
            item.style.opacity = '0.3';
        }
        
        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name">${quest.name} ${isUnlocked ? '' : '🔒'}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">🎁 ${quest.reward}⭐</div>
                ${isUnlocked ? `
                    <div class="quest-progress-bar">
                        <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                    </div>
                    <div style="font-size:12px; color:#666; margin-top:2px;">${wins}/${quest.target} побед</div>
                ` : `
                    <div style="font-size:12px; color:#888; margin-top:2px;">🔒 Откройте предыдущий уровень</div>
                `}
            </div>
            <button class="quest-btn ${isClaimed ? 'claimed' : ''}" ${(!isComplete || isClaimed || !isUnlocked) ? 'disabled' : ''} onclick="claimQuest('${quest.id}', ${quest.reward})">
                ${isClaimed ? '✅ Завершено' : isComplete ? '🎁 ЗАБРАТЬ' : isUnlocked ? `${wins}/${quest.target}` : '🔒'}
            </button>
        `;
        
        container.appendChild(item);
        
        if (isComplete || isClaimed) {
            prevCompleted = true;
        } else {
            prevCompleted = false;
        }
    });
}

function renderFriendsQuests(data) {
    const container = document.getElementById('questTabFriends');
    if (!container) return;
    container.innerHTML = '';
    
    const friendsQuests = [
        { id: 'friends_3', name: '3 друга', desc: 'Пригласи 3 друзей', target: 3, reward: 15 },
        { id: 'friends_5', name: '5 друзей', desc: 'Пригласи 5 друзей', target: 5, reward: 20 },
        { id: 'friends_10', name: '10 друзей', desc: 'Пригласи 10 друзей', target: 10, reward: 30 },
        { id: 'friends_100', name: '100 друзей', desc: 'Пригласи 100 друзей', target: 100, reward: 300 }
    ];
    
    const refs = data.refs || 0;
    const claimed = data.claimed_friends || [];
    
    friendsQuests.forEach(quest => {
        const isComplete = refs >= quest.target;
        const isClaimed = claimed.includes(quest.id);
        const progressPercent = Math.min((refs / quest.target) * 100, 100);
        
        const item = document.createElement('div');
        item.className = `quest-item ${isClaimed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name">👥 ${quest.name}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">🎁 ${quest.reward}⭐</div>
                <div class="quest-progress-bar">
                    <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                </div>
                <div style="font-size:12px; color:#666; margin-top:2px;">${refs}/${quest.target} друзей</div>
            </div>
            <button class="quest-btn ${isClaimed ? 'claimed' : ''}" ${(!isComplete || isClaimed) ? 'disabled' : ''} onclick="claimQuest('${quest.id}', ${quest.reward})">
                ${isClaimed ? '✅ Завершено' : isComplete ? '🎁 ЗАБРАТЬ' : `${refs}/${quest.target}`}
            </button>
        `;
        
        container.appendChild(item);
    });
}

function renderDepositQuests(data) {
    const container = document.getElementById('questTabDeposits');
    if (!container) return;
    container.innerHTML = '';
    
    const depositQuests = [
        { id: 'deposit_100', name: 'Пополни 100⭐', desc: 'Всего пополнено на 100⭐', target: 100, reward: 10 },
        { id: 'deposit_250', name: 'Пополни 250⭐', desc: 'Всего пополнено на 250⭐', target: 250, reward: 25 },
        { id: 'deposit_500', name: 'Пополни 500⭐', desc: 'Всего пополнено на 500⭐', target: 500, reward: 50 },
        { id: 'deposit_1000', name: 'Пополни 1000⭐', desc: 'Всего пополнено на 1000⭐', target: 1000, reward: 100 },
        { id: 'deposit_10000', name: 'Пополни 10000⭐', desc: 'Всего пополнено на 10000⭐', target: 10000, reward: 1000 }
    ];
    
    const totalDeposited = data.total_deposited || 0;
    const claimed = data.claimed_deposits || [];
    
    depositQuests.forEach(quest => {
        const isComplete = totalDeposited >= quest.target;
        const isClaimed = claimed.includes(quest.id);
        const progressPercent = Math.min((totalDeposited / quest.target) * 100, 100);
        
        const item = document.createElement('div');
        item.className = `quest-item ${isClaimed ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name">💰 ${quest.name}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">🎁 ${quest.reward}⭐</div>
                <div class="quest-progress-bar">
                    <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                </div>
                <div style="font-size:12px; color:#666; margin-top:2px;">${totalDeposited}/${quest.target}⭐</div>
            </div>
            <button class="quest-btn ${isClaimed ? 'claimed' : ''}" ${(!isComplete || isClaimed) ? 'disabled' : ''} onclick="claimQuest('${quest.id}', ${quest.reward})">
                ${isClaimed ? '✅ Завершено' : isComplete ? '🎁 ЗАБРАТЬ' : `${totalDeposited}/${quest.target}`}
            </button>
        `;
        
        container.appendChild(item);
    });
}

async function claimQuest(questId, reward) {
    const data = await apiRequest('/claim_quest', { quest_id: questId });
    if (data.error) {
        showCustomAlert('❌ ' + data.error);
        return;
    }
    if (data.success) {
        showCustomAlert(`✅ Получено ${reward}⭐!`, true);
        loadBalance();
        const activeTab = document.querySelector('.quest-tab.active');
        if (activeTab) {
            loadQuestTab(activeTab.dataset.tab);
        }
        if (document.getElementById('levelsScreen').classList.contains('active')) {
            loadLevels();
        }
    }
}

// ===== ПРОМОКОД =====
function showPromoModal() {
    document.getElementById('promoModal').style.display = 'flex';
}

function closePromoModal() {
    document.getElementById('promoModal').style.display = 'none';
    document.getElementById('promoInput').value = '';
}

async function submitPromo() {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    if (!code) {
        showCustomAlert('❌ Введите промокод!');
        return;
    }
    
    const data = await apiRequest('/apply_promo', { promo_code: code });
    if (data.error) {
        showCustomAlert('❌ ' + data.error);
        return;
    }
    if (data.success) {
        showCustomAlert(`✅ Промокод активирован! Получено ${data.reward}⭐`, true);
        closePromoModal();
        loadBalance();
    }
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

// ===== МИНИ-ИГРЫ (КРАШ) =====
let crashState = {
    active: false,
    running: false,
    betPlaced: false,
    waitingForStart: false,
    gameStarted: false,
    gameId: null,
    interval: null,
    pollingInterval: null,
    resultShown: false,
    chartData: [],
    ctx: null,
    canvas: null,
    animating: false
};

function initCrash() {
    const canvas = document.getElementById('crashCanvas') || document.getElementById('game_crashCanvas');
    if (!canvas) return;
    
    crashState.canvas = canvas;
    crashState.ctx = canvas.getContext('2d');
    crashState.chartData = [];
    drawCrashChart();
    
    const startBtn = document.getElementById('crashStartBtn') || document.getElementById('game_crashStartBtn');
    const cashoutBtn = document.getElementById('crashCashoutBtn') || document.getElementById('game_crashCashoutBtn');
    const betInput = document.getElementById('crashBetInput') || document.getElementById('game_crashBetInput');
    
    if (startBtn) {
        startBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!crashState.active && !crashState.running) {
                placeCrashBet();
            }
        };
        startBtn.style.animation = 'none';
        startBtn.style.transition = 'none';
    }
    
    if (cashoutBtn) {
        cashoutBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            cashoutCrash();
        };
    }
    
    if (betInput) {
        betInput.onchange = function() {
            let val = parseInt(this.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 1000) val = 1000;
            this.value = val;
        };
    }
    
    startCrashPolling();
}

function drawCrashChart() {
    const ctx = crashState.ctx;
    const canvas = crashState.canvas;
    const data = crashState.chartData || [];
    
    if (!ctx || !canvas) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    if (data.length < 2) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ожидание игры...', w/2, h/2 + 5);
        return;
    }
    
    const maxVal = Math.max(...data, 1);
    const scaleY = (h - 20) / (maxVal * 1.2);
    const scaleX = (w - 20) / (data.length - 1);
    
    ctx.beginPath();
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255,107,107,0.3)';
    ctx.shadowBlur = 10;
    
    data.forEach((val, i) => {
        const x = 10 + i * scaleX;
        const y = h - 10 - (val * scaleY);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    const lastX = 10 + (data.length - 1) * scaleX;
    const lastY = h - 10 - (data[data.length - 1] * scaleY);
    ctx.lineTo(lastX, h - 10);
    ctx.lineTo(10, h - 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,107,107,0.08)';
    ctx.fill();
    
    const currentVal = data[data.length - 1] || 1.00;
    const color = currentVal < 2 ? '#4caf50' : currentVal < 5 ? '#ffd700' : currentVal < 8 ? '#ff9800' : '#f44336';
    
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    const multiplierEl = document.getElementById('crashMultiplier') || document.getElementById('game_crashMultiplier');
    if (multiplierEl) {
        multiplierEl.textContent = `x${currentVal.toFixed(2)}`;
        multiplierEl.style.color = color;
    }
    
    const progressEl = document.getElementById('crashProgressBar') || document.getElementById('game_crashProgressBar');
    if (progressEl) {
        const progress = Math.min((currentVal / 12) * 100, 100);
        progressEl.style.width = progress + '%';
    }
}

function updateCrashChart(multiplier) {
    crashState.chartData.push(multiplier);
    if (crashState.chartData.length > 200) {
        crashState.chartData.shift();
    }
    drawCrashChart();
}

function resetCrashChart() {
    crashState.chartData = [];
    drawCrashChart();
    const multiplierEl = document.getElementById('crashMultiplier') || document.getElementById('game_crashMultiplier');
    if (multiplierEl) {
        multiplierEl.textContent = 'x1.00';
        multiplierEl.style.color = '#b388ff';
    }
    const progressEl = document.getElementById('crashProgressBar') || document.getElementById('game_crashProgressBar');
    if (progressEl) {
        progressEl.style.width = '0%';
    }
}

function startCrashPolling() {
    if (crashState.pollingInterval) clearInterval(crashState.pollingInterval);
    
    crashState.pollingInterval = setInterval(() => {
        apiRequest('/crash_status', {}).then(status => {
            if (status.error) return;
            
            const d = {
                multiplier: document.getElementById('crashMultiplier') || document.getElementById('game_crashMultiplier'),
                status: document.getElementById('crashStatus') || document.getElementById('game_crashStatus'),
                timer: document.getElementById('crashTimer') || document.getElementById('game_crashTimer'),
                betDisplay: document.getElementById('crashBetDisplay') || document.getElementById('game_crashBetDisplay'),
                multiplierDisplay: document.getElementById('crashMultiplierDisplay') || document.getElementById('game_crashMultiplierDisplay'),
                startBtn: document.getElementById('crashStartBtn') || document.getElementById('game_crashStartBtn'),
                cashoutBtn: document.getElementById('crashCashoutBtn') || document.getElementById('game_crashCashoutBtn'),
                betInput: document.getElementById('crashBetInput') || document.getElementById('game_crashBetInput'),
                progress: document.getElementById('crashProgressBar') || document.getElementById('game_crashProgressBar')
            };
            
            const multiplier = status.multiplier || 1.00;
            const crashPoint = status.crash_multiplier_at_crash || 1.00;
            const timeToNew = status.time_to_new_round || 0;
            
            if (status.round_phase === 'active') {
                updateCrashChart(multiplier);
                if (d.multiplierDisplay) d.multiplierDisplay.textContent = `x${multiplier}`;
                if (d.multiplier) {
                    d.multiplier.textContent = `x${multiplier.toFixed(2)}`;
                    d.multiplier.style.color = multiplier < 2 ? '#4caf50' : multiplier < 5 ? '#ffd700' : multiplier < 8 ? '#ff9800' : '#f44336';
                    d.multiplier.className = '';
                }
                if (d.status) d.status.textContent = '';
                if (d.timer) {
                    d.timer.textContent = '';
                    d.timer.style.fontSize = '0px';
                }
                if (d.startBtn) {
                    d.startBtn.style.display = 'none';
                    d.startBtn.disabled = true;
                }
                if (d.cashoutBtn) {
                    d.cashoutBtn.style.display = 'block';
                    d.cashoutBtn.style.width = '100%';
                    d.cashoutBtn.style.padding = '18px';
                    d.cashoutBtn.style.fontSize = '20px';
                    d.cashoutBtn.disabled = false;
                    d.cashoutBtn.textContent = '💰 ЗАБРАТЬ';
                    d.cashoutBtn.onclick = cashoutCrash;
                }
                
                const backBtn = document.querySelector('.btn-back');
                if (backBtn) backBtn.style.display = 'none';
                
                if (crashState.waitingForStart) {
                    crashState.waitingForStart = false;
                    crashState.gameStarted = true;
                }
                crashState.betPlaced = false;
                crashState.animating = false;
            }
            
            else if (status.round_phase === 'crashed') {
                if (d.multiplier) {
                    d.multiplier.textContent = `x${crashPoint.toFixed(2)}`;
                    d.multiplier.style.color = '#f44336';
                    d.multiplier.className = 'crashed';
                }
                if (d.status) d.status.textContent = `💥 КРАШ! x${crashPoint.toFixed(2)}`;
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                if (d.startBtn) d.startBtn.style.display = 'none';
                
                const backBtn = document.querySelector('.btn-back');
                if (backBtn) backBtn.style.display = 'block';
                
                if (!crashState.animating) {
                    crashState.animating = true;
                    
                    const chart = document.getElementById('crashChart') || document.getElementById('game_crashChart');
                    if (chart) {
                        chart.style.transition = 'box-shadow 0.3s ease';
                        chart.style.boxShadow = '0 0 60px rgba(255,0,0,0.4), inset 0 0 60px rgba(255,0,0,0.1)';
                        setTimeout(() => {
                            chart.style.boxShadow = 'none';
                        }, 1500);
                    }
                    
                    if (d.multiplier) {
                        d.multiplier.style.transition = 'transform 0.1s ease';
                        let pulseCount = 0;
                        const pulseInterval = setInterval(() => {
                            if (pulseCount >= 8) {
                                clearInterval(pulseInterval);
                                if (d.multiplier) d.multiplier.style.transform = 'scale(1)';
                                return;
                            }
                            if (d.multiplier) {
                                d.multiplier.style.transform = pulseCount % 2 === 0 ? 'scale(1.2)' : 'scale(1)';
                            }
                            pulseCount++;
                        }, 150);
                    }
                    
                    setTimeout(() => {
                        resetCrashChart();
                        crashState.animating = false;
                        
                        if (timeToNew > 0) {
                            if (d.timer) {
                                d.timer.textContent = `${Math.ceil(timeToNew)}`;
                                d.timer.style.fontSize = '48px';
                                d.timer.style.fontWeight = '900';
                                d.timer.style.color = '#ffd700';
                            }
                            if (d.startBtn) {
                                d.startBtn.style.display = 'inline-block';
                                d.startBtn.textContent = '🎮 ИГРАТЬ';
                                d.startBtn.onclick = function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!crashState.active && !crashState.running) {
                                        placeCrashBet();
                                    }
                                };
                                d.startBtn.disabled = false;
                            }
                            if (d.status) d.status.textContent = `⏳ Новая игра через ${Math.ceil(timeToNew)} сек...`;
                        } else {
                            if (d.timer) {
                                d.timer.textContent = '🚀 МОЖНО СТАВИТЬ!';
                                d.timer.style.fontSize = '16px';
                                d.timer.style.fontWeight = '600';
                                d.timer.style.color = '#4caf50';
                            }
                            if (d.startBtn) {
                                d.startBtn.style.display = 'inline-block';
                                d.startBtn.textContent = '🎮 ИГРАТЬ';
                                d.startBtn.onclick = function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!crashState.active && !crashState.running) {
                                        placeCrashBet();
                                    }
                                };
                                d.startBtn.disabled = false;
                            }
                            if (d.status) d.status.textContent = '🚀 Нажми «ИГРАТЬ», чтобы сделать ставку!';
                        }
                        
                        crashState.betPlaced = false;
                        crashState.waitingForStart = false;
                        crashState.gameStarted = false;
                        crashState.running = false;
                        
                        if (!crashState.resultShown) {
                            crashState.resultShown = true;
                            if (crashState.gameId) {
                                showCrashResult('lose', 0, crashPoint);
                            }
                            loadBalance();
                        }
                        
                        const backBtn2 = document.querySelector('.btn-back');
                        if (backBtn2) backBtn2.style.display = 'block';
                        
                    }, 1500);
                }
            }
            
            else if (status.round_phase === 'waiting') {
                resetCrashChart();
                if (d.timer) {
                    d.timer.textContent = '🚀 МОЖНО СТАВИТЬ!';
                    d.timer.style.fontSize = '16px';
                    d.timer.style.fontWeight = '600';
                    d.timer.style.color = '#4caf50';
                }
                if (d.status) d.status.textContent = '🚀 Нажми «ИГРАТЬ», чтобы сделать ставку!';
                if (d.startBtn) {
                    d.startBtn.style.display = 'inline-block';
                    d.startBtn.disabled = false;
                    d.startBtn.textContent = '🎮 ИГРАТЬ';
                    d.startBtn.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!crashState.active && !crashState.running) {
                            placeCrashBet();
                        }
                    };
                }
                if (d.multiplier) {
                    d.multiplier.textContent = 'x1.00';
                    d.multiplier.style.color = '#b388ff';
                    d.multiplier.className = '';
                }
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                
                const backBtn = document.querySelector('.btn-back');
                if (backBtn) backBtn.style.display = 'block';
                
                crashState.betPlaced = false;
                crashState.waitingForStart = false;
                crashState.gameStarted = false;
                crashState.running = false;
                crashState.resultShown = false;
                crashState.animating = false;
            }
        });
    }, 100);
}

function placeCrashBet() {
    const startBtn = document.getElementById('crashStartBtn') || document.getElementById('game_crashStartBtn');
    const betInput = document.getElementById('crashBetInput') || document.getElementById('game_crashBetInput');
    const statusEl = document.getElementById('crashStatus') || document.getElementById('game_crashStatus');
    const betDisplay = document.getElementById('crashBetDisplay') || document.getElementById('game_crashBetDisplay');
    
    if (!startBtn || startBtn.disabled) {
        showCustomAlert('⏳ Подождите окончания отсчёта!');
        return;
    }
    
    if (crashState.running || crashState.gameStarted) {
        showCustomAlert('⏳ Игра уже идёт!');
        return;
    }
    
    if (crashState.betPlaced) {
        showCustomAlert('⏳ Ставка уже сделана!');
        return;
    }
    
    let bet = 10;
    if (betInput) {
        bet = parseInt(betInput.value);
        if (isNaN(bet) || bet < 1) bet = 1;
        if (bet > 1000) bet = 1000;
        betInput.value = bet;
    }
    
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
            
            crashState.gameId = gameData.game_id;
            crashState.betPlaced = true;
            crashState.waitingForStart = true;
            crashState.gameStarted = false;
            crashState.running = false;
            crashState.resultShown = false;
            crashState.animating = false;
            crashState.active = true;
            
            if (betDisplay) betDisplay.textContent = bet;
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.textContent = '⏳ ОЖИДАНИЕ СТАРТА...';
                startBtn.onclick = null;
            }
            if (statusEl) statusEl.textContent = '⏳ Ожидание начала игры...';
            
            if (crashState.interval) clearInterval(crashState.interval);
            
            crashState.interval = setInterval(() => {
                apiRequest('/crash_status', {}).then(status => {
                    if (status.error) {
                        clearInterval(crashState.interval);
                        crashState.running = false;
                        if (statusEl) statusEl.textContent = '❌ ' + status.error;
                        return;
                    }
                    
                    if (status.round_phase === 'active' && crashState.waitingForStart) {
                        crashState.waitingForStart = false;
                        crashState.running = true;
                        crashState.gameStarted = true;
                        crashState.active = true;
                        
                        resetCrashChart();
                        
                        if (startBtn) {
                            startBtn.style.display = 'none';
                            startBtn.disabled = true;
                        }
                        
                        const cashoutBtn = document.getElementById('crashCashoutBtn') || document.getElementById('game_crashCashoutBtn');
                        if (cashoutBtn) {
                            cashoutBtn.style.display = 'block';
                            cashoutBtn.style.width = '100%';
                            cashoutBtn.style.padding = '18px';
                            cashoutBtn.style.fontSize = '20px';
                            cashoutBtn.disabled = false;
                            cashoutBtn.textContent = '💰 ЗАБРАТЬ';
                            cashoutBtn.onclick = cashoutCrash;
                        }
                        
                        if (statusEl) statusEl.textContent = '';
                        
                        const multiplierEl = document.getElementById('crashMultiplier') || document.getElementById('game_crashMultiplier');
                        if (multiplierEl) multiplierEl.className = '';
                        
                        const timerEl = document.getElementById('crashTimer') || document.getElementById('game_crashTimer');
                        if (timerEl) {
                            timerEl.textContent = '';
                            timerEl.style.fontSize = '0px';
                        }
                        
                        const backBtn = document.querySelector('.btn-back');
                        if (backBtn) backBtn.style.display = 'none';
                        
                        clearInterval(crashState.interval);
                        crashState.interval = setInterval(() => {
                            apiRequest('/crash_status', {}).then(status2 => {
                                if (status2.error) {
                                    clearInterval(crashState.interval);
                                    crashState.running = false;
                                    if (statusEl) statusEl.textContent = '❌ ' + status2.error;
                                    return;
                                }
                                
                                updateCrashChart(status2.multiplier);
                                
                                const multiplierDisplay = document.getElementById('crashMultiplierDisplay') || document.getElementById('game_crashMultiplierDisplay');
                                if (multiplierDisplay) multiplierDisplay.textContent = `x${status2.multiplier}`;
                                
                                if (status2.crashed) {
                                    clearInterval(crashState.interval);
                                    crashState.running = false;
                                    crashState.gameStarted = false;
                                    crashState.resultShown = false;
                                    
                                    const multiplierEl2 = document.getElementById('crashMultiplier') || document.getElementById('game_crashMultiplier');
                                    if (multiplierEl2) {
                                        multiplierEl2.className = 'crashed';
                                        const crashPoint = status2.crash_multiplier_at_crash || status2.multiplier;
                                        multiplierEl2.textContent = `x${crashPoint.toFixed(2)}`;
                                        multiplierEl2.style.color = '#f44336';
                                    }
                                    if (statusEl) statusEl.textContent = `💥 КРАШ! x${crashPoint.toFixed(2)}`;
                                    
                                    const cashoutBtn2 = document.getElementById('crashCashoutBtn') || document.getElementById('game_crashCashoutBtn');
                                    if (cashoutBtn2) cashoutBtn2.style.display = 'none';
                                    if (startBtn) startBtn.style.display = 'none';
                                }
                            });
                        }, 100);
                    }
                });
            }, 100);
        });
    });
}

function cashoutCrash() {
    if (!crashState.running || !crashState.gameId) {
        showCustomAlert('❌ Нет активной игры!');
        return;
    }
    
    const cashoutBtn = document.getElementById('crashCashoutBtn') || document.getElementById('game_crashCashoutBtn');
    if (cashoutBtn) {
        cashoutBtn.disabled = true;
        cashoutBtn.textContent = '⏳ ОБРАБОТКА...';
    }
    
    apiRequest('/cashout_crash', { game_id: crashState.gameId }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            if (cashoutBtn) {
                cashoutBtn.disabled = false;
                cashoutBtn.textContent = '💰 ЗАБРАТЬ';
            }
            return;
        }
        
        crashState.running = false;
        crashState.betPlaced = false;
        crashState.waitingForStart = false;
        crashState.gameStarted = false;
        crashState.active = false;
        crashState.resultShown = true;
        
        if (crashState.interval) {
            clearInterval(crashState.interval);
            crashState.interval = null;
        }
        
        const multiplierEl = document.getElementById('crashMultiplier') || document.getElementById('game_crashMultiplier');
        if (multiplierEl) multiplierEl.className = 'win';
        
        const statusEl = document.getElementById('crashStatus') || document.getElementById('game_crashStatus');
        if (statusEl) statusEl.textContent = `💰 Выигрыш: ${data.winnings}⭐ (x${data.multiplier})`;
        
        if (cashoutBtn) {
            cashoutBtn.style.display = 'none';
            cashoutBtn.disabled = false;
            cashoutBtn.textContent = '💰 ЗАБРАТЬ';
        }
        
        const startBtn = document.getElementById('crashStartBtn') || document.getElementById('game_crashStartBtn');
        if (startBtn) {
            startBtn.style.display = 'inline-block';
            startBtn.disabled = true;
            startBtn.textContent = '⏳ ОЖИДАНИЕ...';
            startBtn.onclick = null;
        }
        
        const backBtn = document.querySelector('.btn-back');
        if (backBtn) backBtn.style.display = 'block';
        
        showCrashResult('win', data.winnings, data.multiplier);
        loadBalance();
    }).catch(() => {
        if (cashoutBtn) {
            cashoutBtn.disabled = false;
            cashoutBtn.textContent = '💰 ЗАБРАТЬ';
        }
        showCustomAlert('❌ Ошибка при выводе');
    });
}

function showCrashResult(result, winnings, multiplier) {
    if (document.getElementById('crashResultOverlay')) return;
    
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
                <button onclick="document.getElementById('crashResultOverlay').remove(); resetCrashUI();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔄 ИГРАТЬ СНОВА</button>
                <button onclick="document.getElementById('crashResultOverlay').remove(); showGames();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
            </div>
        `;
    } else {
        overlay.innerHTML = `
            <div style="font-size:80px; margin-bottom:10px;">💥</div>
            <div style="font-size:32px; font-weight:800; color:#f44336; margin-bottom:10px;">КРАШ!</div>
            <div style="color:#aaa; font-size:16px;">Множитель: x${multiplier}</div>
            <div style="color:#888; font-size:14px; margin-top:4px;">Ты потерял ставку</div>
            <div style="display:flex; gap:16px; margin-top:20px; flex-wrap:wrap; justify-content:center;">
                <button onclick="document.getElementById('crashResultOverlay').remove(); resetCrashUI();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #ff6b6b, #ee5a24); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔄 ИГРАТЬ СНОВА</button>
                <button onclick="document.getElementById('crashResultOverlay').remove(); showGames();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
            </div>
        `;
    }
    
    document.body.appendChild(overlay);
}

function resetCrashUI() {
    crashState.active = false;
    crashState.running = false;
    crashState.betPlaced = false;
    crashState.waitingForStart = false;
    crashState.gameStarted = false;
    crashState.gameId = null;
    crashState.resultShown = false;
    crashState.animating = false;
    
    if (crashState.interval) {
        clearInterval(crashState.interval);
        crashState.interval = null;
    }
    
    resetCrashChart();
    
    const startBtn = document.getElementById('crashStartBtn') || document.getElementById('game_crashStartBtn');
    if (startBtn) {
        startBtn.style.display = 'inline-block';
        startBtn.disabled = false;
        startBtn.textContent = '🎮 ИГРАТЬ';
        startBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!crashState.active && !crashState.running) {
                placeCrashBet();
            }
        };
        startBtn.style.animation = 'none';
        startBtn.style.transition = 'none';
    }
    
    const cashoutBtn = document.getElementById('crashCashoutBtn') || document.getElementById('game_crashCashoutBtn');
    if (cashoutBtn) {
        cashoutBtn.style.display = 'none';
        cashoutBtn.disabled = false;
        cashoutBtn.textContent = '💰 ЗАБРАТЬ';
    }
    
    const statusEl = document.getElementById('crashStatus') || document.getElementById('game_crashStatus');
    if (statusEl) statusEl.textContent = '🚀 Нажми «ИГРАТЬ», чтобы сделать ставку!';
    
    const timerEl = document.getElementById('crashTimer') || document.getElementById('game_crashTimer');
    if (timerEl) {
        timerEl.textContent = '🚀 МОЖНО СТАВИТЬ!';
        timerEl.style.fontSize = '16px';
        timerEl.style.fontWeight = '600';
        timerEl.style.color = '#4caf50';
    }
    
    const betDisplay = document.getElementById('crashBetDisplay') || document.getElementById('game_crashBetDisplay');
    if (betDisplay) betDisplay.textContent = '0';
    
    const multiplierDisplay = document.getElementById('crashMultiplierDisplay') || document.getElementById('game_crashMultiplierDisplay');
    if (multiplierDisplay) multiplierDisplay.textContent = 'x1.00';
    
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) backBtn.style.display = 'block';
    
    const chart = document.getElementById('crashChart') || document.getElementById('game_crashChart');
    if (chart) {
        chart.style.boxShadow = 'none';
        chart.style.transition = 'none';
    }
}

// ===== МИНИ-ИГРЫ (МИНЁР) =====
let gameMinesData = null;
let gameMinesSelected = 4;

function showMinesGame() {
    const menu = document.getElementById('gamesMenu');
    const container = document.getElementById('minesGameContainer');
    
    if (!menu || !container) {
        showCustomAlert('❌ Ошибка загрузки игры');
        return;
    }
    
    menu.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `
        <div class="section-title" style="font-size:18px;">💣 МИНЁР</div>
        <div style="color:#888; font-size:14px; text-align:center; margin-bottom:12px;">Открывайте клетки, избегайте мин и забирайте выигрыш!</div>
        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px; max-width:400px; margin:0 auto 16px;" id="gm_board"></div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; background:rgba(255,255,255,0.05); border-radius:16px; padding:14px; margin-bottom:16px;">
            <div style="color:#aaa; font-size:14px;">💰 Ставка: <b id="gm_bet_display" style="color:#fff;">0</b>⭐</div>
            <div style="color:#aaa; font-size:14px;">💣 X: <b id="gm_count_display" style="color:#fff;">0</b></div>
            <div style="color:#aaa; font-size:14px;">🔥 Множитель: <b id="gm_multiplier_display" style="color:#ffd700;">x1.0</b></div>
            <div style="color:#aaa; font-size:14px; grid-column:span 3;">📦 Открыто: <b id="gm_opened_display" style="color:#4caf50;">0</b> / <span id="gm_total_safe">0</span></div>
        </div>
        <div style="margin-bottom:12px;">
            <div style="color:#aaa; font-size:14px; margin-bottom:6px;">💰 Ставка (3-1000⭐):</div>
            <input type="number" id="gm_bet_input" min="3" max="1000" value="100" style="width:100%; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
        </div>
        <div style="margin-bottom:12px; overflow-x:auto; white-space:nowrap; padding:4px 0;">
            <div id="gm_options" style="display:inline-flex; gap:8px;">
                <button class="gm_btn" data-mines="3">3 (x1.3)</button>
                <button class="gm_btn active" data-mines="4">4 (x1.5)</button>
                <button class="gm_btn" data-mines="5">5 (x2.0)</button>
                <button class="gm_btn" data-mines="6">6 (x2.5)</button>
                <button class="gm_btn" data-mines="7">7 (x3.0)</button>
                <button class="gm_btn" data-mines="8">8 (x4.0)</button>
            </div>
        </div>
        <button id="gm_start_btn" style="width:100%; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#ff6b6b,#ee5a24); color:#fff; font-weight:800; font-size:18px; cursor:pointer;">🎮 НАЧАТЬ ИГРУ</button>
        <button id="gm_cashout_btn" style="display:none; width:100%; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#ffd700,#f9a825); color:#000; font-weight:800; font-size:18px; cursor:pointer; margin-top:10px;">💰 ЗАБРАТЬ ВЫИГРЫШ (<span id="gm_cashout_amount">0</span>⭐)</button>
    `;
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад к играм';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        container.style.display = 'none';
        menu.style.display = 'flex';
    };
    container.appendChild(backBtn);
    
    setTimeout(() => {
        initGameMines();
    }, 50);
}

function initGameMines() {
    const board = document.getElementById('gm_board');
    if (!board) return;
    board.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'gm_cell';
        cell.dataset.index = i;
        cell.textContent = '❓';
        cell.style.cssText = 'aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:700; background:rgba(255,255,255,0.04); border-radius:12px; border:1px solid rgba(255,255,255,0.06); cursor:pointer; transition:all 0.15s ease; user-select:none; color:#fff; min-height:60px; box-shadow:inset 0 2px 10px rgba(0,0,0,0.2);';
        cell.onclick = () => openGameMinesCell(i);
        board.appendChild(cell);
    }
    
    document.querySelectorAll('.gm_btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.gm_btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameMinesSelected = parseInt(this.dataset.mines);
        };
    });
    
    document.getElementById('gm_start_btn').onclick = startGameMines;
    document.getElementById('gm_cashout_btn').onclick = cashoutGameMines;
    document.getElementById('gm_bet_input').addEventListener('change', function() {
        let val = parseInt(this.value);
        if (isNaN(val) || val < 3) val = 3;
        if (val > 1000) val = 1000;
        this.value = val;
    });
}

function startGameMines() {
    const betInput = document.getElementById('gm_bet_input');
    const bet = parseInt(betInput ? betInput.value : 100);
    const mines = gameMinesSelected;
    
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
            
            gameMinesData = {
                game_id: gameData.game_id,
                bet: gameData.bet,
                mines: gameData.mines,
                opened: 0,
                safe_cells: 25 - gameData.mines,
                multiplier: 1.0,
                board: gameData.board,
                openedCells: gameData.opened,
                active: true,
                game_over: false
            };
            
            document.getElementById('gm_bet_display').textContent = bet;
            document.getElementById('gm_count_display').textContent = mines;
            document.getElementById('gm_total_safe').textContent = 25 - mines;
            document.getElementById('gm_opened_display').textContent = '0';
            document.getElementById('gm_multiplier_display').textContent = 'x1.0';
            document.getElementById('gm_cashout_btn').style.display = 'inline-block';
            document.getElementById('gm_start_btn').textContent = '🔄 ИГРАТЬ СНОВА';
            
            renderGameMinesBoard();
            updateGameMinesCashout();
        });
    });
}

function renderGameMinesBoard() {
    const board = document.getElementById('gm_board');
    if (!board || !gameMinesData) return;
    const cells = board.querySelectorAll('.gm_cell');
    const { board: dataBoard, openedCells } = gameMinesData;
    
    cells.forEach((cell, i) => {
        if (openedCells[i] === 1) {
            cell.classList.add('opened');
            cell.style.cursor = 'default';
            if (dataBoard[i] === 1) {
                cell.textContent = '💣';
                cell.style.background = 'rgba(255,0,0,0.2)';
                cell.style.borderColor = 'rgba(255,0,0,0.3)';
                cell.onclick = null;
            } else {
                cell.textContent = '💎';
                cell.style.background = 'rgba(0,255,0,0.08)';
                cell.style.borderColor = 'rgba(0,255,0,0.12)';
                cell.onclick = null;
            }
        } else {
            cell.textContent = '❓';
            cell.className = 'gm_cell';
            cell.style.background = 'rgba(255,255,255,0.04)';
            cell.style.borderColor = 'rgba(255,255,255,0.06)';
            cell.onclick = () => openGameMinesCell(i);
        }
    });
}

function openGameMinesCell(index) {
    if (!gameMinesData || !gameMinesData.active || gameMinesData.game_over) return;
    if (gameMinesData.openedCells[index] === 1) return;
    
    apiRequest('/open_mines_cell', { 
        game_id: gameMinesData.game_id,
        index 
    }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        
        gameMinesData.board = data.board;
        gameMinesData.openedCells = data.opened;
        gameMinesData.opened = data.opened_count;
        gameMinesData.multiplier = data.multiplier;
        
        document.getElementById('gm_opened_display').textContent = gameMinesData.opened;
        document.getElementById('gm_multiplier_display').textContent = 'x' + gameMinesData.multiplier;
        
        if (data.game_over) {
            gameMinesData.active = false;
            gameMinesData.game_over = true;
            document.getElementById('gm_cashout_btn').style.display = 'none';
            
            for (let i = 0; i < 25; i++) {
                if (gameMinesData.board[i] === 1) {
                    gameMinesData.openedCells[i] = 1;
                }
            }
            renderGameMinesBoard();
            
            if (data.won) {
                showCustomAlert(`🎉 ПОБЕДА! Ты выиграл ${data.winnings}⭐!`, true);
            } else {
                showCustomAlert(`💥 ВЗРЫВ! Ты потерял ${data.bet}⭐`);
            }
            loadBalance();
            return;
        }
        
        renderGameMinesBoard();
        updateGameMinesCashout();
    });
}

function cashoutGameMines() {
    if (!gameMinesData || !gameMinesData.active || gameMinesData.game_over) return;
    if (gameMinesData.opened < 3) {
        showCustomAlert('❌ Нужно открыть минимум 3 клетки!');
        return;
    }
    
    apiRequest('/cashout_mines', { game_id: gameMinesData.game_id }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }
        
        gameMinesData.active = false;
        gameMinesData.game_over = true;
        document.getElementById('gm_cashout_btn').style.display = 'none';
        showCustomAlert(`💰 ВЫИГРЫШ! Ты забрал ${data.winnings}⭐ (x${data.multiplier})`, true);
        loadBalance();
    });
}

function updateGameMinesCashout() {
    if (!gameMinesData) return;
    const amount = Math.floor(gameMinesData.bet * gameMinesData.multiplier);
    document.getElementById('gm_cashout_amount').textContent = amount;
}

// ===== МИНИ-ИГРЫ (АПГРЕЙД) =====
function showUpgradeGame() {
    const menu = document.getElementById('gamesMenu');
    const container = document.getElementById('upgradeGameContainer');
    
    if (!menu || !container) {
        showCustomAlert('❌ Ошибка загрузки игры');
        return;
    }
    
    menu.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `
        <div class="section-title" style="font-size:18px;">⚡ АПГРЕЙД</div>
        <div class="balance-card" style="margin-bottom:12px; padding:14px 18px;">
            <span class="balance-label">💰 Баланс</span>
            <span class="balance-value" id="gu_balance">0 ⭐</span>
        </div>
        <div id="gu_input_section">
            <div style="margin-bottom:12px;">
                <div style="color:#aaa; font-size:14px; margin-bottom:6px;">📤 СТАВКА (1–1000 ⭐)</div>
                <input type="number" id="gu_bet" min="1" max="1000" value="10" style="width:100%; padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
            </div>
            <div style="margin-bottom:12px;">
                <div style="color:#aaa; font-size:14px; margin-bottom:6px;">🎯 ЦЕЛЬ (от {bet+1} до 2000 ⭐)</div>
                <input type="number" id="gu_target" min="2" max="2000" value="15" style="width:100%; padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
            </div>
            <div style="background:rgba(255,255,255,0.04); border-radius:16px; padding:14px; margin-bottom:16px; text-align:center;">
                <div style="color:#aaa; font-size:14px;">Шанс на успех:</div>
                <div style="font-size:28px; font-weight:900; color:#ff6b6b;" id="gu_chance">0%</div>
            </div>
            <button id="gu_btn" style="width:100%; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; font-weight:800; font-size:18px; cursor:pointer;">⚡ АПГРЕЙДНУТЬ</button>
        </div>
        <div id="gu_animation_section" style="display:none; text-align:center;">
            <canvas id="gu_wheel" width="400" height="400" style="width:100%; max-width:340px; aspect-ratio:1; margin:0 auto 16px; border-radius:50%; box-shadow:0 0 60px rgba(255,107,107,0.15);"></canvas>
            <div id="gu_result" style="font-size:18px; font-weight:700; min-height:30px;"></div>
            <button onclick="resetGameUpgrade()" style="width:100%; padding:14px; border:none; border-radius:14px; background:linear-gradient(135deg,#ff6b6b,#ee5a24); color:#fff; font-weight:700; cursor:pointer; margin-top:12px;">🔄 ЕЩЁ РАЗ</button>
        </div>
    `;
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад к играм';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        container.style.display = 'none';
        menu.style.display = 'flex';
    };
    container.appendChild(backBtn);
    
    setTimeout(() => {
        initGameUpgrade();
    }, 50);
}

function initGameUpgrade() {
    loadGameUpgradeBalance();
    updateGameUpgradeChance();
    
    document.getElementById('gu_bet').addEventListener('input', updateGameUpgradeChance);
    document.getElementById('gu_target').addEventListener('input', updateGameUpgradeChance);
    document.getElementById('gu_btn').onclick = startGameUpgrade;
}

function loadGameUpgradeBalance() {
    apiRequest('/get_balance').then(data => {
        if (data.balance !== undefined) {
            document.getElementById('gu_balance').textContent = data.balance + ' ⭐';
        }
    });
}

function updateGameUpgradeChance() {
    const bet = parseInt(document.getElementById('gu_bet').value) || 1;
    const target = parseInt(document.getElementById('gu_target').value) || bet + 1;
    if (target <= bet) {
        document.getElementById('gu_chance').textContent = '0%';
        return;
    }
    const raw = (bet / target) * 100;
    const chance = Math.min(Math.max(raw, 1), 70);
    document.getElementById('gu_chance').textContent = chance.toFixed(2) + '%';
}

function startGameUpgrade() {
    const bet = parseInt(document.getElementById('gu_bet').value) || 1;
    const target = parseInt(document.getElementById('gu_target').value) || bet + 1;

    if (bet < 1 || bet > 1000) {
        showCustomAlert('❌ Ставка от 1 до 1000⭐');
        return;
    }
    if (target < bet + 1 || target > 2000) {
        showCustomAlert('❌ Цель от ' + (bet + 1) + ' до 2000⭐');
        return;
    }

    apiRequest('/upgrade_calculate', { bet, target }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }

        document.getElementById('gu_input_section').style.display = 'none';
        document.getElementById('gu_animation_section').style.display = 'block';
        document.getElementById('gu_result').textContent = '';

        startGameUpgradeAnimation(data.chance, bet, target);
    });
}

function startGameUpgradeAnimation(chance, bet, target) {
    const canvas = document.getElementById('gu_wheel');
    const ctx = canvas.getContext('2d');
    const centerX = 200;
    const centerY = 200;
    const radius = 175;
    const successChance = chance / 100;
    let angle = 0;
    let speed = 0.18;
    let spinning = true;
    let finished = false;
    let animationId = null;

    const skipBtn = document.createElement('button');
    skipBtn.textContent = '⏭ ПРОПУСТИТЬ';
    Object.assign(skipBtn.style, {
        position: 'fixed',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 30px',
        border: 'none',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        zIndex: '1001',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.06)'
    });
    document.body.appendChild(skipBtn);

    function drawWheel(angle) {
        ctx.clearRect(0, 0, 400, 400);

        const gradGreen = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradGreen.addColorStop(0, '#66bb6a');
        gradGreen.addColorStop(0.5, '#4caf50');
        gradGreen.addColorStop(1, '#2e7d32');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2 * successChance);
        ctx.closePath();
        ctx.fillStyle = gradGreen;
        ctx.shadowColor = 'rgba(76, 175, 80, 0.4)';
        ctx.shadowBlur = 30;
        ctx.fill();

        const gradRed = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradRed.addColorStop(0, '#ef5350');
        gradRed.addColorStop(0.5, '#f44336');
        gradRed.addColorStop(1, '#c62828');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, Math.PI * 2 * successChance, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = gradRed;
        ctx.shadowColor = 'rgba(244, 67, 54, 0.4)';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const midAngle = Math.PI * successChance;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText('УСПЕХ', centerX + radius * 0.6 * Math.cos(midAngle / 2), centerY + radius * 0.6 * Math.sin(midAngle / 2));
        
        const midAngle2 = Math.PI * (1 + successChance);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText('ПРОВАЛ', centerX + radius * 0.6 * Math.cos(midAngle2), centerY + radius * 0.6 * Math.sin(midAngle2));
        ctx.shadowBlur = 0;

        for (let i = 0; i < 20; i++) {
            const a = (i / 20) * Math.PI * 2;
            const len = i % 5 === 0 ? 12 : 6;
            ctx.beginPath();
            ctx.moveTo(centerX + (radius - 4) * Math.cos(a), centerY + (radius - 4) * Math.sin(a));
            ctx.lineTo(centerX + (radius - 4 - len) * Math.cos(a), centerY + (radius - 4 - len) * Math.sin(a));
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -radius + 10);
        ctx.lineTo(-16, -radius + 44);
        ctx.lineTo(16, -radius + 44);
        ctx.closePath();
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        const gradCenter = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 24);
        gradCenter.addColorStop(0, '#ff6b6b');
        gradCenter.addColorStop(1, '#ee5a24');
        ctx.beginPath();
        ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
        ctx.fillStyle = gradCenter;
        ctx.shadowColor = 'rgba(255,107,107,0.5)';
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', centerX, centerY + 1);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.shadowColor = 'rgba(255,107,107,0.15)';
        ctx.shadowBlur = 50;
        ctx.strokeStyle = 'rgba(255,107,107,0.05)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    function finishUpgrade() {
        if (finished) return;
        finished = true;
        spinning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        skipBtn.remove();

        const normalizedAngle = angle % (Math.PI * 2);
        const isWin = normalizedAngle < Math.PI * 2 * successChance;

        apiRequest('/upgrade_execute', { bet, target }).then(data => {
            if (data.error) {
                document.getElementById('gu_result').textContent = '❌ ' + data.error;
                document.getElementById('gu_result').style.color = '#f44336';
                return;
            }
            document.getElementById('gu_balance').textContent = data.new_balance + ' ⭐';
            showGameUpgradeResult(data.result, data.message, data.new_balance);
        });

        drawWheel(angle);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isWin ? '#4caf50' : '#f44336';
        ctx.lineWidth = 5;
        ctx.shadowColor = isWin ? 'rgba(76,175,80,0.7)' : 'rgba(244,67,54,0.7)';
        ctx.shadowBlur = 40;
        ctx.stroke();
        ctx.restore();
    }

    skipBtn.onclick = finishUpgrade;

    function spin() {
        if (!spinning || finished) return;
        
        speed *= 0.99;
        
        if (speed < 0.0003) {
            finishUpgrade();
            return;
        }

        angle += speed;
        drawWheel(angle);
        animationId = requestAnimationFrame(spin);
    }

    drawWheel(0);
    setTimeout(() => {
        spinning = true;
        speed = 0.18;
        spin();
    }, 400);
}

function showGameUpgradeResult(result, message, newBalance) {
    const overlay = document.createElement('div');
    overlay.id = 'gameUpgradeResultOverlay';
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
    
    const icon = result === 'win' ? '🎉' : '💥';
    const title = result === 'win' ? 'УСПЕХ!' : 'ПРОВАЛ!';
    const color = result === 'win' ? '#4caf50' : '#f44336';
    
    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${icon}</div>
        <div style="font-size:32px; font-weight:800; color:${color}; margin-bottom:10px;">${title}</div>
        <div style="font-size:18px; color:#aaa; text-align:center; margin-bottom:6px;">${message}</div>
        <div style="font-size:16px; color:#888; margin-bottom:20px;">💰 Баланс: ${newBalance} ⭐</div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="document.getElementById('gameUpgradeResultOverlay').remove(); resetGameUpgrade();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #ff6b6b, #ee5a24); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔄 ЕЩЁ РАЗ</button>
            <button onclick="document.getElementById('gameUpgradeResultOverlay').remove(); document.getElementById('upgradeGameContainer').style.display='none'; document.getElementById('gamesMenu').style.display='flex';" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function resetGameUpgrade() {
    document.getElementById('gu_input_section').style.display = 'block';
    document.getElementById('gu_animation_section').style.display = 'none';
    document.getElementById('gu_result').textContent = '';
    loadGameUpgradeBalance();
    updateGameUpgradeChance();
}

// ===== МИНИ-ИГРЫ (ЗАПУСК) =====
function showCrashGame() {
    const menu = document.getElementById('gamesMenu');
    const container = document.getElementById('crashGameContainer');
    
    if (!menu || !container) {
        showCustomAlert('❌ Ошибка загрузки игры');
        return;
    }
    
    menu.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `
        <div class="section-title" style="font-size:18px;">💥 КРАШ</div>
        <div class="crash-stats" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; background:rgba(255,255,255,0.04); border-radius:16px; padding:14px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);">
            <span style="font-size:14px; color:#888;">🎮 Игр: <b id="gc_games" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">🏆 Побед: <b id="gc_wins" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">💀 Поражений: <b id="gc_losses" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">🔥 Лучший: <b id="gc_best" style="color:#fff;">x1.0</b></span>
        </div>
        
        <div style="text-align:center; padding:16px 0; background:rgba(255,255,255,0.04); border-radius:24px; margin-bottom:16px;">
            <div id="gc_chart" style="position:relative; width:100%; height:130px; background:rgba(0,0,0,0.3); border-radius:12px; overflow:hidden; margin-bottom:8px; border:1px solid rgba(255,255,255,0.04);">
                <canvas id="gc_canvas" width="400" height="130" style="width:100%; height:130px; display:block;"></canvas>
                <div id="gc_multiplier" style="position:absolute; top:6px; right:12px; font-size:32px; font-weight:900; color:#ff6b6b; text-shadow:0 0 30px rgba(255,107,107,0.5); transition:color 0.3s ease; line-height:1;">x1.00</div>
                <div style="position:absolute; bottom:0; left:0; right:0; height:3px; background:rgba(255,255,255,0.08);">
                    <div id="gc_progress" style="height:100%; width:0%; background:linear-gradient(90deg, #4caf50, #ffd700, #f44336); border-radius:0 3px 3px 0; transition:width 0.1s ease;"></div>
                </div>
            </div>
            <div id="gc_status" style="font-size:15px; color:#888; margin-top:2px;">🚀 Нажми «ИГРАТЬ», чтобы сделать ставку!</div>
            <div id="gc_timer" style="font-size:13px; color:#666; margin-top:2px;">🚀 МОЖНО СТАВИТЬ!</div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; background:rgba(255,255,255,0.05); border-radius:16px; padding:14px; margin-bottom:16px;">
            <div style="color:#aaa; font-size:14px;">💰 Ставка: <b id="gc_bet_display" style="color:#fff;">0</b>⭐</div>
            <div style="color:#aaa; font-size:14px;">🔥 Множитель: <b id="gc_multiplier_display" style="color:#ffd700;">x1.00</b></div>
            <div style="color:#aaa; font-size:14px;">🏆 Выигрыш: <b id="gc_potential" style="color:#4caf50;">0</b>⭐</div>
        </div>
        
        <div style="margin-bottom:12px;">
            <div style="color:#aaa; font-size:14px; margin-bottom:6px;">💰 Ставка (1-1000⭐):</div>
            <input type="number" id="gc_bet_input" min="1" max="1000" value="10" style="width:100%; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
        </div>
        
        <div style="display:flex; gap:12px;">
            <button id="gc_start_btn" style="flex:1; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; font-weight:800; font-size:18px; cursor:pointer;">🎮 ИГРАТЬ</button>
            <button id="gc_cashout_btn" style="display:none; flex:1; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#ffd700,#f9a825); color:#000; font-weight:800; font-size:18px; cursor:pointer;">💰 ЗАБРАТЬ</button>
        </div>
    `;
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад к играм';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        container.style.display = 'none';
        menu.style.display = 'flex';
        stopGameCrash();
    };
    container.appendChild(backBtn);
    
    setTimeout(() => {
        initGameCrash();
    }, 50);
}

function initGameCrash() {
    const d = {
        canvas: document.getElementById('gc_canvas'),
        chart: document.getElementById('gc_chart'),
        multiplier: document.getElementById('gc_multiplier'),
        status: document.getElementById('gc_status'),
        timer: document.getElementById('gc_timer'),
        betDisplay: document.getElementById('gc_bet_display'),
        multiplierDisplay: document.getElementById('gc_multiplier_display'),
        potential: document.getElementById('gc_potential'),
        startBtn: document.getElementById('gc_start_btn'),
        cashoutBtn: document.getElementById('gc_cashout_btn'),
        betInput: document.getElementById('gc_bet_input'),
        progress: document.getElementById('gc_progress'),
        games: document.getElementById('gc_games'),
        wins: document.getElementById('gc_wins'),
        losses: document.getElementById('gc_losses'),
        best: document.getElementById('gc_best')
    };
    
    // Сохраняем в crashState
    crashState.canvas = d.canvas;
    if (d.canvas) {
        crashState.ctx = d.canvas.getContext('2d');
        crashState.chartData = [];
        drawCrashChart();
    }
    
    loadGameCrashStats();
    
    if (d.startBtn) {
        d.startBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!crashState.active && !crashState.running) {
                placeCrashBet();
            }
        };
        d.startBtn.style.animation = 'none';
        d.startBtn.style.transition = 'none';
    }
    
    if (d.cashoutBtn) {
        d.cashoutBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            cashoutCrash();
        };
    }
    
    if (d.betInput) {
        d.betInput.addEventListener('change', function() {
            let val = parseInt(this.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 1000) val = 1000;
            this.value = val;
        });
    }
    
    startCrashPolling();
}

function loadGameCrashStats() {
    apiRequest('/get_crash_stats').then(data => {
        const d = {
            games: document.getElementById('gc_games'),
            wins: document.getElementById('gc_wins'),
            losses: document.getElementById('gc_losses'),
            best: document.getElementById('gc_best')
        };
        if (d.games) d.games.textContent = data.games || 0;
        if (d.wins) d.wins.textContent = data.wins || 0;
        if (d.losses) d.losses.textContent = data.losses || 0;
        if (d.best) d.best.textContent = 'x' + (data.best_multiplier || 1.0);
    });
}

function stopGameCrash() {
    if (crashState.pollingInterval) {
        clearInterval(crashState.pollingInterval);
        crashState.pollingInterval = null;
    }
    if (crashState.interval) {
        clearInterval(crashState.interval);
        crashState.interval = null;
    }
    crashState.running = false;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
loadBalance();
tg.ready();
