/* ===== ⚙️ CONFIGURACIÓN ===== */
const VOLUMEN = 0.6;          // 0 a 1
const MES_CUMPLE = 11;        // mes del cumpleaños (1-12)  → noviembre = 11
const DIA_CUMPLE = 23;
const VELOCIDAD_ESCRITURA = 32; // milisegundos por letra (más bajo = más rápido)

const $ = id => document.getElementById(id);
const capa = $('capa'), audio = $('audio'), btnMus = $('btn-musica');
const rand = (a, b) => a + Math.random() * (b - a);
const dormir = ms => new Promise(r => setTimeout(r, ms));

/* ===== 1. LETRAS ANIMADAS ===== */
document.querySelectorAll('[data-letras]').forEach(el => {
  const txt = el.textContent;
  el.setAttribute('aria-label', txt);
  el.style.setProperty('--base', el.dataset.base || '0s');
  el.textContent = '';
  [...txt].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'l'; s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    s.addEventListener('pointerenter', saltar);
    s.addEventListener('click', saltar);
    el.appendChild(s);
  });
});
function saltar(e){
  const l = e.currentTarget;
  if (l.classList.contains('salto')) return;
  l.classList.add('salto');
  setTimeout(() => l.classList.remove('salto'), 600);
}

/* ===== 2. ESTRELLAS ===== */
for (let i = 0; i < 45; i++) {
  const s = document.createElement('i');
  s.style.cssText = `left:${rand(0,100)}vw;top:${rand(0,70)}vh;animation-delay:${rand(0,3)}s;animation-duration:${rand(1.8,3.5)}s`;
  $('estrellas').appendChild(s);
}

/* ===== 3. CORAZONES Y PÉTALOS ===== */
const CORAZONES = ['💗','💖','💕','💞','❤️','🩷','💘'];
function corazonFlotante(){
  const e = document.createElement('span');
  e.className = 'flota';
  e.textContent = CORAZONES[Math.floor(rand(0, CORAZONES.length))];
  e.style.left = rand(0, 100) + 'vw';
  e.style.fontSize = rand(16, 40) + 'px';
  e.style.setProperty('--t', rand(6, 11) + 's');
  e.style.setProperty('--dx', rand(-90, 90) + 'px');
  e.style.setProperty('--r', rand(-40, 40) + 'deg');
  e.addEventListener('animationend', () => e.remove());
  capa.appendChild(e);
}
function petalo(){
  const p = document.createElement('span');
  p.className = 'cae';
  p.style.left = rand(0, 100) + 'vw';
  p.style.setProperty('--t', rand(7, 14) + 's');
  p.style.setProperty('--dx', rand(-120, 120) + 'px');
  p.addEventListener('animationend', () => p.remove());
  capa.appendChild(p);
}
function explosion(x, y, n = 10, lista = CORAZONES){
  for (let i = 0; i < n; i++) {
    const c = document.createElement('span');
    c.className = 'chispa';
    c.textContent = lista[Math.floor(rand(0, lista.length))];
    const ang = (Math.PI * 2 * i) / n + rand(-.3, .3), d = rand(60, 150);
    c.style.left = x + 'px'; c.style.top = y + 'px';
    c.style.fontSize = rand(14, 30) + 'px';
    c.style.setProperty('--dx', Math.cos(ang) * d + 'px');
    c.style.setProperty('--dy', Math.sin(ang) * d - 40 + 'px');
    c.style.setProperty('--r', rand(-60, 60) + 'deg');
    c.addEventListener('animationend', () => c.remove());
    capa.appendChild(c);
  }
}
function lluvia(n = 30){
  for (let i = 0; i < n; i++) setTimeout(corazonFlotante, i * 90);
}

let ritmo = 900;                       // velocidad de corazones de fondo
(function bucle(){ corazonFlotante(); if (Math.random() < .5) petalo(); setTimeout(bucle, ritmo); })();

/* Toque en cualquier parte = explosión de corazones */
document.addEventListener('pointerdown', e => {
  if (e.target.closest('#btn-musica')) return;
  explosion(e.clientX, e.clientY, 7);
});
/* Estela de brillos al mover el dedo/mouse */
let ultimo = 0;
document.addEventListener('pointermove', e => {
  document.body.style.setProperty('--px', (e.clientX / innerWidth - .5).toFixed(3));
  document.body.style.setProperty('--py', (e.clientY / innerHeight - .5).toFixed(3));
  const t = performance.now(); if (t - ultimo < 70) return; ultimo = t;
  explosion(e.clientX, e.clientY, 1, ['✨','💗','🌸','✦']);
});

/* ===== 4. CUENTA REGRESIVA ===== */
(function(){
  const hoy = new Date(), h0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  let cumple = new Date(hoy.getFullYear(), MES_CUMPLE - 1, DIA_CUMPLE);
  if (h0 > cumple) cumple.setFullYear(cumple.getFullYear() + 1);
  const dias = Math.round((cumple - h0) / 864e5);
  $('cuenta').textContent = dias === 0 ? '¡Hoy es tu día, mi amor! 🎂'
    : dias === 1 ? 'Mañana es tu cumpleaños 💗' : `Faltan ${dias} días para tu cumpleaños 💗`;
})();

/* ===== 5. ABRIR EL SOBRE ===== */
let abierta = false;
$('sobre').addEventListener('click', async e => {
  if (abierta) return; abierta = true;
  e.stopPropagation();

  // música con entrada suave
  audio.volume = 0;
  audio.play().then(() => {
    let v = 0; const f = setInterval(() => { v = Math.min(VOLUMEN, v + .03); audio.volume = v; if (v >= VOLUMEN) clearInterval(f); }, 120);
  }).catch(() => { btnMus.textContent = '🔇'; });
  btnMus.classList.remove('oculto');

  const r = $('sello').getBoundingClientRect();
  explosion(r.left + r.width / 2, r.top + r.height / 2, 18);
  $('sobre').classList.add('abierto');
  setTimeout(() => explosion(innerWidth / 2, innerHeight / 2, 22), 900);
  lluvia(25);

  await dormir(2300);
  $('pantalla-sobre').classList.add('saliendo');
  await dormir(600);
  $('pantalla-sobre').className = 'pantalla';
  $('pantalla-carta').classList.add('activa');
  window.scrollTo(0, 0);
  ritmo = 350;                       // ¡más corazones en la carta!
  lluvia(40);
  escribirCarta();
  observarFotos();
});

/* ===== 6. CARTA QUE SE ESCRIBE SOLA ===== */
let saltarEscritura = false;
$('papel').addEventListener('click', () => { saltarEscritura = true; });

async function escribirCarta(){
  const parrafos = [...document.querySelectorAll('#papel p')];
  const textos = parrafos.map(p => p.textContent);
  parrafos.forEach(p => p.textContent = '');
  await dormir(1200);

  for (let i = 0; i < parrafos.length; i++) {
    const p = parrafos[i], cursor = document.createElement('span');
    cursor.className = 'cursor';
    p.appendChild(cursor);
    const chars = [...textos[i]];
    for (let k = 0; k < chars.length; k++) {
      if (saltarEscritura) break;
      cursor.before(chars[k]);
      if (k % 25 === 0) seguir(cursor);
      await dormir(VELOCIDAD_ESCRITURA + (/[.,]/.test(chars[k]) ? 140 : 0));
    }
    if (saltarEscritura) { p.textContent = textos[i]; continue; }
    cursor.remove(); p.textContent = textos[i];
    const r = p.getBoundingClientRect();
    explosion(r.right - 20, r.bottom - 10, 5, ['💗','💖']);
    await dormir(350);
  }
  document.querySelector('.saltar').style.display = 'none';
  lluvia(20);
}
function seguir(el){
  const y = el.getBoundingClientRect().bottom;
  if (y > innerHeight * .8) window.scrollBy({ top: y - innerHeight * .6, behavior: 'smooth' });
}

/* ===== 7. FOTOS: aparecen al hacer scroll y reaccionan al toque ===== */
function observarFotos(){
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
  }), { threshold: .25 });
  document.querySelectorAll('.polaroid').forEach(p => io.observe(p));
}
document.querySelectorAll('.marco').forEach(m => m.addEventListener('click', e => {
  m.classList.remove('rebota'); void m.offsetWidth; m.classList.add('rebota');
  explosion(e.clientX, e.clientY, 12);
}));

/* ===== 8. CORAZÓN GIGANTE ===== */
let besos = 0;
$('btn-corazon').addEventListener('click', e => {
  e.stopPropagation();
  besos++; $('num').textContent = besos;
  explosion(e.clientX, e.clientY, 14);
  if (besos % 10 === 0) { lluvia(45); navigator.vibrate && navigator.vibrate(120); }
});

/* ===== 9. MÚSICA ===== */
btnMus.addEventListener('click', e => {
  e.stopPropagation();
  if (audio.paused) { audio.play(); btnMus.textContent = '🔊'; }
  else { audio.pause(); btnMus.textContent = '🔇'; }
});
