import { useCallback, useEffect, useRef, useState } from 'react';
import Logo from './components/Logo';
import Icono from './components/Icono';
import { PREGUNTAS, PUNTOS_POR_ACIERTO } from './data/preguntas';
import * as api from './lib/almacen';
import { alternarSonido, clic, instalarSonido, sonar, sonidoActivo } from './lib/sonido';

const TOTAL = PREGUNTAS.length;
const LETRAS = ['A', 'B', 'C'];
const SUSPENSO_MS = 1400; // tiempo en "amarillo" antes de revelar, como en el programa
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const puntos = (n) => n.toLocaleString('es-CO');

/* =========================== INICIO =========================== */
function Inicio({ onJugar, onInstrucciones }) {
  return (
    <main className="pantalla inicio">
      <div className="inicio-centro">
        <Logo className="logo-inicio" />
        <p className="sobretitulo">Seguridad vial · Talento Humano</p>
        <h1 className="titulo-juego"><span className="l1">¿Quién quiere ser un</span> <span className="l2">conductor ejemplar?</span></h1>
        <div className="acciones">
          <button className="btn btn-primario" type="button" onClick={onJugar}>
            <Icono nombre="play" /> Jugar
          </button>
          <button className="btn btn-fantasma" type="button" onClick={onInstrucciones}>
            <Icono nombre="info" /> Instrucciones
          </button>
        </div>
      </div>
      <p className="pie">¡Cada decisión cuenta, tanto en el juego como en la vía!</p>
    </main>
  );
}

/* ======================== INSTRUCCIONES (ventana) ======================== */
const PASOS = [
  ['Elige tu respuesta', 'Lee con atención cada pregunta y elige una de las tres opciones: A, B o C.'],
  ['Avanza por los niveles', 'Son 14 niveles. Cada pregunta es un nuevo reto: analiza la situación antes de responder.'],
  ['Sigue jugando', 'Si aciertas, superas el nivel y sumas 100 puntos. Si te equivocas, el juego continúa y te mostramos la decisión segura.'],
  ['Reflexiona y aprende', 'Al final verás tu resultado y una reflexión sobre autocuidado, emociones, concentración y decisiones responsables.'],
];

function Instrucciones({ onCerrar, onJugar }) {
  const caja = useRef(null);
  useEffect(() => {
    caja.current?.focus();
    const k = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onCerrar]);
  return (
    <div className="velo" onClick={onCerrar}>
      <section className="ventana" role="dialog" aria-modal="true" aria-labelledby="t-instr"
        tabIndex={-1} ref={caja} onClick={(e) => e.stopPropagation()}>
        <button className="btn-icono ventana-cerrar" type="button" onClick={onCerrar} aria-label="Cerrar instrucciones">
          <Icono nombre="cerrar" />
        </button>
        <h2 id="t-instr">Cómo jugar</h2>
        <p className="ventana-lema">Pon a prueba tus conocimientos sobre seguridad vial, emociones, atención y toma de decisiones durante la conducción.</p>
        <ol className="pasos-instr">
          {PASOS.map(([t, d], i) => (
            <li key={t}><span className="paso-num">{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>
          ))}
        </ol>
        <button className="btn btn-primario btn-ancho" type="button" onClick={onJugar}>
          <Icono nombre="play" /> Entendido, ¡a jugar!
        </button>
      </section>
    </div>
  );
}

/* =========================== INGRESO =========================== */
function Ingreso({ onIngresar, onVolver }) {
  const [ced, setCed] = useState('');
  const [error, setError] = useState('');
  const enviar = (e) => {
    e.preventDefault();
    const r = api.ingresar(ced.trim());
    if (!r.ok) { setError(r.error); sonar('mal'); return; }
    onIngresar(r.jugador);
  };
  return (
    <main className="pantalla centrada">
      <button className="btn-texto volver-arriba" type="button" onClick={onVolver}>
        <Icono nombre="atras" /> Volver
      </button>
      <form className="tarjeta" onSubmit={enviar} autoComplete="off" noValidate>
        <Logo className="logo-tarjeta" />
        <h1>¿Listo para el reto?</h1>
        <p className="tarjeta-sub">Escribe tu número de cédula para registrar tus respuestas.</p>
        <label className="campo">
          <span>Número de cédula</span>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={15} autoFocus
            placeholder="Ej. 1036123456" required aria-invalid={!!error} aria-describedby="err-ced"
            value={ced} onChange={(e) => { setCed(e.target.value.replace(/\D/g, '')); setError(''); }} />
        </label>
        <p className="msg-error" id="err-ced" role="alert">{error}</p>
        <button className="btn btn-primario btn-ancho" type="submit" disabled={ced.length < 5}>
          Comenzar <Icono nombre="adelante" />
        </button>
      </form>
    </main>
  );
}

/* =========================== ESCALERA =========================== */
function Escalera({ idx, marcas }) {
  return (
    <aside className="escalera" aria-label="Niveles">
      <ol>
        {PREGUNTAS.map((p, i) => i).reverse().map((i) => {
          const estado = i < marcas.length ? marcas[i] : i === idx ? 'actual' : '';
          return (
            <li key={i} className={estado}>
              <span className="esc-num">{i + 1}</span>
              <span className="esc-pts">{puntos((i + 1) * PUNTOS_POR_ACIERTO)}</span>
              <span className="esc-marca">
                {estado === 'ok' && <Icono nombre="check" />}
                {estado === 'mal' && <Icono nombre="x" />}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

/* =========================== JUEGO =========================== */
function Juego({ jugador, idx, marcas, onRespondida, onSiguiente }) {
  const p = PREGUNTAS[idx];
  const [elegida, setElegida] = useState(null);
  const [res, setRes] = useState(null); // respuesta del almacén tras revelar
  const siguienteBtn = useRef(null);
  const aciertos = marcas.filter((m) => m === 'ok').length;

  const elegir = useCallback(async (letra) => {
    if (elegida) return;
    clic();
    setElegida(letra);
    await esperar(SUSPENSO_MS);
    const r = api.responder(jugador.documento, p.n, letra);
    if (!r.ok) { setElegida(null); return; }
    setRes(r);
    onRespondida(r);
    sonar(r.es_correcta ? 'ok' : 'mal');
  }, [elegida, jugador, p.n, onRespondida]);

  useEffect(() => { if (res) siguienteBtn.current?.focus({ preventScroll: true }); }, [res]);

  // Teclado: A/B/C o 1/2/3 eligen; Enter avanza
  useEffect(() => {
    const k = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const i = ['1', '2', '3'].indexOf(e.key) >= 0 ? Number(e.key) - 1 : LETRAS.indexOf(e.key.toUpperCase());
      if (!res && i >= 0 && p.opciones[i]) elegir(p.opciones[i].letra);
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [elegir, p, res]);

  const estadoOpcion = (op) => {
    if (!elegida) return '';
    if (!res) return op.letra === elegida ? 'elegida' : 'apagada';
    if (op.letra === p.correcta) return 'correcta';
    if (op.letra === elegida) return 'incorrecta';
    return 'apagada';
  };

  return (
    <main className="pantalla juego">
      <div className="tablero">
        {/* Progreso compacto (visible en celular) */}
        <div className="progreso-movil" aria-hidden="true">
          <span>Nivel <b>{p.n}</b> de {TOTAL}</span>
          <div className="segmentos">
            {PREGUNTAS.map((_, i) => (
              <i key={i} className={i < marcas.length ? marcas[i] : i === idx ? 'actual' : ''} />
            ))}
          </div>
          <span className="pts">{puntos(aciertos * PUNTOS_POR_ACIERTO)} pts</span>
        </div>

        <div className="nivel-etiqueta">Pregunta {p.n} de {TOTAL}</div>

        <div className="hex hex-pregunta" key={'q' + p.n}>
          <div className="hex-borde"><div className="hex-in"><p>{p.texto}</p></div></div>
        </div>

        <div className="opciones" role="group" aria-label="Opciones de respuesta">
          {p.opciones.map((op, i) => {
            const est = estadoOpcion(op);
            return (
              <button key={p.n + op.letra} type="button" className={'hex hex-opcion ' + est}
                style={{ animationDelay: 0.1 + i * 0.08 + 's' }}
                disabled={!!elegida} onClick={() => elegir(op.letra)}
                aria-label={`Opción ${LETRAS[i]}: ${op.texto}`}>
                <div className="hex-borde"><div className="hex-in">
                  <span className="letra">{LETRAS[i]}</span>
                  <span className="txt">{op.texto}</span>
                  {est === 'correcta' && <Icono nombre="check" className="ico-estado" />}
                  {est === 'incorrecta' && <Icono nombre="x" className="ico-estado" />}
                </div></div>
              </button>
            );
          })}
        </div>

        <div className="zona-feedback" aria-live="polite">
          {elegida && !res && <p className="esperando">Verificando respuesta…</p>}
          {res && (
            <div className={'feedback ' + (res.es_correcta ? 'ok' : 'mal')}>
              <div className="fb-texto">
                <span className="fb-icono"><Icono nombre={res.es_correcta ? 'check' : 'x'} /></span>
                <div>
                  <b>{res.es_correcta ? `¡Correcto! Nivel ${p.n} superado` : `Nivel ${p.n} no superado`}</b>
                  <p>{res.es_correcta
                    ? `+${PUNTOS_POR_ACIERTO} puntos. ¡Excelente decisión!`
                    : <>La decisión segura era: <em>{res.correcta_texto}</em></>}</p>
                </div>
              </div>
              <button ref={siguienteBtn} className="btn btn-primario" type="button" onClick={onSiguiente}>
                {res.ultima ? 'Ver mi resultado' : 'Siguiente pregunta'} <Icono nombre="adelante" />
              </button>
            </div>
          )}
        </div>
      </div>

      <Escalera idx={idx} marcas={marcas} />
    </main>
  );
}

/* =========================== RESULTADO =========================== */
function Resultado({ resumen: r, jugador, onOtraVez, onInicio }) {
  const R = 54, C = 2 * Math.PI * R;
  const [lleno, setLleno] = useState(0);
  useEffect(() => { const t = setTimeout(() => setLleno(r.porcentaje), 150); return () => clearTimeout(t); }, [r.porcentaje]);

  let titulo, msg;
  if (r.porcentaje >= 90) { titulo = '¡Eres un conductor ejemplar!'; msg = 'Excelente. Tus decisiones protegen vidas.'; }
  else if (r.porcentaje >= 70) { titulo = '¡Muy bien!'; msg = 'Vas por buen camino. Repasa las que fallaste.'; }
  else if (r.porcentaje >= 50) { titulo = 'Buen intento'; msg = 'Cada decisión cuenta: revisa lo aprendido.'; }
  else { titulo = 'Hoy aprendiste mucho'; msg = '¡La seguridad en la vía empieza por ti!'; }

  return (
    <main className="pantalla resultado">
      <div className="resultado-grid">
        <section className="tarjeta tarjeta-resultado" aria-label="Tu resultado">
          <p className="sobretitulo">Tu resultado · {jugador?.nombre}</p>
          <div className="anillo" role="img" aria-label={`${r.porcentaje}% de aciertos`}>
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={R} className="anillo-fondo" />
              <circle cx="60" cy="60" r={R} className="anillo-valor"
                strokeDasharray={C} strokeDashoffset={C * (1 - lleno / 100)} />
            </svg>
            <div className="anillo-txt"><b>{String(r.porcentaje).replace('.', ',')}%</b><span>de aciertos</span></div>
          </div>
          <h1>{titulo}</h1>
          <p className="tarjeta-sub">{msg}</p>
          <dl className="stats">
            <div><dt>Correctas</dt><dd className="ok">{r.correctas}</dd></div>
            <div><dt>Incorrectas</dt><dd className="mal">{r.incorrectas}</dd></div>
            <div><dt>Puntos</dt><dd>{puntos(r.puntaje)}<small>/{puntos(r.puntaje_max)}</small></dd></div>
          </dl>
        </section>

        <section className="reflexion" aria-label="Reflexión final">
          <Logo className="logo-reflexion" />
          <h2>Más que un juego, es transformar decisiones.</h2>
          <p>Cada recorrido es una nueva oportunidad para tomar mejores decisiones. Conducir no solo requiere habilidad y conocimiento, sino también <b>atención, paciencia, autocontrol y compromiso</b>.</p>
          <p>Tus decisiones en la vía pueden marcar la diferencia entre llegar seguro o poner una vida en riesgo.</p>
          <p className="lema-final">¡En la vía, cada decisión cuenta!</p>
          <div className="acciones">
            <button className="btn btn-primario" type="button" onClick={onOtraVez}><Icono nombre="repetir" /> Jugar de nuevo</button>
            <button className="btn btn-fantasma" type="button" onClick={onInicio}><Icono nombre="inicio" /> Ir al inicio</button>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================== APP =========================== */
export default function App() {
  const [pantalla, setPantalla] = useState('inicio');
  const [verInstr, setVerInstr] = useState(false);
  const [jugador, setJugador] = useState(null);
  const [idx, setIdx] = useState(0);
  const [marcas, setMarcas] = useState([]);
  const [ultimaRes, setUltimaRes] = useState(null);
  const [sonido, setSonido] = useState(sonidoActivo());
  const [aviso, setAviso] = useState('');
  const avisoT = useRef(null);

  useEffect(() => instalarSonido(), []);

  const mostrarAviso = (t) => {
    setAviso(t);
    clearTimeout(avisoT.current);
    avisoT.current = setTimeout(() => setAviso(''), 3500);
  };

  const iniciarPartida = (j) => {
    const r = api.iniciar(j.documento);
    setIdx(r.respondidas);
    setMarcas(r.marcas);
    setUltimaRes(null);
    if (r.retomada) mostrarAviso(`Retomamos tu juego en el nivel ${r.respondidas + 1}. ¡Sigue así!`);
    setPantalla('juego');
  };

  const jugar = () => {
    clic();
    setVerInstr(false);
    if (jugador) iniciarPartida(jugador); else setPantalla('ingreso');
  };

  const onRespondida = useCallback((r) => {
    setMarcas((m) => [...m, r.es_correcta ? 'ok' : 'mal']);
    setUltimaRes(r);
  }, []);

  const siguiente = () => {
    clic();
    if (ultimaRes?.ultima) { setPantalla('resultado'); sonar('fin'); return; }
    setUltimaRes(null);
    setIdx((i) => i + 1);
  };

  const salir = () => {
    clic();
    if (pantalla === 'juego') mostrarAviso('Tu progreso quedó guardado. Puedes continuar cuando quieras.');
    setJugador(null);
    setPantalla('inicio');
  };

  return (
    <>
      <div className="escenario" aria-hidden="true"><i className="foco" /><i className="anillos" /></div>

      <header className="barra-sup">
        {pantalla === "juego" || pantalla === "resultado" ? <Logo className="logo-barra" /> : <span />}
        <div className="barra-der">
          {jugador && (
            <span className="chip-jugador"><Icono nombre="usuario" /> {jugador.nombre}</span>
          )}
          <button className="btn-icono" type="button" onClick={() => setSonido(alternarSonido())}
            aria-label={sonido ? 'Silenciar' : 'Activar sonido'} title={sonido ? 'Silenciar' : 'Activar sonido'}>
            <Icono nombre={sonido ? 'sonido' : 'mudo'} />
          </button>
          {jugador && (
            <button className="btn-icono" type="button" onClick={salir} aria-label="Salir" title="Salir">
              <Icono nombre="salir" />
            </button>
          )}
        </div>
      </header>

      {pantalla === 'inicio' && <Inicio onJugar={jugar} onInstrucciones={() => { clic(); setVerInstr(true); }} />}
      {pantalla === 'ingreso' && (
        <Ingreso onVolver={() => { clic(); setPantalla('inicio'); }}
          onIngresar={(j) => { clic(); setJugador(j); iniciarPartida(j); }} />
      )}
      {pantalla === 'juego' && jugador && (
        <Juego key={idx} jugador={jugador} idx={idx} marcas={marcas} onRespondida={onRespondida} onSiguiente={siguiente} />
      )}
      {pantalla === 'resultado' && ultimaRes && (
        <Resultado resumen={ultimaRes.resumen} jugador={jugador} onOtraVez={jugar}
          onInicio={() => { clic(); setPantalla('inicio'); }} />
      )}

      {verInstr && <Instrucciones onCerrar={() => setVerInstr(false)} onJugar={jugar} />}

      <div className={'aviso' + (aviso ? ' visible' : '')} role="status">{aviso}</div>
    </>
  );
}
