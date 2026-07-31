const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;

if (!user_id) {
    tg.showAlert('❌ Ошибка: не удалось получить ID пользователя. Перезапустите бота.');
}

let lastOpenedCase = null;
let _pendingCase = null;
let _tapeInterval = null;
let _currentPrize = null;

const CASE_PRIZES = {
    'free': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 1000],
    'mud': [1, 2, 3, 4, 5, 6, 7, 10, 12, 14, 16, 20, 22, 24, 27, 30, 35, 40, 50, 500],
    'wood': [2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 20, 50, 100, 500, 1000, 10000],
    'stone': [11, 13, 15, 16, 17, 18, 19, 21, 23, 24, 25, 30, 50, 100, 250, 500, 1000, 2500],
    'bronze': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 75, 100, 222, 333, 444, 555, 1000, 1500, 2000, 5000],
    'silver': [40, 50, 60, 70, 70, 80, 90, 100, 100, 110, 120, 130, 140, 150, 200, 250, 333, 444, 555, 666, 777, 888, 999, 1488, 2011, 5000, 10000],
    'gold': [75, 100, 150, 169, 190, 220, 251, 300, 400, 500, 777, 999, 1000, 2000, 5000, 10000, 12500, 25000],
    'diamond': [250, 300, 333, 350, 444, 505, 1000, 1488, 2222, 1000, 2500, 5000, 10000, 12500, 25000, 50000],
    'netherite': [500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 10000, 15000, 20000, 25000],
    'bedrock': [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2500, 2600, 2800, 3000, 3200, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000, 10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 50000, 100000]
};

const CASE_STYLES = {
    'free': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(46,204,113,0.6)',
        titleColor: '#2ecc71',
        itemColor: '#6bcbff',
        highlightColor: '#ffd700',
        glowColor: 'rgba(46,204,113,0.3)',
        shadowColor: 'rgba(46,204,113,0.5)',
        icon: '🎁',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(46,204,113,0.05), transparent 70%)'
    },
    'mud': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(142,68,173,0.6)',
        titleColor: '#8e44ad',
        itemColor: '#c39bd3',
        highlightColor: '#ff6b6b',
        glowColor: 'rgba(142,68,173,0.3)',
        shadowColor: 'rgba(142,68,173,0.5)',
        icon: '🟫',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(142,68,173,0.05), transparent 70%)'
    },
    'wood': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(211,84,0,0.6)',
        titleColor: '#d35400',
        itemColor: '#f39c12',
        highlightColor: '#ffd700',
        glowColor: 'rgba(211,84,0,0.3)',
        shadowColor: 'rgba(211,84,0,0.5)',
        icon: '🌳',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(211,84,0,0.05), transparent 70%)'
    },
    'stone': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(127,140,141,0.6)',
        titleColor: '#7f8c8d',
        itemColor: '#bdc3c7',
        highlightColor: '#ffd700',
        glowColor: 'rgba(127,140,141,0.3)',
        shadowColor: 'rgba(127,140,141,0.5)',
        icon: '🪨',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(127,140,141,0.05), transparent 70%)'
    },
    'bronze': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(205,127,50,0.6)',
        titleColor: '#cd7f32',
        itemColor: '#f0c27f',
        highlightColor: '#ffd700',
        glowColor: 'rgba(205,127,50,0.3)',
        shadowColor: 'rgba(205,127,50,0.5)',
        icon: '🥉',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(205,127,50,0.05), transparent 70%)'
    },
    'silver': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(189,195,199,0.6)',
        titleColor: '#bdc3c7',
        itemColor: '#ecf0f1',
        highlightColor: '#ffd700',
        glowColor: 'rgba(189,195,199,0.3)',
        shadowColor: 'rgba(189,195,199,0.5)',
        icon: '🔘',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(189,195,199,0.05), transparent 70%)'
    },
    'gold': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(241,196,15,0.6)',
        titleColor: '#f1c40f',
        itemColor: '#f9e79f',
        highlightColor: '#ffd700',
        glowColor: 'rgba(241,196,15,0.4)',
        shadowColor: 'rgba(241,196,15,0.6)',
        icon: '👑',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(241,196,15,0.08), transparent 70%)'
    },
    'diamond': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(52,152,219,0.6)',
        titleColor: '#3498db',
        itemColor: '#85c1e9',
        highlightColor: '#00d4ff',
        glowColor: 'rgba(52,152,219,0.3)',
        shadowColor: 'rgba(52,152,219,0.5)',
        icon: '💎',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(52,152,219,0.05), transparent 70%)'
    },
    'netherite': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(44,62,80,0.6)',
        titleColor: '#e74c3c',
        itemColor: '#f1948a',
        highlightColor: '#ff6b35',
        glowColor: 'rgba(231,76,60,0.3)',
        shadowColor: 'rgba(231,76,60,0.5)',
        icon: '🔥',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(231,76,60,0.05), transparent 70%)'
    },
    'bedrock': {
        bg: 'rgba(0,0,0,0.92)',
        border: '2px solid rgba(52,73,94,0.6)',
        titleColor: '#5d6d7e',
        itemColor: '#aeb6bf',
        highlightColor: '#ffd700',
        glowColor: 'rgba(52,73,94,0.4)',
        shadowColor: 'rgba(52,73,94,0.6)',
        icon: '⛏️',
        bgGradient: 'radial-gradient(circle at 50% 50%, rgba(52,73,94,0.08), transparent 70%)'
    }
};

function getPrizes(type) {
    return CASE_PRIZES[type] || [1, 10, 100];
}

function getStyle(type) {
    return CASE_STYLES[type] || CASE_STYLES['free'];
}

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

function showCaseInfo(type) {
    const caseData = {
        'free': { icon: '🎁', name: 'Бесплатный', price: '0⭐' },
        'mud': { icon: '🟫', name: 'Грязь', price: '5⭐' },
        'wood': { icon: '🌳', name: 'Деревянный', price: '9⭐' },
        'stone': { icon: '🪨', name: 'Каменный', price: '19⭐' },
        'bronze': { icon: '🥉', name: 'Бронзовый', price: '49⭐' },
        'silver': { icon: '🔘', name: 'Серебряный', price: '99⭐' },
        'gold': { icon: '👑', name: 'Золотой', price: '249⭐' },
        'diamond': { icon: '💎', name: 'Алмазный', price: '499⭐' },
        'netherite': { icon: '🔥', name: 'Незеритовый', price: '999⭐' },
        'bedrock': { icon: '⛏️', name: 'Бедрок', price: '2499⭐' }
    };

    const data = caseData[type];
    if (!data) return;

    document.getElementById('caseInfoIcon').textContent = data.icon;
    document.getElementById('caseInfoName').textContent = data.name;
    document.getElementById('caseInfoPrice').textContent = 'Цена: ' + data.price;

    document.getElementById('caseInfo').style.display = 'flex';
    _pendingCase = type;
    
    setTimeout(() => {
        showPrizeTape(type);
    }, 300);
}

function closeCaseInfo() {
    document.getElementById('caseInfo').style.display = 'none';
    _pendingCase = null;
    const tape = document.getElementById('tapeContainer');
    if (tape) {
        if (_tapeInterval) clearInterval(_tapeInterval);
        tape.remove();
    }
}

function confirmOpen() {
    const type = _pendingCase;
    if (!type) return;
    
    checkBalance(type).then(canOpen => {
        if (!canOpen) {
            closeCaseInfo();
            return;
        }
        startFinalSpin(type);
    });
}

function showPrizeTape(type) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    
    const oldTape = document.getElementById('tapeContainer');
    if (oldTape) {
        if (_tapeInterval) clearInterval(_tapeInterval);
        oldTape.remove();
    }
    
    const tapeContainer = document.createElement('div');
    tapeContainer.id = 'tapeContainer';
    tapeContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 55vh;
        background: ${style.bg};
        background-image: ${style.bgGradient};
        backdrop-filter: blur(25px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 200;
        padding: 20px;
        border-bottom: ${style.border};
    `;
    
    const title = document.createElement('div');
    title.style.cssText = `
        font-size: 24px;
        font-weight: 800;
        color: ${style.titleColor};
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-shadow: 0 0 30px ${style.glowColor};
    `;
    title.textContent = `${style.icon} ${type.toUpperCase()} CASE`;
    tapeContainer.appendChild(title);
    
    const tapeBox = document.createElement('div');
    tapeBox.style.cssText = `
        overflow: hidden;
        width: 92%;
        max-width: 520px;
        background: rgba(255,255,255,0.03);
        border-radius: 20px;
        padding: 24px 0;
        border: ${style.border};
        box-shadow: 0 0 60px ${style.glowColor};
    `;
    
    const tapeContent = document.createElement('div');
    tapeContent.id = 'tapeContent';
    tapeContent.style.cssText = `
        display: flex;
        gap: 50px;
        white-space: nowrap;
        font-size: 48px;
        font-weight: 900;
        animation: scrollTape_${type} 18s linear infinite;
    `;
    
    const items = prizes.map((p, index) => {
        return `<span class="prize-item" data-index="${index}" style="color:${style.itemColor}; transition: all 0.4s; font-size: 48px; text-shadow: 0 0 15px ${style.glowColor}; padding: 4px 8px;">${p}⭐</span>`;
    }).join('');
    tapeContent.innerHTML = items + items + items + items;
    
    if (!document.getElementById(`tapeStyle_${type}`)) {
        const styleTag = document.createElement('style');
        styleTag.id = `tapeStyle_${type}`;
        styleTag.textContent = `
            @keyframes scrollTape_${type} {
                0% { transform: translateX(0); }
                100% { transform: translateX(-25%); }
            }
            @keyframes pulse_${type} {
                0% { box-shadow: 0 0 20px ${style.glowColor}; }
                50% { box-shadow: 0 0 60px ${style.glowColor}, 0 0 100px ${style.glowColor}; }
                100% { box-shadow: 0 0 20px ${style.glowColor}; }
            }
            .tape-box-${type} {
                animation: pulse_${type} 2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(styleTag);
    }
    tapeBox.className = `tape-box-${type}`;
    
    tapeBox.appendChild(tapeContent);
    tapeContainer.appendChild(tapeBox);
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
        display: flex;
        gap: 16px;
        margin-top: 20px;
    `;
    
    const openBtn = document.createElement('button');
    openBtn.textContent = `🎲 Открыть ${style.icon}`;
    openBtn.style.cssText = `
        background: linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd);
        color: #fff;
        border: none;
        padding: 16px 40px;
        border-radius: 18px;
        font-size: 20px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 30px ${style.shadowColor};
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    openBtn.onmouseover = function() { 
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = `0 6px 40px ${style.shadowColor}`;
    };
    openBtn.onmouseout = function() { 
        this.style.transform = 'scale(1)';
        this.style.boxShadow = `0 4px 30px ${style.shadowColor}`;
    };
    openBtn.onclick = function() {
        document.getElementById('caseInfo').style.display = 'none';
        confirmOpen();
    };
    
    btnContainer.appendChild(openBtn);
    tapeContainer.appendChild(btnContainer);
    
    document.body.appendChild(tapeContainer);
    
    let activeIndex = 0;
    const totalItems = prizes.length;
    
    _tapeInterval = setInterval(() => {
        document.querySelectorAll('.prize-item').forEach(el => {
            el.style.color = style.itemColor;
            el.style.textShadow = `0 0 15px ${style.glowColor}`;
            el.style.transform = 'scale(1)';
        });
        const idx = activeIndex % totalItems;
        const target = document.querySelector(`.prize-item[data-index="${idx}"]`);
        if (target) {
            target.style.color = style.highlightColor;
            target.style.textShadow = `0 0 50px ${style.highlightColor}, 0 0 100px ${style.highlightColor}40`;
            target.style.transform = 'scale(1.3)';
        }
        activeIndex++;
    }, 1100);
    
    tapeContainer._highlightInterval = _tapeInterval;
}

function startFinalSpin(type) {
    const prizes = getPrizes(type);
    const style = getStyle(type);
    const tapeContainer = document.getElementById('tapeContainer');
    if (!tapeContainer) return;
    
    if (_tapeInterval) {
        clearInterval(_tapeInterval);
        _tapeInterval = null;
    }
    
    const btn = tapeContainer.querySelector('button');
    if (btn) btn.remove();
    
    tapeContainer.style.top = '0';
    tapeContainer.style.height = '100vh';
    tapeContainer.style.borderBottom = 'none';
    tapeContainer.style.background = style.bg;
    tapeContainer.style.backgroundImage = style.bgGradient;
    
    const tapeContent = document.getElementById('tapeContent');
    tapeContent.style.animation = `scrollTape_${type} 0.5s linear infinite`;
    
    _currentPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    setTimeout(() => {
        tapeContent.style.animation = 'none';
        tapeContent.innerHTML = `
            <span style="color:${style.highlightColor}; font-size:80px; text-shadow: 0 0 60px ${style.highlightColor}, 0 0 120px ${style.highlightColor}60; font-weight:900;">
                ${_currentPrize}⭐
            </span>
        `;
        
        document.querySelectorAll('.prize-item').forEach(el => {
            el.style.color = style.itemColor;
            el.style.textShadow = 'none';
            el.style.transform = 'scale(1)';
        });
        
        setTimeout(() => {
            tapeContainer.remove();
            openCaseReal(type, _currentPrize);
        }, 1200);
    }, 1500);
}

async function openCaseReal(type, finalPrize) {
    lastOpenedCase = type;
    
    try {
        const res = await fetch('/open_case', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, case_type: type })
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
            showCaseInfo(lastOpenedCase);
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
