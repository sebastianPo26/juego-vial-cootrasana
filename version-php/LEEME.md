# ¿Quién quiere ser un conductor ejemplar? · Cootrasana (versión PHP)

Es el mismo juego de la versión en React, pantalla por pantalla, hecho en **PHP** para
instalarlo en el servidor de la empresa, junto a la base de datos.

- **PHP (servidor):** muestra la página, valida la cédula, guarda las partidas y las
  respuestas, y decide si cada respuesta es correcta. Las respuestas correctas **no se
  envían al navegador**.
- **JavaScript sin librerías (navegador):** animaciones, suspenso, sonidos y paso entre pantallas.

## Requisitos

- PHP 7.4 o superior, con PDO (SQLite o MySQL).
- Servidor Apache (los archivos `.htaccess` protegen las carpetas privadas).
  En otro servidor (por ejemplo Nginx), bloquear a mano `config.php`, `lib/`, `datos/` y `sql/`.

## Instalar

1. Copiar toda la carpeta al servidor, por ejemplo en `juego_vial_nuevo/`.
2. Dar permiso de escritura a la carpeta `datos/` (ahí se crea `juego.sqlite`).
3. Abrir la dirección en el navegador. Listo: las tablas se crean solas.

### Usar la base de datos MySQL de la empresa

1. Ejecutar `sql/esquema-mysql.sql` en la base de datos (crea `jv_partidas` y `jv_respuestas`).
2. En `config.php`, cambiar `dsn`, `usuario` y `clave` (hay un ejemplo en el archivo).

### Validar las cédulas con la tabla de empleados

En `config.php`, llenar `empleados` con el nombre de la tabla y sus columnas.
Así solo juegan cédulas registradas y en pantalla aparece el nombre del empleado.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.php` | La página y las acciones del juego (ingresar, iniciar, responder, salir). |
| `config.php` | Base de datos y validación de empleados. |
| `lib/preguntas.php` | Las 14 preguntas y sus respuestas correctas. |
| `lib/almacen.php` | Guardar y leer partidas y respuestas. |
| `lib/api.php` | Reglas del juego en el servidor. |
| `assets/` | Estilos, JavaScript, logos, letras y música. |
| `sql/esquema-mysql.sql` | Tablas para MySQL y una consulta de reporte. |

## Reglas que cuida el servidor

- Cada consulta lleva una ficha de seguridad de la sesión.
- Las preguntas se responden en orden y una respuesta guardada no se puede cambiar.
- Si la persona sale, al volver a entrar con su cédula retoma donde iba.
- Al responder la pregunta 14 la partida queda terminada; "Jugar de nuevo" abre una partida nueva.

## Reporte de resultados

En `sql/esquema-mysql.sql` hay una consulta de ejemplo con cédula, nombre, fecha,
correctas y porcentaje de cada partida terminada.

## Probar en un computador

Con PHP instalado, dentro de esta carpeta: `php -S localhost:8080` y abrir http://localhost:8080
