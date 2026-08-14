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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const getPrizes = (type) => CONFIG.CASE_PRIZES[type] || [1,10,100];
const getStyle = (type) => CONFIG.CASE_STYLES[type] || CONFIG.CASE_STYLES['free'];
const getPrice = (type) => CONFIG.CASE_PRICES[type] || 0;

// Редкость наград free-кейса (шансы решает сервер, тут только визуал)
const FREE_RARITY = [
    { max: 2,   cls: 'rarity-common',  label: 'COMMON'  },
    { max: 4,   cls: 'rarity-rare',    label: 'RARE'    },
    { max: 10,  cls: 'rarity-epic',    label: 'EPIC'    },
    { max: 100, cls: 'rarity-legend',  label: 'LEGEND'  },
    { max: Infinity, cls: 'rarity-jackpot', label: 'JACKPOT' }
];
const getFreeRarity = (value) => {
    for (const r of FREE_RARITY) {
        if (value <= r.max) return r;
    }
    return FREE_RARITY[FREE_RARITY.length - 1];
};

// ===============================
// THREE.JS 3D СЛОЙ
// Если CDN не загрузился (THREE undefined) — все 3D-сцены
// молча отключаются, работает старая 2D-рулетка.
// ===============================
const THREE_OK = typeof THREE !== 'undefined';

// CSS-цвет ('#rrggbb' / 'rgb(a)(r,g,b,a)') -> THREE.Color
function _threeColor(css, fallback = 0xffffff) {
    if (!THREE_OK) return null;
    try {
        if (typeof css === 'string' && css[0] === '#') return new THREE.Color(css);
        const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(css || '');
        if (m) return new THREE.Color(+m[1] / 255, +m[2] / 255, +m[3] / 255);
    } catch (e) { /* ignore */ }
    return new THREE.Color(fallback);
}

// Радиальная glow-текстура для вспышек (генерируется процедурно, без файлов)
function _threeGlowTexture(colorCss) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, colorCss);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    return tex;
}

// Полная утилизация сцены: геометрии, материалы, текстуры, WebGL-контекст
function _threeDisposeScene(scene, renderer) {
    try {
        if (scene) {
            scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                    mats.forEach(m => {
                        if (m.map) m.map.dispose();
                        m.dispose();
                    });
                }
            });
        }
        if (renderer) {
            renderer.dispose();
            if (renderer.forceContextLoss) renderer.forceContextLoss();
        }
    } catch (e) { console.warn('3D dispose error:', e); }
}

// Звёздное поле (Points)
function _threeStars(count, spread, color, size, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 2] = (Math.random() - 0.5) * spread - 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        color, size, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    return new THREE.Points(geo, mat);
}

// Общий каркас fullscreen 3D-оверлея: renderer + rAF + skip + dispose
function _threeSceneOverlay(overlayId, labelText, buildScene, onDone) {
    if (!THREE_OK) { onDone(); return; }

    const old = document.getElementById(overlayId);
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'three3d-overlay';

    let renderer = null;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { renderer = null; }
    if (!renderer) { overlay.remove(); onDone(); return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    overlay.appendChild(renderer.domElement);

    if (labelText) {
        const label = document.createElement('div');
        label.className = 'three3d-label';
        label.textContent = labelText;
        overlay.appendChild(label);
    }

    const skipBtn = document.createElement('button');
    skipBtn.className = 'three3d-skip';
    skipBtn.textContent = '⏭ Пропустить';
    overlay.appendChild(skipBtn);

    document.body.appendChild(overlay);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.6, 7);
    camera.lookAt(0, 0.2, 0);

    const ctx = {
        scene, camera, renderer,
        clock: new THREE.Clock(),
        openTriggered: false,
        opened: false
    };
    try {
        buildScene(ctx);
    } catch (e) {
        console.error('3D build error:', e);
        _threeDisposeScene(scene, renderer);
        overlay.remove();
        onDone();
        return;
    }

    let rafId = null;
    let doneFired = false;
    let disposed = false;

    const fireDone = () => {
        if (doneFired) return;
        doneFired = true;
        try { onDone(); } catch (e) { console.error(e); }
    };

    const disposeAll = () => {
        if (disposed) return;
        disposed = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        _threeDisposeScene(scene, renderer);
        if (overlay.parentNode) overlay.remove();
    };

    // Плавный fade -> показать рулетку под оверлеем -> удалить сцену
    const finish = () => {
        if (doneFired) return;
        overlay.style.opacity = '0';
        fireDone();
        setTimeout(disposeAll, 480);
    };

    skipBtn.onclick = finish;

    const onResize = () => {
        if (disposed) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const FADE_AT = ctx.fadeAt || 3.6;   // когда начинать fade в рулетку
    const HARD_CAP = FADE_AT + 2.5;      // страховка от зависания

    const tick = () => {
        if (disposed) return;
        // Оверлей удалили извне (closeAllOverlays и т.п.) — приз уже оплачен сервером,
        // поэтому всё равно отдаём управление рулетке
        if (!overlay.isConnected) { fireDone(); disposeAll(); return; }
        rafId = requestAnimationFrame(tick);
        const dt = Math.min(ctx.clock.getDelta(), 0.05);
        const t = ctx.clock.elapsedTime;
        try {
            ctx.update && ctx.update(t, dt, finish);
            renderer.render(scene, camera);
        } catch (e) {
            console.error('3D tick error:', e);
            finish();
            return;
        }
        if (t >= FADE_AT) finish();
        if (t >= HARD_CAP) { fireDone(); disposeAll(); }
    };
    rafId = requestAnimationFrame(tick);
}

// ----- Сцена 1: 3D-открытие кейса -----
function playCaseOpening3D(type, onDone) {
    if (!THREE_OK) { onDone(); return; }
    const style = getStyle(type);
    const bodyColor = _threeColor(style.titleColor, 0x8b7cf0);
    const itemColor = _threeColor(style.itemColor, 0xc4b5fd);

    _threeSceneOverlay('case3dOverlay', `✦ ${type.toUpperCase()} CASE ✦`, (ctx) => {
        const { scene } = ctx;
        ctx.fadeAt = 3.7;

        scene.add(new THREE.AmbientLight(0x666688, 0.8));
        const dir = new THREE.DirectionalLight(0xffffff, 0.9);
        dir.position.set(4, 6, 5);
        scene.add(dir);
        const rim = new THREE.PointLight(itemColor, 1.2, 15);
        rim.position.set(-3, 2, 3);
        scene.add(rim);

        // Процедурный кейс: корпус + крышка + защёлка + светящиеся рёбра
        const caseGroup = new THREE.Group();
        const caseMat = new THREE.MeshStandardMaterial({
            color: bodyColor, metalness: 0.55, roughness: 0.35,
            emissive: bodyColor, emissiveIntensity: 0.18
        });
        const bodyGeo = new THREE.BoxGeometry(2.4, 1.5, 1.7);
        const bodyMesh = new THREE.Mesh(bodyGeo, caseMat);
        bodyMesh.position.y = -0.15;
        bodyMesh.add(new THREE.LineSegments(
            new THREE.EdgesGeometry(bodyGeo),
            new THREE.LineBasicMaterial({ color: itemColor })
        ));
        caseGroup.add(bodyMesh);

        const lidGeo = new THREE.BoxGeometry(2.5, 0.55, 1.8);
        const lidMesh = new THREE.Mesh(lidGeo, caseMat.clone());
        lidMesh.position.y = 0.9;
        lidMesh.add(new THREE.LineSegments(
            new THREE.EdgesGeometry(lidGeo),
            new THREE.LineBasicMaterial({ color: itemColor })
        ));
        caseGroup.add(lidMesh);

        const latch = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.5, 0.14),
            new THREE.MeshStandardMaterial({
                color: itemColor, metalness: 0.7, roughness: 0.25,
                emissive: itemColor, emissiveIntensity: 0.6
            })
        );
        latch.position.set(0, 0.55, 0.92);
        caseGroup.add(latch);

        scene.add(caseGroup);
        scene.add(_threeStars(260, 26, 0x9b96b0, 0.07, 0.8));

        // Вспышка и вылетающие частицы (активируются при открытии)
        const flashLight = new THREE.PointLight(itemColor, 0, 25);
        flashLight.position.set(0, 0.6, 1.2);
        scene.add(flashLight);

        const flashSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: _threeGlowTexture(style.itemColor),
            transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false
        }));
        flashSprite.position.set(0, 0.6, 0);
        flashSprite.scale.set(0.1, 0.1, 0.1);
        scene.add(flashSprite);

        const burstCount = 140;
        const burstPos = new Float32Array(burstCount * 3);
        const burstVel = [];
        for (let i = 0; i < burstCount; i++) {
            burstPos[i * 3] = 0; burstPos[i * 3 + 1] = 0.6; burstPos[i * 3 + 2] = 0;
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            const sp = 2 + Math.random() * 4;
            burstVel.push(new THREE.Vector3(
                Math.sin(ph) * Math.cos(th) * sp,
                Math.abs(Math.cos(ph)) * sp * 0.9 + 1.2,
                Math.sin(ph) * Math.sin(th) * sp
            ));
        }
        const burstGeo = new THREE.BufferGeometry();
        burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
        const burst = new THREE.Points(burstGeo, new THREE.PointsMaterial({
            color: itemColor, size: 0.13, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending, depthWrite: false
        }));
        burst.visible = false;
        scene.add(burst);

        const lidVel = new THREE.Vector3();
        const lidSpin = Math.random() > 0.5 ? 6 : -6;
        const SPIN_END = 1.2, SHAKE_END = 2.7;

        ctx.update = (t, dt) => {
            const stars = scene.children.find(o => o.isPoints && o !== burst);
            if (stars) stars.rotation.y += dt * 0.02;

            if (!ctx.opened) {
                // 0..SPIN_END — медленное вращение; SPIN_END..SHAKE_END — разгон и тряска
                const shakeK = Math.min(Math.max((t - SPIN_END) / (SHAKE_END - SPIN_END), 0), 1);
                const speed = 0.7 + shakeK * 6.5;
                caseGroup.rotation.y += dt * speed;
                caseGroup.position.y = Math.sin(t * 2) * 0.08 + Math.sin(t * 55) * 0.05 * shakeK;
                caseGroup.position.x = Math.sin(t * 63) * 0.04 * shakeK;
                lidMesh.position.y = 0.9 + Math.sin(t * 71) * 0.05 * shakeK;
                rim.intensity = 1.2 + shakeK * 1.5;

                if (t >= SHAKE_END) {
                    ctx.opened = true;
                    lidVel.set(1.2 + Math.random(), 6.0, -1.4);
                    flashLight.intensity = 9;
                    flashSprite.material.opacity = 1;
                    flashSprite.scale.set(2.5, 2.5, 2.5);
                    burst.visible = true;
                }
            } else {
                // Крышка отлетает, вспышка затухает, частицы разлетаются
                lidMesh.position.addScaledVector(lidVel, dt);
                lidVel.y -= 9.5 * dt;
                lidMesh.rotation.z += lidSpin * dt;
                lidMesh.rotation.x += lidSpin * 0.4 * dt;
                caseGroup.rotation.y += dt * 1.2;
                caseGroup.position.x *= 0.9;
                flashLight.intensity = Math.max(flashLight.intensity - dt * 14, 0);
                flashSprite.material.opacity = Math.max(flashSprite.material.opacity - dt * 1.4, 0);
                flashSprite.scale.multiplyScalar(1 + dt * 2.2);
                const arr = burst.geometry.attributes.position.array;
                for (let i = 0; i < burstCount; i++) {
                    arr[i * 3] += burstVel[i].x * dt;
                    arr[i * 3 + 1] += burstVel[i].y * dt;
                    arr[i * 3 + 2] += burstVel[i].z * dt;
                }
                burst.geometry.attributes.position.needsUpdate = true;
                burst.material.opacity = Math.max(burst.material.opacity - dt * 0.9, 0);
            }
        };
    }, onDone);
}

// ----- Сцена 2: битва с ботом — столкновение кубов VS -----
function playBattleVS3D(onDone) {
    if (!THREE_OK) { onDone(); return; }
    _threeSceneOverlay('battle3dOverlay', '⚔ VS ⚔', (ctx) => {
        const { scene } = ctx;
        ctx.fadeAt = 2.6;

        scene.add(new THREE.AmbientLight(0x666688, 0.8));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(3, 6, 5);
        scene.add(dir);

        const mkCube = (hex, x) => {
            const col = _threeColor(hex);
            const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
                color: col, metalness: 0.5, roughness: 0.3,
                emissive: col, emissiveIntensity: 0.35
            }));
            mesh.position.set(x, 0, 0);
            mesh.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geo),
                new THREE.LineBasicMaterial({ color: 0xffffff })
            ));
            scene.add(mesh);
            return mesh;
        };
        const cubeP = mkCube('#60a5fa', -3.6);   // игрок — голубой
        const cubeB = mkCube('#f87171', 3.6);    // бот — красный

        const clashLight = new THREE.PointLight(0xffffff, 0, 20);
        clashLight.position.set(0, 0, 1.5);
        scene.add(clashLight);

        const clashSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: _threeGlowTexture('rgba(255,255,255,0.9)'),
            transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false
        }));
        clashSprite.scale.set(0.1, 0.1, 0.1);
        scene.add(clashSprite);

        scene.add(_threeStars(160, 24, 0x8b8798, 0.07, 0.7));

        const COLLIDE_AT = 1.5;
        ctx.update = (t, dt) => {
            cubeP.rotation.x += dt * 3; cubeP.rotation.y += dt * 4;
            cubeB.rotation.x -= dt * 3; cubeB.rotation.y -= dt * 4;

            if (!ctx.opened) {
                const k = Math.min(t / COLLIDE_AT, 1);
                const ease = 1 - Math.pow(1 - k, 2);
                cubeP.position.x = -3.6 + ease * 2.9;
                cubeB.position.x = 3.6 - ease * 2.9;
                if (t >= COLLIDE_AT) {
                    ctx.opened = true;
                    clashLight.intensity = 10;
                    clashSprite.material.opacity = 1;
                    clashSprite.scale.set(1.5, 1.5, 1.5);
                }
            } else {
                // Отскок после столкновения
                cubeP.position.x = Math.max(cubeP.position.x - dt * 2.4, -1.6);
                cubeB.position.x = Math.min(cubeB.position.x + dt * 2.4, 1.6);
                cubeP.rotation.z += dt * 5;
                cubeB.rotation.z -= dt * 5;
                clashLight.intensity = Math.max(clashLight.intensity - dt * 12, 0);
                clashSprite.material.opacity = Math.max(clashSprite.material.opacity - dt * 1.6, 0);
                clashSprite.scale.multiplyScalar(1 + dt * 3);
            }
        };
    }, onDone);
}

// ----- Сцена 3: фон главного экрана (один shared renderer) -----
let _bg3dStarted = false;
function initMainBg3D() {
    if (!THREE_OK || _bg3dStarted) return;
    if (document.getElementById('bg3dCanvas')) return;

    let renderer = null;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
    } catch (e) { return; }
    if (!renderer) return;
    _bg3dStarted = true;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.id = 'bg3dCanvas';
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60);
    camera.position.z = 9;

    const stars = _threeStars(50, 18, 0xa78bfa, 0.14, 0.38);
    scene.add(stars);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    const loop = () => {
        requestAnimationFrame(loop);
        // Pause: вкладка скрыта / главный экран не активен / идёт 3D-оверлей
        if (document.hidden) return;
        const main = document.getElementById('mainScreen');
        if (!main || !main.classList.contains('active')) return;
        if (document.querySelector('.three3d-overlay')) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        stars.rotation.y += dt * 0.015;
        stars.rotation.x += dt * 0.006;
        renderer.render(scene, camera);
    };
    loop();
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
    const rarity = caseType === 'free' ? getFreeRarity(value) : null;
    const div = document.createElement('div');
    div.className = 'card' + (rarity ? ' ' + rarity.cls : '');
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
    if (rarity) {
        div.style.flexDirection = 'column';
        div.style.gap = '5px';
        const valSpan = document.createElement('div');
        valSpan.textContent = value + '⭐';
        const badge = document.createElement('div');
        badge.className = 'rarity-badge ' + rarity.cls;
        badge.textContent = rarity.label;
        div.appendChild(valSpan);
        div.appendChild(badge);
    } else {
        div.textContent = value + '⭐';
    }
    return div;
};

// ===== КАСТОМНОЕ ОКНО =====
function showCustomAlert(message, isSuccess = false) {
    const old = document.getElementById('customAlertOverlay');
    if (old) old.remove();

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

    const color = isSuccess ? '#4ade80' : '#f87171';
    const icon = isSuccess ? '✅' : '❌';

    overlay.innerHTML = `
        <div style="font-size:48px; margin-bottom:10px;">${icon}</div>
        <div style="font-size:20px; font-weight:600; color:${color}; text-align:center; max-width:350px; word-wrap:break-word;">${message}</div>
        <button onclick="this.closest('#customAlertOverlay').remove()" style="margin-top:20px; padding:12px 40px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-size:16px; font-weight:600; cursor:pointer;">
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
        if (DOM.profileRefs) DOM.profileRefs.textContent = data.refs;
        if (DOM.inviteLink) DOM.inviteLink.value = 'https://t.me/Randevucase_bot?start=' + user_id;
    }
}

function updateAllBalances(newBalance) {
    if (DOM.balance) DOM.balance.textContent = '⭐ ' + newBalance;
    if (DOM.balanceValue) DOM.balanceValue.textContent = newBalance + ' ⭐';
    if (DOM.profileBalance) DOM.profileBalance.textContent = newBalance;
}

// ===== ЕЖЕДНЕВНЫЙ БОНУС =====
async function claimDaily() {
    const btn = document.getElementById('dailyBtn');
    if (btn) btn.disabled = true;

    const data = await apiRequest('/claim_daily');

    if (btn) btn.disabled = false;

    if (data.error) {
        showCustomAlert('⏳ ' + data.error);
        return;
    }
    if (data.success) {
        if (data.new_balance !== undefined) updateAllBalances(data.new_balance);
        showCustomAlert(`🎁 Ежедневный бонус: +${data.reward}⭐!`, true);
        loadBalance();
    }
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

    const repeats = 20;
    const winPosition = 10;

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
        const el = createCardElement(value, style, cardWidth, mode === 'preview' ? 140 : 120, type);
        cards.push(el);
    }
    cards.forEach(c => track.appendChild(c));
    viewport.appendChild(track);

    if (mode === 'preview') {
        const oldScrollStyle = document.getElementById('previewScrollStyle');
        if (oldScrollStyle) oldScrollStyle.remove();
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

        const userBalance = parseInt(DOM.balance.textContent.replace('⭐ ', '')) || 0;
        const hasEnough = userBalance >= price;
        const totalPrice = price * 10;
        const hasEnoughFor10 = userBalance >= totalPrice;

        if (hasEnough) {
            const openBtn = document.createElement('button');
            openBtn.textContent = price > 0 ? `🎲 Открыть (${price}⭐)` : '🎁 Открыть бесплатно';
            Object.assign(openBtn.style, {
                background: `linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd)`,
                color: '#fff',
                border: 'none',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
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

        if (type !== 'free') {
            const open10Btn = document.createElement('button');
            open10Btn.textContent = hasEnoughFor10 ? `🎲 Открыть ×10 (${totalPrice}⭐)` : `🔒 ×10 (${totalPrice}⭐)`;
            Object.assign(open10Btn.style, hasEnoughFor10 ? {
                background: 'linear-gradient(135deg, #ffd700, #f9a825)',
                color: '#000',
                border: 'none',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 30px rgba(255,215,0,0.3)',
                minWidth: '170px'
            } : {
                background: 'rgba(255,0,0,0.08)',
                color: '#666',
                border: '2px solid rgba(255,0,0,0.15)',
                padding: '14px 40px',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'not-allowed',
                minWidth: '170px'
            });
            if (hasEnoughFor10) {
                open10Btn.onclick = () => {
                    closeAllOverlays();
                    setTimeout(() => open10Cases(type), 300);
                };
            }
            btnContainer.appendChild(open10Btn);
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
            const startRoulette = () => {
                showTape(type, 'roulette');
                setTimeout(() => startFinalSpin(type), 300);
            };
            // 3D-открытие кейса; без Three.js — сразу старая рулетка
            playCaseOpening3D(type, startRoulette);
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

    track.style.transition = `transform 4000ms cubic-bezier(0.1, 1, 0.1, 1)`;
    track.style.transform = `translateX(-${finalShift}px)`;

    let finished = false;
    const onFinish = () => {
        if (finished) return;
        finished = true;
        track.removeEventListener('transitionend', onFinish);
        showResult(type, targetPrize, style, track, winPosition);
    };
    track.addEventListener('transitionend', onFinish);
    setTimeout(() => {
        if (!finished) {
            finished = true;
            track.removeEventListener('transitionend', onFinish);
            showResult(type, targetPrize, style, track, winPosition);
        }
    }, 5000);
}

function showResult(type, targetPrize, style, track, winPosition) {
    const cards = track.querySelectorAll('.card');
    cards.forEach(el => {
        el.style.background = 'rgba(255,255,255,0.04)';
        el.style.border = '1px solid rgba(255,255,255,0.06)';
        el.style.color = style.itemColor;
        el.style.textShadow = `0 0 20px ${style.glowColor}`;
    });

    const winCard = cards[winPosition];
    if (winCard) {
        winCard.classList.add('win-card');
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

        const newBalance = state.currentNewBalance;

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
            backdropFilter: 'blur(10px)'
        });
        balanceDisplay.textContent = newBalance !== null && newBalance !== undefined ? `💰 ⭐ ${newBalance}` : `💰 ${DOM.balance.textContent}`;
        resultContainer.appendChild(balanceDisplay);

        const winText = document.createElement('div');
        Object.assign(winText.style, {
            fontSize: '64px',
            fontWeight: '900',
            color: '#FFD700',
            textShadow: '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3)',
            marginBottom: '10px',
            textAlign: 'center'
        });
        winText.textContent = `⭐ ${targetPrize}`;

        const subText = document.createElement('div');
        Object.assign(subText.style, {
            fontSize: '24px',
            fontWeight: '600',
            color: '#FFF8E7',
            textShadow: '0 0 20px rgba(255,215,0,0.3)',
            marginBottom: '20px'
        });
        subText.textContent = 'Ты выиграл!';

        resultContainer.appendChild(winText);
        resultContainer.appendChild(subText);

        if (state.currentAd) {
            const adBlock = document.createElement('div');
            adBlock.style.cssText = 'color:#aaa; font-size:14px; margin-bottom:16px; text-align:center;';
            adBlock.textContent = '📢 ' + state.currentAd;
            resultContainer.appendChild(adBlock);
        }

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex; gap:16px; flex-wrap:wrap; justify-content:center;';

        const price = getPrice(type);
        const againBtn = document.createElement('button');
        againBtn.textContent = price > 0 ? `🎲 Открыть ещё (${price}⭐)` : '🎁 Открыть ещё';
        Object.assign(againBtn.style, {
            background: `linear-gradient(135deg, ${style.titleColor}, ${style.titleColor}dd)`,
            color: '#fff',
            border: 'none',
            padding: '14px 36px',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: `0 4px 30px ${style.shadowColor}`,
            minWidth: '160px'
        });
        againBtn.onclick = function() {
            closeAllOverlays();
            setTimeout(() => openCaseDirect(type), 300);
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
            minWidth: '160px'
        });
        backBtn.onclick = function() {
            closeAllOverlays();
            showMain();
        };

        btnContainer.appendChild(againBtn);
        btnContainer.appendChild(backBtn);
        resultContainer.appendChild(btnContainer);

        document.body.appendChild(resultContainer);

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

    const title = document.createElement('div');
    Object.assign(title.style, {
        fontSize: '20px',
        fontWeight: '800',
        color: style.titleColor,
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textShadow: `0 0 40px ${style.glowColor}`,
        textAlign: 'center',
        flexShrink: '0'
    });
    title.textContent = `🎰 ${type.toUpperCase()} ×10`;
    overlay.appendChild(title);

    const balanceDisplay = document.createElement('div');
    Object.assign(balanceDisplay.style, {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255,255,255,0.08)',
        padding: '8px 16px',
        borderRadius: '30px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#FFD700',
        border: '1px solid rgba(255,215,0,0.2)',
        backdropFilter: 'blur(10px)',
        zIndex: '10'
    });
    balanceDisplay.textContent = `💰 ${DOM.balance.textContent}`;
    overlay.appendChild(balanceDisplay);

    const gridContainer = document.createElement('div');
    Object.assign(gridContainer.style, {
        width: '95%',
        maxWidth: '650px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        margin: '0 auto 16px',
        flexShrink: '0'
    });

    const cardWidth = 70;
    const cardGap = 6;
    const totalItems = prizes.length;
    const tracks = [];

    for (let r = 0; r < 10; r++) {
        const viewport = document.createElement('div');
        Object.assign(viewport.style, {
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.3)',
            height: '65px',
            flexShrink: '0'
        });

        const track = document.createElement('div');
        track.className = 'mini-track';
        track.dataset.index = r;
        Object.assign(track.style, {
            display: 'flex',
            gap: cardGap + 'px',
            padding: '6px 0',
            willChange: 'transform',
            position: 'relative',
            top: '2px',
            width: (totalItems * 3 * (cardWidth + cardGap)) + 'px'
        });

        const targetPrize = data.prizes[r] !== undefined ? data.prizes[r] : prizes[0];
        const targetIndex = Math.max(0, prizes.indexOf(targetPrize));
        const winPos = Math.floor(totalItems * 1.5) + targetIndex;

        for (let i = 0; i < totalItems * 3; i++) {
            const value = (i === winPos) ? targetPrize : prizes[Math.floor(Math.random() * prizes.length)];
            const isLarge = value > 1000;
            const card = document.createElement('div');
            Object.assign(card.style, {
                width: cardWidth + 'px',
                height: '50px',
                flexShrink: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: isLarge ? '10px' : '12px',
                fontWeight: '700',
                color: style.itemColor,
                textShadow: `0 0 20px ${style.glowColor}`,
                padding: '0 2px'
            });
            card.textContent = value + '⭐';
            track.appendChild(card);
        }

        const marker = document.createElement('div');
        Object.assign(marker.style, {
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '18px',
            color: style.highlightColor,
            textShadow: `0 0 20px ${style.highlightColor}`,
            pointerEvents: 'none',
            lineHeight: '1',
            zIndex: '5'
        });
        marker.textContent = '▼';

        viewport.appendChild(track);
        viewport.appendChild(marker);
        gridContainer.appendChild(viewport);
        tracks.push(track);
    }

    overlay.appendChild(gridContainer);

    const statusText = document.createElement('div');
    Object.assign(statusText.style, {
        color: style.titleColor,
        fontSize: '16px',
        fontWeight: '600',
        opacity: '0.6',
        textAlign: 'center',
        letterSpacing: '1px',
        flexShrink: '0',
        marginBottom: '4px'
    });
    statusText.textContent = '🎰 Открытие...';
    overlay.appendChild(statusText);

    document.body.appendChild(overlay);

    setTimeout(() => {
        tracks.forEach((track, index) => {
            const targetPrize = data.prizes[index] !== undefined ? data.prizes[index] : prizes[0];
            const targetIndex = Math.max(0, prizes.indexOf(targetPrize));
            const winPos = Math.floor(totalItems * 1.5) + targetIndex;

            const viewportWidth = track.parentElement.offsetWidth || 200;
            const centerOffset = viewportWidth / 2;
            const shift = (winPos * (cardWidth + cardGap)) - centerOffset + (cardWidth / 2);
            const noise = Math.floor(Math.random() * 20) - 10;

            track.style.transition = `transform ${4000 + Math.random() * 1000}ms cubic-bezier(0.1, 1, 0.1, 1)`;
            track.style.transform = `translateX(-${shift + noise}px)`;
        });

        setTimeout(() => {
            tracks.forEach((track, index) => {
                const cards = track.querySelectorAll('.mini-track > div');
                const targetPrize = data.prizes[index] !== undefined ? data.prizes[index] : prizes[0];
                const targetIndex = Math.max(0, prizes.indexOf(targetPrize));
                const winPos = Math.floor(totalItems * 1.5) + targetIndex;

                if (cards[winPos]) {
                    cards[winPos].style.background = 'rgba(255,215,0,0.2)';
                    cards[winPos].style.border = '2px solid #ffd700';
                    cards[winPos].style.color = '#FFFFFF';
                    cards[winPos].style.textShadow = '0 0 30px #ffd700';
                }
            });

            setTimeout(() => {
                const totalPrize = data.total_prize !== undefined ? data.total_prize : data.prizes.reduce((a, b) => a + b, 0);

                overlay.innerHTML = `
                    <div style="font-size:72px; margin-bottom:4px;">🎉</div>
                    <div style="font-size:28px; font-weight:800; color:#4ade80; margin-bottom:4px;">ТЫ ВЫИГРАЛ!</div>
                    <div style="font-size:48px; font-weight:900; color:#ffd700; text-shadow:0 0 40px rgba(255,215,0,0.3);">${totalPrize}⭐</div>
                    <div style="font-size:16px; color:#aaa; margin-bottom:12px; display:flex; flex-wrap:wrap; justify-content:center; gap:6px; max-width:400px;">
                        ${data.prizes.map(p => `<span style="background:rgba(255,255,255,0.04); padding:4px 12px; border-radius:8px; border:1px solid rgba(255,215,0,0.1); font-size:14px; font-weight:600; color:${style.itemColor};">${p}⭐</span>`).join('')}
                    </div>
                    <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
                        <button onclick="closeAllOverlays(); open10Cases('${type}')" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b39df7, #8b7cf0); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🎲 ОТКРЫТЬ ЕЩЁ ×10</button>
                        <button onclick="closeAllOverlays(); showMain();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
                    </div>
                `;

                loadBalance();
            }, 800);
        }, 5000);
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
            buttonHTML = `<button class="level-play-btn" onclick="startLevel('${level.caseType}')">⚔️ Играть</button>`;
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
            inner += `<div class="level-progress">🔒 Победи бота 3 раза на предыдущем уровне</div>`;
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
    const level = LEVELS.find(l => l.caseType === case_type);
    const levelName = level ? level.name : case_type.toUpperCase();

    const old = document.getElementById('botBattlePreviewOverlay');
    if (old) old.remove();

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
            🆚 ${levelName}
        </div>
        <div style="display:flex; gap:40px; align-items:center; margin-bottom:16px;">
            <div style="text-align:center;">
                <div style="font-size:40px;">👤</div>
                <div style="font-weight:700; color:#4ade80;">ТЫ</div>
            </div>
            <div style="font-size:36px; font-weight:900; color:#f87171;"><img src="assets/icon_battle.png" class="battle-vs-img" alt="" onerror="this.remove()">VS</div>
            <div style="text-align:center;">
                <div style="font-size:40px;">🤖</div>
                <div style="font-weight:700; color:#f87171;">БОТ</div>
            </div>
        </div>
        <div style="color:#aaa; font-size:14px; margin-bottom:6px; text-align:center;">
            📦 Кейс: ${case_type.toUpperCase()}
        </div>
        <div style="color:#888; font-size:13px; margin-bottom:16px; text-align:center;">
            За битву спишется 10 📦 прогресса уровня
        </div>
        <button onclick="this.closest('#botBattlePreviewOverlay').remove(); startBotBattle('${case_type}');" style="padding:14px 40px; border:none; border-radius:14px; background:linear-gradient(135deg, #b39df7, #8b7cf0); color:#fff; font-size:18px; font-weight:700; cursor:pointer; box-shadow:0 4px 20px rgba(139,124,240,0.25);">
            ⚔️ НАЧАТЬ БИТВУ
        </button>
        <button onclick="this.closest('#botBattlePreviewOverlay').remove()" style="padding:12px 30px; border:none; border-radius:12px; background:rgba(255,255,255,0.06); color:#888; font-size:14px; font-weight:600; cursor:pointer; margin-top:10px;">
            🔙 НАЗАД
        </button>
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
        // 3D-сцена «VS» (столкновение кубов) перед рулетками; без Three.js — сразу рулетки
        playBattleVS3D(() => showBotRouletteAnimationWithResult(data, case_type));
    });
}

function showBotRouletteAnimationWithResult(data, case_type) {
    const style = getStyle(case_type);
    const prizes = getPrizes(case_type);

    const overlay = document.createElement('div');
    overlay.id = 'botRouletteOverlay';
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
        padding: '16px 20px',
        animation: 'fadeIn 0.3s ease'
    });

    const title = document.createElement('div');
    Object.assign(title.style, {
        fontSize: '22px',
        fontWeight: '800',
        color: style.titleColor,
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        textShadow: `0 0 40px ${style.glowColor}`,
        textAlign: 'center',
        flexShrink: '0'
    });
    title.textContent = `⚔️ ${case_type.toUpperCase()}`;
    overlay.appendChild(title);

    const container = document.createElement('div');
    container.style.cssText = 'display:flex; flex-direction:column; gap:8px; width:100%; max-width:600px; flex:1; justify-content:center;';

    const cardWidth = 120;
    const cardGap = 8;
    const totalCards = 80;
    const winPosition = 40;

    const buildCards = (target) => {
        let html = '';
        for (let i = 0; i < totalCards; i++) {
            const p = (i === winPosition) ? target : prizes[Math.floor(Math.random() * prizes.length)];
            const fontSize = p > 1000 ? '18px' : '24px';
            html += `<div class="roulette-card" style="width:${cardWidth}px; height:90px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.06); font-size:${fontSize}; font-weight:700; color:${style.itemColor}; text-shadow:0 0 20px ${style.glowColor};">${p}⭐</div>`;
        }
        return html;
    };

    const buildWrapper = (trackId, label, labelColor, target) => `
        <div style="font-size:16px; font-weight:700; color:${labelColor}; text-align:center; margin-bottom:4px; flex-shrink:0; background:${labelColor === '#4ade80' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}; padding:4px 0; border-radius:6px;">${label}</div>
        <div style="position:relative; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.3); flex:1; min-height:100px;">
            <div id="${trackId}" style="display:flex; gap:${cardGap}px; padding:8px 0; will-change:transform; position:relative; width:${totalCards * (cardWidth + cardGap)}px; height:100%; align-items:center;">
                ${buildCards(target)}
            </div>
            <div style="position:absolute; top:-4px; left:50%; transform:translateX(-50%); font-size:28px; color:${style.highlightColor}; text-shadow:0 0 30px ${style.highlightColor}; pointer-events:none; line-height:1; z-index:5;">▼</div>
        </div>
    `;

    const p1Wrapper = document.createElement('div');
    p1Wrapper.style.cssText = 'flex:1; display:flex; flex-direction:column; min-height:0; border:2px solid rgba(74,222,128,0.25); border-radius:12px; padding:6px; background:rgba(74,222,128,0.04);';
    p1Wrapper.innerHTML = buildWrapper('botRouletteTrack1', '👤 ТЫ', '#4ade80', data.player_prize);
    container.appendChild(p1Wrapper);

    const vsDiv = document.createElement('div');
    vsDiv.style.cssText = 'text-align:center; font-size:28px; font-weight:900; color:#f87171; text-shadow:0 0 30px rgba(248,113,113,0.3); flex-shrink:0; padding:4px 0;';
    vsDiv.textContent = '⚔️ VS';
    container.appendChild(vsDiv);

    const p2Wrapper = document.createElement('div');
    p2Wrapper.style.cssText = 'flex:1; display:flex; flex-direction:column; min-height:0; border:2px solid rgba(248,113,113,0.25); border-radius:12px; padding:6px; background:rgba(248,113,113,0.04);';
    p2Wrapper.innerHTML = buildWrapper('botRouletteTrack2', '🤖 БОТ', '#f87171', data.bot_prize);
    container.appendChild(p2Wrapper);

    overlay.appendChild(container);

    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `color:${style.titleColor}; font-size:16px; font-weight:600; opacity:0.6; text-align:center; letter-spacing:1px; flex-shrink:0; margin-top:4px;`;
    statusDiv.textContent = '🎰 Открытие...';
    overlay.appendChild(statusDiv);

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

        setTimeout(finishBattle, 11000);
    }, 300);
}

function showBotBattleResult(data, case_type) {
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
    const colorMap = { 'win': '#4ade80', 'lose': '#f87171', 'draw': '#e8c76a' };

    let progressHTML = '';
    if (data.wins !== undefined) {
        const wins = data.wins;
        const needed = data.needed_wins || 3;
        const filled = Array.from({ length: Math.min(wins, needed) },
            (_, i) => `<span class="win-star" style="animation-delay:${0.3 + i * 0.3}s">⭐</span>`).join('');
        const empty = '☆'.repeat(Math.max(0, needed - wins));
        progressHTML = `
            <div style="margin-top:10px; margin-bottom:10px; font-size:20px; letter-spacing:4px;">
                ${filled}${empty}
            </div>
            <div style="color:#888; font-size:13px;">
                Побед: ${wins}/${needed} ${wins >= needed ? '✅ УРОВЕНЬ ПРОЙДЕН!' : ''}
            </div>
        `;
    }

    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${iconMap[data.result] || '🎲'}</div>
        <div style="font-size:32px; font-weight:800; color:${colorMap[data.result] || '#fff'}; margin-bottom:20px;">${titleMap[data.result] || 'РЕЗУЛЬТАТ'}</div>
        <div style="display:flex; gap:40px; margin-bottom:20px;">
            <div style="text-align:center;">
                <div style="font-size:40px;">👤</div>
                <div style="font-weight:700; color:${data.result === 'win' ? '#4ade80' : '#aaa'};">ТЫ</div>
                <div style="font-size:28px; font-weight:800; color:#e8c76a;">${data.player_prize}⭐</div>
            </div>
            <div style="display:flex; align-items:center; font-size:36px; color:#f87171;">VS</div>
            <div style="text-align:center;">
                <div style="font-size:40px;">🤖</div>
                <div style="font-weight:700; color:${data.result === 'lose' ? '#4ade80' : '#aaa'};">БОТ</div>
                <div style="font-size:28px; font-weight:800; color:#e8c76a;">${data.bot_prize}⭐</div>
            </div>
        </div>
        ${progressHTML}
        <div style="background:rgba(255,255,255,0.05); border-radius:16px; padding:16px 24px; margin-bottom:20px; text-align:center;">
            <div style="color:#aaa; font-size:14px;">${data.result_text || ''}</div>
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeAllOverlays(); showLevels();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #b39df7, #8b7cf0); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                🎯 УРОВНИ
            </button>
            <button onclick="closeAllOverlays(); showLevels();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">
                🔙 НАЗАД
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
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
        <div class="unlock-icon">${icon}</div>
        <div class="unlock-title">НОВЫЙ УРОВЕНЬ ОТКРЫТ!</div>
        <div class="unlock-sub">${icon} ${name} — теперь доступен для игры</div>
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
        item.className = `quest-item ${isClaimed ? 'completed' : ''}`;
        if (!isUnlocked) item.style.opacity = '0.35';

        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name">${quest.name} ${isUnlocked ? '' : '🔒'}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">🎁 ${quest.reward}⭐</div>
                ${isUnlocked ? `
                    <div class="quest-progress-bar">
                        <div class="fill ${isComplete ? 'completed' : ''}" style="width:${progressPercent}%"></div>
                    </div>
                    <div style="font-size:12px; color:#5d5a6b; margin-top:2px;">${wins}/${quest.target} побед</div>
                ` : `
                    <div style="font-size:12px; color:#8b8798; margin-top:2px;">🔒 Откройте предыдущий уровень</div>
                `}
            </div>
            <button class="quest-btn ${isClaimed ? 'claimed' : ''}" ${(!isComplete || isClaimed || !isUnlocked) ? 'disabled' : ''} onclick="claimQuest('${quest.id}', ${quest.reward})">
                ${isClaimed ? '✅ Завершено' : isComplete ? '🎁 ЗАБРАТЬ' : isUnlocked ? `${wins}/${quest.target}` : '🔒'}
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
        item.className = `quest-item ${isClaimed ? 'completed' : ''}`;

        item.innerHTML = `
            <div class="quest-left">
                <div class="quest-name">👥 ${quest.name}</div>
                <div class="quest-desc">${quest.desc}</div>
                <div class="quest-reward">🎁 ${quest.reward}⭐</div>
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
        showCustomAlert(`✅ Получено ${data.reward !== undefined ? data.reward : reward}⭐!`, true);
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
        showCustomAlert(`✅ Промокод активирован! Получено ${data.reward}⭐`, true);
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
    firstVisit: true
};

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
            <div style="font-size:20px; font-weight:800; color:#4ade80;">💥 КРАШ</div>
        </div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:12px;">
            <span style="font-size:14px; color:#888;">Игр: <b id="gc_games" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Побед: <b id="gc_wins" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Поражений: <b id="gc_losses" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Лучший: <b id="gc_best" style="color:#fff;">x1.0</b></span>
        </div>
        <div style="text-align:center; padding:16px 0; background:rgba(255,255,255,0.04); border-radius:24px; margin-bottom:16px;">
            <div id="gc_chart" style="position:relative; width:100%; height:130px; background:rgba(0,0,0,0.3); border-radius:12px; overflow:hidden; margin-bottom:8px; border:1px solid rgba(255,255,255,0.04);">
                <canvas id="gc_canvas" width="400" height="130" style="width:100%; height:130px; display:block;"></canvas>
                <div id="gc_multiplier" style="position:absolute; top:6px; right:12px; font-size:32px; font-weight:900; color:#4ade80; text-shadow:0 0 30px rgba(74,222,128,0.3); transition:none; line-height:1;">x1.00</div>
                <div style="position:absolute; bottom:0; left:0; right:0; height:3px; background:rgba(255,255,255,0.08);">
                    <div id="gc_progress" style="height:100%; width:0%; background:linear-gradient(90deg, #4ade80, #e8c76a, #f87171); border-radius:0 3px 3px 0; transition:width 0.1s ease;"></div>
                </div>
            </div>
            <div id="gc_status" style="font-size:15px; color:#888; margin-top:2px;"></div>
            <div id="gc_timer" style="font-size:13px; color:#5d5a6b; margin-top:2px; transition:none; animation:none;"></div>
        </div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:16px;">
            <div style="color:#aaa; font-size:14px;">Ставка: <b id="gc_bet_display" style="color:#fff;">0</b>⭐</div>
            <div style="color:#aaa; font-size:14px;">Множитель: <b id="gc_multiplier_display" style="color:#e8c76a;">x1.00</b></div>
            <div style="color:#aaa; font-size:14px;">Выигрыш: <b id="gc_potential" style="color:#4ade80;">0</b>⭐</div>
        </div>
        <div style="margin-bottom:12px;">
            <div style="color:#aaa; font-size:14px; margin-bottom:6px;">Ставка (1-1000⭐):</div>
            <input type="number" id="gc_bet_input" min="1" max="1000" value="10" style="width:100%; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
        </div>
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
        best: document.getElementById('gc_best')
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
            crash.dom.potential.textContent = Math.floor(bet * crash.multiplier * 0.95) + '⭐';
        }
        loadBalance();
    }
}

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

    const maxVal = Math.max(...data, 1);
    const topOffset = 5;
    const bottomOffset = 10;
    const availableHeight = h - topOffset - bottomOffset;
    const scaleY = availableHeight / (maxVal * 0.5);
    const scaleX = (w - 20) / Math.max(data.length - 1, 1);

    const currentVal = data[data.length - 1] || 1.00;
    const lineColor = crashColor(currentVal);

    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 12;

    data.forEach((val, i) => {
        const x = 10 + i * scaleX;
        const y = h - bottomOffset - (val * scaleY);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    const lastX = 10 + (data.length - 1) * scaleX;
    const lastY = h - bottomOffset - (data[data.length - 1] * scaleY);
    ctx.lineTo(lastX, h - bottomOffset);
    ctx.lineTo(10, h - bottomOffset);
    ctx.closePath();
    ctx.fillStyle = crashColor(currentVal, 0.09);
    ctx.fill();

    const color = lineColor;

    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (d.multiplier) {
        d.multiplier.textContent = `x${currentVal.toFixed(2)}`;
        d.multiplier.style.color = color;
        d.multiplier.style.textShadow = `0 0 30px ${crashColor(currentVal, 0.45)}`;
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
        d.potential.textContent = potential + '⭐';
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
    }
    if (d.progress) d.progress.style.width = '0%';
    if (d.potential) d.potential.textContent = '0⭐';
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
                if (d.status) d.status.textContent = '';
                d.startBtn.textContent = '💰 СДЕЛАТЬ СТАВКУ';
                d.startBtn.style.display = 'inline-block';
                d.startBtn.disabled = true;
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                if (d.timer) d.timer.textContent = '';
            }

            else if (status.phase === 'waiting') {
                if (d.multiplier) {
                    d.multiplier.textContent = 'x1.00';
                    d.multiplier.style.color = '#4ade80';
                }
                if (d.status) d.status.textContent = '⏳ Окно ставок';
                if (d.timer) {
                    d.timer.textContent = `${Math.ceil(status.waiting_time || 0)} сек`;
                    d.timer.style.color = '#e8c76a';
                }
                d.startBtn.textContent = '💰 СДЕЛАТЬ СТАВКУ';
                d.startBtn.style.display = 'inline-block';
                d.startBtn.disabled = false;
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                if (d.progress) d.progress.style.width = '0%';
            }

            else if (status.phase === 'active') {
                if (prevPhase !== 'active') resetCrashChart();
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
            }

            else if (status.phase === 'crashed' || status.phase === 'crash') {
                if (d.status) d.status.textContent = `💥 КРАШ на x${(status.multiplier || 1).toFixed(2)}`;
                // Красная вспышка на экране краша (только в момент перехода)
                if (prevPhase !== 'crashed' && prevPhase !== 'crash') {
                    const chart = document.getElementById('gc_chart');
                    if (chart) {
                        chart.classList.remove('gc-crash-flash');
                        void chart.offsetWidth;
                        chart.classList.add('gc-crash-flash');
                    }
                    if (d.multiplier) {
                        d.multiplier.style.color = '#f87171';
                        d.multiplier.style.textShadow = '0 0 40px rgba(248,113,113,0.6)';
                    }
                }
                if (crash.hasBet) {
                    // Ставка не была забрана до краша — проигрыш (учитывается сервером)
                    crash.hasBet = false;
                    crash.bet = 0;
                    if (d.betDisplay) d.betDisplay.textContent = '0';
                    loadBalance();
                    loadCrashStats();
                }
                if (d.cashoutBtn) d.cashoutBtn.style.display = 'none';
                d.startBtn.style.display = 'inline-block';
                d.startBtn.disabled = true;
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
    const mult = data.multiplier !== undefined ? ` (x${data.multiplier})` : '';
    showCustomAlert(`💰 Выигрыш: ${win}⭐${mult}`, true);

    crash.hasBet = false;
    crash.bet = 0;
    if (crash.dom.betDisplay) crash.dom.betDisplay.textContent = '0';
    if (crash.dom.cashoutBtn) crash.dom.cashoutBtn.style.display = 'none';

    if (data.balance !== undefined) updateAllBalances(data.balance);
    else loadBalance();
    loadCrashStats();
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
            <div style="font-size:20px; font-weight:800; color:#f87171;">💣 МИНЁР</div>
        </div>
        <div style="color:#8b8798; font-size:14px; text-align:center; margin-bottom:12px;">Открывайте клетки, избегайте мин и забирайте выигрыш!</div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:12px;">
            <span style="font-size:14px; color:#888;">Игр: <b id="gm_games" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Побед: <b id="gm_wins" style="color:#fff;">0</b></span>
            <span style="font-size:14px; color:#888;">Поражений: <b id="gm_losses" style="color:#fff;">0</b></span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:8px; max-width:400px; margin:0 auto 16px;" id="gm_board"></div>
        <div class="game-panel" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; border-radius:16px; padding:14px; margin-bottom:16px;">
            <div style="color:#aaa; font-size:14px;">Ставка: <b id="gm_bet_display" style="color:#fff;">0</b>⭐</div>
            <div style="color:#aaa; font-size:14px;">Мин: <b id="gm_count_display" style="color:#fff;">0</b></div>
            <div style="color:#aaa; font-size:14px;">Множитель: <b id="gm_multiplier_display" style="color:#e8c76a;">x1.0</b></div>
            <div style="color:#aaa; font-size:14px; grid-column:span 3;">Открыто: <b id="gm_opened_display" style="color:#4ade80;">0</b> / <span id="gm_total_safe">0</span></div>
        </div>
        <div style="margin-bottom:12px;">
            <div style="color:#aaa; font-size:14px; margin-bottom:6px;">Ставка (3-1000⭐):</div>
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
        <button id="gm_cashout_btn" style="display:none; width:100%; padding:16px; border:none; border-radius:16px; background:linear-gradient(135deg,#e8c76a,#c89a3e); color:#241a05; font-weight:800; font-size:18px; cursor:pointer; margin-top:10px;">💰 ЗАБРАТЬ ВЫИГРЫШ (<span id="gm_cashout_amount">0</span>⭐)</button>
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
        cell.textContent = '❓';
        cell.style.cssText = 'aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:700; background:rgba(255,255,255,0.04); border-radius:12px; border:1px solid rgba(255,255,255,0.06); cursor:pointer; transition:all 0.15s ease; user-select:none; color:#fff; min-height:60px; box-shadow:inset 0 2px 10px rgba(0,0,0,0.2);';
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
        if (v === 1) {
            cell.textContent = '💎';
            cell.style.background = 'rgba(74,222,128,0.10)';
            cell.style.borderColor = 'rgba(74,222,128,0.18)';
            cell.style.cursor = 'default';
            cell.onclick = null;
        } else if (v === 2) {
            cell.textContent = '💣';
            cell.style.background = 'rgba(248,113,113,0.20)';
            cell.style.borderColor = 'rgba(248,113,113,0.35)';
            cell.style.cursor = 'default';
            cell.onclick = null;
        } else {
            cell.textContent = '❓';
            cell.style.background = 'rgba(255,255,255,0.04)';
            cell.style.borderColor = 'rgba(255,255,255,0.06)';
            cell.style.cursor = gameMinesData.active ? 'pointer' : 'default';
            cell.onclick = gameMinesData.active ? () => openGameMinesCell(i) : null;
        }
    });
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

            // Анимация переворота + зелёная вспышка на конкретной клетке
            if (cellEl) cellEl.classList.add('gm-cell-safe');

            document.getElementById('gm_opened_display').textContent = gameMinesData.opened;

            const multEl = document.getElementById('gm_multiplier_display');
            multEl.textContent = 'x' + gameMinesData.multiplier;
            // Плавный "поп" роста множителя
            multEl.classList.remove('stat-pop');
            void multEl.offsetWidth;
            multEl.classList.add('stat-pop');

            renderGameMinesBoard();
            updateGameMinesCashout();
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

            showMinesResult(false, gameMinesData.bet);
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
        showMinesResult(true, win, gameMinesData.multiplier);
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

    const overlay = document.createElement('div');
    overlay.id = 'minesResultOverlay';
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
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
    });

    const opened = gameMinesData.openedCells || [];
    let boardHTML = '';
    for (let i = 0; i < 25; i++) {
        let symbol = '❓';
        let bg = 'rgba(255,255,255,0.04)';
        let border = '1px solid rgba(255,255,255,0.06)';

        if (opened[i] === 2) {
            symbol = '💣';
            bg = 'rgba(248,113,113,0.25)';
            border = '2px solid #f87171';
        } else if (opened[i] === 1) {
            symbol = '💎';
            bg = 'rgba(74,222,128,0.12)';
            border = '2px solid #4ade80';
        }

        boardHTML += `<div style="width:48px; height:48px; display:flex; align-items:center; justify-content:center; font-size:22px; background:${bg}; border-radius:8px; border:${border}; margin:2px;">${symbol}</div>`;
    }

    const icon = isWin ? '💰' : '💥';
    const title = isWin ? 'ВЫИГРЫШ!' : 'ВЗРЫВ!';
    const color = isWin ? '#4ade80' : '#f87171';
    const subtitle = isWin ? `Ты забрал ${amount}⭐ (x${Number(multiplier).toFixed(2)})` : `Ты потерял ${amount}⭐`;

    overlay.innerHTML = `
        <div style="font-size:56px; margin-bottom:4px;">${icon}</div>
        <div style="font-size:26px; font-weight:800; color:${color}; margin-bottom:4px;">${title}</div>
        <div style="font-size:16px; color:#aaa; margin-bottom:10px;">${subtitle}</div>
        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:2px; max-width:260px; margin:0 auto 14px;">
            ${boardHTML}
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
            <button onclick="closeMinesResult(); resetGameMines();" style="padding:12px 28px; border:none; border-radius:14px; background:linear-gradient(135deg, #b39df7, #8b7cf0); color:#fff; font-weight:700; font-size:15px; cursor:pointer;">🔄 ИГРАТЬ СНОВА</button>
            <button onclick="closeMinesResult(); document.getElementById('minesGameContainer').style.display='none'; document.getElementById('gamesMenu').style.display='flex';" style="padding:12px 28px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:15px; cursor:pointer;">🔙 НАЗАД</button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function closeMinesResult() {
    const overlay = document.getElementById('minesResultOverlay');
    if (overlay) overlay.remove();
}

function resetGameMines() {
    gameMinesData = null;
    buildMinesBoard();
    document.getElementById('gm_bet_display').textContent = '0';
    document.getElementById('gm_count_display').textContent = '0';
    document.getElementById('gm_total_safe').textContent = '0';
    document.getElementById('gm_opened_display').textContent = '0';
    document.getElementById('gm_multiplier_display').textContent = 'x1.0';
    document.getElementById('gm_cashout_btn').style.display = 'none';
    document.getElementById('gm_start_btn').textContent = '🎮 НАЧАТЬ ИГРУ';
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
            <div style="font-size:20px; font-weight:800; color:#e8c76a;">⚡ АПГРЕЙД</div>
        </div>
        <div class="balance-card" style="margin-bottom:12px; padding:14px 18px;">
            <span class="balance-label">💰 Баланс</span>
            <span class="balance-value" id="gu_balance">0 ⭐</span>
        </div>
        <div id="gu_input_section">
            <div style="margin-bottom:12px;">
                <div style="color:#aaa; font-size:14px; margin-bottom:6px;">📤 СТАВКА (1–1000 ⭐)</div>
                <input type="number" id="gu_bet" min="1" max="1000" value="10" style="width:100%; padding:14px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); color:#fff; font-size:18px; font-weight:700; text-align:center;">
            </div>
            <div style="margin-bottom:12px;">
                <div style="color:#aaa; font-size:14px; margin-bottom:6px;">🎯 ЦЕЛЬ (от {bet+1} до 2000 ⭐)</div>
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
            if (el) el.textContent = data.balance + ' ⭐';
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

        const gradCenter = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 24);
        gradCenter.addColorStop(0, '#4ade80');
        gradCenter.addColorStop(1, '#228050');
        ctx.beginPath();
        ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
        ctx.fillStyle = gradCenter;
        ctx.shadowColor = 'rgba(74,222,128,0.4)';
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('⚡', centerX, centerY + 1);
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
            if (balEl) balEl.textContent = data.new_balance + ' ⭐';
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
    const old = document.getElementById('gameUpgradeResultOverlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gameUpgradeResultOverlay';
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

    const icon = result === 'win' ? '🎉' : '💥';
    const title = result === 'win' ? 'УСПЕХ!' : 'ПРОВАЛ!';
    const color = result === 'win' ? '#4ade80' : '#f87171';

    overlay.innerHTML = `
        <div style="font-size:80px; margin-bottom:10px;">${icon}</div>
        <div style="font-size:32px; font-weight:800; color:${color}; margin-bottom:10px;">${title}</div>
        <div style="font-size:18px; color:#aaa; text-align:center; margin-bottom:6px;">${message || ''}</div>
        <div style="font-size:16px; color:#888; margin-bottom:20px;">💰 Баланс: ${newBalance !== undefined ? newBalance : '—'} ⭐</div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; justify-content:center;">
            <button onclick="document.getElementById('gameUpgradeResultOverlay').remove(); resetGameUpgrade();" style="padding:14px 30px; border:none; border-radius:14px; background:linear-gradient(135deg, #34a86c, #228050); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔄 ЕЩЁ РАЗ</button>
            <button onclick="document.getElementById('gameUpgradeResultOverlay').remove(); showGames();" style="padding:14px 30px; border:none; border-radius:14px; background:rgba(255,255,255,0.08); color:#fff; font-weight:700; font-size:16px; cursor:pointer;">🔙 НАЗАД</button>
        </div>
    `;

    document.body.appendChild(overlay);
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

    // Фоновый 3D-слой частиц главного экрана (shared renderer, паузится при скрытии)
    try { initMainBg3D(); } catch (e) { console.warn('bg3d init error:', e); }
})();
