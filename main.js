// -------------------------------------------------------
// LYRICS — adjust t (seconds) to fine-tune sync
// -------------------------------------------------------
const lyrics = [
  { t:   1.6, text: '' },
  { t:   9.5, text: "Your love is like a studded leather headlock" },
  { t:  17.2, text: "Your kiss it could put creases in the rain" },
  { t:  24.5, text: "You're rarer than a can of dandelion and burdock" },
  { t:  31.0, text: "And those other girls are just postmix lemonade" },
  { t:  33.5, text: '' },
  { t:  41.1, text: "Suck it and see, you never know" },
  { t:  47.8, text: "Sit next to me before I go" },
  { t:  55.1, text: "Jigsaw women with horror movie shoes" },
  { t:  62.6, text: "Be cruel to me, 'cause I'm a fool for you" },
  { t:  70.0, text: "I poured my aching heart into a pop song" },
  { t:  77.1, text: "I couldn't get the hang of poetry" },
  { t:  83.0, text: "That's not a skirt girl, that's a sawn off shotgun" },
  { t:  91.2, text: "And I can only hope, you've got it aimed at me" },
  { t:  93.4, text: '' },
  { t: 101.0, text: "Suck it and see, you never know" },
  { t: 107.3, text: "Sit next to me before I go" },
  { t: 115.0, text: "Jigsaw women with horror movie shoes" },
  { t: 121.0, text: "Be cruel to me, 'cause I'm a fool for..." },
  { t: 128.1, text: "Blue moon girls from once upon a shangri-la" },
  { t: 135.5, text: "How I often wonder where you are" },
  { t: 142.7, text: "You have got that face that just says" },
  { t: 148.3, text: '"Baby, I was made to break your heart"' },
  { t: 155.9, text: "Suck it and see, you never know" },
  { t: 171.1, text: "Sit next to me before I go" },
  { t: 178.6, text: "Go, go, go" },
  { t: 185.9, text: "Jigsaw women with horror movie shoes" },
  { t: 199.8, text: "Be cruel to me, 'cause I'm a fool for you" },
  { t: 206.9, text: '' },
];
// -------------------------------------------------------

function toggleAudio() {
  const audio = document.getElementById('audio');
  const btn = document.getElementById('mute-btn');
  if (audio.paused) {
    audio.play();
    btn.textContent = '❚❚ pause';
  } else {
    audio.pause();
    btn.textContent = '▶ play';
  }
}

// --- Lyrics display (3-line window, middle highlighted) ---
let currentLyricIdx = -1;

function setupLyrics() {
  const audio = document.getElementById('audio');
  const prev = document.getElementById('lyric-prev');
  const curr = document.getElementById('lyric-curr');
  const next = document.getElementById('lyric-next');

  function setText(el, text) {
    el.textContent = text || '';
  }

  function render(idx) {
    setText(prev, idx > 0 ? lyrics[idx - 1].text : '');
    setText(curr, idx >= 0 ? lyrics[idx].text : '');
    setText(next, idx < lyrics.length - 1 ? lyrics[idx + 1].text : '');
  }

  audio.addEventListener('timeupdate', () => {
    const t = audio.currentTime;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (t >= lyrics[i].t) idx = i;
    }
    if (idx !== currentLyricIdx) {
      currentLyricIdx = idx;
      render(idx);
    }
  });

  audio.addEventListener('pause', () => {
    setText(prev, '');
    setText(curr, '');
    setText(next, '');
    currentLyricIdx = -1;
  });
}

setupLyrics();

const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');

let W, H, t = 0;
let mouse = { x: 0.5, y: 0.5 };

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX / W;
  mouse.y = e.clientY / H;
});

// --- Aurora layers ---
const layers = [
  { speed: 0.00006, amp: 0.18, yBase: 0.42, color: [80, 40, 200] },
  { speed: 0.00008, amp: 0.22, yBase: 0.50, color: [20, 160, 230] },
  { speed: 0.00005, amp: 0.16, yBase: 0.58, color: [100, 220, 180] },
  { speed: 0.00009, amp: 0.14, yBase: 0.46, color: [200, 60, 180] },
  { speed: 0.00004, amp: 0.20, yBase: 0.54, color: [60, 200, 140] },
];

function drawAuroraLayer(layer, time) {
  const { speed, amp, yBase, color } = layer;
  const [r, g, b] = color;

  // Mouse influence nudges the aurora
  const mx = (mouse.x - 0.5) * 0.08;
  const my = (mouse.y - 0.5) * 0.06;

  ctx.beginPath();

  const points = 180;
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * W;
    const nx = i / points;

    const wave =
      Math.sin(nx * 3.1 + time * speed * 80000 + mx * 6) * 0.5 +
      Math.sin(nx * 5.7 - time * speed * 50000 + mx * 4) * 0.3 +
      Math.sin(nx * 1.9 + time * speed * 30000) * 0.2;

    const y = (yBase + my + wave * amp) * H;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }

  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, (yBase - amp) * H, 0, (yBase + amp * 2) * H);
  grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
  grad.addColorStop(0.3, `rgba(${r},${g},${b},0.18)`);
  grad.addColorStop(0.6, `rgba(${r},${g},${b},0.10)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

  ctx.fillStyle = grad;
  ctx.fill();
}

// --- Stars ---
const stars = Array.from({ length: 220 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.75,
  r: Math.random() * 1.2 + 0.2,
  phase: Math.random() * Math.PI * 2,
  speed: Math.random() * 0.6 + 0.3,
}));

function drawStars(time) {
  for (const s of stars) {
    const alpha = 0.3 + 0.5 * Math.sin(time * s.speed * 0.001 + s.phase);
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fill();
  }
}

// --- Ripples on click ---
const ripples = [];
window.addEventListener('click', e => {
  ripples.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.7, born: performance.now() });
});

function drawRipples(now) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    const age = now - rp.born;
    rp.r = age * 0.25;
    rp.alpha = Math.max(0, 0.7 - age * 0.001);
    if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(200,180,255,${rp.alpha.toFixed(3)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// --- Main loop ---
function draw(now) {
  t = now;

  // Deep space background
  ctx.fillStyle = '#03010a';
  ctx.fillRect(0, 0, W, H);

  // Subtle radial vignette center glow
  const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
  cg.addColorStop(0, 'rgba(30,10,60,0.5)');
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, W, H);

  drawStars(now);

  ctx.globalCompositeOperation = 'screen';
  for (const layer of layers) drawAuroraLayer(layer, now);
  ctx.globalCompositeOperation = 'source-over';

  drawRipples(now);

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
