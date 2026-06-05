import mysql from 'mysql2/promise';

const database = process.env.DB_NAME || 'merkalink_ai';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database,
  port: process.env.DB_PORT || 3306,
});

const [users] = await connection.query(
  'SELECT id, nombre, correo, password, rol, estado FROM usuarios WHERE correo IN (?, ?)',
  ['admin@merkalinkpos.com', 'cajero@merkalinkpos.com'],
);
console.log('\n## demo_users');
console.table(users);

const [ventas] = await connection.query('SELECT COUNT(*) ventas FROM ventas');
const [detalles] = await connection.query('SELECT COUNT(*) detalles FROM detalle_ventas');
const [legacyWithoutDetail] = await connection.query(`
  SELECT COUNT(*) legacy_sin_detalle
  FROM ventas v
  WHERE v.producto_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM detalle_ventas d
      WHERE d.venta_id = v.id
    )
`);

console.log('\n## counts');
console.table([
  {
    ventas: ventas[0].ventas,
    detalles: detalles[0].detalles,
    legacy_sin_detalle: legacyWithoutDetail[0].legacy_sin_detalle,
  },
]);

const [barcodeIndexes] = await connection.query(
  "SHOW INDEX FROM productos WHERE Column_name = 'codigo_barras'",
);
console.log('\n## codigo_barras_indexes');
console.table(barcodeIndexes.map((item) => ({
  Key_name: item.Key_name,
  Non_unique: item.Non_unique,
})));

const [posChannels] = await connection.query(`
  SELECT *
  FROM canales
  WHERE nombre IN ('Punto de venta', 'Tienda física')
  ORDER BY id
`);
console.log('\n## canales_pos');
console.table(posChannels);

const [coreColumns] = await connection.query(
  `
    SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME IN ('usuarios', 'ventas', 'detalle_ventas', 'productos')
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `,
  [database],
);
console.log('\n## columns_core');
console.table(coreColumns);

await connection.end();
