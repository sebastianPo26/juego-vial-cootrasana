// Registro de jugadores y respuestas.
// El juego original guarda todo en su servidor (PHP + base de datos) usando la cédula.
// Esta versión lo guarda en el navegador (localStorage) para funcionar sin backend.
// Para conectarlo a un servidor, reemplaza el cuerpo de estas funciones por llamadas
// fetch() a tu API: la interfaz del juego no necesita cambiar.

import { PREGUNTAS, PUNTOS_POR_ACIERTO } from '../data/preguntas';

const K_PARTIDAS = 'cootrasana_jv_partidas';
const K_HISTORIAL = 'cootrasana_jv_historial';
const TOTAL = PREGUNTAS.length;

const leer = (k, def) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
};
const escribir = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ }
};

const formatoCedula = (c) => 'C.C. ' + Number(c).toLocaleString('es-CO');

export function ingresar(documento) {
  const ced = String(documento).replace(/\D/g, '');
  if (ced.length < 5) return { ok: false, error: 'Escribe tu número de cédula completo.' };
  return { ok: true, jugador: { documento: ced, nombre: formatoCedula(ced) } };
}

function resumenDe(respuestas) {
  const realizadas = Object.keys(respuestas).length;
  const correctas = PREGUNTAS.filter((p) => respuestas[p.n] === p.correcta).length;
  const incorrectas = realizadas - correctas;
  const porcentaje = realizadas ? Math.round((correctas / realizadas) * 1000) / 10 : 0;
  return {
    realizadas,
    correctas,
    incorrectas,
    puntaje: correctas * PUNTOS_POR_ACIERTO,
    puntaje_max: TOTAL * PUNTOS_POR_ACIERTO,
    porcentaje,
  };
}

/** Inicia o retoma la partida de la cédula indicada. */
export function iniciar(documento) {
  const partidas = leer(K_PARTIDAS, {});
  let p = partidas[documento];
  let retomada = false;
  if (p && !p.finalizada && Object.keys(p.respuestas).length > 0) {
    retomada = true;
  } else {
    p = { respuestas: {}, inicio: new Date().toISOString(), finalizada: false };
    partidas[documento] = p;
    escribir(K_PARTIDAS, partidas);
  }
  // Marcas en orden para la barra de progreso
  const marcas = PREGUNTAS.filter((q) => p.respuestas[q.n])
    .map((q) => (p.respuestas[q.n] === q.correcta ? 'ok' : 'mal'));
  return { ok: true, retomada, respondidas: marcas.length, marcas };
}

/** Registra la respuesta y devuelve si fue correcta. */
export function responder(documento, n, letra) {
  const partidas = leer(K_PARTIDAS, {});
  const p = partidas[documento];
  if (!p) return { ok: false, sesion: false, error: 'Tu sesión terminó. Ingresa de nuevo.' };
  const preg = PREGUNTAS.find((q) => q.n === n);
  if (!preg) return { ok: false, error: 'Pregunta no válida.' };

  if (!p.respuestas[n]) p.respuestas[n] = letra;
  const elegida = p.respuestas[n];
  const es_correcta = elegida === preg.correcta;
  const ultima = n === TOTAL;
  const resumen = resumenDe(p.respuestas);

  if (ultima && !p.finalizada) {
    p.finalizada = true;
    p.fin = new Date().toISOString();
    const hist = leer(K_HISTORIAL, []);
    hist.push({ documento, inicio: p.inicio, fin: p.fin, respuestas: p.respuestas, ...resumen });
    escribir(K_HISTORIAL, hist);
  }
  escribir(K_PARTIDAS, partidas);

  return {
    ok: true,
    pregunta: n,
    es_correcta,
    ultima,
    correcta_texto: preg.opciones.find((o) => o.letra === preg.correcta).texto,
    resumen,
  };
}

/** Historial de partidas terminadas en este equipo (para exportar). */
export function historial() {
  return leer(K_HISTORIAL, []);
}
