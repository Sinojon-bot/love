
const heartCanvas = document.getElementById("heartCanvas");
const ctx = heartCanvas.getContext("2d");
const starsCanvas = document.getElementById("stars");
const sctx = starsCanvas.getContext("2d");

const mainLove = document.getElementById("mainLove");
const mainLanguage = document.getElementById("mainLanguage");
const languageGrid = document.getElementById("languageGrid");

const languages = [
  { name: "Тоҷикӣ", code: "TAJIK", phrase: "Ман туро дӯст медорам" },
  { name: "English", code: "ENGLISH", phrase: "I love you" },
  { name: "Русский", code: "RUSSIAN", phrase: "Я тебя люблю" },
  { name: "Español", code: "SPANISH", phrase: "Te quiero" },
  { name: "Français", code: "FRENCH", phrase: "Je t’aime" },
  { name: "Deutsch", code: "GERMAN", phrase: "Ich liebe dich" },
  { name: "Italiano", code: "ITALIAN", phrase: "Ti amo" },
  { name: "Português", code: "PORTUGUESE", phrase: "Eu te amo" },
  { name: "Türkçe", code: "TURKISH", phrase: "Seni seviyorum" },
  { name: "O‘zbekcha", code: "UZBEK", phrase: "Men seni sevaman" },
  { name: "العربية", code: "ARABIC", phrase: "أحبك" },
  { name: "中文", code: "CHINESE", phrase: "我爱你" },
  { name: "日本語", code: "JAPANESE", phrase: "愛してる" },
  { name: "한국어", code: "KOREAN", phrase: "사랑해" },
  { name: "हिन्दी", code: "HINDI", phrase: "मैं तुमसे प्यार करता हूँ" },
  { name: "বাংলা", code: "BENGALI", phrase: "আমি তোমাকে ভালোবাসি" },
  { name: "اردو", code: "URDU", phrase: "میں تم سے محبت کرتا ہوں" },
  { name: "Ελληνικά", code: "GREEK", phrase: "Σ' αγαπώ" },
  { name: "Nederlands", code: "DUTCH", phrase: "Ik hou van jou" },
  { name: "Polski", code: "POLISH", phrase: "Kocham cię" },
  { name: "Українська", code: "UKRAINIAN", phrase: "Я тебе кохаю" },
  { name: "فارسی", code: "PERSIAN", phrase: "دوستت دارم" },
  { name: "Kiswahili", code: "SWAHILI", phrase: "Nakupenda" },
  { name: "Filipino", code: "FILIPINO", phrase: "Mahal kita" }
];

const quotes = [
  "Муҳаббат забон намепурсад. Онро дил мефаҳмад.",
  "A thousand languages, one beautiful feeling.",
  "Дар ҳар гӯшаи ҷаҳон муҳаббат як маъно дорад.",
  "Love is the language every heart understands.",
  "Ду дил, ҳазор калима, як эҳсос."
];

const random = (min, max) => Math.random() * (max - min) + min;

let width = 0;
let height = 0;
let stars = [];
let particles = [];
let rotation = 0;
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
let paused = false;
let burst = 0;
let selectedIndex = 0;
let lastTime = 0;
let dpr = 1;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (reducedMotion) paused = true;

// --------------------------------------------------
// CANVAS SIZE
// --------------------------------------------------

function resizeCanvas() {
  const rect = heartCanvas.getBoundingClientRect();

  width = rect.width;
  height = rect.height;

  dpr = Math.min(window.devicePixelRatio || 1, 2);

  heartCanvas.width = Math.round(width * dpr);
  heartCanvas.height = Math.round(height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  starsCanvas.width = Math.round(window.innerWidth * dpr);
  starsCanvas.height = Math.round(window.innerHeight * dpr);

  sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createStars();
  createHeart();
}

function createStars() {
  stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: random(0.4, 1.6),
    alpha: random(0.15, 0.8),
    phase: random(0, Math.PI * 2)
  }));
}

// --------------------------------------------------
// 3D HEART MATHEMATICS
// --------------------------------------------------

function heartPoint(t, scale) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  );

  return {
    x: x * scale,
    y: y * scale
  };
}

function createHeart() {
  particles = [];

  // Words positioned along the heart outline
  for (let i = 0; i < 200; i++) {
    const t = (i / 200) * Math.PI * 2;
    const p = heartPoint(t, 1);

    particles.push({
      x: p.x,
      y: p.y,
      z: random(-45, 45),
      text: languages[i % languages.length].phrase,
      size: random(9, 13),
      alpha: random(0.55, 1),
      outline: true,
      phase: random(0, Math.PI * 2)
    });
  }

  // Fill the heart with more phrases
  let attempts = 0;

  while (particles.length < 440 && attempts < 12000) {
    attempts++;

    const x = random(-16, 16);
    const y = random(-17, 13);

    const equation =
      Math.pow(x * x + y * y - 1, 3) -
      x * x * Math.pow(y, 3);

    if (equation <= 0) {
      particles.push({
        x: x * 0.98,
        y: -y * 0.98,
        z: random(-65, 65),
        text: languages[
          Math.floor(Math.random() * languages.length)
        ].phrase,
        size: random(8, 12),
        alpha: random(0.5, 1),
        outline: false,
        phase: random(0, Math.PI * 2)
      });
    }
  }
}

// --------------------------------------------------
// 3D PROJECTION
// --------------------------------------------------

function project(p, time) {
  const bob = paused ? 0 : Math.sin(time * 0.0008) * 3;

  const angleY = rotation + mouseX * 0.22;
  const angleX = mouseY * 0.14;

  const x1 =
    p.x * Math.cos(angleY) -
    p.z * Math.sin(angleY);

  const z1 =
    p.x * Math.sin(angleY) +
    p.z * Math.cos(angleY);

  const y2 =
    p.y * Math.cos(angleX) -
    z1 * Math.sin(angleX);

  const z2 =
    p.y * Math.sin(angleX) +
    z1 * Math.cos(angleX);

  const scale = Math.min(width / 43, height / 42) * 0.92;
  const depth = 280 / (280 + z2 * 0.7);

  return {
    x: width / 2 + x1 * scale * depth,
    y: height / 2 + y2 * scale * depth + bob,
    z: z2,
    depth
  };
}

// --------------------------------------------------
// STARFIELD
// --------------------------------------------------

function drawStars(time) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  sctx.clearRect(0, 0, w, h);

  for (const star of stars) {
    const pulse = paused
      ? 0
      : Math.sin(time * 0.0015 + star.phase) * 0.2;

    sctx.beginPath();
    sctx.arc(
      star.x,
      star.y,
      star.radius,
      0,
      Math.PI * 2
    );

    sctx.fillStyle =
      `rgba(218,185,255,${Math.max(
        0.08,
        star.alpha + pulse
      )})`;

    sctx.fill();
  }
}

// --------------------------------------------------
// HEART DRAWING
// --------------------------------------------------

function drawHeart(time) {
  ctx.clearRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width / 2, height / 2, 10,
    width / 2, height / 2, Math.min(width, height) * 0.47
  );

  glow.addColorStop(0, "#ff4f9310");
  glow.addColorStop(1, "#08061200");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const projected = particles.map(p => {
    const pos = project(p, time);

    return { ...p, ...pos };
  });

  projected.sort((a, b) => b.z - a.z);

  for (const p of projected) {
    const pulse = paused
      ? 0
      : Math.sin(time * 0.0015 + p.phase) * 0.12;

    const alpha = Math.max(
      0.15,
      Math.min(1, p.alpha + pulse)
    );

    const pink = p.outline || p.z < -10;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.depth, p.depth);

    ctx.font = `700 ${p.size}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.globalAlpha = alpha;

    ctx.shadowBlur = 12;
    ctx.shadowColor = pink ? "#ff428b" : "#a66cff";

    ctx.fillStyle = pink ? "#ff85b7" : "#d6baff";
    ctx.fillText(p.text, 0, 0, 180);

    ctx.restore();
  }

  // Draw extra floating particles
  if (!paused && Math.random() < 0.22) {
    ctx.save();
    ctx.globalAlpha = random(0.4, 0.9);
    ctx.fillStyle = "#ff6fae";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff4f93";

    const px = random(width * 0.2, width * 0.8);
    const py = random(height * 0.2, height * 0.8);

    ctx.beginPath();
    ctx.arc(px, py, random(1, 2.5), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// --------------------------------------------------
// ANIMATION LOOP
// --------------------------------------------------

function animate(time = 0) {
  const delta = Math.min(time - lastTime, 40);
  lastTime = time;

  if (!paused) {
    rotation += delta * 0.00018;

    mouseX += (targetMouseX - mouseX) * 0.035;
    mouseY += (targetMouseY - mouseY) * 0.035;

    if (burst > 0) burst *= 0.93;
  }

  drawStars(time);
  drawHeart(time);

  requestAnimationFrame(animate);
}

// --------------------------------------------------
// LANGUAGE CARDS
// --------------------------------------------------

function renderLanguages() {
  document.getElementById("languageCount").textContent =
    `${languages.length} expressions`;

  languageGrid.innerHTML = languages.map((lang, index) => `
    <button
      class="language-card ${index === selectedIndex ? "active" : ""}"
      data-index="${index}"
      aria-pressed="${index === selectedIndex}"
    >
      <span class="card-top">
        <span class="card-language">${lang.name}</span>
        <span class="card-heart">♡</span>
      </span>
      <span class="card-phrase">${lang.phrase}</span>
    </button>
  `).join("");
}

function selectLanguage(index) {
  selectedIndex = index;
  const lang = languages[index];

  mainLove.style.opacity = "0";

  window.setTimeout(() => {
    mainLove.textContent = lang.phrase;
    mainLanguage.textContent = `${lang.code} · ${lang.name.toUpperCase()}`;
    mainLove.style.opacity = "1";
  }, 160);

  languageGrid.querySelectorAll(".language-card").forEach(card => {
    const active = Number(card.dataset.index) === index;

    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", String(active));
  });
}

languageGrid.addEventListener("click", event => {
  const card = event.target.closest(".language-card");

  if (!card) return;

  selectLanguage(Number(card.dataset.index));
});

// --------------------------------------------------
// BUTTONS
// --------------------------------------------------

document.getElementById("heartBtn").addEventListener("click", () => {
  createHeart();
  burst = 1;

  heartCanvas.animate(
    [
      { transform: "scale(0.94)", opacity: 0.65 },
      { transform: "scale(1.04)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 650, easing: "ease-out" }
  );

  selectLanguage(
    Math.floor(Math.random() * languages.length)
  );
});

const pauseBtn = document.getElementById("pauseBtn");

pauseBtn.addEventListener("click", () => {
  paused = !paused;

  pauseBtn.innerHTML = paused
    ? "<span>▶</span> Resume animation"
    : "<span>Ⅱ</span> Pause animation";
});

document.getElementById("surpriseBtn").addEventListener("click", () => {
  selectLanguage(
    Math.floor(Math.random() * languages.length)
  );
});

document.getElementById("quoteBtn").addEventListener("click", () => {
  const quoteText = document.getElementById("quoteText");
  const current = quoteText.textContent;

  const options = quotes.filter(q => q !== current);
  quoteText.textContent =
    options[Math.floor(Math.random() * options.length)];
});

// --------------------------------------------------
// MOUSE INTERACTION
// --------------------------------------------------

heartCanvas.addEventListener("pointermove", event => {
  const rect = heartCanvas.getBoundingClientRect();

  targetMouseX =
    ((event.clientX - rect.left) / rect.width - 0.5) * 2;

  targetMouseY =
    ((event.clientY - rect.top) / rect.height - 0.5) * 2;
});

heartCanvas.addEventListener("pointerleave", () => {
  targetMouseX = 0;
  targetMouseY = 0;
});

// --------------------------------------------------
// START
// --------------------------------------------------

renderLanguages();
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

animate();

