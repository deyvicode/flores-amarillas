/* ============================================================
   GALAXIA DE FLORES AMARILLAS
   Cómo personalizar:
   - Nombre: pasa ?n=Nombre en la URL (ej. index.html?n=Maria);
     si no se pasa, se usa CONFIG.nombreDefecto.
   - CONFIG.frases: agrega/edita mensajes cortos en español, usa
     "{nombre}" donde quieras que aparezca el nombre dinámico.
   - CONFIG.fotos: pon rutas ("assets/foto1.jpg", ...) si tienes
     fotos de ustedes; si el arreglo queda vacío se usan flores
     🌻🌼 flotantes en su lugar.
   - CONFIG.musica: coloca un mp3/m4a en assets/ (opcional, si el
     archivo no existe simplemente no habrá música).
   ============================================================ */

function obtenerNombreDeURL(porDefecto) {
  const params = new URLSearchParams(window.location.search);
  const crudo = params.get("n");
  if (!crudo) return porDefecto;
  // Limita longitud y quita caracteres de control; el nombre solo se
  // usa como texto (textContent / canvas), nunca como HTML.
  const limpio = crudo.trim().slice(0, 30);
  return limpio || porDefecto;
}

const CONFIG = {
  nombreDefecto: "mi amor",
  titulo: "Feliz Día de las Flores Amarillas 🌻",
  frases: [
    "🌻 {nombre}, contigo todo se ve más brillante",
    "🌼 Como el girasol, siempre busco tu luz",
    "🌻 Gracias por existir, {nombre}",
    "🌼 Hoy el amarillo lleva tu nombre",
    "🌻 Contigo hasta lo simple se vuelve especial",
    "🌼 {nombre}, tu sonrisa es mi color favorito",
    "🌻 Un campo entero de flores no alcanza para decirte todo",
    "🌼 21 de septiembre, pensando en ti",
    "🌻 Eres de esas personas que iluminan un día cualquiera",
    "🌼 Quería sorprenderte con una pequeña galaxia, {nombre}",
    "🌻 Tu risa le hace bien a mis días",
    "🌼 Me gusta cómo se siente pensar en ti",
    "🌻 {nombre}, ojalá esta flor te alcance el corazón",
    "🌼 Contigo el tiempo pasa distinto, mejor",
    "🌻 Hoy quiero recordarte cuánto vales",
    "🌼 No hace falta una fecha para quererte así",
    "🌻 Eres mi lugar favorito últimamente",
    "🌼 {nombre}, gracias por ser como eres",
    "🌻 Un girasol siempre mira hacia el sol; yo miro hacia ti",
    "🌼 Esta flor amarilla guarda un pedacito de cariño para ti",
    "🌻 Contigo todo pesa un poco menos",
    "🌼 Quería que supieras cuánto me importas",
    "🌻 {nombre}, mereces flores todos los días",
    "🌼 El amarillo también sabe decir 'te quiero'",
    "🌻 Aquí siempre vas a tener un lugar",
    "🌼 Feliz día de las flores amarillas, {nombre}",
    "🌻 Contigo aprendí que las cosas simples también brillan",
    "🌼 {nombre}, tu cariño no pasa de moda",
    "🌻 Un gracias que no necesita fecha ni motivo",
    "🌼 Esta pequeña galaxia es solo para ti",
  ],
  fotos: [],
  musica: "assets/musica.m4a",
};

CONFIG.nombre = obtenerNombreDeURL(CONFIG.nombreDefecto);
CONFIG.frases = CONFIG.frases.map((f) => f.replaceAll("{nombre}", CONFIG.nombre));

/* ================= Referencias de UI ================= */
document.getElementById("main-title").textContent = CONFIG.titulo;
document.getElementById("sub-title").textContent = `Para ${CONFIG.nombre}, con cariño`;
document.getElementById("start-subtitle").textContent = `Una pequeña galaxia amarilla te espera, ${CONFIG.nombre}...`;

const audio = document.getElementById("audio");
const musicBtn = document.getElementById("music-toggle");
audio.querySelector("source").src = CONFIG.musica;
audio.load();

let audioReady = false;
audio.addEventListener(
  "canplaythrough",
  () => {
    audioReady = true;
    musicBtn.classList.remove("hidden");
  },
  { once: true }
);
audio.addEventListener("error", () => {
  /* si no hay archivo de música, simplemente no se muestra el botón */
});

let muted = false;
musicBtn.addEventListener("click", () => {
  if (!audioReady) return;
  muted = !muted;
  audio.muted = muted;
  musicBtn.textContent = muted ? "🔇" : "🔊";
});

/* ================= Escena Three.js ================= */
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 5000);
let targetDist = 300,
  currentDist = 300,
  rotX = 0.2,
  rotY = 0;

/* Campo de estrellas */
(function makeStars(count = 2200, spread = 3000) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = spread * (0.3 + Math.random() * 0.7);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3 + 0] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 1.4, color: 0xffffff, depthWrite: false });
  scene.add(new THREE.Points(geo, mat));
})();

/* Núcleo oscuro central, tipo corazón de la galaxia */
const core = new THREE.Mesh(
  new THREE.SphereGeometry(40, 64, 64),
  new THREE.MeshPhongMaterial({ color: 0x030303, transparent: true, opacity: 0.92, shininess: 30 })
);
scene.add(core);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const pointLight = new THREE.PointLight(0xffcc66, 1.2, 800);
pointLight.position.set(0, 120, 200);
scene.add(pointLight);

/* Resplandor exterior */
const GLOW_BASE = 360;
function makeGlow(size = 768, c1 = "255,235,130", c2 = "255,180,0") {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.5);
  grad.addColorStop(0, `rgba(${c1},0.55)`);
  grad.addColorStop(0.5, `rgba(${c2},0.25)`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(), transparent: true, depthWrite: false }));
glow.scale.set(GLOW_BASE, GLOW_BASE, 1);
scene.add(glow);

/* Anillo dorado tipo galaxia de pétalos */
function ringTexture(size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  g.translate(size / 2, size / 2);
  const rInner = size * 0.205,
    rOuter = size * 0.49;

  const grd = g.createRadialGradient(0, 0, rInner, 0, 0, rOuter);
  grd.addColorStop(0.0, "rgba(255,255,245,1)");
  grd.addColorStop(0.3, "rgba(255,235,120,1)");
  grd.addColorStop(0.65, "rgba(255,200,40,0.95)");
  grd.addColorStop(1.0, "rgba(255,160,0,0.85)");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(0, 0, rOuter, 0, Math.PI * 2);
  g.arc(0, 0, rInner, 0, Math.PI * 2, true);
  g.closePath();
  g.fill();

  const bandCount = 26;
  for (let i = 0; i < bandCount; i++) {
    const r = rInner + (rOuter - rInner) * (i / (bandCount - 1));
    const dark = i % 3 === 0;
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.lineWidth = ((rOuter - rInner) / bandCount) * (0.55 + Math.random() * 0.35);
    g.strokeStyle = dark ? "rgba(110,60,0,0.20)" : "rgba(255,255,225,0.16)";
    g.stroke();
  }
  return new THREE.CanvasTexture(c);
}
const ring = new THREE.Mesh(
  new THREE.RingGeometry(42, 116, 160),
  new THREE.MeshBasicMaterial({
    map: ringTexture(),
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    opacity: 1,
  })
);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

/* ================= Frases flotantes ================= */
const frasesBase = CONFIG.frases.length ? CONFIG.frases : ["🌻 Feliz Día de las Flores Amarillas"];
const WORD_SLOTS = 150;
const WORDS = Array.from({ length: WORD_SLOTS }, (_, i) => frasesBase[i % frasesBase.length]);

function makeTextTexture(text, color) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;

  const maxWidth = c.width - 48;
  let fontSize = 56;
  ctx.font = `${fontSize}px 'Indie Flower', cursive`;
  while (ctx.measureText(text).width > maxWidth && fontSize > 24) {
    fontSize -= 2;
    ctx.font = `${fontSize}px 'Indie Flower', cursive`;
  }
  ctx.fillText(text, c.width / 2, c.height / 2);
  return new THREE.CanvasTexture(c);
}

const COLORS = ["#ffd700", "#ffe066", "#ffcc33", "#ffb347", "#fff2b0", "#ffaa00", "#f4c430", "#e6b800", "#ffdb58", "#f0c419"];
const textGroup = new THREE.Group();
scene.add(textGroup);

document.fonts
  .load("40px 'Indie Flower'")
  .catch(() => {})
  .then(() => {
    for (let i = 0; i < WORDS.length; i++) {
      const tex = makeTextTexture(WORDS[i], COLORS[i % COLORS.length]);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(68, 21.8, 1);
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 150 + Math.random() * 120;
      sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      sp.userData = { phi, theta, radius: r, speed: 0.001 + Math.random() * 0.001 };
      textGroup.add(sp);
    }
  });

/* ================= Fotos o flores flotantes ================= */
const fotosBase = CONFIG.fotos.filter(Boolean);
const floatGroup = new THREE.Group();
scene.add(floatGroup);
const FLOAT_COUNT = 26;

function makePhotoSprite(url, size) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(size, size, 1);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    const s = Math.min(c.width / img.width, c.height / img.height);
    ctx.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s);
    tex.needsUpdate = true;
    const aspect = img.naturalWidth / img.naturalHeight;
    const aX = Math.min(1, aspect),
      aY = Math.min(1, 1 / aspect);
    sp.scale.set(size * aX, size * aY, 1);
  };
  img.onerror = () => {};
  img.src = url;
  return sp;
}

function makeEmojiSprite(emoji, size) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.font = "200px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, c.width / 2, c.height / 2 + 10);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(size, size, 1);
  return sp;
}

const FLOWER_EMOJIS = ["🌻", "🌼"];
for (let i = 0; i < FLOAT_COUNT; i++) {
  const size = 28 + Math.random() * 20;
  const sp = fotosBase.length ? makePhotoSprite(fotosBase[i % fotosBase.length], size) : makeEmojiSprite(FLOWER_EMOJIS[i % FLOWER_EMOJIS.length], size);
  const phi = Math.acos(2 * Math.random() - 1);
  const theta = Math.random() * Math.PI * 2;
  const r = 140 + Math.random() * 170;
  sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  sp.userData = { phi, theta, radius: r, speed: 0.0006 + Math.random() * 0.0012 };
  floatGroup.add(sp);
}

/* ================= Controles de cámara ================= */
let dragging = false,
  lastX = 0,
  lastY = 0;

function onDown(e) {
  dragging = true;
  const t = e.touches ? e.touches[0] : e;
  lastX = t.clientX;
  lastY = t.clientY;
}
function onMove(e) {
  if (!dragging) return;
  const t = e.touches ? e.touches[0] : e;
  const dx = (t.clientX - lastX) / innerWidth;
  const dy = (t.clientY - lastY) / innerHeight;
  rotY -= dx * 5;
  rotX = Math.max(-1.2, Math.min(1.2, rotX + dy * 3.5));
  lastX = t.clientX;
  lastY = t.clientY;
}
function onUp() {
  dragging = false;
}
addEventListener("mousedown", onDown);
addEventListener("mousemove", onMove);
addEventListener("mouseup", onUp);
addEventListener("touchstart", onDown, { passive: true });
addEventListener("touchmove", onMove, { passive: true });
addEventListener("touchend", onUp, { passive: true });

addEventListener(
  "wheel",
  (e) => {
    targetDist += e.deltaY * 0.25;
    targetDist = Math.max(160, Math.min(600, targetDist));
  },
  { passive: true }
);

let pinch = 0;
addEventListener(
  "touchmove",
  (e) => {
    if (e.touches && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const d = Math.hypot(dx, dy);
      if (pinch) {
        targetDist += (pinch - d) * 0.5;
        targetDist = Math.max(160, Math.min(600, targetDist));
      }
      pinch = d;
    }
  },
  { passive: false }
);
addEventListener("touchend", () => (pinch = 0), { passive: true });

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ================= Animación ================= */
let t = 0;
function tick() {
  requestAnimationFrame(tick);
  t += 0.01;
  ring.rotation.z += 0.003;
  glow.scale.set(GLOW_BASE * (1 + Math.sin(t * 0.4) * 0.03), GLOW_BASE * (1 + Math.sin(t * 0.4) * 0.03), 1);
  const s = 1.0 + 0.05 * Math.sin(t * 3);
  core.scale.set(s, s, s);

  textGroup.children.forEach((sp) => {
    sp.material.opacity = 0.8 + 0.2 * Math.sin(t * 2);
    sp.userData.theta += sp.userData.speed;
    sp.position.x = sp.userData.radius * Math.sin(sp.userData.phi) * Math.cos(sp.userData.theta);
    sp.position.z = sp.userData.radius * Math.sin(sp.userData.phi) * Math.sin(sp.userData.theta);
  });

  floatGroup.children.forEach((sp) => {
    sp.material.opacity = 0.85 + 0.15 * Math.sin(t * 2 + sp.userData.radius);
    sp.userData.theta += sp.userData.speed;
    sp.position.x = sp.userData.radius * Math.sin(sp.userData.phi) * Math.cos(sp.userData.theta);
    sp.position.z = sp.userData.radius * Math.sin(sp.userData.phi) * Math.sin(sp.userData.theta);
  });

  currentDist += (targetDist - currentDist) * 0.06;
  const cx = Math.cos(rotX),
    sx = Math.sin(rotX);
  const cy = Math.cos(rotY),
    sy = Math.sin(rotY);
  camera.position.set(currentDist * sy * cx, currentDist * sx, currentDist * cy * cx);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
tick();

/* ================= Pantalla de inicio ================= */
const startScreen = document.getElementById("start-screen");
function startExperience() {
  startScreen.classList.add("hidden");
  setTimeout(() => (startScreen.style.display = "none"), 800);
  audio.play().catch(() => {});
}
startScreen.addEventListener("click", startExperience);
