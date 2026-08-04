import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registrarBitacora } from '../utils/bitacora.js';
import { asegurarSchemaProveedores } from './proveedores.controller.js';

const DEFAULT_STOCK_MINIMO = 5;
const DEFAULT_CONFIG = {
  stock_minimo_alerta: String(DEFAULT_STOCK_MINIMO),
  alerta_producto_agotado: '1',
  alerta_stock_bajo: '1',
  alerta_reabastecimiento: '1',
};
const TIPOS_ALERTAS_INVENTARIO = ['Producto agotado', 'Stock bajo', 'Reabastecimiento recomendado', 'Alta demanda'];

const asegurarSchemaAlertas = async (connection = pool) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS alertas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      producto_id INT NULL,
      tipo VARCHAR(80) NOT NULL,
      mensaje TEXT NOT NULL,
      nivel VARCHAR(40) DEFAULT 'Media',
      estado VARCHAR(40) DEFAULT 'Pendiente',
      fecha TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_alertas_producto (producto_id)
    )
  `);
};

const asegurarTablaConfiguracion = async (connection = pool) => {
  await connection.query(`
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
    await connection.query(
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

const obtenerConfiguracionAlertas = async (connection = pool) => {
  await asegurarTablaConfiguracion(connection);
  const [rows] = await connection.query('SELECT clave, valor FROM configuracion_sistema');
  const config = rows.reduce((acc, row) => {
    acc[row.clave] = row.valor;
    return acc;
  }, {});
  const stockMinimo = Number(config.stock_minimo_alerta);

  return {
    stockMinimoAlerta: Number.isFinite(stockMinimo) && stockMinimo >= 0 ? stockMinimo : DEFAULT_STOCK_MINIMO,
    alertaProductoAgotado: config.alerta_producto_agotado !== '0',
    alertaStockBajo: config.alerta_stock_bajo !== '0',
    alertaReabastecimiento: config.alerta_reabastecimiento !== '0',
  };
};

const normalizarEstadoAlerta = (estado = 'Pendiente') => {
  const valor = String(estado || 'Pendiente').trim();
  const equivalencias = {
    Vista: 'Revisada',
    vista: 'Revisada',
    Revisada: 'Revisada',
    revisada: 'Revisada',
    Resuelta: 'Atendida',
    resuelta: 'Atendida',
    Atendido: 'Atendida',
    atendido: 'Atendida',
    Atendida: 'Atendida',
    atendida: 'Atendida',
    Pendiente: 'Pendiente',
    pendiente: 'Pendiente',
    'Pendiente de compra': 'Pendiente de compra',
  };

  return equivalencias[valor] || valor;
};

const mapAlerta = (alerta) => ({
  id: alerta.id,
  productoId: alerta.producto_id,
  producto: alerta.producto,
  categoria: alerta.categoria,
  stockActual: Number(alerta.stock_actual ?? 0),
  limiteStock: Number(alerta.limite_stock ?? DEFAULT_STOCK_MINIMO),
  proveedorId: alerta.proveedor_id || null,
  proveedor: alerta.proveedor || null,
  proveedorTelefono: alerta.proveedor_telefono || '',
  proveedorCorreo: alerta.proveedor_correo || '',
  tipo: alerta.tipo,
  mensaje: alerta.mensaje,
  nivel: alerta.nivel,
  estado: alerta.estado,
  fecha: alerta.fecha,
});

export const obtenerAlertas = asyncHandler(async (req, res) => {
  await asegurarSchemaAlertas();
  await asegurarSchemaProveedores();
  const config = await obtenerConfiguracionAlertas();
  const tiposActivos = [];
  if (config.alertaProductoAgotado) tiposActivos.push('Producto agotado');
  if (config.alertaStockBajo) tiposActivos.push('Stock bajo');
  if (config.alertaReabastecimiento) tiposActivos.push('Reabastecimiento recomendado', 'Alta demanda');

  if (tiposActivos.length === 0) return res.json([]);

  const [rows] = await pool.query(
    `
      SELECT
        a.*,
        p.nombre AS producto,
        c.nombre AS categoria,
        p.stock AS stock_actual,
        p.proveedor_id,
        pr.nombre AS proveedor,
        pr.telefono AS proveedor_telefono,
        pr.correo AS proveedor_correo,
        ? AS limite_stock
      FROM alertas a
      LEFT JOIN productos p ON p.id = a.producto_id
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
      WHERE a.producto_id IS NOT NULL
        AND COALESCE(p.estado, 'Activo') <> 'Inactivo'
        AND a.tipo IN (${tiposActivos.map(() => '?').join(', ')})
        AND a.estado NOT IN ('Atendida', 'Resuelta')
        AND (
          (a.tipo = 'Producto agotado' AND p.stock <= 0)
          OR (a.tipo = 'Stock bajo' AND p.stock > 0 AND p.stock <= ?)
          OR (a.tipo IN ('Reabastecimiento recomendado', 'Alta demanda') AND p.demanda = 'Alta')
        )
      ORDER BY a.fecha DESC
    `,
    [config.stockMinimoAlerta, ...tiposActivos, config.stockMinimoAlerta],
  );

  res.json(rows.map(mapAlerta));
});

export const generarAlertas = asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await asegurarSchemaAlertas(connection);
    const config = await obtenerConfiguracionAlertas(connection);
    await asegurarSchemaProveedores(connection);
    await connection.beginTransaction();

    const [productos] = await connection.query(`
      SELECT p.id, p.nombre, p.stock, p.demanda, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE COALESCE(p.estado, 'Activo') <> 'Inactivo'
    `);

    let generadas = 0;
    const alertasVigentes = [];

    for (const producto of productos) {
      const stock = Number(producto.stock || 0);
      let tipo = null;
      let nivel = null;
      let mensaje = null;

      if (stock <= 0 && config.alertaProductoAgotado) {
        tipo = 'Producto agotado';
        nivel = 'Alta';
        mensaje = `${producto.nombre} no tiene stock disponible.`;
      } else if (stock > 0 && stock <= config.stockMinimoAlerta && config.alertaStockBajo) {
        tipo = 'Stock bajo';
        nivel = 'Advertencia';
        mensaje = `${producto.nombre} tiene ${stock} unidades disponibles. Limite configurado: ${config.stockMinimoAlerta}.`;
      }

      if (!tipo && producto.demanda === 'Alta' && config.alertaReabastecimiento) {
        tipo = 'Reabastecimiento recomendado';
        nivel = 'Advertencia';
        mensaje = `${producto.nombre} tiene demanda alta. Revisa stock y preparacion para horas pico.`;
      }

      if (!tipo) continue;

      const [existentes] = await connection.query(
        `
          SELECT id
          FROM alertas
          WHERE producto_id = ?
            AND tipo = ?
            AND estado NOT IN ('Revisada', 'Atendida', 'Vista', 'Resuelta')
          LIMIT 1
        `,
        [producto.id, tipo],
      );

      if (existentes[0]) {
        await connection.query(
          `
            UPDATE alertas
            SET mensaje = ?,
                nivel = ?,
                estado = CASE
                  WHEN estado = 'Pendiente de compra' THEN 'Pendiente de compra'
                  ELSE 'Pendiente'
                END,
                fecha = CURRENT_TIMESTAMP
            WHERE id = ?
          `,
          [mensaje, nivel, existentes[0].id],
        );
        alertasVigentes.push(existentes[0].id);
      } else {
        const [insertResult] = await connection.query(
          `
            INSERT INTO alertas (producto_id, tipo, mensaje, nivel, estado, fecha)
            VALUES (?, ?, ?, ?, 'Pendiente', CURRENT_TIMESTAMP)
          `,
          [producto.id, tipo, mensaje, nivel],
        );
        alertasVigentes.push(insertResult.insertId);
        generadas += 1;
      }
    }

    const placeholdersTipos = TIPOS_ALERTAS_INVENTARIO.map(() => '?').join(', ');
    const paramsResolver = [...TIPOS_ALERTAS_INVENTARIO];
    let filtroVigentes = '';

    if (alertasVigentes.length > 0) {
      filtroVigentes = `AND id NOT IN (${alertasVigentes.map(() => '?').join(', ')})`;
      paramsResolver.push(...alertasVigentes);
    }

    await connection.query(
      `
        UPDATE alertas
        SET estado = 'Atendida', fecha = CURRENT_TIMESTAMP
        WHERE tipo IN (${placeholdersTipos})
          AND estado NOT IN ('Revisada', 'Atendida', 'Vista', 'Resuelta')
          ${filtroVigentes}
      `,
      paramsResolver,
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Alertas generadas correctamente',
      generadas,
      stockMinimoAlerta: config.stockMinimoAlerta,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const actualizarEstadoAlerta = asyncHandler(async (req, res) => {
  await asegurarSchemaAlertas();
  const { id } = req.params;
  const estado = normalizarEstadoAlerta(req.body.estado);
  const estadosPermitidos = ['Pendiente', 'Pendiente de compra', 'Revisada', 'Atendida'];

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado de alerta no valido' });
  }

  const [anteriores] = await pool.query('SELECT * FROM alertas WHERE id = ? LIMIT 1', [id]);
  const anterior = anteriores[0];
  const [result] = await pool.query('UPDATE alertas SET estado = ? WHERE id = ?', [estado, id]);

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Alerta no encontrada' });

  await registrarBitacora({
    modulo: 'Alertas',
    accion: estado === 'Atendida' ? 'Marcar alerta como atendida' : 'Marcar alerta como revisada',
    descripcion: `Se cambio la alerta ${id} al estado ${estado}.`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), estado },
  });

  res.json({ mensaje: 'Estado de alerta actualizado correctamente' });
});

export const solicitarCompra = asyncHandler(async (req, res) => {
  await asegurarSchemaAlertas();
  await asegurarSchemaProveedores();
  const { id } = req.params;
  const medio = String(req.body.medio || 'WhatsApp').trim();
  const config = await obtenerConfiguracionAlertas();

  const [rows] = await pool.query(
    `
      SELECT
        a.id,
        p.id AS producto_id,
        p.nombre AS producto,
        p.stock AS stock_actual,
        c.nombre AS categoria,
        pr.nombre AS proveedor,
        pr.telefono AS proveedor_telefono,
        pr.correo AS proveedor_correo,
        e.nombre AS empresa
      FROM alertas a
      LEFT JOIN productos p ON p.id = a.producto_id
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
      LEFT JOIN empresa e ON e.id = 1
      WHERE a.id = ?
      LIMIT 1
    `,
    [id],
  );

  const alerta = rows[0];
  if (!alerta) return res.status(404).json({ mensaje: 'Alerta no encontrada' });
  if (!alerta.proveedor) {
    await pool.query('UPDATE alertas SET estado = ? WHERE id = ?', ['Pendiente de compra', id]);

    await registrarBitacora({
      usuario_id: req.body.usuarioId || req.body.usuario_id || null,
      modulo: 'Alertas',
      accion: 'Solicitar compra',
      descripcion: `Se marco el producto ${alerta.producto || `alerta ${id}`} como pendiente de compra sin proveedor asignado.`,
      registro_afectado_id: Number(alerta.producto_id || id),
      datos_anteriores: { estado: alerta.estado || 'Pendiente' },
      datos_nuevos: {
        estado: 'Pendiente de compra',
        proveedor: null,
      },
    });

    return res.json({
      mensaje: 'Producto marcado como pendiente de compra. Agrega un proveedor para preparar WhatsApp o correo.',
      estado: 'Pendiente de compra',
      proveedor: null,
      proveedorTelefono: '',
      proveedorCorreo: '',
      medio,
      mensajeCompra: `Producto pendiente de compra: ${alerta.producto || 'Producto'}. Stock actual: ${Number(alerta.stock_actual || 0)}.`,
      whatsappUrl: null,
      correoAsunto: '',
      correoCuerpo: '',
      mailtoUrl: null,
      gmailUrl: null,
    });
  }

  const telefonoBase = String(alerta.proveedor_telefono || '').replace(/\D/g, '');
  const solicitaWhatsapp = ['WhatsApp', 'Ambas', 'Ambas opciones'].includes(medio);
  const solicitaCorreo = ['Correo', 'Correo predeterminado', 'Gmail', 'Ambas', 'Ambas opciones'].includes(medio);
  const solicitaGmail = ['Gmail', 'Ambas', 'Ambas opciones'].includes(medio);
  const solicitaMailto = ['Correo', 'Correo predeterminado', 'Ambas', 'Ambas opciones'].includes(medio);
  const correo = String(alerta.proveedor_correo || '').trim();
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  if (solicitaWhatsapp && !telefonoBase) {
    return res.status(400).json({ mensaje: 'El proveedor no tiene teléfono registrado.' });
  }

  if (solicitaWhatsapp && telefonoBase.length < 10) {
    return res.status(400).json({ mensaje: 'El teléfono del proveedor no parece válido.' });
  }

  if (solicitaCorreo && !correo) {
    return res.status(400).json({ mensaje: 'El proveedor no tiene correo registrado.' });
  }

  if (solicitaCorreo && !correoValido) {
    return res.status(400).json({ mensaje: 'El correo del proveedor no parece válido.' });
  }

  if (!solicitaWhatsapp && !solicitaCorreo) {
    return res.status(400).json({ mensaje: 'Selecciona WhatsApp, Gmail, Correo predeterminado o Ambas opciones.' });
  }

  await pool.query('UPDATE alertas SET estado = ? WHERE id = ?', ['Pendiente de compra', id]);

  const mensajeCompra = [
    `Hola, buen día. Soy de ${alerta.empresa || 'MercaLink POS'}.`,
    `Necesito solicitar reabastecimiento del producto ${alerta.producto || 'Producto'}.`,
    `Actualmente tenemos ${Number(alerta.stock_actual || 0)} unidades disponibles y el límite configurado es ${config.stockMinimoAlerta}.`,
    '¿Podría apoyarme con disponibilidad, precio y tiempo de entrega?',
  ].join(' ');

  const correoAsunto = `Solicitud de reabastecimiento - ${alerta.producto || 'Producto'}`;
  const correoCuerpo = [
    'Hola, buen día.',
    '',
    `Soy de ${alerta.empresa || 'MercaLink POS'}. Necesito solicitar reabastecimiento del producto ${alerta.producto || 'Producto'}.`,
    '',
    `Stock actual: ${Number(alerta.stock_actual || 0)}`,
    `Límite configurado: ${config.stockMinimoAlerta}`,
    '',
    '¿Podría apoyarme con disponibilidad, precio y tiempo de entrega?',
    '',
    'Gracias.',
  ].join('\n');
  const telefonoWhatsApp = telefonoBase.length === 10
    ? `52${telefonoBase}`
    : telefonoBase.startsWith('52')
      ? telefonoBase
      : telefonoBase;
  const whatsappUrl = solicitaWhatsapp && telefonoWhatsApp
    ? `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeCompra)}`
    : null;
  const mailtoUrl = solicitaMailto && correo
    ? `mailto:${correo}?subject=${encodeURIComponent(correoAsunto)}&body=${encodeURIComponent(correoCuerpo)}`
    : null;
  const gmailUrl = solicitaGmail && correo
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(correo)}&su=${encodeURIComponent(correoAsunto)}&body=${encodeURIComponent(correoCuerpo)}`
    : null;

  await registrarBitacora({
    usuario_id: req.body.usuarioId || req.body.usuario_id || null,
    modulo: 'Alertas',
    accion: 'Solicitar compra',
    descripcion: `Se solicitó reabastecimiento del producto ${alerta.producto || `alerta ${id}`} al proveedor ${alerta.proveedor} por ${medio}.`,
    registro_afectado_id: Number(alerta.producto_id || id),
    datos_anteriores: { estado: 'Pendiente' },
    datos_nuevos: {
      estado: 'Pendiente de compra',
      proveedor: alerta.proveedor || null,
      proveedorTelefono: alerta.proveedor_telefono || '',
      proveedorCorreo: correo,
      medio,
      mensajeCompra,
      whatsappUrl,
      mailtoUrl,
      gmailUrl,
    },
  });

  res.json({
    mensaje: 'Solicitud preparada correctamente',
    estado: 'Pendiente de compra',
    proveedor: alerta.proveedor || null,
    proveedorTelefono: alerta.proveedor_telefono || '',
    proveedorCorreo: correo,
    medio,
    mensajeCompra,
    whatsappUrl,
    correoAsunto,
    correoCuerpo,
    mailtoUrl,
    gmailUrl,
  });
});

