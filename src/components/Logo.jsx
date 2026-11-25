// Logosímbolo oficial Cootrasana, extraído en vectores del Manual de Identidad (MA001 v03, pág. 2).
// Esta versión lleva el fondo del óvalo y el interior de las alas en blanco, y el contorno blanco
// que pide el manual (pág. 4) para disponerlo sobre fondos de color. Sobre blanco se ve igual al original.
// En src/assets/brand/ también está el original sin contorno (PNG y SVG).
import logoUrl from '../assets/brand/logo-cootrasana.png';

export default function Logo({ className = '' }) {
  return (
    <div className={'logo ' + className}>
      <img src={logoUrl} alt="Cootrasana · Cooperativa de Transportadores San Antonio" />
    </div>
  );
}
