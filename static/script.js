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
    // Проверка баланса ДО анимации
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

    // Возможные выигрыши для каждого кейса (для анимации)
    const casePrizes = {
        'free': [1, 2, 3, 5, 10, 100],
        'wood': [20, 25, 30, 35, 40, 50, 60, 100, 200],
        'silver': [40, 50, 60, 70, 80, 90, 100, 120, 200, 500],
        'gold': [150, 175, 200, 250, 300, 350, 400, 450, 500, 1000],
        'diamond': [350, 400, 500, 600, 700, 800, 900, 1000, 1200, 2000],
        'netherite': [1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 15000, 25000]
    };

    const prizes = casePrizes[type] || [1, 10, 100];
    const displayPrizes = prizes.slice().sort((a, b) => a - b);

    // Анимация
    lastOpenedCase = type;
    const resultDiv = document.getElementById('result');
    const display = document.getElementById('prizeDisplay');
    const name = document.getElementById('prizeName');
    const value = document.getElementById('prizeValue');
    const adBlock = document.getElementById('adBlock');
    const ad
