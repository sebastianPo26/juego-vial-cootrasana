<?php
// Acciones del juego. Se llaman por POST a index.php con el campo "accion"
// y la ficha de seguridad "csrf" (mismo esquema del juego anterior):
//   ingresar (documento) · iniciar · responder (pregunta, opcion) · salir
// Siempre responde JSON.
defined('JV_APP') || exit;

function jv_json(array $datos): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function jv_api(array $cfg, array $preguntas): void
{
    if (!hash_equals($_SESSION['csrf'] ?? '', (string) ($_POST['csrf'] ?? ''))) {
        jv_json(['ok' => false, 'error' => 'Tu sesión venció. Recarga la página e intenta de nuevo.']);
    }

    try {
        $almacen = new Almacen($cfg, $preguntas);
    } catch (Throwable $e) {
        error_log('[juego_vial] Base de datos: ' . $e->getMessage());
        jv_json(['ok' => false, 'error' => 'No pudimos conectar con la base de datos. Intenta más tarde.']);
    }

    $accion = (string) ($_POST['accion'] ?? '');
    $total = count($preguntas);

    try {
        switch ($accion) {

            case 'ingresar':
                $doc = preg_replace('/\D/', '', (string) ($_POST['documento'] ?? ''));
                if (strlen($doc) < 5 || strlen($doc) > 15) {
                    jv_json(['ok' => false, 'error' => 'Escribe tu número de cédula completo.']);
                }
                $jugador = $almacen->buscarEmpleado($doc);
                if (!$jugador) {
                    jv_json(['ok' => false, 'error' => $cfg['msg_no_registrado']]);
                }
                session_regenerate_id(true);
                $_SESSION['jugador'] = $jugador;
                unset($_SESSION['partida_id']);
                jv_json(['ok' => true, 'jugador' => $jugador]);

            case 'iniciar':
                $jugador = $_SESSION['jugador'] ?? null;
                if (!$jugador) {
                    jv_json(['ok' => false, 'sesion' => false, 'error' => 'Ingresa tu cédula para jugar.']);
                }
                $p = $almacen->partidaActiva($jugador);
                $_SESSION['partida_id'] = (int) $p['id'];
                $resp = $almacen->respuestas((int) $p['id']);
                $marcas = array_values(array_map(fn ($r) => $r['es_correcta'] ? 'ok' : 'mal', $resp));
                $resumen = $almacen->resumen($resp);
                jv_json([
                    'ok'          => true,
                    'retomada'    => count($resp) > 0,
                    'respondidas' => count($resp),
                    'correctas'   => $resumen['correctas'],
                    'incorrectas' => $resumen['incorrectas'],
                    'marcas'      => $marcas,
                ]);

            case 'responder':
                $jugador = $_SESSION['jugador'] ?? null;
                $pid = $_SESSION['partida_id'] ?? null;
                if (!$jugador || !$pid) {
                    jv_json(['ok' => false, 'sesion' => false, 'error' => 'Tu sesión terminó. Ingresa de nuevo.']);
                }
                $partida = $almacen->partida((int) $pid);
                if (!$partida || (int) $partida['finalizada'] === 1) {
                    jv_json(['ok' => false, 'error' => 'Esta partida ya terminó. Vuelve a empezar.']);
                }
                $n = (int) ($_POST['pregunta'] ?? 0);
                $letra = strtolower((string) ($_POST['opcion'] ?? ''));
                $preg = null;
                foreach ($preguntas as $q) {
                    if ($q['n'] === $n) { $preg = $q; break; }
                }
                if (!$preg || !in_array($letra, array_column($preg['opciones'], 'letra'), true)) {
                    jv_json(['ok' => false, 'error' => 'Respuesta no válida.']);
                }
                $resp = $almacen->respuestas((int) $pid);
                // Las preguntas se responden en orden; una pregunta ya respondida no cambia.
                if (!isset($resp[$n])) {
                    if ($n !== count($resp) + 1) {
                        jv_json(['ok' => false, 'error' => 'Esa pregunta no es la que sigue. Recarga la página.']);
                    }
                    $almacen->guardarRespuesta((int) $pid, $n, $letra, $letra === $preg['correcta']);
                    $resp = $almacen->respuestas((int) $pid);
                }
                $esCorrecta = $resp[$n]['es_correcta'];
                $ultima = $n === $total;
                if ($ultima) {
                    $almacen->finalizar((int) $pid);
                }
                $textoCorrecta = '';
                foreach ($preg['opciones'] as $op) {
                    if ($op['letra'] === $preg['correcta']) { $textoCorrecta = $op['texto']; }
                }
                jv_json([
                    'ok'             => true,
                    'pregunta'       => $n,
                    'es_correcta'    => $esCorrecta,
                    'ultima'         => $ultima,
                    'correcta'       => $preg['correcta'],  // solo se revela después de responder
                    'correcta_texto' => $textoCorrecta,
                    'resumen'        => $almacen->resumen($resp),
                ]);

            case 'salir':
                unset($_SESSION['jugador'], $_SESSION['partida_id']);
                jv_json(['ok' => true]);

            default:
                jv_json(['ok' => false, 'error' => 'Acción no válida.']);
        }
    } catch (Throwable $e) {
        error_log('[juego_vial] ' . $accion . ': ' . $e->getMessage());
        jv_json(['ok' => false, 'error' => 'Ocurrió un error en el servidor. Intenta de nuevo.']);
    }
}
