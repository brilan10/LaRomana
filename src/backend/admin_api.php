<?php
require 'db.php';
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    switch ($action) {
        // --- MÉTRICAS Y DASHBOARD ---
        case 'get_dashboard_metrics':
            $metrics = [
                'ingresos_totales' => 0,
                'citas_atendidas' => 0,
                'ventas_tienda' => 0,
                'total_pedidos' => 0,
                'decants_mes' => 0,
                'ingresos_mes' => 0,
                'top_barbero' => '-',
                'top_barbero_cortes' => 0,
                'top_cliente' => '-',
                'top_cliente_citas' => 0
            ];
            $hoy = $pdo->query("SELECT CURDATE()")->fetchColumn();
            $mes_actual = $pdo->query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01')")->fetchColumn();

            // Citas Atendidas Hoy (Completadas)
            $stmtCitasHoy = $pdo->prepare("SELECT COUNT(*) FROM citas WHERE fecha = ? AND LOWER(estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado')");
            $stmtCitasHoy->execute([$hoy]);
            $metrics['citas_atendidas'] = $stmtCitasHoy->fetchColumn() ?: 0;

            // Ingresos Cortes Hoy (Total cobrado en cita_detalle o total_pagado)
            $stmtIngresosCortes = $pdo->prepare("
                SELECT SUM(COALESCE((SELECT SUM(cd.precio_cobrado) FROM cita_detalle cd WHERE cd.cita_id = c.id), c.total_pagado, 0)) 
                FROM citas c 
                WHERE c.fecha = ? AND LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado')
            ");
            $stmtIngresosCortes->execute([$hoy]);
            $ingresos_cortes = $stmtIngresosCortes->fetchColumn() ?: 0;

            // Ventas Tienda Hoy
            $stmtVentas = $pdo->prepare("SELECT SUM(total), COUNT(*) FROM pedidos WHERE DATE(fecha_creacion) = ? AND estado IN ('Entregado', 'Pagado')");
            $stmtVentas->execute([$hoy]);
            $ventas = $stmtVentas->fetch(PDO::FETCH_NUM);
            $metrics['ventas_tienda'] = $ventas[0] ?: 0;
            $metrics['total_pedidos'] = $ventas[1] ?: 0;

            $metrics['ingresos_totales'] = $ingresos_cortes + $metrics['ventas_tienda'];

            // Ingresos del mes
            $stmtIngMes = $pdo->prepare("
                SELECT SUM(COALESCE((SELECT SUM(cd.precio_cobrado) FROM cita_detalle cd WHERE cd.cita_id = c.id), c.total_pagado, 0)) 
                FROM citas c 
                WHERE c.fecha >= ? AND LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado')
            ");
            $stmtIngMes->execute([$mes_actual]);
            $ingresos_cortes_mes = $stmtIngMes->fetchColumn() ?: 0;

            $stmtVentasMes = $pdo->prepare("SELECT SUM(total) FROM pedidos WHERE fecha_creacion >= ? AND estado IN ('Entregado', 'Pagado')");
            $stmtVentasMes->execute([$mes_actual]);
            $ventas_mes = $stmtVentasMes->fetchColumn() ?: 0;

            $metrics['ingresos_mes'] = $ingresos_cortes_mes + $ventas_mes;

            // Top Barbero
            $stmtTopB = $pdo->prepare("
                SELECT t.nombre, COUNT(c.id) as cortes 
                FROM citas c JOIN trabajadores t ON c.trabajador_id = t.id 
                WHERE c.fecha >= ? AND LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado')
                GROUP BY t.id ORDER BY cortes DESC LIMIT 1
            ");
            $stmtTopB->execute([$mes_actual]);
            $topB = $stmtTopB->fetch();
            if ($topB) {
                $metrics['top_barbero'] = $topB['nombre'];
                $metrics['top_barbero_cortes'] = $topB['cortes'];
            }

            // Top Cliente
            $stmtTopC = $pdo->prepare("
                SELECT cl.nombre, COUNT(c.id) as citas 
                FROM citas c JOIN clientes cl ON c.cliente_id = cl.id 
                WHERE c.fecha >= ? AND LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado')
                GROUP BY cl.id ORDER BY citas DESC LIMIT 1
            ");
            $stmtTopC->execute([$mes_actual]);
            $topC = $stmtTopC->fetch();
            if ($topC) {
                $metrics['top_cliente'] = $topC['nombre'];
                $metrics['top_cliente_citas'] = $topC['citas'];
            }

            // Decants
            $stmtDecants = $pdo->prepare("SELECT COUNT(*) FROM historial_recompensas WHERE fecha_entrega >= ?");
            $stmtDecants->execute([$mes_actual]);
            $metrics['decants_mes'] = $stmtDecants->fetchColumn() ?: 0;

            echo json_encode($metrics);
            break;

        case 'get_chart_data':
            $data = [];
            for ($i = 0; $i < 7; $i++) {
                $fecha = date('Y-m-d', strtotime("-$i days"));
                
                $stmtC = $pdo->prepare("
                    SELECT SUM(COALESCE((SELECT SUM(cd.precio_cobrado) FROM cita_detalle cd WHERE cd.cita_id = c.id), c.total_pagado, 0)) 
                    FROM citas c 
                    WHERE c.fecha = ? AND LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado')
                ");
                $stmtC->execute([$fecha]);
                $c = (float)($stmtC->fetchColumn() ?: 0);

                $stmtP = $pdo->prepare("SELECT SUM(total) FROM pedidos WHERE DATE(fecha_creacion) = ? AND estado IN ('Entregado', 'Pagado')");
                $stmtP->execute([$fecha]);
                $p = (float)($stmtP->fetchColumn() ?: 0);

                $data[] = [
                    'fecha' => date('d/m', strtotime($fecha)),
                    'total' => (float)($c + $p)
                ];
            }
            echo json_encode(array_reverse($data));
            break;

        case 'get_todas_citas':
            $start_date = $_GET['start_date'] ?? ($_GET['fecha'] ?? $pdo->query("SELECT CURDATE()")->fetchColumn());
            $end_date = $_GET['end_date'] ?? $start_date;
            
            $stmt = $pdo->prepare("
                SELECT c.id, c.fecha, c.hora, c.estado, cl.id as cliente_id, cl.nombre as cliente, cl.rut as cliente_rut, cl.telefono as cliente_telefono,
                t.id as trabajador_id, t.nombre as trabajador,
                COALESCE((SELECT SUM(precio_cobrado) FROM cita_detalle cd WHERE cd.cita_id = c.id), c.total_pagado, 0) as subtotal,
                (SELECT GROUP_CONCAT(s.nombre SEPARATOR ', ') FROM cita_detalle cd JOIN servicios s ON cd.servicio_id = s.id WHERE cd.cita_id = c.id) as servicios_nombres,
                cl.cortes_acumulados, c.descuento, c.total_pagado, c.metodo_pago, c.decant_entregado
                FROM citas c
                JOIN clientes cl ON c.cliente_id = cl.id
                JOIN trabajadores t ON c.trabajador_id = t.id
                WHERE c.fecha >= ? AND c.fecha <= ?
                ORDER BY c.fecha ASC, c.hora ASC
            ");
            $stmt->execute([$start_date, $end_date]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_crm_clientes':
            $stmt = $pdo->query("
                SELECT cl.id, cl.nombre, cl.email, cl.telefono, cl.rut, cl.cortes_acumulados, cl.decants_disponibles, cl.notas_crm, cl.fecha_registro,
                (SELECT COUNT(*) FROM citas c WHERE c.cliente_id = cl.id AND c.estado = 'Completada' AND MONTH(c.fecha) = MONTH(CURDATE()) AND YEAR(c.fecha) = YEAR(CURDATE())) as cortes_mes,
                (SELECT COUNT(*) FROM historial_recompensas hr WHERE hr.cliente_id = cl.id AND MONTH(hr.fecha_entrega) = MONTH(CURDATE()) AND YEAR(hr.fecha_entrega) = YEAR(CURDATE())) as premios_mes
                FROM clientes cl 
                ORDER BY cl.nombre ASC
            ");
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_crm_config':
            $stmt = $pdo->prepare("SELECT valor FROM configuraciones WHERE clave = 'meta_cortes_premio'");
            $stmt->execute();
            $meta = $stmt->fetchColumn();
            echo json_encode([
                "meta_cortes_premio" => intval($meta ?: 3)
            ]);
            break;

        case 'get_citas_por_cobrar':
            $fecha = $pdo->query("SELECT CURDATE()")->fetchColumn();
            $stmt = $pdo->prepare("
                SELECT c.id, c.hora, c.estado, cl.nombre as cliente, cl.cortes_acumulados, t.nombre as barbero, c.descuento, c.total_pagado, c.metodo_pago,
                COALESCE((SELECT SUM(precio_cobrado) FROM cita_detalle cd WHERE cd.cita_id = c.id), c.total_pagado, 0) as subtotal
                FROM citas c
                JOIN clientes cl ON c.cliente_id = cl.id
                JOIN trabajadores t ON c.trabajador_id = t.id
                WHERE c.fecha = ? AND c.estado != 'Cancelada'
                ORDER BY c.hora ASC
            ");
            $stmt->execute([$fecha]);
            echo json_encode($stmt->fetchAll());
            break;

        case 'get_estado_caja':
            $fecha = $pdo->query("SELECT CURDATE()")->fetchColumn();
            $stmt = $pdo->prepare("SELECT * FROM cierres_diarios WHERE fecha = ?");
            $stmt->execute([$fecha]);
            $caja = $stmt->fetch();
            
            if (!$caja) {
                echo json_encode([
                    'estado' => 'no_iniciada',
                    'porcentaje_barbero' => 60,
                    'porcentaje_tienda' => 40
                ]);
            } else {
                // Calcular ingresos de hoy
                $stmtCitas = $pdo->prepare("SELECT metodo_pago, SUM(total_pagado) as total FROM citas WHERE fecha = ? AND estado = 'Completada' GROUP BY metodo_pago");
                $stmtCitas->execute([$fecha]);
                $ventas_citas = $stmtCitas->fetchAll(PDO::FETCH_ASSOC);
                
                $ingresos = ['Efectivo' => 0, 'Transferencia' => 0, 'Tarjeta' => 0, 'Otro' => 0, 'Total' => 0];
                foreach ($ventas_citas as $v) {
                    $mp = $v['metodo_pago'] ?? 'Efectivo';
                    if (isset($ingresos[$mp])) {
                        $ingresos[$mp] += floatval($v['total']);
                    } else {
                        $ingresos['Otro'] += floatval($v['total']);
                    }
                    $ingresos['Total'] += floatval($v['total']);
                }
                
                try {
                    $stmtPed = $pdo->prepare("SELECT IFNULL(metodo_pago, 'Efectivo') as metodo_pago, SUM(total) as total FROM pedidos WHERE DATE(fecha_creacion) = ? AND estado IN ('Pagado', 'Entregado') GROUP BY metodo_pago");
                    $stmtPed->execute([$fecha]);
                    $ventas_pedidos = $stmtPed->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($ventas_pedidos as $vp) {
                        $m = $vp['metodo_pago'] ?: 'Efectivo';
                        $tot = floatval($vp['total'] ?? 0);
                        if (isset($ingresos[$m])) {
                            $ingresos[$m] += $tot;
                        } else {
                            $ingresos['Otro'] += $tot;
                        }
                        $ingresos['Total'] += $tot;
                    }
                } catch (\Exception $e) {
                    $stmtPed = $pdo->prepare("SELECT SUM(total) FROM pedidos WHERE DATE(fecha_creacion) = ? AND estado IN ('Pagado', 'Entregado')");
                    $stmtPed->execute([$fecha]);
                    $pedidos_tot = floatval($stmtPed->fetchColumn() ?: 0);
                    $ingresos['Efectivo'] += $pedidos_tot;
                    $ingresos['Total'] += $pedidos_tot;
                }
                
                echo json_encode([
                    'estado' => $caja['cerrado_por_admin'] ? 'cerrada' : 'abierta',
                    'efectivo_inicial' => $caja['efectivo_inicial'],
                    'porcentaje_barbero' => floatval($caja['porcentaje_barbero'] ?? 60),
                    'porcentaje_tienda' => floatval($caja['porcentaje_tienda'] ?? 40),
                    'ingresos' => $ingresos
                ]);
            }
            break;

        case 'get_ventas_caja_hoy':
            $fecha = $pdo->query("SELECT CURDATE()")->fetchColumn();
            $ventas = [];

            // 1. Citas completadas / cobradas hoy
            $stmtCitas = $pdo->prepare("
                SELECT c.id, c.fecha, c.hora, c.estado, c.descuento, c.total_pagado,
                       IFNULL(c.metodo_pago, 'Efectivo') as metodo_pago,
                       cl.id as cliente_id, cl.nombre as cliente, cl.rut as cliente_rut, cl.telefono as cliente_telefono,
                       t.id as trabajador_id, t.nombre as barbero,
                       (SELECT GROUP_CONCAT(s.nombre SEPARATOR ', ') FROM cita_detalle cd JOIN servicios s ON cd.servicio_id = s.id WHERE cd.cita_id = c.id) as servicios_nombres,
                       COALESCE((SELECT SUM(precio_cobrado) FROM cita_detalle cd WHERE cd.cita_id = c.id), c.total_pagado, 0) as subtotal
                FROM citas c
                LEFT JOIN clientes cl ON c.cliente_id = cl.id
                LEFT JOIN trabajadores t ON c.trabajador_id = t.id
                WHERE c.fecha = ? AND c.estado = 'Completada'
                ORDER BY c.hora DESC
            ");
            $stmtCitas->execute([$fecha]);
            $citasList = $stmtCitas->fetchAll(PDO::FETCH_ASSOC);

            // Obtener detalles de servicios de cada cita para la boleta
            $stmtCitaDet = $pdo->prepare("
                SELECT cd.precio_cobrado as precio, s.nombre, 1 as cantidad 
                FROM cita_detalle cd 
                JOIN servicios s ON cd.servicio_id = s.id 
                WHERE cd.cita_id = ?
            ");

            foreach ($citasList as $c) {
                $stmtCitaDet->execute([$c['id']]);
                $itemsDet = $stmtCitaDet->fetchAll(PDO::FETCH_ASSOC);
                if (empty($itemsDet)) {
                    $sub = floatval($c['subtotal'] ?: $c['total_pagado']);
                    $itemsDet = [[
                        'nombre' => $c['servicios_nombres'] ?: 'Corte / Servicio de Barbería',
                        'cantidad' => 1,
                        'precio' => $sub,
                        'subtotal' => $sub
                    ]];
                } else {
                    foreach ($itemsDet as &$it) {
                        $it['subtotal'] = floatval($it['precio']);
                    }
                }

                $ventas[] = [
                    'tipo' => 'corte',
                    'id' => $c['id'],
                    'folio' => 'LR-CITA-' . str_pad($c['id'], 4, '0', STR_PAD_LEFT),
                    'fecha' => $c['fecha'],
                    'hora' => substr($c['hora'], 0, 5),
                    'cliente' => $c['cliente'] ?: 'Cliente General',
                    'cliente_rut' => $c['cliente_rut'] ?: '',
                    'cliente_telefono' => $c['cliente_telefono'] ?: '',
                    'barbero' => $c['barbero'] ?: 'Barbero Staff',
                    'descripcion' => $c['servicios_nombres'] ?: 'Servicio de Barbería',
                    'items' => $itemsDet,
                    'subtotal' => floatval($c['subtotal']),
                    'descuento' => floatval($c['descuento'] ?: 0),
                    'total' => floatval($c['total_pagado']),
                    'metodo_pago' => $c['metodo_pago'],
                    'estado' => $c['estado'],
                    'timestamp' => strtotime($c['fecha'] . ' ' . $c['hora'])
                ];
            }

            // 2. Pedidos / Ventas directas de productos de mostrador hoy
            $stmtPed = $pdo->prepare("
                SELECT p.id, p.total, p.estado, IFNULL(p.metodo_pago, 'Efectivo') as metodo_pago, 
                       p.fecha_creacion, DATE(p.fecha_creacion) as fecha, TIME(p.fecha_creacion) as hora,
                       COALESCE(cl.nombre, 'Cliente Mostrador') as cliente, 
                       cl.rut as cliente_rut, cl.telefono as cliente_telefono,
                       'Caja Principal' as barbero
                FROM pedidos p
                LEFT JOIN clientes cl ON p.cliente_id = cl.id
                WHERE DATE(p.fecha_creacion) = ? AND p.estado IN ('Pagado', 'Entregado')
                ORDER BY p.fecha_creacion DESC
            ");
            $stmtPed->execute([$fecha]);
            $pedidosList = $stmtPed->fetchAll(PDO::FETCH_ASSOC);

            $stmtDet = $pdo->prepare("
                SELECT pd.cantidad, pr.nombre, pd.precio_unitario as precio, (pd.cantidad * pd.precio_unitario) as subtotal
                FROM pedido_detalle pd 
                JOIN productos pr ON pd.producto_id = pr.id 
                WHERE pd.pedido_id = ?
            ");

            foreach ($pedidosList as $p) {
                $stmtDet->execute([$p['id']]);
                $itemsDet = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

                $nombresItems = [];
                $subtotalCalc = 0;
                foreach ($itemsDet as $it) {
                    $nombresItems[] = $it['cantidad'] . 'x ' . $it['nombre'];
                    $subtotalCalc += floatval($it['subtotal']);
                }

                $totalP = floatval($p['total']);
                if ($totalP <= 0 && $subtotalCalc > 0) {
                    $totalP = $subtotalCalc;
                }

                $ventas[] = [
                    'tipo' => 'producto',
                    'id' => $p['id'],
                    'folio' => 'LR-VTA-' . str_pad($p['id'], 4, '0', STR_PAD_LEFT),
                    'fecha' => $p['fecha'],
                    'hora' => substr($p['hora'], 0, 5),
                    'cliente' => $p['cliente'],
                    'cliente_rut' => $p['cliente_rut'] ?: '',
                    'cliente_telefono' => $p['cliente_telefono'] ?: '',
                    'barbero' => 'Caja Mostrador',
                    'descripcion' => !empty($nombresItems) ? implode(', ', $nombresItems) : 'Venta de Productos',
                    'items' => $itemsDet,
                    'subtotal' => $subtotalCalc > 0 ? $subtotalCalc : $totalP,
                    'descuento' => max(0, $subtotalCalc - $totalP),
                    'total' => $totalP,
                    'metodo_pago' => $p['metodo_pago'],
                    'estado' => $p['estado'],
                    'timestamp' => strtotime($p['fecha_creacion'])
                ];
            }

            // Ordenar de más reciente a más antiguo
            usort($ventas, function($a, $b) {
                return ($b['timestamp'] <=> $a['timestamp']);
            });

            echo json_encode($ventas);
            break;

        case 'get_pago_config':
            $stmt = $pdo->prepare("SELECT valor FROM configuraciones WHERE clave = 'frecuencia_pago_barberos'");
            $stmt->execute();
            $freq = $stmt->fetchColumn();
            echo json_encode([
                'frecuencia_pago_barberos' => $freq ?: 'quincenal'
            ]);
            break;

        // --- BODEGA Y TIENDA ---
        case 'get_productos':
            $stmt = $pdo->query("
                SELECT p.*, c.nombre as categoria_nombre 
                FROM productos p 
                JOIN categorias c ON p.categoria_id = c.id
                ORDER BY p.nombre ASC
            ");
            echo json_encode($stmt->fetchAll());
            break;
            
        case 'get_categorias':
            $stmt = $pdo->query("SELECT * FROM categorias ORDER BY nombre ASC");
            echo json_encode($stmt->fetchAll());
            break;
            
        case 'get_pedidos_admin':
            $stmt = $pdo->query("
                SELECT p.id, p.total, p.estado, IFNULL(p.metodo_pago, 'Efectivo') as metodo_pago, p.fecha_creacion, 
                       COALESCE(cl.nombre, 'Cliente Mostrador') as cliente, 
                       cl.rut as cliente_rut, cl.telefono as cliente_telefono, cl.email as cliente_email
                FROM pedidos p
                LEFT JOIN clientes cl ON p.cliente_id = cl.id
                ORDER BY p.fecha_creacion DESC
            ");
            $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $stmtDet = $pdo->prepare("
                SELECT pd.cantidad, pr.nombre as producto, pd.precio_unitario 
                FROM pedido_detalle pd 
                JOIN productos pr ON pd.producto_id = pr.id 
                WHERE pd.pedido_id = ?
            ");
            
            foreach ($pedidos as &$ped) {
                $stmtDet->execute([$ped['id']]);
                $ped['detalles'] = $stmtDet->fetchAll(PDO::FETCH_ASSOC);
                // Si el total estaba en 0, calcularlo de los detalles
                if (floatval($ped['total'] ?? 0) <= 0 && !empty($ped['detalles'])) {
                    $totCalc = 0;
                    foreach ($ped['detalles'] as $d) {
                        $totCalc += floatval($d['precio_unitario']) * intval($d['cantidad']);
                    }
                    if ($totCalc > 0) {
                        $ped['total'] = $totCalc;
                    }
                }
            }
            
            echo json_encode($pedidos);
            break;

        // --- EQUIPO ---
        case 'get_trabajadores':
            try {
                $stmt = $pdo->query("
                    SELECT t.id, t.nombre, t.email, t.foto_perfil, t.activo,
                    IFNULL(t.frecuencia_pago, 'quincenal') as frecuencia_pago,
                    (SELECT COUNT(*) FROM citas c WHERE c.trabajador_id = t.id AND c.fecha = CURDATE() AND c.estado = 'Completada') as cortes_hoy,
                    (SELECT COUNT(*) FROM citas c WHERE c.trabajador_id = t.id AND c.estado = 'Completada') as cortes_totales
                    FROM trabajadores t
                    ORDER BY t.activo DESC, t.nombre ASC
                ");
                echo json_encode($stmt->fetchAll());
            } catch (Exception $e) {
                $stmt = $pdo->query("
                    SELECT t.id, t.nombre, t.email, t.foto_perfil, t.activo,
                    'quincenal' as frecuencia_pago,
                    (SELECT COUNT(*) FROM citas c WHERE c.trabajador_id = t.id AND c.fecha = CURDATE() AND c.estado = 'Completada') as cortes_hoy,
                    (SELECT COUNT(*) FROM citas c WHERE c.trabajador_id = t.id AND c.estado = 'Completada') as cortes_totales
                    FROM trabajadores t
                    ORDER BY t.activo DESC, t.nombre ASC
                ");
                echo json_encode($stmt->fetchAll());
            }
            break;

        // --- SERVICIOS ---
        case 'get_servicios':
            $stmt = $pdo->query("SELECT * FROM servicios ORDER BY activo DESC, nombre ASC");
            echo json_encode($stmt->fetchAll());
            break;

        // --- LIQUIDACIÓN Y COMISIONES POR BARBERO ---
        case 'get_liquidacion_barberos':
            $fecha_inicio = !empty($_GET['inicio']) ? trim($_GET['inicio']) : date('Y-m-01');
            $fecha_fin = !empty($_GET['fin']) ? trim($_GET['fin']) : date('Y-m-t');
            $barbero_id = !empty($_GET['barbero_id']) ? trim($_GET['barbero_id']) : 'todos';

            if ($fecha_inicio > $fecha_fin) {
                $temp = $fecha_inicio;
                $fecha_inicio = $fecha_fin;
                $fecha_fin = $temp;
            }

            $totalesGenerales = [
                'total_cortes' => 0,
                'total_bruto' => 0,
                'total_descuentos' => 0,
                'total_neto' => 0,
                'total_comision_barberos' => 0,
                'total_ganancia_tienda' => 0,
                'dias_trabajados_total' => 0,
                'promedio_diario_bruto_global' => 0,
                'ticket_promedio_global' => 0,
                'total_comision_pagada' => 0,
                'total_comision_pendiente' => 0,
                'barberos_pagados_count' => 0,
                'barberos_pendientes_count' => 0,
                'dias_unicos_totales' => []
            ];
            $barberosResumen = [];

            try {
                // 1. Obtener cierres diarios del rango para porcentajes específicos de forma instantánea
                $cierresMap = [];
                try {
                    $stmtCierres = $pdo->prepare("
                        SELECT fecha, MAX(porcentaje_barbero) as porcentaje_barbero, MAX(porcentaje_tienda) as porcentaje_tienda 
                        FROM cierres_diarios 
                        WHERE fecha BETWEEN ? AND ? 
                        GROUP BY fecha
                    ");
                    $stmtCierres->execute([$fecha_inicio, $fecha_fin]);
                    $filasCierres = $stmtCierres->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($filasCierres as $cdi) {
                        $cierresMap[$cdi['fecha']] = [
                            'pct_b' => floatval($cdi['porcentaje_barbero']) > 0 ? floatval($cdi['porcentaje_barbero']) : 60.0,
                            'pct_t' => floatval($cdi['porcentaje_tienda']) > 0 ? floatval($cdi['porcentaje_tienda']) : 40.0
                        ];
                    }
                } catch (\Exception $exC) {}

                // 2. Consulta indexada de citas (filtrando por fecha y trabajador sin subconsultas por fila)
                $sql = "
                    SELECT c.id, c.fecha, c.hora, c.descuento, c.total_pagado, c.metodo_pago, c.estado, c.trabajador_id,
                           cl.id as cliente_id, IFNULL(cl.nombre, 'Cliente General') as cliente_nombre, IFNULL(cl.rut, '-') as cliente_rut,
                           t.id as barbero_id, IFNULL(t.nombre, 'Barbero') as barbero_nombre
                    FROM citas c
                    LEFT JOIN clientes cl ON c.cliente_id = cl.id
                    LEFT JOIN trabajadores t ON c.trabajador_id = t.id
                    WHERE c.fecha BETWEEN ? AND ?
                      AND (c.estado IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado', 'Confirmada', 'confirmada', 'Pendiente', 'pendiente')
                           OR c.fecha < CURDATE())
                      AND c.estado NOT IN ('cancelada', 'cancelado')
                ";
                $params = [$fecha_inicio, $fecha_fin];
                if (!empty($barbero_id) && $barbero_id !== 'todos') {
                    $sql .= " AND c.trabajador_id = ? ";
                    $params[] = $barbero_id;
                }
                $sql .= " ORDER BY t.nombre ASC, c.fecha ASC, c.hora ASC ";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // 3. Obtener detalles de servicios de forma masiva en 1 sola consulta batch
                $detallesMap = [];
                if (!empty($citas)) {
                    $citaIds = array_column($citas, 'id');
                    $chunks = array_chunk($citaIds, 500);
                    foreach ($chunks as $chunk) {
                        $placeholders = implode(',', array_fill(0, count($chunk), '?'));
                        $stmtDet = $pdo->prepare("
                            SELECT cd.cita_id, cd.precio_cobrado, s.nombre as servicio_nombre
                            FROM cita_detalle cd
                            LEFT JOIN servicios s ON cd.servicio_id = s.id
                            WHERE cd.cita_id IN ($placeholders)
                        ");
                        $stmtDet->execute($chunk);
                        $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($detalles as $d) {
                            $cid = $d['cita_id'];
                            if (!isset($detallesMap[$cid])) {
                                $detallesMap[$cid] = ['subtotal' => 0, 'nombres' => []];
                            }
                            $detallesMap[$cid]['subtotal'] += floatval($d['precio_cobrado']);
                            if (!empty($d['servicio_nombre'])) {
                                $detallesMap[$cid]['nombres'][] = $d['servicio_nombre'];
                            }
                        }
                    }
                }

                // Nombres de días en español
                $diasSemana = [
                    'Sunday' => 'Domingo', 'Monday' => 'Lunes', 'Tuesday' => 'Martes', 
                    'Wednesday' => 'Miércoles', 'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sábado'
                ];

                $barberosMap = [];

                foreach ($citas as $c) {
                    $cid = $c['id'];
                    $bId = $c['barbero_id'] ?? $c['trabajador_id'] ?? 0;
                    $bNombre = $c['barbero_nombre'] ?? 'Barbero';
                    $fecha = $c['fecha'];

                    // Subtotal calculado a partir de los detalles de servicios
                    $subtotal = 0;
                    $serviciosNombres = 'Servicio de Barbería';
                    if (isset($detallesMap[$cid])) {
                        $subtotal = floatval($detallesMap[$cid]['subtotal']);
                        if (!empty($detallesMap[$cid]['nombres'])) {
                            $serviciosNombres = implode(' + ', $detallesMap[$cid]['nombres']);
                        }
                    }

                    if ($subtotal <= 0) {
                        $subtotal = floatval($c['total_pagado'] ?? 0);
                    }
                    if ($subtotal <= 0) {
                        $subtotal = 14000;
                    }

                    $descuento = floatval($c['descuento'] ?? 0);
                    $totalReal = max(0, $subtotal - $descuento);
                    if ($totalReal <= 0 && floatval($c['total_pagado'] ?? 0) > 0) {
                        $totalReal = floatval($c['total_pagado']);
                        if ($subtotal <= 0) $subtotal = $totalReal;
                    }

                    $pctB = isset($cierresMap[$fecha]) ? $cierresMap[$fecha]['pct_b'] : 60.0;
                    $pctT = isset($cierresMap[$fecha]) ? $cierresMap[$fecha]['pct_t'] : 40.0;

                    $comisionB = $totalReal * ($pctB / 100);
                    $comisionT = $totalReal * ($pctT / 100);

                    if (!isset($barberosMap[$bId])) {
                        $barberosMap[$bId] = [
                            'barbero_id' => $bId,
                            'barbero_nombre' => $bNombre,
                            'total_cortes' => 0,
                            'total_bruto' => 0,
                            'total_descuentos' => 0,
                            'total_neto' => 0,
                            'total_comision_barbero' => 0,
                            'total_ganancia_tienda' => 0,
                            'dias_map' => [],
                            'citas' => []
                        ];
                    }

                    $barberosMap[$bId]['total_cortes']++;
                    $barberosMap[$bId]['total_bruto'] += $subtotal;
                    $barberosMap[$bId]['total_descuentos'] += $descuento;
                    $barberosMap[$bId]['total_neto'] += $totalReal;
                    $barberosMap[$bId]['total_comision_barbero'] += $comisionB;
                    $barberosMap[$bId]['total_ganancia_tienda'] += $comisionT;

                    // Agrupar día a día
                    if (!isset($barberosMap[$bId]['dias_map'][$fecha])) {
                        $dayNameEn = date('l', strtotime($fecha));
                        $barberosMap[$bId]['dias_map'][$fecha] = [
                            'fecha' => $fecha,
                            'dia_nombre' => $diasSemana[$dayNameEn] ?? $dayNameEn,
                            'cortes_dia' => 0,
                            'cortes' => 0,
                            'total_bruto_dia' => 0,
                            'bruto' => 0,
                            'descuento_dia' => 0,
                            'descuento' => 0,
                            'total_neto_dia' => 0,
                            'neto' => 0,
                            'porcentaje_barbero' => $pctB,
                            'porcentaje_tienda' => $pctT,
                            'comision_barbero_dia' => 0,
                            'comision_barbero' => 0,
                            'ganancia_tienda_dia' => 0,
                            'ganancia_tienda' => 0
                        ];
                    }

                    $barberosMap[$bId]['dias_map'][$fecha]['cortes_dia']++;
                    $barberosMap[$bId]['dias_map'][$fecha]['cortes']++;
                    $barberosMap[$bId]['dias_map'][$fecha]['total_bruto_dia'] += $subtotal;
                    $barberosMap[$bId]['dias_map'][$fecha]['bruto'] += $subtotal;
                    $barberosMap[$bId]['dias_map'][$fecha]['descuento_dia'] += $descuento;
                    $barberosMap[$bId]['dias_map'][$fecha]['descuento'] += $descuento;
                    $barberosMap[$bId]['dias_map'][$fecha]['total_neto_dia'] += $totalReal;
                    $barberosMap[$bId]['dias_map'][$fecha]['neto'] += $totalReal;
                    $barberosMap[$bId]['dias_map'][$fecha]['comision_barbero_dia'] += $comisionB;
                    $barberosMap[$bId]['dias_map'][$fecha]['comision_barbero'] += $comisionB;
                    $barberosMap[$bId]['dias_map'][$fecha]['ganancia_tienda_dia'] += $comisionT;
                    $barberosMap[$bId]['dias_map'][$fecha]['ganancia_tienda'] += $comisionT;

                    // Cita individual
                    $c['subtotal'] = $subtotal;
                    $c['servicios_nombres'] = $serviciosNombres;
                    $c['porcentaje_barbero'] = $pctB;
                    $c['porcentaje_tienda'] = $pctT;
                    $c['descuento'] = $descuento;
                    $c['total_neto'] = $totalReal;
                    $c['comision_barbero'] = $comisionB;
                    $c['comision_tienda'] = $comisionT;
                    $barberosMap[$bId]['citas'][] = $c;

                    // Totales generales
                    $totalesGenerales['total_cortes']++;
                    $totalesGenerales['total_bruto'] += $subtotal;
                    $totalesGenerales['total_descuentos'] += $descuento;
                    $totalesGenerales['total_neto'] += $totalReal;
                    $totalesGenerales['total_comision_barberos'] += $comisionB;
                    $totalesGenerales['total_ganancia_tienda'] += $comisionT;
                    $totalesGenerales['dias_unicos_totales'][$fecha] = true;
                }

                // Consultar pagos registrados para este período exacto
                $pagosMap = [];
                try {
                    $stmtPagos = $pdo->prepare("
                        SELECT * FROM pagos_trabajadores 
                        WHERE periodo_inicio = ? AND periodo_fin = ?
                    ");
                    $stmtPagos->execute([$fecha_inicio, $fecha_fin]);
                    $pagosRegistrados = $stmtPagos->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($pagosRegistrados as $p) {
                        $pagosMap[$p['trabajador_id']] = $p;
                    }
                } catch (\Exception $exPagos) {}

                $totalMontoPagado = 0;
                $barberosPagadosCount = 0;

                // Formatear resumen por barbero y calcular promedios
                foreach ($barberosMap as $b) {
                    $diasTrabajados = count($b['dias_map']);
                    $totalCortes = $b['total_cortes'];
                    $totalBruto = $b['total_bruto'];
                    $totalComision = $b['total_comision_barbero'];

                    $promDiarioBruto = $diasTrabajados > 0 ? round($totalBruto / $diasTrabajados) : 0;
                    $promDiarioComision = $diasTrabajados > 0 ? round($totalComision / $diasTrabajados) : 0;
                    $promCortesDia = $diasTrabajados > 0 ? round($totalCortes / $diasTrabajados, 1) : 0;
                    $ticketPromedio = $totalCortes > 0 ? round($totalBruto / $totalCortes) : 0;

                    // Convertir mapa de días a lista ordenada por fecha
                    $detalleDias = array_values($b['dias_map']);
                    usort($detalleDias, function($a, $b) {
                        return strcmp($a['fecha'], $b['fecha']);
                    });

                    $pagoInfo = $pagosMap[$b['barbero_id']] ?? null;
                    $estadoPago = $pagoInfo ? 'Pagado' : 'Pendiente';
                    if ($pagoInfo) {
                        $totalMontoPagado += floatval($pagoInfo['monto']);
                        $barberosPagadosCount++;
                    }

                    $barberosResumen[] = [
                        'barbero_id' => $b['barbero_id'],
                        'barbero_nombre' => $b['barbero_nombre'],
                        'dias_trabajados' => $diasTrabajados,
                        'total_cortes' => $totalCortes,
                        'total_bruto' => $totalBruto,
                        'total_descuentos' => $b['total_descuentos'],
                        'total_neto' => $b['total_neto'],
                        'total_comision_barbero' => $totalComision,
                        'total_ganancia_tienda' => $b['total_ganancia_tienda'],
                        'promedio_diario_bruto' => $promDiarioBruto,
                        'promedio_diario_comision' => $promDiarioComision,
                        'promedio_cortes_dia' => $promCortesDia,
                        'ticket_promedio' => $ticketPromedio,
                        'estado_pago' => $estadoPago,
                        'pago_info' => $pagoInfo,
                        'detalle_dias' => $detalleDias,
                        'citas' => $b['citas']
                    ];
                }

                $cantDiasUnicos = count($totalesGenerales['dias_unicos_totales']);
                $totalesGenerales['dias_trabajados_total'] = $cantDiasUnicos;
                $totalesGenerales['promedio_diario_bruto_global'] = $cantDiasUnicos > 0 ? round($totalesGenerales['total_bruto'] / $cantDiasUnicos) : 0;
                $totalesGenerales['ticket_promedio_global'] = $totalesGenerales['total_cortes'] > 0 ? round($totalesGenerales['total_bruto'] / $totalesGenerales['total_cortes']) : 0;
                $totalesGenerales['total_comision_pagada'] = $totalMontoPagado;
                $totalesGenerales['total_comision_pendiente'] = max(0, $totalesGenerales['total_comision_barberos'] - $totalMontoPagado);
                $totalesGenerales['barberos_pagados_count'] = $barberosPagadosCount;
                $totalesGenerales['barberos_pendientes_count'] = count($barberosResumen) - $barberosPagadosCount;
            } catch (\Exception $ex) {
                // Fallback silencioso con estructura válida
            }
            unset($totalesGenerales['dias_unicos_totales']);

            echo json_encode([
                'rango' => [
                    'inicio' => $fecha_inicio,
                    'fin' => $fecha_fin
                ],
                'totales_generales' => $totalesGenerales,
                'barberos' => $barberosResumen
            ]);
            break;

        case 'get_historial_pagos_trabajadores':
            $trabajador_id = $_GET['trabajador_id'] ?? 'todos';
            $sql = "
                SELECT p.*, t.nombre as barbero_nombre, t.email as barbero_email 
                FROM pagos_trabajadores p
                JOIN trabajadores t ON p.trabajador_id = t.id
            ";
            if ($trabajador_id !== 'todos' && is_numeric($trabajador_id)) {
                $stmt = $pdo->prepare($sql . " WHERE p.trabajador_id = ? ORDER BY p.fecha_pago DESC, p.id DESC");
                $stmt->execute([$trabajador_id]);
            } else {
                $stmt = $pdo->prepare($sql . " ORDER BY p.fecha_pago DESC, p.id DESC");
                $stmt->execute();
            }
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        // --- EXPORTAR ---
        case 'exportar_excel_barberos':
            $fecha_inicio = $_GET['inicio'] ?? date('Y-m-01');
            $fecha_fin = $_GET['fin'] ?? date('Y-m-t');
            $stmt = $pdo->prepare("
                SELECT c.id, c.fecha, c.hora, c.descuento, c.total_pagado, c.metodo_pago, cl.nombre as cliente, t.nombre as barbero,
                COALESCE((SELECT SUM(precio_cobrado) FROM cita_detalle cd WHERE cd.cita_id = c.id), c.total_pagado, 14000) as subtotal,
                IFNULL((SELECT GROUP_CONCAT(s.nombre SEPARATOR ' + ') FROM cita_detalle cd JOIN servicios s ON cd.servicio_id = s.id WHERE cd.cita_id = c.id), 'Servicio de Barbería') as servicios_nombres,
                IFNULL(NULLIF(cdi.porcentaje_barbero, 0), 60.00) as porcentaje_barbero,
                IFNULL(NULLIF(cdi.porcentaje_tienda, 0), 40.00) as porcentaje_tienda
                FROM citas c
                JOIN clientes cl ON c.cliente_id = cl.id
                JOIN trabajadores t ON c.trabajador_id = t.id
                LEFT JOIN (
                    SELECT fecha, MAX(porcentaje_barbero) as porcentaje_barbero, MAX(porcentaje_tienda) as porcentaje_tienda 
                    FROM cierres_diarios GROUP BY fecha
                ) cdi ON c.fecha = cdi.fecha
                WHERE (LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado')
                       OR (c.fecha < CURDATE() AND LOWER(c.estado) NOT IN ('cancelada', 'cancelado')))
                  AND c.fecha BETWEEN ? AND ?
                ORDER BY t.nombre, c.fecha, c.hora
            ");
            $stmt->execute([$fecha_inicio, $fecha_fin]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $agrupado = [];
            foreach ($results as $row) {
                $barbero = $row['barbero'];
                if (!isset($agrupado[$barbero])) $agrupado[$barbero] = [];
                $agrupado[$barbero][] = $row;
            }
            echo json_encode($agrupado);
            break;

        case 'get_historial_cliente':
            $cliente_id = intval($_GET['cliente_id'] ?? 0);
            
            // Citas pasadas (historial completo)
            $stmtCitas = $pdo->prepare("
                SELECT c.id, c.fecha, c.hora, c.estado, t.nombre as barbero, c.decant_entregado, c.total_pagado,
                (SELECT GROUP_CONCAT(s.nombre SEPARATOR ', ') FROM cita_detalle cd JOIN servicios s ON cd.servicio_id = s.id WHERE cd.cita_id = c.id) as servicios
                FROM citas c
                JOIN trabajadores t ON c.trabajador_id = t.id
                WHERE c.cliente_id = ? AND c.estado IN ('Completada', 'Cancelada', 'Terminado_Esperando_Pago')
                ORDER BY c.fecha DESC, c.hora DESC
            ");
            $stmtCitas->execute([$cliente_id]);
            $citas = $stmtCitas->fetchAll();
            
            // Recompensas y Regalos (de historial_recompensas y citas con decant)
            $stmtRec = $pdo->prepare("
                SELECT aroma_decant, fecha_entrega, 'Premio / Regalo VIP' as tipo
                FROM historial_recompensas 
                WHERE cliente_id = ?
                UNION ALL
                SELECT decant_entregado as aroma_decant, CONCAT(fecha, ' ', hora) as fecha_entrega, 'Decant Entregado en Cita' as tipo
                FROM citas 
                WHERE cliente_id = ? AND decant_entregado IS NOT NULL AND decant_entregado != ''
                ORDER BY fecha_entrega DESC
            ");
            $stmtRec->execute([$cliente_id, $cliente_id]);
            $recompensas = $stmtRec->fetchAll();
            
            // Cortes este mes
            $mes_actual = date('Y-m-01');
            $stmtMes = $pdo->prepare("SELECT COUNT(*) FROM citas WHERE cliente_id = ? AND fecha >= ? AND estado = 'Completada'");
            $stmtMes->execute([$cliente_id, $mes_actual]);
            $cortes_mes = $stmtMes->fetchColumn();

            echo json_encode([
                "citas" => $citas,
                "recompensas" => $recompensas,
                "cortes_mes" => intval($cortes_mes ?: 0)
            ]);
            break;

        default:
            echo json_encode(["error" => "Invalid action GET"]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'upload_image') {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0777, true);
        }

        $type = $_POST['type'] ?? $_GET['type'] ?? 'producto';
        $prefix = ($type === 'barbero') ? 'barbero_' : 'prod_';

        // 1. Manejo de subida estándar por multipart/form-data
        $fileKey = isset($_FILES['image']) ? 'image' : (isset($_FILES['foto']) ? 'foto' : (isset($_FILES['file']) ? 'file' : null));

        if ($fileKey && isset($_FILES[$fileKey]['tmp_name']) && is_uploaded_file($_FILES[$fileKey]['tmp_name'])) {
            $file = $_FILES[$fileKey];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
            if (!in_array($ext, $allowed)) {
                $ext = 'jpg';
            }
            $filename = $prefix . uniqid() . '_' . time() . '.' . $ext;
            $targetPath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                echo json_encode([
                    'status' => 'success',
                    'url' => '/backend/uploads/' . $filename,
                    'filename' => $filename
                ]);
                exit;
            } else {
                echo json_encode([
                    'status' => 'error',
                    'error' => 'No se pudo mover el archivo al directorio de destino: ' . $targetPath
                ]);
                exit;
            }
        }

        // 2. Manejo de subida por Base64 JSON
        $rawInput = file_get_contents("php://input");
        $jsonInput = json_decode($rawInput, true);
        $base64Data = $_POST['base64'] ?? ($jsonInput['base64'] ?? ($jsonInput['image'] ?? null));

        if ($base64Data && preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
            $ext = strtolower($matches[1]);
            $base64Clean = substr($base64Data, strpos($base64Data, ',') + 1);
            $decoded = base64_decode($base64Clean);
            if ($decoded !== false) {
                $filename = $prefix . uniqid() . '_' . time() . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
                $targetPath = $uploadDir . $filename;
                if (file_put_contents($targetPath, $decoded) !== false) {
                    echo json_encode([
                        'status' => 'success',
                        'url' => '/backend/uploads/' . $filename,
                        'filename' => $filename
                    ]);
                    exit;
                }
            }
        }

        echo json_encode(['status' => 'error', 'error' => 'No se recibió ningún archivo de imagen válido']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    switch ($action) {
        // --- CRM Y CAJA ---
        case 'crear_cliente':
            try {
                // Asegurar columnas en clientes si la BD no las tenía
                try {
                    $pdo->exec("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cortes_acumulados INT DEFAULT 0");
                } catch (\Exception $e) {}
                try {
                    $pdo->exec("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS notas_crm TEXT NULL");
                } catch (\Exception $e) {}
                try {
                    $pdo->exec("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL");
                } catch (\Exception $e) {}

                $rut = trim($data['rut'] ?? '');
                $nombre = trim($data['nombre'] ?? '');
                $email = !empty($data['email']) ? trim($data['email']) : null;
                $telefono = !empty($data['telefono']) ? trim($data['telefono']) : null;
                $notas_crm = !empty($data['notas_crm']) ? trim($data['notas_crm']) : null;
                $cortes = max(0, intval($data['cortes_acumulados'] ?? 0));
                $password = !empty($data['password']) ? trim($data['password']) : '123456';

                if (empty($rut) || empty($nombre)) {
                    echo json_encode(["status" => "error", "message" => "RUT y Nombre son campos obligatorios."]);
                    break;
                }

                $rutClean = strtoupper(preg_replace('/[^0-9K]/i', '', $rut));

                // Validar si el RUT ya existe
                $stmtCheck = $pdo->prepare("SELECT id, nombre, cortes_acumulados FROM clientes WHERE REPLACE(REPLACE(UPPER(rut), '.', ''), '-', '') = ? OR UPPER(rut) = ?");
                $stmtCheck->execute([$rutClean, strtoupper($rut)]);
                $existente = $stmtCheck->fetch();

                if ($existente) {
                    // Si el cliente ya existe, actualizamos su información y asignamos sus cortes
                    $stmtUpd = $pdo->prepare("
                        UPDATE clientes 
                        SET nombre = ?, email = COALESCE(?, email), telefono = COALESCE(?, telefono), cortes_acumulados = ?, notas_crm = COALESCE(?, notas_crm) 
                        WHERE id = ?
                    ");
                    $stmtUpd->execute([$nombre, $email, $telefono, $cortes, $notas_crm, $existente['id']]);

                    echo json_encode([
                        "status" => "success", 
                        "message" => "Cliente (" . $existente['nombre'] . ") actualizado con éxito con " . $cortes . " cortes.",
                        "cliente" => [
                            "id" => $existente['id'],
                            "rut" => $rut,
                            "nombre" => $nombre,
                            "email" => $email,
                            "telefono" => $telefono,
                            "cortes_acumulados" => $cortes,
                            "notas_crm" => $notas_crm
                        ]
                    ]);
                    break;
                }

                // Si el email ya está en uso por otro cliente, evitar colisión UNIQUE
                if ($email !== null) {
                    $stmtMail = $pdo->prepare("SELECT id FROM clientes WHERE email = ?");
                    $stmtMail->execute([$email]);
                    if ($stmtMail->fetch()) {
                        $email = "cliente_" . $rutClean . "@laromana.cl";
                    }
                }

                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("
                    INSERT INTO clientes (rut, nombre, email, telefono, cortes_acumulados, notas_crm, password_hash) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$rut, $nombre, $email, $telefono, $cortes, $notas_crm, $hash]);
                $newId = $pdo->lastInsertId();

                echo json_encode([
                    "status" => "success", 
                    "message" => "Cliente creado exitosamente con " . $cortes . " cortes en el CRM.",
                    "cliente" => [
                        "id" => $newId,
                        "rut" => $rut,
                        "nombre" => $nombre,
                        "email" => $email,
                        "telefono" => $telefono,
                        "cortes_acumulados" => $cortes,
                        "notas_crm" => $notas_crm
                    ]
                ]);
            } catch (\Exception $e) {
                http_response_code(200);
                echo json_encode(["status" => "error", "message" => "Error guardando cliente: " . $e->getMessage()]);
            }
            break;

        case 'actualizar_cliente':
            try {
                $cliente_id = intval($data['id'] ?? $data['cliente_id'] ?? 0);
                $rut = trim($data['rut'] ?? '');
                $nombre = trim($data['nombre'] ?? '');
                $email = !empty($data['email']) ? trim($data['email']) : null;
                $telefono = !empty($data['telefono']) ? trim($data['telefono']) : null;
                $notas_crm = !empty($data['notas_crm']) ? trim($data['notas_crm']) : null;
                $cortes = max(0, intval($data['cortes_acumulados'] ?? 0));

                if (!$cliente_id || empty($nombre)) {
                    echo json_encode(["status" => "error", "message" => "ID y Nombre son obligatorios."]);
                    break;
                }

                $stmt = $pdo->prepare("
                    UPDATE clientes 
                    SET rut = COALESCE(NULLIF(?, ''), rut),
                        nombre = ?,
                        email = ?,
                        telefono = ?,
                        cortes_acumulados = ?,
                        notas_crm = ?
                    WHERE id = ?
                ");
                $stmt->execute([$rut, $nombre, $email, $telefono, $cortes, $notas_crm, $cliente_id]);

                echo json_encode(["status" => "success", "message" => "Ficha y cortes del cliente actualizados con éxito."]);
            } catch (\Exception $e) {
                http_response_code(200);
                echo json_encode(["status" => "error", "message" => "Error actualizando cliente: " . $e->getMessage()]);
            }
            break;

        case 'eliminar_cliente':
            try {
                $cliente_id = intval($data['cliente_id'] ?? ($_POST['cliente_id'] ?? ($_GET['cliente_id'] ?? 0)));
                if (!$cliente_id) {
                    echo json_encode(["status" => "error", "message" => "ID de cliente no especificado."]);
                    break;
                }

                // Obtener nombre del cliente antes de eliminar
                $stCli = $pdo->prepare("SELECT nombre FROM clientes WHERE id = ?");
                $stCli->execute([$cliente_id]);
                $clienteNombre = $stCli->fetchColumn() ?: "Cliente #$cliente_id";

                $pdo->beginTransaction();

                // 1. Eliminar o desvincular detalles de pedidos si existen
                try {
                    $pdo->prepare("DELETE FROM pedido_detalle WHERE pedido_id IN (SELECT id FROM pedidos WHERE cliente_id = ?)")->execute([$cliente_id]);
                } catch (\Exception $e) {}

                // 2. Eliminar pedidos asociados al cliente
                try {
                    $pdo->prepare("DELETE FROM pedidos WHERE cliente_id = ?")->execute([$cliente_id]);
                } catch (\Exception $e) {}

                // 3. Eliminar detalles de citas asociados
                try {
                    $pdo->prepare("DELETE FROM cita_detalle WHERE cita_id IN (SELECT id FROM citas WHERE cliente_id = ?)")->execute([$cliente_id]);
                } catch (\Exception $e) {}

                // 4. Eliminar citas asociadas
                try {
                    $pdo->prepare("DELETE FROM citas WHERE cliente_id = ?")->execute([$cliente_id]);
                } catch (\Exception $e) {}

                // 5. Eliminar historial de recompensas
                try {
                    $pdo->prepare("DELETE FROM historial_recompensas WHERE cliente_id = ?")->execute([$cliente_id]);
                } catch (\Exception $e) {}

                // 6. Eliminar el cliente
                $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = ?");
                $stmt->execute([$cliente_id]);

                $pdo->commit();

                echo json_encode([
                    "status" => "success", 
                    "message" => "Cliente \"$clienteNombre\" eliminado correctamente del sistema.",
                    "cliente_id" => $cliente_id
                ]);
            } catch (\Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                http_response_code(200);
                echo json_encode(["status" => "error", "message" => "Error al eliminar cliente: " . $e->getMessage()]);
            }
            break;

        case 'ajustar_cortes_cliente':
            try {
                $cliente_id = intval($data['cliente_id'] ?? ($_POST['cliente_id'] ?? ($_GET['cliente_id'] ?? 0)));
                $delta = intval($data['delta'] ?? ($_POST['delta'] ?? 0));
                $cortes_exacto = isset($data['cortes_acumulados']) ? intval($data['cortes_acumulados']) : (isset($_POST['cortes_acumulados']) ? intval($_POST['cortes_acumulados']) : null);

                if (!$cliente_id) {
                    echo json_encode(["status" => "error", "message" => "Cliente no especificado."]);
                    break;
                }

                if ($cortes_exacto !== null) {
                    $stmt = $pdo->prepare("UPDATE clientes SET cortes_acumulados = ? WHERE id = ?");
                    $stmt->execute([max(0, $cortes_exacto), $cliente_id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE clientes SET cortes_acumulados = GREATEST(0, cortes_acumulados + ?) WHERE id = ?");
                    $stmt->execute([$delta, $cliente_id]);
                }

                $sCli = $pdo->prepare("SELECT nombre, cortes_acumulados FROM clientes WHERE id = ?");
                $sCli->execute([$cliente_id]);
                $cliRow = $sCli->fetch(PDO::FETCH_ASSOC);
                $nuevosCortes = intval($cliRow['cortes_acumulados'] ?? 0);
                $cliNombre = $cliRow['nombre'] ?? 'Cliente';

                $msg = $delta > 0 ? "+1 corte sumado a $cliNombre (Total: $nuevosCortes)" : ($delta < 0 ? "-1 corte restado a $cliNombre (Total: $nuevosCortes)" : "Cortes actualizados: $nuevosCortes");

                echo json_encode([
                    "status" => "success", 
                    "message" => $msg, 
                    "cortes_acumulados" => $nuevosCortes,
                    "cliente_id" => $cliente_id,
                    "nombre" => $cliNombre
                ]);
            } catch (\Exception $e) {
                http_response_code(200);
                echo json_encode(["status" => "error", "message" => "Error ajustando cortes: " . $e->getMessage()]);
            }
            break;

        case 'guardar_notas_crm':
            $stmt = $pdo->prepare("UPDATE clientes SET notas_crm = ? WHERE id = ?");
            $stmt->execute([$data['notas_crm'] ?? '', $data['cliente_id'] ?? 0]);
            echo json_encode(["status" => "success"]);
            break;

        case 'set_crm_config':
            $meta = max(1, intval($data['meta_cortes_premio'] ?? 3));
            $stmt = $pdo->prepare("
                INSERT INTO configuraciones (clave, valor, descripcion) 
                VALUES ('meta_cortes_premio', ?, 'Cantidad de cortes requeridos para ganar premio')
                ON DUPLICATE KEY UPDATE valor = ?
            ");
            $stmt->execute([$meta, $meta]);
            echo json_encode(["status" => "success", "message" => "Meta de cortes para regalo actualizada a $meta cortes.", "meta_cortes_premio" => $meta]);
            break;

        case 'entregar_premio_crm':
            try {
                // Asegurar existencia de tablas si no existieran
                try {
                    $pdo->exec("CREATE TABLE IF NOT EXISTS historial_recompensas (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        cliente_id INT NOT NULL,
                        cita_id INT DEFAULT NULL,
                        aroma_decant VARCHAR(255) NOT NULL,
                        fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_cliente (cliente_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                } catch (\Exception $eTable) {}

                try {
                    $pdo->exec("CREATE TABLE IF NOT EXISTS configuraciones (
                        clave VARCHAR(50) PRIMARY KEY,
                        valor TEXT NOT NULL,
                        descripcion VARCHAR(255) DEFAULT NULL,
                        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                } catch (\Exception $eConf) {}

                $cliente_id = intval($data['cliente_id'] ?? 0);
                $producto_id = intval($data['producto_id'] ?? 0);
                $premio_personalizado = trim($data['premio_personalizado'] ?? ($data['aroma_decant'] ?? ($data['nombre_regalo'] ?? '')));
                
                if (!$cliente_id) {
                    echo json_encode(["status" => "error", "message" => "Cliente no especificado."]);
                    break;
                }

                $prodNombre = null;
                if ($producto_id > 0) {
                    $sProd = $pdo->prepare("SELECT nombre, stock FROM productos WHERE id = ?");
                    $sProd->execute([$producto_id]);
                    $prod = $sProd->fetch();
                    if ($prod) {
                        $prodNombre = $prod['nombre'];
                        if (intval($prod['stock']) > 0) {
                            $pdo->prepare("UPDATE productos SET stock = GREATEST(0, stock - 1) WHERE id = ?")->execute([$producto_id]);
                        }
                    }
                }
                
                if (!$prodNombre && !empty($premio_personalizado)) {
                    $prodNombre = $premio_personalizado;
                    // Descontar de bodega si coincide
                    try {
                        $sMatch = $pdo->prepare("SELECT id, stock FROM productos WHERE LOWER(nombre) = LOWER(?) OR nombre LIKE ? LIMIT 1");
                        $sMatch->execute([$prodNombre, "%$prodNombre%"]);
                        $prodMatch = $sMatch->fetch();
                        if ($prodMatch && intval($prodMatch['stock']) > 0) {
                            $pdo->prepare("UPDATE productos SET stock = GREATEST(0, stock - 1) WHERE id = ?")->execute([$prodMatch['id']]);
                        }
                    } catch (\Exception $eStock) {}
                }

                if ($prodNombre) {
                    // Registrar en historial_recompensas
                    $pdo->prepare("INSERT INTO historial_recompensas (cliente_id, cita_id, aroma_decant, fecha_entrega) VALUES (?, NULL, ?, NOW())")
                        ->execute([$cliente_id, $prodNombre]);

                    // Descontar meta de cortes acumulados del cliente
                    $meta = 3;
                    try {
                        $stmtMeta = $pdo->query("SELECT valor FROM configuraciones WHERE clave = 'meta_cortes_premio'");
                        $metaVal = $stmtMeta ? $stmtMeta->fetchColumn() : 3;
                        if ($metaVal) $meta = intval($metaVal);
                    } catch (\Exception $eM) {}

                    $pdo->prepare("UPDATE clientes SET cortes_acumulados = GREATEST(0, COALESCE(cortes_acumulados, 0) - ?) WHERE id = ?")->execute([$meta, $cliente_id]);

                    echo json_encode([
                        "status" => "success", 
                        "message" => "¡Regalo entregado con éxito: " . $prodNombre . "!",
                        "regalo" => $prodNombre
                    ]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Debes seleccionar un Decant, un producto de bodega o escribir el detalle del regalo."]);
                }
            } catch (\Exception $e) {
                echo json_encode(["status" => "error", "message" => "Error al entregar premio: " . $e->getMessage()]);
            }
            break;
            
        case 'configurar_comisiones_dia':
            $fecha = $data['fecha'] ?? date('Y-m-d');
            $pct_b = $data['porcentaje_barbero'] ?? 60;
            $pct_t = $data['porcentaje_tienda'] ?? 40;
            $stmt = $pdo->prepare("SELECT id FROM cierres_diarios WHERE fecha = ?");
            $stmt->execute([$fecha]);
            if ($stmt->fetchColumn()) {
                $pdo->prepare("UPDATE cierres_diarios SET porcentaje_barbero=?, porcentaje_tienda=? WHERE fecha=?")->execute([$pct_b, $pct_t, $fecha]);
            } else {
                $pdo->prepare("INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda) VALUES (?,?,?)")->execute([$fecha, $pct_b, $pct_t]);
            }
            echo json_encode(["status" => "success"]);
            break;

        // --- CAJA ---
        case 'abrir_caja':
            $fecha = $pdo->query("SELECT CURDATE()")->fetchColumn();
            $efectivo_inicial = $data['efectivo_inicial'] ?? 0;
            
            $stmt = $pdo->prepare("SELECT id FROM cierres_diarios WHERE fecha = ?");
            $stmt->execute([$fecha]);
            if (!$stmt->fetchColumn()) {
                $pdo->prepare("INSERT INTO cierres_diarios (fecha, efectivo_inicial, cerrado_por_admin) VALUES (?, ?, 0)")
                    ->execute([$fecha, $efectivo_inicial]);
                echo json_encode(['status' => 'success']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Caja ya existe']);
            }
            break;
            
        case 'cerrar_caja':
            $fecha = $pdo->query("SELECT CURDATE()")->fetchColumn();
            $total_ingresos = $data['total_ingresos'] ?? 0;
            
            $pdo->prepare("UPDATE cierres_diarios SET cerrado_por_admin = 1, total_ingresos = ? WHERE fecha = ?")
                ->execute([$total_ingresos, $fecha]);
            echo json_encode(['status' => 'success']);
            break;

        case 'reabrir_caja':
            $fecha = $pdo->query("SELECT CURDATE()")->fetchColumn();
            $pdo->prepare("UPDATE cierres_diarios SET cerrado_por_admin = 0 WHERE fecha = ?")->execute([$fecha]);
            echo json_encode(['status' => 'success']);
            break;

        case 'set_pago_config':
            $freq = in_array($data['frecuencia_pago_barberos'] ?? '', ['semanal', 'quincenal', 'mensual']) ? $data['frecuencia_pago_barberos'] : 'quincenal';
            $stmt = $pdo->prepare("
                INSERT INTO configuraciones (clave, valor, descripcion) 
                VALUES ('frecuencia_pago_barberos', ?, 'Frecuencia de pago predeterminada para barberos')
                ON DUPLICATE KEY UPDATE valor = ?
            ");
            $stmt->execute([$freq, $freq]);
            echo json_encode(["status" => "success", "frecuencia_pago_barberos" => $freq]);
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

            // 1. Identificar o Crear Cliente si no existe
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
                // Cliente Mostrador
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

            // Asegurar columnas requeridas en pedidos antes de iniciar transaccion
            try {
                $pdo->exec("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'Efectivo'");
            } catch (\Exception $e) {}

            try {
                $pdo->beginTransaction();

                // 2. Insertar en pedidos
                $stmtPed = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, estado, metodo_pago, fecha_creacion) VALUES (?, ?, ?, ?, NOW())");
                $stmtPed->execute([$cliente_id, $total, $estado, $metodo_pago]);
                $pedido_id = $pdo->lastInsertId();

                // 3. Insertar detalles y descontar stock en bodega
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

        // --- BODEGA ---
        case 'add_producto':
            $stmt = $pdo->prepare("INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, imagen_url) VALUES (?,?,?,?,?,?)");
            $stmt->execute([$data['categoria_id'], $data['nombre'], $data['descripcion']??'', $data['precio'], $data['stock'], $data['imagen_url']??'']);
            echo json_encode(["status" => "success"]);
            break;
        case 'update_producto':
            $stmt = $pdo->prepare("UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, stock=?, imagen_url=? WHERE id=?");
            $stmt->execute([$data['categoria_id'], $data['nombre'], $data['descripcion']??'', $data['precio'], $data['stock'], $data['imagen_url']??'', $data['id']]);
            echo json_encode(["status" => "success"]);
            break;
        case 'delete_producto':
            $pdo->prepare("DELETE FROM productos WHERE id=?")->execute([$data['id']]);
            echo json_encode(["status" => "success"]);
            break;
        case 'update_pedido_estado':
            $nuevoEstado = $data['estado'] ?? 'Pendiente';
            $pedidoId = (int)($data['id'] ?? 0);

            if ($pedidoId <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID de pedido inválido"]);
                break;
            }

            try {
                $stmt = $pdo->prepare("UPDATE pedidos SET estado=? WHERE id=?");
                $stmt->execute([$nuevoEstado, $pedidoId]);
                echo json_encode(["status" => "success", "id" => $pedidoId, "estado" => $nuevoEstado]);
            } catch (\PDOException $e) {
                try {
                    $pdo->exec("ALTER TABLE pedidos MODIFY COLUMN estado VARCHAR(50) DEFAULT 'Pendiente'");
                    $stmt = $pdo->prepare("UPDATE pedidos SET estado=? WHERE id=?");
                    $stmt->execute([$nuevoEstado, $pedidoId]);
                    echo json_encode(["status" => "success", "id" => $pedidoId, "estado" => $nuevoEstado]);
                } catch (\Exception $ex) {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => $ex->getMessage()]);
                }
            }
            break;

        // --- EQUIPO ---
        case 'add_trabajador':
            $pass = !empty($data['password']) ? trim($data['password']) : '123456';
            $hash = password_hash($pass, PASSWORD_DEFAULT);
            $frecuencia = in_array($data['frecuencia_pago'] ?? '', ['semanal', 'quincenal', 'mensual']) ? $data['frecuencia_pago'] : 'quincenal';
            try {
                $stmt = $pdo->prepare("INSERT INTO trabajadores (nombre, email, foto_perfil, password_hash, frecuencia_pago) VALUES (?,?,?,?,?)");
                $stmt->execute([$data['nombre'], $data['email'], $data['foto_perfil']??'', $hash, $frecuencia]);
            } catch (\PDOException $e) {
                try {
                    $pdo->exec("ALTER TABLE trabajadores ADD COLUMN IF NOT EXISTS frecuencia_pago VARCHAR(20) DEFAULT 'quincenal'");
                    $pdo->exec("ALTER TABLE trabajadores ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL");
                    $stmt = $pdo->prepare("INSERT INTO trabajadores (nombre, email, foto_perfil, password_hash, frecuencia_pago) VALUES (?,?,?,?,?)");
                    $stmt->execute([$data['nombre'], $data['email'], $data['foto_perfil']??'', $hash, $frecuencia]);
                } catch (\Exception $ex) {
                    $stmt = $pdo->prepare("INSERT INTO trabajadores (nombre, email, foto_perfil) VALUES (?,?,?)");
                    $stmt->execute([$data['nombre'], $data['email'], $data['foto_perfil']??'']);
                }
            }
            echo json_encode(["status" => "success"]);
            break;
        case 'update_trabajador':
            $frecuencia = in_array($data['frecuencia_pago'] ?? '', ['semanal', 'quincenal', 'mensual']) ? $data['frecuencia_pago'] : 'quincenal';
            if (!empty($data['password'])) {
                $hash = password_hash(trim($data['password']), PASSWORD_DEFAULT);
                try {
                    $stmt = $pdo->prepare("UPDATE trabajadores SET nombre=?, email=?, foto_perfil=?, password_hash=?, frecuencia_pago=? WHERE id=?");
                    $stmt->execute([$data['nombre'], $data['email'], $data['foto_perfil']??'', $hash, $frecuencia, $data['id']]);
                } catch (\Exception $ex) {
                    $stmt = $pdo->prepare("UPDATE trabajadores SET nombre=?, email=?, foto_perfil=? WHERE id=?");
                    $stmt->execute([$data['nombre'], $data['email'], $data['foto_perfil']??'', $data['id']]);
                }
            } else {
                try {
                    $stmt = $pdo->prepare("UPDATE trabajadores SET nombre=?, email=?, foto_perfil=?, frecuencia_pago=? WHERE id=?");
                    $stmt->execute([$data['nombre'], $data['email'], $data['foto_perfil']??'', $frecuencia, $data['id']]);
                } catch (\Exception $ex) {
                    $stmt = $pdo->prepare("UPDATE trabajadores SET nombre=?, email=?, foto_perfil=? WHERE id=?");
                    $stmt->execute([$data['nombre'], $data['email'], $data['foto_perfil']??'', $data['id']]);
                }
            }
            echo json_encode(["status" => "success"]);
            break;
        case 'toggle_trabajador':
            $pdo->prepare("UPDATE trabajadores SET activo = NOT activo WHERE id=?")->execute([$data['id']]);
            echo json_encode(["status" => "success"]);
            break;

        // --- SERVICIOS ---
        case 'add_servicio':
            $stmt = $pdo->prepare("INSERT INTO servicios (nombre, precio, es_corte, activo) VALUES (?,?,?,?)");
            $stmt->execute([$data['nombre'], $data['precio'], $data['es_corte'] ? 1 : 0, $data['activo'] ? 1 : 0]);
            echo json_encode(["status" => "success"]);
            break;
        case 'update_servicio':
            $stmt = $pdo->prepare("UPDATE servicios SET nombre=?, precio=?, es_corte=?, activo=? WHERE id=?");
            $stmt->execute([$data['nombre'], $data['precio'], $data['es_corte'] ? 1 : 0, $data['activo'] ? 1 : 0, $data['id']]);
            echo json_encode(["status" => "success"]);
            break;
        case 'delete_servicio':
            $pdo->prepare("DELETE FROM servicios WHERE id=?")->execute([$data['id']]);
            echo json_encode(["status" => "success"]);
            break;

        // --- CUSTOM ANALYTICS ---
        case 'get_custom_analytics':
            $metric = $data['metric'] ?? 'ingresos_cortes';
            $groupBy = $data['groupBy'] ?? 'fecha';
            $startDate = !empty($data['startDate']) ? trim($data['startDate']) : date('Y-m-01');
            $endDate = !empty($data['endDate']) ? trim($data['endDate']) : date('Y-m-d');

            if ($startDate > $endDate) {
                $tmp = $startDate;
                $startDate = $endDate;
                $endDate = $tmp;
            }

            $dataResp = [];
            $details = [];

            if ($metric === 'ingresos_cortes' || $metric === 'citas_atendidas') {
                $selectMetric = ($metric === 'ingresos_cortes') ? "SUM(IFNULL(cd.precio_cobrado, c.total_pagado))" : "COUNT(DISTINCT c.id)";
                
                if ($groupBy === 'barbero') {
                    $stmt = $pdo->prepare("
                        SELECT IFNULL(t.nombre, 'Sin Asignar') as label, $selectMetric as valor
                        FROM citas c
                        LEFT JOIN trabajadores t ON c.trabajador_id = t.id
                        LEFT JOIN cita_detalle cd ON cd.cita_id = c.id
                        WHERE (LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado'))
                          AND c.fecha BETWEEN ? AND ?
                        GROUP BY t.id, t.nombre
                        ORDER BY valor DESC
                    ");
                } elseif ($groupBy === 'servicio') {
                    $stmt = $pdo->prepare("
                        SELECT IFNULL(s.nombre, 'Servicio de Barbería') as label, $selectMetric as valor
                        FROM citas c
                        LEFT JOIN cita_detalle cd ON cd.cita_id = c.id
                        LEFT JOIN servicios s ON cd.servicio_id = s.id
                        WHERE (LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado'))
                          AND c.fecha BETWEEN ? AND ?
                        GROUP BY s.id, s.nombre
                        ORDER BY valor DESC
                    ");
                } elseif ($groupBy === 'cliente') {
                    $stmt = $pdo->prepare("
                        SELECT IFNULL(cl.nombre, 'Cliente General') as label, $selectMetric as valor
                        FROM citas c
                        LEFT JOIN clientes cl ON c.cliente_id = cl.id
                        LEFT JOIN cita_detalle cd ON cd.cita_id = c.id
                        WHERE (LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado'))
                          AND c.fecha BETWEEN ? AND ?
                        GROUP BY cl.id, cl.nombre
                        ORDER BY valor DESC LIMIT 15
                    ");
                } else { // default 'fecha'
                    $stmt = $pdo->prepare("
                        SELECT c.fecha as label, $selectMetric as valor
                        FROM citas c
                        LEFT JOIN cita_detalle cd ON cd.cita_id = c.id
                        WHERE (LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado'))
                          AND c.fecha BETWEEN ? AND ?
                        GROUP BY c.fecha
                        ORDER BY c.fecha ASC
                    ");
                }
                $stmt->execute([$startDate, $endDate]);
                $dataResp = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Obtener detalles reales
                $stmtDet = $pdo->prepare("
                    SELECT c.fecha, c.hora, IFNULL(cl.nombre, 'Cliente General') as cliente, IFNULL(t.nombre, 'Barbero') as barbero, IFNULL(s.nombre, 'Servicio de Barbería') as servicio, IFNULL(cd.precio_cobrado, c.total_pagado) as monto, c.metodo_pago
                    FROM citas c
                    LEFT JOIN clientes cl ON c.cliente_id = cl.id
                    LEFT JOIN trabajadores t ON c.trabajador_id = t.id
                    LEFT JOIN cita_detalle cd ON cd.cita_id = c.id
                    LEFT JOIN servicios s ON cd.servicio_id = s.id
                    WHERE (LOWER(c.estado) IN ('completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado'))
                      AND c.fecha BETWEEN ? AND ?
                    ORDER BY c.fecha ASC, c.hora ASC
                ");
                $stmtDet->execute([$startDate, $endDate]);
                $details = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

            } elseif ($metric === 'ingresos_tienda' || $metric === 'productos_vendidos') {
                $selectMetric = ($metric === 'ingresos_tienda') ? "SUM(pd.cantidad * pd.precio_unitario)" : "SUM(pd.cantidad)";

                if ($groupBy === 'producto') {
                    $stmt = $pdo->prepare("
                        SELECT IFNULL(pr.nombre, 'Producto') as label, $selectMetric as valor
                        FROM pedidos p
                        LEFT JOIN pedido_detalle pd ON pd.pedido_id = p.id
                        LEFT JOIN productos pr ON pd.producto_id = pr.id
                        WHERE (LOWER(p.estado) IN ('entregado', 'pagado', 'completado')) AND DATE(p.fecha_creacion) BETWEEN ? AND ?
                        GROUP BY pr.id, pr.nombre
                        ORDER BY valor DESC
                    ");
                } elseif ($groupBy === 'cliente') {
                    $stmt = $pdo->prepare("
                        SELECT IFNULL(cl.nombre, 'Cliente General') as label, $selectMetric as valor
                        FROM pedidos p
                        LEFT JOIN clientes cl ON p.cliente_id = cl.id
                        LEFT JOIN pedido_detalle pd ON pd.pedido_id = p.id
                        WHERE (LOWER(p.estado) IN ('entregado', 'pagado', 'completado')) AND DATE(p.fecha_creacion) BETWEEN ? AND ?
                        GROUP BY cl.id, cl.nombre
                        ORDER BY valor DESC LIMIT 15
                    ");
                } else { // default 'fecha'
                    $stmt = $pdo->prepare("
                        SELECT DATE(p.fecha_creacion) as label, $selectMetric as valor
                        FROM pedidos p
                        LEFT JOIN pedido_detalle pd ON pd.pedido_id = p.id
                        WHERE (LOWER(p.estado) IN ('entregado', 'pagado', 'completado')) AND DATE(p.fecha_creacion) BETWEEN ? AND ?
                        GROUP BY DATE(p.fecha_creacion)
                        ORDER BY label ASC
                    ");
                }
                $stmt->execute([$startDate, $endDate]);
                $dataResp = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $stmtDet = $pdo->prepare("
                    SELECT DATE(p.fecha_creacion) as fecha, IFNULL(cl.nombre, 'Cliente General') as cliente, IFNULL(pr.nombre, 'Producto') as producto, pd.cantidad, pd.precio_unitario, (pd.cantidad * pd.precio_unitario) as monto, p.estado
                    FROM pedidos p
                    LEFT JOIN clientes cl ON p.cliente_id = cl.id
                    LEFT JOIN pedido_detalle pd ON pd.pedido_id = p.id
                    LEFT JOIN productos pr ON pd.producto_id = pr.id
                    WHERE (LOWER(p.estado) IN ('entregado', 'pagado', 'completado')) AND DATE(p.fecha_creacion) BETWEEN ? AND ?
                    ORDER BY p.fecha_creacion ASC
                ");
                $stmtDet->execute([$startDate, $endDate]);
                $details = $stmtDet->fetchAll(PDO::FETCH_ASSOC);
            }

            if (!empty($dataResp)) {
                foreach ($dataResp as &$r) {
                    $r['valor'] = floatval($r['valor'] ?? 0);
                }
                unset($r);
            }

            echo json_encode(['aggregated' => $dataResp, 'details' => $details]);
            break;

        // --- GESTIÓN DE PAGOS A TRABAJADORES ---
        case 'registrar_pago_trabajador':
            $trabajador_id = $data['trabajador_id'] ?? 0;
            $periodo_inicio = $data['periodo_inicio'] ?? '';
            $periodo_fin = $data['periodo_fin'] ?? '';
            $monto = floatval($data['monto'] ?? 0);
            $fecha_pago = $data['fecha_pago'] ?? date('Y-m-d');
            $metodo_pago = $data['metodo_pago'] ?? 'Transferencia';
            $numero_comprobante = !empty($data['numero_comprobante']) ? trim($data['numero_comprobante']) : null;
            $notas = !empty($data['notas']) ? trim($data['notas']) : null;

            if (!$trabajador_id || !$periodo_inicio || !$periodo_fin) {
                echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios del trabajador o período."]);
                break;
            }

            // Verificar si ya existe registro para este período y trabajador
            $stmtCheck = $pdo->prepare("SELECT id FROM pagos_trabajadores WHERE trabajador_id = ? AND periodo_inicio = ? AND periodo_fin = ?");
            $stmtCheck->execute([$trabajador_id, $periodo_inicio, $periodo_fin]);
            $existenteId = $stmtCheck->fetchColumn();

            if ($existenteId) {
                $stmtUp = $pdo->prepare("
                    UPDATE pagos_trabajadores 
                    SET monto = ?, fecha_pago = ?, metodo_pago = ?, numero_comprobante = ?, notas = ?, fecha_registro = NOW()
                    WHERE id = ?
                ");
                $stmtUp->execute([$monto, $fecha_pago, $metodo_pago, $numero_comprobante, $notas, $existenteId]);
                echo json_encode(["status" => "success", "message" => "Pago de liquidación actualizado correctamente.", "pago_id" => $existenteId]);
            } else {
                $stmtIns = $pdo->prepare("
                    INSERT INTO pagos_trabajadores 
                    (trabajador_id, periodo_inicio, periodo_fin, monto, fecha_pago, metodo_pago, numero_comprobante, notas)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmtIns->execute([$trabajador_id, $periodo_inicio, $periodo_fin, $monto, $fecha_pago, $metodo_pago, $numero_comprobante, $notas]);
                echo json_encode(["status" => "success", "message" => "Pago de liquidación registrado exitosamente.", "pago_id" => $pdo->lastInsertId()]);
            }
            break;

        case 'eliminar_pago_trabajador':
            $pago_id = $data['pago_id'] ?? 0;
            if (!$pago_id) {
                echo json_encode(["status" => "error", "message" => "ID de pago inválido."]);
                break;
            }
            $stmt = $pdo->prepare("DELETE FROM pagos_trabajadores WHERE id = ?");
            $stmt->execute([$pago_id]);
            echo json_encode(["status" => "success", "message" => "Registro de pago eliminado con éxito."]);
            break;

        case 'cambiar_estado_cita':
            $cita_id = $data['cita_id'] ?? 0;
            $nuevo_estado = $data['estado'] ?? 'Pendiente';
            if (!$cita_id) {
                echo json_encode(["status" => "error", "message" => "ID de cita inválido."]);
                break;
            }
            if (in_array(strtolower($nuevo_estado), ['completada', 'completado', 'pagada', 'pagado', 'finalizada', 'finalizado'])) {
                $stmtCitaInfo = $pdo->prepare("SELECT total_pagado, (SELECT SUM(precio_cobrado) FROM cita_detalle WHERE cita_id = ?) as sub FROM citas WHERE id = ?");
                $stmtCitaInfo->execute([$cita_id, $cita_id]);
                $cInfo = $stmtCitaInfo->fetch(PDO::FETCH_ASSOC);
                $sub = floatval($cInfo['sub'] ?? 0);
                if ($sub <= 0) $sub = floatval($cInfo['total_pagado'] ?? 14000);
                $pdo->prepare("UPDATE citas SET estado = ?, total_pagado = IFNULL(total_pagado, ?) WHERE id = ?")->execute([$nuevo_estado, $sub, $cita_id]);
            } else {
                $stmt = $pdo->prepare("UPDATE citas SET estado = ? WHERE id = ?");
                $stmt->execute([$nuevo_estado, $cita_id]);
            }
            echo json_encode(["status" => "success", "message" => "Estado de la cita actualizado a $nuevo_estado."]);
            break;

        case 'eliminar_cita':
            $cita_id = $data['cita_id'] ?? 0;
            if (!$cita_id) {
                echo json_encode(["status" => "error", "message" => "ID de cita inválido."]);
                break;
            }
            $pdo->prepare("DELETE FROM cita_detalle WHERE cita_id = ?")->execute([$cita_id]);
            $pdo->prepare("DELETE FROM citas WHERE id = ?")->execute([$cita_id]);
            echo json_encode(["status" => "success", "message" => "Cita eliminada correctamente."]);
            break;

        default:
            echo json_encode(["error" => "Invalid action POST"]);
    }
}
?>
