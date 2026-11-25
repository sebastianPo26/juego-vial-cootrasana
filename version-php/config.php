<?php
// =====================================================================
//  Configuración del juego "¿Quién quiere ser un conductor ejemplar?"
// =====================================================================
defined('JV_APP') || exit;

return [

    // ---------------------------------------------------------------
    // Base de datos donde se guardan partidas y respuestas.
    //
    // Por defecto usa un archivo SQLite en la carpeta datos/ (no necesita
    // instalar nada). Para usar la base de datos MySQL de la empresa,
    // cambia 'dsn', 'usuario' y 'clave', y crea las tablas con
    // sql/esquema-mysql.sql.
    //
    // Ejemplo MySQL:
    //   'dsn'     => 'mysql:host=localhost;dbname=talento_humano;charset=utf8mb4',
    //   'usuario' => 'usuario_bd',
    //   'clave'   => 'clave_bd',
    // ---------------------------------------------------------------
    'bd' => [
        'dsn'     => 'sqlite:' . __DIR__ . '/datos/juego.sqlite',
        'usuario' => null,
        'clave'   => null,
    ],

    // ---------------------------------------------------------------
    // Validación de cédulas contra la tabla de empleados.
    //
    // null  -> cualquier cédula puede jugar (se muestra "C.C. 1.234.567").
    // Para exigir que la cédula exista y mostrar el nombre del empleado,
    // indica la tabla y las columnas de la base de datos de la empresa:
    //
    //   'empleados' => [
    //       'tabla'         => 'empleados',
    //       'col_documento' => 'documento',
    //       'col_nombre'    => 'nombre',
    //   ],
    // ---------------------------------------------------------------
    'empleados' => null,

    // Mensaje cuando la cédula no está en la tabla de empleados.
    'msg_no_registrado' => 'Esta cédula no está registrada. Comunícate con Talento Humano.',
];
