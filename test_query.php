<?php
require 'src/backend/db.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== DIAGNÓSTICO DE BASE DE DATOS LA ROMANA ===\n\n";

$hoy = date('Y-m-d');
$mes_actual = date('Y-m-01');

echo "Fecha Hoy: $hoy\n";
echo "Inicio Mes: $mes_actual\n\n";

// 1. Citas
$totCitas = $pdo->query("SELECT COUNT(*) FROM citas")->fetchColumn();
$citasMes = $pdo->query("SELECT COUNT(*) FROM citas WHERE fecha >= '$mes_actual' AND estado = 'Completada'")->fetchColumn();
$ingresosCortesMes = $pdo->query("
    SELECT SUM(cd.precio_cobrado) 
    FROM cita_detalle cd 
    JOIN citas c ON cd.cita_id = c.id 
    WHERE c.fecha >= '$mes_actual' AND c.estado = 'Completada'
")->fetchColumn() ?: 0;

echo "--- CITAS / CORTES ---\n";
echo "Total citas registradas en la tabla: $totCitas\n";
echo "Citas completadas este mes ($mes_actual en adelante): $citasMes\n";
echo "Ingresos por cortes este mes: $" . number_format($ingresosCortesMes, 0, ',', '.') . "\n\n";

// 2. Pedidos / Tienda
$totPedidos = $pdo->query("SELECT COUNT(*) FROM pedidos")->fetchColumn();
$pedidosMes = $pdo->query("SELECT COUNT(*) FROM pedidos WHERE fecha_creacion >= '$mes_actual' AND estado = 'Entregado'")->fetchColumn();
$ventasTiendaMes = $pdo->query("
    SELECT SUM(total) 
    FROM pedidos 
    WHERE fecha_creacion >= '$mes_actual' AND estado = 'Entregado'
")->fetchColumn() ?: 0;

echo "--- TIENDA / PRODUCTOS ---\n";
echo "Total pedidos registrados: $totPedidos\n";
echo "Pedidos entregados este mes: $pedidosMes\n";
echo "Ventas de tienda este mes: $" . number_format($ventasTiendaMes, 0, ',', '.') . "\n\n";

// 3. Total Ingresos Mes en Dashboard
$totalIngresosMes = $ingresosCortesMes + $ventasTiendaMes;
echo "=============================================\n";
echo "TOTAL INGRESOS DEL MES (Dashboard): $" . number_format($totalIngresosMes, 0, ',', '.') . "\n";
echo "=============================================\n\n";

// 4. Detalle de los últimos 5 registros de citas
echo "--- ÚLTIMAS 5 CITAS COMPLETADAS ---\n";
$ultimasCitas = $pdo->query("
    SELECT c.id, c.fecha, c.hora, c.cliente_nombre, c.total, c.estado 
    FROM citas c 
    ORDER BY c.fecha DESC, c.hora DESC 
    LIMIT 5
")->fetchAll();

foreach ($ultimasCitas as $c) {
    echo "ID: {$c['id']} | Fecha: {$c['fecha']} {$c['hora']} | Cliente: {$c['cliente_nombre']} | Total: \${$c['total']} | Estado: {$c['estado']}\n";
}

echo "\n--- ÚLTIMOS 5 PEDIDOS ---\n";
$ultimosPedidos = $pdo->query("
    SELECT id, cliente_nombre, total, metodo_pago, estado, fecha_creacion 
    FROM pedidos 
    ORDER BY fecha_creacion DESC 
    LIMIT 5
")->fetchAll();

foreach ($ultimosPedidos as $p) {
    echo "ID: {$p['id']} | Fecha: {$p['fecha_creacion']} | Cliente: {$p['cliente_nombre']} | Total: \${$p['total']} | Estado: {$p['estado']}\n";
}
