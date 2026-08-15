// ===============================
// RANDEVU — FINAL SCRIPT v16.0
// Виртуальная валюта, без платежей
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
        'free': { bg:'rgba(0,0,0,0.95)', titleColor:'#2ecc71', itemColor:'#6bcbff', highlightColor:'#ffd700', glowColor:'rgba(46,204,113,0.3)', shadowColor:'rgba(46,204,113,0.5)', icon:'🎁', bgGradient:'radial-gradient(circle at 50% 50%, rgba(46,204,113,0.08), transparent 70%)' },
        'mud': { bg:'rgba(0,0,0,0.95)', titleColor:'#8e44ad', itemColor:'#c39bd3', highlightColor:'#ff6b6b', glowColor:'rgba(142,68,173,0.3)', shadowColor:'rgba(142,68,173,0.5)', icon:'🟫', bgGradient:'radial-gradient(circle at 50% 50%, rgba(142,68,173,0.08), transparent 70%)' },
        'wood': { bg:'rgba(0,0,0,0.95)', titleColor:'#d35400', itemColor:'#f39c12', highlightColor:'#ffd700', glowColor:'rgba(211,84,0,0.3)', shadowColor:'rgba(211,84,0,0.5)', icon:'🌳', bgGradient:'radial-gradient(circle at 50% 50%, rgba(211,84,0,0.08), transparent 70%)' },
        'stone': { bg:'rgba(0,0,0,0.95)', titleColor:'#7f8c8d', itemColor:'#bdc3c7', highlightColor:'#ffd700', glowColor:'rgba(127,140,141,0.3)', shadowColor:'rgba(127,140,141,0.5)', icon:'🗿', bgGradient:'radial-gradient(circle at 50% 50%, rgba(127,140,141,0.08), transparent 70%)' },
        'bronze': { bg:'rgba(0,0,0,0.95)', titleColor:'#cd7f32', itemColor:'#f0c27f', highlightColor:'#ffd700', glowColor:'rgba(205,127,50,0.3)', shadowColor:'rgba(205,127,50,0.5)', icon:'🥉', bgGradient:'radial-gradient(circle at 50% 50%, rgba(205,127,50,0.08), transparent 70%)' },
        'silver': { bg:'rgba(0,0,0,0.95)', titleColor:'#bdc3c7', itemColor:'#ecf0f1', highlightColor:'#ffd700', glowColor:'rgba(189,195,199,0.3)', shadowColor:'rgba(189,195,199,0.5)', icon:'🔘', bgGradient:'radial-gradient(circle at 50% 50%, rgba(189,195,199,0.08), transparent 70%)' },
        'gold': { bg:'rgba(0,0,0,0.95)', titleColor:'#f1c40f', itemColor:'#f9e79f', highlightColor:'#ffd700', glowColor:'rgba(241,196,15,0.4)', shadowColor:'rgba(241,196,15,0.6)', icon:'👑', bgGradient:'radial-gradient(circle at 50% 50%, rgba(241,196,15,0.1), transparent 70%)' },
        'diamond': { bg:'rgba(0,0,0,0.95)', titleColor:'#3498db', itemColor:'#85c1e9', highlightColor:'#00d4ff', glowColor:'rgba(52,152,219,0.3)', shadowColor:'rgba(52,152,219,0.5)', icon:'💎', bgGradient:'radial-gradient(circle at 50% 50%, rgba(52,152,219,0.08), transparent 70%)' },
        'netherite': { bg:'rgba(0,0,0,0.95)', titleColor:'#e74c3c', itemColor:'#f1948a', highlightColor:'#ff6b35', glowColor:'rgba(231,76,60,0.3)', shadowColor:'rgba(231,76,60,0.5)', icon:'🔥', bgGradient:'radial-gradient(circle at 50% 50%, rgba(231,76,60,0.08), transparent 70%)' },
        'obsidian': { bg:'rgba(0,0,0,0.95)', titleColor:'#8b8b9e', itemColor:'#c8c8d4', highlightColor:'#ffd700', glowColor:'rgba(139,139,158,0.4)', shadowColor:'rgba(139,139,158,0.6)', icon:'🔮', bgGradient:'radial-gradient(circle at 50% 50%, rgba(139,139,158,0.08), transparent 70%)' },
        'bedrock': { bg:'rgba(0,0,0,0.95)', titleColor:'#8b8b9e', itemColor:'#c8c8d4', highlightColor:'#ff6b6b', glowColor:'rgba(139,139,158,0.4)', shadowColor:'rgba(139,139,158,0.6)', icon:'⛏️', bgGradient:'radial-gradient(circle at 50% 50%, rgba(20,20,30,0.15), transparent 70%)' }
    }
};

// ===== АРТ-ИКОНКИ (fallback на эмодзи, если ассет не загрузился) =====
function icon(name, size = 20, cls = '', fallback = '⭐') {
    return `<img src="assets/${name}.png" class="ic ${cls}" style="width:${size}px;height:${size}px;" alt="${fallback}" onerror="this.outerHTML='${fallback}'">`;
}
const starIcon = (size = 16) => icon('star', size, 'ic-star', '⭐');

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const getPrizes = (type) => CONFIG.CASE_PRIZES[type] || [1,10,100];
const getStyle = (type) => CONFIG.CASE_STYLES[type] || CONFIG.CASE_STYLES['free'];
const getPrice = (type) => CONFIG.CASE_PRICES[type] || 0;

// ===== РУССКИЕ НАЗВАНИЯ КЕЙСОВ =====
const CASE_NAMES = {
    free: 'Бесплатный', mud: 'Грязь', wood: 'Дерево', stone: 'Камень',
    bronze: 'Бронза', silver: 'Серебро', gold: 'Золото', diamond: 'Алмаз',
    netherite: 'Незерит', obsidian: 'Обсидиан', bedrock: 'Бедрок'
};
const getCaseName = (type) => CASE_NAMES[type] || String(type).toUpperCase();

// ===== РЕДКОСТИ НАГРАД (для ВСЕХ кейсов) =====
// Группы значений зеркалят CASE_RANGES на сервере (только визуал, шансы решает сервер)
const RARITY_META = {
    common:    { cls: 'rarity-common',  label: 'COMMON',   color: '#9aa3ad' },
    rare:      { cls: 'rarity-rare',    label: 'RARE',     color: '#6bcbff' },
    epic:      { cls: 'rarity-epic',    label: 'EPIC',     color: '#b388ff' },
    legendary: { cls: 'rarity-legend',  label: 'LEGEND',   color: '#ffd700' },
    jackpot:   { cls: 'rarity-jackpot', label: 'JACKPOT',  color: '#ffffff' }
};

const CASE_RARITY = {
    free:      { common: [1, 2], rare: [3, 4], epic: [5, 6, 7, 8, 9, 10], legendary: [100], jackpot: [1000],
                 chances: { common: 0.599, rare: 0.299, epic: 0.0999, legendary: 0.0001, jackpot: 0.00000001 } },
    mud:       { common: [1, 2, 3, 4, 5, 6, 7], rare: [10, 12, 13], epic: [16, 18, 20, 22, 24, 27], legendary: [50], jackpot: [500],
                 chances: { common: 0.70, rare: 0.25, epic: 0.0499, legendary: 0.001, jackpot: 0.000001 } },
    wood:      { common: [2, 4, 5, 6, 7, 8, 9, 10], rare: [12, 13, 15], epic: [20, 50], legendary: [100, 500], jackpot: [1000],
                 chances: { common: 0.75, rare: 0.19, epic: 0.05, legendary: 0.00001, jackpot: 0.000001 } },
    stone:     { common: [11, 13, 15, 16, 17, 18, 19], rare: [21, 23, 24, 25], epic: [30, 50, 100, 250], legendary: [500, 1000], jackpot: [2500],
                 chances: { common: 0.80, rare: 0.15, epic: 0.05, legendary: 0.00001, jackpot: 0.000001 } },
    bronze:    { common: [20, 25, 30], rare: [35, 40, 45, 50], epic: [55, 60, 65, 75, 100], legendary: [222, 333, 444, 555, 1000, 1500, 2000], jackpot: [5000],
                 chances: { common: 0.89, rare: 0.10, epic: 0.009999, legendary: 0.000001, jackpot: 0.0000001 } },
    silver:    { common: [40, 50, 60, 70], rare: [70, 80, 90, 100], epic: [100, 110, 120, 130, 140, 150], legendary: [200, 250, 333, 444, 555, 666, 777, 888, 999, 1488, 2011, 5000], jackpot: [10000],
                 chances: { common: 0.25, rare: 0.6745, epic: 0.0749, legendary: 0.0005, jackpot: 0.00000001 } },
    gold:      { common: [75, 100], rare: [150, 169, 190, 220, 251], epic: [300, 400, 500, 777], legendary: [999, 1000, 2000, 5000, 10000, 12500], jackpot: [25000],
                 chances: { common: 0.2499, rare: 0.6749, epic: 0.07, legendary: 0.005, jackpot: 0.00000001 } },
    diamond:   { common: [250, 300, 333], rare: [350, 444, 505], epic: [1000, 1488, 2222], legendary: [2500, 5000, 10000, 12500, 25000], jackpot: [50000],
                 chances: { common: 0.2499, rare: 0.6749, epic: 0.07, legendary: 0.005, jackpot: 0.00000001 } },
    netherite: { common: [500, 550, 600], rare: [650, 700, 750, 800, 850], epic: [900, 950, 1000, 1500], legendary: [2000, 2500, 3000, 3200, 3500, 4000, 5000, 10000, 15000, 20000], jackpot: [25000],
                 chances: { common: 0.2499, rare: 0.6749, epic: 0.07, legendary: 0.005, jackpot: 0.00000001 } },
    obsidian:  { common: [500, 1000, 1500], rare: [2000, 2500, 3000], epic: [4000, 5000, 7500], legendary: [10000, 15000], jackpot: [25000],
                 chances: { common: 0.35, rare: 0.35, epic: 0.2, legendary: 0.09, jackpot: 0.01 } },
    bedrock:   { common: [5000], rare: [10000, 25000], epic: [50000, 100000], legendary: [250000], jackpot: [1000000],
                 chances: { common: 0.999, rare: 0.0009, epic: 0.00009, legendary: 0.000009, jackpot: 0.000001 } }
};

// Приоритет при пересечении диапазонов: jackpot > legendary > epic > rare > common
const RARITY_PRIORITY = ['jackpot', 'legendary', 'epic', 'rare', 'common'];

function getCaseRarityKey(type, value) {
    const map = CASE_RARITY[type];
    if (map) {
        for (const key of RARITY_PRIORITY) {
            if (map[key] && map[key].indexOf(value) !== -1) return key;
        }
    }
    // Fallback: квартили списка наград
    const prizes = getPrizes(type);
    const sorted = [...prizes].sort((a, b) => a - b);
    const n = sorted.length;
    if (n === 0) return 'common';
    if (value >= sorted[n - 1]) return 'jackpot';
    if (n >= 2 && value >= sorted[n - 2]) return 'legendary';
    const idx = sorted.indexOf(value);
    const frac = idx >= 0 ? idx / n : 0;
    if (frac >= 0.75) return 'epic';
    if (frac >= 0.4) return 'rare';
    return 'common';
}

const getRarity = (type, value) => RARITY_META[getCaseRarityKey(type, value)];

// Тематические частицы-эмодзи для предпросмотра кейса
const CASE_PARTICLES = {
    free: ['🎁', '✨', '⭐'],
    mud: ['🟤', '🪨', '🌱'],
    wood: ['🪵', '🍂', '🌲'],
    stone: ['🪨', '⛰️', '✦'],
    bronze: ['🟠', '⚙️', '✨'],
    silver: ['⚪', '✨', '💠'],
    gold: ['✨', '🪙', '💛'],
    diamond: ['💎', '✦', '🔷'],
    netherite: ['🔥', '🟥', '⚫'],
    obsidian: ['🔮', '🟣', '⬛'],
    bedrock: ['⬛', '🪨', '💠']
};

// Кнопка «⏭ Пропустить» для анимаций
function createSkipButton(onSkip) {
    const btn = document.createElement('button');
    btn.className = 'btn-skip-anim';
    btn.textContent = '⏭ Пропустить';
    btn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); onSkip(); };
    return btn;
}

// Счётчик суммы с анимацией
function animateCountUp(el, target, duration = 900, suffix = '⭐') {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    function frame(now) {
        if (!el.isConnected) return;
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.innerHTML = Math.round(from + (target - from) * eased) + suffix;
        if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// Конфетти при крупных выигрышах
function spawnConfetti(container, count = 36) {
    const colors = ['#ffd700', '#4ade80', '#6bcbff', '#b388ff', '#f87171', '#ffffff'];
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = 6 + Math.random() * 8;
        piece.style.cssText = `left:${Math.random() * 100}%; width:${size}px; height:${size * 0.45}px; background:${colors[i % colors.length]}; animation-delay:${(Math.random() * 0.6).toFixed(2)}s; animation-duration:${(1.6 + Math.random() * 1.4).toFixed(2)}s;`;
        container.appendChild(piece);
        setTimeout(() => piece.remove(), 3600);
    }
}

const apiRequest = async (endpoint, body = {}, retries = 3, timeout = 15000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, ...body }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            let data = null;
            try { data = await res.json(); } catch (e) { data = null; }

            if (!res.ok) {
                const msg = (data && data.error) ? data.error : `Ошибка сервера (${res.status})`;
                // 4xx — осмысленная ошибка сервера, ретраить не нужно
                if (res.status >= 400 && res.status < 500) return { error: msg };
                throw new Error(msg);
            }
            return data || {};
        } catch (e) {
            clearTimeout(timeoutId);
            if (attempt === retries - 1) {
                console.error(`Ошибка запроса к ${endpoint}:`, e);
                return { error: e.name === 'AbortError' ? 'Сервер не отвечает. Попробуйте позже.' : 'Сетевая ошибка. Попробуйте позже.' };
            }
            await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        }
    }
    return { error: 'Сетевая ошибка' };
};

const createCardElement = (value, style, width = 90, height = 140, caseType = null) => {
    const isLarge = value > 1000;
    const fontSize = isLarge ? '16px' : '20px';
    const rarity = caseType ? getRarity(caseType, value) : null;
    const div = document.createElement('div');
    div.className = 'card' + (rarity ? ' ' + rarity.cls : '');
    div.dataset.value = value;
    Object.assign(div.style, {
        width: width + 'px',
        height: height + 'px',
        flexShrink: '0',
        fontSize: fontSize
    });
    div.style.flexDirection = 'column';
    div.style.gap = '5px';

    // Тематический арт кейса в углу карточки
    if (caseType) {
        const corner = document.createElement('img');
        corner.className = 'card-case-corner';
        corner.src = `assets/case_${caseType}.png`;
        corner.alt = '';
        corner.onerror = () => corner.remove();
        div.appendChild(corner);
    }

    const valSpan = document.createElement('div');
    valSpan.className = 'card-value';
    valSpan.innerHTML = value + starIcon(isLarge ? 14 : 17);
    div.appendChild(valSpan);

    if (rarity) {
        const badge = document.createElement('div');
        badge.className = 'rarity-badge ' + rarity.cls;
        badge.textContent = rarity.label;
        div.appendChild(badge);
    }
    return div;
};

// ===== КАСТОМНОЕ ОКНО =====
// type: 'error' | 'success' | 'info' (по умолчанию определяется по ведущему эмодзи;
// для обратной совместимости принимает boolean: true → 'success')
function showCustomAlert(message, type) {
    const old = document.getElementById('customAlertOverlay');
    if (old) old.remove();

    if (type === true) type = 'success';
    if (type === false || type === undefined || type === null) type = '';

    let msg = String(message);
    if (!type) {
        if (msg.startsWith('❌')) type = 'error';
        else if (msg.startsWith('✅') || msg.startsWith('🎉')) type = 'success';
        else type = 'info';
    }
    // Убираем дублирующий ведущий эмодзи (иконка уже сверху), HTML в тексте сохраняется
    msg = msg.replace(/^(❌|✅|🎉)\s*/, '');

    const conf = {
        error:   { img: 'assets/lose_icon.png', emoji: '❌' },
        success: { img: 'assets/win_cup.png',   emoji: '✅' },
        info:    { img: 'assets/star.png',      emoji: 'ℹ️' }
    }[type] || { img: 'assets/star.png', emoji: 'ℹ️' };

    const overlay = document.createElement('div');
    overlay.id = 'customAlertOverlay';
    overlay.className = 'alert-overlay alert-' + type;
    overlay.innerHTML = `
        <div class="alert-panel">
            <img src="${conf.img}" class="alert-icon" alt="${conf.emoji}" onerror="this.outerHTML='<div class=&quot;alert-icon alert-icon-emoji&quot;>${conf.emoji}</div>'">
            <div class="alert-text">${msg}</div>
            <button class="btn-game btn-primary alert-btn" onclick="this.closest('#customAlertOverlay').remove()">OK</button>
        </div>
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
    currentNewBalance: null,
    currentAd: null,
    isOpening: false,
    tapeContainer: null,
    crashInterval: null
};

// ===== ЗАКРЫТИЕ ОВЕРЛЕЕВ =====
function closeAllOverlays() {
    const ids = [
        'tapeContainer',
        'resultContainer',
        'botBattlePreviewOverlay',
        'botRouletteOverlay',
        'botBattleResultOverlay',
        'minesResultOverlay',
        'crashResultOverlay',
        'customAlertOverlay',
        'gameUpgradeResultOverlay',
        'levelUnlockOverlay'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    state.isOpening = false;
    state.tapeContainer = null;
}

// ===== НАВИГАЦИЯ =====
function setActiveScreen(screenId, tab) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
    if (navItem) navItem.classList.add('active');
}

function showMain() {
    closeAllOverlays();
    setActiveScreen('mainScreen', 'main');
    loadBalance();
}

function showLevels() {
    closeAllOverlays();
    setActiveScreen('levelsScreen', 'levels');
    loadLevels();
}

function showGames() {
    closeAllOverlays();
    setActiveScreen('gamesScreen', 'games');

    document.getElementById('gamesMenu').style.display = 'flex';
    document.getElementById('crashGameContainer').style.display = 'none';
    document.getElementById('minesGameContainer').style.display = 'none';
    document.getElementById('upgradeGameContainer').style.display = 'none';

    exitMinesIfActive();

    if (crash.interval) {
        clearInterval(crash.interval);
        crash.interval = null;
    }
}

function showQuests() {
    closeAllOverlays();
    setActiveScreen('questsScreen', 'quests');

    const activeTab = document.querySelector('.quest-tab.active');
    loadQuestTab(activeTab ? activeTab.dataset.tab : 'status');
}

function showProfile() {
    closeAllOverlays();
    setActiveScreen('profileScreen', 'profile');
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
        applyProfileStatus(data.status);
        if (DOM.profileRefs) DOM.profileRefs.textContent = data.refs;
        if (DOM.inviteLink) DOM.inviteLink.value = 'https://t.me/Randevucase_bot?start=' + user_id;
    }
}

function updateAllBalances(newBalance) {
    if (DOM.balance) DOM.balance.innerHTML = starIcon(16) + ' ' + newBalance;
    if (DOM.balanceValue) DOM.balanceValue.innerHTML = newBalance + ' ' + starIcon(20);
    if (DOM.profileBalance) DOM.profileBalance.textContent = newBalance;
}

// ===== КЕЙСЫ =====
async function checkBalance(type) {
    const data = await apiRequest('/check_balance', { case_type: type });
    if (data.error) { showCustomAlert('❌ ' + data.error); return false; }
    if (!data.can_open) { showCustomAlert('❌ Недостаточно звёзд или время не прошло!'); return false; }
    return true;
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
    tapeContainer.className = 'tape-overlay ' + (mode === 'preview' ? 'tape-preview' : 'tape-roulette');
    tapeContainer.style.setProperty('--case-color', style.titleColor);
    tapeContainer.style.setProperty('--case-glow', style.glowColor);
    tapeContainer.style.setProperty('--case-shadow', style.shadowColor);
    state.tapeContainer = tapeContainer;

    // Верхняя плашка с балансом
    const balanceDisplay = document.createElement('div');
    balanceDisplay.className = 'tape-balance';
    balanceDisplay.innerHTML = `${starIcon(15)} ${DOM.balance.textContent.trim()}`;
    tapeContainer.appendChild(balanceDisplay);

    if (mode === 'preview') {
        // ===== НОВЫЙ ЭКРАН ПРЕДПРОСМОТРА =====
        const scroll = document.createElement('div');
        scroll.className = 'pv-scroll';

        // Герой: большой арт кейса + тематические частицы
        const hero = document.createElement('div');
        hero.className = 'pv-hero';

        const particles = CASE_PARTICLES[type] || ['✨'];
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('span');
            p.className = 'pv-particle';
            p.textContent = particles[i % particles.length];
            p.style.left = (8 + Math.random() * 84) + '%';
            p.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
            p.style.animationDuration = (5 + Math.random() * 4).toFixed(2) + 's';
            p.style.fontSize = (12 + Math.random() * 14).toFixed(0) + 'px';
            hero.appendChild(p);
        }

        const art = document.createElement('img');
        art.className = 'pv-case-art';
        art.src = `assets/case_${type}.png`;
        art.alt = getCaseName(type);
        art.onerror = () => { art.outerHTML = `<div class="pv-case-art pv-case-art-emoji">${style.icon}</div>`; };
        hero.appendChild(art);
        scroll.appendChild(hero);

        const nameEl = document.createElement('div');
        nameEl.className = 'pv-name';
        nameEl.textContent = `Кейс «${getCaseName(type)}»`;
        scroll.appendChild(nameEl);

        const priceEl = document.createElement('div');
        priceEl.className = 'pv-price';
        priceEl.innerHTML = price > 0 ? `${price} ${starIcon(15)}` : '🎁 Бесплатно';
        scroll.appendChild(priceEl);

        // Список возможных наград с цветами редкостей
        const lootTitle = document.createElement('div');
        lootTitle.className = 'pv-loot-title';
        lootTitle.textContent = '👀 Возможные награды';
        scroll.appendChild(lootTitle);

        const loot = document.createElement('div');
        loot.className = 'pv-loot';
        [...prizes].sort((a, b) => a - b).forEach(v => {
            const rarity = getRarity(type, v);
            const item = document.createElement('div');
            item.className = 'pv-loot-item ' + rarity.cls;
            item.innerHTML = v + starIcon(12);
            loot.appendChild(item);
        });
        scroll.appendChild(loot);

        // Лента-предпросмотр (бесконечная прокрутка)
        const viewport = document.createElement('div');
        viewport.className = 'pv-tape-viewport';

        const cardWidth = 90, cardGap = 6;
        const oneSetWidth = prizes.length * (cardWidth + cardGap);
        const track = document.createElement('div');
        track.className = 'pv-tape-track';
        for (let r = 0; r < 3; r++) {
            for (let i = 0; i < prizes.length; i++) {
                track.appendChild(createCardElement(prizes[i], style, cardWidth, 110, type));
            }
        }
        const oldScrollStyle = document.getElementById('previewScrollStyle');
        if (oldScrollStyle) oldScrollStyle.remove();
        const scrollStyle = document.createElement('style');
        scrollStyle.id = 'previewScrollStyle';
        scrollStyle.textContent = `@keyframes scrollTapeForward { 0% { transform: translateX(0); } 100% { transform: translateX(-${oneSetWidth}px); } }`;
        document.head.appendChild(scrollStyle);
        track.style.animation = `scrollTapeForward ${(prizes.length * 0.65).toFixed(2)}s linear infinite`;
        viewport.appendChild(track);
        scroll.appendChild(viewport);

        // Кнопки
        const btnContainer = document.createElement('div');
        btnContainer.className = 'pv-buttons';

        const userBalance = parseInt(DOM.balance.textContent.replace(/[^\d]/g, '')) || 0;
        const hasEnough = userBalance >= price;
        const totalPrice = price * 10;
        const hasEnoughFor10 = userBalance >= totalPrice;

        const openBtn = document.createElement('button');
        openBtn.className = hasEnough ? 'btn-game btn-case-open' : 'btn-game btn-locked';
        openBtn.innerHTML = hasEnough
            ? (price > 0 ? `🎲 Открыть (${price}${starIcon(15)})` : '🎁 Открыть бесплатно')
            : `${icon('lock', 15, '', '🔒')} Недостаточно (${price}${starIcon(15)})`;
        if (hasEnough) openBtn.onclick = () => openCaseDirect(type);
        btnContainer.appendChild(openBtn);

        if (type !== 'free') {
            const open10Btn = document.createElement('button');
            open10Btn.className = hasEnoughFor10 ? 'btn-game btn-gold' : 'btn-game btn-locked';
            open10Btn.innerHTML = hasEnoughFor10 ? `🎲 Открыть ×10 (${totalPrice}${starIcon(15)})` : `${icon('lock', 15, '', '🔒')} ×10 (${totalPrice}${starIcon(15)})`;
            if (hasEnoughFor10) {
                open10Btn.onclick = () => { closeAllOverlays(); setTimeout(() => open10Cases(type), 300); };
            }
            btnContainer.appendChild(open10Btn);
        }

        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-game btn-ghost';
        closeBtn.textContent = '🔙 Назад';
        closeBtn.onclick = () => { closeAllOverlays(); showMain(); };
        btnContainer.appendChild(closeBtn);

        scroll.appendChild(btnContainer);
        tapeContainer.appendChild(scroll);
    } else {
        // ===== РЕЖИМ РУЛЕТКИ =====
        const title = document.createElement('div');
        title.className = 'rl-title';
        title.innerHTML = `<img src="assets/case_${type}.png" class="rl-title-icon" alt="" onerror="this.remove()"> Кейс «${getCaseName(type)}»`;
        tapeContainer.appendChild(title);

        const viewport = document.createElement('div');
        viewport.className = 'rl-viewport';

        const cardWidth = 130, cardGap = 8;
        const track = document.createElement('div');
        track.id = 'track';
        track.className = 'rl-track';
        track.style.gap = cardGap + 'px';

        for (let i = 0; i < 20; i++) {
            const value = (i === 10 && state.currentPrize !== null)
                ? state.currentPrize
                : prizes[Math.floor(Math.random() * prizes.length)];
            track.appendChild(createCardElement(value, style, cardWidth, 120, type));
        }
        viewport.appendChild(track);

        // Центральный указатель со свечением
        const marker = document.createElement('div');
        marker.className = 'rl-marker';
        marker.innerHTML = `<div class="rl-marker-arrow"><img src="assets/roulette_pointer.png" class="rl-pointer-img" alt="▼" onerror="this.outerHTML='▼'"></div><div class="rl-marker-line"></div>`;
        viewport.appendChild(marker);

        tapeContainer.appendChild(viewport);
        tapeContainer._track = track;
        tapeContainer._viewport = viewport;

        const bottomSection = document.createElement('div');
        bottomSection.className = 'rl-bottom';

        const loadingLabel = document.createElement('div');
        loadingLabel.className = 'rl-status';
        loadingLabel.textContent = '🎰 Открытие...';
        bottomSection.appendChild(loadingLabel);

        const skipBtn = createSkipButton(() => {
            if (tapeContainer._skip) tapeContainer._skip();
        });
        bottomSection.appendChild(skipBtn);

        tapeContainer.appendChild(bottomSection);
    }

    document.body.appendChild(tapeContainer);
}

// Открытие кейса: приз решает ТОЛЬКО сервер
function openCaseDirect(type) {
    if (state.isOpening) return;
    state.isOpening = true;
    state.lastOpenedCase = type;

    checkBalance(type).then(canOpen => {
        if (!canOpen) { state.isOpening = false; return; }

        apiRequest('/open_case', { case_type: type }).then(data => {
            if (data.error) {
                showCustomAlert('❌ ' + data.error);
                state.isOpening = false;
                return;
            }

            state.currentPrize = data.prize;
            state.currentNewBalance = data.new_balance;
            state.currentAd = data.ad || null;

            // Free-кейс крутит ту же рулетку, что и платные;
            // баланс обновится в showResult из state.currentNewBalance
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
    if (targetPrize === null || targetPrize === undefined) {
        showCustomAlert('❌ Ошибка: награда не получена');
        closeAllOverlays();
        return;
    }

    const cardWidth = 130;
    const cardGap = 8;
    const totalCardWidth = cardWidth + cardGap;
    const totalCards = 20;
    const winPosition = 10;

    const newCards = [];
    for (let i = 0; i < totalCards; i++) {
        const value = (i === winPosition) ? targetPrize : prizes[Math.floor(Math.random() * prizes.length)];
        newCards.push(createCardElement(value, style, 130, 120, type));
    }
    track.innerHTML = '';
    newCards.forEach(c => track.appendChild(c));

    const viewportWidth = viewport.offsetWidth || 700;
    const centerOffset = viewportWidth / 2;
    const shift = (winPosition * totalCardWidth) - centerOffset + (cardWidth / 2);
    const noise = Math.floor(Math.random() * 20) - 10;
    const finalShift = shift + noise;

    // Замедление с лёгким bounce в конце
    track.style.transition = 'transform 4200ms cubic-bezier(0.12, 0.9, 0.1, 1.03)';
    track.style.transform = `translateX(-${finalShift}px)`;

    let finished = false;
    const onFinish = () => {
        if (finished) return;
        finished = true;
        track.removeEventListener('transitionend', onFinish);
        tapeContainer._skip = null;
        showResult(type, targetPrize, style, track, winPosition);
    };
    track.addEventListener('transitionend', onFinish);
    // Мгновенный пропуск: результат уже известен с сервера
    tapeContainer._skip = () => {
        track.style.transition = 'none';
        track.style.transform = `translateX(-${finalShift}px)`;
        onFinish();
    };
    setTimeout(onFinish, 5300);
}

// ===== ЕДИНЫЙ КОМПОНЕНТ РЕЗУЛЬТАТА (glassmorphism) =====
// opts: { id, kind: 'win'|'lose'|'draw', icon, iconImg, title, amount, amountSuffix, subtitle,
//         extraHTML, buttons: [{label, cls, onClick, labelHTML}], confetti, balance }
function createResultOverlay(opts) {
    const old = opts.id ? document.getElementById(opts.id) : null;
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = opts.id || 'resultOverlayGeneric';
    overlay.className = `result-overlay result-${opts.kind || 'win'}`;

    const panel = document.createElement('div');
    panel.className = 'result-panel';

    if (opts.icon || opts.iconImg) {
        const iconEl = document.createElement('div');
        iconEl.className = 'result-icon' + (opts.iconImg ? ' result-icon-art' : '');
        if (opts.iconImg) {
            iconEl.innerHTML = `<img src="assets/${opts.iconImg}.png" class="result-icon-img" alt="${opts.icon || ''}" onerror="this.outerHTML='${opts.icon || ''}'">`;
        } else {
            iconEl.textContent = opts.icon;
        }
        panel.appendChild(iconEl);
    }

    const title = document.createElement('div');
    title.className = 'result-title';
    title.textContent = opts.title || '';
    panel.appendChild(title);

    if (opts.amount !== undefined && opts.amount !== null) {
        const amount = document.createElement('div');
        amount.className = 'result-amount';
        const suffix = opts.amountSuffix !== undefined ? opts.amountSuffix : starIcon(40);
        amount.innerHTML = '0' + suffix;
        panel.appendChild(amount);
        animateCountUp(amount, opts.amount, 900, suffix);
    }

    if (opts.subtitle) {
        const sub = document.createElement('div');
        sub.className = 'result-subtitle';
        sub.innerHTML = opts.subtitle;
        panel.appendChild(sub);
    }

    if (opts.extraHTML) {
        const extra = document.createElement('div');
        extra.className = 'result-extra';
        extra.innerHTML = opts.extraHTML;
        panel.appendChild(extra);
    }

    if (opts.balance !== undefined && opts.balance !== null) {
        const bal = document.createElement('div');
        bal.className = 'result-balance';
        bal.innerHTML = `Баланс: ${opts.balance} ${starIcon(14)}`;
        panel.appendChild(bal);
    }

    if (opts.buttons && opts.buttons.length) {
        const btnRow = document.createElement('div');
        btnRow.className = 'result-buttons';
        opts.buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.className = 'btn-game ' + (b.cls || 'btn-primary');
            if (b.labelHTML) btn.innerHTML = b.labelHTML;
            else btn.textContent = b.label;
            btn.onclick = b.onClick;
            btnRow.appendChild(btn);
        });
        panel.appendChild(btnRow);
    }

    overlay.appendChild(panel);
    if (opts.confetti) spawnConfetti(overlay, opts.confettiCount || 36);
    document.body.appendChild(overlay);
    return overlay;
}

function showResult(type, targetPrize, style, track, winPosition) {
    const cards = track.querySelectorAll('.card');
    const winCard = cards[winPosition];
    if (winCard) winCard.classList.add('win-card');

    setTimeout(() => {
        const newBalance = state.currentNewBalance;
        const rarity = getRarity(type, targetPrize);
        const isBig = rarity.cls === 'rarity-legend' || rarity.cls === 'rarity-jackpot';

        const price = getPrice(type);
        const buttons = [
            {
                labelHTML: price > 0 ? `🎲 Открыть ещё (${price}${starIcon(15)})` : '🎁 Открыть ещё',
                cls: 'btn-primary',
                onClick: () => { closeAllOverlays(); setTimeout(() => openCaseDirect(type), 300); }
            },
            {
                label: '🔙 Назад',
                cls: 'btn-ghost',
                onClick: () => { closeAllOverlays(); showMain(); }
            }
        ];

        createResultOverlay({
            id: 'resultContainer',
            kind: 'win',
            icon: style.icon,
            iconImg: 'win_cup',
            title: `Кейс «${getCaseName(type)}» — выигрыш!`,
            amount: targetPrize,
            subtitle: `<span class="rarity-badge ${rarity.cls}" style="font-size:11px;">${rarity.label}</span>`,
            extraHTML: state.currentAd ? `<div class="result-ad">📢 ${state.currentAd}</div>` : '',
            buttons,
            confetti: isBig,
            confettiCount: rarity.cls === 'rarity-jackpot' ? 60 : 30,
            balance: (newBalance !== null && newBalance !== undefined) ? newBalance : null
        });

        if (newBalance !== null && newBalance !== undefined) {
            updateAllBalances(newBalance);
        } else {
            loadBalance();
        }
    }, 300);
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

    if (data.new_balance !== undefined) updateAllBalances(data.new_balance);
    show10CasesAnimation(type, data);
    state.isOpening = false;
}

function show10CasesAnimation(type, data) {
    const prizes = getPrizes(type);
    const style = getStyle(type);

    const overlay = document.createElement('div');
    overlay.id = 'tapeContainer';
    overlay.className = 'tape-overlay tape-x10';
    overlay.style.setProperty('--case-color', style.titleColor);
    overlay.style.setProperty('--case-glow', style.glowColor);
    overlay.style.setProperty('--case-shadow', style.shadowColor);

    const title = document.createElement('div');
    title.className = 'rl-title';
    title.innerHTML = `<img src="assets/case_${type}.png" class="rl-title-icon" alt="" onerror="this.remove()"> «${getCaseName(type)}» ×10`;
    overlay.appendChild(title);

    const balanceDisplay = document.createElement('div');
    balanceDisplay.className = 'tape-balance';
    balanceDisplay.innerHTML = `${starIcon(15)} ${DOM.balance.textContent.trim()}`;
    overlay.appendChild(balanceDisplay);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'x10-grid';

    const cardWidth = 70;
    const cardGap = 6;
    const totalItems = prizes.length;
    const tracks = [];
    const winPositions = [];

    for (let r = 0; r < 10; r++) {
        const viewport = document.createElement('div');
        viewport.className = 'x10-viewport';

        const track = document.createElement('div');
        track.className = 'mini-track';
        track.dataset.index = r;
        track.style.gap = cardGap + 'px';
        track.style.width = (totalItems * 3 * (cardWidth + cardGap)) + 'px';

        const targetPrize = data.prizes[r] !== undefined ? data.prizes[r] : prizes[0];
        const targetIndex = Math.max(0, prizes.indexOf(targetPrize));
        const winPos = Math.floor(totalItems * 1.5) + targetIndex;
        winPositions.push(winPos);

        for (let i = 0; i < totalItems * 3; i++) {
            const value = (i === winPos) ? targetPrize : prizes[Math.floor(Math.random() * prizes.length)];
            const isLarge = value > 1000;
            const rarity = getRarity(type, value);
            const card = document.createElement('div');
            card.className = 'x10-card ' + rarity.cls;
            card.style.width = cardWidth + 'px';
            card.style.fontSize = isLarge ? '10px' : '12px';
            card.innerHTML = value + starIcon(isLarge ? 9 : 11);
            track.appendChild(card);
        }

        const marker = document.createElement('div');
        marker.className = 'x10-marker';
        marker.innerHTML = `<img src="assets/roulette_pointer.png" class="x10-pointer-img" alt="▼" onerror="this.outerHTML='▼'">`;

        viewport.appendChild(track);
        viewport.appendChild(marker);
        gridContainer.appendChild(viewport);
        tracks.push(track);
    }

    overlay.appendChild(gridContainer);

    const statusText = document.createElement('div');
    statusText.className = 'rl-status';
    statusText.textContent = '🎰 Открытие...';
    overlay.appendChild(statusText);

    document.body.appendChild(overlay);

    let finished = false;
    let spinTimer = null;
    let highlightTimer = null;
    let resultTimer = null;

    const computeShift = (track, winPos) => {
        const viewportWidth = track.parentElement.offsetWidth || 200;
        const centerOffset = viewportWidth / 2;
        const shift = (winPos * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
        const noise = Math.floor(Math.random() * 20) - 10;
        return shift + noise;
    };

    const shifts = tracks.map((t, i) => computeShift(t, winPositions[i]));

    const highlightWinners = () => {
        tracks.forEach((track, index) => {
            const cards = track.children;
            const winCard = cards[winPositions[index]];
            if (winCard) winCard.classList.add('x10-win');
        });
    };

    const showFinalResult = () => {
        const totalPrize = data.total_prize !== undefined ? data.total_prize : data.prizes.reduce((a, b) => a + b, 0);
        const bestRarity = data.prizes.reduce((best, p) => {
            const order = ['common', 'rare', 'epic', 'legendary', 'jackpot'];
            const cur = order.indexOf(getCaseRarityKey(type, p));
            return cur > best ? cur : best;
        }, 0);
        const isBig = bestRarity >= 3;

        createResultOverlay({
            id: 'resultContainer',
            kind: 'win',
            icon: '🎉',
            iconImg: 'win_cup',
            title: `«${getCaseName(type)}» ×10 — ТЫ ВЫИГРАЛ!`,
            amount: totalPrize,
            extraHTML: `<div class="result-prizes-row">${data.prizes.map(p => {
                const r = getRarity(type, p);
                return `<span class="result-prize-chip ${r.cls}">${p}${starIcon(12)}</span>`;
            }).join('')}</div>`,
            buttons: [
                { label: '🎲 ОТКРЫТЬ ЕЩЁ ×10', cls: 'btn-primary', onClick: () => { closeAllOverlays(); open10Cases(type); } },
                { label: '🔙 НАЗАД', cls: 'btn-ghost', onClick: () => { closeAllOverlays(); showMain(); } }
            ],
            confetti: isBig,
            confettiCount: bestRarity >= 4 ? 60 : 30
        });
        loadBalance();
    };

    const finishAll = (instant) => {
        if (finished) return;
        finished = true;
        if (spinTimer) clearTimeout(spinTimer);
        if (highlightTimer) clearTimeout(highlightTimer);
        if (resultTimer) clearTimeout(resultTimer);
        if (skipBtn.parentNode) skipBtn.remove();

        tracks.forEach((track, i) => {
            if (instant) track.style.transition = 'none';
            track.style.transform = `translateX(-${shifts[i]}px)`;
        });

        if (instant) {
            highlightWinners();
            showFinalResult();
        } else {
            highlightTimer = setTimeout(() => {
                highlightWinners();
                resultTimer = setTimeout(showFinalResult, 800);
            }, 5100);
        }
    };

    const skipBtn = createSkipButton(() => finishAll(true));
    overlay.appendChild(skipBtn);

    spinTimer = setTimeout(() => {
        tracks.forEach((track, i) => {
            track.style.transition = `transform ${4200 + Math.random() * 900}ms cubic-bezier(0.12, 0.9, 0.1, 1.03)`;
            track.style.transform = `translateX(-${shifts[i]}px)`;
        });
        highlightTimer = setTimeout(() => {
            if (finished) return;
            finished = true;
            if (skipBtn.parentNode) skipBtn.remove();
            highlightWinners();
            resultTimer = setTimeout(showFinalResult, 800);
        }, 5300);
    }, 300);
}

// ===== УРОВНИ =====
const LEVEL_ORDER = ['mud','wood','stone','bronze','silver','gold','diamond','netherite','obsidian','bedrock'];

const LEVELS = [
    { id: 'mud', name: 'Грязь', icon: '🟫', caseType: 'mud' },
    { id: 'wood', name: 'Дерево', icon: '🌳', caseType: 'wood' },
    { id: 'stone', name: 'Камень', icon: '🗿', caseType: 'stone' },
    { id: 'bronze', name: 'Бронза', icon: '🥉', caseType: 'bronze' },
    { id: 'silver', name: 'Серебро', icon: '🔘', caseType: 'silver' },
    { id: 'gold', name: 'Золото', icon: '👑', caseType: 'gold' },
    { id: 'diamond', name: 'Алмаз', icon: '💎', caseType: 'diamond' },
    { id: 'netherite', name: 'Незерит', icon: '🔥', caseType: 'netherite' },
    { id: 'obsidian', name: 'Обсидиан', icon: '🔮', caseType: 'obsidian' },
    { id: 'bedrock', name: 'Бедрок', icon: '⛏️', caseType: 'bedrock' }
];

async function loadLevels() {
    const data = await apiRequest('/get_levels_data');
    const unlockedLevels = data.unlocked_levels || ['mud'];
    const levelWins = data.level_wins || {};
    const levelProgress = data.level_progress || {};

    const container = document.getElementById('levelsList');
    if (!container) return;
    container.innerHTML = '';

    LEVELS.forEach((level) => {
        const isUnlocked = unlockedLevels.includes(level.caseType);
        const wins = levelWins[level.caseType] || 0;
        const progress = levelProgress[level.caseType] || 0;
        const isCompleted = wins >= 3;
        const canPlay = isUnlocked && progress >= 10;
        const progressPercent = Math.min((progress / 10) * 100, 100);

        let buttonHTML;
        if (!isUnlocked) {
            buttonHTML = `<button class="level-play-btn" disabled>🔒</button>`;
        } else if (canPlay) {
            buttonHTML = `<button class="level-play-btn" onclick="startLevel('${level.caseType}')"><img src="assets/icon_battle.png" class="ic" style="width:16px;height:16px;" alt="⚔️" onerror="this.outerHTML='⚔️'"> Играть</button>`;
        } else {
            buttonHTML = `<button class="level-play-btn" disabled>📦 ${progress}/10</button>`;
        }

        const card = document.createElement('div');
        card.className = `level-card ${!isUnlocked ? 'locked' : isCompleted ? 'completed' : 'unlocked'}`;

        let inner = `
            <div class="level-icon">${isUnlocked ? `<img src="assets/case_${level.caseType}.png" class="level-icon-img" alt="${level.icon}" onerror="this.outerHTML='${level.icon}'">` : '🔒'}</div>
            <div class="level-info">
                <div class="level-name">${level.name}</div>
        `;

        if (isUnlocked) {
            inner += `
                <div class="level-progress">
                    📦 Прогресс: ${Math.min(progress, 10)}/10 ${canPlay ? '· ✅ можно в бой!' : ''}
                    <div class="progress-bar">
                        <div class="fill ${canPlay ? 'ready' : ''}" style="width:${progressPercent}%"></div>
                    </div>
                </div>
                <div class="level-wins">⚔️ Побед: ${Math.min(wins, 3)}/3 ${isCompleted ? '· ✅ уровень пройден' : ''}</div>
            `;
        } else {
            inner += `<div class="level-progress">${icon('lock', 13, '', '🔒')} Победи бота 3 раза на предыдущем уровне</div>`;
        }

        inner += `</div>${buttonHTML}`;

        card.innerHTML = inner;
        container.appendChild(card);
    });
}

function startLevel(caseType) {
    showBotBattlePreview(caseType);
}

// ===== БИТВА С БОТОМ =====
function showBotBattlePreview(case_type) {
    const style = getStyle(case_type);

    const old = document.getElementById('botBattlePreviewOverlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'botBattlePreviewOverlay';
    overlay.className = 'btl-overlay';
    overlay.style.setProperty('--case-color', style.titleColor);
    overlay.style.setProperty('--case-glow', style.glowColor);

    overlay.innerHTML = `
        <div class="btl-panel">
            <div class="btl-title">⚔️ Битва</div>
            <div class="btl-case-name">Кейс «${getCaseName(case_type)}»</div>
            <img src="assets/case_${case_type}.png" class="btl-case-art" width="130" height="130" style="width:130px;height:130px;object-fit:contain;max-width:100%;" alt="${getCaseName(case_type)}" onerror="this.outerHTML='<div class=&quot;btl-case-art btl-case-art-emoji&quot;>${style.icon}</div>'">
            <div class="btl-hint">Нажми «Начать битву», чтобы открыть кейс</div>
            <div class="btl-fighters">
                <div class="btl-fighter btl-fighter-you">
                    <div class="btl-fighter-emoji">👤</div>
                    <div class="btl-fighter-name">ТЫ</div>
                </div>
                <img src="assets/vs.png" class="btl-vs" width="64" height="64" style="width:64px;height:64px;object-fit:contain;max-width:100%;" alt="VS" onerror="this.outerHTML='<div class=&quot;btl-vs btl-vs-text&quot;>VS</div>'">
                <div class="btl-fighter btl-fighter-bot">
                    <div class="btl-fighter-emoji">🤖</div>
                    <div class="btl-fighter-name">БОТ</div>
                </div>
            </div>
            <div class="btl-cost">
                За битву спишется 10 <img src="assets/case_${case_type}.png" class="btl-cost-icon" width="16" height="16" style="width:16px;height:16px;vertical-align:-3px;" alt="📦" onerror="this.outerHTML='📦'"> прогресса уровня
            </div>
            <button class="btn-game btn-primary btl-start" onclick="this.closest('#botBattlePreviewOverlay').remove(); startBotBattle('${case_type}');">
                <img src="assets/icon_battle.png" class="ic" width="22" height="22" style="width:22px;height:22px;vertical-align:-5px;" alt="⚔️" onerror="this.outerHTML='⚔️'"> НАЧАТЬ БИТВУ
            </button>
            <button class="btn-game btn-ghost" onclick="this.closest('#botBattlePreviewOverlay').remove()">
                🔙 НАЗАД
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function startBotBattle(case_type) {
    apiRequest('/start_bot_battle', { case_type }).then(data => {
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            loadLevels();
            return;
        }
        showBotRouletteAnimationWithResult(data, case_type);
    });
}

function showBotRouletteAnimationWithResult(data, case_type) {
    const style = getStyle(case_type);
    const prizes = getPrizes(case_type);

    const overlay = document.createElement('div');
    overlay.id = 'botRouletteOverlay';
    overlay.className = 'br-overlay';
    overlay.style.setProperty('--case-color', style.titleColor);
    overlay.style.setProperty('--case-glow', style.glowColor);

    const title = document.createElement('div');
    title.className = 'br-title';
    title.innerHTML = `<img src="assets/icon_battle.png" class="br-title-icon" alt="⚔️" onerror="this.outerHTML='⚔️'"> Битва: «${getCaseName(case_type)}»`;
    overlay.appendChild(title);

    const container = document.createElement('div');
    container.className = 'br-container';

    const cardWidth = 120;
    const cardGap = 8;
    const totalCards = 80;
    const winPosition = 40;

    const buildCards = (target) => {
        let html = '';
        for (let i = 0; i < totalCards; i++) {
            const p = (i === winPosition) ? target : prizes[Math.floor(Math.random() * prizes.length)];
            const fontSize = p > 1000 ? '18px' : '24px';
            const rarity = getRarity(case_type, p);
            html += `<div class="roulette-card card ${rarity.cls}" style="width:${cardWidth}px; height:90px; flex-shrink:0; font-size:${fontSize};">${p}${starIcon(p > 1000 ? 15 : 19)}</div>`;
        }
        return html;
    };

    const buildWrapper = (trackId, label, target) => `
        <div class="br-label">${label}</div>
        <div class="br-viewport">
            <div id="${trackId}" class="br-track" style="display:flex; gap:${cardGap}px; width:${totalCards * (cardWidth + cardGap)}px;">
                ${buildCards(target)}
            </div>
            <img src="assets/roulette_pointer.png" class="br-pointer" width="34" height="34" style="width:34px;height:34px;object-fit:contain;" alt="▼" onerror="this.outerHTML='▼'">
        </div>
    `;

    const p1Wrapper = document.createElement('div');
    p1Wrapper.className = 'br-player br-player-you';
    p1Wrapper.innerHTML = buildWrapper('botRouletteTrack1', '👤 ТЫ', data.player_prize);
    container.appendChild(p1Wrapper);

    const vsDiv = document.createElement('div');
    vsDiv.className = 'br-vs';
    vsDiv.innerHTML = '<img src="assets/vs.png" class="br-vs-img" width="64" height="64" style="width:64px;height:64px;object-fit:contain;max-width:100%;" alt="⚔️ VS" onerror="this.outerHTML=\'<div class=&quot;br-vs-text&quot;>VS</div>\'">';
    container.appendChild(vsDiv);

    const p2Wrapper = document.createElement('div');
    p2Wrapper.className = 'br-player br-player-bot';
    p2Wrapper.innerHTML = buildWrapper('botRouletteTrack2', '🤖 БОТ', data.bot_prize);
    container.appendChild(p2Wrapper);

    overlay.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.className = 'br-status';
    statusDiv.textContent = '🎰 Открытие...';
    overlay.appendChild(statusDiv);

    const battleSkipBtn = createSkipButton(() => { if (overlay._skipBattle) overlay._skipBattle(); });
    overlay.appendChild(battleSkipBtn);

    document.body.appendChild(overlay);

    setTimeout(() => {
        const track1 = document.getElementById('botRouletteTrack1');
        const track2 = document.getElementById('botRouletteTrack2');
        if (!track1 || !track2) return;

        const viewportWidth = window.innerWidth * 0.85;
        const centerOffset = viewportWidth / 2;
        const totalCardWidth = cardWidth + cardGap;

        const shift = (winPosition * totalCardWidth) - centerOffset + (cardWidth / 2);
        const finalShift1 = shift + (Math.floor(Math.random() * 20) - 10);
        const finalShift2 = shift + (Math.floor(Math.random() * 20) - 10);

        track1.style.transition = 'none';
        track1.style.transform = 'translateX(0px)';
        track2.style.transition = 'none';
        track2.style.transform = 'translateX(0px)';
        void track1.offsetHeight;
        void track2.offsetHeight;

        setTimeout(() => {
            if (finished) return;
            track1.style.transition = 'transform 10000ms cubic-bezier(0.05, 0.8, 0.1, 1)';
            track1.style.transform = `translateX(-${finalShift1}px)`;
            track2.style.transition = 'transform 10000ms cubic-bezier(0.05, 0.8, 0.1, 1)';
            track2.style.transform = `translateX(-${finalShift2}px)`;
        }, 100);

        let finished = false;

        // Подсветка выигрышных карточек и панели победителя
        const highlightBattleWinner = () => {
            const playerWon = data.result === 'win';
            const botWon = data.result === 'lose';

            const markCard = (track, isWinner) => {
                const c = track.children[winPosition];
                if (!c) return;
                c.style.background = isWinner ? 'rgba(74,222,128,0.18)' : 'rgba(255,215,0,0.10)';
                c.style.border = isWinner ? '2px solid #4ade80' : '2px solid rgba(232,199,106,0.4)';
                if (isWinner) {
                    c.style.boxShadow = '0 0 26px rgba(74,222,128,0.5)';
                    c.style.color = '#ffffff';
                }
            };
            markCard(track1, playerWon);
            markCard(track2, botWon);

            if (playerWon) {
                p1Wrapper.classList.add('battle-winner');
                p2Wrapper.classList.add('battle-loser');
            } else if (botWon) {
                p2Wrapper.classList.add('battle-winner');
                p1Wrapper.classList.add('battle-loser');
            } else {
                p1Wrapper.classList.add('battle-draw');
                p2Wrapper.classList.add('battle-draw');
            }
            statusDiv.textContent = playerWon ? '🏆 Победа за тобой!' : botWon ? '🤖 Бот оказался сильнее' : '🤝 Ничья!';
        };

        const finishBattle = () => {
            if (finished) return;
            finished = true;
            if (battleSkipBtn.parentNode) battleSkipBtn.remove();
            track1.style.transition = 'none';
            track1.style.transform = `translateX(-${finalShift1}px)`;
            track2.style.transition = 'none';
            track2.style.transform = `translateX(-${finalShift2}px)`;
            track1.removeEventListener('transitionend', finishBattle);
            track2.removeEventListener('transitionend', finishBattle);
            highlightBattleWinner();
            setTimeout(() => {
                const overlayEl = document.getElementById('botRouletteOverlay');
                if (overlayEl) overlayEl.remove();
                showBotBattleResult(data, case_type);
            }, 900);
        };

        track1.addEventListener('transitionend', finishBattle);
        track2.addEventListener('transitionend', finishBattle);

        overlay._skipBattle = finishBattle;
        setTimeout(finishBattle, 11000);
    }, 300);
}

function showBotBattleResult(data, case_type) {
    const kindMap = { win: 'win', lose: 'lose', draw: 'draw' };
    const iconMap = { win: '🎉', lose: '😢', draw: '🤝' };
    const iconImgMap = { win: 'win_cup', lose: 'lose_icon', draw: 'vs' };
    const titleMap = { win: 'ПОБЕДА!', lose: 'ПОРАЖЕНИЕ...', draw: 'НИЧЬЯ!' };
    const kind = kindMap[data.result] || 'draw';

    let progressHTML = '';
    if (data.wins !== undefined) {
        const wins = data.wins;
        const needed = data.needed_wins || 3;
        const filled = Array.from({ length: Math.min(wins, needed) },
            (_, i) => `<span class="win-star" style="animation-delay:${0.3 + i * 0.3}s">${starIcon(20)}</span>`).join('');
        const empty = '☆'.repeat(Math.max(0, needed - wins));
        progressHTML = `
            <div style="margin-top:4px; margin-bottom:4px; font-size:20px; letter-spacing:4px;">${filled}${empty}</div>
            <div style="color:#888; font-size:13px;">Побед: ${wins}/${needed} ${wins >= needed ? '✅ УРОВЕНЬ ПРОЙДЕН!' : ''}</div>
        `;
    }

    const playerRarity = getRarity(case_type, data.player_prize);
    const botRarity = getRarity(case_type, data.bot_prize);

    const vsHTML = `
        <div class="result-vs">
            <div class="result-vs-side ${data.result === 'win' ? 'is-winner' : ''}">
                <div style="font-size:36px;">👤</div>
                <div style="font-weight:700; color:${data.result === 'win' ? '#4ade80' : '#aaa'};">ТЫ</div>
                <div class="result-vs-prize ${playerRarity.cls}">${data.player_prize}${starIcon(20)}</div>
            </div>
            <div class="result-vs-label"><img src="assets/vs.png" class="battle-vs-img" alt="VS" onerror="this.outerHTML='VS'"></div>
            <div class="result-vs-side ${data.result === 'lose' ? 'is-winner' : ''}">
                <div style="font-size:36px;">🤖</div>
                <div style="font-weight:700; color:${data.result === 'lose' ? '#4ade80' : '#aaa'};">БОТ</div>
                <div class="result-vs-prize ${botRarity.cls}">${data.bot_prize}${starIcon(20)}</div>
            </div>
        </div>
        ${progressHTML}
        ${data.result_text ? `<div class="result-note">${data.result_text}</div>` : ''}
    `;

    createResultOverlay({
        id: 'botBattleResultOverlay',
        kind,
        icon: iconMap[data.result] || '🎲',
        iconImg: iconImgMap[data.result] || 'vs',
        title: titleMap[data.result] || 'РЕЗУЛЬТАТ',
        amount: data.result === 'win' ? data.player_prize : null,
        extraHTML: vsHTML,
        buttons: [
            { label: '🎯 УРОВНИ', cls: 'btn-primary', onClick: () => { closeAllOverlays(); showLevels(); } },
            { label: '🔙 НАЗАД', cls: 'btn-ghost', onClick: () => { closeAllOverlays(); showLevels(); } }
        ],
        confetti: data.result === 'win',
        confettiCount: 30
    });

    loadBalance();
    loadLevels();

    // Анимация разблокировки нового уровня
    if (data.level_unlocked) {
        let unlockedCase = null;
        if (typeof data.level_unlocked === 'string') {
            unlockedCase = data.level_unlocked;
        } else {
            const idx = LEVEL_ORDER.indexOf(case_type);
            if (idx >= 0 && idx < LEVEL_ORDER.length - 1) {
                unlockedCase = LEVEL_ORDER[idx + 1];
            }
        }
        setTimeout(() => showLevelUnlockAnimation(unlockedCase), 900);
    }
}

// ===== АНИМАЦИЯ РАЗБЛОКИРОВКИ УРОВНЯ =====
function showLevelUnlockAnimation(caseType) {
    const old = document.getElementById('levelUnlockOverlay');
    if (old) old.remove();

    const level = LEVELS.find(l => l.caseType === caseType);
    const icon = level ? level.icon : '🎉';
    const name = level ? level.name : 'Новый уровень';

    const overlay = document.createElement('div');
    overlay.id = 'levelUnlockOverlay';
    overlay.className = 'unlock-overlay';

    overlay.innerHTML = `
        <div class="unlock-ring"></div>
        <div class="unlock-ring" style="animation-delay:0.5s;"></div>
        <div class="unlock-icon">${caseType ? `<img src="assets/case_${caseType}.png" class="unlock-icon-img" alt="${icon}" onerror="this.outerHTML='${icon}'">` : icon}</div>
        <div class="unlock-title">НОВЫЙ УРОВЕНЬ ОТКРЫТ!</div>
        <div class="unlock-sub">${name} — теперь доступен для игры</div>
    `;

    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);

    setTimeout(() => {
        const el = document.getElementById('levelUnlockOverlay');
        if (el) {
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        }
    }, 3200);
}

// ===== ЗАДАНИЯ =====
// Редкостная рамка квеста по размеру награды
function getQuestRarityClass(reward) {
    if (reward >= 10000) return 'rarity-jackpot';
    if (reward >= 1000) return 'rarity-legend';
    if (reward >= 100) return 'rarity-epic';
    if (reward >= 30) return 'rarity-rare';
    return 'rarity-common';
}

// Визуальный тир профиля по статусу
function applyProfileStatus(statusText) {
    const card = document.querySelector('.profile-card');
    if (!card) return;
    const tiers = [
        { cls: 'profile-tier-legend',  icon: '👑', match: ['Легенда'] },
        { cls: 'profile-tier-master',  icon: '🟣', match: ['Мастер'] },
        { cls: 'profile-tier-stalker', icon: '🔴', match: ['Сталкер'] },
        { cls: 'profile-tier-lucky',   icon: '🟠', match: ['Везунчик'] },
        { cls: 'profile-tier-hunter',  icon: '🟡', match: ['Кейс-охотник'] },
        { cls: 'profile-tier-novice',  icon: '🟢', match: [] }
    ];
    card.classList.remove(...tiers.map(t => t.cls));
    const tier = tiers.find(t => t.match.some(m => (statusText || '').includes(m))) || tiers[tiers.length - 1];
    card.classList.add(tier.cls);
    // Аватар — арт nav_profile.png (см. index.html); тир виден по рамке карточки
    const avatar = card.querySelector('.profile-avatar');
    if (avatar && !avatar.querySelector('img') && !avatar.textContent.trim()) avatar.textContent = tier.icon;
}

function switchQuestTab(tab) {
    document.querySelectorAll('.quest-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
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
        case 'status': renderStatusQuests(data); break;
        case 'levels': renderLevelQuests(data); break;
        case 'friends': renderFriendsQuests(data); break;
    }
}

function renderStatusQuests(data) {
    const container = document.getElementById('questTabStatus');
    if (!container) return;
    container.innerHTML = '';

    const statuses = [
        { id: 'status_hunter', name: 'Кейс-охотник', desc: 'Открой 10 кейсов', target: 10, reward: 10, icon: '🟡' },
        { id: 'status_lucky', name: 'Везунчик', desc: 'Открой 100 кейсов', target: 100, reward: 30, icon: '🟠' },
        { id: 'status_stalker', name: 'Сталкер халявы', desc: 'Открой 444 кейса', target: 444, reward: 50, icon: '🔴' },
        { id: 'status_master', name: 'Мастер фортуны', desc: 'Открой 1000 кейсов', target: 1000, reward: 100, icon: '🟣' },
        { id: 'status_legend', name: 'Легенда', desc: 'Открой 2500 кейсов', target: 2500, reward: 200, icon: '👑' }
    ];

    const totalCases = data.total_cases || 0;
    const claimed = data.claimed_statuses || [];

    statuses.forEach(status => {
        const isComplete = totalCases >= status.target;
        const isClaimed = claimed.includes(status.id);
        const progressPercent = Math.min((totalCases / status.target) * 100, 100);

        const item = document.createElement('div');
        item.className = `quest-item ${getQuestRarityClass(status.reward)} ${isClaimed ? 'completed' : ''}`;

        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name"><span class="quest-icon">${status.icon || '👑'}</span>${status.name}</div>
                <div class="quest-desc">${status.desc}</div>
                <div class="quest-reward">🎁 ${status.reward} ${starIcon(14)}</div>
                <div class="quest-progress-bar">
                    <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                </div>
                <div style="font-size:12px; color:#5d5a6b; margin-top:2px;">${totalCases}/${status.target}</div>
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
        item.className = `quest-item ${getQuestRarityClass(quest.reward)} ${isClaimed ? 'completed' : ''}`;
        if (!isUnlocked) item.style.opacity = '0.35';

        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name"><img src="assets/case_${quest.caseType}.png" class="quest-case-img" alt="" onerror="this.outerHTML='📦'">${quest.name} ${isUnlocked ? '' : '🔒'}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">🎁 ${quest.reward} ${starIcon(14)}</div>
                ${isUnlocked ? `
                    <div class="quest-progress-bar">
                        <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                    </div>
                    <div style="font-size:12px; color:#5d5a6b; margin-top:2px;">${wins}/${quest.target} побед</div>
                ` : `
                    <div style="font-size:12px; color:#8b8798; margin-top:2px;">${icon('lock', 12, '', '🔒')} Откройте предыдущий уровень</div>
                `}
            </div>
            <button class="quest-btn ${isClaimed ? 'claimed' : ''}" ${(!isComplete || isClaimed || !isUnlocked) ? 'disabled' : ''} onclick="claimQuest('${quest.id}', ${quest.reward})">
                ${isClaimed ? '✅ Завершено' : isComplete ? '🎁 ЗАБРАТЬ' : isUnlocked ? `${wins}/${quest.target}` : icon('lock', 14, '', '🔒')}
            </button>
        `;

        container.appendChild(item);

        prevCompleted = isComplete || isClaimed;
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
        item.className = `quest-item ${getQuestRarityClass(quest.reward)} ${isClaimed ? 'completed' : ''}`;

        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name"><img src="assets/friends.png" class="quest-case-img" alt="👥" onerror="this.outerHTML='👥'">${quest.name}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">🎁 ${quest.reward} ${starIcon(14)}</div>
                <div class="quest-progress-bar">
                    <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                </div>
                <div style="font-size:12px; color:#5d5a6b; margin-top:2px;">${refs}/${quest.target} друзей</div>
            </div>
            <button class="quest-btn ${isClaimed ? 'claimed' : ''}" ${(!isComplete || isClaimed) ? 'disabled' : ''} onclick="claimQuest('${quest.id}', ${quest.reward})">
                ${isClaimed ? '✅ Завершено' : isComplete ? '🎁 ЗАБРАТЬ' : `${refs}/${quest.target}`}
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
        showCustomAlert(`✅ Получено ${data.reward !== undefined ? data.reward : reward} ${starIcon(16)}!`, true);
        loadBalance();
        const activeTab = document.querySelector('.quest-tab.active');
        if (activeTab) loadQuestTab(activeTab.dataset.tab);
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
        showCustomAlert(`✅ Промокод активирован! Получено ${data.reward} ${starIcon(16)}`, true);
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

// ===== КРАШ =====
let crash = {
    phase: 'preview',
    multiplier: 1.00,
    bet: 0,
    hasBet: false,
    chartData: [],
    ctx: null,
    canvas: null,
    dom: {},
    interval: null,
    firstVisit: true,
    crashedAt: 0 // момент краша (ms) — красное число держим минимум 3 сек
};

// true, если с момента краша прошло меньше 3 секунд (красное число ещё видно)
function inCrashHold() {
    return crash.crashedAt > 0 && (Date.now() - crash.crashedAt) < 3000;
}

// Панель ставки: либо ввод, либо статус «Ставка сделана»
function updateCrashBetPanel() {
    const d = crash.dom;
    if (!d) return;
    const betPanel = document.getElementById('gc_bet_panel');
    const betStatus = document.getElementById('gc_bet_status');
    const hold = inCrashHold();
    const hasActiveBet = crash.hasBet && (crash.phase === 'waiting' || crash.phase === 'active');

    if (betStatus) {
        if (hasActiveBet) {
            betStatus.style.display = 'block';
            betStatus.innerHTML = `✅ Ставка <b style="color:#e8c76a;">${crash.bet}</b> ${starIcon(15)} сделана`;
        } else {
            betStatus.style.display = 'none';
        }
    }
    if (betPanel) {
        betPanel.style.display = (hasActiveBet || hold) ? 'none' : 'block';
    }
    if (d.startBtn) {
        if (hasActiveBet || hold || crash.phase === 'active') {
            d.startBtn.style.display = 'none';
        } else {
            d.startBtn.style.display = 'inline-block';
            d.startBtn.disabled = crash.phase !== 'waiting';
        }
    }
}

function showCrashGame() {
    const menu = document.getElementById('gamesMenu');
    const container = document.getElementById('crashGameContainer');

    if (!menu || !container) {
        showCustomAlert('❌ Ошибка загрузки игры');
        return;
    }

    exitMinesIfActive();

    menu.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="game-screen-title" style="font-size:20px; font-weight:800; color:#4ade80; display:flex; align-items:center; gap:8px;"><img src="assets/icon_crash.png" class="ic" style="width:26px;height:26px;" alt="💥" onerror="this.outerHTML='💥'"> КРАШ</div>
        </div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:12px;">
            <span style="font-size:14px; color:#888;">Игр: <b id="gc_games" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Побед: <b id="gc_wins" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Поражений: <b id="gc_losses" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Лучший: <b id="gc_best" style="color:#fff;">x1.0</b></span>
        </div>
        <div style="text-align:center; padding:16px 0; background:rgba(255,255,255,0.04); border-radius:24px; margin-bottom:16px;">
            <div id="gc_chart" style="position:relative; width:100%; height:190px; background:rgba(0,0,0,0.3); border-radius:12px; overflow:hidden; margin-bottom:8px; border:1px solid rgba(255,255,255,0.04);">
                <canvas id="gc_canvas" width="400" height="190" style="width:100%; height:190px; display:block;"></canvas>
                <div id="gc_countdown" class="gc-countdown" style="display:none;">5</div>
                <div id="gc_multiplier" style="position:absolute; top:6px; right:12px; font-size:32px; font-weight:900; color:#4ade80; text-shadow:0 0 30px rgba(74,222,128,0.3); transition:none; line-height:1;">x1.00</div>
                <div style="position:absolute; bottom:0; left:0; right:0; height:3px; background:rgba(255,255,255,0.08);">
                    <div id="gc_progress" style="height:100%; width:0%; background:linear-gradient(90deg, #4ade80, #e8c76a, #f87171); border-radius:0 3px 3px 0; transition:width 0.1s ease;"></div>
                </div>
            </div>
            <div id="gc_status" style="font-size:15px; color:#888; margin-top:2px;"></div>
            <div id="gc_timer" style="font-size:13px; color:#5d5a6b; margin-top:2px; transition:none; animation:none;"></div>
        </div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:16px;">
            <div style="color:#aaa; font-size:14px;">Ставка: <b id="gc_bet_display" style="color:#fff;">0</b> ${starIcon(13)}</div>
            <div style="color:#aaa; font-size:14px;">Множитель: <b id="gc_multiplier_display" style="color:#e8c76a;">x1.00</b></div>
            <div style="color:#aaa; font-size:14px;">Выигрыш: <b id="gc_potential" style="color:#4ade80;">0</b> ${starIcon(13)}</div>
        </div>
        <div id="gc_bet_panel" style="margin-bottom:12px;">
            <div style="color:#aaa; font-size:14px; margin-bottom:6px;">Ставка (1-1000 ${starIcon(13)}):</div>
            <input type="number" id="gc_bet_input" min="1" max="1000" value="10" style="width:100%; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
        </div>
        <div id="gc_bet_status" class="game-panel" style="display:none; border-radius:16px; padding:16px; margin-bottom:12px; text-align:center; font-size:16px; font-weight:700; color:#4ade80;"></div>
        <div style="display:flex; gap:12px;">
            <button id="gc_start_btn" style="flex:1; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#34a86c,#228050); color:#fff; font-weight:800; font-size:18px; cursor:pointer; transition:none; animation:none;">💰 СДЕЛАТЬ СТАВКУ</button>
            <button id="gc_cashout_btn" style="display:none; flex:1; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#e8c76a,#c89a3e); color:#241a05; font-weight:800; font-size:18px; cursor:pointer;">💰 ЗАБРАТЬ</button>
        </div>
    `;

    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        container.style.display = 'none';
        menu.style.display = 'flex';
        if (crash.interval) {
            clearInterval(crash.interval);
            crash.interval = null;
        }
    };
    container.appendChild(backBtn);

    setTimeout(() => initCrash(), 50);
}

function initCrash() {
    const d = {
        canvas: document.getElementById('gc_canvas'),
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
        best: document.getElementById('gc_best'),
        countdown: document.getElementById('gc_countdown')
    };
    crash.dom = d;
    crash.canvas = d.canvas;
    if (d.canvas) {
        crash.ctx = d.canvas.getContext('2d');
        crash.chartData = [];
        drawCrashChart();
    }
    loadCrashStats();

    crash.phase = crash.firstVisit ? 'preview' : 'waiting';
    crash.firstVisit = false;
    crash.crashedAt = 0;
    updateCrashBetPanel();

    if (d.startBtn) {
        d.startBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (crash.phase === 'waiting') {
                const bet = parseInt(d.betInput.value);
                if (isNaN(bet) || bet < 1 || bet > 1000) {
                    showCustomAlert('❌ Ставка от 1 до 1000⭐');
                    return;
                }
                placeCrashBet(bet);
            } else {
                showCustomAlert('⏳ Подождите, игра ещё не закончилась!');
            }
        };
    }

    if (d.cashoutBtn) {
        d.cashoutBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            cashoutCrash();
        };
    }

    startCrashPolling();
}

async function placeCrashBet(bet) {
    const data = await apiRequest('/make_crash_bet', { bet });
    if (data.error) {
        showCustomAlert('❌ ' + data.error);
        return;
    }
    if (data.success !== false) {
        crash.hasBet = true;
        crash.bet = bet;
        if (crash.dom.betDisplay) crash.dom.betDisplay.textContent = bet;
        if (crash.dom.potential) {
            crash.dom.potential.innerHTML = Math.floor(bet * crash.multiplier * 0.95) + ' ' + starIcon(13);
        }
        updateCrashBetPanel();
        loadBalance();
    }
}

// Спрайт ракеты для графика краша
const crashRocketImg = new Image();
crashRocketImg.src = 'assets/icon_crash.png';

// Плавный градиент цвета множителя: зелёный → жёлтый → красный
function crashColor(v, alpha = 1) {
    const t = Math.min(Math.max((v - 1) / 9, 0), 1); // 1x → 0, 10x+ → 1
    const hue = 140 - t * 140; // 140 (зелёный) → 0 (красный)
    return `hsla(${hue}, 85%, 62%, ${alpha})`;
}

function drawCrashChart() {
    const ctx = crash.ctx;
    const canvas = crash.canvas;
    const data = crash.chartData || [];
    const d = crash.dom;

    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (data.length < 1) data.push(1.00);

    const maxVal = Math.max(...data, 2);
    const topOffset = 16;
    const bottomOffset = 12;
    const availableHeight = h - topOffset - bottomOffset;
    // Логарифмическая шкала: плавный рост и на x1.2, и на x10
    const maxLog = Math.log(maxVal * 1.15);
    const scaleY = availableHeight / maxLog;
    const scaleX = (w - 30) / Math.max(data.length - 1, 1);

    const isCrashed = crash.phase === 'crashed' || crash.phase === 'crash';
    const currentVal = data[data.length - 1] || 1.00;
    const lineColor = isCrashed ? '#f87171' : crashColor(currentVal);

    const pointXY = (val, i) => {
        const x = 12 + i * scaleX;
        const y = h - bottomOffset - (Math.log(Math.max(val, 1)) * scaleY);
        return [x, y];
    };

    // Градиентная заливка под кривой (зелёный → жёлтый → красный по мере роста)
    const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isCrashed) {
        fillGrad.addColorStop(0, 'rgba(248,113,113,0.35)');
        fillGrad.addColorStop(1, 'rgba(248,113,113,0.02)');
    } else {
        fillGrad.addColorStop(0, crashColor(Math.max(currentVal, 4), 0.30));
        fillGrad.addColorStop(0.5, crashColor(Math.max(currentVal, 2), 0.18));
        fillGrad.addColorStop(1, crashColor(1, 0.03));
    }

    ctx.beginPath();
    data.forEach((val, i) => {
        const [x, y] = pointXY(val, i);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    const [lastX, lastY] = pointXY(data[data.length - 1], data.length - 1);
    ctx.save();
    ctx.lineTo(lastX, h - bottomOffset);
    ctx.lineTo(12, h - bottomOffset);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    // Сама кривая
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 14;
    data.forEach((val, i) => {
        const [x, y] = pointXY(val, i);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Точка-ракета на конце кривой (или взрыв при краше)
    if (isCrashed) {
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', lastX, lastY);
    } else if (crashRocketImg.complete && crashRocketImg.naturalWidth > 0) {
        const size = 30;
        ctx.save();
        ctx.translate(lastX, lastY);
        ctx.rotate(Math.PI / 4); // нос вверх-вправо по направлению роста
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 16;
        ctx.drawImage(crashRocketImg, -size / 2, -size / 2, size, size);
        ctx.restore();
    } else {
        ctx.beginPath();
        ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    if (d.multiplier) {
        d.multiplier.textContent = `x${currentVal.toFixed(2)}`;
        d.multiplier.style.color = lineColor;
        d.multiplier.style.textShadow = `0 0 30px ${isCrashed ? 'rgba(248,113,113,0.5)' : crashColor(currentVal, 0.45)}`;
        d.multiplier.style.transform = 'scale(1)';
        d.multiplier.style.transition = 'none';
    }
    if (d.multiplierDisplay) {
        d.multiplierDisplay.textContent = `x${currentVal.toFixed(2)}`;
    }
    if (d.progress) {
        d.progress.style.width = Math.min((currentVal / 12) * 100, 100) + '%';
    }
    if (d.potential && crash.bet > 0) {
        const potential = Math.floor(crash.bet * currentVal * 0.95);
        d.potential.innerHTML = potential + ' ' + starIcon(13);
        d.potential.style.color = potential > crash.bet * 2 ? '#4ade80' : '#e8c76a';
    }
}

function updateCrashChart(multiplier) {
    crash.chartData.push(multiplier);
    if (crash.chartData.length > 200) crash.chartData.shift();
    drawCrashChart();
}

function resetCrashChart() {
    crash.chartData = [];
    drawCrashChart();
    const d = crash.dom;
    if (d.multiplier) {
        d.multiplier.textContent = 'x1.00';
        d.multiplier.style.color = '#4ade80';
        d.multiplier.style.transform = 'scale(1)';
        d.multiplier.style.transition = 'none';
        d.multiplier.classList.remove('gc-crash-num');
    }
    if (d.progress) d.progress.style.width = '0%';
    if (d.potential) d.potential.innerHTML = '0 ' + starIcon(13);
}

function startCrashPolling() {
    if (crash.interval) clearInterval(crash.interval);

    crash.interval = setInterval(() => {
        apiRequest('/crash_status', {}, 1, 4000).then(status => {
            if (!status || status.error) return;

            const prevPhase = crash.phase;
            crash.phase = status.phase;
            crash.multiplier = status.multiplier;

            const d = crash.dom;
            if (!d || !d.startBtn) return;

            if (status.phase === 'preview') {
                updateCrashChart(status.multiplier);
                if (d.countdown) d.countdown.style.display = 'none';
                if (d.status) d.status.textContent = '';
                d.startBtn.textContent = '💰 СДЕЛАТЬ СТАВКУ';
                d.startBtn.style.display = 'inline-block';
                d.startBtn.disabled = true;
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                if (d.timer) d.timer.textContent = '';
                updateCrashBetPanel();
            }

            else if (status.phase === 'waiting') {
                // Во время 3-секундного показа краха НЕ сбрасываем красное число
                if (d.multiplier && !inCrashHold()) {
                    d.multiplier.textContent = 'x1.00';
                    d.multiplier.style.color = '#4ade80';
                    d.multiplier.classList.remove('gc-crash-num');
                }
                if (d.status && !inCrashHold()) d.status.textContent = '⏳ Окно ставок';
                if (d.countdown) {
                    d.countdown.style.display = 'flex';
                    const secs = Math.ceil(status.waiting_time || 0);
                    if (d.countdown.textContent !== String(secs)) {
                        d.countdown.textContent = secs;
                        d.countdown.classList.remove('gc-countdown-pop');
                        void d.countdown.offsetWidth;
                        d.countdown.classList.add('gc-countdown-pop');
                    }
                }
                if (d.timer) {
                    d.timer.textContent = `до старта: ${Math.ceil(status.waiting_time || 0)} сек`;
                    d.timer.style.color = '#e8c76a';
                }
                d.startBtn.textContent = '💰 СДЕЛАТЬ СТАВКУ';
                d.startBtn.style.display = 'inline-block';
                d.startBtn.disabled = false;
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                if (d.progress) d.progress.style.width = '0%';
                updateCrashBetPanel();
            }

            else if (status.phase === 'active') {
                if (prevPhase !== 'active') resetCrashChart();
                if (d.countdown) d.countdown.style.display = 'none';
                updateCrashChart(status.multiplier);
                if (d.status) d.status.textContent = '🔥 ИГРА ИДЁТ';
                d.startBtn.style.display = 'none';
                if (crash.hasBet && d.cashoutBtn) {
                    d.cashoutBtn.style.display = 'inline-block';
                    d.cashoutBtn.disabled = false;
                    d.cashoutBtn.textContent = '💰 ЗАБРАТЬ';
                } else if (d.cashoutBtn) {
                    d.cashoutBtn.style.display = 'none';
                }
                if (d.timer) d.timer.textContent = '';
                updateCrashBetPanel();
            }

            else if (status.phase === 'crashed' || status.phase === 'crash') {
                const justCrashed = prevPhase !== 'crashed' && prevPhase !== 'crash';
                if (d.status) d.status.textContent = `💥 КРАШ на x${(status.multiplier || 1).toFixed(2)}`;
                if (d.countdown) d.countdown.style.display = 'none';
                // Красная вспышка + тряска графика (только в момент перехода)
                if (justCrashed) {
                    crash.crashedAt = Date.now(); // красное число держим минимум 3 сек
                    updateCrashChart(status.multiplier || crash.multiplier || 1);
                    const chart = document.getElementById('gc_chart');
                    if (chart) {
                        chart.classList.remove('gc-crash-flash', 'gc-crash-shake');
                        void chart.offsetWidth;
                        chart.classList.add('gc-crash-flash', 'gc-crash-shake');
                    }
                    if (d.multiplier) {
                        d.multiplier.style.color = '#f87171';
                        d.multiplier.style.fontWeight = '900';
                        d.multiplier.style.textShadow = '0 0 40px rgba(248,113,113,0.6)';
                        d.multiplier.classList.remove('gc-crash-num');
                        void d.multiplier.offsetWidth;
                        d.multiplier.classList.add('gc-crash-num');
                    }
                }
                if (crash.hasBet) {
                    // Ставка не была забрана до краша — проигрыш (учитывается сервером)
                    const lostBet = crash.bet;
                    crash.hasBet = false;
                    crash.bet = 0;
                    if (d.betDisplay) d.betDisplay.textContent = '0';
                    loadBalance();
                    loadCrashStats();
                    if (lostBet > 0 && justCrashed) {
                        const cp = (status.multiplier || 1).toFixed(2);
                        // Окно проигрыша — ПОСЛЕ 3-секундного показа красного числа
                        setTimeout(() => {
                            const c = document.getElementById('crashGameContainer');
                            if (!c || c.style.display === 'none') return; // игрок ушёл с экрана краша
                            createResultOverlay({
                                id: 'crashResultOverlay',
                                kind: 'lose',
                                icon: '💥',
                                iconImg: 'lose_icon',
                                title: 'КРАШ!',
                                amount: -lostBet,
                                subtitle: `Ракета упала на x${cp}. Ставка ${lostBet} ${starIcon(15)} потеряна.`,
                                buttons: [
                                    { label: '🔄 ЕЩЁ РАЗ', cls: 'btn-primary', onClick: () => { const o = document.getElementById('crashResultOverlay'); if (o) o.remove(); } },
                                    { label: '🔙 НАЗАД', cls: 'btn-ghost', onClick: () => { const o = document.getElementById('crashResultOverlay'); if (o) o.remove(); } }
                                ]
                            });
                        }, 3000);
                    }
                }
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                d.startBtn.style.display = 'inline-block';
                d.startBtn.disabled = true;
                updateCrashBetPanel();
            }
        });
    }, 150);
}

async function cashoutCrash() {
    const data = await apiRequest('/cashout_crash', {});
    if (data.error) {
        showCustomAlert('❌ ' + data.error);
        return;
    }

    const win = data.win !== undefined ? data.win : data.winnings;
    const mult = data.multiplier !== undefined ? `x${data.multiplier}` : '';

    crash.hasBet = false;
    crash.bet = 0;
    if (crash.dom.betDisplay) crash.dom.betDisplay.textContent = '0';
    if (crash.dom.cashoutBtn) crash.dom.cashoutBtn.style.display = 'none';
    updateCrashBetPanel();

    if (data.balance !== undefined) updateAllBalances(data.balance);
    else loadBalance();
    loadCrashStats();

    createResultOverlay({
        id: 'crashResultOverlay',
        kind: 'win',
        icon: '💰',
        iconImg: 'win_cup',
        title: 'ВЫИГРЫШ!',
        amount: win,
        subtitle: mult ? `Забрано на ${mult}` : '',
        buttons: [
            { label: '👍 ОТЛИЧНО', cls: 'btn-primary', onClick: () => { const o = document.getElementById('crashResultOverlay'); if (o) o.remove(); } }
        ],
        confetti: (win || 0) >= 500,
        confettiCount: 30
    });
}

function loadCrashStats() {
    apiRequest('/get_crash_stats', {}, 1).then(data => {
        const d = crash.dom;
        if (!d) return;
        if (d.games) d.games.textContent = data.games || 0;
        if (d.wins) d.wins.textContent = data.wins || 0;
        if (d.losses) d.losses.textContent = data.losses || 0;
        if (d.best) d.best.textContent = 'x' + (data.best_multiplier || 1.0);
    });
}

// ===== МИНЁР =====
// Поле НЕ отдаётся клиенту: сервер решает safe/mine на каждой клетке
let gameMinesData = null;
let gameMinesSelected = 4;

function showMinesGame() {
    const menu = document.getElementById('gamesMenu');
    const container = document.getElementById('minesGameContainer');

    if (!menu || !container) {
        showCustomAlert('❌ Ошибка загрузки игры');
        return;
    }

    if (crash.interval) {
        clearInterval(crash.interval);
        crash.interval = null;
    }

    menu.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="game-screen-title" style="font-size:20px; font-weight:800; color:#f87171; display:flex; align-items:center; gap:8px;"><img src="assets/icon_mines.png" class="ic" style="width:26px;height:26px;" alt="💣" onerror="this.outerHTML='💣'"> МИНЁР</div>
        </div>
        <div style="color:#8b8798; font-size:14px; text-align:center; margin-bottom:12px;">Открывайте клетки, избегайте мин и забирайте выигрыш!</div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:12px;">
            <span style="font-size:14px; color:#888;">Игр: <b id="gm_games" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Побед: <b id="gm_wins" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Поражений: <b id="gm_losses" style="color:#fff;">0</b></span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px; max-width:400px; margin:0 auto 16px;" id="gm_board"></div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:16px;">
            <div style="color:#aaa; font-size:14px;">Ставка: <b id="gm_bet_display" style="color:#fff;">0</b> ${starIcon(13)}</div>
            <div style="color:#aaa; font-size:14px;">Мин: <b id="gm_count_display" style="color:#fff;">0</b></div>
            <div style="color:#aaa; font-size:14px;">Множитель: <b id="gm_multiplier_display" style="color:#e8c76a;">x1.0</b></div>
            <div style="color:#aaa; font-size:14px; grid-column:span 3;">Открыто: <b id="gm_opened_display" style="color:#4ade80;">0</b> / <span id="gm_total_safe">0</span></div>
        </div>
        <div style="margin-bottom:12px;">
            <div style="color:#aaa; font-size:14px; margin-bottom:6px;">Ставка (3-1000 ${starIcon(13)}):</div>
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
        <button id="gm_start_btn" style="width:100%; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#be403c,#96302e); color:#fff; font-weight:800; font-size:18px; cursor:pointer;">🎮 НАЧАТЬ ИГРУ</button>
        <button id="gm_cashout_btn" style="display:none; width:100%; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#e8c76a,#c89a3e); color:#241a05; font-weight:800; font-size:18px; cursor:pointer; margin-top:10px;">💰 ЗАБРАТЬ ВЫИГРЫШ (<span id="gm_cashout_amount">0</span> ${starIcon(15)})</button>
    `;

    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад';
    backBtn.className = 'btn-back';
    backBtn.style.marginTop = '12px';
    backBtn.onclick = function() {
        exitMinesIfActive();
        container.style.display = 'none';
        menu.style.display = 'flex';
    };
    container.appendChild(backBtn);

    setTimeout(() => initGameMines(), 50);
}

function buildMinesBoard() {
    const board = document.getElementById('gm_board');
    if (!board) return;
    board.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'gm_cell';
        cell.dataset.index = i;
        cell.onclick = () => openGameMinesCell(i);
        board.appendChild(cell);
    }
}

function initGameMines() {
    buildMinesBoard();

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

    loadMinesStats();
}

function loadMinesStats() {
    apiRequest('/get_mines_stats', {}, 1).then(data => {
        if (!data || data.error) return;
        const games = document.getElementById('gm_games');
        const wins = document.getElementById('gm_wins');
        const losses = document.getElementById('gm_losses');
        if (games) games.textContent = data.games || 0;
        if (wins) wins.textContent = data.wins || 0;
        if (losses) losses.textContent = data.losses || 0;
    });
}

function startGameMines() {
    if (gameMinesData && gameMinesData.active) {
        showCustomAlert('⏳ Игра уже идёт! Заберите выигрыш или взорвитесь 💣');
        return;
    }

    const betInput = document.getElementById('gm_bet_input');
    const bet = parseInt(betInput ? betInput.value : 100);
    const mines = gameMinesSelected;

    if (bet < 3 || bet > 1000) {
        showCustomAlert('❌ Ставка должна быть от 3 до 1000⭐');
        return;
    }
    if (mines < 3 || mines > 8) {
        showCustomAlert('❌ Мин должно быть от 3 до 8');
        return;
    }

    // Старт новой игры: стираем старое раскрытое поле и строим чистую доску
    gameMinesData = null;
    buildMinesBoard();

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
                bet: bet,
                mines: mines,
                opened: 0,
                multiplier: 1.0,
                openedCells: new Array(25).fill(0), // 0=закрыта, 1=💎, 2=💣
                active: true,
                game_over: false
            };

            if (gameData.balance !== undefined) updateAllBalances(gameData.balance);
            else loadBalance();

            document.getElementById('gm_bet_display').textContent = bet;
            document.getElementById('gm_count_display').textContent = mines;
            document.getElementById('gm_total_safe').textContent = 25 - mines;
            document.getElementById('gm_opened_display').textContent = '0';
            document.getElementById('gm_multiplier_display').textContent = 'x1.0';
            document.getElementById('gm_cashout_btn').style.display = 'inline-block';
            document.getElementById('gm_cashout_amount').textContent = bet;
            document.getElementById('gm_start_btn').textContent = '🔄 НОВАЯ ИГРА';

            buildMinesBoard();
        });
    });
}

function renderGameMinesBoard() {
    const board = document.getElementById('gm_board');
    if (!board || !gameMinesData) return;
    const cells = board.querySelectorAll('.gm_cell');

    cells.forEach((cell, i) => {
        const v = gameMinesData.openedCells[i];
        // Сохраняем анимационные классы flip
        const animSafe = cell.classList.contains('gm-cell-safe') ? ' gm-cell-safe' : '';
        const animMine = cell.classList.contains('gm-cell-mine') ? ' gm-cell-mine' : '';
        if (v === 1) {
            cell.className = 'gm_cell gm-open gm-safe' + animSafe;
            cell.innerHTML = icon('gem', 34, 'gm-cell-img', '💎');
            cell.onclick = null;
        } else if (v === 2) {
            cell.className = 'gm_cell gm-open gm-mine' + animMine;
            cell.innerHTML = icon('mine', 34, 'gm-cell-img', '💣');
            cell.onclick = null;
        } else {
            cell.className = 'gm_cell';
            cell.textContent = '';
            cell.onclick = gameMinesData.active ? () => openGameMinesCell(i) : null;
        }
    });
}

// Раскрытие поля после конца игры: мины — красные, остальные — приглушённые зелёные
function revealMinesBoard(minesPositions, done) {
    const finish = () => { if (done) done(); };
    if (!gameMinesData || !Array.isArray(minesPositions)) {
        setTimeout(finish, 350);
        return;
    }
    const board = document.getElementById('gm_board');
    if (!board) { finish(); return; }

    const minesSet = new Set(minesPositions);
    const cells = board.querySelectorAll('.gm_cell');
    cells.forEach((cell, i) => {
        cell.onclick = null;
        setTimeout(() => {
            if (!document.body.contains(cell)) return;
            if (gameMinesData.openedCells[i] === 1) return; // уже открытый алмаз — оставляем ярким
            if (minesSet.has(i)) {
                if (gameMinesData.openedCells[i] !== 2) {
                    gameMinesData.openedCells[i] = 2;
                    cell.innerHTML = icon('mine', 28, 'gm-cell-img', '💣');
                }
                cell.classList.add('gm-reveal-mine');
            } else {
                cell.innerHTML = icon('gem', 26, 'gm-cell-img', '💎');
                cell.classList.add('gm-reveal-safe');
            }
        }, 120 + i * 35);
    });
    setTimeout(finish, 120 + 25 * 35 + 450);
}

function openGameMinesCell(index) {
    if (!gameMinesData || !gameMinesData.active || gameMinesData.game_over) return;
    if (gameMinesData.openedCells[index] !== 0) return;

    apiRequest('/open_mines_cell', {
        game_id: gameMinesData.game_id,
        cell: index
    }).then(data => {
        if (!gameMinesData) return;
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }

        const cellEl = document.querySelector(`.gm_cell[data-index="${index}"]`);

        if (data.status === 'safe') {
            gameMinesData.openedCells[index] = 1;
            gameMinesData.opened++;
            if (data.multiplier !== undefined) gameMinesData.multiplier = data.multiplier;

            document.getElementById('gm_opened_display').textContent = gameMinesData.opened;

            const multEl = document.getElementById('gm_multiplier_display');
            multEl.textContent = 'x' + gameMinesData.multiplier;
            // Плавный "поп" роста множителя
            multEl.classList.remove('stat-pop');
            void multEl.offsetWidth;
            multEl.classList.add('stat-pop');

            renderGameMinesBoard();
            // Анимация переворота + зелёная вспышка на конкретной клетке
            if (cellEl) cellEl.classList.add('gm-cell-safe');
            updateGameMinesCashout();

            // Открыты ВСЕ безопасные клетки — полный выигрыш
            if (data.game_over && data.won) {
                gameMinesData.active = false;
                gameMinesData.game_over = true;
                document.getElementById('gm_cashout_btn').style.display = 'none';
                if (data.balance !== undefined) updateAllBalances(data.balance);
                else loadBalance();
                const winAmount = data.winnings !== undefined ? data.winnings : Math.floor(gameMinesData.bet * gameMinesData.multiplier);
                const mult = gameMinesData.multiplier;
                const positions = Array.isArray(data.mines_positions) ? data.mines_positions : null;
                revealMinesBoard(positions, () => showMinesResult(true, winAmount, mult));
                loadMinesStats();
            }
        } else if (data.status === 'mine') {
            gameMinesData.openedCells[index] = 2;
            gameMinesData.active = false;
            gameMinesData.game_over = true;
            document.getElementById('gm_cashout_btn').style.display = 'none';

            // Красная вспышка + тряска на мине
            if (cellEl) cellEl.classList.add('gm-cell-mine');
            const board = document.getElementById('gm_board');
            if (board) {
                board.classList.remove('gm-board-shake');
                void board.offsetWidth;
                board.classList.add('gm-board-shake');
            }

            renderGameMinesBoard();

            if (data.balance !== undefined) updateAllBalances(data.balance);
            else loadBalance();

            const lostBet = gameMinesData.bet;
            const positions = Array.isArray(data.mines_positions) ? data.mines_positions : null;
            revealMinesBoard(positions, () => showMinesResult(false, lostBet));
            loadMinesStats();
        }
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
        renderGameMinesBoard();

        if (data.balance !== undefined) updateAllBalances(data.balance);
        else loadBalance();

        const win = data.win !== undefined ? data.win : data.winnings;
        const mult = gameMinesData.multiplier;
        const positions = Array.isArray(data.mines_positions) ? data.mines_positions : null;
        revealMinesBoard(positions, () => showMinesResult(true, win, mult));
        loadMinesStats();
    });
}

function exitMinesIfActive() {
    if (gameMinesData && gameMinesData.active && !gameMinesData.game_over) {
        apiRequest('/exit_mines', { game_id: gameMinesData.game_id }, 1);
        gameMinesData.active = false;
        gameMinesData.game_over = true;
        loadBalance();
    }
}

function updateGameMinesCashout() {
    if (!gameMinesData) return;
    const amount = Math.floor(gameMinesData.bet * gameMinesData.multiplier);
    document.getElementById('gm_cashout_amount').textContent = amount;
}

function showMinesResult(isWin, amount, multiplier = 1) {
    if (!gameMinesData) {
        showCustomAlert('⚠️ Ошибка: игра не найдена');
        return;
    }

    createResultOverlay({
        id: 'minesResultOverlay',
        kind: isWin ? 'win' : 'lose',
        icon: isWin ? '💰' : '💥',
        iconImg: isWin ? 'win_cup' : 'lose_icon',
        title: isWin ? 'ВЫИГРЫШ!' : 'ВЗРЫВ!',
        amount: amount,
        subtitle: isWin
            ? `Множитель x${Number(multiplier).toFixed(2)}`
            : 'Ты наступил на мину. Ставка потеряна.',
        buttons: [
            { label: '🔄 ИГРАТЬ СНОВА', cls: 'btn-primary', onClick: () => { closeMinesResult(); resetGameMines(); } },
            { label: '🔙 НАЗАД', cls: 'btn-ghost', onClick: () => { closeMinesResult(); resetGameMines(); } }
        ],
        confetti: isWin && amount >= 500,
        confettiCount: 30
    });
}

function closeMinesResult() {
    const overlay = document.getElementById('minesResultOverlay');
    if (overlay) overlay.remove();
}

function resetGameMines() {
    // Поле НЕ очищаем и gameMinesData НЕ обнуляем:
    // раскрытые мины/клетки остаются видимыми за setup-панелью.
    // Доска стирается только при старте новой игры (startGameMines).
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    setText('gm_bet_display', '0');
    setText('gm_count_display', '0');
    setText('gm_total_safe', '0');
    setText('gm_opened_display', '0');
    setText('gm_multiplier_display', 'x1.0');
    const cashoutBtn = document.getElementById('gm_cashout_btn');
    if (cashoutBtn) cashoutBtn.style.display = 'none';
    const startBtn = document.getElementById('gm_start_btn');
    if (startBtn) startBtn.textContent = '🎮 НАЧАТЬ ИГРУ';
    const betInput = document.getElementById('gm_bet_input');
    if (betInput) betInput.disabled = false;
}

// ===== АПГРЕЙД =====
// Результат решает ТОЛЬКО сервер (/upgrade_execute), фронт анимирует
let upgradeChanceTimer = null;

function showUpgradeGame() {
    const menu = document.getElementById('gamesMenu');
    const container = document.getElementById('upgradeGameContainer');

    if (!menu || !container) {
        showCustomAlert('❌ Ошибка загрузки игры');
        return;
    }

    exitMinesIfActive();
    if (crash.interval) {
        clearInterval(crash.interval);
        crash.interval = null;
    }

    menu.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div class="game-screen-title" style="font-size:20px; font-weight:800; color:#e8c76a; display:flex; align-items:center; gap:8px;"><img src="assets/icon_upgrade.png" class="ic" style="width:26px;height:26px;" alt="⚡" onerror="this.outerHTML='⚡'"> АПГРЕЙД</div>
        </div>
        <div class="balance-card" style="margin-bottom:12px; padding:14px 18px;">
            <span class="balance-label">Баланс</span>
            <span class="balance-value" id="gu_balance">0 ${starIcon(18)}</span>
        </div>
        <div id="gu_input_section">
            <div style="margin-bottom:12px;">
                <div style="color:#aaa; font-size:14px; margin-bottom:6px;">📤 СТАВКА (1–1000 ${starIcon(13)})</div>
                <input type="number" id="gu_bet" min="1" max="1000" value="10" style="width:100%; padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
            </div>
            <div style="margin-bottom:12px;">
                <div style="color:#aaa; font-size:14px; margin-bottom:6px;">🎯 ЦЕЛЬ (от {bet+1} до 2000 ${starIcon(13)})</div>
                <input type="number" id="gu_target" min="2" max="2000" value="15" style="width:100%; padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
            </div>
            <div class="game-panel" style="border-radius:16px; padding:14px; margin-bottom:16px; text-align:center;">
                <div style="color:#aaa; font-size:14px;">Шанс на успех:</div>
                <div style="font-size:28px; font-weight:900; color:#4ade80;" id="gu_chance">0%</div>
            </div>
            <button id="gu_btn" style="width:100%; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#34a86c,#228050); color:#fff; font-weight:800; font-size:18px; cursor:pointer;">⚡ АПГРЕЙДНУТЬ</button>
        </div>
        <div id="gu_animation_section" style="display:none; text-align:center;">
            <canvas id="gu_wheel" width="400" height="400" style="width:100%; max-width:340px; aspect-ratio:1; margin:0 auto 16px; border-radius:50%; box-shadow:0 0 60px rgba(74,222,128,0.12);"></canvas>
            <div id="gu_result" style="font-size:18px; font-weight:700; min-height:30px;"></div>
            <button id="gu_again_btn" onclick="resetGameUpgrade()" style="display:none; width:100%; padding:14px; border:none; border-radius:14px; background:linear-gradient(135deg,#34a86c,#228050); color:#fff; font-weight:700; cursor:pointer; margin-top:12px;">🔄 ЕЩЁ РАЗ</button>
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

    setTimeout(() => initGameUpgrade(), 50);
}

function initGameUpgrade() {
    loadGameUpgradeBalance();
    updateGameUpgradeChance();

    document.getElementById('gu_bet').addEventListener('input', updateGameUpgradeChance);
    document.getElementById('gu_target').addEventListener('input', updateGameUpgradeChance);
    document.getElementById('gu_btn').onclick = startGameUpgrade;
}

function loadGameUpgradeBalance() {
    apiRequest('/get_balance', {}, 1).then(data => {
        if (data.balance !== undefined) {
            const el = document.getElementById('gu_balance');
            if (el) el.innerHTML = data.balance + ' ' + starIcon(18);
        }
    });
}

// Шанс считает сервер (/upgrade_calculate); локальная формула — запасной вариант
function updateGameUpgradeChance() {
    const betEl = document.getElementById('gu_bet');
    const targetEl = document.getElementById('gu_target');
    const chanceEl = document.getElementById('gu_chance');
    if (!betEl || !targetEl || !chanceEl) return;

    const bet = parseInt(betEl.value) || 1;
    const target = parseInt(targetEl.value) || bet + 1;

    if (target <= bet) {
        chanceEl.textContent = '0%';
        return;
    }

    const localChance = Math.min(Math.max((bet / target) * 100, 1), 70);
    chanceEl.textContent = localChance.toFixed(2) + '%';

    if (upgradeChanceTimer) clearTimeout(upgradeChanceTimer);
    upgradeChanceTimer = setTimeout(() => {
        apiRequest('/upgrade_calculate', { bet, target }, 1).then(data => {
            if (data && data.chance !== undefined) {
                const el = document.getElementById('gu_chance');
                if (el) el.textContent = Number(data.chance).toFixed(2) + '%';
            }
        });
    }, 350);
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

    const btn = document.getElementById('gu_btn');
    if (btn) btn.disabled = true;

    // Сервер решает результат и списывает/начисляет звёзды
    apiRequest('/upgrade_execute', { bet, target }).then(data => {
        if (btn) btn.disabled = false;
        if (data.error) {
            showCustomAlert('❌ ' + data.error);
            return;
        }

        document.getElementById('gu_input_section').style.display = 'none';
        document.getElementById('gu_animation_section').style.display = 'block';
        document.getElementById('gu_result').textContent = '';
        document.getElementById('gu_again_btn').style.display = 'none';

        startGameUpgradeAnimation(data);
    });
}

function startGameUpgradeAnimation(data) {
    const canvas = document.getElementById('gu_wheel');
    const ctx = canvas.getContext('2d');
    const centerX = 200;
    const centerY = 200;
    const radius = 175;

    const isWin = data.result === 'win';
    const chance = Math.min(Math.max(Number(data.chance) || 1, 1), 99);
    const successChance = chance / 100;
    // Цвет дуги по величине шанса
    const chanceColor = chance >= 50 ? '#4ade80' : chance >= 25 ? '#e8c76a' : '#f87171';

    // Конечный угол стрелки — внутри сектора результата, который решил сервер
    let targetNorm;
    if (isWin) {
        targetNorm = Math.PI * 2 * successChance * (0.25 + Math.random() * 0.5);
    } else {
        targetNorm = Math.PI * 2 * successChance + Math.PI * 2 * (1 - successChance) * (0.15 + Math.random() * 0.7);
    }
    const startAngle = 0;
    const totalRotation = Math.PI * 2 * 5 + targetNorm;
    const duration = 4500;
    let startTime = null;
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
        backdropFilter: 'blur(10px)'
    });
    document.body.appendChild(skipBtn);

    function drawWheel(angle) {
        ctx.clearRect(0, 0, 400, 400);

        const gradGreen = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradGreen.addColorStop(0, '#5fbf7f');
        gradGreen.addColorStop(0.5, '#4aa869');
        gradGreen.addColorStop(1, '#2e7d4c');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2 * successChance);
        ctx.closePath();
        ctx.fillStyle = gradGreen;
        ctx.shadowColor = 'rgba(74, 222, 128, 0.35)';
        ctx.shadowBlur = 30;
        ctx.fill();

        const gradRed = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradRed.addColorStop(0, '#e06058');
        gradRed.addColorStop(0.5, '#c94f48');
        gradRed.addColorStop(1, '#a03834');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, Math.PI * 2 * successChance, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = gradRed;
        ctx.shadowColor = 'rgba(248, 113, 113, 0.35)';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Дуга вероятности цветом шанса
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * successChance);
        ctx.strokeStyle = chanceColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.shadowColor = chanceColor;
        ctx.shadowBlur = 18;
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

        // Стрелка
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -radius + 10);
        ctx.lineTo(-16, -radius + 44);
        ctx.lineTo(16, -radius + 44);
        ctx.closePath();
        ctx.fillStyle = '#e8c76a';
        ctx.shadowColor = '#e8c76a';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        const gradCenter = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 62);
        gradCenter.addColorStop(0, 'rgba(20,17,30,0.95)');
        gradCenter.addColorStop(1, 'rgba(20,17,30,0.75)');
        ctx.beginPath();
        ctx.arc(centerX, centerY, 62, 0, Math.PI * 2);
        ctx.fillStyle = gradCenter;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, 62, 0, Math.PI * 2);
        ctx.strokeStyle = chanceColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Процент крупно в центре колеса
        ctx.font = 'bold 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = chanceColor;
        ctx.shadowColor = chanceColor;
        ctx.shadowBlur = 22;
        ctx.fillText((chance < 10 ? chance.toFixed(1) : Math.round(chance)) + '%', centerX, centerY - 8);
        ctx.shadowBlur = 0;
        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillText('ШАНС', centerX, centerY + 26);
    }

    function finishUpgrade() {
        if (finished) return;
        finished = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        skipBtn.remove();

        drawWheel(startAngle + totalRotation);

        // Свечение выигрышного сектора (результат решён сервером заранее)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        if (isWin) {
            ctx.arc(0, 0, radius, 0, Math.PI * 2 * successChance);
        } else {
            ctx.arc(0, 0, radius, Math.PI * 2 * successChance, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fillStyle = isWin ? 'rgba(120,255,170,0.22)' : 'rgba(255,120,120,0.16)';
        ctx.shadowColor = isWin ? '#4ade80' : '#f87171';
        ctx.shadowBlur = 55;
        ctx.fill();
        ctx.restore();

        // Подсветка кольца результата
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isWin ? '#4ade80' : '#f87171';
        ctx.lineWidth = 5;
        ctx.shadowColor = isWin ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)';
        ctx.shadowBlur = 40;
        ctx.stroke();
        ctx.restore();

        if (data.new_balance !== undefined) {
            updateAllBalances(data.new_balance);
            const balEl = document.getElementById('gu_balance');
            if (balEl) balEl.innerHTML = data.new_balance + ' ' + starIcon(18);
        } else {
            loadGameUpgradeBalance();
        }

        const againBtn = document.getElementById('gu_again_btn');
        if (againBtn) againBtn.style.display = 'block';

        setTimeout(() => {
            showGameUpgradeResult(data.result, data.message, data.new_balance);
        }, 700);
    }

    skipBtn.onclick = finishUpgrade;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function spin(timestamp) {
        if (finished) return;
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / duration, 1);
        const angle = startAngle + totalRotation * easeOutCubic(t);
        drawWheel(angle);

        if (t >= 1) {
            finishUpgrade();
            return;
        }
        animationId = requestAnimationFrame(spin);
    }

    drawWheel(0);
    setTimeout(() => {
        animationId = requestAnimationFrame(spin);
    }, 400);
}

function showGameUpgradeResult(result, message, newBalance) {
    const isWin = result === 'win';
    createResultOverlay({
        id: 'gameUpgradeResultOverlay',
        kind: isWin ? 'win' : 'lose',
        icon: isWin ? '🎉' : '💥',
        iconImg: isWin ? 'win_cup' : 'lose_icon',
        title: isWin ? 'УСПЕХ!' : 'ПРОВАЛ!',
        subtitle: message || '',
        balance: newBalance,
        buttons: [
            { label: '🔄 ЕЩЁ РАЗ', cls: 'btn-primary', onClick: () => { const o = document.getElementById('gameUpgradeResultOverlay'); if (o) o.remove(); resetGameUpgrade(); } },
            { label: '🔙 НАЗАД', cls: 'btn-ghost', onClick: () => { const o = document.getElementById('gameUpgradeResultOverlay'); if (o) o.remove(); resetGameUpgrade(); } }
        ],
        confetti: isWin,
        confettiCount: 30
    });
}

function resetGameUpgrade() {
    document.getElementById('gu_input_section').style.display = 'block';
    document.getElementById('gu_animation_section').style.display = 'none';
    document.getElementById('gu_result').textContent = '';
    loadGameUpgradeBalance();
    updateGameUpgradeChance();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
(function init() {
    try {
        tg.ready();
        if (tg.expand) tg.expand();

        const user = tg.initDataUnsafe?.user;
        if (user) {
            const name = user.first_name || user.username || 'Игрок';
            const usernameEl = document.getElementById('username');
            const profileNameEl = document.getElementById('profileName');
            if (usernameEl) usernameEl.textContent = name;
            if (profileNameEl) profileNameEl.textContent = name;
        }
    } catch (e) {
        console.warn('Telegram WebApp init error:', e);
    }

    loadBalance();
})();