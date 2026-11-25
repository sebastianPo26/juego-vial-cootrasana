<?php
// Guardado de partidas y respuestas en la base de datos (SQLite o MySQL, por PDO).
defined('JV_APP') || exit;

final class Almacen
{
    private PDO $bd;
    private array $cfg;
    private array $preguntas;

    public function __construct(array $cfg, array $preguntas)
    {
        $this->cfg = $cfg;
        $this->preguntas = $preguntas;
        $this->bd = new PDO($cfg['bd']['dsn'], $cfg['bd']['usuario'], $cfg['bd']['clave'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        if ($this->bd->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
            $this->crearTablasSqlite();
        }
    }

    /** En SQLite las tablas se crean solas. En MySQL se crean con sql/esquema-mysql.sql. */
    private function crearTablasSqlite(): void
    {
        $this->bd->exec('CREATE TABLE IF NOT EXISTS jv_partidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            documento TEXT NOT NULL,
            nombre TEXT,
            inicio TEXT NOT NULL,
            fin TEXT,
            finalizada INTEGER NOT NULL DEFAULT 0
        )');
        $this->bd->exec('CREATE TABLE IF NOT EXISTS jv_respuestas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            partida_id INTEGER NOT NULL,
            pregunta INTEGER NOT NULL,
            opcion TEXT NOT NULL,
            es_correcta INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            UNIQUE (partida_id, pregunta)
        )');
        $this->bd->exec('CREATE INDEX IF NOT EXISTS jv_partidas_doc ON jv_partidas (documento, finalizada)');
    }

    private static function ahora(): string
    {
        return date('Y-m-d H:i:s');
    }

    /** Busca al empleado. Devuelve ['documento','nombre'] o null si no está registrado. */
    public function buscarEmpleado(string $documento): ?array
    {
        $e = $this->cfg['empleados'];
        if (!$e) {
            return ['documento' => $documento, 'nombre' => 'C.C. ' . number_format((float) $documento, 0, ',', '.')];
        }
        $ident = '/^[A-Za-z0-9_]+$/';
        foreach (['tabla', 'col_documento', 'col_nombre'] as $k) {
            if (!preg_match($ident, $e[$k])) {
                throw new RuntimeException('Configuración de empleados inválida: ' . $k);
            }
        }
        $st = $this->bd->prepare("SELECT {$e['col_nombre']} AS nombre FROM {$e['tabla']} WHERE {$e['col_documento']} = ? LIMIT 1");
        $st->execute([$documento]);
        $fila = $st->fetch();
        return $fila ? ['documento' => $documento, 'nombre' => trim((string) $fila['nombre'])] : null;
    }

    /** Partida sin terminar de la cédula, o una nueva. */
    public function partidaActiva(array $jugador): array
    {
        $st = $this->bd->prepare('SELECT * FROM jv_partidas WHERE documento = ? AND finalizada = 0 ORDER BY id DESC LIMIT 1');
        $st->execute([$jugador['documento']]);
        $p = $st->fetch();
        if ($p) {
            return $p;
        }
        $st = $this->bd->prepare('INSERT INTO jv_partidas (documento, nombre, inicio, finalizada) VALUES (?, ?, ?, 0)');
        $st->execute([$jugador['documento'], $jugador['nombre'], self::ahora()]);
        return $this->partida((int) $this->bd->lastInsertId());
    }

    public function partida(int $id): ?array
    {
        $st = $this->bd->prepare('SELECT * FROM jv_partidas WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    /** Respuestas de la partida, en orden de pregunta: [n => ['opcion','es_correcta']]. */
    public function respuestas(int $partidaId): array
    {
        $st = $this->bd->prepare('SELECT pregunta, opcion, es_correcta FROM jv_respuestas WHERE partida_id = ? ORDER BY pregunta');
        $st->execute([$partidaId]);
        $r = [];
        foreach ($st->fetchAll() as $f) {
            $r[(int) $f['pregunta']] = ['opcion' => $f['opcion'], 'es_correcta' => (bool) $f['es_correcta']];
        }
        return $r;
    }

    public function guardarRespuesta(int $partidaId, int $n, string $opcion, bool $correcta): void
    {
        $st = $this->bd->prepare('INSERT INTO jv_respuestas (partida_id, pregunta, opcion, es_correcta, fecha) VALUES (?, ?, ?, ?, ?)');
        $st->execute([$partidaId, $n, $opcion, $correcta ? 1 : 0, self::ahora()]);
    }

    public function finalizar(int $partidaId): void
    {
        $st = $this->bd->prepare('UPDATE jv_partidas SET finalizada = 1, fin = ? WHERE id = ?');
        $st->execute([self::ahora(), $partidaId]);
    }

    public function resumen(array $respuestas): array
    {
        $total = count($this->preguntas);
        $realizadas = count($respuestas);
        $correctas = count(array_filter($respuestas, fn ($r) => $r['es_correcta']));
        return [
            'realizadas'  => $realizadas,
            'correctas'   => $correctas,
            'incorrectas' => $realizadas - $correctas,
            'puntaje'     => $correctas * PUNTOS_POR_ACIERTO,
            'puntaje_max' => $total * PUNTOS_POR_ACIERTO,
            'porcentaje'  => $realizadas ? round($correctas / $realizadas * 100, 1) : 0,
        ];
    }
}
