// Música de fondo en bucle + efectos generados con Web Audio (igual que el original).
import musicaUrl from '../assets/audio/fondo.mp3';

const MUSICA_VOL = 0.35;
const MUSICA_VOL_BAJO = 0.1;

let activo = true;
try { activo = localStorage.getItem('jv_sonido') !== '0'; } catch { /* nada */ }

let ctx = null, gain = null, fuente = null, buffer = null, carga = null, iniciando = false, html = null, duck = null;

const obtenerCtx = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());

function cargar() {
  if (buffer) return Promise.resolve(buffer);
  carga ??= fetch(musicaUrl)
    .then((r) => { if (!r.ok) throw new Error('sin música'); return r.arrayBuffer(); })
    .then((b) => new Promise((ok, err) => obtenerCtx().decodeAudioData(b, ok, err)))
    .then((b) => (buffer = b))
    .catch((e) => { carga = null; throw e; });
  return carga;
}

export async function iniciarMusica() {
  if (!activo || document.hidden || fuente || iniciando) return;
  if (html) { html.play().catch(() => {}); return; }
  iniciando = true;
  try {
    const c = obtenerCtx();
    if (c.state === 'suspended') await c.resume();
    const b = await cargar();
    if (!activo || fuente) return;
    if (!gain) { gain = c.createGain(); gain.connect(c.destination); }
    const src = c.createBufferSource();
    src.buffer = b;
    src.loop = true;
    src.connect(gain);
    gain.gain.cancelScheduledValues(c.currentTime);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(MUSICA_VOL, c.currentTime + 1.5);
    src.start();
    fuente = src;
  } catch {
    if (!html) { html = new Audio(musicaUrl); html.loop = true; html.volume = MUSICA_VOL; }
    if (activo) html.play().catch(() => {});
  } finally {
    iniciando = false;
  }
}

function detenerMusica() {
  if (fuente) { try { fuente.stop(); } catch { /* nada */ } fuente = null; }
  if (html) html.pause();
}

function bajarMusica(seg) {
  clearTimeout(duck);
  if (html) { html.volume = MUSICA_VOL_BAJO; duck = setTimeout(() => { html.volume = MUSICA_VOL; }, seg * 1000); return; }
  if (!gain || !ctx) return;
  const g = gain.gain, t = ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(MUSICA_VOL_BAJO, t + 0.15);
  g.setValueAtTime(MUSICA_VOL_BAJO, t + seg);
  g.linearRampToValueAtTime(MUSICA_VOL, t + seg + 0.8);
}

function tono(f, ini, dur, tipo = 'sine', vol = 0.18) {
  if (!activo) return;
  try {
    const c = obtenerCtx();
    const o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.value = f;
    const t0 = c.currentTime + ini;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  } catch { /* nada */ }
}

export const clic = () => tono(660, 0, 0.08, 'triangle', 0.08);

export function sonar(tipo) {
  if (tipo === 'ok') { bajarMusica(0.8); [523, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.11, 0.25, 'triangle')); }
  if (tipo === 'mal') { bajarMusica(0.8); tono(330, 0, 0.25, 'sawtooth', 0.1); tono(247, 0.22, 0.45, 'sawtooth', 0.1); }
  if (tipo === 'fin') { bajarMusica(1.1); [523, 659, 784, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.13, 0.3, 'triangle')); }
}

export const sonidoActivo = () => activo;

export function alternarSonido() {
  activo = !activo;
  try { localStorage.setItem('jv_sonido', activo ? '1' : '0'); } catch { /* nada */ }
  if (activo) { iniciarMusica(); clic(); } else detenerMusica();
  return activo;
}

export function instalarSonido() {
  const arrancar = () => iniciarMusica();
  const evs = ['pointerdown', 'keydown', 'touchend'];
  evs.forEach((ev) => document.addEventListener(ev, arrancar, { passive: true }));
  const vis = () => {
    if (!ctx && !html) return;
    if (document.hidden) {
      if (ctx && ctx.state === 'running') ctx.suspend();
      if (html) html.pause();
    } else if (activo) {
      if (ctx) ctx.resume();
      if (html) html.play().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', vis);
  iniciarMusica();
  return () => {
    evs.forEach((ev) => document.removeEventListener(ev, arrancar));
    document.removeEventListener('visibilitychange', vis);
  };
}
