const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;

if (!user_id) {
    tg.showAlert('❌ Ошибка: не удалось получить ID пользователя.');
}

let lastOpenedCase = null;
let _currentPrize = null;
let _isOpening = false;
let _tapeContainer = null;

const CASE_PRIZES = {
    'free': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 1000],
    'mud': [1, 2, 3, 4, 5, 6, 7, 10, 12, 13, 16, 18, 20, 22, 24, 27, 50, 500],
    'wood': [2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 20, 50, 100, 500, 1000, 10000],
    'stone': [11, 13, 15, 16, 17, 18, 19, 21, 23, 24, 25, 30, 50, 100, 250, 500, 1000, 2500, 25000],
    'bronze': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 75, 100, 222, 333, 444, 555, 1000, 1500, 2000, 5000],
    'silver': [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 200, 250, 333, 444, 555, 666, 777, 888, 999, 1488, 2011, 5000, 10000],
    'gold': [75, 100, 150, 169, 190, 220, 251, 300, 400, 500, 777, 999, 1000, 2000, 5000, 10000, 12500, 25000],
    'diamond': [250, 300, 333, 350, 444, 505, 1000, 1488, 2222, 2500, 5000, 10000, 12500, 25000, 50000],
    'netherite': [500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1500, 2000, 2500, 3000, 3200, 3500, 4000, 5000, 10000, 15000, 20000, 25000],
    'bedrock': [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2500, 2600, 2800, 3000, 3200, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 50000, 100000]
};

const CASE_PRICES = {
    'free': 0,
    'mud': 5,
    'wood': 9,
    'stone': 19,
    'bronze': 49,
    'silver': 99,
    'gold': 249,
    'diamond': 499,
    'netherite': 999,
    'bedrock': 2499
};

const CASE_STYLES = {
    'free': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(46,204,113,0.7)', titleColor: '#2ecc71', itemColor: '#6bcbff', highlightColor: '#ffd700', glowColor: 'rgba(46,204,113,0.3)', shadowColor: 'rgba(46,204,113,0.5)', icon: '🎁', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(46,204,113,0.08), transparent 70%)' },
    'mud': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(142,68,173,0.7)', titleColor: '#8e44ad', itemColor: '#c39bd3', highlightColor: '#ff6b6b', glowColor: 'rgba(142,68,173,0.3)', shadowColor: 'rgba(142,68,173,0.5)', icon: '🟫', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(142,68,173,0.08), transparent 70%)' },
    'wood': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(211,84,0,0.7)', titleColor: '#d35400', itemColor: '#f39c12', highlightColor: '#ffd700', glowColor: 'rgba(211,84,0,0.3)', shadowColor: 'rgba(211,84,0,0.5)', icon: '🌳', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(211,84,0,0.08), transparent 70%)' },
    'stone': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(127,140,141,0.7)', titleColor: '#7f8c8d', itemColor: '#bdc3c7', highlightColor: '#ffd700', glowColor: 'rgba(127,140,141,0.3)', shadowColor: 'rgba(127,140,141,0.5)', icon: '🪨', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(127,140,141,0.08), transparent 70%)' },
    'bronze': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(205,127,50,0.7)', titleColor: '#cd7f32', itemColor: '#f0c27f', highlightColor: '#ffd700', glowColor: 'rgba(205,127,50,0.3)', shadowColor: 'rgba(205,127,50,0.5)', icon: '🥉', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(205,127,50,0.08), transparent 70%)' },
    'silver': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(189,195,199,0.7)', titleColor: '#bdc3c7', itemColor: '#ecf0f1', highlightColor: '#ffd700', glowColor: 'rgba(189,195,199,0.3)', shadowColor: 'rgba(189,195,199,0.5)', icon: '🔘', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(189,195,199,0.08), transparent 70%)' },
    'gold': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(241,196,15,0.7)', titleColor: '#f1c40f', itemColor: '#f9e79f', highlightColor: '#ffd700', glowColor: 'rgba(241,196,15,0.4)', shadowColor: 'rgba(241,196,15,0.6)', icon: '👑', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(241,196,15,0.1), transparent 70%)' },
    'diamond': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(52,152,219,0.7)', titleColor: '#3498db', itemColor: '#85c1e9', highlightColor: '#00d4ff', glowColor: 'rgba(52,152,219,0.3)', shadowColor: 'rgba(52,152,219,0.5)', icon: '💎', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(52,152,219,0.08), transparent 70%)' },
    'netherite': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(44,62,80,0.7)', titleColor: '#e74c3c', itemColor: '#f1948a', highlightColor: '#ff6b35', glowColor: 'rgba(231,76,60,0.3)', shadowColor: 'rgba(231,76,60,0.5)', icon: '🔥', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(231,76,60,0.08), transparent 70%)' },
    'bedrock': { bg: 'rgba(0,0,0,0.95)', border: '3px solid rgba(52,73,94,0.7)', titleColor: '#5d6d7e', itemColor: '#aeb6bf', highlightColor: '#ffd700', glowColor: 'rgba(52,73,94,0.4)', shadowColor: 'rgba(52,73,94,0.6)', icon: '⛏️', bgGradient: 'radial-gradient(circle at 50% 50%, rgba(52,73,94,0.1), transparent 70%)' }
};

function getPrizes(type) { return CASE_PRIZES[type] || [1, 10, 100]; }
function getStyle(type) { return CASE_STYLES[type] || CASE_STYLES['free']; }
function getPrice(type) { return CASE_PRICES[type] || 0; }

async function loadBalance() {
    try {
        const res = await fetch('/get_balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id })
        });
        const data = await res.json();
        if (data.balance !== undefined) {
            document.getElementById('balance').textContent = '⭐ ' + data.balance;
            document.getElementById('balanceValue').textContent = data.balance + ' ⭐';
            document.getElementById('profileBalance').textContent = data.balance;
            document.getElementById('profileCases').textContent = data.total_cases;
            document.getElementById('profileStatus').textContent = data.status;
            document.getElementById('profileRefs').textContent = data.refs;
            document.getElementById('inviteLink').value = 'https://t.me/Randevucase_bot?start=' + user_id;
        }
    } catch(e) { console.error(e); }
}

async function checkBalance(type) {
    try {
        const res = await fetch('/check_balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, case_type: type })
        });
        const data = await res.json();
        if (data.error) {
            tg.showAlert('❌ ' + data.error);
            return false;
        }
        if (!data.can_open) {
            tg.showAlert('❌ Недостаточно звёзд или время не прошло!');
            return false;
        }
        return true;
    } catch(e) {
        tg.showAlert('❌ Ошибка проверки баланса');
        return false;
    }
}

async function fetchRealPrize(type) {
    try {
        const res = await fetch('/get_prize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ case_type: type })
        });
        const data = await res.json();
        if (data.error) {
            tg.showAlert('❌ ' + data.error);
            return null;
        }
        return data.prize;
    } catch(e) {
        tg.showAlert('❌ Ошибка получения награды');
        return null;
    }
}

// ===== ПРЕДПРОСМОТР (ТОЛЬКО ВПЕРЁД, 7.875С, БОЛЬШАЯ ЛЕНТА) =====
function previewCase(type) {
    if (_isOpening) return;
    closeTape();
    showPreviewTape(type);
}

function showPreviewTape(type) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    const price = getPrice(type);
    closeTape();

    const tapeContainer = document.createElement('div');
    tapeContainer.id = 'tapeContainer';
    _tapeContainer = tapeContainer;
    tapeContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${style.bg};
        background-image: ${style.bgGradient};
        backdrop-filter: blur(30px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 20px;
        border: none;
        animation: fadeIn 0.3s ease;
    `;

    if (!document.getElementById('tapeFadeStyle')) {
        const fadeStyle = document.createElement('style');
        fadeStyle.id = 'tapeFadeStyle';
        fadeStyle.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;
        document.head.appendChild(fadeStyle);
    }

    const title = document.createElement('div');
    title.style.cssText = `
        font-size: 24px;
        font-weight: 800;
        color: ${style.titleColor};
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-shadow: 0 0 40px ${style.glowColor};
        text-align: center;
        flex-shrink: 0;
    `;
    title.textContent = `${style.icon} ${type.toUpperCase()} CASE`;
    tapeContainer.appendChild(title);

    const balanceDisplay = document.createElement('div');
    balanceDisplay.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.08);
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 18px;
        font-weight: 700;
        color: #FFD700;
        border: 1px solid rgba(255,215,0,0.2);
        backdrop-filter: blur(10px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 10;
    `;
    balanceDisplay.textContent = `💰 ${document.getElementById('balance').textContent}`;
    tapeContainer.appendChild(balanceDisplay);

    const viewport = document.createElement('div');
    viewport.style.cssText = `
        width: 95%;
        max-width: 1300px;
        overflow: hidden;
        position: relative;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(0,0,0,0.3);
        height: 200px;
        margin: 0 auto;
        flex-shrink: 0;
    `;

    const cardWidth = 110;
    const cardGap = 8;
    const totalItems = prizes.length;
    const oneSetWidth = totalItems * (cardWidth + cardGap);

    const track = document.createElement('div');
    track.id = 'track';
    track.style.cssText = `
        display: flex;
        gap: ${cardGap}px;
        padding: 20px 0;
        will-change: transform;
        animation: scrollTapeForward 7.875s linear infinite;
        position: relative;
        top: 15px;
    `;

    let cards = [];
    for (let repeat = 0; repeat < 3; repeat++) {
        prizes.forEach((p, index) => {
            const isLarge = p > 1000;
            const fontSize = isLarge ? '18px' : '22px';
            cards.push(`<div class="card" data-value="${p}" style="
                width: ${cardWidth}px;
                height: 140px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.04);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.06);
                font-size: ${fontSize};
                font-weight: 700;
                color: ${style.itemColor};
                text-shadow: 0 0 20px ${style.glowColor};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 0 4px;
            ">${p}⭐</div>`);
        });
    }
    track.innerHTML = cards.join('');

    viewport.appendChild(track);

    if (!document.getElementById('previewScrollStyle')) {
        const scrollStyle = document.createElement('style');
        scrollStyle.id = 'previewScrollStyle';
        scrollStyle.textContent = `
            @keyframes scrollTapeForward {
                0% { transform: translateX(0); }
                100% { transform: translateX(-${oneSetWidth}px); }
            }
        `;
        document.head.appendChild(scrollStyle);
    }

    tapeContainer.appendChild(viewport);

    const bottomSection = document.createElement('div');
    bottomSection.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
        padding: 20px 0 8px 0;
        flex-shrink: 0;
    `;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `display:flex; gap:14px; flex-wrap:wrap; justify-content:center;`;

    const userBalance = parseInt(document.getElementById('balance').textContent.replace('⭐ ', ''));
    const hasEnough = userBalance >= price;

    if (hasEnough) {
        const openBtn = document.createElement('button');
        openBtn.textContent = `🎲 Открыть (${price}⭐)`;
        openBtn.style.cssText = `
            background: linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd);
            color: #fff;
            border: none;
            padding: 14px 40px;
            border-radius: 14px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 30px ${style.shadowColor};
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            min-width: 170px;
        `;
        openBtn.onclick = function() {
            openCaseDirect(type);
        };
        btnContainer.appendChild(openBtn);
    } else {
        const lockedBtn = document.createElement('button');
        lockedBtn.textContent = `🔒 Недостаточно (${price}⭐)`;
        lockedBtn.style.cssText = `
            background: rgba(255,0,0,0.12);
            color: #888;
            border: 2px solid rgba(255,0,0,0.25);
            padding: 14px 40px;
            border-radius: 14px;
            font-size: 18px;
            font-weight: 700;
            cursor: not-allowed;
            min-width: 170px;
        `;
        btnContainer.appendChild(lockedBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '🔙 Назад';
    closeBtn.style.cssText = `
        background: rgba(255,255,255,0.06);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.08);
        padding: 14px 40px;
        border-radius: 14px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 170px;
    `;
    closeBtn.onclick = function() { closeTape(); };
    btnContainer.appendChild(closeBtn);
    bottomSection.appendChild(btnContainer);

    const previewLabel = document.createElement('div');
    previewLabel.textContent = '👀 Предпросмотр наград';
    previewLabel.style.cssText = `
        color: ${style.titleColor};
        font-size: 14px;
        font-weight: 500;
        opacity: 0.5;
        text-align: center;
        letter-spacing: 1px;
        margin-top: 4px;
    `;
    bottomSection.appendChild(previewLabel);

    tapeContainer.appendChild(bottomSection);
    document.body.appendChild(tapeContainer);
}

// ===== ОТКРЫТИЕ КЕЙСА (С ИНДЕКСОМ И УМЕНЬШЕННЫМИ ПОЛЯМИ) =====
function openCaseDirect(type) {
    if (_isOpening) return;
    _isOpening = true;
    
    checkBalance(type).then(canOpen => {
        if (!canOpen) { _isOpening = false; return; }
        
        fetchRealPrize(type).then(prize => {
            if (prize === null) {
                _isOpening = false;
                return;
            }
            _currentPrize = prize;
            closeTape();
            showRouletteTape(type);
            setTimeout(() => {
                startFinalSpin(type);
            }, 300);
        });
    });
}

function showRouletteTape(type) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    closeTape();

    const tapeContainer = document.createElement('div');
    tapeContainer.id = 'tapeContainer';
    _tapeContainer = tapeContainer;
    tapeContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${style.bg};
        background-image: ${style.bgGradient};
        backdrop-filter: blur(30px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 20px;
        border: none;
        animation: fadeIn 0.3s ease;
    `;

    if (!document.getElementById('tapeFadeStyle')) {
        const fadeStyle = document.createElement('style');
        fadeStyle.id = 'tapeFadeStyle';
        fadeStyle.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;
        document.head.appendChild(fadeStyle);
    }

    const title = document.createElement('div');
    title.style.cssText = `
        font-size: 22px;
        font-weight: 800;
        color: ${style.titleColor};
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-shadow: 0 0 40px ${style.glowColor};
        text-align: center;
    `;
    title.textContent = `${style.icon} ${type.toUpperCase()} CASE`;
    tapeContainer.appendChild(title);

    const viewport = document.createElement('div');
    viewport.style.cssText = `
        width: 95%;
        max-width: 900px;
        overflow: hidden;
        position: relative;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(0,0,0,0.3);
        height: 220px;
        margin: 0 auto;
        flex-shrink: 0;
    `;

    const marker = document.createElement('div');
    marker.style.cssText = `
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 36px;
        color: ${style.highlightColor};
        text-shadow: 0 0 30px ${style.highlightColor};
        z-index: 10;
        pointer-events: none;
        line-height: 1;
    `;
    marker.textContent = '▼';
    viewport.appendChild(marker);

    const track = document.createElement('div');
    track.id = 'track';
    track.style.cssText = `
        display: flex;
        gap: 8px;
        padding: 20px 0;
        will-change: transform;
        transition: transform 6s cubic-bezier(0.1, 1, 0.1, 1);
        width: auto;
        position: relative;
        top: 20px;
    `;
    viewport.appendChild(track);
    tapeContainer.appendChild(viewport);

    const bottomSection = document.createElement('div');
    bottomSection.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
        padding: 16px 0 8px 0;
        flex-shrink: 0;
    `;

    const loadingLabel = document.createElement('div');
    loadingLabel.textContent = '🎰 Открытие...';
    loadingLabel.style.cssText = `
        color: ${style.titleColor};
        font-size: 16px;
        font-weight: 600;
        opacity: 0.6;
        text-align: center;
        letter-spacing: 1px;
    `;
    bottomSection.appendChild(loadingLabel);

    tapeContainer.appendChild(bottomSection);
    document.body.appendChild(tapeContainer);

    tapeContainer._track = track;
    tapeContainer._viewport = viewport;
    tapeContainer._marker = marker;
}

function startFinalSpin(type) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    const tapeContainer = document.getElementById('tapeContainer');
    if (!tapeContainer) return;

    const track = tapeContainer._track;
    const viewport = tapeContainer._viewport;

    const targetPrize = _currentPrize;
    if (targetPrize === null) {
        tg.showAlert('❌ Ошибка: награда не получена');
        closeTape();
        return;
    }

    // ===== УМЕНЬШЕННЫЕ ПОЛЯ =====
    const cardWidth = 120;
    const cardGap = 6;
    const totalCardWidth = cardWidth + cardGap;
    const totalCards = 60;
    const winPosition = 40;

    const prizeIndex = prizes.indexOf(targetPrize);
    if (prizeIndex === -1) {
        tg.showAlert('❌ Ошибка: награда не найдена в списке');
        closeTape();
        return;
    }

    let cards = [];
    for (let i = 0; i < totalCards; i++) {
        let value;
        if (i === winPosition) {
            value = targetPrize;
        } else {
            const randomIndex = Math.floor(Math.random() * prizes.length);
            value = prizes[randomIndex];
        }
        const isLarge = value > 1000;
        const fontSize = isLarge ? '22px' : '28px';
        cards.push(`<div class="card" data-value="${value}" style="
            width: ${cardWidth}px;
            height: 150px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.04);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.06);
            font-size: ${fontSize};
            font-weight: 700;
            color: ${style.itemColor};
            text-shadow: 0 0 20px ${style.glowColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transition: all 0.2s ease;
        ">${value}⭐</div>`);
    }
    track.innerHTML = cards.join('');

    const viewportWidth = viewport.offsetWidth || 700;
    const centerOffset = viewportWidth / 2;
    const shift = (winPosition * totalCardWidth) - centerOffset + (cardWidth / 2);
    const noise = Math.floor(Math.random() * 40) - 20;
    const finalShift = shift + noise;

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
        resultContainer.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 30px;
            animation: fadeIn 0.3s ease;
        `;

        const balanceDisplay = document.createElement('div');
        balanceDisplay.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.08);
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 700;
            color: #FFD700;
            border: 1px solid rgba(255,215,0,0.2);
            backdrop-filter: blur(10px);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        balanceDisplay.textContent = `💰 ${document.getElementById('balance').textContent}`;
        resultContainer.appendChild(balanceDisplay);

        const winText = document.createElement('div');
        winText.style.cssText = `
            font-size: 64px;
            font-weight: 900;
            color: #FFD700;
            text-shadow: 0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3);
            margin-bottom: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
        `;
        winText.textContent = `⭐ ${targetPrize}`;

        const subText = document.createElement('div');
        subText.style.cssText = `
            font-size: 24px;
            font-weight: 600;
            color: #FFF8E7;
            text-shadow: 0 0 20px rgba(255,215,0,0.3);
            margin-bottom: 30px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        subText.textContent = 'Ты выиграл!';

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = `
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            justify-content: center;
        `;

        const price = getPrice(type);
        const againBtn = document.createElement('button');
        againBtn.textContent = `🎲 Открыть ещё (${price}⭐)`;
        againBtn.style.cssText = `
            background: linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd);
            color: #fff;
            border: none;
            padding: 14px 36px;
            border-radius: 14px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 30px ${style.shadowColor};
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            min-width: 160px;
        `;
        againBtn.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = `0 6px 40px ${style.shadowColor}`;
        };
        againBtn.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = `0 4px 30px ${style.shadowColor}`;
        };
        againBtn.onclick = function() {
            resultContainer.remove();
            closeTape();
            setTimeout(() => {
                openCaseDirect(type);
            }, 300);
        };

        const backBtn = document.createElement('button');
        backBtn.textContent = '🔙 Назад';
        backBtn.style.cssText = `
            background: rgba(255,255,255,0.08);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 14px 36px;
            border-radius: 14px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 160px;
        `;
        backBtn.onmouseover = function() { this.style.background = 'rgba(255,255,255,0.15)'; };
        backBtn.onmouseout = function() { this.style.background = 'rgba(255,255,255,0.08)'; };
        backBtn.onclick = function() {
            resultContainer.remove();
            closeTape();
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
                    tg.showAlert('❌ ' + data.error);
                } else {
                    loadBalance();
                    const balanceEl = resultContainer.querySelector('div[style*="position: absolute"]');
                    if (balanceEl) {
                        balanceEl.textContent = `💰 ${document.getElementById('balance').textContent}`;
                    }
                }
            } catch(e) {
                tg.showAlert('❌ Ошибка при открытии кейса');
            }
        }, 300);

    }, 300);
}

function closeTape() {
    if (_tapeContainer) {
        const track = _tapeContainer.querySelector('#track');
        if (track) {
            track.style.animation = 'none';
            track.style.transition = 'none';
        }
        _tapeContainer.remove();
        _tapeContainer = null;
    }
    _isOpening = false;
}

function openAgain() {
    closeResult();
    if (lastOpenedCase) {
        setTimeout(() => {
            openCaseDirect(lastOpenedCase);
        }, 300);
    }
}

function closeResult() {
    const resultDiv = document.getElementById('result');
    const againBtn = document.getElementById('againBtn');
    const adBlock = document.getElementById('adBlock');
    const prizeDisplay = document.getElementById('prizeDisplay');
    const prizeName = document.getElementById('prizeName');
    const prizeValue = document.getElementById('prizeValue');
    
    if (resultDiv) resultDiv.classList.remove('show');
    if (againBtn) againBtn.style.display = 'none';
    if (adBlock) adBlock.style.display = 'none';
    
    if (prizeDisplay) prizeDisplay.textContent = '';
    if (prizeName) prizeName.textContent = '';
    if (prizeValue) prizeValue.textContent = '';
}

function showProfile() {
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('profileScreen').style.display = 'block';
    loadBalance();
}
function showMain() {
    document.getElementById('profileScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
}
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
        tg.showAlert('✅ Ссылка скопирована!');
    }).catch(() => {
        tg.showAlert('❌ Не удалось скопировать');
    });
}
function showWithdraw() {
    const amount = prompt('Введите количество звёзд (мин. 1000⭐):');
    if (amount === null) return;
    const num = parseInt(amount);
    if (isNaN(num) || num < 1000) {
        tg.showAlert('❌ Минимум 1000⭐');
        return;
    }
    fetch('/withdraw_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, amount: num })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            tg.showAlert('✅ Заявка отправлена! Админ свяжется с вами.');
        } else {
            tg.showAlert('❌ ' + data.error);
        }
    })
    .catch(() => tg.showAlert('❌ Ошибка соединения'));
}

loadBalance();
tg.ready();
