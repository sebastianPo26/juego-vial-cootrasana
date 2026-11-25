// Conector con el servidor del juego anterior
// (talentohumano.cootrasana.com.co/juego_vial/index.php).
//
// Habla con ese servidor exactamente igual que la página anterior:
//   - Envía formularios POST con el campo "accion" y la ficha de seguridad "csrf".
//   - Acciones: ingresar (documento), iniciar, responder (pregunta, opcion), salir.
//   - El servidor guarda todo en su base de datos y responde en JSON.
// La sesión del jugador viaja en la galleta (cookie) que crea el propio servidor.
//
// IMPORTANTE: el navegador solo envía esa galleta si la página y el servidor
// tienen la misma dirección. Por eso la dirección se configura con
// VITE_URL_SERVIDOR (ver CONECTOR.md): o la página se instala en el mismo
// servidor, o se usa el reenvío de Netlify.

import { PREGUNTAS } from '../data/preguntas';

const URL_SERVIDOR = import.meta.env.VITE_URL_SERVIDOR || '/juego_vial/index.php';
const TOTAL = PREGUNTAS.length;

let csrf = null;

/** La página anterior entrega la ficha de seguridad dentro de su HTML (const CFG = {"csrf": ...}). */
async function obtenerCsrf(forzar = false) {
  if (csrf && !forzar) return csrf;
  const r = await fetch(URL_SERVIDOR, { credentials: 'same-origin' });
  if (!r.ok) throw new Error('El servidor respondió ' + r.status);
  const html = await r.text();
  const m = html.match(/"csrf"\s*:\s*"([^"]+)"/);
  if (!m) throw new Error('No se encontró la ficha de seguridad en la respuesta del servidor.');
  csrf = m[1];
  return csrf;
}

async function enviar(accion, datos = {}, reintento = true) {
  let ficha;
  try { ficha = await obtenerCsrf(); }
  catch { return { ok: false, error: 'No se pudo conectar con el servidor. Revisa tu internet e intenta de nuevo.' }; }

  const fd = new FormData();
  fd.append('accion', accion);
  fd.append('csrf', ficha);
  Object.entries(datos).forEach(([k, v]) => fd.append(k, v));

  let r;
  try {
    r = await fetch(URL_SERVIDOR, { method: 'POST', body: fd, credentials: 'same-origin' });
  } catch {
    return { ok: false, error: 'Sin conexión. Revisa tu internet e intenta de nuevo.' };
  }
  let json;
  try { json = await r.json(); }
  catch { return { ok: false, error: 'Respuesta inesperada del servidor.' }; }

  // Si la ficha venció, se pide una nueva y se intenta una sola vez más.
  if (!json.ok && reintento && /csrf|token|seguridad/i.test(json.error || '')) {
    await obtenerCsrf(true);
    return enviar(accion, datos, false);
  }
  return json;
}

/** Revisa la cédula en la base de datos y devuelve el nombre del empleado. */
export async function ingresar(documento) {
  const ced = String(documento).replace(/\D/g, '');
  if (ced.length < 5) return { ok: false, error: 'Escribe tu número de cédula completo.' };
  const r = await enviar('ingresar', { documento: ced });
  if (!r.ok) return { ok: false, error: r.error || 'No pudimos validar tu cédula.' };
  return { ok: true, jugador: { ...r.jugador, documento: ced, nombre: r.jugador?.nombre || 'C.C. ' + ced } };
}

/** Inicia o retoma la partida guardada en el servidor. */
export async function iniciar() {
  const r = await enviar('iniciar');
  if (!r.ok) return { ok: false, sesion: r.sesion, error: r.error || 'No se pudo iniciar el juego.' };
  // El servidor solo da los totales, no el orden de aciertos y errores (igual que la página anterior).
  const marcas = [...Array(r.correctas || 0).fill('ok'), ...Array(r.incorrectas || 0).fill('mal')];
  return { ok: true, retomada: !!r.retomada, respondidas: Math.min(r.respondidas || 0, TOTAL - 1), marcas };
}

/** Guarda la respuesta; el servidor dice si fue correcta. */
export async function responder(_documento, n, letra) {
  const r = await enviar('responder', { pregunta: n, opcion: letra });
  if (!r.ok) return { ok: false, sesion: r.sesion, error: r.error || 'No se pudo guardar tu respuesta.' };
  return {
    ok: true,
    pregunta: r.pregunta ?? n,
    es_correcta: !!r.es_correcta,
    ultima: !!r.ultima,
    correcta_texto: r.correcta_texto,
    resumen: r.resumen,
  };
}

/** Cierra la sesión del jugador en el servidor. */
export async function salir() {
  await enviar('salir');
  csrf = null;
}
