const tg = window.Telegram.WebApp;
const user_id = tg.initDataUnsafe?.user?.id || 0;
let lastOpenedCase = null;

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

async function openCase(type) {
    // === ПРОВЕРКА БАЛАНСА ДО АНИМАЦИИ ===
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

    // === АНИМАЦИЯ ===
    lastOpenedCase = type;
    const resultDiv = document.getElementById('result');
    const display = document.getElementById('prizeDisplay');
    const name = document.getElementById('prizeName');
    const value = document.getElementById('prizeValue');
    const adBlock = document.getElementById('adBlock');
    const adText = document.getElementById('adText');
    const againBtn = document.getElementById('againBtn');

    resultDiv.classList.add('show');
    adBlock.style.display = 'none';
    againBtn.style.display = 'none';
    display.textContent = '🎰';
    name.textContent = 'Крутится...';
    value.textContent = '⭐ 0';

    for (let i = 0; i < 20; i++) {
        const randomPrize = Math.floor(Math.random() * 50000) + 1;
        value.textContent = '⭐ ' + randomPrize;
        await new Promise(r => setTimeout(r, 100));
    }

    try {
        const res = await fetch('/open_case', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, case_type: type })
        });
        const data = await res.json();
        if (data.error) {
            display.textContent = '❌';
            name.textContent = 'Ошибка';
            value.textContent = data.error;
            return;
        }
        resultDiv.classList.add('flash');
        setTimeout(() => resultDiv.classList.remove('flash'), 400);

        display.textContent = '🎁';
        name.textContent = 'Ты выиграл!';
        value.textContent = '⭐ ' + data.prize;
        if (data.ad) {
            adText.textContent = data.ad;
            adBlock.style.display = 'block';
        }
        loadBalance();
        againBtn.style.display = 'inline-block';
    } catch(e) {
        display.textContent = '⚠️';
        name.textContent = 'Ошибка';
        value.textContent = 'Попробуй снова';
    }
}

function openAgain() {
    closeResult();
    if (lastOpenedCase) {
        setTimeout(() => openCase(lastOpenedCase), 300);
    }
}

function closeResult() {
    document.getElementById('result').classList.remove('show');
    document.getElementById('againBtn').style.display = 'none';
}

// === ПРОФИЛЬ КАК ОТДЕЛЬНАЯ ВКЛАДКА ===
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
    document.getElementById('inviteSection').style.display = 'block';
}

function copyInvite() {
    navigator.clipboard.writeText(document.getElementById('inviteLink').value);
    tg.showAlert('✅ Ссылка скопирована!');
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
