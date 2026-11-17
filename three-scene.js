/**
 * Mohammed Hasheem - 3D Experience Engine
 * Handles Background Three.js Starfield/Constellation & Interactive Hero Core
 */

(function () {
  'use strict';

  let isHighPerformance = true;
  let bgRenderer, bgScene, bgCamera, bgParticles, bgFloatingMeshes = [];
  let heroRenderer, heroScene, heroCamera, heroCoreGroup, heroRing1, heroRing2, heroParticles;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  let scrollY = 0;

  // Initialize both 3D scenes when DOM is ready
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js CDN not reachable, falling back to 2D Canvas Starfield');
      initCanvas2DFallback();
      return;
    }

    try {
      initBackground3D();
      initHeroCore3D();
      setupEventListeners();
      animate();
    } catch (err) {
      console.error('Error initializing Three.js scene:', err);
      initCanvas2DFallback();
    }
  });

  /* -------------------------------------------------------------
   * 1. BACKGROUND 3D CONSTELLATION & CYBER GRID
   * ------------------------------------------------------------- */
  function initBackground3D() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    bgScene = new THREE.Scene();
    bgScene.fog = new THREE.FogExp2(0x050711, 0.0012);

    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    bgCamera.position.z = 800;

    bgRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: isHighPerformance,
      powerPreference: 'high-performance'
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Starfield Constellation
    const particleCount = isHighPerformance ? 1800 : 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x38bdf8); // Cyan
    const color2 = new THREE.Color(0xa855f7); // Purple
    const color3 = new THREE.Color(0x2563eb); // Blue

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Cylindrical / volumetric distribution
      positions[i] = (Math.random() - 0.5) * 2200;
      positions[i + 1] = (Math.random() - 0.5) * 2200;
      positions[i + 2] = (Math.random() - 0.5) * 1600;

      // Color variation
      const mixedColor = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
      colors[i] = mixedColor.r;
      colors[i + 1] = mixedColor.g;
      colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Point Texture Generator
    const sprite = generatePointTexture();
    const material = new THREE.PointsMaterial({
      size: 4.5,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    bgParticles = new THREE.Points(geometry, material);
    bgScene.add(bgParticles);

    // Floating Geometric Wireframe Nodes in background space
    const meshGeometries = [
      new THREE.IcosahedronGeometry(70, 1),
      new THREE.OctahedronGeometry(60, 0),
      new THREE.TorusGeometry(80, 2, 16, 50),
      new THREE.TetrahedronGeometry(50, 0)
    ];

    const meshMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });

    for (let i = 0; i < 6; i++) {
      const geom = meshGeometries[i % meshGeometries.length];
      const mesh = new THREE.Mesh(geom, meshMaterial.clone());
      mesh.position.x = (Math.random() - 0.5) * 1400;
      mesh.position.y = (Math.random() - 0.5) * 1200;
      mesh.position.z = (Math.random() - 0.5) * 900;
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.scale.setScalar(Math.random() * 0.8 + 0.6);

      mesh.userData = {
        rotX: (Math.random() - 0.5) * 0.005,
        rotY: (Math.random() - 0.5) * 0.005,
        speedY: (Math.random() - 0.5) * 0.15
      };

      bgScene.add(mesh);
      bgFloatingMeshes.push(mesh);
    }
  }

  /* -------------------------------------------------------------
   * 2. INTERACTIVE HERO 3D CORE ("Hasheem Architecture Engine")
   * ------------------------------------------------------------- */
  function initHeroCore3D() {
    const canvas = document.getElementById('hero-canvas-3d');
    if (!canvas) return;

    const width = canvas.clientWidth || 380;
    const height = canvas.clientHeight || 220;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    heroCamera.position.set(0, 0, 7.5);

    heroRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    heroCoreGroup = new THREE.Group();
    heroScene.add(heroCoreGroup);

    // Inner Core: Pulsating Icosahedron (Representing .NET Enterprise Engine)
    const innerGeom = new THREE.IcosahedronGeometry(1.4, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      wireframe: true,
      emissive: 0x0369a1,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    heroCoreGroup.add(innerCore);

    // Glowing Central Nucleus Sphere
    const nucGeom = new THREE.SphereGeometry(0.8, 24, 24);
    const nucMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });
    const nucleus = new THREE.Mesh(nucGeom, nucMat);
    heroCoreGroup.add(nucleus);

    // Orbital Rings
    const ring1Geom = new THREE.TorusGeometry(2.3, 0.025, 16, 80);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75
    });
    heroRing1 = new THREE.Mesh(ring1Geom, ringMat1);
    heroRing1.rotation.x = Math.PI / 3;
    heroCoreGroup.add(heroRing1);

    const ring2Geom = new THREE.TorusGeometry(2.6, 0.025, 16, 80);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.65
    });
    heroRing2 = new THREE.Mesh(ring2Geom, ringMat2);
    heroRing2.rotation.y = Math.PI / 4;
    heroRing2.rotation.x = -Math.PI / 6;
    heroCoreGroup.add(heroRing2);

    // Satellite Tech Nodes on the rings
    const nodeGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const nodeColors = [0x38bdf8, 0xa855f7, 0x10b981, 0xf59e0b];

    for (let i = 0; i < 4; i++) {
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.8
      });
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      const angle = (i * Math.PI * 2) / 4;
      node.position.x = Math.cos(angle) * 2.3;
      node.position.y = Math.sin(angle) * 2.3;
      heroRing1.add(node);
    }

    // Mini Orbiting Particle Cloud
    const heroPartCount = 180;
    const heroPartGeom = new THREE.BufferGeometry();
    const heroPartPositions = new Float32Array(heroPartCount * 3);

    for (let i = 0; i < heroPartCount * 3; i += 3) {
      const radius = 2.0 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      heroPartPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      heroPartPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      heroPartPositions[i + 2] = radius * Math.cos(phi);
    }
    heroPartGeom.setAttribute('position', new THREE.BufferAttribute(heroPartPositions, 3));

    const heroPartMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    heroParticles = new THREE.Points(heroPartGeom, heroPartMat);
    heroCoreGroup.add(heroParticles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    heroScene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 20);
    pointLight.position.set(5, 5, 5);
    heroScene.add(pointLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 20);
    purpleLight.position.set(-5, -3, 3);
    heroScene.add(purpleLight);

    // Interactive Dragging on Hero Canvas
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      heroCoreGroup.rotation.y += deltaX * 0.01;
      heroCoreGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      heroCoreGroup.rotation.y += deltaX * 0.01;
      heroCoreGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /* -------------------------------------------------------------
   * Helper: Generate Smooth Radial Point Texture for Stars
   * ------------------------------------------------------------- */
  function generatePointTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
    grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /* -------------------------------------------------------------
   * Event Listeners & Camera Parallax Handling
   * ------------------------------------------------------------- */
  function setupEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('scroll', onWindowScroll, false);

    // Performance Toggle Listener (from floating HUD)
    const perfToggle = document.getElementById('perf-toggle-btn');
    if (perfToggle) {
      perfToggle.addEventListener('click', () => {
        isHighPerformance = !isHighPerformance;
        perfToggle.classList.toggle('active', isHighPerformance);
        const textSpan = perfToggle.querySelector('span');
        if (textSpan) {
          textSpan.textContent = isHighPerformance ? '60fps Mode' : 'Eco Mode';
        }
      });
    }
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    if (bgCamera && bgRenderer) {
      bgCamera.aspect = window.innerWidth / window.innerHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    const heroCanvas = document.getElementById('hero-canvas-3d');
    if (heroCanvas && heroRenderer && heroCamera) {
      const w = heroCanvas.clientWidth;
      const h = heroCanvas.clientHeight;
      heroCamera.aspect = w / h;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(w, h);
    }
  }

  function onDocumentMouseMove(event) {
    mouse.targetX = (event.clientX - windowHalfX) * 0.4;
    mouse.targetY = (event.clientY - windowHalfY) * 0.4;
  }

  function onWindowScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }

  /* -------------------------------------------------------------
   * Main Render Loop
   * ------------------------------------------------------------- */
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // 1. Render Background Universe
    if (bgRenderer && bgScene && bgCamera) {
      bgCamera.position.x = mouse.x * 0.3;
      bgCamera.position.y = -mouse.y * 0.3 - (scrollY * 0.3);
      bgCamera.lookAt(0, -scrollY * 0.3, 0);

      if (bgParticles) {
        bgParticles.rotation.y = elapsedTime * 0.02;
        bgParticles.rotation.x = elapsedTime * 0.01;
      }

      // Rotate floating geometric nodes
      for (let i = 0; i < bgFloatingMeshes.length; i++) {
        const mesh = bgFloatingMeshes[i];
        mesh.rotation.x += mesh.userData.rotX;
        mesh.rotation.y += mesh.userData.rotY;
        mesh.position.y += Math.sin(elapsedTime + i) * 0.2;
      }

      bgRenderer.render(bgScene, bgCamera);
    }

    // 2. Render Hero Interactive Core
    if (heroRenderer && heroScene && heroCamera && heroCoreGroup) {
      heroCoreGroup.rotation.y += 0.008;

      if (heroRing1) heroRing1.rotation.z += 0.015;
      if (heroRing2) heroRing2.rotation.z -= 0.012;
      if (heroParticles) heroParticles.rotation.y -= 0.005;

      // Pulse heartbeat
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.04;
      heroCoreGroup.children[0].scale.set(pulse, pulse, pulse);

      heroRenderer.render(heroScene, heroCamera);
    }
  }

  /* -------------------------------------------------------------
   * Fallback 2D Animated Canvas (if WebGL/CDN is unavailable)
   * ------------------------------------------------------------- */
  function initCanvas2DFallback() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = [];
    const count = 150;

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        color: i % 2 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(168, 85, 247, 0.6)'
      });
    }

    function drawFallback() {
      ctx.clearRect(0, 0, width, height);

      // Draw stars and connection lines
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.speedX;
        s.y += s.speedY;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();

        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const dist = Math.hypot(s.x - s2.x, s.y - s2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawFallback);
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    drawFallback();
  }
})();
