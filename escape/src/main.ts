import * as THREE from "three";

const isCheater = new URLSearchParams(window.location.search).get("session") === "voided";

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 12);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Particles ---
const COUNT = 5000;
const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const baseOpacities = new Float32Array(COUNT);

// Clean palette: fuchsia, cyan, amber, pink, white
const cleanPalette = [
  [0.91, 0.47, 0.98],
  [0.02, 0.71, 0.83],
  [0.98, 0.75, 0.14],
  [0.96, 0.44, 0.95],
  [1.00, 1.00, 1.00],
  [0.34, 0.75, 0.98],
];

// Cheater palette: sickly, desaturated, wrong
const cheaterPalette = [
  [0.22, 0.32, 0.22],
  [0.35, 0.42, 0.18],
  [0.28, 0.28, 0.28],
  [0.18, 0.38, 0.18],
  [0.40, 0.45, 0.30],
];

const palette = isCheater ? cheaterPalette : cleanPalette;

for (let i = 0; i < COUNT; i++) {
  const i3 = i * 3;

  // Start clustered near centre
  positions[i3]     = (Math.random() - 0.5) * 0.4;
  positions[i3 + 1] = (Math.random() - 0.5) * 0.4;
  positions[i3 + 2] = (Math.random() - 0.5) * 0.4;

  // Burst direction
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  const speed = 0.015 + Math.random() * 0.06;
  const sinPhi = Math.sin(phi);

  let vx = sinPhi * Math.cos(theta) * speed;
  let vy = sinPhi * Math.sin(theta) * speed;
  let vz = Math.cos(phi) * speed;

  if (isCheater) {
    // Invert vertical — cheater particles fall
    vy = -Math.abs(vy) * 1.4;
    vx *= 0.4;
    vz *= 0.4;
  } else {
    // Bias upward for clean run
    vy = Math.abs(vy) * 1.2 + 0.005;
  }

  velocities[i3]     = vx;
  velocities[i3 + 1] = vy;
  velocities[i3 + 2] = vz;

  const c = palette[Math.floor(Math.random() * palette.length)];
  colors[i3]     = c[0];
  colors[i3 + 1] = c[1];
  colors[i3 + 2] = c[2];

  baseOpacities[i] = 0.6 + Math.random() * 0.4;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
  size: 0.07,
  vertexColors: true,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true,
});

const points = new THREE.Points(geo, mat);
scene.add(points);

// Ambient background stars
const starCount = 800;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPos[i] = (Math.random() - 0.5) * 120;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({
  size: 0.04,
  color: isCheater ? 0x1a2a1a : 0x334155,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// --- Timeline ---
// Phase 0: 0–1.2s  — black, nothing
// Phase 1: 1.2–2s  — stars fade in, dim ambient particles drift
// Phase 2: 2s      — BURST
// Phase 3: 2.5s+   — text reveal, particles spread
// Phase 4: 4s+     — slow drift, camera gentle orbit

let elapsed = 0;
let burstFired = false;
const clock = new THREE.Clock();

// Pre-burst: slow ambient drift so particles aren't all static at centre
const ambientVelocities = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT; i++) {
  const i3 = i * 3;
  ambientVelocities[i3]     = (Math.random() - 0.5) * 0.0005;
  ambientVelocities[i3 + 1] = (Math.random() - 0.5) * 0.0005;
  ambientVelocities[i3 + 2] = (Math.random() - 0.5) * 0.0005;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

// --- UI ---
const titleEl    = document.getElementById("title")!;
const subtitleEl = document.getElementById("subtitle")!;
const ctaEl      = document.getElementById("cta")!;
const cheaterEl  = document.getElementById("cheater-msg")!;

let uiShown = false;

function showCleanUI() {
  titleEl.className = "clean";
  titleEl.textContent = "YOU ESCAPED";
  subtitleEl.className = "clean";
  subtitleEl.textContent = "> not everyone finds it. you did.";

  ctaEl.innerHTML = `
    <button onclick="claimSpot()">CLAIM YOUR SPOT</button>
    <div class="note">enter your handle. burn it into the board.</div>
  `;

  requestAnimationFrame(() => {
    titleEl.classList.add("visible");
    subtitleEl.classList.add("visible");
  });

  setTimeout(() => ctaEl.classList.add("visible"), 800);
}

function showCheaterUI() {
  titleEl.className = "cheater";
  titleEl.textContent = "YOU ESCAPED.";
  subtitleEl.className = "cheater";
  subtitleEl.textContent = "";

  // Glitch the title after a moment
  setTimeout(() => {
    titleEl.classList.add("visible");
    subtitleEl.classList.add("visible");
  }, 200);

  setTimeout(() => {
    titleEl.textContent = "YOU ESCAPED.";
    setTimeout(() => { titleEl.textContent = "Y̷O̸U̴ ̷E̴S̵C̷A̸P̴E̵D̶."; }, 300);
    setTimeout(() => { titleEl.textContent = "...or did you."; titleEl.style.fontSize = "clamp(1.5rem, 5vw, 3.5rem)"; }, 900);
  }, 1200);

  cheaterEl.innerHTML = "> something about this feels wrong.<br>> can't quite place it.<br>> carry on.";
  setTimeout(() => cheaterEl.classList.add("visible"), 2000);
}

(window as any).claimSpot = function() {
  // Placeholder — wire to POST /api/hunt/complete + Nickname/PIN flow
  alert("Leaderboard coming soon. You were here first.");
};

// --- Render loop ---
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  elapsed += delta;

  const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;

  // Phase: pre-burst ambient drift
  if (!burstFired) {
    const t = Math.max(0, elapsed - 1.2) / 0.8; // 0→1 during 1.2–2s
    mat.opacity = lerp(0, isCheater ? 0.15 : 0.25, t);
    starMat.opacity = lerp(0, isCheater ? 0.1 : 0.3, t);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     += ambientVelocities[i3];
      positions[i3 + 1] += ambientVelocities[i3 + 1];
      positions[i3 + 2] += ambientVelocities[i3 + 2];
    }

    if (elapsed >= 2.0) {
      burstFired = true;
    }
  }

  // Phase: burst + spread
  if (burstFired) {
    const t = Math.min((elapsed - 2.0) / 2.5, 1); // 0→1 over 2.5s after burst
    mat.opacity = lerp(isCheater ? 0.15 : 0.25, isCheater ? 0.35 : 0.9, t);

    // Gravity / drag
    const drag = isCheater ? 0.998 : 0.997;
    const gravity = isCheater ? 0.00015 : -0.00003; // cheater: pulled down

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      velocities[i3]     *= drag;
      velocities[i3 + 1] *= drag;
      velocities[i3 + 2] *= drag;
      velocities[i3 + 1] += gravity;

      positions[i3]     += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
    }

    // Show UI once
    if (!uiShown && elapsed >= 3.2) {
      uiShown = true;
      if (isCheater) {
        showCheaterUI();
      } else {
        showCleanUI();
      }
    }
  }

  posAttr.needsUpdate = true;

  // Gentle camera orbit
  if (elapsed > 2.0) {
    const orbitT = (elapsed - 2.0) * 0.06;
    camera.position.x = Math.sin(orbitT) * 0.8;
    camera.position.y = Math.cos(orbitT * 0.7) * 0.4;
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
}

animate();
