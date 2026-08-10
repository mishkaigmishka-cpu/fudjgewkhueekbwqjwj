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
    _resultShown: false,
    gameContainers: {}
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
        if (id === 'crashGameContent' || id === 'minesGameContent' || id === 'upgradeGameContent') {
            showGames();
        } else if (id === 'levelsScreen' || id === 'questsScreen' || id === 'profileScreen') {
            showMain();
        } else if (id === 'gamesScreen') {
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
        const hasStar = levelStars[level.id] || false;
        const wins = levelWins[level.caseType] || 0;
        const isCompleted = hasStar;
        const isUnlocked = prevCompleted || isCompleted;
        const progress = Math.min(opened, level.requiredCases);
        const progressPercent = Math.min((opened / level.requiredCases) * 100, 100);
        
        let statusText, statusClass, playDisabled = true;
        if (isCompleted) {
            statusText = '✅ Пройден';
            statusClass = 'completed';
            playDisabled = false;
        } else if (isUnlocked && opened >= level.requiredCases) {
            statusText = '⭐ Доступен';
            statusClass = 'unlocked';
            playDisabled = false;
        } else if (isUnlocked) {
            statusText = `📦 ${opened}/${level.requiredCases}`;
            statusClass = 'unlocked';
            playDisabled = true;
        } else {
            statusText = '🔒 Заблокирован';
            statusClass = 'locked';
            playDisabled = true;
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
                        <div style="color:#ffd700; margin-top:4px;">⭐ ${level.starName} получена!</div>
                    `}
                    ${wins > 0 && !isCompleted ? `<div style="font-size:11px; color:#666;">Побед: ${wins}</div>` : ''}
                </div>
            </div>
            <div class="level-status ${statusClass}">${statusText}</div>
            <button class="level-play-btn" ${playDisabled ? 'disabled' : ''} onclick="startLevel('${level.id}')">
                ${isCompleted ? '🔄 ПРОЙТИ' : '▶️ ИГРАТЬ'}
            </button>
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
    
    const case_type = level.caseType;
    const price = level.price;
    
    apiRequest('/check_balance_simple', { amount: price }).then(data => {
        if (data.error || !data.has_enough) {
            showCustomAlert('❌ Недостаточно звёзд! Нужно ' + price + '⭐');
            return;
        }
        showBotBattlePreview(case_type);
    });
}

// ===== БИТВА С БОТОМ (УРОВНИ) =====
function showBotBattlePreview(case_type) {
    const style = getStyle(case_type);
    const prizes = getPrizes(case_type);
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
        <div style="color:#aaa; font-size:14px; margin-bottom:16px;">📦 Кейс: ${case_type.toUpperCase()} (${price}⭐)</div>
        <button onclick="startBotBattle('${case_type}')" style="padding:14px 40px; border:none; border-radius:14px; background:linear-gradient(135deg,#4caf50,#2e7d32); color:#fff; font-size:18px; font-weight:700; cursor:pointer;">
            ⚔️ НАЧАТЬ БИТВУ
        </button>
        <button onclick="this.closest('#botBattlePreviewOverlay').remove()" style="padding:12px 30px; border:none; border-radius:12px; background:rgba(255,255,255,0.06); color:#888; font-size:14px; font-weight:600; cursor:pointer; margin-top:10px;">
            🔙 НАЗАД
        </button>
    `;
    
    document.body.appendChild(overlay);
}

function startBotBattle(case_type) {
    const overlay = document.getElementById('botBattlePreviewOverlay');
    if (overlay) overlay.remove();
    
    apiRequest('/start_bot_battle', { case_type }).then(data => {
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
        <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center;">
            <div style="color:#aaa; font-size:14px;">${data.result_text}</div>
            ${data.commission ? `<div style="color:#888; font-size:12px;">💸 Комиссия: ${data.commission}⭐</div>` : ''}
            ${data.result === 'win' ? `<div style="color:#4caf50; font-size:16px; font-weight:700;">🏆 Ты получил: ${data.winnings}⭐</div>` : ''}
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeAllOverlays(); showLevels();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b388ff, #7c4dff); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
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
    document.getElementById('questTab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    
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

// ===== КРАШ (С ИСПРАВЛЕНИЯМИ) =====
let crashChartData = [];
let crashCanvas = null;
let crashCtx = null;
let crashDOM = {};

function initCrashChart() {
    crashCanvas = document.getElementById('crashCanvas') || document.getElementById('game_crashCanvas');
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
    crashChartData.push(multiplier);
    if (crashChartData.length > 200) {
        crashChartData.shift();
    }
    drawCrashChart();
}

function resetCrashChart() {
    crashChartData = [];
    drawCrashChart();
}

function getCrashDOM(prefix = '') {
    return {
        multiplier: document.getElementById(prefix + 'crashMultiplier'),
        status: document.getElementById(prefix + 'crashStatus'),
        timer: document.getElementById(prefix + 'crashTimer'),
        betDisplay: document.getElementById(prefix + 'crashBetDisplay'),
        multiplierDisplay: document.getElementById(prefix + 'crashMultiplierDisplay'),
        startBtn: document.getElementById(prefix + 'crashStartBtn'),
        cashoutBtn: document.getElementById(prefix + 'crashCashoutBtn'),
        betInput: document.getElementById(prefix + 'crashBetInput'),
        potentialWin: document.getElementById(prefix + 'crashPotentialWin')
    };
}

function resetCrashUI() {
    const d = getCrashDOM('');
    if (d.startBtn) {
        d.startBtn.style.animation = 'none';
        d.startBtn.style.transition = 'none';
        d.startBtn.style.pointerEvents = 'auto';
        d.startBtn.style.zIndex = '10';
        d.startBtn.style.position = 'relative';
        d.startBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            placeCrashBet();
        };
        d.startBtn.textContent = '🎮 ИГРАТЬ';
        d.startBtn.disabled = false;
        d.startBtn.style.display = 'inline-block';
    }
    if (d.multiplier) {
        d.multiplier.textContent = 'x1.00';
        d.multiplier.className = '';
        d.multiplier.style.transform = 'scale(1)';
        d.multiplier.style.color = '#b388ff';
    }
    if (d.status) d.status.textContent = '🚀 Нажми «ИГРАТЬ», чтобы сделать ставку!';
    if (d.timer) {
        d.timer.textContent = '🚀 МОЖНО СТАВИТЬ!';
        d.timer.style.fontSize = '16px';
        d.timer.style.fontWeight = '600';
    }
    if (d.betDisplay) d.betDisplay.textContent = '0';
    if (d.multiplierDisplay) d.multiplierDisplay.textContent = 'x1.00';
    if (d.cashoutBtn) {
        d.cashoutBtn.style.display = 'none';
        d.cashoutBtn.disabled = false;
        d.cashoutBtn.textContent = '💰 ЗАБРАТЬ';
    }
    if (d.betInput) {
        d.betInput.value = 10;
    }
    
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) backBtn.style.display = 'block';
    
    const chart = document.getElementById('crashChart') || document.getElementById('game_crashChart');
    if (chart) {
        chart.style.boxShadow = 'none';
        chart.style.transition = 'none';
    }
    
    window._crashAnimationDone = false;
    state.crashRunning = false;
    state.crashBetPlaced = false;
    state.crashWaitingForStart = false;
    state.crashGameStarted = false;
    state.crashGameId = null;
    state._resultShown = false;
    if (state.crashInterval) {
        clearInterval(state.crashInterval);
        state.crashInterval = null;
    }
    resetCrashChart();
}

function getCrashBet() {
    const input = document.getElementById('crashBetInput') || document.getElementById('game_crashBetInput');
    if (!input) return 10;
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 1000) val = 1000;
    input.value = val;
    return val;
}

function startCrashPolling() {
    if (state.crashPollingInterval) clearInterval(state.crashPollingInterval);
    
    state.crashPollingInterval = setInterval(() => {
        apiRequest('/crash_status', {}).then(status => {
            if (status.error) return;
            
            const d = getCrashDOM('');
            const multiplier = status.multiplier || 1.00;
            const crashPoint = status.crash_multiplier_at_crash || 1.00;
            const timeToNew = status.time_to_new_round || 0;
            
            // === ИГРА АКТИВНА ===
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
                
                if (state.crashWaitingForStart) {
                    state.crashWaitingForStart = false;
                    state.crashGameStarted = true;
                }
                state.crashBetPlaced = false;
            }
            
            // === КРАШ ===
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
                
                if (!window._crashAnimationDone) {
                    window._crashAnimationDone = true;
                    
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
                                    placeCrashBet();
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
                                    placeCrashBet();
                                };
                                d.startBtn.disabled = false;
                            }
                            if (d.status) d.status.textContent = '🚀 Нажми «ИГРАТЬ», чтобы сделать ставку!';
                        }
                        
                        state.crashBetPlaced = false;
                        state.crashWaitingForStart = false;
                        state.crashGameStarted = false;
                        state.crashRunning = false;
                        window._crashAnimationDone = false;
                        
                        const backBtn2 = document.querySelector('.btn-back');
                        if (backBtn2) backBtn2.style.display = 'block';
                        
                        if (!state._resultShown) {
                            state._resultShown = true;
                            if (state.crashGameId) {
                                showCrashResult('lose', 0, crashPoint);
                            }
                            loadBalance();
                        }
                    }, 1500);
                }
            }
            
            // === ОЖИДАНИЕ ===
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
                        placeCrashBet();
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
                
                state.crashBetPlaced = false;
                state.crashWaitingForStart = false;
                state.crashGameStarted = false;
                state.crashRunning = false;
                state._resultShown = false;
            }
        });
    }, 100);
}

function placeCrashBet() {
    const d = getCrashDOM('');
    if (!d.startBtn || d.startBtn.disabled) {
        showCustomAlert('⏳ Подождите окончания отсчёта!');
        return;
    }
    
    if (state.crashRunning || state.crashGameStarted) {
        showCustomAlert('⏳ Игра уже идёт!');
        return;
    }
    
    if (state.crashBetPlaced) {
        showCustomAlert('⏳ Ставка уже сделана!');
        return;
    }
    
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
            state.crashBetPlaced = true;
            state.crashWaitingForStart = true;
            state.crashGameStarted = false;
            state.crashRunning = false;
            state._resultShown = false;
            
            if (d.betDisplay) d.betDisplay.textContent = bet;
            if (d.startBtn) {
                d.startBtn.disabled = true;
                d.startBtn.textContent = '⏳ ОЖИДАНИЕ СТАРТА...';
                d.startBtn.onclick = null;
            }
            if (d.status) d.status.textContent = '⏳ Ожидание начала игры...';
            
            if (state.crashInterval) clearInterval(state.crashInterval);
            state.crashInterval = setInterval(() => {
                apiRequest('/crash_status', {}).then(status => {
                    if (status.error) {
                        clearInterval(state.crashInterval);
                        state.crashRunning = false;
                        if (d.status) d.status.textContent = '❌ ' + status.error;
                        return;
                    }
                    
                    if (status.round_phase === 'active' && state.crashWaitingForStart) {
                        state.crashWaitingForStart = false;
                        state.crashRunning = true;
                        state.crashGameStarted = true;
                        state._crashStartTime = Date.now();
                        window._crashAnimationDone = false;
                        
                        resetCrashChart();
                        
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
                        if (d.status) d.status.textContent = '';
                        if (d.multiplier) d.multiplier.className = '';
                        
                        const backBtn = document.querySelector('.btn-back');
                        if (backBtn) backBtn.style.display = 'none';
                        
                        if (d.timer) {
                            d.timer.textContent = '';
                            d.timer.style.fontSize = '0px';
                        }
                        
                        clearInterval(state.crashInterval);
                        state.crashInterval = setInterval(() => {
                            apiRequest('/crash_status', {}).then(status2 => {
                                if (status2.error) {
                                    clearInterval(state.crashInterval);
                                    state.crashRunning = false;
                                    if (d.status) d.status.textContent = '❌ ' + status2.error;
                                    return;
                                }
                                
                                updateCrashChart(status2.multiplier);
                                if (d.multiplierDisplay) d.multiplierDisplay.textContent = `x${status2.multiplier}`;
                                
                                if (status2.crashed) {
                                    clearInterval(state.crashInterval);
                                    state.crashRunning = false;
                                    state.crashGameStarted = false;
                                    state._resultShown = false;
                                    
                                    if (d.multiplier) {
                                        d.multiplier.className = 'crashed';
                                        const crashPoint = status2.crash_multiplier_at_crash || status2.multiplier;
                                        d.multiplier.textContent = `x${crashPoint.toFixed(2)}`;
                                        d.multiplier.style.color = '#f44336';
                                    }
                                    if (d.status) d.status.textContent = `💥 КРАШ! x${crashPoint.toFixed(2)}`;
                                    if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                                    if (d.startBtn) d.startBtn.style.display = 'none';
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
    const d = getCrashDOM('');
    if (!state.crashRunning || !state.crashGameId) {
        showCustomAlert('❌ Нет активной игры!');
        return;
    }
    
    if (d.cashoutBtn) {
        d.cashoutBtn.disabled = true;
        d.cashoutBtn.textContent = '⏳ ОБРАБОТКА...';
    }
    
    apiRequest('/cashout_crash', { game_id: state.crashGameId }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            if (d.cashoutBtn) {
                d.cashoutBtn.disabled = false;
                d.cashoutBtn.textContent = '💰 ЗАБРАТЬ';
            }
            return;
        }
        
        state.crashRunning = false;
        state.crashBetPlaced = false;
        state.crashWaitingForStart = false;
        state.crashGameStarted = false;
        state._resultShown = true;
        
        if (state.crashInterval) {
            clearInterval(state.crashInterval);
            state.crashInterval = null;
        }
        
        if (d.multiplier) {
            d.multiplier.className = 'win';
        }
        if (d.status) d.status.textContent = `💰 Выигрыш: ${data.winnings}⭐ (x${data.multiplier})`;
        if (d.cashoutBtn) {
            d.cashoutBtn.style.display = 'none';
            d.cashoutBtn.disabled = false;
            d.cashoutBtn.textContent = '💰 ЗАБРАТЬ';
        }
        if (d.startBtn) {
            d.startBtn.style.display = 'inline-block';
            d.startBtn.disabled = true;
            d.startBtn.textContent = '⏳ ОЖИДАНИЕ...';
            d.startBtn.onclick = null;
        }
        
        const backBtn = document.querySelector('.btn-back');
        if (backBtn) backBtn.style.display = 'block';
        
        showCrashResult('win', data.winnings, data.multiplier);
        loadBalance();
    }).catch(() => {
        if (d.cashoutBtn) {
            d.cashoutBtn.disabled = false;
            d.cashoutBtn.textContent = '💰 ЗАБРАТЬ';
        }
        showCustomAlert('❌ Ошибка при выводе');
    });
}

function showCrashResult(result, winnings, multiplier) {
    if (document.getElementById('crashResultOverlay')) {
        return;
    }
    
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
                <button onclick="closeAllOverlays(); resetCrashUI(); showGames();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #4caf50, #2e7d32); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔄 ИГРАТЬ СНОВА
                </button>
                <button onclick="closeAllOverlays(); showGames();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
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
                <button onclick="closeAllOverlays(); resetCrashUI(); showGames();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #ff6b6b, #ee5a24); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔄 ИГРАТЬ СНОВА
                </button>
                <button onclick="closeAllOverlays(); showGames();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                    🔙 НАЗАД
                </button>
            </div>
        `;
    }
    
    document.body.appendChild(overlay);
}

// ===== МИНИ-ИГРЫ =====
function showCrashGame() {
    document.getElementById('gamesMenu').style.display = 'none';
    const container = document.getElementById('crashGameContainer');
    container.style.display = 'block';
    container.innerHTML = '';
    
    const crashContent = document.querySelector('#crashScreen').cloneNode(true);
    crashContent.id = 'crashGameContent';
    
    // Меняем ID всех элементов внутри
    const elements = crashContent.querySelectorAll('[id]');
    elements.forEach(el => {
        if (el.id) {
            el.id = 'game_' + el.id;
        }
    });
    
    container.appendChild(crashContent);
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад к играм';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        container.style.display = 'none';
        document.getElementById('gamesMenu').style.display = 'flex';
        if (state.crashPollingInterval) {
            clearInterval(state.crashPollingInterval);
            state.crashPollingInterval = null;
        }
        if (state.crashInterval) {
            clearInterval(state.crashInterval);
            state.crashInterval = null;
        }
    };
    container.appendChild(backBtn);
    
    setTimeout(() => {
        initCrashChart();
        resetCrashUI();
        startCrashPolling();
    }, 100);
}

function showMinesGame() {
    document.getElementById('gamesMenu').style.display = 'none';
    const container = document.getElementById('minesGameContainer');
    container.style.display = 'block';
    container.innerHTML = '';
    
    const minesContent = document.querySelector('#minesScreen').cloneNode(true);
    minesContent.id = 'minesGameContent';
    container.appendChild(minesContent);
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад к играм';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        container.style.display = 'none';
        document.getElementById('gamesMenu').style.display = 'flex';
    };
    container.appendChild(backBtn);
    
    setTimeout(() => {
        loadMinesStats();
    }, 100);
}

function showUpgradeGame() {
    document.getElementById('gamesMenu').style.display = 'none';
    const container = document.getElementById('upgradeGameContainer');
    container.style.display = 'block';
    container.innerHTML = '';
    
    const upgradeContent = document.querySelector('#upgradeScreen').cloneNode(true);
    upgradeContent.id = 'upgradeGameContent';
    container.appendChild(upgradeContent);
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад к играм';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        container.style.display = 'none';
        document.getElementById('gamesMenu').style.display = 'flex';
    };
    container.appendChild(backBtn);
    
    setTimeout(() => {
        loadUpgradeBalance();
        updateUpgradeChance();
    }, 100);
}

// ===== МИНЁР (БЫСТРАЯ ВЕРСИЯ) =====
let minesGameData = null;

function loadMinesStats() {
    apiRequest('/get_mines_stats').then(data => {
        document.getElementById('minesGames').textContent = data.games || 0;
        document.getElementById('minesWins').textContent = data.wins || 0;
        document.getElementById('minesLosses').textContent = data.losses || 0;
        document.getElementById('minesBestMultiplier').textContent = 'x' + (data.best_multiplier || 1.0);
    });
}

// ===== АПГРЕЙД (БЫСТРАЯ ВЕРСИЯ) =====
function loadUpgradeBalance() {
    apiRequest('/get_balance').then(data => {
        if (data.balance !== undefined) {
            document.getElementById('upgradeBalance').textContent = data.balance + ' ⭐';
        }
    });
}

function updateUpgradeChance() {
    const bet = parseInt(document.getElementById('upgradeBet').value) || 1;
    const target = parseInt(document.getElementById('upgradeTarget').value) || bet + 1;
    if (target <= bet) {
        document.getElementById('upgradeChance').textContent = '0%';
        return;
    }
    const raw = (bet / target) * 100;
    const chance = Math.min(Math.max(raw, 1), 70);
    document.getElementById('upgradeChance').textContent = chance.toFixed(2) + '%';
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
loadBalance();
tg.ready();
