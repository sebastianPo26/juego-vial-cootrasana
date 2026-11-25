/* =====================================================================
   ¿Quién quiere ser un conductor ejemplar? · Cootrasana
   Parte del navegador (JavaScript sin librerías). Muestra las pantallas;
   el servidor PHP (index.php) guarda todo y decide si la respuesta es correcta.
   Equivale, pantalla por pantalla, a la versión hecha en React.
   ===================================================================== */
(function () {
  'use strict';

  const CFG = window.JV_CFG;
  const PREGUNTAS = CFG.preguntas;
  const TOTAL = PREGUNTAS.length;
  const PUNTOS = CFG.puntos;
  const LETRAS = ['A', 'B', 'C'];
  const SUSPENSO_MS = 1400; // tiempo en "amarillo" antes de revelar, como en el programa
  const LOGO = 'assets/img/logo-cootrasana.png';
  const PLACA = 'assets/img/seguridad-vial.png';
  const MUSICA = 'assets/audio/fondo.mp3';

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const puntos = (n) => Number(n).toLocaleString('es-CO');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- Íconos (mismos de la versión React) ---------------- */
  const RUTAS = {
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
    atras: '<path d="M15 5l-7 7 7 7"/>',
    adelante: '<path d="M9 5l7 7-7 7"/>',
    cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    sonido: '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    mudo: '<path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6"/>',
    salir: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
    repetir: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
    inicio: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  };
  const icono = (nombre, cls = '') =>
    `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${RUTAS[nombre]}</svg>`;
  const logo = (cls) => `<div class="logo ${cls}"><img src="${LOGO}" alt="Cootrasana · Cooperativa de Transportadores San Antonio"></div>`;

  /* =========================== SONIDO =========================== */
  const Sonido = (() => {
    const VOL = 0.35, VOL_BAJO = 0.1;
    let activo = true;
    try { activo = localStorage.getItem('jv_sonido') !== '0'; } catch (e) { /* nada */ }
    let ctx = null, gain = null, fuente = null, buffer = null, carga = null, iniciando = false, html = null, duck = null;
    const obtenerCtx = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());

    function cargar() {
      if (buffer) return Promise.resolve(buffer);
      carga = carga || fetch(MUSICA)
        .then((r) => { if (!r.ok) throw new Error('sin música'); return r.arrayBuffer(); })
        .then((b) => new Promise((ok, err) => obtenerCtx().decodeAudioData(b, ok, err)))
        .then((b) => (buffer = b))
        .catch((e) => { carga = null; throw e; });
      return carga;
    }
    async function iniciarMusica() {
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
        src.buffer = b; src.loop = true; src.connect(gain);
        gain.gain.cancelScheduledValues(c.currentTime);
        gain.gain.setValueAtTime(0, c.currentTime);
        gain.gain.linearRampToValueAtTime(VOL, c.currentTime + 1.5);
        src.start();
        fuente = src;
      } catch (e) {
        if (!html) { html = new Audio(MUSICA); html.loop = true; html.volume = VOL; }
        if (activo) html.play().catch(() => {});
      } finally { iniciando = false; }
    }
    function detener() {
      if (fuente) { try { fuente.stop(); } catch (e) { /* nada */ } fuente = null; }
      if (html) html.pause();
    }
    function bajar(seg) {
      clearTimeout(duck);
      if (html) { html.volume = VOL_BAJO; duck = setTimeout(() => { html.volume = VOL; }, seg * 1000); return; }
      if (!gain || !ctx) return;
      const g = gain.gain, t = ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(VOL_BAJO, t + 0.15);
      g.setValueAtTime(VOL_BAJO, t + seg);
      g.linearRampToValueAtTime(VOL, t + seg + 0.8);
    }
    function tono(f, ini, dur, tipo = 'sine', vol = 0.18) {
      if (!activo) return;
      try {
        const c = obtenerCtx(), o = c.createOscillator(), g = c.createGain();
        o.type = tipo; o.frequency.value = f;
        const t0 = c.currentTime + ini;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        o.connect(g).connect(c.destination);
        o.start(t0); o.stop(t0 + dur + 0.05);
      } catch (e) { /* nada */ }
    }
    const clic = () => tono(660, 0, 0.08, 'triangle', 0.08);
    function sonar(tipo) {
      if (tipo === 'ok') { bajar(0.8); [523, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.11, 0.25, 'triangle')); }
      if (tipo === 'mal') { bajar(0.8); tono(330, 0, 0.25, 'sawtooth', 0.1); tono(247, 0.22, 0.45, 'sawtooth', 0.1); }
      if (tipo === 'fin') { bajar(1.1); [523, 659, 784, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.13, 0.3, 'triangle')); }
    }
    function alternar() {
      activo = !activo;
      try { localStorage.setItem('jv_sonido', activo ? '1' : '0'); } catch (e) { /* nada */ }
      if (activo) { iniciarMusica(); clic(); } else detener();
      return activo;
    }
    function instalar() {
      ['pointerdown', 'keydown', 'touchend'].forEach((ev) => document.addEventListener(ev, iniciarMusica, { passive: true }));
      document.addEventListener('visibilitychange', () => {
        if (!ctx && !html) return;
        if (document.hidden) { if (ctx && ctx.state === 'running') ctx.suspend(); if (html) html.pause(); }
        else if (activo) { if (ctx) ctx.resume(); if (html) html.play().catch(() => {}); }
      });
      iniciarMusica();
    }
    return { clic, sonar, alternar, instalar, activo: () => activo };
  })();

  /* =========================== SERVIDOR =========================== */
  async function enviar(accion, datos = {}) {
    const fd = new FormData();
    fd.append('accion', accion);
    fd.append('csrf', CFG.csrf);
    Object.entries(datos).forEach(([k, v]) => fd.append(k, v));
    let r;
    try { r = await fetch(CFG.url, { method: 'POST', body: fd, credentials: 'same-origin' }); }
    catch (e) { return { ok: false, error: 'Sin conexión. Revisa tu internet e intenta de nuevo.' }; }
    try { return await r.json(); }
    catch (e) { return { ok: false, error: 'Respuesta inesperada del servidor.' }; }
  }

  /* =========================== ESTADO =========================== */
  const estado = {
    pantalla: 'inicio',
    jugador: CFG.jugador || null,
    idx: 0,
    marcas: [],
    ultimaRes: null,
    juego: null, // { elegida, res } de la pregunta en pantalla
  };

  const pantallaEl = $('#pantalla');
  const avisoEl = $('#aviso');
  let avisoT = null;
  function mostrarAviso(t) {
    avisoEl.textContent = t;
    avisoEl.classList.add('visible');
    clearTimeout(avisoT);
    avisoT = setTimeout(() => avisoEl.classList.remove('visible'), 3500);
  }

  /* ---------------- Barra superior ---------------- */
  const btnSonido = $('#btnSonido');
  const btnSalir = $('#btnSalir');
  btnSalir.innerHTML = icono('salir');
  function pintarSonido() {
    const a = Sonido.activo();
    btnSonido.innerHTML = icono(a ? 'sonido' : 'mudo');
    btnSonido.setAttribute('aria-label', a ? 'Silenciar' : 'Activar sonido');
    btnSonido.title = a ? 'Silenciar' : 'Activar sonido';
  }
  btnSonido.addEventListener('click', () => { Sonido.alternar(); pintarSonido(); });

  function pintarBarra() {
    const p = estado.pantalla;
    $('#barraIzq').innerHTML = (p === 'juego' || p === 'resultado')
      ? `<div class="marcas-barra">${logo('logo-barra')}<img class="placa-barra" src="${PLACA}" alt="Seguridad Vial"></div>`
      : '<span></span>';
    const chip = $('#chipJugador');
    if (estado.jugador) { chip.innerHTML = icono('usuario') + ' ' + esc(estado.jugador.nombre); chip.hidden = false; }
    else chip.hidden = true;
    btnSalir.hidden = !estado.jugador;
    $('#placaEsquina').hidden = !(p === 'inicio' || p === 'ingreso');
  }

  btnSalir.addEventListener('click', () => {
    Sonido.clic();
    enviar('salir');
    if (estado.pantalla === 'juego') mostrarAviso('Tu progreso quedó guardado. Puedes continuar cuando quieras.');
    estado.jugador = null;
    ir('inicio');
  });

  function ir(pantalla) {
    estado.pantalla = pantalla;
    pintarBarra();
    window.scrollTo(0, 0);
    ({ inicio: pintarInicio, ingreso: pintarIngreso, juego: pintarJuego, resultado: pintarResultado })[pantalla]();
  }

  /* =========================== INICIO =========================== */
  function pintarInicio() {
    pantallaEl.innerHTML = `
      <main class="pantalla inicio">
        <div class="inicio-centro">
          ${logo('logo-inicio')}
          <p class="sobretitulo">Seguridad vial · Talento Humano</p>
          <h1 class="titulo-juego"><span class="l1">¿Quién quiere ser un</span> <span class="l2">conductor ejemplar?</span></h1>
          <div class="acciones">
            <button class="btn btn-primario" type="button" data-accion="jugar">${icono('play')} Jugar</button>
            <button class="btn btn-fantasma" type="button" data-accion="instrucciones">${icono('info')} Instrucciones</button>
          </div>
        </div>
        <p class="pie">¡Cada decisión cuenta, tanto en el juego como en la vía!</p>
      </main>`;
    $('[data-accion="jugar"]', pantallaEl).addEventListener('click', jugar);
    $('[data-accion="instrucciones"]', pantallaEl).addEventListener('click', () => { Sonido.clic(); abrirInstrucciones(); });
  }

  /* ======================== INSTRUCCIONES (ventana) ======================== */
  const PASOS = [
    ['Elige tu respuesta', 'Lee con atención cada pregunta y elige una de las tres opciones: A, B o C.'],
    ['Avanza por los niveles', 'Son 14 niveles. Cada pregunta es un nuevo reto: analiza la situación antes de responder.'],
    ['Sigue jugando', 'Si aciertas, superas el nivel y sumas 100 puntos. Si te equivocas, el juego continúa y te mostramos la decisión segura.'],
    ['Reflexiona y aprende', 'Al final verás tu resultado y una reflexión sobre autocuidado, emociones, concentración y decisiones responsables.'],
  ];
  const capa = $('#capaVentana');
  function cerrarInstrucciones() { capa.innerHTML = ''; document.removeEventListener('keydown', escInstr); }
  function escInstr(e) { if (e.key === 'Escape') cerrarInstrucciones(); }
  function abrirInstrucciones() {
    capa.innerHTML = `
      <div class="velo">
        <section class="ventana" role="dialog" aria-modal="true" aria-labelledby="t-instr" tabindex="-1">
          <button class="btn-icono ventana-cerrar" type="button" aria-label="Cerrar instrucciones">${icono('cerrar')}</button>
          <h2 id="t-instr">Cómo jugar</h2>
          <p class="ventana-lema">Pon a prueba tus conocimientos sobre seguridad vial, emociones, atención y toma de decisiones durante la conducción.</p>
          <ol class="pasos-instr">
            ${PASOS.map(([t, d], i) => `<li><span class="paso-num">${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join('')}
          </ol>
          <button class="btn btn-primario btn-ancho" type="button" data-accion="jugar">${icono('play')} Entendido, ¡a jugar!</button>
        </section>
      </div>`;
    const velo = $('.velo', capa), ventana = $('.ventana', capa);
    velo.addEventListener('click', cerrarInstrucciones);
    ventana.addEventListener('click', (e) => e.stopPropagation());
    $('.ventana-cerrar', capa).addEventListener('click', cerrarInstrucciones);
    $('[data-accion="jugar"]', capa).addEventListener('click', jugar);
    document.addEventListener('keydown', escInstr);
    ventana.focus();
  }

  /* =========================== INGRESO =========================== */
  function pintarIngreso() {
    pantallaEl.innerHTML = `
      <main class="pantalla centrada">
        <button class="btn-texto volver-arriba" type="button">${icono('atras')} Volver</button>
        <form class="tarjeta" autocomplete="off" novalidate>
          ${logo('logo-tarjeta')}
          <h1>¿Listo para el reto?</h1>
          <p class="tarjeta-sub">Escribe tu número de cédula para registrar tus respuestas.</p>
          <label class="campo">
            <span>Número de cédula</span>
            <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="15"
              placeholder="Ej. 1036123456" required aria-invalid="false" aria-describedby="err-ced">
          </label>
          <p class="msg-error" id="err-ced" role="alert"></p>
          <button class="btn btn-primario btn-ancho" type="submit" disabled>Comenzar ${icono('adelante')}</button>
        </form>
      </main>`;
    const form = $('form', pantallaEl), input = $('input', form), err = $('#err-ced'), btn = $('button[type="submit"]', form);
    let cargando = false;
    const actualizarBtn = () => { btn.disabled = input.value.length < 5 || cargando; };
    const ponerError = (t) => { err.textContent = t; input.setAttribute('aria-invalid', t ? 'true' : 'false'); };

    $('.volver-arriba', pantallaEl).addEventListener('click', () => { Sonido.clic(); ir('inicio'); });
    input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, ''); ponerError(''); actualizarBtn(); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (cargando) return;
      const ced = input.value.trim();
      if (ced.length < 5) { ponerError('Escribe tu número de cédula completo.'); Sonido.sonar('mal'); return; }
      cargando = true; actualizarBtn(); btn.textContent = 'Validando cédula…';
      const r = await enviar('ingresar', { documento: ced });
      cargando = false; btn.innerHTML = 'Comenzar ' + icono('adelante'); actualizarBtn();
      if (!r.ok) { ponerError(r.error || 'No pudimos validar tu cédula.'); Sonido.sonar('mal'); return; }
      Sonido.clic();
      estado.jugador = r.jugador;
      iniciarPartida();
    });
    setTimeout(() => input.focus(), 0);
  }

  /* =========================== PARTIDA =========================== */
  function jugar() {
    Sonido.clic();
    cerrarInstrucciones();
    if (estado.jugador) iniciarPartida(); else ir('ingreso');
  }

  async function iniciarPartida() {
    const r = await enviar('iniciar');
    if (!r.ok) {
      mostrarAviso(r.error || 'No se pudo iniciar el juego.');
      if (r.sesion === false) { estado.jugador = null; ir('ingreso'); }
      return;
    }
    estado.idx = Math.min(r.respondidas, TOTAL - 1);
    estado.marcas = r.marcas || [];
    estado.ultimaRes = null;
    if (r.retomada) mostrarAviso(`Retomamos tu juego en el nivel ${r.respondidas + 1}. ¡Sigue así!`);
    ir('juego');
  }

  /* =========================== JUEGO =========================== */
  const claseMarca = (i) => (i < estado.marcas.length ? estado.marcas[i] : i === estado.idx ? 'actual' : '');

  function pintarJuego() {
    const p = PREGUNTAS[estado.idx];
    const aciertos = estado.marcas.filter((m) => m === 'ok').length;
    estado.juego = { elegida: null, res: null };

    const escalera = PREGUNTAS.map((_, i) => i).reverse().map((i) => {
      const est = claseMarca(i);
      return `<li class="${est}"><span class="esc-num">${i + 1}</span><span class="esc-pts">${puntos((i + 1) * PUNTOS)}</span>`
        + `<span class="esc-marca">${est === 'ok' ? icono('check') : est === 'mal' ? icono('x') : ''}</span></li>`;
    }).join('');

    pantallaEl.innerHTML = `
      <main class="pantalla juego">
        <div class="tablero">
          <div class="progreso-movil" aria-hidden="true">
            <span>Nivel <b>${p.n}</b> de ${TOTAL}</span>
            <div class="segmentos">${PREGUNTAS.map((_, i) => `<i class="${claseMarca(i)}"></i>`).join('')}</div>
            <span class="pts">${puntos(aciertos * PUNTOS)} pts</span>
          </div>
          <div class="nivel-etiqueta">Pregunta ${p.n} de ${TOTAL}</div>
          <div class="hex hex-pregunta">
            <div class="hex-borde"><div class="hex-in"><p>${esc(p.texto)}</p></div></div>
          </div>
          <div class="opciones" role="group" aria-label="Opciones de respuesta">
            ${p.opciones.map((op, i) => `
              <button type="button" class="hex hex-opcion" data-letra="${esc(op.letra)}" style="animation-delay:${0.1 + i * 0.08}s"
                aria-label="Opción ${LETRAS[i]}: ${esc(op.texto)}">
                <div class="hex-borde"><div class="hex-in">
                  <span class="letra">${LETRAS[i]}</span><span class="txt">${esc(op.texto)}</span>
                </div></div>
              </button>`).join('')}
          </div>
          <div class="zona-feedback" aria-live="polite"></div>
        </div>
        <aside class="escalera" aria-label="Niveles"><ol>${escalera}</ol></aside>
      </main>`;

    pantallaEl.querySelectorAll('.hex-opcion').forEach((b) => b.addEventListener('click', () => elegir(b.dataset.letra)));
  }

  function pintarEstadoOpciones() {
    const { elegida, res } = estado.juego;
    pantallaEl.querySelectorAll('.hex-opcion').forEach((b) => {
      const letra = b.dataset.letra;
      let est = '';
      if (elegida) {
        if (!res) est = letra === elegida ? 'elegida' : 'apagada';
        else if (letra === res.correcta) est = 'correcta';
        else if (letra === elegida) est = 'incorrecta';
        else est = 'apagada';
      }
      b.className = 'hex hex-opcion ' + est;
      b.disabled = !!elegida;
      const hexIn = $('.hex-in', b);
      const previo = $('.ico-estado', hexIn);
      if (previo) previo.remove();
      if (est === 'correcta') hexIn.insertAdjacentHTML('beforeend', icono('check', 'ico-estado'));
      if (est === 'incorrecta') hexIn.insertAdjacentHTML('beforeend', icono('x', 'ico-estado'));
    });
  }

  async function elegir(letra) {
    const j = estado.juego;
    if (!j || j.elegida) return;
    const p = PREGUNTAS[estado.idx];
    Sonido.clic();
    j.elegida = letra;
    pintarEstadoOpciones();
    const zona = $('.zona-feedback', pantallaEl);
    zona.innerHTML = '<p class="esperando">Verificando respuesta…</p>';

    // El suspenso y la consulta al servidor corren al mismo tiempo.
    const [r] = await Promise.all([enviar('responder', { pregunta: p.n, opcion: letra }), esperar(SUSPENSO_MS)]);
    if (estado.juego !== j) return; // cambió de pantalla mientras esperaba
    if (!r.ok) {
      j.elegida = null;
      pintarEstadoOpciones();
      zona.innerHTML = '';
      mostrarAviso(r.error || 'No se pudo guardar tu respuesta. Intenta de nuevo.');
      if (r.sesion === false) { estado.jugador = null; ir('ingreso'); }
      return;
    }
    j.res = r;
    estado.marcas = [...estado.marcas, r.es_correcta ? 'ok' : 'mal'];
    estado.ultimaRes = r;
    pintarEstadoOpciones();
    actualizarProgreso();

    zona.innerHTML = `
      <div class="feedback ${r.es_correcta ? 'ok' : 'mal'}">
        <div class="fb-texto">
          <span class="fb-icono">${icono(r.es_correcta ? 'check' : 'x')}</span>
          <div>
            <b>${r.es_correcta ? `¡Correcto! Nivel ${p.n} superado` : `Nivel ${p.n} no superado`}</b>
            <p>${r.es_correcta ? `+${PUNTOS} puntos. ¡Excelente decisión!` : `La decisión segura era: <em>${esc(r.correcta_texto)}</em>`}</p>
          </div>
        </div>
        <button class="btn btn-primario" type="button">${r.ultima ? 'Ver mi resultado' : 'Siguiente pregunta'} ${icono('adelante')}</button>
      </div>`;
    const btn = $('.feedback .btn', zona);
    btn.addEventListener('click', siguiente);
    btn.focus({ preventScroll: true });
    Sonido.sonar(r.es_correcta ? 'ok' : 'mal');
  }

  /** Actualiza escalera, segmentos y puntos sin volver a pintar la pantalla. */
  function actualizarProgreso() {
    const aciertos = estado.marcas.filter((m) => m === 'ok').length;
    const filas = pantallaEl.querySelectorAll('.escalera li');
    filas.forEach((li, k) => {
      const i = TOTAL - 1 - k, est = claseMarca(i);
      li.className = est;
      $('.esc-marca', li).innerHTML = est === 'ok' ? icono('check') : est === 'mal' ? icono('x') : '';
    });
    pantallaEl.querySelectorAll('.segmentos i').forEach((s, i) => { s.className = claseMarca(i); });
    const pts = $('.progreso-movil .pts', pantallaEl);
    if (pts) pts.textContent = puntos(aciertos * PUNTOS) + ' pts';
  }

  function siguiente() {
    Sonido.clic();
    if (estado.ultimaRes && estado.ultimaRes.ultima) { ir('resultado'); Sonido.sonar('fin'); return; }
    estado.ultimaRes = null;
    estado.idx += 1;
    ir('juego');
  }

  // Teclado: A/B/C o 1/2/3 eligen
  document.addEventListener('keydown', (e) => {
    if (estado.pantalla !== 'juego' || !estado.juego || estado.juego.res) return;
    if (e.target.tagName === 'INPUT' || capa.firstChild) return;
    const i = ['1', '2', '3'].indexOf(e.key) >= 0 ? Number(e.key) - 1 : LETRAS.indexOf(String(e.key).toUpperCase());
    const op = PREGUNTAS[estado.idx].opciones[i];
    if (i >= 0 && op) elegir(op.letra);
  });

  /* =========================== RESULTADO =========================== */
  function pintarResultado() {
    const r = estado.ultimaRes.resumen;
    const R = 54, C = 2 * Math.PI * R;
    let titulo, msg;
    if (r.porcentaje >= 90) { titulo = '¡Eres un conductor ejemplar!'; msg = 'Excelente. Tus decisiones protegen vidas.'; }
    else if (r.porcentaje >= 70) { titulo = '¡Muy bien!'; msg = 'Vas por buen camino. Repasa las que fallaste.'; }
    else if (r.porcentaje >= 50) { titulo = 'Buen intento'; msg = 'Cada decisión cuenta: revisa lo aprendido.'; }
    else { titulo = 'Hoy aprendiste mucho'; msg = '¡La seguridad en la vía empieza por ti!'; }

    pantallaEl.innerHTML = `
      <main class="pantalla resultado">
        <div class="resultado-grid">
          <section class="tarjeta tarjeta-resultado" aria-label="Tu resultado">
            <p class="sobretitulo">Tu resultado · ${esc(estado.jugador ? estado.jugador.nombre : '')}</p>
            <div class="anillo" role="img" aria-label="${r.porcentaje}% de aciertos">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="${R}" class="anillo-fondo"></circle>
                <circle cx="60" cy="60" r="${R}" class="anillo-valor" stroke-dasharray="${C}" stroke-dashoffset="${C}"></circle>
              </svg>
              <div class="anillo-txt"><b>${String(r.porcentaje).replace('.', ',')}%</b><span>de aciertos</span></div>
            </div>
            <h1>${titulo}</h1>
            <p class="tarjeta-sub">${msg}</p>
            <dl class="stats">
              <div><dt>Correctas</dt><dd class="ok">${r.correctas}</dd></div>
              <div><dt>Incorrectas</dt><dd class="mal">${r.incorrectas}</dd></div>
              <div><dt>Puntos</dt><dd>${puntos(r.puntaje)}<small>/${puntos(r.puntaje_max)}</small></dd></div>
            </dl>
          </section>
          <section class="reflexion" aria-label="Reflexión final">
            ${logo('logo-reflexion')}
            <h2>Más que un juego, es transformar decisiones.</h2>
            <p>Cada recorrido es una nueva oportunidad para tomar mejores decisiones. Conducir no solo requiere habilidad y conocimiento, sino también <b>atención, paciencia, autocontrol y compromiso</b>.</p>
            <p>Tus decisiones en la vía pueden marcar la diferencia entre llegar seguro o poner una vida en riesgo.</p>
            <p class="lema-final">¡En la vía, cada decisión cuenta!</p>
            <div class="acciones">
              <button class="btn btn-primario" type="button" data-accion="otra">${icono('repetir')} Jugar de nuevo</button>
              <button class="btn btn-fantasma" type="button" data-accion="inicio">${icono('inicio')} Ir al inicio</button>
            </div>
          </section>
        </div>
      </main>`;
    const valor = $('.anillo-valor', pantallaEl);
    setTimeout(() => valor.setAttribute('stroke-dashoffset', C * (1 - r.porcentaje / 100)), 150);
    $('[data-accion="otra"]', pantallaEl).addEventListener('click', jugar);
    $('[data-accion="inicio"]', pantallaEl).addEventListener('click', () => { Sonido.clic(); ir('inicio'); });
  }

  /* =========================== ARRANQUE =========================== */
  pintarSonido();
  Sonido.instalar();
  ir('inicio');
})();
