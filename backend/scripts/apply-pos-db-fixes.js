import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'merkalink_ai',
  port: process.env.DB_PORT || 3306,
});

const exec = async (sql) => {
  await connection.query(sql);
  console.log(`OK: ${sql.replace(/\s+/g, ' ').slice(0, 120)}`);
};

await exec(
  "ALTER TABLE usuarios MODIFY COLUMN rol ENUM('Administrador','Cajero','Empleado','Tecnico','Supervisor') NULL DEFAULT 'Cajero'",
);

await exec("UPDATE productos SET codigo_barras = NULL WHERE codigo_barras = ''");

await exec(`
  INSERT INTO usuarios (nombre, correo, password, rol, estado)
  VALUES
    ('Administrador General', 'admin@merkalinkpos.com', '123456', 'Administrador', 'Activo'),
    ('Cajero Principal', 'cajero@merkalinkpos.com', '123456', 'Cajero', 'Activo')
  ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    password = VALUES(password),
    rol = VALUES(rol),
    estado = VALUES(estado)
`);

await exec(`
  INSERT INTO canales (nombre, tipo, estado)
  VALUES ('Punto de venta', 'Presencial', 'Activo')
  ON DUPLICATE KEY UPDATE
    tipo = VALUES(tipo),
    estado = VALUES(estado)
`);

await exec(`
  INSERT INTO categorias (nombre)
  SELECT nombre FROM (
    SELECT 'Comidas' AS nombre UNION ALL
    SELECT 'Bebidas' UNION ALL
    SELECT 'Postres' UNION ALL
    SELECT 'Combos' UNION ALL
    SELECT 'Extras' UNION ALL
    SELECT 'Abarrotes'
  ) nuevas
  WHERE NOT EXISTS (
    SELECT 1
    FROM categorias c
    WHERE c.nombre = nuevas.nombre
  )
`);

await exec(`
  INSERT INTO productos (sku, codigo_barras, nombre, categoria_id, precio, precio_sugerido, stock, demanda, promedio_ventas_diarias, estado)
  SELECT demo.sku, demo.codigo_barras, demo.nombre, c.id, demo.precio, demo.precio, demo.stock, 'Media', 0, 'Activo'
  FROM (
    SELECT 'POS-HAM-001' sku, '750100000001' codigo_barras, 'Hamburguesa clasica' nombre, 'Comidas' categoria, 89.00 precio, 50 stock UNION ALL
    SELECT 'POS-PIZ-002', '750100000002', 'Pizza individual', 'Comidas', 99.00, 40 UNION ALL
    SELECT 'POS-TAC-003', '750100000003', 'Tacos al pastor', 'Comidas', 75.00, 60 UNION ALL
    SELECT 'POS-AGU-004', '750100000004', 'Agua natural', 'Bebidas', 18.00, 100 UNION ALL
    SELECT 'POS-REF-005', '750100000005', 'Refresco cola', 'Bebidas', 25.00, 90 UNION ALL
    SELECT 'POS-CAF-006', '750100000006', 'Cafe americano', 'Bebidas', 35.00, 70 UNION ALL
    SELECT 'POS-PAS-007', '750100000007', 'Pastel de chocolate', 'Postres', 55.00, 30 UNION ALL
    SELECT 'POS-PAP-008', '750100000008', 'Papas a la francesa', 'Extras', 45.00, 45 UNION ALL
    SELECT 'POS-CHB-009', '750100000009', 'Combo hamburguesa', 'Combos', 129.00, 35 UNION ALL
    SELECT 'POS-CPZ-010', '750100000010', 'Combo pizza', 'Combos', 139.00, 35
  ) demo
  INNER JOIN categorias c ON c.nombre = demo.categoria
  WHERE NOT EXISTS (
    SELECT 1
    FROM productos p
    WHERE p.sku = demo.sku
      OR p.codigo_barras = demo.codigo_barras
  )
`);

await exec(`
  INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
  SELECT
    v.id,
    v.producto_id,
    v.cantidad,
    ROUND(v.total / NULLIF(v.cantidad, 0), 2),
    v.total
  FROM ventas v
  WHERE v.producto_id IS NOT NULL
    AND v.cantidad IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM detalle_ventas d
      WHERE d.venta_id = v.id
    )
`);

const [duplicates] = await connection.query(`
  SELECT codigo_barras, COUNT(*) total
  FROM productos
  WHERE codigo_barras IS NOT NULL
  GROUP BY codigo_barras
  HAVING COUNT(*) > 1
`);

const [uniqueIndexes] = await connection.query(`
  SELECT COUNT(*) total
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'productos'
    AND COLUMN_NAME = 'codigo_barras'
    AND NON_UNIQUE = 0
`);

if (duplicates.length === 0 && Number(uniqueIndexes[0].total) === 0) {
  await exec('ALTER TABLE productos ADD UNIQUE KEY uq_productos_codigo_barras (codigo_barras)');
} else {
  console.log(
    `SKIP UNIQUE codigo_barras: duplicados=${duplicates.length}, uniqueExistente=${uniqueIndexes[0].total}`,
  );
}

await connection.end();
