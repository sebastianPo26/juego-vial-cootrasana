// Íconos de línea (estilo minimalista, 24x24).
const RUTAS = {
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.1" /></>,
  atras: <path d="M15 5l-7 7 7 7" />,
  adelante: <path d="M9 5l7 7-7 7" />,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M7 7l10 10M17 7L7 17" />,
  sonido: <><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>,
  mudo: <><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" /><path d="M16 9l6 6M22 9l-6 6" /></>,
  salir: <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 16l-4-4 4-4M6 12h10" /></>,
  repetir: <><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 20v-5h5" /></>,
  inicio: <><path d="M4 11l8-7 8 7" /><path d="M6 9.5V20h12V9.5" /></>,
  usuario: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
};

export default function Icono({ nombre, className = '' }) {
  return (
    <svg className={'ico ' + className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {RUTAS[nombre]}
    </svg>
  );
}
