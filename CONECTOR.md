# Conector con la base de datos del juego anterior

Guía para el área de sistemas. Explica cómo la página nueva se conecta con la base de datos
que ya usa el juego anterior (`talentohumano.cootrasana.com.co/juego_vial/index.php`),
para validar las cédulas, traer el nombre del empleado y guardar las respuestas.

**Estado actual: el conector está listo pero APAGADO.** La página guarda las respuestas en el
navegador de cada persona hasta que se active.

> El conector se escribió leyendo el código de la página anterior. **No se ha probado contra el
> servidor real** porque no hay autorización todavía. Antes de usarlo con empleados, hagan una
> prueba con una cédula de prueba.

## Cómo funciona

La página nueva no entra directo a la base de datos. Usa el mismo programa del servidor
(`index.php`) que usaba la página anterior, con las mismas acciones. Así la base de datos,
las tablas y los reportes que ya existen siguen igual.

Todas las consultas son formularios `POST` a `index.php` con estos campos:

| Acción | Campos que envía | Lo que espera recibir (JSON) |
|---|---|---|
| `ingresar` | `documento` (cédula, solo números) | `{ ok, jugador: { nombre, ... }, error }` |
| `iniciar` | — | `{ ok, respondidas, correctas, incorrectas, retomada, sesion, error }` |
| `responder` | `pregunta` (1 a 14), `opcion` (`a`, `b` o `c`) | `{ ok, pregunta, es_correcta, ultima, correcta_texto, resumen, sesion, error }` |
| `salir` | — | `{ ok }` |

`resumen` = `{ realizadas, correctas, incorrectas, puntaje, puntaje_max, porcentaje }`.

Además, cada consulta lleva:
- `accion`: el nombre de la acción.
- `csrf`: la ficha de seguridad. El conector la toma del HTML de `index.php`
  (la línea `const CFG = {"csrf":"..."}`), igual que la página anterior.
- La galleta (cookie) de sesión que crea el servidor.

Las 14 preguntas y las letras de las opciones son las mismas de la página anterior
(`src/data/preguntas.js`), así que el servidor las reconoce y decide si la respuesta es correcta.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `src/lib/conector-servidor.js` | El conector: habla con `index.php`. |
| `src/lib/almacen.js` | Guardado en el navegador (modo actual). |
| `src/lib/datos.js` | El interruptor: elige uno de los dos. |
| `.env.ejemplo` | Ejemplo de configuración. |
| `netlify.toml` | Publicación en Netlify y reenvío (apagado). |

## Por qué hace falta "la misma dirección"

La sesión del jugador viaja en una galleta del servidor. El navegador solo la envía si la
página y el servidor tienen la misma dirección. Hay dos formas de lograrlo:

### Opción A (recomendada): instalar la página en el mismo servidor

1. En el computador: copiar `.env.ejemplo` como `.env` y poner `VITE_MODO_DATOS=servidor`.
2. Ejecutar `npm install` y `npm run build`.
3. Subir el contenido de la carpeta `dist/` al servidor, por ejemplo a `juego_vial/nuevo/`.
   Si queda en otra carpeta, ajustar `VITE_URL_SERVIDOR` (por ejemplo `../index.php`).
4. `index.php` sigue funcionando como siempre; la página nueva solo le habla.

### Opción B: reenvío desde Netlify

1. En `netlify.toml`, quitar el `#` del bloque `[[redirects]]`.
2. Cambiar `VITE_MODO_DATOS = "servidor"`.
3. Subir el cambio a GitHub; Netlify publica solo.

Con esto, las consultas a `https://juego-vial-cootrasana.netlify.app/juego_vial/index.php`
pasan por Netlify hasta el servidor real. Tengan en cuenta que la consulta de cédulas
quedaría disponible también desde esa dirección.

### Probar en el computador

En `.env`: `VITE_MODO_DATOS=servidor` y `SERVIDOR_JUEGO_ANTERIOR=https://talentohumano.cootrasana.com.co`.
Luego `npm run dev`.

## Sacar los datos (cédulas y resultados)

Con el conector activo, todo queda en la base de datos del juego anterior. Los reportes
(quién jugó, aciertos, porcentaje) se sacan desde esa base de datos, como hasta ahora.

## Si el servidor responde distinto

Si `index.php` cambia los nombres de los campos o la forma de entregar la ficha de seguridad,
solo hay que ajustar `src/lib/conector-servidor.js`. El resto de la página no cambia.
