<?php
// ver_ingresos.php - Diagnóstico y Desglose Detallado de Ingresos del Mes
require 'db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $hoy = $pdo->query("SELECT CURDATE()")->fetchColumn();
    $mes_actual = $pdo->query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01')")->fetchColumn();

    // 1. Desglose de Citas Completadas del Mes
    $stmtCitas = $pdo->prepare("
        SELECT 
            c.id AS cita_id,
            c.fecha,
            c.hora,
            cl.nombre AS cliente_nombre,
            t.nombre AS barbero,
            s.nombre AS servicio,
            cd.precio_cobrado
        FROM cita_detalle cd
        JOIN citas c ON cd.cita_id = c.id
        LEFT JOIN clientes cl ON c.cliente_id = cl.id
        LEFT JOIN trabajadores t ON c.trabajador_id = t.id
        LEFT JOIN servicios s ON cd.servicio_id = s.id
        WHERE c.fecha >= ? AND c.estado = 'Completada'
        ORDER BY c.fecha DESC, c.hora DESC
    ");
    $stmtCitas->execute([$mes_actual]);
    $detallesCortes = $stmtCitas->fetchAll();

    $totalCortesMes = 0;
    foreach ($detallesCortes as $c) {
        $totalCortesMes += (float)$c['precio_cobrado'];
    }

    // 2. Desglose de Pedidos de Tienda del Mes
    $stmtPedidos = $pdo->prepare("
        SELECT 
            p.id AS pedido_id,
            cl.nombre AS cliente_nombre,
            p.total,
            p.estado,
            p.fecha_creacion
        FROM pedidos p
        LEFT JOIN clientes cl ON p.cliente_id = cl.id
        WHERE p.fecha_creacion >= ? AND p.estado = 'Entregado'
        ORDER BY p.fecha_creacion DESC
    ");
    $stmtPedidos->execute([$mes_actual]);
    $detallesPedidos = $stmtPedidos->fetchAll();

    $totalTiendaMes = 0;
    foreach ($detallesPedidos as $p) {
        $totalTiendaMes += (float)$p['total'];
    }

    // 3. Resumen General
    $totalIngresosMes = $totalCortesMes + $totalTiendaMes;

    echo json_encode([
        "status" => "success",
        "periodo" => [
            "inicio_mes" => $mes_actual,
            "fecha_hoy" => $hoy
        ],
        "resumen" => [
            "total_ingresos_mes" => $totalIngresosMes,
            "total_ingresos_mes_formateado" => "$" . number_format($totalIngresosMes, 0, ',', '.'),
            "subtotal_cortes" => "$" . number_format($totalCortesMes, 0, ',', '.'),
            "cantidad_cortes_completados" => count($detallesCortes),
            "subtotal_tienda" => "$" . number_format($totalTiendaMes, 0, ',', '.'),
            "cantidad_pedidos_entregados" => count($detallesPedidos)
        ],
        "detalle_cortes" => $detallesCortes,
        "detalle_pedidos_tienda" => $detallesPedidos
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
