<?php
require 'db.php';
require_once 'mailer.php';
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    switch ($action) {
        case 'get_barberos':
            $stmt = $pdo->query("SELECT id, nombre, foto_perfil FROM trabajadores WHERE activo = 1");
            echo json_encode($stmt->fetchAll());
            break;
        case 'get_servicios':
            $stmt = $pdo->query("SELECT id, nombre, descripcion, precio, es_corte FROM servicios WHERE activo = 1");
            echo json_encode($stmt->fetchAll());
            break;
        case 'get_productos':
            $stmt = $pdo->query("SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.imagen_url, p.ventas, c.nombre as categoria FROM productos p JOIN categorias c ON p.categoria_id = c.id");
            echo json_encode($stmt->fetchAll());
            break;
        case 'get_horarios_ocupados':
            $trabajador_id = $_GET['trabajador_id'] ?? 0;
            $fecha = $_GET['fecha'] ?? '';
            $stmt = $pdo->prepare("SELECT hora FROM citas WHERE trabajador_id = ? AND fecha = ?");
            $stmt->execute([$trabajador_id, $fecha]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
            break;
        case 'get_crm_config':
            $stmt = $pdo->prepare("SELECT valor FROM configuraciones WHERE clave = 'meta_cortes_premio'");
            $stmt->execute();
            $meta = $stmt->fetchColumn();
            echo json_encode([
                "meta_cortes_premio" => intval($meta ?: 3)
            ]);
            break;
        case 'get_citas_trabajador':
            $trabajador_id = $_GET['trabajador_id'] ?? 0;
            $fecha = date('Y-m-d'); // Hoy
            // Traer citas del trabajador de hoy, con nombre del cliente y foto, y calcular cortes del cliente (COUNT en BD).
            $stmt = $pdo->prepare("
                SELECT c.id, c.hora, c.estado, cl.nombre, cl.foto_perfil as foto, cl.id as cliente_id,
                (SELECT COUNT(*) FROM citas c2 WHERE c2.cliente_id = cl.id AND c2.estado = 'Completada') + 1 as cortes
                FROM citas c
                JOIN clientes cl ON c.cliente_id = cl.id
                WHERE c.trabajador_id = ? AND c.fecha = ? AND c.estado IN ('Pendiente', 'Terminado_Esperando_Pago')
                ORDER BY c.hora ASC
            ");
            $stmt->execute([$trabajador_id, $fecha]);
            echo json_encode($stmt->fetchAll());
            break;
        case 'get_mis_pagos_trabajador':
            $trabajador_id = $_GET['trabajador_id'] ?? 0;
            $stmt = $pdo->prepare("
                SELECT id, periodo_inicio, periodo_fin, monto, fecha_pago, metodo_pago, numero_comprobante, notas, fecha_registro
                FROM pagos_trabajadores
                WHERE trabajador_id = ?
                ORDER BY fecha_pago DESC, id DESC
            ");
            $stmt->execute([$trabajador_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
        case 'search_clientes':
            $q = trim($_GET['q'] ?? '');
            if (empty($q)) {
                echo json_encode([]);
                break;
            }
            $qDigits = preg_replace('/[^0-9kK]/i', '', $q);
            $likeDigits = "%" . $qDigits . "%";
            $likeText = "%" . $q . "%";
            
            $stmt = $pdo->prepare("
                SELECT id, nombre, rut, telefono, email, cortes_acumulados 
                FROM clientes 
                WHERE (REPLACE(REPLACE(rut, '.', ''), '-', '') LIKE ? AND ? != '%%')
                   OR rut LIKE ? 
                   OR nombre LIKE ? 
                ORDER BY nombre ASC 
                LIMIT 8
            ");
            $stmt->execute([$likeDigits, $likeDigits, $likeText, $likeText]);
            echo json_encode($stmt->fetchAll());
            break;
        case 'get_cliente_by_rut':
            $rutRaw = $_GET['rut'] ?? '';
            $rutClean = strtoupper(preg_replace('/[^0-9K]/i', '', $rutRaw));
            if (empty($rutClean)) {
                echo json_encode(['found' => false]);
                break;
            }
            $stmt = $pdo->prepare("
                SELECT id, nombre, rut, telefono, email, cortes_acumulados 
                FROM clientes 
                WHERE REPLACE(REPLACE(UPPER(rut), '.', ''), '-', '') = ? 
                   OR UPPER(rut) = ? 
                LIMIT 1
            ");
            $stmt->execute([$rutClean, strtoupper(trim($rutRaw))]);
            $cli = $stmt->fetch();
            echo json_encode($cli ?: ['found' => false]);
            break;
        case 'get_pedidos_by_rut':
            $rutRaw = $_GET['rut'] ?? '';
            $rutClean = strtoupper(preg_replace('/[^0-9K]/i', '', $rutRaw));
            if (empty($rutClean)) {
                echo json_encode(['found' => false, 'pedidos' => []]);
                break;
            }
            $stmtCli = $pdo->prepare("
                SELECT id, nombre, rut 
                FROM clientes 
                WHERE REPLACE(REPLACE(UPPER(rut), '.', ''), '-', '') = ? 
                   OR UPPER(rut) = ? 
                LIMIT 1
            ");
            $stmtCli->execute([$rutClean, strtoupper(trim($rutRaw))]);
            $cli = $stmtCli->fetch();
            if (!$cli) {
                echo json_encode(['found' => false, 'pedidos' => []]);
                break;
            }
            
            $stmtPed = $pdo->prepare("
                SELECT p.id, p.total, p.estado, p.fecha_creacion,
                       GROUP_CONCAT(CONCAT(pd.cantidad, 'x ', pr.nombre, ' ($', pd.precio_unitario, ')') SEPARATOR ', ') AS detalle_items
                FROM pedidos p
                LEFT JOIN pedido_detalle pd ON p.id = pd.pedido_id
                LEFT JOIN productos pr ON pd.producto_id = pr.id
                WHERE p.cliente_id = ?
                GROUP BY p.id
                ORDER BY p.fecha_creacion DESC
            ");
            $stmtPed->execute([$cli['id']]);
            $pedidos = $stmtPed->fetchAll();
            echo json_encode(['found' => true, 'cliente' => $cli, 'pedidos' => $pedidos]);
            break;
        case 'get_mis_pedidos':
            $cliente_id = $_GET['cliente_id'] ?? 0;
            $stmt = $pdo->prepare("SELECT id, estado, total, fecha_creacion FROM pedidos WHERE cliente_id = ? ORDER BY fecha_creacion DESC");
            $stmt->execute([$cliente_id]);
            echo json_encode($stmt->fetchAll());
            break;
        default:
            echo json_encode(["error" => "Invalid action"]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    switch ($action) {
        case 'update_profile':
            try {
                $stmt = $pdo->prepare("UPDATE clientes SET rut = ?, telefono = ?, email = ? WHERE id = ?");
                $email = empty($data['email']) ? null : $data['email'];
                $stmt->execute([$data['rut'], $data['telefono'], $email, $data['cliente_id']]);
                echo json_encode(["status" => "success"]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Error BD: " . $e->getMessage()]);
            }
            break;
        case 'agendar_cita':
            $cliente_id = $data['cliente_id'] ?? null;
            $rut = isset($data['rut']) ? trim($data['rut']) : null;
            $telefono = isset($data['telefono']) ? trim($data['telefono']) : null;
            $montoCustom = (isset($data['monto']) && $data['monto'] !== null && $data['monto'] !== '') ? (float)$data['monto'] : null;
            $marcarPagada = !empty($data['marcar_pagada']) || !empty($data['ya_pagada']) || (($data['estado'] ?? '') === 'Completada');
            $metodoPago = $data['metodo_pago'] ?? 'Efectivo';
            $descuento = isset($data['descuento']) ? (float)$data['descuento'] : 0;
            $estadoCita = $marcarPagada ? 'Completada' : ($data['estado'] ?? 'Pendiente');
            
            if (!$cliente_id && !empty($rut)) {
                $rutClean = strtoupper(preg_replace('/[^0-9K]/i', '', $rut));
                $stmtCli = $pdo->prepare("SELECT id FROM clientes WHERE REPLACE(REPLACE(UPPER(rut), '.', ''), '-', '') = ? OR UPPER(rut) = ? LIMIT 1");
                $stmtCli->execute([$rutClean, strtoupper(trim($rut))]);
                $cliente_id = $stmtCli->fetchColumn();
                if (!$cliente_id) {
                    $nombre = !empty($data['nombre']) ? trim($data['nombre']) : 'Cliente ' . substr($rut, 0, 8);
                    $dummy_email = "express_" . preg_replace('/[^0-9kK]/', '', $rut) . "@laromana.cl";
                    $stmtIns = $pdo->prepare("INSERT INTO clientes (rut, nombre, telefono, email) VALUES (?, ?, ?, ?)");
                    $stmtIns->execute([$rut, $nombre, $telefono, $dummy_email]);
                    $cliente_id = $pdo->lastInsertId();
                }
            }

            if (!$cliente_id) {
                echo json_encode(["error" => "Cliente no especificado (RUT requerido)"]);
                break;
            }

            // Si el cliente ya existe y nos envía teléfono nuevo o faltante, lo actualizamos
            if (!empty($telefono)) {
                $stmtUpd = $pdo->prepare("UPDATE clientes SET telefono = ? WHERE id = ? AND (telefono IS NULL OR telefono = '')");
                $stmtUpd->execute([$telefono, $cliente_id]);
            }

            // Calcular monto o servicios
            $servicios = !empty($data['servicios']) && is_array($data['servicios']) ? $data['servicios'] : [];
            $subtotalCalc = 0;
            if (!empty($servicios)) {
                foreach ($servicios as $servId) {
                    $s = $pdo->prepare("SELECT precio FROM servicios WHERE id = ?");
                    $s->execute([$servId]);
                    $precioDb = $s->fetchColumn();
                    $precioFinal = ($montoCustom !== null && count($servicios) === 1) ? $montoCustom : ($precioDb ?: 0);
                    $subtotalCalc += $precioFinal;
                }
            } else {
                $sDefault = $pdo->query("SELECT id, precio FROM servicios ORDER BY es_corte DESC, id ASC LIMIT 1")->fetch();
                $precioFinal = ($montoCustom !== null) ? $montoCustom : ($sDefault ? ($sDefault['precio'] ?: 14000) : 14000);
                $subtotalCalc = $precioFinal;
            }

            $totalPagado = $marcarPagada ? max(0, $subtotalCalc - $descuento) : null;
            $metodoPagoFinal = $marcarPagada ? $metodoPago : null;

            $stmt = $pdo->prepare("INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$cliente_id, $data['trabajador_id'], $data['fecha'], $data['hora'], $estadoCita, $metodoPagoFinal, $descuento, $totalPagado]);
            $citaId = $pdo->lastInsertId();
            
            // Insertar detalles
            $stmtDet = $pdo->prepare("INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (?, ?, ?)");
            if (!empty($servicios)) {
                foreach ($servicios as $servId) {
                    $s = $pdo->prepare("SELECT precio FROM servicios WHERE id = ?");
                    $s->execute([$servId]);
                    $precioDb = $s->fetchColumn();
                    $precioFinal = ($montoCustom !== null && count($servicios) === 1) ? $montoCustom : ($precioDb ?: 0);
                    $stmtDet->execute([$citaId, $servId, $precioFinal]);
                }
            } else {
                $sDefault = $pdo->query("SELECT id, precio FROM servicios ORDER BY es_corte DESC, id ASC LIMIT 1")->fetch();
                if ($sDefault) {
                    $precioFinal = ($montoCustom !== null) ? $montoCustom : ($sDefault['precio'] ?: 14000);
                    $stmtDet->execute([$citaId, $sDefault['id'], $precioFinal]);
                }
            }

            // Si fue marcada como completada y pagada, sumamos el corte acumulado al cliente
            if ($marcarPagada && $cliente_id) {
                $pdo->prepare("UPDATE clientes SET cortes_acumulados = cortes_acumulados + 1 WHERE id = ?")->execute([$cliente_id]);
            }
            
            echo json_encode([
                "status" => "success", 
                "cita_id" => $citaId, 
                "cliente_id" => $cliente_id,
                "marcar_pagada" => $marcarPagada,
                "estado" => $estadoCita,
                "total_pagado" => $totalPagado
            ]);
            break;
        case 'venta_directa_caja':
            $cliente_id = !empty($data['cliente_id']) ? intval($data['cliente_id']) : null;
            $rut = isset($data['rut']) ? trim($data['rut']) : null;
            $nombre = isset($data['nombre']) ? trim($data['nombre']) : '';
            $telefono = isset($data['telefono']) ? trim($data['telefono']) : null;
            $email = isset($data['email']) ? trim($data['email']) : null;
            $carrito = $data['carrito'] ?? [];
            $total = floatval($data['total'] ?? 0);
            $descuento = floatval($data['descuento'] ?? 0);
            $metodo_pago = !empty($data['metodo_pago']) ? trim($data['metodo_pago']) : 'Efectivo';
            $estado = !empty($data['estado']) ? trim($data['estado']) : 'Pagado';

            if (empty($carrito) || !is_array($carrito)) {
                echo json_encode(["status" => "error", "message" => "El carrito de venta no contiene productos."]);
                break;
            }

            // Calcular subtotal y total robustamente en backend
            $subtotalCalc = 0;
            foreach ($carrito as $item) {
                $cant = max(1, intval($item['cantidad'] ?? 1));
                $pr = floatval($item['precio'] ?? 0);
                $subtotalCalc += ($pr * $cant);
            }
            if ($total <= 0 && $subtotalCalc > 0) {
                $total = max(0, $subtotalCalc - $descuento);
            }

            if (!$cliente_id && !empty($rut)) {
                $rutClean = strtoupper(preg_replace('/[^0-9K]/i', '', $rut));
                $stmtCli = $pdo->prepare("SELECT id, nombre, telefono, email FROM clientes WHERE REPLACE(REPLACE(UPPER(rut), '.', ''), '-', '') = ? OR UPPER(rut) = ? LIMIT 1");
                $stmtCli->execute([$rutClean, strtoupper(trim($rut))]);
                $cliExistente = $stmtCli->fetch();
                
                if ($cliExistente) {
                    $cliente_id = $cliExistente['id'];
                    $nombre = !empty($nombre) ? $nombre : $cliExistente['nombre'];
                    if (!empty($telefono) && empty($cliExistente['telefono'])) {
                        $pdo->prepare("UPDATE clientes SET telefono = ? WHERE id = ?")->execute([$telefono, $cliente_id]);
                    }
                } else {
                    $nombreFinal = !empty($nombre) ? $nombre : ('Cliente ' . substr($rut, 0, 8));
                    $emailFinal = !empty($email) ? $email : ("cliente_" . preg_replace('/[^0-9kK]/', '', $rut) . "@laromana.cl");
                    $hash = password_hash('123456', PASSWORD_DEFAULT);
                    $stmtIns = $pdo->prepare("INSERT INTO clientes (rut, nombre, telefono, email, password_hash) VALUES (?, ?, ?, ?, ?)");
                    $stmtIns->execute([$rut, $nombreFinal, $telefono, $emailFinal, $hash]);
                    $cliente_id = $pdo->lastInsertId();
                    $nombre = $nombreFinal;
                }
            } elseif (!$cliente_id) {
                $stmtGen = $pdo->query("SELECT id, nombre FROM clientes WHERE rut = 'CLIENTE-GENERAL' OR nombre = 'Cliente Mostrador' LIMIT 1")->fetch();
                if ($stmtGen) {
                    $cliente_id = $stmtGen['id'];
                    $nombre = !empty($nombre) ? $nombre : $stmtGen['nombre'];
                } else {
                    $hash = password_hash('123456', PASSWORD_DEFAULT);
                    $stmtIns = $pdo->prepare("INSERT INTO clientes (rut, nombre, email, password_hash) VALUES ('CLIENTE-GENERAL', 'Cliente Mostrador', 'mostrador@laromana.cl', ?)");
                    $stmtIns->execute([$hash]);
                    $cliente_id = $pdo->lastInsertId();
                    $nombre = 'Cliente Mostrador';
                }
            }

            try {
                $pdo->beginTransaction();

                try {
                    $stmtPed = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, estado, metodo_pago, fecha_creacion) VALUES (?, ?, ?, ?, NOW())");
                    $stmtPed->execute([$cliente_id, $total, $estado, $metodo_pago]);
                } catch (\Exception $exPed) {
                    $stmtPed = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, estado, fecha_creacion) VALUES (?, ?, ?, NOW())");
                    $stmtPed->execute([$cliente_id, $total, $estado]);
                }
                $pedido_id = $pdo->lastInsertId();

                $stmtDet = $pdo->prepare("INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
                $stmtStock = $pdo->prepare("UPDATE productos SET stock = GREATEST(0, stock - ?), ventas = ventas + ? WHERE id = ?");

                $detallesResumen = [];

                foreach ($carrito as $item) {
                    $prod_id = intval($item['id']);
                    $cantidad = max(1, intval($item['cantidad'] ?? 1));
                    $precio_unit = floatval($item['precio'] ?? 0);

                    $stmtDet->execute([$pedido_id, $prod_id, $cantidad, $precio_unit]);
                    $stmtStock->execute([$cantidad, $cantidad, $prod_id]);

                    $detallesResumen[] = [
                        'producto_id' => $prod_id,
                        'nombre' => $item['nombre'] ?? 'Producto',
                        'cantidad' => $cantidad,
                        'precio_unitario' => $precio_unit,
                        'subtotal' => $precio_unit * $cantidad
                    ];
                }

                $pdo->commit();

                echo json_encode([
                    "status" => "success",
                    "message" => "Venta de catálogo registrada exitosamente en caja.",
                    "pedido_id" => $pedido_id,
                    "folio" => "LR-VTA-" . str_pad($pedido_id, 4, '0', STR_PAD_LEFT),
                    "cliente_id" => $cliente_id,
                    "cliente_nombre" => $nombre,
                    "cliente_rut" => $rut,
                    "cliente_telefono" => $telefono,
                    "total" => $total,
                    "descuento" => $descuento,
                    "metodo_pago" => $metodo_pago,
                    "fecha" => date('Y-m-d H:i:s'),
                    "detalles" => $detallesResumen
                ]);

            } catch (\Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Error procesando la venta: " . $e->getMessage()]);
            }
            break;
        case 'nuevo_pedido':
            $cliente_id = $data['cliente_id'] ?? null;
            $rut = isset($data['rut']) ? trim($data['rut']) : null;
            $telefono = isset($data['telefono']) ? trim($data['telefono']) : null;
            
            if (!$cliente_id && !empty($rut)) {
                $rutClean = strtoupper(preg_replace('/[^0-9K]/i', '', $rut));
                $stmtCli = $pdo->prepare("SELECT id FROM clientes WHERE REPLACE(REPLACE(UPPER(rut), '.', ''), '-', '') = ? OR UPPER(rut) = ? LIMIT 1");
                $stmtCli->execute([$rutClean, strtoupper(trim($rut))]);
                $cliente_id = $stmtCli->fetchColumn();
                if (!$cliente_id) {
                    $nombre = !empty($data['nombre']) ? trim($data['nombre']) : 'Cliente ' . substr($rut, 0, 8);
                    $email = $data['email'] ?? ("cliente_" . preg_replace('/[^0-9kK]/', '', $rut) . "@laromana.cl");
                    $stmtIns = $pdo->prepare("INSERT INTO clientes (rut, nombre, telefono, email) VALUES (?, ?, ?, ?)");
                    $stmtIns->execute([$rut, $nombre, $telefono, $email]);
                    $cliente_id = $pdo->lastInsertId();
                }
            }

            if (!$cliente_id) {
                echo json_encode(["error" => "Cliente no especificado (RUT requerido)"]);
                break;
            }

            if (!empty($telefono)) {
                $stmtUpd = $pdo->prepare("UPDATE clientes SET telefono = ? WHERE id = ? AND (telefono IS NULL OR telefono = '')");
                $stmtUpd->execute([$telefono, $cliente_id]);
            }

            $stmt = $pdo->prepare("INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)");
            $stmt->execute([$cliente_id, $data['total']]);
            $pedidoId = $pdo->lastInsertId();
            
            $stmtDet = $pdo->prepare("INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
            foreach ($data['carrito'] as $item) {
                $stmtDet->execute([$pedidoId, $item['id'], $item['cantidad'], $item['precio']]);
            }
            $responseJson = json_encode(["status" => "success", "pedido_id" => $pedidoId]);
            
            // Forzar respuesta inmediata al frontend (Fire and Forget)
            ignore_user_abort(true);
            ob_start();
            echo $responseJson;
            header("Connection: close");
            header("Content-Length: " . ob_get_length());
            ob_end_flush();
            @ob_flush();
            flush();
            if (function_exists('fastcgi_finish_request')) {
                fastcgi_finish_request();
            }

            // Enviar correo en segundo plano
            $stmtCli = $pdo->prepare("SELECT email, nombre FROM clientes WHERE id = ?");
            $stmtCli->execute([$data['cliente_id']]);
            $cliente = $stmtCli->fetch();
            if ($cliente && $cliente['email']) {
                $asunto = "Pedido Recibido ORD-$pedidoId - La Romana";
                $cuerpo = "<h2>¡Hola {$cliente['nombre']}!</h2><p>Tu pedido <strong>ORD-$pedidoId</strong> ha sido registrado correctamente por un total de <strong>$" . number_format($data['total'], 0, ',', '.') . "</strong>.</p><p>Acércate a la caja en la barbería para pagarlo y retirarlo.</p>";
                enviarCorreo($cliente['email'], $asunto, $cuerpo);
            }

            break;
        case 'finalizar_cita':
            $cita_id = $data['cita_id'] ?? 0;
            $descuento = isset($data['descuento']) ? (float)$data['descuento'] : 0;
            $metodo_pago = $data['metodo_pago'] ?? 'Efectivo';
            $decant_producto_id = $data['decant_producto_id'] ?? null;
            $subtotalInput = isset($data['subtotal']) ? (float)$data['subtotal'] : (isset($data['monto']) ? (float)$data['monto'] : null);
            
            // Si el usuario especificó o modificó el subtotal en el modal de cobro:
            if ($subtotalInput !== null) {
                $subtotal = max(0, $subtotalInput);
                
                // Verificar si existen registros en cita_detalle
                $checkDet = $pdo->prepare("SELECT id FROM cita_detalle WHERE cita_id = ?");
                $checkDet->execute([$cita_id]);
                $detalles = $checkDet->fetchAll(PDO::FETCH_COLUMN);
                
                if (empty($detalles)) {
                    // Si no había cita_detalle, insertar con el servicio por defecto y el subtotal ingresado
                    $sDefault = $pdo->query("SELECT id FROM servicios ORDER BY es_corte DESC, id ASC LIMIT 1")->fetchColumn();
                    $servId = $sDefault ?: 1;
                    $pdo->prepare("INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (?, ?, ?)")
                        ->execute([$cita_id, $servId, $subtotal]);
                } else {
                    // Si hay registros, actualizar el primero con el monto total para que SUM(precio_cobrado) sea exacto
                    $pdo->prepare("UPDATE cita_detalle SET precio_cobrado = ? WHERE id = ?")
                        ->execute([$subtotal, $detalles[0]]);
                    for ($i = 1; $i < count($detalles); $i++) {
                        $pdo->prepare("UPDATE cita_detalle SET precio_cobrado = 0 WHERE id = ?")->execute([$detalles[$i]]);
                    }
                }
            } else {
                // Calcular total_pagado = subtotal - descuento desde BD
                $subQ = $pdo->prepare("SELECT SUM(precio_cobrado) FROM cita_detalle WHERE cita_id = ?");
                $subQ->execute([$cita_id]);
                $subtotal = (float)$subQ->fetchColumn();
            }

            $total_pagado = max(0, $subtotal - $descuento);
            
            // Si hay decant regalado, lo procesamos
            if ($decant_producto_id) {
                // Obtener nombre del decant
                $sProd = $pdo->prepare("SELECT nombre FROM productos WHERE id = ?");
                $sProd->execute([$decant_producto_id]);
                $decantNombre = $sProd->fetchColumn();

                if ($decantNombre) {
                    // Restar stock
                    $pdo->prepare("UPDATE productos SET stock = stock - 1 WHERE id = ?")->execute([$decant_producto_id]);
                    
                    // Obtener cliente_id
                    $sCli = $pdo->prepare("SELECT cliente_id FROM citas WHERE id = ?");
                    $sCli->execute([$cita_id]);
                    $cliente_id = $sCli->fetchColumn();

                    // Guardar historial recompensas
                    $pdo->prepare("INSERT INTO historial_recompensas (cliente_id, cita_id, aroma_decant) VALUES (?, ?, ?)")
                        ->execute([$cliente_id, $cita_id, $decantNombre]);
                    
                    // Actualizar cliente (reset cortes)
                    $pdo->prepare("UPDATE clientes SET cortes_acumulados = 0 WHERE id = ?")->execute([$cliente_id]);

                    // Completar cita con decant
                    $stmt = $pdo->prepare("UPDATE citas SET estado = 'Completada', descuento = ?, metodo_pago = ?, decant_entregado = ?, total_pagado = ? WHERE id = ?");
                    $stmt->execute([$descuento, $metodo_pago, $decantNombre, $total_pagado, $cita_id]);
                    echo json_encode(["status" => "success"]);
                    break;
                }
            }

            // Normal finalizar (no VIP o ya procesado sin premio)
            $stmt = $pdo->prepare("UPDATE citas SET estado = 'Completada', descuento = ?, metodo_pago = ?, total_pagado = ? WHERE id = ?");
            $stmt->execute([$descuento, $metodo_pago, $total_pagado, $cita_id]);
            
            // Incrementar corte al cliente normal
            $sCli = $pdo->prepare("SELECT cliente_id FROM citas WHERE id = ?");
            $sCli->execute([$cita_id]);
            $cliente_id = $sCli->fetchColumn();
            if ($cliente_id) {
                $pdo->prepare("UPDATE clientes SET cortes_acumulados = cortes_acumulados + 1 WHERE id = ?")->execute([$cliente_id]);
            }

            echo json_encode(["status" => "success"]);
            break;
        case 'derivar_a_caja':
            $cita_id = $data['cita_id'] ?? 0;
            $stmt = $pdo->prepare("UPDATE citas SET estado = 'Terminado_Esperando_Pago' WHERE id = ?");
            $stmt->execute([$cita_id]);
            echo json_encode(["status" => "success"]);
            break;
        case 'update_password_trabajador':
            // Idealmente aquí se verificaría la sesión. Para demo validamos el ID.
            $hash = password_hash($data['new_password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE trabajadores SET password_hash = ? WHERE id = ?");
            $stmt->execute([$hash, $data['trabajador_id']]);
            echo json_encode(["status" => "success"]);
            break;
        default:
            echo json_encode(["error" => "Invalid action"]);
    }
}
?>
