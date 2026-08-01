const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;

if (!user_id) {
    tg.showAlert('❌ Ошибка: не удалось получить ID пользователя.');
}

let lastOpenedCase = null;
let _currentPrize = null;
let _isOpening = false;
let _tapeContainer = null;
let _rafId = null;
let _startTime = null;
let _spinInterval = null;
let _highlightIndex = 0;

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

const CASE_SPEED = {
    'free': 15, 'mud': 15, 'wood': 15, 'stone': 15, 'bronze': 15, 'silver': 15, 'gold': 15,
    'diamond': 17, 'netherite': 19, 'bedrock': 21
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
function getSpeed(type) { return CASE_SPEED[type] || 15; }
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

function previewCase(type) {
    if (_isOpening) return;
    closeTape();
    showFullScreenTape(type, false);
}

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
            showFullScreenTape(type, true);
        });
    });
}

function closeTape() {
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    if (_spinInterval) { clearInterval(_spinInterval); _spinInterval = null; }
    if (_tapeContainer) { _tapeContainer.remove(); _tapeContainer = null; }
    _isOpening = false;
    _startTime = null;
}

function showFullScreenTape(type, isOpening) {
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
        flex-direction: row;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 30px 20px;
        border: none;
        animation: fadeIn 0.3s ease;
        gap: 30px;
    `;

    if (!document.getElementById('tapeFadeStyle')) {
        const fadeStyle = document.createElement('style');
        fadeStyle.id = 'tapeFadeStyle';
        fadeStyle.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;
        document.head.appendChild(fadeStyle);
    }

    // ===== ЛЕВАЯ ЧАСТЬ — ВЕРТИКАЛЬНЫЙ СПИСОК =====
    const leftPanel = document.createElement('div');
    leftPanel.style.cssText = `
        flex: 3;
        height: 80%;
        overflow: hidden;
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.05);
        padding: 10px 0;
        position: relative;
        max-width: 250px;
    `;

    const listContainer = document.createElement('div');
    listContainer.id = 'listContainer';
    listContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 16px;
        transition: transform 1.5s cubic-bezier(0.15, 0.85, 0.35, 1);
    `;

    // Заполняем список всеми наградами (3 повтора для бесконечности)
    let listItems = [];
    for (let repeat = 0; repeat < 3; repeat++) {
        prizes.forEach((p, index) => {
            const isLarge = p > 1000;
            const fontSize = isLarge ? '18px' : '22px';
            listItems.push(`<div class="list-item" data-index="${index}" data-value="${p}" style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px 16px;
                background: rgba(255,255,255,0.03);
                border-radius: 10px;
                font-size: ${fontSize};
                font-weight: 700;
                color: ${style.itemColor};
                text-shadow: 0 0 15px ${style.glowColor};
                border-left: 3px solid transparent;
                transition: all 0.15s ease;
                height: 56px;
                min-height: 56px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">${p}⭐</div>`);
        });
    }
    listContainer.innerHTML = listItems.join('');
    leftPanel.appendChild(listContainer);

    // ===== ЗОЛОТАЯ РАМКА ВЫБОРА =====
    const highlightFrame = document.createElement('div');
    highlightFrame.id = 'highlightFrame';
    highlightFrame.style.cssText = `
        position: absolute;
        left: 4px;
        right: 4px;
        height: 56px;
        border: 2px solid ${style.highlightColor};
        border-radius: 12px;
        background: rgba(255,215,0,0.08);
        box-shadow: 0 0 30px ${style.highlightColor}40, inset 0 0 30px ${style.highlightColor}20;
        transition: top 0.1s ease;
        pointer-events: none;
        top: 10px;
    `;
    leftPanel.appendChild(highlightFrame);

    // ===== ПРАВАЯ ЧАСТЬ — ЦЕНТРАЛЬНАЯ ОБЛАСТЬ =====
    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = `
        flex: 4;
        height: 80%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.05);
        padding: 20px;
        min-width: 200px;
    `;

    const prizeDisplay = document.createElement('div');
    prizeDisplay.id = 'prizeDisplay';
    prizeDisplay.style.cssText = `
        font-size: 80px;
        font-weight: 900;
        color: ${style.highlightColor};
        text-shadow: 0 0 60px ${style.highlightColor}40;
        transition: all 0.5s ease;
        opacity: 0.3;
        transform: scale(0.8);
    `;
    prizeDisplay.textContent = '?';

    const rarityLabel = document.createElement('div');
    rarityLabel.id = 'rarityLabel';
    rarityLabel.style.cssText = `
        font-size: 16px;
        font-weight: 600;
        color: ${style.highlightColor};
        margin-top: 12px;
        opacity: 0;
        transition: all 0.5s ease;
        letter-spacing: 2px;
        text-transform: uppercase;
    `;
    rarityLabel.textContent = 'Обычный';

    rightPanel.appendChild(prizeDisplay);
    rightPanel.appendChild(rarityLabel);

    tapeContainer.appendChild(leftPanel);
    tapeContainer.appendChild(rightPanel);

    // ===== НИЖНЯЯ ЧАСТЬ — КНОПКИ =====
    const bottomSection = document.createElement('div');
    bottomSection.style.cssText = `
        position: absolute;
        bottom: 30px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: 16px;
        padding: 0 20px;
    `;

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `display:flex; gap:16px; flex-wrap:wrap; justify-content:center;`;

    if (isOpening) {
        const openBtn = document.createElement('button');
        openBtn.textContent = `🎲 Открыть (${price}⭐)`;
        openBtn.style.cssText = `
            background: linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd);
            color: #fff;
            border: none;
            padding: 16px 40px;
            border-radius: 16px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 30px ${style.shadowColor};
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            min-width: 180px;
        `;
        openBtn.onclick = function() {
            startFinalSpin(type);
        };
        btnContainer.appendChild(openBtn);
    } else {
        const previewLabel = document.createElement('div');
        previewLabel.textContent = '👀 Предпросмотр наград';
        previewLabel.style.cssText = `
            color: ${style.titleColor};
            font-size: 18px;
            font-weight: 600;
            opacity: 0.7;
            text-align: center;
        `;
        bottomSection.appendChild(previewLabel);
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '🔙 Назад';
    closeBtn.style.cssText = `
        background: rgba(255,255,255,0.08);
        color: #fff;
        border: none;
        padding: 16px 40px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 180px;
    `;
    closeBtn.onclick = function() { closeTape(); };
    btnContainer.appendChild(closeBtn);
    bottomSection.appendChild(btnContainer);
    tapeContainer.appendChild(bottomSection);
    document.body.appendChild(tapeContainer);

    // Сохраняем ссылки для анимации
    tapeContainer._listContainer = listContainer;
    tapeContainer._highlightFrame = highlightFrame;
    tapeContainer._prizeDisplay = prizeDisplay;
    tapeContainer._rarityLabel = rarityLabel;
    tapeContainer._leftPanel = leftPanel;
    tapeContainer._rightPanel = rightPanel;
    tapeContainer._bottomSection = bottomSection;
}

function startFinalSpin(type) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    const tapeContainer = document.getElementById('tapeContainer');
    if (!tapeContainer) return;

    const btns = tapeContainer.querySelectorAll('button');
    btns.forEach(btn => btn.remove());

    const targetPrize = _currentPrize;
    if (targetPrize === null) {
        tg.showAlert('❌ Ошибка: награда не получена');
        closeTape();
        return;
    }

    const allItems = document.querySelectorAll('.list-item');
    let targetIndex = -1;
    let targetElement = null;
    
    allItems.forEach((el, idx) => {
        if (parseInt(el.dataset.value) === targetPrize && targetIndex === -1) {
            targetIndex = idx;
            targetElement = el;
        }
    });
    
    if (targetIndex === -1 || !targetElement) {
        tg.showAlert('❌ Ошибка: награда не найдена в списке');
        closeTape();
        return;
    }

    const listContainer = tapeContainer._listContainer;
    const highlightFrame = tapeContainer._highlightFrame;
    const prizeDisplay = tapeContainer._prizeDisplay;
    const rarityLabel = tapeContainer._rarityLabel;
    const leftPanel = tapeContainer._leftPanel;
    const rightPanel = tapeContainer._rightPanel;
    const bottomSection = tapeContainer._bottomSection;

    // ===== БЫСТРОЕ ПРОБЕГАНИЕ ПО СПИСКУ =====
    let currentHighlight = 0;
    const totalItems = allItems.length;
    let speed = 60;
    let steps = 0;
    const maxSteps = 25;

    if (_spinInterval) clearInterval(_spinInterval);
    _spinInterval = setInterval(() => {
        // Снимаем подсветку со всех
        allItems.forEach(el => {
            el.style.background = 'rgba(255,255,255,0.03)';
            el.style.borderLeft = '3px solid transparent';
        });

        // Подсвечиваем текущий
        const currentItem = allItems[currentHighlight];
        if (currentItem) {
            currentItem.style.background = 'rgba(255,215,0,0.12)';
            currentItem.style.borderLeft = `3px solid ${style.highlightColor}`;
        }

        // Двигаем рамку
        const itemHeight = 64;
        highlightFrame.style.top = (10 + currentHighlight * itemHeight) + 'px';

        // Обновляем центральный дисплей
        const val = parseInt(currentItem?.dataset.value || 0);
        prizeDisplay.textContent = val + '⭐';
        prizeDisplay.style.opacity = '0.6';
        prizeDisplay.style.transform = 'scale(0.9)';

        steps++;
        currentHighlight = (currentHighlight + 1) % totalItems;

        // Замедление
        if (steps > 12) {
            speed += 15;
        }
        if (steps > 18) {
            speed += 30;
        }
        if (steps >= maxSteps) {
            clearInterval(_spinInterval);
            _spinInterval = null;

            // ===== ОСТАНОВКА =====
            // Находим целевой элемент в списке
            const targetIdx = targetIndex;
            const targetEl = allItems[targetIdx];

            // Снимаем подсветку со всех
            allItems.forEach(el => {
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.borderLeft = '3px solid transparent';
            });

            // Подсвечиваем выигрыш
            targetEl.style.background = 'rgba(255,215,0,0.2)';
            targetEl.style.borderLeft = `3px solid ${style.highlightColor}`;
            targetEl.style.color = '#FFFFFF';
            targetEl.style.textShadow = `0 0 30px ${style.highlightColor}`;

            // Двигаем рамку к выигрышу
            const itemHeightFinal = 64;
            highlightFrame.style.top = (10 + targetIdx * itemHeightFinal) + 'px';
            highlightFrame.style.borderColor = '#FFFFFF';
            highlightFrame.style.boxShadow = '0 0 60px rgba(255,215,0,0.6), inset 0 0 60px rgba(255,215,0,0.3)';

            // ===== ВСПЫШКА =====
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: radial-gradient(circle at center, rgba(255,215,0,0.8), rgba(255,255,255,0.4), transparent 70%);
                z-index: 1000;
                pointer-events: none;
                animation: flashOut 0.6s ease-out forwards;
            `;
            document.body.appendChild(flash);

            if (!document.getElementById('flashStyle')) {
                const flashStyle = document.createElement('style');
                flashStyle.id = 'flashStyle';
                flashStyle.textContent = `
                    @keyframes flashOut {
                        0% { opacity: 1; transform: scale(0.8); }
                        100% { opacity: 0; transform: scale(1.5); }
                    }
                `;
                document.head.appendChild(flashStyle);
            }

            setTimeout(() => flash.remove(), 700);

            // ===== УВЕЛИЧЕНИЕ ВЫИГРЫША =====
            setTimeout(() => {
                prizeDisplay.textContent = targetPrize + '⭐';
                prizeDisplay.style.opacity = '1';
                prizeDisplay.style.transform = 'scale(1.5)';
                prizeDisplay.style.color = '#FFFFFF';
                prizeDisplay.style.textShadow = `
                    0 0 60px ${style.highlightColor},
                    0 0 120px ${style.highlightColor},
                    0 0 200px ${style.highlightColor}80
                `;

                // Редкость
                let rarity = 'Обычный';
                let rarityColor = style.itemColor;
                if (targetPrize >= 1000) { rarity = 'Легендарный'; rarityColor = '#ff6b35'; }
                else if (targetPrize >= 500) { rarity = 'Эпический'; rarityColor = '#b388ff'; }
                else if (targetPrize >= 100) { rarity = 'Редкий'; rarityColor = '#ffd700'; }
                
                rarityLabel.textContent = rarity;
                rarityLabel.style.color = rarityColor;
                rarityLabel.style.opacity = '1';
                rarityLabel.style.textShadow = `0 0 30px ${rarityColor}40`;

                // Показываем кнопки
                const resultButtons = document.createElement('div');
                resultButtons.style.cssText = `
                    display: flex;
                    gap: 16px;
                    margin-top: 20px;
                    justify-content: center;
                `;

                const closeResultBtn = document.createElement('button');
                closeResultBtn.textContent = '🔙 Закрыть';
                closeResultBtn.style.cssText = `
                    background: rgba(255,255,255,0.08);
                    color: #fff;
                    border: none;
                    padding: 14px 36px;
                    border-radius: 14px;
                    font-size: 17px;
                    font-weight: 700;
                    cursor: pointer;
                `;
                closeResultBtn.onclick = function() {
                    closeTape();
                    openCaseReal(type, targetPrize);
                };

                const againBtn = document.createElement('button');
                againBtn.textContent = '🎲 Открыть ещё';
                againBtn.style.cssText = `
                    background: linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd);
                    color: #fff;
                    border: none;
                    padding: 14px 36px;
                    border-radius: 14px;
                    font-size: 17px;
                    font-weight: 700;
                    cursor: pointer;
                `;
                againBtn.onclick = function() {
                    closeTape();
                    openCaseDirect(type);
                };

                resultButtons.appendChild(closeResultBtn);
                resultButtons.appendChild(againBtn);
                bottomSection.appendChild(resultButtons);

            }, 800);
        }
    }, speed);
}

async function openCaseReal(type, finalPrize) {
    lastOpenedCase = type;
    try {
        const res = await fetch('/open_case', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: user_id, 
                case_type: type,
                prize: _currentPrize
            })
        });
        const data = await res.json();
        if (data.error) {
            tg.showAlert('❌ ' + data.error);
            return;
        }

        const resultDiv = document.getElementById('result');
        document.getElementById('prizeDisplay').textContent = '🎁';
        document.getElementById('prizeName').textContent = 'Ты выиграл!';
        document.getElementById('prizeValue').textContent = '⭐ ' + data.prize;

        if (data.ad) {
            document.getElementById('adText').textContent = data.ad;
            document.getElementById('adBlock').style.display = 'block';
        } else {
            document.getElementById('adBlock').style.display = 'none';
        }
        resultDiv.classList.add('show');
        loadBalance();
        document.getElementById('againBtn').style.display = 'inline-block';
    } catch(e) {
        tg.showAlert('❌ Ошибка открытия кейса');
    }
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
    document.getElementById('result').classList.remove('show');
    document.getElementById('againBtn').style.display = 'none';
    document.getElementById('adBlock').style.display = 'none';
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
