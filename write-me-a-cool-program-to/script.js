const canvas = document.querySelector("#sky");
const ctx = canvas.getContext("2d");
const stage = document.querySelector(".stage");
const startButton = document.querySelector("#startShow");
const message = document.querySelector("#message");
const song = document.querySelector("#song");

const notes = [
  "Strawberry Wine glow, Cobina dancing, and her birds keeping the beat.",
  "Blonde hair, navy blue, and a chorus of tiny bird backup dancers.",
  "A soft folk-pop heartbeat for Cobina.",
  "Pet birds, strawberry shimmer, and one very personal dance floor.",
];

const palette = ["#ffd166", "#ef6f6c", "#37d8a7", "#64b6ff", "#f8f7ef"];
const strawberryPalette = ["#f6d06f", "#d94a64", "#a93651", "#f7b2bd", "#fff2d8"];
let width = 0;
let height = 0;
let particles = [];
let lastPulse = 0;
let showStarted = false;
let songLoadFailed = false;

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function addBurst(x, y, amount = 26) {
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.4 + Math.random() * 4.6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 2 + Math.random() * 5,
      spin: Math.random() * Math.PI,
      color: pickSparkColor(),
      life: 70 + Math.random() * 50,
      maxLife: 120,
    });
  }
}

function pickSparkColor() {
  const colors = stage.classList.contains("strawberry-mode") ? strawberryPalette : palette;
  return colors[Math.floor(Math.random() * colors.length)];
}

function drawParticle(particle) {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.spin);
  ctx.globalAlpha = Math.max(particle.life / particle.maxLife, 0);
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.moveTo(0, -particle.size);
  ctx.lineTo(particle.size * 0.72, 0);
  ctx.lineTo(0, particle.size);
  ctx.lineTo(-particle.size * 0.72, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function tick(timestamp) {
  ctx.clearRect(0, 0, width, height);

  if (timestamp - lastPulse > 520) {
    lastPulse = timestamp;
    addBurst(width * (0.2 + Math.random() * 0.6), height * (0.18 + Math.random() * 0.38), 10);
  }

  particles = particles.filter((particle) => particle.life > 0);
  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.05;
    particle.vx *= 0.99;
    particle.spin += 0.08;
    particle.life -= 1;
    drawParticle(particle);
  }

  requestAnimationFrame(tick);
}

async function startShow() {
  if (showStarted) return;

  if (songLoadFailed) {
    message.textContent = "The page loaded, but GitHub Pages could not find the MP3 file.";
    return;
  }

  try {
    song.volume = 0.62;
    await song.play();
    showStarted = true;
    stage.classList.add("music-live");
    startButton.textContent = "Music playing";
    startButton.disabled = true;
    message.textContent = notes[Math.floor(Math.random() * notes.length)];
    addBurst(width / 2, height * 0.38, 70);
  } catch {
    message.textContent = "Tap again, or check that assets/strawberry-wine.mp3 was uploaded to GitHub.";
  }
}

song.addEventListener("error", () => {
  songLoadFailed = true;
  startButton.textContent = "Music file missing";
  message.textContent = "Upload assets/strawberry-wine.mp3 with the rest of the site files.";
});

window.addEventListener("resize", resize);
window.addEventListener("pointerdown", (event) => {
  addBurst(event.clientX, event.clientY, 22);
});

startButton.addEventListener("click", startShow);

resize();
requestAnimationFrame(tick);
addBurst(window.innerWidth / 2, window.innerHeight * 0.26, 38);
