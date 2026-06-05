import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registrarBitacora } from '../utils/bitacora.js';

const DEFAULT_STOCK_MINIMO = 5;
const DEFAULT_CONFIG = {
  stock_minimo_alerta: String(DEFAULT_STOCK_MINIMO),
  alerta_producto_agotado: '1',
  alerta_stock_bajo: '1',
  alerta_reabastecimiento: '1',
};

const asegurarTablaConfiguracion = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS configuracion_sistema (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empresa_id INT NULL,
      clave VARCHAR(80) NOT NULL,
      valor VARCHAR(255) NOT NULL,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_configuracion_clave (clave)
    )
  `);

  for (const [clave, valor] of Object.entries(DEFAULT_CONFIG)) {
    await pool.query(
      `
        INSERT INTO configuracion_sistema (clave, valor)
        SELECT ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM configuracion_sistema WHERE clave = ?
        )
      `,
      [clave, valor, clave],
    );
  }
};

export const obtenerConfiguracion = asyncHandler(async (req, res) => {
  await asegurarTablaConfiguracion();

  const [rows] = await pool.query('SELECT clave, valor FROM configuracion_sistema');
  const config = rows.reduce((acc, row) => {
    acc[row.clave] = row.valor;
    return acc;
  }, {});

  res.json({
    stockMinimoAlerta: Number(config.stock_minimo_alerta || DEFAULT_STOCK_MINIMO),
    alertaProductoAgotado: config.alerta_producto_agotado !== '0',
    alertaStockBajo: config.alerta_stock_bajo !== '0',
    alertaReabastecimiento: config.alerta_reabastecimiento !== '0',
    raw: config,
  });
});

export const actualizarConfiguracion = asyncHandler(async (req, res) => {
  await asegurarTablaConfiguracion();
  const [anterioresRows] = await pool.query('SELECT clave, valor FROM configuracion_sistema');
  const anteriores = anterioresRows.reduce((acc, row) => {
    acc[row.clave] = row.valor;
    return acc;
  }, {});

  const stockMinimoAlerta = Number(req.body.stockMinimoAlerta ?? req.body.stock_minimo_alerta);
  const alertaProductoAgotado = req.body.alertaProductoAgotado ?? req.body.alerta_producto_agotado ?? true;
  const alertaStockBajo = req.body.alertaStockBajo ?? req.body.alerta_stock_bajo ?? true;
  const alertaReabastecimiento = req.body.alertaReabastecimiento ?? req.body.alerta_reabastecimiento ?? true;

  if (!Number.isInteger(stockMinimoAlerta) || stockMinimoAlerta < 0) {
    return res.status(400).json({
      mensaje: 'El stock mínimo para alerta debe ser un número entero igual o mayor a 0',
    });
  }

  const valores = {
    stock_minimo_alerta: String(stockMinimoAlerta),
    alerta_producto_agotado: alertaProductoAgotado ? '1' : '0',
    alerta_stock_bajo: alertaStockBajo ? '1' : '0',
    alerta_reabastecimiento: alertaReabastecimiento ? '1' : '0',
  };

  for (const [clave, valor] of Object.entries(valores)) {
    await pool.query(
      `
        INSERT INTO configuracion_sistema (clave, valor)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor), fecha_actualizacion = CURRENT_TIMESTAMP
      `,
      [clave, valor],
    );
  }

  await registrarBitacora({
    modulo: 'Configuración',
    accion: 'Cambiar preferencias de notificaciones',
    descripcion: 'Se actualizaron las preferencias de notificaciones y stock mínimo.',
    datos_anteriores: anteriores,
    datos_nuevos: valores,
  });

  if (anteriores.stock_minimo_alerta !== valores.stock_minimo_alerta) {
    await registrarBitacora({
      modulo: 'Configuración',
      accion: 'Cambiar stock mínimo de alerta',
      descripcion: `Se cambió el stock mínimo de alerta de ${anteriores.stock_minimo_alerta ?? 'N/A'} a ${valores.stock_minimo_alerta}.`,
      datos_anteriores: { stock_minimo_alerta: anteriores.stock_minimo_alerta },
      datos_nuevos: { stock_minimo_alerta: valores.stock_minimo_alerta },
    });
  }

  res.json({
    mensaje: 'Configuración actualizada correctamente',
    stockMinimoAlerta,
    alertaProductoAgotado: Boolean(alertaProductoAgotado),
    alertaStockBajo: Boolean(alertaStockBajo),
    alertaReabastecimiento: Boolean(alertaReabastecimiento),
  });
});
