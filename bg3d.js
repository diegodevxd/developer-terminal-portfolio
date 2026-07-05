// ============================================================
// FLOATING PC HARDWARE – Three.js background scene
// ES module: "three" resolves through the import map in
// index.html (pinned CDN build). If 3D is not viable here the
// matrix rain in script.js takes over as the backdrop.
// ============================================================

const canvas = document.getElementById('bg3d-canvas');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

function supportsWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) {
        return false;
    }
}

init();

async function init() {
    // Reduced motion: no 3D and no rain – the static grid + scanlines remain.
    if (!canvas || reducedMotion) return;

    // On small screens the rain is cheaper and already tuned for mobile.
    if (isMobile || !supportsWebGL()) {
        if (window.__startMatrixRain) window.__startMatrixRain();
        return;
    }

    // Claim the backdrop before the async import so the safety timer
    // in script.js doesn't also start the rain while the CDN loads.
    window.__bg3dActive = true;

    let THREE;
    try {
        THREE = await import('three');
    } catch (e) {
        window.__bg3dActive = false;
        if (window.__startMatrixRain) window.__startMatrixRain();
        return;
    }

    canvas.hidden = false;

    // ---- Renderer / scene / camera ----
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    // Distant parts melt into the page background – cheap depth of field.
    scene.fog = new THREE.Fog(0x050505, 9, 26);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 40);
    camera.position.set(0, 0, 14);

    scene.add(new THREE.AmbientLight(0x223333, 0.9));
    const lightCyan = new THREE.PointLight(0x00ffff, 1.2, 0, 1.6);
    lightCyan.position.set(6, 4, 8);
    scene.add(lightCyan);
    const lightMagenta = new THREE.PointLight(0xff00ff, 0.9, 0, 1.6);
    lightMagenta.position.set(-6, -3, 6);
    scene.add(lightMagenta);

    // ---- Shared materials ----
    const mats = {
        pcb: new THREE.MeshStandardMaterial({ color: 0x0d1420, roughness: 0.7, metalness: 0.2 }),
        pcbGreen: new THREE.MeshStandardMaterial({ color: 0x0a2a12, roughness: 0.7, metalness: 0.1 }),
        metal: new THREE.MeshStandardMaterial({ color: 0x8a929c, roughness: 0.35, metalness: 0.8 }),
        chip: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.3 }),
        gold: new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.3, metalness: 0.9 }),
        glowCyan: new THREE.MeshStandardMaterial({ color: 0x061616, emissive: 0x00ffff, emissiveIntensity: 0.6 }),
        glowMagenta: new THREE.MeshStandardMaterial({ color: 0x160616, emissive: 0xff00ff, emissiveIntensity: 0.6 })
    };

    // ---- Small builder helpers (geometries cached by size) ----
    const geoCache = new Map();

    function boxGeo(w, h, d) {
        const key = 'b' + w + ',' + h + ',' + d;
        if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
        return geoCache.get(key);
    }

    function box(w, h, d, mat, x, y, z) {
        const mesh = new THREE.Mesh(boxGeo(w, h, d), mat);
        mesh.position.set(x || 0, y || 0, z || 0);
        return mesh;
    }

    function cylinder(rTop, rBottom, h, seg, mat) {
        const key = 'c' + rTop + ',' + rBottom + ',' + h + ',' + seg;
        if (!geoCache.has(key)) geoCache.set(key, new THREE.CylinderGeometry(rTop, rBottom, h, seg));
        return new THREE.Mesh(geoCache.get(key), mat);
    }

    function torus(r, tube, mat) {
        const key = 't' + r + ',' + tube;
        if (!geoCache.has(key)) geoCache.set(key, new THREE.TorusGeometry(r, tube, 8, 24));
        return new THREE.Mesh(geoCache.get(key), mat);
    }

    // Groups whose .rotation.z spins every frame (fan blades)
    const spinners = [];

    function fanBlades(radius, count) {
        const group = new THREE.Group();
        for (let i = 0; i < count; i++) {
            const blade = box(radius * 0.62, 0.02, radius * 0.26, mats.chip, 0, 0, 0);
            blade.position.x = radius * 0.5;
            blade.rotation.y = 0.5; // blade pitch
            const arm = new THREE.Group();
            arm.add(blade);
            arm.rotation.z = (i * Math.PI * 2) / count;
            group.add(arm);
        }
        return group;
    }

    // ---- Procedural components (each returns a THREE.Group) ----

    function createGPU() {
        const g = new THREE.Group();
        g.add(box(4, 0.12, 1.8, mats.pcb, 0, 0, 0));                 // PCB
        g.add(box(3.6, 0.5, 1.7, mats.chip, 0, 0.31, 0));            // shroud
        g.add(box(4, 0.04, 1.8, mats.metal, 0, -0.1, 0));            // backplate
        g.add(box(0.08, 0.9, 1.8, mats.metal, -2.04, 0.2, 0));       // bracket
        g.add(box(2.2, 0.1, 0.12, mats.gold, 0.5, -0.17, 0.7));      // PCIe fingers
        for (let i = 0; i < 2; i++) {                                 // twin shroud fans
            const cx = -0.9 + i * 1.8;
            const fan = cylinder(0.55, 0.55, 0.06, 16, mats.chip);
            fan.rotation.x = Math.PI / 2;
            fan.position.set(cx, 0.58, 0);
            g.add(fan);
            const ring = torus(0.55, 0.04, mats.glowCyan);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(cx, 0.6, 0);
            g.add(ring);
            const blades = fanBlades(0.5, 7);
            blades.rotation.x = -Math.PI / 2;
            blades.position.set(cx, 0.62, 0);
            g.add(blades);
            spinners.push(blades);
        }
        for (let i = 0; i < 5; i++) {                                 // SMD chips on the PCB
            g.add(box(0.25, 0.08, 0.25, mats.chip, -1.6 + i * 0.7, 0.1, -0.65));
        }
        return g;
    }

    function createRAM(altColor) {
        const g = new THREE.Group();
        g.add(box(2.4, 0.9, 0.06, mats.pcbGreen, 0, 0, 0));                          // PCB
        g.add(box(2.3, 0.8, 0.05, mats.metal, 0, 0.05, 0.06));                       // heat spreader
        g.add(box(2.3, 0.8, 0.05, mats.metal, 0, 0.05, -0.06));                      // heat spreader
        g.add(box(2.3, 0.1, 0.08, altColor ? mats.glowMagenta : mats.glowCyan, 0, 0.5, 0)); // RGB bar
        g.add(box(1.3, 0.08, 0.07, mats.gold, -0.5, -0.49, 0));                      // pins (notched)
        g.add(box(0.8, 0.08, 0.07, mats.gold, 0.75, -0.49, 0));
        return g;
    }

    function createCPU() {
        const g = new THREE.Group();
        g.add(box(1.4, 0.07, 1.4, mats.pcbGreen, 0, 0, 0));          // substrate
        g.add(box(1.05, 0.12, 1.05, mats.metal, 0, 0.09, 0));        // IHS
        for (let i = 0; i < 4; i++) {                                 // edge capacitors
            g.add(box(0.06, 0.05, 0.1, mats.gold, -0.45 + i * 0.3, 0.06, 0.62));
            g.add(box(0.06, 0.05, 0.1, mats.gold, -0.45 + i * 0.3, 0.06, -0.62));
        }
        g.add(box(0.08, 0.03, 0.08, mats.glowCyan, -0.62, 0.05, -0.62)); // pin-1 marker
        return g;
    }

    function createChip() {
        const g = new THREE.Group();
        g.add(box(0.6, 0.12, 0.6, mats.chip, 0, 0, 0));
        for (let i = 0; i < 6; i++) {                                 // legs, both sides
            const off = -0.25 + i * 0.1;
            g.add(box(0.04, 0.04, 0.12, mats.gold, off, -0.02, 0.36));
            g.add(box(0.04, 0.04, 0.12, mats.gold, off, -0.02, -0.36));
        }
        g.add(box(0.08, 0.02, 0.08, mats.glowMagenta, 0.18, 0.08, 0.18)); // status LED
        return g;
    }

    function createCaseFan() {
        const g = new THREE.Group();
        const frame = torus(0.9, 0.07, mats.chip);
        g.add(frame);
        const corners = [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]];
        corners.forEach(function (c) {
            const corner = box(0.2, 0.2, 0.06, mats.chip, c[0], c[1], 0);
            g.add(corner);
        });
        const hub = cylinder(0.28, 0.28, 0.1, 16, mats.metal);
        hub.rotation.x = Math.PI / 2;
        g.add(hub);
        const ring = torus(0.72, 0.03, mats.glowCyan);
        g.add(ring);
        const blades = fanBlades(0.78, 7);
        g.add(blades);
        spinners.push(blades);
        return g;
    }

    // ---- Populate the world ----
    const world = new THREE.Group();
    scene.add(world);

    const builders = [
        createGPU, createGPU,
        function () { return createRAM(false); },
        function () { return createRAM(true); },
        function () { return createRAM(false); },
        createCPU, createCPU,
        createChip, createChip, createChip, createChip,
        createCaseFan, createCaseFan
    ];

    function randomPosition() {
        // Keep the zone right behind the hero copy clear.
        for (let tries = 0; tries < 30; tries++) {
            const x = (Math.random() * 2 - 1) * 9;
            const y = (Math.random() * 2 - 1) * 6;
            const z = -7 + Math.random() * 8;
            if (Math.abs(x) < 2.5 && z > -2) continue;
            return [x, y, z];
        }
        return [6, 4, -5];
    }

    builders.forEach(function (build) {
        const obj = build();
        const p = randomPosition();
        obj.position.set(p[0], p[1], p[2]);
        obj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const s = 0.7 + Math.random() * 0.5;
        obj.scale.setScalar(s);
        obj.userData = {
            rotV: {
                x: (Math.random() - 0.5) * 0.006,
                y: (Math.random() - 0.5) * 0.006,
                z: (Math.random() - 0.5) * 0.006
            },
            baseY: p[1],
            bobPhase: Math.random() * Math.PI * 2,
            bobAmp: 0.1 + Math.random() * 0.2
        };
        world.add(obj);
    });

    // ---- Retro mode recolor (event from retro.js) ----
    function applyRetroColors(on) {
        lightCyan.color.set(on ? 0x39ff14 : 0x00ffff);
        lightMagenta.color.set(on ? 0xff2f92 : 0xff00ff);
        mats.glowCyan.emissive.set(on ? 0x39ff14 : 0x00ffff);
        mats.glowMagenta.emissive.set(on ? 0xff2f92 : 0xff00ff);
    }

    document.addEventListener('retromode', function (e) {
        applyRetroColors(!!(e.detail && e.detail.on));
    });
    if (document.documentElement.classList.contains('retro-mode')) {
        applyRetroColors(true);
    }

    // ---- Interaction state ----
    let mouseX = 0, mouseY = 0;
    window.addEventListener('pointermove', function (e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // ---- Render loop (~30 fps cap, like the rain) ----
    let rafId = null;
    let lastTs = 0;
    let t = 0;

    function frame(ts) {
        rafId = requestAnimationFrame(frame);
        if (ts - lastTs < 33) return;
        lastTs = ts;
        t += 0.016;

        world.children.forEach(function (obj) {
            const u = obj.userData;
            obj.rotation.x += u.rotV.x;
            obj.rotation.y += u.rotV.y;
            obj.rotation.z += u.rotV.z;
            obj.position.y = u.baseY + Math.sin(t + u.bobPhase) * u.bobAmp;
        });

        spinners.forEach(function (blades) {
            blades.rotation.z += 0.06;
        });

        // Mouse parallax (lerp) + scroll parallax (read per frame, no listener)
        camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        const sy = window.scrollY || 0;
        world.position.y = sy * 0.0015;
        world.rotation.x = sy * 0.00005;

        renderer.render(scene, camera);
    }

    function start() {
        if (rafId === null) rafId = requestAnimationFrame(frame);
    }

    function stop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else if (window.__bg3dActive) start();
    });

    // Note: no IntersectionObserver pause – the canvas is position:fixed,
    // so it always intersects the viewport.

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
    });

    // If the GPU context dies, hand the backdrop back to the rain.
    canvas.addEventListener('webglcontextlost', function (ev) {
        ev.preventDefault();
        stop();
        canvas.hidden = true;
        window.__bg3dActive = false;
        renderer.dispose();
        if (window.__startMatrixRain) window.__startMatrixRain();
    }, { once: true });

    start();
}
