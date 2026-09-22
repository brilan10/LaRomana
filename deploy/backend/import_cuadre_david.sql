-- ==================================================================
-- SCRIPT SQL: CUADRE COMPLETO DE CORTES PARA DAVID H. ($2.046.000 CLP)
-- Periodo: 17 de Agosto 2026 al 19 de Septiembre 2026
-- ==================================================================

-- 1. Asegurar que David exista como barbero/trabajador
INSERT INTO trabajadores (nombre, email, foto_perfil, password_hash, activo, frecuencia_pago)
SELECT 'DAVID', 'carlos@laromana.cl', '/assets/fotos/Peersonal/Peluquero 1.jpg', '$2y$10$Ww3yU3ZRVq9egYAHqbtHqeH8n2.aEgWi94hVC1k2AU/pBtEr9NGV6', 1, 'quincenal'
WHERE NOT EXISTS (SELECT 1 FROM trabajadores WHERE nombre LIKE '%David%' OR email = 'carlos@laromana.cl');

-- Obtener el ID de David
SET @david_id = (SELECT id FROM trabajadores WHERE nombre LIKE '%David%' OR email = 'carlos@laromana.cl' ORDER BY id ASC LIMIT 1);

-- 2. Asegurar que existan servicios base
INSERT IGNORE INTO servicios (id, nombre, descripcion, precio, es_corte, activo) VALUES
(1, 'Corte Clásico', 'Corte tradicional', 12000.00, 1, 1),
(2, 'Corte Degradado', 'Corte fade pulido', 14000.00, 1, 1),
(3, 'Corte y Barba Completa', 'Pack corte y barba', 20000.00, 1, 1),
(4, 'Perfilado de Barba', 'Diseño de barba a navaja', 8000.00, 0, 1),
(5, 'Black Mask & Limpieza Facial', 'Mascarilla y toalla', 6000.00, 0, 1);

SET @s_clasico = (SELECT id FROM servicios WHERE nombre = 'Corte Clásico' LIMIT 1);
SET @s_degradado = (SELECT id FROM servicios WHERE nombre = 'Corte Degradado' LIMIT 1);
SET @s_barba_pack = (SELECT id FROM servicios WHERE nombre = 'Corte y Barba Completa' LIMIT 1);
SET @s_perfilado = (SELECT id FROM servicios WHERE nombre = 'Perfilado de Barba' LIMIT 1);
SET @s_limpieza = (SELECT id FROM servicios WHERE nombre LIKE '%Limpieza%' OR nombre LIKE '%Black Mask%' LIMIT 1);

-- 3. Asegurar que existan clientes para asociar las citas
INSERT IGNORE INTO clientes (rut, nombre, email, telefono, cortes_acumulados, password_hash) VALUES
('12345678-9', 'Cliente Frecuente', 'cliente1@laromana.cl', '+56900000001', 5, '$2y$10$Ww3yU3ZRVq9egYAHqbtHqeH8n2.aEgWi94hVC1k2AU/pBtEr9NGV6'),
('19123456-7', 'Juan Pérez', 'juan.perez@laromana.cl', '+56911111111', 3, '$2y$10$Ww3yU3ZRVq9egYAHqbtHqeH8n2.aEgWi94hVC1k2AU/pBtEr9NGV6'),
('18765432-1', 'Carlos Silva', 'carlos.silva@laromana.cl', '+56922222222', 4, '$2y$10$Ww3yU3ZRVq9egYAHqbtHqeH8n2.aEgWi94hVC1k2AU/pBtEr9NGV6'),
('20555666-8', 'Miguel Rojas', 'miguel.rojas@laromana.cl', '+56933333333', 2, '$2y$10$Ww3yU3ZRVq9egYAHqbtHqeH8n2.aEgWi94hVC1k2AU/pBtEr9NGV6'),
('17444333-2', 'Felipe Soto', 'felipe.soto@laromana.cl', '+56944444444', 3, '$2y$10$Ww3yU3ZRVq9egYAHqbtHqeH8n2.aEgWi94hVC1k2AU/pBtEr9NGV6');

-- 4. Limpiar citas previas de David en este rango para evitar duplicados si se corre varias veces
DELETE cd FROM cita_detalle cd JOIN citas c ON cd.cita_id = c.id WHERE c.trabajador_id = @david_id AND c.fecha BETWEEN '2026-08-17' AND '2026-09-19';
DELETE FROM citas WHERE trabajador_id = @david_id AND fecha BETWEEN '2026-08-17' AND '2026-09-19';

-- 5. Insertar citas y detalles día por día con los montos exactos

-- -------------------------------------------------------------
-- Fecha: 2026-08-17 | Total Día: $54.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-17', 60.00, 40.00, 54000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-17', '10:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-17', '12:00:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-17', '15:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-18 | Total Día: $64.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-18', 60.00, 40.00, 64000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-18', '10:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-18', '11:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-18', '14:30:00', 'Completada', 0.00, 'Transferencia', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-18', '16:30:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-19 | Total Día: $52.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-19', 60.00, 40.00, 52000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-19', '10:30:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-19', '12:00:00', 'Completada', 0.00, 'Transferencia', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-19', '15:00:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-19', '17:00:00', 'Completada', 0.00, 'Tarjeta', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-21 | Total Día: $104.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-21', 60.00, 40.00, 104000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-21', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-21', '11:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-21', '13:00:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-21', '15:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-21', '16:30:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-21', '18:00:00', 'Completada', 0.00, 'Tarjeta', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-22 | Total Día: $96.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-22', 60.00, 40.00, 96000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-22', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-22', '11:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-22', '13:00:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-22', '15:00:00', 'Completada', 0.00, 'Transferencia', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-22', '16:30:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-22', '18:00:00', 'Completada', 0.00, 'Tarjeta', 8000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_perfilado, 8000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-24 | Total Día: $68.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-24', 60.00, 40.00, 68000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-24', '10:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-24', '12:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-24', '15:00:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-24', '17:00:00', 'Completada', 0.00, 'Transferencia', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-25 | Total Día: $84.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-25', 60.00, 40.00, 84000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-25', '10:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-25', '11:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-25', '14:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-25', '16:00:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-25', '17:30:00', 'Completada', 0.00, 'Tarjeta', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-26 | Total Día: $80.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-26', 60.00, 40.00, 80000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-26', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-26', '11:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-26', '14:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-26', '16:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-27 | Total Día: $34.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-27', 60.00, 40.00, 34000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-27', '11:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-27', '15:00:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-28 | Total Día: $100.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-28', 60.00, 40.00, 100000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-28', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-28', '11:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-28', '14:00:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-28', '16:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-28', '17:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-29 | Total Día: $116.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-29', 60.00, 40.00, 116000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-29', '10:00:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-29', '11:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-29', '13:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-29', '15:00:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-29', '16:30:00', 'Completada', 0.00, 'Transferencia', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-29', '17:30:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-29', '18:30:00', 'Completada', 0.00, 'Tarjeta', 8000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_perfilado, 8000);

-- -------------------------------------------------------------
-- Fecha: 2026-08-31 | Total Día: $80.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-08-31', 60.00, 40.00, 80000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-31', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-31', '12:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-31', '15:00:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-31', '16:30:00', 'Completada', 0.00, 'Transferencia', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-08-31', '18:00:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-01 | Total Día: $52.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-01', 60.00, 40.00, 52000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-01', '10:30:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-01', '12:30:00', 'Completada', 0.00, 'Transferencia', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-01', '15:00:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-01', '17:00:00', 'Completada', 0.00, 'Tarjeta', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-02 | Total Día: $129.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-02', 60.00, 40.00, 129000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-02', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-02', '11:15:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-02', '12:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-02', '14:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-02', '16:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-02', '17:30:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-02', '18:45:00', 'Completada', 0.00, 'Transferencia', 15000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_perfilado, 3000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-03 | Total Día: $35.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-03', 60.00, 40.00, 35000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-03', '11:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-03', '15:30:00', 'Completada', 0.00, 'Tarjeta', 15000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_limpieza, 1000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-04 | Total Día: $12.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-04', 60.00, 40.00, 12000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-04', '15:00:00', 'Completada', 0.00, 'Transferencia', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-05 | Total Día: $142.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-05', 60.00, 40.00, 142000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '10:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '11:15:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '12:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '14:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '15:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '17:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '18:15:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-05', '19:15:00', 'Completada', 0.00, 'Tarjeta', 8000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_perfilado, 8000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-07 | Total Día: $35.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-07', 60.00, 40.00, 35000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-07', '11:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-07', '15:30:00', 'Completada', 0.00, 'Efectivo', 15000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_limpieza, 1000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-08 | Total Día: $62.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-08', 60.00, 40.00, 62000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-08', '10:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-08', '12:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-08', '15:00:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-08', '17:00:00', 'Completada', 0.00, 'Tarjeta', 8000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_perfilado, 8000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-09 | Total Día: $54.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-09', 60.00, 40.00, 54000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-09', '10:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-09', '14:00:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-09', '16:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-10 | Total Día: $48.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-10', 60.00, 40.00, 48000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-10', '11:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-10', '14:30:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-10', '16:30:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-11 | Total Día: $84.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-11', 60.00, 40.00, 84000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-11', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-11', '11:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-11', '14:00:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-11', '16:00:00', 'Completada', 0.00, 'Transferencia', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-11', '17:30:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-12 | Total Día: $86.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-12', 60.00, 40.00, 86000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-12', '10:00:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-12', '11:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-12', '13:30:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-12', '15:30:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-12', '17:30:00', 'Completada', 0.00, 'Transferencia', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-14 | Total Día: $89.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-14', 60.00, 40.00, 89000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-14', '10:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-14', '11:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-14', '14:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-14', '16:00:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-14', '17:30:00', 'Completada', 0.00, 'Tarjeta', 15000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_limpieza, 3000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-15 | Total Día: $118.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-15', 60.00, 40.00, 118000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-15', '10:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-15', '11:15:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-15', '12:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-15', '14:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-15', '16:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-15', '17:30:00', 'Completada', 0.00, 'Tarjeta', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-15', '18:45:00', 'Completada', 0.00, 'Transferencia', 4000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_limpieza, 4000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-16 | Total Día: $142.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-16', 60.00, 40.00, 142000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '10:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '11:15:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '12:30:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '14:00:00', 'Completada', 0.00, 'Efectivo', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '15:30:00', 'Completada', 0.00, 'Tarjeta', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '17:00:00', 'Completada', 0.00, 'Transferencia', 20000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 2;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_barba_pack, 20000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '18:15:00', 'Completada', 0.00, 'Efectivo', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 3;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-16', '19:15:00', 'Completada', 0.00, 'Tarjeta', 8000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 4;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_perfilado, 8000);

-- -------------------------------------------------------------
-- Fecha: 2026-09-17 | Total Día: $26.000 CLP
-- -------------------------------------------------------------
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, cerrado_por_admin)
VALUES ('2026-09-17', 60.00, 40.00, 26000, 1)
ON DUPLICATE KEY UPDATE total_ingresos = total_ingresos + VALUES(total_ingresos);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-17', '11:00:00', 'Completada', 0.00, 'Transferencia', 14000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 0;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_degradado, 14000);
INSERT INTO citas (cliente_id, trabajador_id, fecha, hora, estado, descuento, metodo_pago, total_pagado)
SELECT id, @david_id, '2026-09-17', '15:00:00', 'Completada', 0.00, 'Efectivo', 12000 FROM clientes ORDER BY id ASC LIMIT 1 OFFSET 1;
SET @last_cita = LAST_INSERT_ID();
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (@last_cita, @s_clasico, 12000);

-- =============================================================
-- 6. Actualizar contadores de cortes de David y clientes
-- =============================================================
UPDATE clientes c SET cortes_acumulados = (SELECT COUNT(*) FROM citas WHERE cliente_id = c.id AND estado = 'Completada');

-- Verificación final de lo insertado
SELECT 
    t.nombre AS Barbero,
    COUNT(c.id) AS Total_Citas,
    SUM(c.total_pagado) AS Total_Recaudado_Bruto,
    ROUND(SUM(c.total_pagado) * 0.60, 0) AS Comision_David_60_Pct,
    ROUND(SUM(c.total_pagado) * 0.40, 0) AS Ganancia_Tienda_40_Pct
FROM citas c
JOIN trabajadores t ON c.trabajador_id = t.id
WHERE c.trabajador_id = @david_id AND c.fecha BETWEEN '2026-08-17' AND '2026-09-19'
GROUP BY t.id;
