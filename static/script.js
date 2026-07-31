const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;
let lastOpenedCase = null;
let _pendingCase = null;

// ===== НАГРАДЫ ДЛЯ КАЖДОГО КЕЙСА (ДО 50) =====
const CASE_PRIZES = {
    'free': [1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,100,1000],
    'mud': [1,2,3,4,5,6,7,8,9,10,12,15,18,20,25,30,35,40,45,50,500],
    'wood': [1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30,35,40,45,50,1000,10000],
    'stone': [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,40,45,50,2500,25000],
    'bronze': [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,5000,50000],
    'silver': [20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,10000,100000],
    'gold': [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,25000,250000],
    'diamond': [35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,50000,500000],
    'netherite': [40,41,42,43,44,45,46,47,48,49,50,100000,1000000],
    'bedrock': [45,46,47,48,49,50,250000,2500000]
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
    
    // СРАЗУ ПОКАЗЫВАЕМ ЛЕНТУ (на половину экрана)
    setTimeout(() => {
        showPrizeTape(type);
    }, 300);
}

function closeCaseInfo() {
    document.getElementById('caseInfo').style.display = 'none';
    _pendingCase = null;
}

function confirmOpen() {
    const type = _pendingCase;
    if (!type) return;
    closeCaseInfo();
    // Запускаем финальную прокрутку со стрелкой
    startFinalSpin(type);
}

// ===== ЛЕНТА НА ПОЛОВИНУ ЭКРАНА (МЕДЛЕННАЯ) =====
function showPrizeTape(type) {
    const prizes = getPrizes(type);
    
    const tapeContainer = document.createElement('div');
    tapeContainer.id = 'tapeContainer';
    tapeContainer.style.cssText = `
        position: fixed;
        top: 25%;
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
        border-top: 2px solid rgba(255,215,0,0.3);
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
    tapeContent.style.cssText = `
        display: flex;
        gap: 40px;
        white-space: nowrap;
        font-size: 48px;
        font-weight: 900;
        animation: scrollTape 6s linear infinite;
    `;
    
    const items = prizes.map(p => {
        const color = p > 1000 ? '#ff6b6b' : p > 100 ? '#ffd93d' : '#6bcbff';
        return `<span style="color:${color};">${p}⭐</span>`;
    }).join('');
    tapeContent.innerHTML = items + items + items;
    
    if (!document.getElementById('tapeStyle')) {
        const style = document.createElement('style');
        style.id = 'tapeStyle';
        style.textContent = `
            @keyframes scrollTape {
                0% { transform: translateX(0); }
                100% { transform: translateX(-33.33%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    tapeBox.appendChild(tapeContent);
    tapeContainer.appendChild(tapeBox);
    
    // Кнопка "Открыть" внутри ленты
    const openBtn = document.createElement('button');
    openBtn.textContent = '🎲 Открыть кейс';
    openBtn.style.cssText = `
        background: linear-gradient(135deg, #b388ff, #7c4dff);
        color: #fff;
        border: none;
        padding: 14px 32px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.15s;
    `;
    openBtn.onclick = function() {
        confirmOpen();
    };
    tapeContainer.appendChild(openBtn);
    
    document.body.appendChild(tapeContainer);
}

// ===== ФИНАЛЬНАЯ ПРОКРУТКА СО СТРЕЛКОЙ =====
function startFinalSpin(type) {
    const prizes = getPrizes(type);
    const tapeContainer = document.getElementById('tapeContainer');
    if (!tapeContainer) return;
    
    // Меняем ленту на весь экран
    tapeContainer.style.top = '0';
    tapeContainer.style.height = '100vh';
    tapeContainer.style.borderTop = 'none';
    tapeContainer.style.borderBottom = 'none';
    
    // Убираем кнопку
    const btn = tapeContainer.querySelector('button');
    if (btn) btn.remove();
    
    // Получаем содержимое ленты
    const tapeBox = tapeContainer.querySelector('div');
    const tapeContent = tapeBox.querySelector('div');
    
    // Ускоряем анимацию
    tapeContent.style.animation = 'scrollTape 0.8s linear infinite';
    
    // Стрелка
    const arrow = document.createElement('div');
    arrow.id = 'tapeArrow';
    arrow.textContent = '👇';
    arrow.style.cssText = `
        font-size: 60px;
        margin-top: 20px;
        animation: bounceArrow 0.4s infinite alternate;
        color: #ffd700;
        text-shadow: 0 0 30px rgba(255,215,0,0.5);
        opacity: 0;
        transition: opacity 0.5s;
    `;
    tapeContainer.appendChild(arrow);
    
    if (!document.getElementById('arrowStyle')) {
        const style = document.createElement('style');
        style.id = 'arrowStyle';
        style.textContent = `
            @keyframes bounceArrow {
                0% { transform: translateY(0); opacity: 0.6; }
                100% { transform: translateY(15px); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Через 1.5 секунды — показываем результат
    setTimeout(() => {
        // Останавливаем ленту
        tapeContent.style.animation = 'none';
        
        // Выбираем случайную награду (шансы не меняем)
        const finalPrize = prizes[Math.floor(Math.random() * prizes.length)];
        
        // Показываем финальную награду
        tapeContent.innerHTML = `<span style="color:#ffd700; font-size:64px; text-shadow: 0 0 40px rgba(255,215,0,0.8);">${finalPrize}⭐</span>`;
        
        // Показываем стрелку
        arrow.style.opacity = '1';
        
        // Через 1 секунду — модалка
        setTimeout(() => {
            tapeContainer.remove();
            openCaseReal(type, finalPrize);
        }, 1000);
        
    }, 1500);
}

async function openCaseReal(type, finalPrize) {
    try {
        const checkRes = await fetch('/check_balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, case_type: type })
        });
        const checkData = await checkRes.json();
        if (checkData.error) {
            tg.showAlert('❌ ' + checkData.error);
            return;
        }
        if (!checkData.can_open) {
            tg.showAlert('❌ Недостаточно звёзд!');
            return;
        }
    } catch(e) {
        tg.showAlert('❌ Ошибка проверки баланса');
        return;
    }

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
