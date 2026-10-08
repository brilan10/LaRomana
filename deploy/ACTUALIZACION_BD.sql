-- ==============================================================================
-- 💈 LA ROMANA - SCRIPT DE ACTUALIZACIÓN DE BASE DE DATOS
-- Ejecutar en cPanel / phpMyAdmin (Base de datos: laromana_basededatos)
-- ==============================================================================

-- 1. PORCENTAJE DE COMISIÓN Y FRECUENCIA DE PAGO POR BARBERO (PUNTO 6)
-- Permite que cada barbero trabaje con su propio porcentaje y modalidad distinta (ej. Luis mensual, Carlos y Pedro quincenal)
ALTER TABLE trabajadores 
ADD COLUMN IF NOT EXISTS porcentaje_comision DECIMAL(5,2) DEFAULT 60.00;

ALTER TABLE trabajadores 
ADD COLUMN IF NOT EXISTS frecuencia_pago VARCHAR(20) DEFAULT 'quincenal';

-- Si tu MySQL no soporta "IF NOT EXISTS", usa estas alternativas si te da error:
-- ALTER TABLE trabajadores ADD COLUMN porcentaje_comision DECIMAL(5,2) DEFAULT 60.00;
-- ALTER TABLE trabajadores ADD COLUMN frecuencia_pago VARCHAR(20) DEFAULT 'quincenal';

-- Asegurar que los barberos existentes tengan sus valores asignados
UPDATE trabajadores 
SET porcentaje_comision = 60.00 
WHERE porcentaje_comision IS NULL;

UPDATE trabajadores 
SET frecuencia_pago = 'quincenal' 
WHERE frecuencia_pago IS NULL OR frecuencia_pago = '';

-- Modalidades específicas: Luis cobra Mensual, Carlos y Pedro Quincenal
UPDATE trabajadores SET frecuencia_pago = 'mensual' WHERE nombre LIKE '%Luis%';
UPDATE trabajadores SET frecuencia_pago = 'quincenal' WHERE nombre LIKE '%Carlos%' OR nombre LIKE '%Pedro%';



-- 2. DIVISIÓN DE PERFUMES EN HOMBRE Y MUJER (PUNTO 7)
-- Renombrar categoría 2 'Perfumes y Decants' a 'Perfumes Hombre'
UPDATE categorias 
SET nombre = 'Perfumes Hombre' 
WHERE id = 2 OR nombre = 'Perfumes y Decants';

-- Crear la nueva categoría 'Perfumes Mujer' (ID 4 o auto-increment)
INSERT INTO categorias (id, nombre) 
VALUES (4, 'Perfumes Mujer')
ON DUPLICATE KEY UPDATE nombre = 'Perfumes Mujer';


-- 3. PERFUMES DE MUJER PARA EL CATÁLOGO (PUNTO 7)
-- Agrega perfumes femeninos para poblar la nueva categoría de mujer
INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, imagen_url, ventas)
SELECT 4, 'Perfume Carolina Herrera Good Girl (80ml)', 'Fragancia icónica y seductora para mujer con notas de jazmín, haba tonka y cacao.', 115000.00, 12, '/assets/fotos/perfume/perfume2.jpg', 18
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre LIKE '%Good Girl%');

INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, imagen_url, ventas)
SELECT 4, 'Decant Lancôme La Vie Est Belle (10ml)', 'Decant exclusivo femenino de alta duración con notas de iris, pachulí y vainilla.', 18000.00, 25, '/assets/fotos/perfume/decant.png', 32
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre LIKE '%La Vie Est Belle%');

INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, imagen_url, ventas)
SELECT 4, 'Perfume Chanel Coco Mademoiselle (100ml)', 'Elegancia oriental fresca para dama con acordes de naranja viva, rosa y pachulí.', 125000.00, 8, '/assets/fotos/perfume/Perfume1.webp', 14
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre LIKE '%Coco Mademoiselle%');

INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, imagen_url, ventas)
SELECT 4, 'Decant YSL Libre Eau de Parfum (10ml)', 'Decant de autor floral sensual con lavanda francesa y flor de azahar de Marruecos.', 20000.00, 20, '/assets/fotos/perfume/decant.png', 21
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre LIKE '%Libre%');

-- ==============================================================================
-- ¡Listo! Cambios de base de datos completados.
-- ==============================================================================
