# ¿Quién quiere ser un conductor ejemplar? · Cootrasana

Juego de seguridad vial en React (Vite) con las preguntas del juego de Talento Humano,
rediseñado al estilo de un programa de concurso, minimalista y con la identidad
corporativa de Cootrasana (Manual MA001 v03).

Flujo: Inicio (Jugar / Instrucciones en ventana) → Cédula → 14 preguntas → Resultado y reflexión.
Al responder, la opción se pone en amarillo (suspenso) y luego se revela en verde (correcta) o rojo
(incorrecta), mostrando siempre la decisión segura. Teclado: A/B/C o 1/2/3 para responder, Enter para seguir.

## Ejecutar

```bash
npm install
npm run dev       # desarrollo: http://localhost:5173
npm run build     # genera la carpeta dist/ lista para publicar
```

`dist/` se puede subir a cualquier ruta del servidor (por ejemplo `/juego_vial/`).

## Identidad corporativa

| Elemento | Dónde |
|---|---|
| Colores (verde Pantone 354 `#00A651`, verde oscuro `#00664F`, negro `#231F20`, blanco) | `src/index.css` (`:root`) |
| Tipografía Swis721 (Black BT Italic, Hv BT, Hv BT Italic, Lt BT) | `index.html` (`@font-face`) + archivos en `public/fonts/` |
| Logosímbolo | `src/assets/brand/` (extraído en vectores del manual, pág. 2) |

### Logo y fuentes

1. **Logo:** el logosímbolo oficial se extrajo del manual. `logo-cootrasana.png` es la versión con fondo blanco
   y contorno blanco para fondos de color (manual, pág. 4); `logo-cootrasana-original.*` es el original sin contorno.
2. **Fuentes:** ya están incluidas en `public/fonts/` (de `swias.rar`): Swis721 Hv BT, Lt BT y Lt BT Italic.
   Ese paquete no trae **Swis721 Black BT Italic** ni **Hv BT Italic**; por ahora se usa la Heavy con
   inclinación automática. Si consiguen el archivo Black Italic, cópienlo como `public/fonts/Swis721BlkItBT.ttf`
   y cambien la url de la primera regla `@font-face` en `index.html`.

## Preguntas y respuestas

`src/data/preguntas.js` tiene las 14 preguntas y las opciones del juego original, palabra por palabra.
El campo `correcta` indica la opción correcta de cada pregunta.

## Registro de respuestas

El original guarda las respuestas por cédula en su servidor. Esta versión las guarda en el navegador
(`localStorage`): permite retomar una partida y conserva el historial de partidas terminadas en ese equipo.
Para enviarlas a un servidor o base de datos, cambia las funciones de `src/lib/almacen.js`
(`ingresar`, `iniciar`, `responder`) por llamadas a tu API. El resto del juego no se toca.
