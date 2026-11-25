-- Tablas del juego "¿Quién quiere ser un conductor ejemplar?" para MySQL / MariaDB.
-- Ejecutar una sola vez en la base de datos configurada en config.php.

CREATE TABLE IF NOT EXISTS jv_partidas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    documento VARCHAR(15) NOT NULL,
    nombre VARCHAR(150) NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME NULL,
    finalizada TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY jv_partidas_doc (documento, finalizada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jv_respuestas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    partida_id INT UNSIGNED NOT NULL,
    pregunta TINYINT UNSIGNED NOT NULL,
    opcion CHAR(1) NOT NULL,
    es_correcta TINYINT(1) NOT NULL,
    fecha DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY jv_resp_unica (partida_id, pregunta),
    CONSTRAINT jv_resp_partida FOREIGN KEY (partida_id) REFERENCES jv_partidas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reporte: resultado de cada partida terminada
-- SELECT p.documento, p.nombre, p.inicio, p.fin,
--        SUM(r.es_correcta) AS correctas, COUNT(r.id) AS respondidas,
--        ROUND(SUM(r.es_correcta) / COUNT(r.id) * 100, 1) AS porcentaje
-- FROM jv_partidas p JOIN jv_respuestas r ON r.partida_id = p.id
-- WHERE p.finalizada = 1
-- GROUP BY p.id ORDER BY p.fin DESC;
