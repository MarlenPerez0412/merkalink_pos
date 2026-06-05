import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { asegurarTablaBitacora, registrarBitacora } from '../utils/bitacora.js';

let cortesSchemaListo = false;

const asegurarSchemaCortes = async () => {
  if (cortesSchemaListo) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cortes_caja (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empresa_id INT NULL,
      usuario_id INT NULL,
      canal_id INT NULL,
      folio VARCHAR(30),
      turno ENUM('Matutino','Vespertino','Nocturno','Personalizado') DEFAULT 'Personalizado',
      fecha DATE NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fin TIME NOT NULL,
      total_ventas DECIMAL(10,2) DEFAULT 0,
      total_efectivo DECIMAL(10,2) DEFAULT 0,
      total_tarjeta DECIMAL(10,2) DEFAULT 0,
      total_transferencia DECIMAL(10,2) DEFAULT 0,
      monto_contado DECIMAL(10,2) DEFAULT 0,
      diferencia DECIMAL(10,2) DEFAULT 0,
      observaciones TEXT NULL,
      estado ENUM('cerrado','cancelado') DEFAULT 'cerrado',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS corte_caja_detalle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      corte_id INT NOT NULL,
      venta_id INT NOT NULL,
      UNIQUE KEY uq_corte_venta (corte_id, venta_id)
    )
  `);

  cortesSchemaListo = true;
};

const mapCorte = (corte) => ({
  id: corte.id,
  empresaId: corte.empresa_id || null,
  usuarioId: corte.usuario_id || null,
  cajero: corte.cajero || null,
  canalId: corte.canal_id || null,
  canal: corte.canal || null,
  folio: corte.folio,
  turno: corte.turno,
  fecha: corte.fecha,
  horaInicio: corte.hora_inicio,
  horaFin: corte.hora_fin,
  totalVentas: Number(corte.total_ventas || 0),
  totalEfectivo: Number(corte.total_efectivo || 0),
  totalTarjeta: Number(corte.total_tarjeta || 0),
  totalTransferencia: Number(corte.total_transferencia || 0),
  montoContado: Number(corte.monto_contado || 0),
  diferencia: Number(corte.diferencia || 0),
  observaciones: corte.observaciones || '',
  estado: corte.estado || 'cerrado',
  fechaCreacion: corte.fecha_creacion || null,
  numeroVentas: Number(corte.numero_ventas || 0),
});

const construirWhereVentas = ({ fecha, horaInicio, horaFin, usuarioId, canalId }) => {
  const params = [fecha, horaInicio, horaFin];
  const conditions = ['DATE(v.fecha) = ? AND TIME(v.fecha) BETWEEN ? AND ?'];

  if (usuarioId) {
    conditions.push('v.usuario_id = ?');
    params.push(usuarioId);
  }

  if (canalId) {
    conditions.push('v.canal_id = ?');
    params.push(canalId);
  }

  return { where: conditions.join(' AND '), params };
};

const esRolCajero = (rol = '') => String(rol || '').trim().toLowerCase() === 'cajero';

const obtenerAlcanceUsuario = (source = {}) => {
  const rol = source.rol || '';
  const usuarioActualId = source.usuarioActualId || source.usuario_actual_id || source.usuario_id || source.usuarioId || null;

  if (!esRolCajero(rol)) return { rol, usuarioActualId: usuarioActualId ? Number(usuarioActualId) : null, esCajero: false };

  return {
    rol,
    usuarioActualId: usuarioActualId ? Number(usuarioActualId) : null,
    esCajero: true,
  };
};

const asegurarAccesoCorte = (corte, alcance) => {
  if (!alcance.esCajero) return true;
  return Boolean(alcance.usuarioActualId && corte.usuarioId === alcance.usuarioActualId);
};

const obtenerVentasRangoCorte = async (connection, { fecha, horaInicio, horaFin, usuarioId, canalId }) => {
  const { where, params } = construirWhereVentas({ fecha, horaInicio, horaFin, usuarioId, canalId });
  const [ventas] = await connection.query(
    `
      SELECT id, metodo_pago, total
      FROM ventas v
      WHERE ${where}
        AND COALESCE(v.estado, 'Completada') <> 'Cancelada'
    `,
    params,
  );

  return ventas;
};

const sincronizarDetalleCorteSiEstaVacio = async (connection, corte) => {
  const corteMapeado = mapCorte(corte);
  if (corteMapeado.numeroVentas > 0) return corteMapeado;

  const fechaCorte = corteMapeado.fecha instanceof Date
    ? corteMapeado.fecha.toISOString().slice(0, 10)
    : String(corteMapeado.fecha).slice(0, 10);
  const ventas = await obtenerVentasRangoCorte(connection, {
    fecha: fechaCorte,
    horaInicio: corteMapeado.horaInicio,
    horaFin: corteMapeado.horaFin,
    usuarioId: corteMapeado.usuarioId,
    canalId: corteMapeado.canalId,
  });

  if (ventas.length === 0) return corteMapeado;

  const totalVentas = ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  const totalEfectivo = ventas
    .filter((venta) => venta.metodo_pago === 'Efectivo')
    .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  const totalTarjeta = ventas
    .filter((venta) => venta.metodo_pago === 'Tarjeta')
    .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  const totalTransferencia = ventas
    .filter((venta) => venta.metodo_pago === 'Transferencia')
    .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  const diferencia = Number(corteMapeado.montoContado || 0) - totalEfectivo;

  for (const venta of ventas) {
    await connection.query('INSERT IGNORE INTO corte_caja_detalle (corte_id, venta_id) VALUES (?, ?)', [
      corteMapeado.id,
      venta.id,
    ]);
  }

  await connection.query(
    `
      UPDATE cortes_caja
      SET total_ventas = ?, total_efectivo = ?, total_tarjeta = ?, total_transferencia = ?, diferencia = ?
      WHERE id = ?
    `,
    [totalVentas, totalEfectivo, totalTarjeta, totalTransferencia, diferencia, corteMapeado.id],
  );

  return {
    ...corteMapeado,
    totalVentas,
    totalEfectivo,
    totalTarjeta,
    totalTransferencia,
    diferencia,
    numeroVentas: ventas.length,
  };
};

export const obtenerCortesCaja = asyncHandler(async (req, res) => {
  await asegurarSchemaCortes();
  const alcance = obtenerAlcanceUsuario(req.query);
  const filtros = [];
  const params = [];

  if (alcance.esCajero) {
    if (!alcance.usuarioActualId) return res.status(400).json({ mensaje: 'Usuario cajero no identificado' });
    filtros.push('cc.usuario_id = ?');
    params.push(alcance.usuarioActualId);
  } else if (req.query.usuario_id) {
    filtros.push('cc.usuario_id = ?');
    params.push(req.query.usuario_id);
  }

  const whereSql = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT cc.*, u.nombre AS cajero, c.nombre AS canal, COUNT(cd.venta_id) AS numero_ventas
    FROM cortes_caja cc
    LEFT JOIN usuarios u ON u.id = cc.usuario_id
    LEFT JOIN canales c ON c.id = cc.canal_id
    LEFT JOIN corte_caja_detalle cd ON cd.corte_id = cc.id
    ${whereSql}
    GROUP BY cc.id, u.nombre, c.nombre
    ORDER BY cc.fecha_creacion DESC
  `, params);

  res.json(rows.map(mapCorte));
});

export const crearCorteCaja = asyncHandler(async (req, res) => {
  await asegurarSchemaCortes();

  const {
    empresaId = null,
    usuarioId = null,
    canalId = null,
    usuarioActualId = null,
    rol = '',
    turno = 'Personalizado',
    fecha,
    horaInicio,
    horaFin,
    montoContado = 0,
    observaciones = '',
  } = req.body;

  const alcance = obtenerAlcanceUsuario({ rol, usuarioActualId, usuarioId });
  const usuarioIdFinal = alcance.esCajero ? alcance.usuarioActualId : usuarioId;

  if (alcance.esCajero && !usuarioIdFinal) {
    return res.status(400).json({ mensaje: 'Usuario cajero no identificado' });
  }

  if (!fecha || !horaInicio || !horaFin) {
    return res.status(400).json({ mensaje: 'Fecha, hora inicio y hora fin son obligatorios' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const ventas = await obtenerVentasRangoCorte(connection, { fecha, horaInicio, horaFin, usuarioId: usuarioIdFinal, canalId });

    const totalVentas = ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
    const totalEfectivo = ventas
      .filter((venta) => venta.metodo_pago === 'Efectivo')
      .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
    const totalTarjeta = ventas
      .filter((venta) => venta.metodo_pago === 'Tarjeta')
      .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
    const totalTransferencia = ventas
      .filter((venta) => venta.metodo_pago === 'Transferencia')
      .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
    const diferencia = Number(montoContado || 0) - totalEfectivo;

    const [result] = await connection.query(
      `
        INSERT INTO cortes_caja
          (empresa_id, usuario_id, canal_id, turno, fecha, hora_inicio, hora_fin, total_ventas, total_efectivo,
           total_tarjeta, total_transferencia, monto_contado, diferencia, observaciones, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cerrado')
      `,
      [
        empresaId,
        usuarioIdFinal || null,
        canalId || null,
        turno,
        fecha,
        horaInicio,
        horaFin,
        totalVentas,
        totalEfectivo,
        totalTarjeta,
        totalTransferencia,
        Number(montoContado || 0),
        diferencia,
        observaciones || null,
      ],
    );

    const corteId = result.insertId;
    const folio = `CC-${String(corteId).padStart(6, '0')}`;
    await connection.query('UPDATE cortes_caja SET folio = ? WHERE id = ?', [folio, corteId]);

    for (const venta of ventas) {
      await connection.query('INSERT IGNORE INTO corte_caja_detalle (corte_id, venta_id) VALUES (?, ?)', [
        corteId,
        venta.id,
      ]);
    }

    await connection.commit();

    await registrarBitacora({
      modulo: 'Cortes de caja',
      accion: 'Crear corte de caja',
      descripcion: `Se creo el corte de caja ${folio}.`,
      registro_afectado_id: corteId,
      datos_nuevos: {
        id: corteId,
        folio,
        usuario_id: usuarioIdFinal || null,
        canal_id: canalId || null,
        turno,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        total_ventas: totalVentas,
        total_efectivo: totalEfectivo,
        total_tarjeta: totalTarjeta,
        total_transferencia: totalTransferencia,
        monto_contado: Number(montoContado || 0),
        diferencia,
        ventasIncluidas: ventas.map((venta) => venta.id),
      },
    });

    res.status(201).json({ id: corteId, folio, mensaje: 'Corte de caja generado correctamente' });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

const obtenerDetalleCorte = async (id) => {
  const [cortes] = await pool.query(
    `
      SELECT cc.*, u.nombre AS cajero, c.nombre AS canal, COUNT(cd.venta_id) AS numero_ventas
      FROM cortes_caja cc
      LEFT JOIN usuarios u ON u.id = cc.usuario_id
      LEFT JOIN canales c ON c.id = cc.canal_id
      LEFT JOIN corte_caja_detalle cd ON cd.corte_id = cc.id
      WHERE cc.id = ?
      GROUP BY cc.id, u.nombre, c.nombre
      LIMIT 1
    `,
    [id],
  );

  const corte = cortes[0];
  if (!corte) return null;
  const corteSincronizado = await sincronizarDetalleCorteSiEstaVacio(pool, corte);

  const [ventas] = await pool.query(
    `
      SELECT v.id, v.folio, v.fecha, v.metodo_pago, v.total, u.nombre AS cajero, c.nombre AS canal
      FROM corte_caja_detalle cd
      INNER JOIN ventas v ON v.id = cd.venta_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      LEFT JOIN canales c ON c.id = v.canal_id
      WHERE cd.corte_id = ?
      ORDER BY v.fecha ASC
    `,
    [id],
  );

  const [productos] = await pool.query(
    `
      SELECT p.id, p.nombre, SUM(d.cantidad) AS cantidad, SUM(d.subtotal) AS total
      FROM corte_caja_detalle cd
      INNER JOIN detalle_ventas d ON d.venta_id = cd.venta_id
      INNER JOIN productos p ON p.id = d.producto_id
      WHERE cd.corte_id = ?
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
    `,
    [id],
  );

  return {
    ...corteSincronizado,
    ventas: ventas.map((venta) => ({
      id: venta.id,
      folio: venta.folio || `POS-${String(venta.id).padStart(6, '0')}`,
      fecha: venta.fecha,
      metodoPago: venta.metodo_pago,
      total: Number(venta.total || 0),
      cajero: venta.cajero || null,
      canal: venta.canal || null,
    })),
    productos: productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      cantidad: Number(producto.cantidad || 0),
      total: Number(producto.total || 0),
    })),
  };
};

export const obtenerCorteCajaPorId = asyncHandler(async (req, res) => {
  await asegurarSchemaCortes();
  const alcance = obtenerAlcanceUsuario(req.query);
  const corte = await obtenerDetalleCorte(req.params.id);

  if (!corte) return res.status(404).json({ mensaje: 'Corte de caja no encontrado' });
  if (!asegurarAccesoCorte(corte, alcance)) {
    return res.status(403).json({ mensaje: 'No tienes permiso para consultar este corte' });
  }

  res.json(corte);
});

export const obtenerPdfDataCorte = asyncHandler(async (req, res) => {
  await asegurarSchemaCortes();
  const alcance = obtenerAlcanceUsuario(req.query);
  const corte = await obtenerDetalleCorte(req.params.id);

  if (!corte) return res.status(404).json({ mensaje: 'Corte de caja no encontrado' });
  if (!asegurarAccesoCorte(corte, alcance)) {
    return res.status(403).json({ mensaje: 'No tienes permiso para consultar este corte' });
  }

  const [empresaRows] = await pool.query('SELECT * FROM empresa LIMIT 1');
  await registrarBitacora({
    modulo: 'Cortes de caja',
    accion: 'Generar PDF de corte',
    descripcion: `Se solicitaron datos para generar PDF del corte ${corte.folio}.`,
    registro_afectado_id: Number(req.params.id),
    datos_nuevos: { folio: corte.folio },
  });
  res.json({ empresa: empresaRows[0] || null, corte });
});

export const obtenerReporteCorteCaja = asyncHandler(async (req, res) => {
  await asegurarSchemaCortes();
  const alcance = obtenerAlcanceUsuario(req.query);
  const corte = await obtenerDetalleCorte(req.params.id);

  if (!corte) return res.status(404).json({ mensaje: 'Corte de caja no encontrado' });
  if (!asegurarAccesoCorte(corte, alcance)) {
    return res.status(403).json({ mensaje: 'No tienes permiso para consultar este corte' });
  }

  const [empresaRows] = await pool.query('SELECT * FROM empresa LIMIT 1');

  const [ventasRows] = await pool.query(
    `
      SELECT
        v.id,
        v.folio,
        v.fecha,
        v.metodo_pago,
        v.total,
        u.nombre AS cajero,
        c.nombre AS canal,
        GROUP_CONCAT(CONCAT(p.nombre, ' x', d.cantidad) ORDER BY p.nombre SEPARATOR ', ') AS productos
      FROM corte_caja_detalle cd
      INNER JOIN ventas v ON v.id = cd.venta_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      LEFT JOIN canales c ON c.id = v.canal_id
      LEFT JOIN detalle_ventas d ON d.venta_id = v.id
      LEFT JOIN productos p ON p.id = d.producto_id
      WHERE cd.corte_id = ?
      GROUP BY v.id, v.folio, v.fecha, v.metodo_pago, v.total, u.nombre, c.nombre
      ORDER BY v.fecha ASC
    `,
    [req.params.id],
  );

  const [productosRows] = await pool.query(
    `
      SELECT
        p.id,
        p.nombre,
        cat.nombre AS categoria,
        SUM(d.cantidad) AS cantidad,
        AVG(d.precio_unitario) AS precio_promedio,
        SUM(d.subtotal) AS total
      FROM corte_caja_detalle cd
      INNER JOIN detalle_ventas d ON d.venta_id = cd.venta_id
      INNER JOIN productos p ON p.id = d.producto_id
      LEFT JOIN categorias cat ON cat.id = p.categoria_id
      WHERE cd.corte_id = ?
      GROUP BY p.id, p.nombre, cat.nombre
      ORDER BY cantidad DESC
    `,
    [req.params.id],
  );

  const [metodoRows] = await pool.query(
    `
      SELECT
        COALESCE(v.metodo_pago, 'Otro') AS metodo,
        COUNT(*) AS tickets,
        SUM(v.total) AS total
      FROM corte_caja_detalle cd
      INNER JOIN ventas v ON v.id = cd.venta_id
      WHERE cd.corte_id = ?
      GROUP BY COALESCE(v.metodo_pago, 'Otro')
      ORDER BY total DESC
    `,
    [req.params.id],
  );

  const [canalRows] = await pool.query(
    `
      SELECT
        COALESCE(c.nombre, 'Sin origen') AS canal,
        COUNT(*) AS tickets,
        SUM(v.total) AS total
      FROM corte_caja_detalle cd
      INNER JOIN ventas v ON v.id = cd.venta_id
      LEFT JOIN canales c ON c.id = v.canal_id
      WHERE cd.corte_id = ?
      GROUP BY COALESCE(c.nombre, 'Sin origen')
      ORDER BY total DESC
    `,
    [req.params.id],
  );

  const [cajeroRows] = await pool.query(
    `
      SELECT
        COALESCE(u.nombre, 'Sin cajero registrado') AS cajero,
        COUNT(*) AS tickets,
        SUM(v.total) AS total,
        SUM(CASE WHEN v.metodo_pago = 'Efectivo' THEN v.total ELSE 0 END) AS efectivo,
        SUM(CASE WHEN v.metodo_pago = 'Tarjeta' THEN v.total ELSE 0 END) AS tarjeta,
        SUM(CASE WHEN v.metodo_pago = 'Transferencia' THEN v.total ELSE 0 END) AS transferencia
      FROM corte_caja_detalle cd
      INNER JOIN ventas v ON v.id = cd.venta_id
      LEFT JOIN usuarios u ON u.id = v.usuario_id
      WHERE cd.corte_id = ?
      GROUP BY COALESCE(u.nombre, 'Sin cajero registrado')
      ORDER BY total DESC
    `,
    [req.params.id],
  );

  let movimientos = [];
  let hayMasMovimientos = false;
  try {
    await asegurarTablaBitacora();
    const fechaCorte = corte.fecha instanceof Date ? corte.fecha.toISOString().slice(0, 10) : String(corte.fecha).slice(0, 10);
    const params = [fechaCorte, corte.horaInicio, fechaCorte, corte.horaFin];
    const condiciones = ['b.fecha BETWEEN CONCAT(?, " ", ?) AND CONCAT(?, " ", ?)'];

    if (corte.empresaId) {
      condiciones.push('(b.empresa_id IS NULL OR b.empresa_id = ?)');
      params.push(corte.empresaId);
    }

    if (corte.usuarioId) {
      condiciones.push('(b.usuario_id IS NULL OR b.usuario_id = ?)');
      params.push(corte.usuarioId);
    }

    const [movimientosRows] = await pool.query(
      `
        SELECT b.*, u.nombre AS usuario
        FROM bitacora_sistema b
        LEFT JOIN usuarios u ON u.id = b.usuario_id
        WHERE ${condiciones.join(' AND ')}
        ORDER BY b.fecha ASC
        LIMIT 21
      `,
      params,
    );

    hayMasMovimientos = movimientosRows.length > 20;
    movimientos = movimientosRows.slice(0, 20).map((movimiento) => ({
      id: movimiento.id,
      fecha: movimiento.fecha,
      usuario: movimiento.usuario || 'Sistema',
      modulo: movimiento.modulo,
      accion: movimiento.accion,
      descripcion: movimiento.descripcion,
      registroAfectadoId: movimiento.registro_afectado_id,
    }));
  } catch (error) {
    console.warn('No se pudieron consultar movimientos para el reporte de corte:', error.message);
  }

  const ventas = ventasRows.map((venta) => ({
    id: venta.id,
    folio: venta.folio || `POS-${String(venta.id).padStart(6, '0')}`,
    fecha: venta.fecha,
    metodoPago: venta.metodo_pago || 'Otro',
    total: Number(venta.total || 0),
    cajero: venta.cajero || 'Sin cajero',
    canal: venta.canal || 'Sin origen',
    productos: venta.productos || '',
  }));

  const totalProductosGenerado = productosRows.reduce((sum, producto) => sum + Number(producto.total || 0), 0);
  const productos = productosRows.map((producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria || 'Sin categoria',
    cantidad: Number(producto.cantidad || 0),
    precioPromedio: Number(producto.precio_promedio || 0),
    total: Number(producto.total || 0),
    participacion: totalProductosGenerado > 0 ? (Number(producto.total || 0) / totalProductosGenerado) * 100 : 0,
  }));

  const totalesMetodoPago = metodoRows.map((row) => ({
    metodo: row.metodo,
    tickets: Number(row.tickets || 0),
    total: Number(row.total || 0),
  }));

  const totalesCanal = canalRows.map((row) => ({
    canal: row.canal,
    tickets: Number(row.tickets || 0),
    total: Number(row.total || 0),
  }));

  const resumenCajeros = cajeroRows.map((row) => {
    const tickets = Number(row.tickets || 0);
    const total = Number(row.total || 0);
    return {
      cajero: row.cajero,
      tickets,
      total,
      efectivo: Number(row.efectivo || 0),
      tarjeta: Number(row.tarjeta || 0),
      transferencia: Number(row.transferencia || 0),
      promedioTicket: tickets > 0 ? total / tickets : 0,
    };
  });

  const productoMasVendido = productos.reduce((top, producto) => (!top || producto.cantidad > top.cantidad ? producto : top), null);
  const productoMayorIngreso = productos.reduce((top, producto) => (!top || producto.total > top.total ? producto : top), null);
  const metodoPagoMasUsado = totalesMetodoPago.reduce((top, metodo) => (!top || metodo.tickets > top.tickets ? metodo : top), null);
  const canalMasVentas = totalesCanal.reduce((top, canal) => (!top || canal.total > top.total ? canal : top), null);

  const resumen = {
    promedioTicket: corte.numeroVentas > 0 ? Number(corte.totalVentas || 0) / corte.numeroVentas : 0,
    totalProductosVendidos: productos.reduce((sum, producto) => sum + producto.cantidad, 0),
    productoMasVendido: productoMasVendido?.nombre || 'Sin datos',
    productoMayorIngreso: productoMayorIngreso?.nombre || 'Sin datos',
    canalMasVentas: canalMasVentas?.canal || 'Sin datos',
    metodoPagoMasUsado: metodoPagoMasUsado?.metodo || 'Sin datos',
    totalPlataformas: totalesCanal
      .filter((canal) => !String(canal.canal || '').toLowerCase().includes('mostrador'))
      .reduce((sum, canal) => sum + canal.total, 0),
  };

  await registrarBitacora({
    modulo: 'Cortes de caja',
    accion: 'Generar PDF de corte',
    descripcion: `Se solicitaron datos completos para generar PDF del corte ${corte.folio}.`,
    registro_afectado_id: Number(req.params.id),
    datos_nuevos: { folio: corte.folio, reporte: true },
  });

  res.json({
    empresa: empresaRows[0] || null,
    corte,
    resumen,
    ventas,
    productos,
    resumenCajeros,
    totalesMetodoPago,
    totalesCanal,
    movimientos,
    hayMasMovimientos,
  });
});

export const obtenerResumenProductosCorte = asyncHandler(async (req, res) => {
  await asegurarSchemaCortes();
  const { fecha, hora_inicio, hora_fin, usuario_id, canal_id } = req.query;

  if (!fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ mensaje: 'Fecha, hora_inicio y hora_fin son obligatorios' });
  }

  const { where, params } = construirWhereVentas({
    fecha,
    horaInicio: hora_inicio,
    horaFin: hora_fin,
    usuarioId: usuario_id,
    canalId: canal_id,
  });

  const [rows] = await pool.query(
    `
      SELECT p.id, p.nombre, SUM(d.cantidad) AS cantidad, SUM(d.subtotal) AS total
      FROM ventas v
      INNER JOIN detalle_ventas d ON d.venta_id = v.id
      INNER JOIN productos p ON p.id = d.producto_id
      WHERE ${where}
      GROUP BY p.id, p.nombre
      ORDER BY cantidad DESC
    `,
    params,
  );

  res.json(rows.map((row) => ({ id: row.id, nombre: row.nombre, cantidad: Number(row.cantidad), total: Number(row.total) })));
});

export const cancelarCorteCaja = asyncHandler(async (req, res) => {
  await asegurarSchemaCortes();
  const [anteriores] = await pool.query('SELECT * FROM cortes_caja WHERE id = ? LIMIT 1', [req.params.id]);
  const anterior = anteriores[0];

  const [result] = await pool.query('UPDATE cortes_caja SET estado = ? WHERE id = ?', ['cancelado', req.params.id]);

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Corte de caja no encontrado' });

  await registrarBitacora({
    modulo: 'Cortes de caja',
    accion: 'Cancelar corte',
    descripcion: `Se cancelo el corte de caja ${anterior?.folio || req.params.id}.`,
    registro_afectado_id: Number(req.params.id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), estado: 'cancelado' },
  });

  res.json({ mensaje: 'Corte de caja cancelado correctamente' });
});
