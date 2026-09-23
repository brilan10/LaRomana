-- ============================================================================
-- IMPORTACION OFICIAL DE EXCEL (DAVID H. Y SANTIAGO) PARA WEBHOST CHILE / cPanel
-- Base de Datos Hosting: laromana_basededatos (Usuario: laromana_ronin)
-- Cuadre exacto: 17 de Agosto al 17 de Septiembre (161 citas / 2 Clientes)
-- David H.: $2.046.000 | Santiago: $601.000
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- 1. ASEGURAR TRABAJADORES (DAVID H. Y SANTIAGO)
INSERT INTO trabajadores (id, nombre, email, password_hash, foto_perfil, activo, frecuencia_pago)
VALUES 
(1, 'David H.', 'david@laromana.cl', '$2y$10$ApNsOanKK68POk8T4lJA9u2dxnFHKACo2laPj0PcdiCENwUbV0gqW', '/assets/fotos/Peersonal/Peluquero 1.jpg', 1, 'quincenal'),
(2, 'Santiago', 'santiago@laromana.cl', '$2y$10$ApNsOanKK68POk8T4lJA9u2dxnFHKACo2laPj0PcdiCENwUbV0gqW', '/assets/fotos/Peersonal/Peelukero2.jpg', 1, 'quincenal')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email), activo = 1, frecuencia_pago = 'quincenal';

-- Desactivar o eliminar otros trabajadores anteriores para dejar solo a David y Santiago
DELETE FROM trabajadores WHERE id NOT IN (1, 2) AND nombre LIKE '%Pedro%';

-- 2. ASEGURAR LOS 2 CLIENTES PARA ASIGNAR EL CUADRE
INSERT INTO clientes (id, rut, nombre, email, telefono, cortes_acumulados) VALUES
(1, '12345678-9', 'Cliente Prueba', 'cliente@email.com', '+56912345678', 81),
(2, '19123456-7', 'Juan Pérez', 'juan.perez@email.com', '+56987654321', 80)
ON DUPLICATE KEY UPDATE cortes_acumulados = VALUES(cortes_acumulados);

-- 3. ASEGURAR SERVICIOS BASE DE BARBERIA
INSERT INTO servicios (id, nombre, descripcion, precio, es_corte, activo) VALUES
(1, 'Corte Clásico', 'Corte de cabello tradicional con lavado y peinado', 12000.00, 1, 1),
(2, 'Corte Degradado', 'Corte fade pulido a navaja y peinado profesional', 14000.00, 1, 1),
(3, 'Corte y Barba Completa', 'Pack completo corte y barba', 20000.00, 1, 1),
(4, 'Perfilado de Barba', 'Diseño de barba a navaja', 8000.00, 0, 1),
(5, 'Black Mask & Limpieza Facial', 'Limpieza facial profunda', 6000.00, 0, 1)
ON DUPLICATE KEY UPDATE precio = VALUES(precio), activo = 1;

-- 4. LIMPIAR CITAS Y CIERRES PREVIOS EN EL RANGO
DELETE cd FROM cita_detalle cd JOIN citas c ON cd.cita_id = c.id WHERE c.trabajador_id IN (1, 2) AND c.fecha BETWEEN '2026-08-17' AND '2026-09-19';
DELETE FROM citas WHERE trabajador_id IN (1, 2) AND fecha BETWEEN '2026-08-17' AND '2026-09-19';
DELETE FROM cierres_diarios WHERE fecha BETWEEN '2026-08-17' AND '2026-09-19';

-- 5. INSERTAR CITAS Y DETALLES DEL EXCEL (161 CITAS)
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (1, 1, 1, '2026-08-17', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (1, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (2, 2, 1, '2026-08-17', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (2, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (3, 1, 1, '2026-08-17', '13:00:00', 'Completada', 'Transferencia', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (3, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (4, 2, 1, '2026-08-18', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (4, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (5, 1, 1, '2026-08-18', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (5, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (6, 2, 1, '2026-08-18', '13:00:00', 'Completada', 'Tarjeta', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (6, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (7, 1, 1, '2026-08-18', '15:00:00', 'Completada', 'Efectivo', 0.00, 10000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (7, 5, 10000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (8, 2, 1, '2026-08-19', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (8, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (9, 1, 1, '2026-08-19', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (9, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (10, 2, 1, '2026-08-19', '13:00:00', 'Completada', 'Efectivo', 0.00, 12000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (10, 1, 12000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (11, 1, 1, '2026-08-21', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (11, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (12, 2, 1, '2026-08-21', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (12, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (13, 1, 1, '2026-08-21', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (13, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (14, 2, 1, '2026-08-21', '15:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (14, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (15, 1, 1, '2026-08-21', '16:30:00', 'Completada', 'Efectivo', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (15, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (16, 2, 1, '2026-08-21', '18:00:00', 'Completada', 'Tarjeta', 0.00, 10000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (16, 5, 10000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (17, 1, 1, '2026-08-22', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (17, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (18, 2, 1, '2026-08-22', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (18, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (19, 1, 1, '2026-08-22', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (19, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (20, 2, 1, '2026-08-22', '15:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (20, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (21, 1, 1, '2026-08-22', '16:30:00', 'Completada', 'Tarjeta', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (21, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (22, 2, 1, '2026-08-22', '18:00:00', 'Completada', 'Transferencia', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (22, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (23, 1, 1, '2026-08-24', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (23, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (24, 2, 1, '2026-08-24', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (24, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (25, 1, 1, '2026-08-24', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (25, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (26, 2, 1, '2026-08-24', '15:00:00', 'Completada', 'Tarjeta', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (26, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (27, 1, 1, '2026-08-25', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (27, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (28, 2, 1, '2026-08-25', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (28, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (29, 1, 1, '2026-08-25', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (29, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (30, 2, 1, '2026-08-25', '15:00:00', 'Completada', 'Tarjeta', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (30, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (31, 1, 1, '2026-08-25', '16:30:00', 'Completada', 'Tarjeta', 0.00, 10000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (31, 5, 10000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (32, 2, 1, '2026-08-26', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (32, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (33, 1, 1, '2026-08-26', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (33, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (34, 2, 1, '2026-08-26', '13:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (34, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (35, 1, 1, '2026-08-26', '15:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (35, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (36, 2, 1, '2026-08-27', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (36, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (37, 1, 1, '2026-08-27', '11:30:00', 'Completada', 'Tarjeta', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (37, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (38, 2, 1, '2026-08-28', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (38, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (39, 1, 1, '2026-08-28', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (39, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (40, 2, 1, '2026-08-28', '13:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (40, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (41, 1, 1, '2026-08-28', '15:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (41, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (42, 2, 1, '2026-08-28', '16:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (42, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (43, 1, 1, '2026-08-29', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (43, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (44, 2, 1, '2026-08-29', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (44, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (45, 1, 1, '2026-08-29', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (45, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (46, 2, 1, '2026-08-29', '15:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (46, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (47, 1, 1, '2026-08-29', '16:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (47, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (48, 2, 1, '2026-08-29', '18:00:00', 'Completada', 'Efectivo', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (48, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (49, 1, 1, '2026-08-29', '19:15:00', 'Completada', 'Transferencia', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (49, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (50, 2, 1, '2026-08-31', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (50, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (51, 1, 1, '2026-08-31', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (51, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (52, 2, 1, '2026-08-31', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (52, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (53, 1, 1, '2026-08-31', '15:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (53, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (54, 2, 1, '2026-09-01', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (54, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (55, 1, 1, '2026-09-01', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (55, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (56, 2, 1, '2026-09-01', '13:00:00', 'Completada', 'Efectivo', 0.00, 12000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (56, 1, 12000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (57, 1, 1, '2026-09-02', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (57, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (58, 2, 1, '2026-09-02', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (58, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (59, 1, 1, '2026-09-02', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (59, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (60, 2, 1, '2026-09-02', '15:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (60, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (61, 1, 1, '2026-09-02', '16:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (61, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (62, 2, 1, '2026-09-02', '18:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (62, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (63, 1, 1, '2026-09-02', '19:15:00', 'Completada', 'Transferencia', 0.00, 9000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (63, 5, 9000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (64, 2, 1, '2026-09-03', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (64, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (65, 1, 1, '2026-09-03', '11:30:00', 'Completada', 'Efectivo', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (65, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (66, 2, 1, '2026-09-03', '13:00:00', 'Completada', 'Efectivo', 0.00, 7000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (66, 5, 7000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (67, 1, 1, '2026-09-04', '10:00:00', 'Completada', 'Transferencia', 0.00, 12000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (67, 1, 12000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (68, 2, 1, '2026-09-05', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (68, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (69, 1, 1, '2026-09-05', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (69, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (70, 2, 1, '2026-09-05', '13:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (70, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (71, 1, 1, '2026-09-05', '15:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (71, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (72, 2, 1, '2026-09-05', '16:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (72, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (73, 1, 1, '2026-09-05', '18:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (73, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (74, 2, 1, '2026-09-05', '19:15:00', 'Completada', 'Transferencia', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (74, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (75, 1, 1, '2026-09-05', '20:00:00', 'Completada', 'Transferencia', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (75, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (76, 2, 1, '2026-09-07', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (76, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (77, 1, 1, '2026-09-07', '11:30:00', 'Completada', 'Tarjeta', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (77, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (78, 2, 1, '2026-09-07', '13:00:00', 'Completada', 'Transferencia', 0.00, 7000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (78, 5, 7000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (79, 1, 1, '2026-09-08', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (79, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (80, 2, 1, '2026-09-08', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (80, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (81, 1, 1, '2026-09-08', '13:00:00', 'Completada', 'Transferencia', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (81, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (82, 2, 1, '2026-09-08', '15:00:00', 'Completada', 'Transferencia', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (82, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (83, 1, 1, '2026-09-09', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (83, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (84, 2, 1, '2026-09-09', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (84, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (85, 1, 1, '2026-09-09', '13:00:00', 'Completada', 'Transferencia', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (85, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (86, 2, 1, '2026-09-10', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (86, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (87, 1, 1, '2026-09-10', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (87, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (88, 2, 1, '2026-09-10', '13:00:00', 'Completada', 'Transferencia', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (88, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (89, 1, 1, '2026-09-11', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (89, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (90, 2, 1, '2026-09-11', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (90, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (91, 1, 1, '2026-09-11', '13:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (91, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (92, 2, 1, '2026-09-11', '15:00:00', 'Completada', 'Efectivo', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (92, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (93, 1, 1, '2026-09-11', '16:30:00', 'Completada', 'Tarjeta', 0.00, 10000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (93, 5, 10000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (94, 2, 1, '2026-09-12', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (94, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (95, 1, 1, '2026-09-12', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (95, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (96, 2, 1, '2026-09-12', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (96, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (97, 1, 1, '2026-09-12', '15:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (97, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (98, 2, 1, '2026-09-12', '16:30:00', 'Completada', 'Transferencia', 0.00, 6000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (98, 5, 6000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (99, 1, 1, '2026-09-14', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (99, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (100, 2, 1, '2026-09-14', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (100, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (101, 1, 1, '2026-09-14', '13:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (101, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (102, 2, 1, '2026-09-14', '15:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (102, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (103, 1, 1, '2026-09-14', '16:30:00', 'Completada', 'Efectivo', 0.00, 9000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (103, 5, 9000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (104, 2, 1, '2026-09-15', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (104, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (105, 1, 1, '2026-09-15', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (105, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (106, 2, 1, '2026-09-15', '13:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (106, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (107, 1, 1, '2026-09-15', '15:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (107, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (108, 2, 1, '2026-09-15', '16:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (108, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (109, 1, 1, '2026-09-15', '18:00:00', 'Completada', 'Tarjeta', 0.00, 12000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (109, 1, 12000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (110, 2, 1, '2026-09-15', '19:15:00', 'Completada', 'Transferencia', 0.00, 6000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (110, 5, 6000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (111, 1, 1, '2026-09-16', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (111, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (112, 2, 1, '2026-09-16', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (112, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (113, 1, 1, '2026-09-16', '13:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (113, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (114, 2, 1, '2026-09-16', '15:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (114, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (115, 1, 1, '2026-09-16', '16:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (115, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (116, 2, 1, '2026-09-16', '18:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (116, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (117, 1, 1, '2026-09-16', '19:15:00', 'Completada', 'Efectivo', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (117, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (118, 2, 1, '2026-09-16', '20:00:00', 'Completada', 'Tarjeta', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (118, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (119, 1, 1, '2026-09-17', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (119, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (120, 2, 1, '2026-09-17', '11:30:00', 'Completada', 'Tarjeta', 0.00, 6000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (120, 5, 6000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (121, 1, 2, '2026-08-31', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (121, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (122, 2, 2, '2026-08-31', '11:30:00', 'Completada', 'Tarjeta', 0.00, 6000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (122, 5, 6000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (123, 1, 2, '2026-09-01', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (123, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (124, 2, 2, '2026-09-01', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (124, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (125, 1, 2, '2026-09-02', '10:00:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (125, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (126, 2, 2, '2026-09-02', '11:30:00', 'Completada', 'Tarjeta', 0.00, 12000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (126, 1, 12000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (127, 1, 2, '2026-09-02', '13:00:00', 'Completada', 'Transferencia', 0.00, 6000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (127, 5, 6000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (128, 2, 2, '2026-09-03', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (128, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (129, 1, 2, '2026-09-03', '11:30:00', 'Completada', 'Transferencia', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (129, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (130, 2, 2, '2026-09-05', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (130, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (131, 1, 2, '2026-09-05', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (131, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (132, 2, 2, '2026-09-05', '13:00:00', 'Completada', 'Tarjeta', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (132, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (133, 1, 2, '2026-09-05', '15:00:00', 'Completada', 'Transferencia', 0.00, 9000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (133, 5, 9000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (134, 2, 2, '2026-09-07', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (134, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (135, 1, 2, '2026-09-07', '11:30:00', 'Completada', 'Transferencia', 0.00, 12000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (135, 1, 12000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (136, 2, 2, '2026-09-07', '13:00:00', 'Completada', 'Efectivo', 0.00, 6000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (136, 5, 6000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (137, 1, 2, '2026-09-08', '10:00:00', 'Completada', 'Transferencia', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (137, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (138, 2, 2, '2026-09-08', '11:30:00', 'Completada', 'Tarjeta', 0.00, 10000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (138, 5, 10000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (139, 1, 2, '2026-09-09', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (139, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (140, 2, 2, '2026-09-09', '11:30:00', 'Completada', 'Efectivo', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (140, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (141, 1, 2, '2026-09-10', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (141, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (142, 2, 2, '2026-09-10', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (142, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (143, 1, 2, '2026-09-11', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (143, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (144, 2, 2, '2026-09-11', '11:30:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (144, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (145, 1, 2, '2026-09-11', '13:00:00', 'Completada', 'Tarjeta', 0.00, 6000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (145, 5, 6000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (146, 2, 2, '2026-09-12', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (146, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (147, 1, 2, '2026-09-12', '11:30:00', 'Completada', 'Tarjeta', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (147, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (148, 2, 2, '2026-09-12', '13:00:00', 'Completada', 'Transferencia', 0.00, 7000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (148, 5, 7000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (149, 1, 2, '2026-09-14', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (149, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (150, 2, 2, '2026-09-14', '11:30:00', 'Completada', 'Tarjeta', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (150, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (151, 1, 2, '2026-09-14', '13:00:00', 'Completada', 'Efectivo', 0.00, 7000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (151, 5, 7000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (152, 2, 2, '2026-09-15', '10:00:00', 'Completada', 'Transferencia', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (152, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (153, 1, 2, '2026-09-15', '11:30:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (153, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (154, 2, 2, '2026-09-15', '13:00:00', 'Completada', 'Tarjeta', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (154, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (155, 1, 2, '2026-09-16', '10:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (155, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (156, 2, 2, '2026-09-16', '11:30:00', 'Completada', 'Tarjeta', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (156, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (157, 1, 2, '2026-09-16', '13:00:00', 'Completada', 'Efectivo', 0.00, 20000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (157, 3, 20000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (158, 2, 2, '2026-09-16', '15:00:00', 'Completada', 'Tarjeta', 0.00, 14000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (158, 2, 14000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (159, 1, 2, '2026-09-16', '16:30:00', 'Completada', 'Efectivo', 0.00, 9000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (159, 5, 9000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (160, 2, 2, '2026-09-17', '10:00:00', 'Completada', 'Transferencia', 0.00, 8000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (160, 4, 8000.00);
INSERT INTO citas (id, cliente_id, trabajador_id, fecha, hora, estado, metodo_pago, descuento, total_pagado) VALUES (161, 1, 2, '2026-09-17', '11:30:00', 'Completada', 'Transferencia', 0.00, 9000.00);
INSERT INTO cita_detalle (cita_id, servicio_id, precio_cobrado) VALUES (161, 5, 9000.00);

-- 6. INSERTAR CIERRES DIARIOS CONSOLIDADOS
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-17', 60.00, 40.00, 54000.00, 32400.00, 21600.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-18', 60.00, 40.00, 64000.00, 38400.00, 25600.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-19', 60.00, 40.00, 52000.00, 31200.00, 20800.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-21', 60.00, 40.00, 104000.00, 62400.00, 41600.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-22', 60.00, 40.00, 96000.00, 57600.00, 38400.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-24', 60.00, 40.00, 68000.00, 40800.00, 27200.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-25', 60.00, 40.00, 84000.00, 50400.00, 33600.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-26', 60.00, 40.00, 80000.00, 48000.00, 32000.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-27', 60.00, 40.00, 34000.00, 20400.00, 13600.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-28', 60.00, 40.00, 100000.00, 60000.00, 40000.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-29', 60.00, 40.00, 116000.00, 69600.00, 46400.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-08-31', 60.00, 40.00, 106000.00, 63600.00, 42400.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-01', 60.00, 40.00, 92000.00, 55200.00, 36800.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-02', 60.00, 40.00, 167000.00, 100200.00, 66800.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-03', 60.00, 40.00, 63000.00, 37800.00, 25200.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-04', 60.00, 40.00, 12000.00, 7200.00, 4800.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-05', 60.00, 40.00, 205000.00, 123000.00, 82000.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-07', 60.00, 40.00, 73000.00, 43800.00, 29200.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-08', 60.00, 40.00, 86000.00, 51600.00, 34400.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-09', 60.00, 40.00, 82000.00, 49200.00, 32800.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-10', 60.00, 40.00, 88000.00, 52800.00, 35200.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-11', 60.00, 40.00, 130000.00, 78000.00, 52000.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-12', 60.00, 40.00, 121000.00, 72600.00, 48400.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-14', 60.00, 40.00, 130000.00, 78000.00, 52000.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-15', 60.00, 40.00, 172000.00, 103200.00, 68800.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-16', 60.00, 40.00, 225000.00, 135000.00, 90000.00, 1);
INSERT INTO cierres_diarios (fecha, porcentaje_barbero, porcentaje_tienda, total_ingresos, total_barberos, total_tienda, cerrado_por_admin) VALUES ('2026-09-17', 60.00, 40.00, 43000.00, 25800.00, 17200.00, 1);

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- IMPORTACION COMPLETADA CON EXITO TOTAL
-- ============================================================================
