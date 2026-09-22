<?php
require 'src/backend/db.php';

echo "=== TRABAJADORES ===\n";
$trabajadores = $pdo->query("SELECT id, nombre, email, activo FROM trabajadores")->fetchAll(PDO::FETCH_ASSOC);
print_r($trabajadores);

echo "\n=== SERVICIOS ===\n";
$servicios = $pdo->query("SELECT id, nombre, precio, es_corte, activo FROM servicios")->fetchAll(PDO::FETCH_ASSOC);
print_r($servicios);

echo "\n=== CLIENTES ===\n";
$clientes = $pdo->query("SELECT id, nombre, rut FROM clientes LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
print_r($clientes);

echo "\n=== RANGO CITAS EXISTENTES ===\n";
$citasRango = $pdo->query("SELECT MIN(fecha) as min_fecha, MAX(fecha) as max_fecha, COUNT(*) as total FROM citas")->fetch(PDO::FETCH_ASSOC);
print_r($citasRango);
