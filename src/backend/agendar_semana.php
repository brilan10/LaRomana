<?php
// agendar_semana.php - Generador Dinámico de Citas de Prueba para la Semana Actual
require 'db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // 1. Asegurar que los 3 Barberos existan con password '123456'
    $passStaff = password_hash('123456', PASSWORD_DEFAULT);
    
    $barberos = [
        ['id' => 1, 'nombre' => 'Carlos (Master)', 'email' => 'carlos@laromana.cl'],
        ['id' => 2, 'nombre' => 'Luis (Senior)',   'email' => 'luis@laromana.cl'],
        ['id' => 3, 'nombre' => 'Pedro (Junior)',  'email' => 'pedro@laromana.cl']
    ];

    foreach ($barberos as $b) {
        $stmt = $pdo->prepare("
            INSERT INTO trabajadores (id, nombre, email, password_hash, activo) 
            VALUES (?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE 
                nombre = VALUES(nombre), 
                email = VALUES(email), 
                password_hash = VALUES(password_hash),
                activo = 1
        ");
        $stmt->execute([$b['id'], $b['nombre'], $b['email'], $passStaff]);
    }

    // 2. Asegurar que existan clientes de prueba
    $passCliente = password_hash('123456', PASSWORD_DEFAULT);
    $clientes = [
        ['id' => 1, 'rut' => '12345678-9', 'nombre' => 'Matías Silva',     'email' => 'matias@email.com',   'telefono' => '+56911112222'],
        ['id' => 2, 'rut' => '18765432-1', 'nombre' => 'Tomás Riquelme',   'email' => 'tomas@email.com',    'telefono' => '+56922223333'],
        ['id' => 3, 'rut' => '19123456-7', 'nombre' => 'Sebastián Vera',   'email' => 'sebastian@email.com','telefono' => '+56933334444'],
        ['id' => 4, 'rut' => '16543210-K', 'nombre' => 'Felipe Morales',   'email' => 'felipe@email.com',   'telefono' => '+56944445555'],
        ['id' => 5, 'rut' => '20111222-3', 'nombre' => 'Andrés Tapia',     'email' => 'andres@email.com',   'telefono' => '+56955556666']
    ];

    foreach ($clientes as $c) {
        $stmt = $pdo->prepare("
            INSERT INTO clientes (id, rut, nombre, email, telefono, password_hash, cortes_acumulados)
            VALUES (?, ?, ?, ?, ?, ?, 2)
            ON DUPLICATE KEY UPDATE 
                nombre = VALUES(nombre), 
                email = VALUES(email), 
                password_hash = VALUES(password_hash)
        ");
        $stmt->execute([$c['id'], $c['rut'], $c['nombre'], $c['email'], $c['telefono'], $passCliente]);
    }

    // 3. Fechas de la semana actual relativas a hoy
    $hoy     = date('Y-m-d');
    $manana  = date('Y-m-d', strtotime('+1 day'));
    $pasado  = date('Y-m-d', strtotime('+2 days'));
    $dia3    = date('Y-m-d', strtotime('+3 days'));

    // Citas a insertar:
    $citasData = [
        // --- HOY ---
        ['cliente_id' => 1, 'trabajador_id' => 1, 'fecha' => $hoy, 'hora' => '10:00:00', 'estado' => 'Completada', 'metodo_pago' => 'Efectivo',      'total_pagado' => 12000, 'servicios' => [1]], // Corte Clásico
        ['cliente_id' => 2, 'trabajador_id' => 2, 'fecha' => $hoy, 'hora' => '11:30:00', 'estado' => 'Completada', 'metodo_pago' => 'Transferencia', 'total_pagado' => 20000, 'servicios' => [3]], // Pack Completo
        ['cliente_id' => 3, 'trabajador_id' => 1, 'fecha' => $hoy, 'hora' => '15:00:00', 'estado' => 'Pendiente',  'metodo_pago' => null,            'total_pagado' => 0,     'servicios' => [2]], // Degradado (Pendiente para cobrar en POS)
        ['cliente_id' => 4, 'trabajador_id' => 3, 'fecha' => $hoy, 'hora' => '17:00:00', 'estado' => 'Pendiente',  'metodo_pago' => null,            'total_pagado' => 0,     'servicios' => [1]], // Clásico
        ['cliente_id' => 5, 'trabajador_id' => 2, 'fecha' => $hoy, 'hora' => '18:30:00', 'estado' => 'Pendiente',  'metodo_pago' => null,            'total_pagado' => 0,     'servicios' => [4]], // Barba

        // --- MAÑANA ---
        ['cliente_id' => 2, 'trabajador_id' => 1, 'fecha' => $manana, 'hora' => '10:00:00', 'estado' => 'Pendiente', 'metodo_pago' => null, 'total_pagado' => 0, 'servicios' => [2]],
        ['cliente_id' => 1, 'trabajador_id' => 2, 'fecha' => $manana, 'hora' => '12:00:00', 'estado' => 'Pendiente', 'metodo_pago' => null, 'total_pagado' => 0, 'servicios' => [3]],
        ['cliente_id' => 4, 'trabajador_id' => 3, 'fecha' => $manana, 'hora' => '16:00:00', 'estado' => 'Pendiente', 'metodo_pago' => null, 'total_pagado' => 0, 'servicios' => [1]],

        // --- DÍA 2 ---
        ['cliente_id' => 3, 'trabajador_id' => 1, 'fecha' => $pasado, 'hora' => '11:00:00', 'estado' => 'Pendiente', 'metodo_pago' => null, 'total_pagado' => 0, 'servicios' => [1]],
        ['cliente_id' => 5, 'trabajador_id' => 2, 'fecha' => $pasado, 'hora' => '15:30:00', 'estado' => 'Pendiente', 'metodo_pago' => null, 'total_pagado' => 0, 'servicios' => [2]],

        // --- DÍA 3 ---
        ['cliente_id' => 1, 'trabajador_id' => 3, 'fecha' => $dia3, 'hora' => '12:00:00', 'estado' => 'Pendiente', 'metodo_pago' => null, 'total_pagado' => 0, 'servicios' => [3]]
    ];

    $preciosServicios = [
        1 => 12000,
        2 => 14000,
        3 => 20000,
        4 => 8000
    ];

    $stmtCita = $pdo->prepare("
        INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, total_pagado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmtDetalle = $pdo->prepare("
        INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado)
        VALUES (?, ?, ?)
    ");

    $insertadas = 0;
    foreach ($citasData as $cd) {
        $stmtCita->execute([
            $cd['cliente_id'],
            $cd['trabajador_id'],
            $cd['fecha'],
            $cd['hora'],
            $cd['estado'],
            $cd['metodo_pago'],
            $cd['total_pagado']
        ]);
        $citaId = $pdo->lastInsertId();

        foreach ($cd['servicios'] as $servId) {
            $precio = $preciosServicios[$servId] ?? 12000;
            $stmtDetalle->execute([$citaId, $servId, $precio]);
        }
        $insertadas++;
    }

    echo json_encode([
        "status" => "success",
        "mensaje" => "¡Citas de la semana agendadas con éxito!",
        "citas_creadas" => $insertadas,
        "dias_cubiertos" => [$hoy, $manana, $pasado, $dia3],
        "barberos_disponibles" => [
            ["nombre" => "Carlos (Master)", "email" => "carlos@laromana.cl", "clave" => "123456"],
            ["nombre" => "Luis (Senior)",   "email" => "luis@laromana.cl",   "clave" => "123456"],
            ["nombre" => "Pedro (Junior)",  "email" => "pedro@laromana.cl",  "clave" => "123456"]
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
