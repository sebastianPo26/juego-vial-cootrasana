// Interruptor de datos: decide dónde se guardan las cédulas y las respuestas.
//
//   VITE_MODO_DATOS=local     → en el navegador de cada persona (como está hoy). Valor por defecto.
//   VITE_MODO_DATOS=servidor  → en la base de datos del juego anterior, por medio de conector-servidor.js.
//
// Se cambia en el archivo .env (ver .env.ejemplo) o en la configuración de Netlify.
// Las dos opciones tienen las mismas funciones, así que el juego no cambia.

import * as local from './almacen';
import * as servidor from './conector-servidor';

export const MODO = import.meta.env.VITE_MODO_DATOS === 'servidor' ? 'servidor' : 'local';
const fuente = MODO === 'servidor' ? servidor : local;

export const ingresar = async (documento) => fuente.ingresar(documento);
export const iniciar = async (documento) => fuente.iniciar(documento);
export const responder = async (documento, n, letra) => fuente.responder(documento, n, letra);
export const salir = async () => (fuente.salir ? fuente.salir() : undefined);
