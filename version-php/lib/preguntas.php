<?php
// Preguntas del juego "¿Quién quiere ser un conductor ejemplar?".
// Textos iguales al juego original. "correcta" = letra de la opción correcta.
// Este archivo NO se envía al navegador: las respuestas correctas quedan en el servidor.
// Los colores no indican la respuesta correcta.

defined('JV_APP') || exit;

const PUNTOS_POR_ACIERTO = 100;

return [
    [
        'n' => 1,
        'texto' => 'Dormiste poco y sientes sueño, pero aún tienes varios viajes pendientes. ¿Qué haces?',
        'correcta' => 'c',
        'opciones' => [
            ['letra' => 'a', 'color' => 'rojo', 'texto' => 'Continúas porque tienes experiencia.'],
            ['letra' => 'b', 'color' => 'amarillo', 'texto' => 'Tomas café para reducir el sueño y continuar conduciendo.'],
            ['letra' => 'c', 'color' => 'verde', 'texto' => 'Informas la situación y sigues el procedimiento de seguridad antes de continuar.'],
        ],
    ],
    [
        'n' => 2,
        'texto' => 'Tuviste una discusión de pareja y sigues pensando en ella mientras conduces. ¿Qué debes hacer?',
        'correcta' => 'a',
        'opciones' => [
            ['letra' => 'a', 'color' => 'verde', 'texto' => 'Reconocer la emoción, mantener la calma y conducir de forma segura.'],
            ['letra' => 'b', 'color' => 'amarillo', 'texto' => 'Llamar a tu pareja mientras conduces para resolver la discusión.'],
            ['letra' => 'c', 'color' => 'rojo', 'texto' => 'Ignorar la situación emocional y continuar conduciendo.'],
        ],
    ],
    [
        'n' => 3,
        'texto' => 'Un pasajero te insulta mientras conduces. ¿Cómo reaccionas?',
        'correcta' => 'b',
        'opciones' => [
            ['letra' => 'a', 'color' => 'rojo', 'texto' => 'Responder a las ofensas y discutir con el pasajero.'],
            ['letra' => 'b', 'color' => 'amarillo', 'texto' => 'Mantener la calma, evitar confrontaciones y conducir con seguridad.'],
            ['letra' => 'c', 'color' => 'verde', 'texto' => 'Acelerar el recorrido para descargar mi rabia y terminar más rápido.'],
        ],
    ],
    [
        'n' => 4,
        'texto' => 'Recibes un mensaje urgente mientras conduces. ¿Qué haces?',
        'correcta' => 'c',
        'opciones' => [
            ['letra' => 'a', 'color' => 'amarillo', 'texto' => 'Leerlo rápidamente mientras esperas el cambio del semáforo.'],
            ['letra' => 'b', 'color' => 'verde', 'texto' => 'Escucharlo y responder por voz mientras conduces.'],
            ['letra' => 'c', 'color' => 'rojo', 'texto' => 'Detenerte en un lugar seguro antes de revisarlo.'],
        ],
    ],
    [
        'n' => 5,
        'texto' => 'Al parquear en un espacio reducido, ¿qué debes priorizar para evitar una colisión?',
        'correcta' => 'b',
        'opciones' => [
            ['letra' => 'a', 'color' => 'amarillo', 'texto' => 'Acelerar para terminar la maniobra rápidamente.'],
            ['letra' => 'b', 'color' => 'verde', 'texto' => 'Calcular bien el espacio y maniobrar con precaución.'],
            ['letra' => 'c', 'color' => 'rojo', 'texto' => 'Confiar en tu percepción del espacio sin verificar los espejos.'],
        ],
    ],
    [
        'n' => 6,
        'texto' => 'Vas retrasado y necesitas recuperar tiempo. ¿Cuál es la decisión más segura?',
        'correcta' => 'a',
        'opciones' => [
            ['letra' => 'a', 'color' => 'amarillo', 'texto' => 'Mantener una conducción segura, aunque esto implique llegar más tarde.'],
            ['letra' => 'b', 'color' => 'rojo', 'texto' => 'Aumentar la velocidad en los tramos despejados.'],
            ['letra' => 'c', 'color' => 'verde', 'texto' => 'Omitir paradas a los pasajeros para recuperar tiempo durante el recorrido.'],
        ],
    ],
    [
        'n' => 7,
        'texto' => 'Al cambiar de carril, ¿qué debes hacer antes de iniciar la maniobra?',
        'correcta' => 'a',
        'opciones' => [
            ['letra' => 'a', 'color' => 'rojo', 'texto' => 'Revisar los espejos, señalizar y verificar que haya espacio suficiente.'],
            ['letra' => 'b', 'color' => 'verde', 'texto' => 'Acelerar para incorporarte antes de que otro vehículo se acerque.'],
            ['letra' => 'c', 'color' => 'amarillo', 'texto' => 'Iniciar el cambio de carril si el vehículo de atrás parece estar lejos.'],
        ],
    ],
    [
        'n' => 8,
        'texto' => 'Si tienes una urgencia económica y necesitas un préstamo, ¿qué opción eliges?',
        'correcta' => 'b',
        'opciones' => [
            ['letra' => 'a', 'color' => 'amarillo', 'texto' => 'Vender o empeñar sus pertenencias, sin evaluar las consecuencias.'],
            ['letra' => 'b', 'color' => 'verde', 'texto' => 'Evaluar y solicitar las opciones de crédito que ofrece el fondo de empleados o la empresa.'],
            ['letra' => 'c', 'color' => 'rojo', 'texto' => 'Pedir dinero prestado a particulares sin verificar las condiciones.'],
        ],
    ],
    [
        'n' => 9,
        'texto' => 'Si sientes estrés por las exigencias de tu jornada, ¿cómo debes actuar?',
        'correcta' => 'c',
        'opciones' => [
            ['letra' => 'a', 'color' => 'rojo', 'texto' => 'Acelerar para terminar el recorrido más rápido.'],
            ['letra' => 'b', 'color' => 'amarillo', 'texto' => 'Ignorar el estrés y continuar como si nada.'],
            ['letra' => 'c', 'color' => 'verde', 'texto' => 'Mantener la calma, controlar tus impulsos y priorizar la seguridad vial.'],
        ],
    ],
    [
        'n' => 10,
        'texto' => 'Si el vehículo de adelante frena de repente, ¿qué te ayuda a evitar una colisión?',
        'correcta' => 'a',
        'opciones' => [
            ['letra' => 'a', 'color' => 'verde', 'texto' => 'Mantener una distancia segura.'],
            ['letra' => 'b', 'color' => 'rojo', 'texto' => 'Aumentar la velocidad para cambiar de carril.'],
            ['letra' => 'c', 'color' => 'amarillo', 'texto' => 'Confiar en tu experiencia para reaccionar ante una frenada inesperada.'],
        ],
    ],
    [
        'n' => 11,
        'texto' => 'Si observas una situación de acoso sexual hacia un pasajero durante el recorrido, ¿cómo debes actuar?',
        'correcta' => 'c',
        'opciones' => [
            ['letra' => 'a', 'color' => 'verde', 'texto' => 'Ignorar la situación y continuar el recorrido.'],
            ['letra' => 'b', 'color' => 'rojo', 'texto' => 'Enfrentar al presunto agresor sin activar ningún protocolo.'],
            ['letra' => 'c', 'color' => 'amarillo', 'texto' => 'Proteger a la persona afectada, reportar el caso y activar el protocolo de atención.'],
        ],
    ],
    [
        'n' => 12,
        'texto' => 'Si al finalizar el recorrido identificas un objeto olvidado por un pasajero, ¿cuál es el procedimiento adecuado?',
        'correcta' => 'b',
        'opciones' => [
            ['letra' => 'a', 'color' => 'verde', 'texto' => 'Conservarlo hasta que el propietario lo reclame.'],
            ['letra' => 'b', 'color' => 'rojo', 'texto' => 'Informar a la empresa y aplicar el protocolo establecido para objetos olvidados.'],
            ['letra' => 'c', 'color' => 'amarillo', 'texto' => 'Verificar si contiene información que permita identificar a su propietario.'],
        ],
    ],
    [
        'n' => 13,
        'texto' => '¿Cuál es la diferencia entre un accidente de tránsito y un siniestro vial?',
        'correcta' => 'a',
        'opciones' => [
            ['letra' => 'a', 'color' => 'verde', 'texto' => 'El accidente se asocia con un hecho inesperado; el siniestro vial reconoce que puede prevenirse.'],
            ['letra' => 'b', 'color' => 'rojo', 'texto' => 'El accidente ocurre por fallas mecánicas; el siniestro vial, por errores humanos.'],
            ['letra' => 'c', 'color' => 'amarillo', 'texto' => 'Ambos términos significan exactamente lo mismo.'],
        ],
    ],
    [
        'n' => 14,
        'texto' => 'Mientras conduces observas un animal doméstico o silvestre que intenta cruzar la vía. ¿Cuál es la conducta más segura?',
        'correcta' => 'c',
        'opciones' => [
            ['letra' => 'a', 'color' => 'verde', 'texto' => 'Acelerar para asustar al animal y hacer que cruce rápidamente.'],
            ['letra' => 'b', 'color' => 'rojo', 'texto' => 'Tocar la bocina repetidamente para hacer que el animal se retire.'],
            ['letra' => 'c', 'color' => 'amarillo', 'texto' => 'Disminuir la velocidad y permitir que el animal cruce de manera segura.'],
        ],
    ],
];
