function showFullScreenTape(type, isOpening) {
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
        bottom: 0;
        background: ${style.bg};
        background-image: ${style.bgGradient};
        backdrop-filter: blur(30px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 30px 20px;
        border: none;
        animation: fadeIn 0.3s ease;
    `;
    
    if (!document.getElementById('tapeFadeStyle')) {
        const fadeStyle = document.createElement('style');
        fadeStyle.id = 'tapeFadeStyle';
        fadeStyle.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(fadeStyle);
    }
    
    const title = document.createElement('div');
    title.style.cssText = `
        font-size: 28px;
        font-weight: 800;
        color: ${style.titleColor};
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 4px;
        text-shadow: 0 0 40px ${style.glowColor};
    `;
    title.textContent = `${style.icon} ${type.toUpperCase()} CASE`;
    tapeContainer.appendChild(title);
    
    const tapeWrapper = document.createElement('div');
    tapeWrapper.style.cssText = `
        flex: 7;
        width: 95%;
        max-width: 600px;
        display: flex;
        align-items: center;
        overflow: hidden;
        background: rgba(255,255,255,0.03);
        border-radius: 24px;
        border: ${style.border};
        box-shadow: 0 0 80px ${style.glowColor};
        padding: 30px 0;
        min-height: 300px;
        position: relative;
    `;
    
    const tapeContent = document.createElement('div');
    tapeContent.id = 'tapeContent';
    tapeContent.style.cssText = `
        display: flex;
        gap: 60px;
        white-space: nowrap;
        font-size: 56px;
        font-weight: 900;
        padding: 0 20px;
        will-change: transform;
        transition: none;
    `;
    
    let allItems = [];
    for (let repeat = 0; repeat < 8; repeat++) {
        prizes.forEach((p, index) => {
            allItems.push(`<span class="prize-item" data-index="${index}" style="color:${style.itemColor}; transition: none; font-size: 56px; text-shadow: 0 0 20px ${style.glowColor}; padding: 8px 12px; display: inline-block; flex-shrink: 0;">${p}⭐</span>`);
        });
    }
    tapeContent.innerHTML = allItems.join('');
    
    const animKey = `scrollTape_${type}_${Date.now()}`;
    
    if (!document.getElementById(`tapeStyle_${type}`)) {
        const styleTag = document.createElement('style');
        styleTag.id = `tapeStyle_${type}`;
        styleTag.textContent = `
            @keyframes ${animKey} {
                0% { transform: translateX(0); }
                100% { transform: translateX(-${100 / 8}%); }
            }
        `;
        document.head.appendChild(styleTag);
    }
    
    tapeContent.style.animation = `${animKey} 10s linear infinite`;
    tapeContent.style.animationTimingFunction = 'linear';
    
    tapeWrapper.appendChild(tapeContent);
    tapeContainer.appendChild(tapeWrapper);
    
    const bottomSection = document.createElement('div');
    bottomSection.style.cssText = `
        flex: 3;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        width: 100%;
        padding-top: 20px;
    `;
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        justify-content: center;
    `;
    
    // ===== ВСЕГДА ПОКАЗЫВАЕМ КНОПКУ «ОТКРЫТЬ» =====
    const openBtn = document.createElement('button');
    openBtn.textContent = `🎲 Открыть ${style.icon}`;
    openBtn.style.cssText = `
        background: linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd);
        color: #fff;
        border: none;
        padding: 18px 50px;
        border-radius: 20px;
        font-size: 22px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 40px ${style.shadowColor};
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        min-width: 200px;
    `;
    openBtn.onmouseover = function() { 
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = `0 6px 50px ${style.shadowColor}`;
    };
    openBtn.onmouseout = function() { 
        this.style.transform = 'scale(1)';
        this.style.boxShadow = `0 4px 40px ${style.shadowColor}`;
    };
    openBtn.onclick = function() {
        // Проверяем баланс при нажатии
        checkBalance(type).then(canOpen => {
            if (!canOpen) {
                return;
            }
            startFinalSpin(type);
        });
    };
    btnContainer.appendChild(openBtn);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '🔙 Назад';
    closeBtn.style.cssText = `
        background: rgba(255,255,255,0.08);
        color: #fff;
        border: none;
        padding: 18px 50px;
        border-radius: 20px;
        font-size: 22px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        min-width: 200px;
    `;
    closeBtn.onmouseover = function() { this.style.background = 'rgba(255,255,255,0.15)'; };
    closeBtn.onmouseout = function() { this.style.background = 'rgba(255,255,255,0.08)'; };
    closeBtn.onclick = function() {
        if (_tapeInterval) clearInterval(_tapeInterval);
        tapeContainer.remove();
        _isOpening = false;
    };
    
    btnContainer.appendChild(closeBtn);
    bottomSection.appendChild(btnContainer);
    tapeContainer.appendChild(bottomSection);
    
    document.body.appendChild(tapeContainer);
    
    let activeIndex = 0;
    const totalItems = prizes.length;
    
    _tapeInterval = setInterval(() => {
        document.querySelectorAll('.prize-item').forEach(el => {
            el.style.color = style.itemColor;
            el.style.textShadow = `0 0 20px ${style.glowColor}`;
            el.style.transform = 'scale(1)';
            el.style.transition = 'all 0.3s ease';
        });
        
        const idx = activeIndex % totalItems;
        const target = document.querySelector(`.prize-item[data-index="${idx}"]`);
        if (target) {
            target.style.color = '#FFFFFF';
            target.style.textShadow = `
                0 0 40px ${style.highlightColor},
                0 0 80px ${style.highlightColor},
                0 0 120px ${style.highlightColor}80,
                0 0 200px ${style.highlightColor}40
            `;
            target.style.transform = 'scale(1.6)';
            target.style.fontWeight = '900';
            target.style.transition = 'all 0.2s ease';
        }
        activeIndex++;
    }, 400);
    
    tapeContainer._highlightInterval = _tapeInterval;
}
