<?php
// =====================================================================
//  ¿Quién quiere ser un conductor ejemplar? · Cootrasana
//  Versión PHP: el servidor guarda partidas y decide si cada respuesta
//  es correcta; el navegador solo muestra el juego (assets/js/juego.js).
//  Requiere PHP 7.4 o superior con PDO (SQLite o MySQL).
// =====================================================================
define('JV_APP', true);
date_default_timezone_set('America/Bogota');

$cfg = require __DIR__ . '/config.php';
$preguntas = require __DIR__ . '/lib/preguntas.php';
require __DIR__ . '/lib/almacen.php';
require __DIR__ . '/lib/api.php';

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => dirname($_SERVER['SCRIPT_NAME']) === '/' ? '/' : rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/',
    'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_name('JUEGOVIAL');
session_start();
if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

// Acciones del juego (POST) -> responden JSON
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    jv_api($cfg, $preguntas);
}

// Datos que necesita el navegador. Las respuestas correctas NO se envían.
$preguntasPublicas = array_map(function ($p) {
    return ['n' => $p['n'], 'texto' => $p['texto'], 'opciones' => $p['opciones']];
}, $preguntas);

$CFG = [
    'csrf'      => $_SESSION['csrf'],
    'url'       => 'index.php',
    'jugador'   => $_SESSION['jugador'] ?? null,
    'preguntas' => $preguntasPublicas,
    'puntos'    => PUNTOS_POR_ACIERTO,
];

// Versión de los archivos (evita que el navegador use copias viejas)
$v = function (string $ruta): string {
    return $ruta . '?v=' . @filemtime(__DIR__ . '/' . $ruta);
};

header('Content-Type: text/html; charset=utf-8');
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#00664F">
<title>¿Quién quiere ser un conductor ejemplar? · Cootrasana</title>
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
<link rel="preload" as="image" href="assets/img/logo-cootrasana.png">
<link rel="stylesheet" href="<?= htmlspecialchars($v('assets/css/estilos.css')) ?>">
</head>
<body>

<div class="escenario" aria-hidden="true"><i class="foco"></i><i class="anillos"></i></div>
<img class="placa-esquina" id="placaEsquina" src="assets/img/seguridad-vial.png" alt="Seguridad Vial">

<header class="barra-sup">
    <div id="barraIzq"><span></span></div>
    <div class="barra-der">
        <span class="chip-jugador" id="chipJugador" hidden></span>
        <button class="btn-icono" type="button" id="btnSonido"></button>
        <button class="btn-icono" type="button" id="btnSalir" aria-label="Salir" title="Salir" hidden></button>
    </div>
</header>

<div id="pantalla"></div>
<div id="capaVentana"></div>
<div class="aviso" id="aviso" role="status"></div>

<script>window.JV_CFG = <?= json_encode($CFG, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>;</script>
<script src="<?= htmlspecialchars($v('assets/js/juego.js')) ?>"></script>
</body>
</html>
