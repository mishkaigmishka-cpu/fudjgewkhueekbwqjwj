const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;
let lastOpenedCase = null;
let _pendingCase = null;

// ===== ВСЕ НАГРАДЫ ДЛЯ ЛЕНТЫ (ТВОИ СПИСКИ) =====
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

function getPrizes(type) {
    return CASE_PRIZES[type] || [1, 10, 100];
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
            setTimeout(() => {
                tg.showAlert('❌ ' + data.error);
            }, 500);
            return false;
        }
        if (!data.can_open) {
            setTimeout(() => {
                tg.showAlert('❌ Недостаточно звёзд или время не прошло!');
            }, 500);
            return false;
        }
        return true;
    } catch(e) {
        setTimeout(() => {
            tg.showAlert('❌ Ошибка проверки баланса');
        }, 500);
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

    // ВСЕГДА показываем ленту (баланс не проверяем)
    document.getElementById('caseInfoIcon').textContent = data.icon;
    document.getElementById('caseInfoName').textContent = data.name;
    document.getElementById('caseInfoPrice').textContent = 'Цена: ' + data.price;

    document.getElementById('caseInfo').style.display = 'flex';
    _pendingCase = type;
    
    // Показываем ленту на половину экрана
    setTimeout(() => {
        showPrizeTape(type);
    }, 300);
}

function closeCaseInfo() {
    document.getElementById('caseInfo').style.display = 'none';
    _pendingCase = null;
    // Удаляем контейнер ленты, если он есть
    const tape = document.getElementById('tapeContainer');
    if (tape) tape.remove();
}

function confirmOpen() {
    const type = _pendingCase;
    if (!type) return;
    
    // При нажатии «Открыть» — проверяем баланс
    checkBalance(type).then(canOpen => {
        if (!canOpen) {
            closeCaseInfo();
            return;
        }
        // Запускаем анимацию открытия
        startFinalSpin(type);
    });
}

function showPrizeTape(type) {
    const prizes = getPrizes(type);
    
    const tapeContainer = document.createElement('div');
    tapeContainer.id = 'tapeContainer';
    tapeContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 50vh;
        background: rgba(0,0,0,0.92);
        backdrop-filter: blur(20px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 200;
        padding: 20px;
        border-bottom: 2px solid rgba(255,215,0,0.3);
    `;
    
    const tapeBox = document.createElement('div');
    tapeBox.style.cssText = `
        overflow: hidden;
        width: 90%;
        max-width: 500px;
        background: rgba(255,255,255,0.03);
        border-radius: 20px;
        padding: 20px 0;
        border: 1px solid rgba(255,215,0,0.15);
    `;
    
    const tapeContent = document.createElement('div');
    tapeContent.id = 'tapeContent';
    tapeContent.style.cssText = `
        display: flex;
        gap: 40px;
        white-space: nowrap;
        font-size: 48px;
        font-weight: 900;
        animation: scrollTape 15s linear infinite;
    `;
    
    // Все награды с подсветкой (активная — золотая)
    const items = prizes.map((p, index) => {
        return `<span class="prize-item" data-index="${index}" style="color:#6bcbff; transition: all 0.3s;">${p}⭐</span>`;
    }).join('');
    tapeContent.innerHTML = items + items + items;
    
    if (!document.getElementById('tapeStyle')) {
        const style = document.createElement('style');
        style.id = 'tapeStyle';
        style.textContent = `
            @keyframes scrollTape {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    tapeBox.appendChild(tapeContent);
    tapeContainer.appendChild(tapeBox);
    
    // Кнопки
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
        display: flex;
        gap: 16px;
        margin-top: 20px;
    `;
    
    const openBtn = document.createElement('button');
    openBtn.textContent = '🎲 Открыть';
    openBtn.style.cssText = `
        background: linear-gradient(135deg, #b388ff, #7c4dff);
        color: #fff;
        border: none;
        padding: 14px 32px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
    `;
    openBtn.onclick = function() {
        confirmOpen();
    };
    
    const backBtn = document.createElement('button');
    backBtn.textContent = '🔙 Назад';
    backBtn.style.cssText = `
        background: rgba(255,255,255,0.08);
        color: #fff;
        border: none;
        padding: 14px 32px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
    `;
    backBtn.onclick = function() {
        closeCaseInfo();
    };
    
    btnContainer.appendChild(openBtn);
    btnContainer.appendChild(backBtn);
    tapeContainer.appendChild(btnContainer);
    
    document.body.appendChild(tapeContainer);
    
    // Запускаем подсветку (смена активной награды)
    let activeIndex = 0;
    const allItems = document.querySelectorAll('.prize-item');
    const totalItems = allItems.length / 3; // потому что лента утроена
    
    const highlightInterval = setInterval(() => {
        // Снимаем подсветку со всех
        document.querySelectorAll('.prize-item').forEach(el => {
            el.style.color = '#6bcbff';
            el.style.textShadow = 'none';
        });
        // Подсвечиваем текущую
        const idx = activeIndex % totalItems;
        const target = document.querySelector(`.prize-item[data-index="${idx}"]`);
        if (target) {
            target.style.color = '#ffd700';
            target.style.textShadow = '0 0 20px rgba(255,215,0,0.8)';
        }
        activeIndex++;
    }, 600);
    
    // Сохраняем interval для очистки
    tapeContainer._highlightInterval = highlightInterval;
}

function startFinalSpin(type) {
    const prizes = getPrizes(type);
    const tapeContainer = document.getElementById('tapeContainer');
    if (!tapeContainer) return;
    
    // Останавливаем подсветку
    if (tapeContainer._highlightInterval) {
        clearInterval(tapeContainer._highlightInterval);
    }
    
    // Убираем кнопки
    const btns = tapeContainer.querySelectorAll('button');
    btns.forEach(btn => btn.remove());
    
    // Разворачиваем на весь экран
    tapeContainer.style.top = '0';
    tapeContainer.style.height = '100vh';
    tapeContainer.style.borderBottom = 'none';
    
    const tapeBox = tapeContainer.querySelector('div');
    const tapeContent = document.getElementById('tapeContent');
    tapeContent.style.animation = 'scrollTape 0.8s linear infinite';
    
    // Выбираем случайную награду
    const finalPrize = prizes[Math.floor(Math.random() * prizes.length)];
    
    // Через 1.5 секунды — показываем результат
    setTimeout(() => {
        tapeContent.style.animation = 'none';
        tapeContent.innerHTML = `<span style="color:#ffd700; font-size:64px; text-shadow: 0 0 40px rgba(255,215,0,0.8);">${finalPrize}⭐</span>`;
        
        // Снимаем подсветку со всех
        document.querySelectorAll('.prize-item').forEach(el => {
            el.style.color = '#6bcbff';
            el.style.textShadow = 'none';
        });
        
        setTimeout(() => {
            tapeContainer.remove();
            openCaseReal(type, finalPrize);
        }, 1000);
    }, 1500);
}

async function openCaseReal(type, finalPrize) {
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
        setTimeout(() => openCaseReal(lastOpenedCase), 300);
    }
}

function closeResult() {
    document.getElementById('result').classList.remove('show');
    document.getElementById('againBtn').style.display = 'none';
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
    document.getElementById('profileSection').style.display = 'none';
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
    if (!amount || amount < 1000) {
        tg.showAlert('❌ Минимум 1000⭐');
        return;
    }
    fetch('/withdraw_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, amount })
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
