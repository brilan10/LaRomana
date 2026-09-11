<?php
require 'db.php';

try {
    // 1. Crear tabla administradores
    $pdo->exec("CREATE TABLE IF NOT EXISTS administradores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Insertar administrador por defecto si no existe (admin123)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM administradores WHERE email = 'admin@laromana.cl'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $ins = $pdo->prepare("INSERT INTO administradores (nombre, email, password_hash) VALUES ('Dueño', 'admin@laromana.cl', ?)");
        $ins->execute([$hash]);
        echo "Admin default insertado.\n";
    }

    // 2. Crear tabla cierres_diarios (Caja y configuración de comisiones diarias)
    $pdo->exec("CREATE TABLE IF NOT EXISTS cierres_diarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha DATE UNIQUE NOT NULL,
        efectivo_inicial DECIMAL(10,2) DEFAULT 0,
        porcentaje_barbero DECIMAL(5,2) DEFAULT 60.00,
        porcentaje_tienda DECIMAL(5,2) DEFAULT 40.00,
        total_ingresos DECIMAL(10,2) DEFAULT 0,
        total_barberos DECIMAL(10,2) DEFAULT 0,
        total_tienda DECIMAL(10,2) DEFAULT 0,
        cerrado_por_admin TINYINT(1) DEFAULT 0,
        fecha_cierre TIMESTAMP NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 3. Crear tabla pagos_trabajadores para registro y liquidación de pagos
    $pdo->exec("CREATE TABLE IF NOT EXISTS pagos_trabajadores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trabajador_id INT NOT NULL,
        periodo_inicio DATE NOT NULL,
        periodo_fin DATE NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        fecha_pago DATE NOT NULL,
        metodo_pago ENUM('Transferencia', 'Efectivo', 'Tarjeta', 'Cheque', 'Otro') DEFAULT 'Transferencia',
        numero_comprobante VARCHAR(100) DEFAULT NULL,
        notas TEXT DEFAULT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 4. Crear tabla historial_recompensas para fidelización VIP
    $pdo->exec("CREATE TABLE IF NOT EXISTS historial_recompensas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        cita_id INT DEFAULT NULL,
        aroma_decant VARCHAR(255) NOT NULL,
        fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 5. Crear tabla configuraciones generales
    $pdo->exec("CREATE TABLE IF NOT EXISTS configuraciones (
        clave VARCHAR(50) PRIMARY KEY,
        valor TEXT NOT NULL,
        descripcion VARCHAR(255) DEFAULT NULL,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Insertar configuración por defecto de cortes para premio (ej: 3 cortes)
    $stmtConf = $pdo->prepare("INSERT INTO configuraciones (clave, valor, descripcion) VALUES ('meta_cortes_premio', '3', 'Cantidad de cortes requeridos para ganar premio') ON DUPLICATE KEY UPDATE clave=clave");
    $stmtConf->execute();

    // Insertar configuración por defecto de frecuencia de pago a barberos (quincenal)
    $stmtConfPago = $pdo->prepare("INSERT INTO configuraciones (clave, valor, descripcion) VALUES ('frecuencia_pago_barberos', 'quincenal', 'Frecuencia de pago predeterminada para barberos (semanal, quincenal, mensual)') ON DUPLICATE KEY UPDATE clave=clave");
    $stmtConfPago->execute();

    // Actualizar columnas de estado y metodo_pago en pedidos para permitir 'Pagado', 'Entregado', etc.
    try {
        $pdo->exec("ALTER TABLE pedidos MODIFY COLUMN estado VARCHAR(50) DEFAULT 'Pendiente'");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'Efectivo'");
    } catch (Exception $e) {
        try {
            $pdo->exec("ALTER TABLE pedidos ADD COLUMN metodo_pago VARCHAR(50) DEFAULT 'Efectivo'");
        } catch (Exception $ex) {}
    }

    // Ampliar soporte de imágenes a LONGTEXT para fotos en base64 o URLs largas
    try {
        $pdo->exec("ALTER TABLE productos MODIFY COLUMN imagen_url LONGTEXT");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE trabajadores MODIFY COLUMN foto_perfil LONGTEXT");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE trabajadores ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE trabajadores ADD COLUMN IF NOT EXISTS frecuencia_pago VARCHAR(20) DEFAULT 'quincenal'");
    } catch (Exception $e) {
        try {
            $pdo->exec("ALTER TABLE trabajadores ADD COLUMN frecuencia_pago VARCHAR(20) DEFAULT 'quincenal'");
        } catch (Exception $ex) {}
    }

    // Asegurar columnas requeridas en clientes
    try {
        $pdo->exec("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cortes_acumulados INT DEFAULT 0");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS decants_disponibles INT DEFAULT 0");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS notas_crm TEXT NULL");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE clientes ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE clientes MODIFY COLUMN email VARCHAR(150) NULL");
    } catch (Exception $e) {}

    echo "Base de datos actualizada con exito.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
