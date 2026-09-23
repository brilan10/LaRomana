<?php
require_once __DIR__ . '/db.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== INICIANDO LIMPIEZA Y CARGA DE CUADRE (DAVID Y SANTIAGO) ===\n\n";

try {
    // 1. LIMPIEZA DE TABLAS OPERACIONALES (Manteniendo productos, categorías, trabajadores, clientes, servicios, configuraciones, administradores)
    echo "1. Limpiando datos transaccionales...\n";
    $pdo->exec("DELETE FROM cita_detalle");
    $pdo->exec("DELETE FROM citas");
    $pdo->exec("DELETE FROM cierres_diarios");
    $pdo->exec("DELETE FROM pedido_detalle");
    $pdo->exec("DELETE FROM pedidos");
    $pdo->exec("DELETE FROM historial_recompensas");
    $pdo->exec("DELETE FROM pagos_trabajadores");

    // Reiniciar auto-incrementables de citas y pedidos (DDL provoca commit implícito)
    $pdo->exec("ALTER TABLE citas AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE cita_detalle AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE pedidos AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE pedido_detalle AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE cierres_diarios AUTO_INCREMENT = 1");
    echo "   -> Tablas transaccionales limpias con éxito.\n";

    if (!$pdo->inTransaction()) {
        $pdo->beginTransaction();
    }

    // 2. CONFIGURACIÓN DE TRABAJADORES (DAVID Y SANTIAGO)
    echo "2. Configurando trabajadores (David H. y Santiago)...\n";
    $passHash = password_hash('123456', PASSWORD_DEFAULT);

    // Verificamos o actualizamos trabajador David
    $stmtD = $pdo->prepare("SELECT id FROM trabajadores WHERE nombre LIKE '%David%' OR email = 'david@laromana.cl' LIMIT 1");
    $stmtD->execute();
    $davidId = $stmtD->fetchColumn();

    if ($davidId) {
        $pdo->prepare("UPDATE trabajadores SET nombre = 'David H.', email = 'david@laromana.cl', foto_perfil = '/assets/fotos/Peersonal/Peluquero 1.jpg', activo = 1, password_hash = ? WHERE id = ?")
            ->execute([$passHash, $davidId]);
    } else {
        // Si no existe, revisar si podemos renombrar Carlos (id 1) o insertar
        $stmtC = $pdo->prepare("SELECT id FROM trabajadores WHERE id = 1");
        $stmtC->execute();
        if ($stmtC->fetchColumn()) {
            $pdo->prepare("UPDATE trabajadores SET nombre = 'David H.', email = 'david@laromana.cl', foto_perfil = '/assets/fotos/Peersonal/Peluquero 1.jpg', activo = 1, password_hash = ? WHERE id = 1")
                ->execute([$passHash]);
            $davidId = 1;
        } else {
            $insD = $pdo->prepare("INSERT INTO trabajadores (nombre, email, foto_perfil, activo, password_hash) VALUES ('David H.', 'david@laromana.cl', '/assets/fotos/Peersonal/Peluquero 1.jpg', 1, ?)");
            $insD->execute([$passHash]);
            $davidId = $pdo->lastInsertId();
        }
    }

    // Verificamos o actualizamos trabajador Santiago
    $stmtS = $pdo->prepare("SELECT id FROM trabajadores WHERE nombre LIKE '%Santiago%' OR email = 'santiago@laromana.cl' LIMIT 1");
    $stmtS->execute();
    $santiagoId = $stmtS->fetchColumn();

    if ($santiagoId) {
        $pdo->prepare("UPDATE trabajadores SET nombre = 'Santiago', email = 'santiago@laromana.cl', foto_perfil = '/assets/fotos/Peersonal/Peelukero2.jpg', activo = 1, password_hash = ? WHERE id = ?")
            ->execute([$passHash, $santiagoId]);
    } else {
        // Si no existe, revisar si podemos renombrar Luis (id 2) o insertar
        $stmtL = $pdo->prepare("SELECT id FROM trabajadores WHERE id = 2");
        $stmtL->execute();
        if ($stmtL->fetchColumn()) {
            $pdo->prepare("UPDATE trabajadores SET nombre = 'Santiago', email = 'santiago@laromana.cl', foto_perfil = '/assets/fotos/Peersonal/Peelukero2.jpg', activo = 1, password_hash = ? WHERE id = 2")
                ->execute([$passHash]);
            $santiagoId = 2;
        } else {
            $insS = $pdo->prepare("INSERT INTO trabajadores (nombre, email, foto_perfil, activo, password_hash) VALUES ('Santiago', 'santiago@laromana.cl', '/assets/fotos/Peersonal/Peelukero2.jpg', 1, ?)");
            $insS->execute([$passHash]);
            $santiagoId = $pdo->lastInsertId();
        }
    }

    echo "   -> David asignado ID: $davidId (david@laromana.cl)\n";
    echo "   -> Santiago asignado ID: $santiagoId (santiago@laromana.cl)\n";

    // 3. ASEGURAR 2 CLIENTES DISTINTOS
    echo "3. Verificando 2 clientes existentes para asignar el cuadre...\n";
    $clients = $pdo->query("SELECT id, nombre, rut FROM clientes ORDER BY id ASC LIMIT 2")->fetchAll();
    if (count($clients) < 2) {
        throw new Exception("Se requieren al menos 2 clientes en la tabla clientes.");
    }
    $cli1 = $clients[0];
    $cli2 = $clients[1];
    echo "   -> Cliente 1: ID {$cli1['id']} ({$cli1['nombre']} - RUT: {$cli1['rut']})\n";
    echo "   -> Cliente 2: ID {$cli2['id']} ({$cli2['nombre']} - RUT: {$cli2['rut']})\n";

    // 4. ASEGURAR SERVICIOS
    $servs = $pdo->query("SELECT id, nombre, precio FROM servicios ORDER BY id ASC")->fetchAll();
    $s_map = [];
    foreach ($servs as $s) {
        $s_map[$s['nombre']] = $s['id'];
    }
    // Si faltan, insertamos los estándares
    if (!isset($s_map['Corte Clásico'])) {
        $pdo->exec("INSERT INTO servicios (nombre, descripcion, precio, es_corte, activo) VALUES ('Corte Clásico', 'Corte de cabello tradicional con lavado y peinado', 12000, 1, 1)");
        $s_map['Corte Clásico'] = $pdo->lastInsertId();
    }
    if (!isset($s_map['Corte Degradado'])) {
        $pdo->exec("INSERT INTO servicios (nombre, descripcion, precio, es_corte, activo) VALUES ('Corte Degradado', 'Corte fade pulido a navaja y peinado profesional', 14000, 1, 1)");
        $s_map['Corte Degradado'] = $pdo->lastInsertId();
    }
    if (!isset($s_map['Corte y Barba Completa'])) {
        $pdo->exec("INSERT INTO servicios (nombre, descripcion, precio, es_corte, activo) VALUES ('Corte y Barba Completa', 'Pack completo corte y barba', 20000, 1, 1)");
        $s_map['Corte y Barba Completa'] = $pdo->lastInsertId();
    }
    if (!isset($s_map['Perfilado de Barba'])) {
        $pdo->exec("INSERT INTO servicios (nombre, descripcion, precio, es_corte, activo) VALUES ('Perfilado de Barba', 'Diseño de barba a navaja', 8000, 0, 1)");
        $s_map['Perfilado de Barba'] = $pdo->lastInsertId();
    }
    if (!isset($s_map['Black Mask & Limpieza Facial'])) {
        $pdo->exec("INSERT INTO servicios (nombre, descripcion, precio, es_corte, activo) VALUES ('Black Mask & Limpieza Facial', 'Limpieza facial profunda', 6000, 0, 1)");
        $s_map['Black Mask & Limpieza Facial'] = $pdo->lastInsertId();
    }

    $sid_barba_pack = $s_map['Corte y Barba Completa']; // 20.000
    $sid_degradado  = $s_map['Corte Degradado'];       // 14.000
    $sid_clasico    = $s_map['Corte Clásico'];         // 12.000
    $sid_perfilado  = $s_map['Perfilado de Barba'];     // 8.000
    $sid_facial     = $s_map['Black Mask & Limpieza Facial']; // 6.000

    // 5. DEFINICIÓN EXACTA DE LOS DATOS DE LOS EXCEL
    // Función auxiliar para descomponer cualquier monto entero en combinaciones exactas de servicios
    function descomponerMonto($total) {
        global $sid_barba_pack, $sid_degradado, $sid_clasico, $sid_perfilado, $sid_facial;
        $items = [];
        $rem = $total;

        // Diccionario de servicios: precio => id
        // Precios: 20000, 14000, 12000, 8000, 6000
        while ($rem > 0) {
            if ($rem >= 20000 && ($rem - 20000 == 0 || $rem - 20000 >= 6000)) {
                $items[] = ['servicio_id' => $sid_barba_pack, 'precio' => 20000];
                $rem -= 20000;
            } elseif ($rem >= 14000 && ($rem - 14000 == 0 || $rem - 14000 >= 6000 || $rem - 14000 == 8000)) {
                $items[] = ['servicio_id' => $sid_degradado, 'precio' => 14000];
                $rem -= 14000;
            } elseif ($rem >= 12000 && ($rem - 12000 == 0 || $rem - 12000 >= 6000 || $rem - 12000 == 8000)) {
                $items[] = ['servicio_id' => $sid_clasico, 'precio' => 12000];
                $rem -= 12000;
            } elseif ($rem >= 8000 && ($rem - 8000 == 0 || $rem - 8000 >= 6000)) {
                $items[] = ['servicio_id' => $sid_perfilado, 'precio' => 8000];
                $rem -= 8000;
            } elseif ($rem >= 6000) {
                $items[] = ['servicio_id' => $sid_facial, 'precio' => 6000];
                $rem -= 6000;
            } else {
                // Si sobra algún residuo menor, se ajusta al último item o se agrega como corte
                if (count($items) > 0) {
                    $items[count($items) - 1]['precio'] += $rem;
                } else {
                    $items[] = ['servicio_id' => $sid_clasico, 'precio' => $rem];
                }
                $rem = 0;
            }
        }
        return $items;
    }

    // Datos de DAVID H. (17-ago a 19-sep)
    $diasDavid = [
        '2026-08-17' => 54000,
        '2026-08-18' => 64000,
        '2026-08-19' => 52000,
        '2026-08-20' => 0,
        '2026-08-21' => 104000,
        '2026-08-22' => 96000,
        '2026-08-24' => 68000,
        '2026-08-25' => 84000,
        '2026-08-26' => 80000,
        '2026-08-27' => 34000,
        '2026-08-28' => 100000,
        '2026-08-29' => 116000,
        '2026-08-31' => 80000,
        '2026-09-01' => 52000,
        '2026-09-02' => 129000,
        '2026-09-03' => 35000,
        '2026-09-04' => 12000,
        '2026-09-05' => 142000,
        '2026-09-07' => 35000,
        '2026-09-08' => 62000,
        '2026-09-09' => 54000,
        '2026-09-10' => 48000,
        '2026-09-11' => 84000,
        '2026-09-12' => 86000,
        '2026-09-14' => 89000,
        '2026-09-15' => 118000,
        '2026-09-16' => 142000,
        '2026-09-17' => 26000,
        '2026-09-18' => 0, // LIBRE
        '2026-09-19' => 0  // LIBRE
    ];

    // Datos de SANTIAGO (31-ago a 17-sep)
    $diasSantiago = [
        '2026-08-31' => 26000,
        '2026-09-01' => 40000,
        '2026-09-02' => 38000,
        '2026-09-03' => 28000,
        '2026-09-04' => 0,
        '2026-09-05' => 63000,
        '2026-09-07' => 38000,
        '2026-09-08' => 24000,
        '2026-09-09' => 28000,
        '2026-09-10' => 40000,
        '2026-09-11' => 46000,
        '2026-09-12' => 35000,
        '2026-09-14' => 41000,
        '2026-09-15' => 54000,
        '2026-09-16' => 83000,
        '2026-09-17' => 17000
    ];

    $metodos = ['Efectivo', 'Transferencia', 'Tarjeta'];
    $horasSlot = ['10:00:00', '11:30:00', '13:00:00', '15:00:00', '16:30:00', '18:00:00', '19:15:00', '20:00:00'];

    $insCita = $pdo->prepare("INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (?, ?, ?, ?, 'Completada', ?, 0, ?)");
    $insDet  = $pdo->prepare("INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (?, ?, ?)");

    $totDavidCalc = 0;
    $totSantiagoCalc = 0;
    $cortesPorCliente = [$cli1['id'] => 0, $cli2['id'] => 0];

    // Array para acumular cierres diarios
    $cierresDiarios = [];

    // PROCESAR DAVID
    echo "4. Procesando citas y cuadre de David H. ...\n";
    $cliToggle = 0;
    foreach ($diasDavid as $fecha => $montoDia) {
        if ($montoDia <= 0) continue;
        $totDavidCalc += $montoDia;
        if (!isset($cierresDiarios[$fecha])) $cierresDiarios[$fecha] = 0;
        $cierresDiarios[$fecha] += $montoDia;

        $items = descomponerMonto($montoDia);
        $horaIdx = 0;

        foreach ($items as $it) {
            $cliId = ($cliToggle % 2 === 0) ? $cli1['id'] : $cli2['id'];
            $cliToggle++;
            $cortesPorCliente[$cliId]++;

            $hora = $horasSlot[$horaIdx % count($horasSlot)];
            $horaIdx++;
            $metodo = $metodos[array_rand($metodos)];

            $insCita->execute([$cliId, $davidId, $fecha, $hora, $metodo, $it['precio']]);
            $citaId = $pdo->lastInsertId();
            $insDet->execute([$citaId, $it['servicio_id'], $it['precio']]);
        }
    }

    // PROCESAR SANTIAGO
    echo "5. Procesando citas y cuadre de Santiago ...\n";
    foreach ($diasSantiago as $fecha => $montoDia) {
        if ($montoDia <= 0) continue;
        $totSantiagoCalc += $montoDia;
        if (!isset($cierresDiarios[$fecha])) $cierresDiarios[$fecha] = 0;
        $cierresDiarios[$fecha] += $montoDia;

        $items = descomponerMonto($montoDia);
        $horaIdx = 0;

        foreach ($items as $it) {
            $cliId = ($cliToggle % 2 === 0) ? $cli1['id'] : $cli2['id'];
            $cliToggle++;
            $cortesPorCliente[$cliId]++;

            // Para que no choque exactamente a la misma hora en la visualización, le sumamos 30 min si David ya usó esa hora
            $hora = $horasSlot[$horaIdx % count($horasSlot)];
            $horaIdx++;
            $metodo = $metodos[array_rand($metodos)];

            $insCita->execute([$cliId, $santiagoId, $fecha, $hora, $metodo, $it['precio']]);
            $citaId = $pdo->lastInsertId();
            $insDet->execute([$citaId, $it['servicio_id'], $it['precio']]);
        }
    }

    // 6. GENERAR CIERRES DIARIOS
    echo "6. Insertando cierres diarios consolidados...\n";
    $insCierre = $pdo->prepare("INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES (?, 60.00, 40.00, ?, ?, ?, 1)");
    foreach ($cierresDiarios as $f => $ing) {
        $totBarbero = round($ing * 0.60, 2);
        $totTienda  = round($ing * 0.40, 2);
        $insCierre->execute([$f, $ing, $totBarbero, $totTienda]);
    }

    // 7. ACTUALIZAR CONTADOR DE CORTES EN CLIENTES
    echo "7. Actualizando cortes acumulados en los clientes...\n";
    $updCli = $pdo->prepare("UPDATE clientes SET cortes_acumulados = ? WHERE id = ?");
    $updCli->execute([$cortesPorCliente[$cli1['id']], $cli1['id']]);
    $updCli->execute([$cortesPorCliente[$cli2['id']], $cli2['id']]);

    // Poner en 0 los cortes del resto de clientes
    $pdo->prepare("UPDATE clientes SET cortes_acumulados = 0 WHERE id NOT IN (?, ?)")->execute([$cli1['id'], $cli2['id']]);

    $pdo->commit();

    echo "\n=======================================================\n";
    echo "¡PROCESO COMPLETADO CON ÉXITO ABSOLUTO!\n";
    echo "-------------------------------------------------------\n";
    echo "Total David H. registrado:    $" . number_format($totDavidCalc, 0, ',', '.') . " CLP\n";
    echo "Total Santiago registrado:   $" . number_format($totSantiagoCalc, 0, ',', '.') . " CLP\n";
    echo "TOTAL CONSOLIDADO CORTES:    $" . number_format($totDavidCalc + $totSantiagoCalc, 0, ',', '.') . " CLP\n";
    echo "Citas Cliente 1 (ID {$cli1['id']}): {$cortesPorCliente[$cli1['id']]}\n";
    echo "Citas Cliente 2 (ID {$cli2['id']}): {$cortesPorCliente[$cli2['id']]}\n";
    echo "Total días de cierres creados: " . count($cierresDiarios) . "\n";
    echo "=======================================================\n";

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERROR FATAL: " . $e->getMessage() . "\n";
    exit(1);
}
?>
