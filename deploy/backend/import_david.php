<?php
// import_david.php - Script para importar y cuadrar automáticamente los cortes de David H.
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

try {
    $sqlFile = __DIR__ . '/../../import_cuadre_david.sql';
    if (!file_exists($sqlFile)) {
        $sqlFile = __DIR__ . '/import_cuadre_david.sql';
    }
    
    if (!file_exists($sqlFile)) {
        throw new Exception("El archivo import_cuadre_david.sql no fue encontrado.");
    }

    $sqlContent = file_get_contents($sqlFile);
    $pdo->exec($sqlContent);

    // Consulta resumen
    $stmt = $pdo->query("
        SELECT 
            t.nombre AS barbero,
            COUNT(c.id) AS total_citas,
            SUM(c.total_pagado) AS total_recaudado,
            ROUND(SUM(c.total_pagado) * 0.60, 0) AS comision_david,
            ROUND(SUM(c.total_pagado) * 0.40, 0) AS ganancia_tienda
        FROM citas c
        JOIN trabajadores t ON c.trabajador_id = t.id
        WHERE t.nombre LIKE '%David%' OR t.email = 'carlos@laromana.cl'
          AND c.fecha BETWEEN '2026-08-17' AND '2026-09-19'
        GROUP BY t.id
    ");
    $resumen = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'message' => 'Cortes de David H. importados y cuadrados con éxito.',
        'resumen' => $resumen
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
