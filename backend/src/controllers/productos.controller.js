import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registrarBitacora } from '../utils/bitacora.js';
import { asegurarSchemaProveedores } from './proveedores.controller.js';

const CATEGORIA_SIN_CATEGORIA = 'Sin categoria';

const normalizarNombreCategoria = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizarImagenUrl = (imagenUrl = '') => {
  const valor = String(imagenUrl || '').trim();
  if (!valor) return null;
  if (/^https?:\/\//i.test(valor)) return valor;

  const ruta = valor.replaceAll('\\', '/');
  const sinPublic = ruta.replace(/^\/?public\//i, '');
  return sinPublic.startsWith('/') ? sinPublic : `/${sinPublic}`;
};

let productosSchemaListo = false;

const asegurarSchemaProductos = async () => {
  if (productosSchemaListo) return;

  await asegurarSchemaProveedores();
  await asegurarSchemaCategorias();

  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'imagen_url'
    LIMIT 1
  `);

  if (!columns[0]) {
    await pool.query('ALTER TABLE productos ADD COLUMN imagen_url TEXT NULL AFTER codigo_barras');
  } else {
    await pool.query('ALTER TABLE productos MODIFY COLUMN imagen_url TEXT NULL');
  }

  productosSchemaListo = true;
};

let categoriasSchemaListo = false;

const asegurarSchemaCategorias = async (connection = pool) => {
  if (categoriasSchemaListo) return;

  const [columns] = await connection.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'categorias'
      AND COLUMN_NAME = 'activo'
    LIMIT 1
  `);

  if (!columns[0]) {
    await connection.query('ALTER TABLE categorias ADD COLUMN activo TINYINT DEFAULT 1');
  }

  await connection.query(
    `
      INSERT INTO categorias (nombre, activo)
      SELECT ?, 1
      WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nombre = ?)
    `,
    [CATEGORIA_SIN_CATEGORIA, CATEGORIA_SIN_CATEGORIA],
  );

  await connection.query('UPDATE categorias SET activo = 1 WHERE nombre = ?', [CATEGORIA_SIN_CATEGORIA]);
  categoriasSchemaListo = true;
};

const resolverImagenProductoUpdate = async (id, body) => {
  if (body.limpiarImagen === true) return null;

  const tieneImagenUrl = Object.prototype.hasOwnProperty.call(body, 'imagenUrl');
  const tieneImagenUrlSnake = Object.prototype.hasOwnProperty.call(body, 'imagen_url');

  if (tieneImagenUrl || tieneImagenUrlSnake) {
    return normalizarImagenUrl(body.imagenUrl ?? body.imagen_url ?? '');
  }

  const [rows] = await pool.query('SELECT imagen_url FROM productos WHERE id = ? LIMIT 1', [id]);
  return rows[0]?.imagen_url ?? null;
};

const mapProducto = (producto) => ({
  id: producto.id,
  sku: producto.sku,
  codigoBarras: producto.codigo_barras || '',
  codigo_barras: producto.codigo_barras || '',
  imagenUrl: normalizarImagenUrl(producto.imagen_url) || '',
  imagen_url: normalizarImagenUrl(producto.imagen_url) || '',
  nombre: producto.nombre,
  categoriaId: producto.categoria_id,
  categoria: producto.categoria,
  categoria_nombre: producto.categoria,
  proveedorId: producto.proveedor_id || null,
  proveedor: producto.proveedor || null,
  proveedorTelefono: producto.proveedor_telefono || '',
  precio: Number(producto.precio),
  precioSugerido: producto.precio_sugerido === null ? null : Number(producto.precio_sugerido),
  stock: producto.stock,
  demanda: producto.demanda,
  promedioVentasDiarias: Number(producto.promedio_ventas_diarias || 0),
  estado: producto.estado,
  fechaCreacion: producto.fecha_creacion,
  canalMasVendido: producto.canal_mas_vendido || null,
  ultimaVenta: producto.ultima_venta || null,
});

const obtenerCategoriaId = async (categoria) => {
  await asegurarSchemaCategorias();
  if (Number(categoria)) return Number(categoria);

  const [rows] = await pool.query('SELECT id, activo FROM categorias WHERE nombre = ? LIMIT 1', [categoria]);
  if (rows[0] && Number(rows[0].activo) === 0) {
    await pool.query('UPDATE categorias SET activo = 1 WHERE id = ?', [rows[0].id]);
  }
  if (rows[0]) return rows[0].id;

  const [result] = await pool.query('INSERT INTO categorias (nombre, activo) VALUES (?, 1)', [categoria]);
  return result.insertId;
};

export const obtenerCategorias = asyncHandler(async (req, res) => {
  await asegurarSchemaCategorias();

  const [rows] = await pool.query(`
    SELECT
      c.id,
      c.nombre,
      COUNT(p.id) AS totalProductos
    FROM categorias c
    LEFT JOIN productos p ON p.categoria_id = c.id AND COALESCE(p.estado, 'Activo') <> 'Inactivo'
    WHERE COALESCE(c.activo, 1) = 1
    GROUP BY c.id, c.nombre, c.activo
    ORDER BY c.nombre ASC
  `);

  res.json(rows.map((categoria) => ({
    id: categoria.id,
    nombre: categoria.nombre,
    totalProductos: Number(categoria.totalProductos || 0),
  })));
});

export const obtenerProductosPorCategoria = asyncHandler(async (req, res) => {
  await asegurarSchemaProductos();

  const [rows] = await pool.query(
    `
      SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor, pr.telefono AS proveedor_telefono
      FROM productos p
      INNER JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
      WHERE c.id = ?
        AND COALESCE(p.estado, 'Activo') <> 'Inactivo'
      ORDER BY p.nombre ASC
    `,
    [req.params.id],
  );

  res.json(rows.map(mapProducto));
});

export const crearCategoria = asyncHandler(async (req, res) => {
  await asegurarSchemaCategorias();
  const nombre = String(req.body.nombre || '').trim();

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la categoria es obligatorio' });
  }

  const [existentes] = await pool.query(
    'SELECT id, activo FROM categorias WHERE nombre = ? LIMIT 1',
    [nombre],
  );

  if (existentes[0]) {
    if (Number(existentes[0].activo) === 0) {
      await pool.query('UPDATE categorias SET activo = 1 WHERE id = ?', [existentes[0].id]);
      await registrarBitacora({
        modulo: 'Categorias',
        accion: 'Reactivar categoria',
        descripcion: `Se reactivo la categoria ${nombre}.`,
        registro_afectado_id: existentes[0].id,
        datos_nuevos: { nombre, activo: 1 },
      });
      return res.status(200).json({ id: existentes[0].id, mensaje: 'Categoria reactivada correctamente' });
    }
    return res.status(409).json({ mensaje: 'Ya existe una categoria con ese nombre' });
  }

  const [result] = await pool.query('INSERT INTO categorias (nombre, activo) VALUES (?, 1)', [nombre]);

  await registrarBitacora({
    modulo: 'Categorias',
    accion: 'Agregar categoria',
    descripcion: `Se agrego la categoria ${nombre}.`,
    registro_afectado_id: result.insertId,
    datos_nuevos: { id: result.insertId, nombre, activo: 1 },
  });

  res.status(201).json({
    id: result.insertId,
    mensaje: 'Categoria creada correctamente',
  });
});

export const actualizarCategoria = asyncHandler(async (req, res) => {
  await asegurarSchemaCategorias();
  const { id } = req.params;
  const nombre = String(req.body.nombre || '').trim();

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la categoria es obligatorio' });
  }

  const [existentes] = await pool.query(
    'SELECT id FROM categorias WHERE nombre = ? AND id <> ? LIMIT 1',
    [nombre, id],
  );

  if (existentes[0]) {
    return res.status(409).json({ mensaje: 'Ya existe una categoria con ese nombre' });
  }

  const [anteriores] = await pool.query('SELECT id, nombre, activo FROM categorias WHERE id = ? LIMIT 1', [id]);
  const anterior = anteriores[0];

  const [result] = await pool.query(
    'UPDATE categorias SET nombre = ? WHERE id = ?',
    [nombre, id],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ mensaje: 'Categoria no encontrada' });
  }

  await registrarBitacora({
    modulo: 'Categorias',
    accion: 'Editar categoria',
    descripcion: `Se edito la categoria ${anterior?.nombre || id}.`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), nombre },
  });

  res.json({ mensaje: 'Categoria actualizada correctamente' });
});

export const eliminarCategoria = asyncHandler(async (req, res) => {
  await asegurarSchemaCategorias();
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [categorias] = await connection.query(
      'SELECT id, nombre, activo FROM categorias WHERE id = ? LIMIT 1',
      [id],
    );

    if (!categorias[0]) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    if (normalizarNombreCategoria(categorias[0].nombre) === normalizarNombreCategoria(CATEGORIA_SIN_CATEGORIA)) {
      await connection.rollback();
      return res.status(400).json({
        mensaje: 'La categoria Sin categoria no se puede eliminar porque es la categoria predeterminada del sistema.',
      });
    }

    const nombreRespaldo = CATEGORIA_SIN_CATEGORIA;
    const [respaldo] = await connection.query(
      'SELECT id FROM categorias WHERE nombre = ? LIMIT 1',
      [nombreRespaldo, id],
    );

    let categoriaRespaldoId = respaldo[0]?.id;

    if (!categoriaRespaldoId) {
      const [resultRespaldo] = await connection.query(
        'INSERT INTO categorias (nombre, activo) VALUES (?, 1)',
        [nombreRespaldo],
      );
      categoriaRespaldoId = resultRespaldo.insertId;
    } else {
      await connection.query('UPDATE categorias SET activo = 1 WHERE id = ?', [categoriaRespaldoId]);
    }

    const [movidos] = await connection.query(
      'UPDATE productos SET categoria_id = ? WHERE categoria_id = ?',
      [categoriaRespaldoId, id],
    );

    const [result] = await connection.query('UPDATE categorias SET activo = 0 WHERE id = ?', [id]);

    await connection.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    await registrarBitacora({
      modulo: 'Categorias',
      accion: 'Desactivar categoria',
      descripcion: `Se desactivo la categoria ${categorias[0].nombre} y se movieron ${movidos.affectedRows || 0} productos a Sin categoria.`,
      registro_afectado_id: Number(id),
      datos_anteriores: categorias[0],
      datos_nuevos: { id: Number(id), activo: 0, categoriaRespaldoId, productosMovidos: movidos.affectedRows || 0 },
    });

    res.json({
      mensaje: 'Categoria desactivada correctamente. Los productos asociados se movieron a Sin categoria.',
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const obtenerProductos = asyncHandler(async (req, res) => {
  await asegurarSchemaProductos();

  const [rows] = await pool.query(`
    SELECT
      p.*,
      c.nombre AS categoria,
      pr.nombre AS proveedor,
      pr.telefono AS proveedor_telefono,
      (
        SELECT ca.nombre
        FROM ventas v
        INNER JOIN detalle_ventas d ON d.venta_id = v.id
        INNER JOIN canales ca ON ca.id = v.canal_id
        WHERE d.producto_id = p.id
        GROUP BY ca.id, ca.nombre
        ORDER BY SUM(d.cantidad) DESC
        LIMIT 1
      ) AS canal_mas_vendido,
      (
        SELECT MAX(v.fecha)
        FROM ventas v
        INNER JOIN detalle_ventas d ON d.venta_id = v.id
        WHERE d.producto_id = p.id
      ) AS ultima_venta
    FROM productos p
    INNER JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
    WHERE COALESCE(p.estado, 'Activo') <> 'Inactivo'
    ORDER BY p.id DESC
  `);

  res.json(rows.map(mapProducto));
});

export const crearProducto = asyncHandler(async (req, res) => {
  await asegurarSchemaProductos();

  const {
    sku,
    codigoBarras,
    codigo_barras,
    imagenUrl,
    imagen_url,
    nombre,
    categoriaId,
    categoria,
    proveedorId,
    proveedor_id,
    precio,
    precioSugerido,
    stock,
    demanda = 'Media',
    promedioVentasDiarias = 0,
    estado = 'Activo',
  } = req.body;

  if (!sku || !nombre || (!categoriaId && !categoria) || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios del producto' });
  }

  const categoria_id = categoriaId || await obtenerCategoriaId(categoria);

  const [result] = await pool.query(
    `
      INSERT INTO productos
        (sku, codigo_barras, imagen_url, nombre, categoria_id, proveedor_id, precio, precio_sugerido, stock, demanda, promedio_ventas_diarias, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      sku,
      codigoBarras || codigo_barras || null,
      normalizarImagenUrl(imagenUrl || imagen_url),
      nombre,
      categoria_id,
      proveedorId || proveedor_id || null,
      precio,
      precioSugerido ?? null,
      stock,
      demanda,
      promedioVentasDiarias,
      estado,
    ],
  );

  await registrarBitacora({
    modulo: 'Productos',
    accion: 'Agregar producto',
    descripcion: `Se agrego el producto ${nombre}.`,
    registro_afectado_id: result.insertId,
    datos_nuevos: { id: result.insertId, sku, nombre, categoria_id, precio, stock, estado },
  });

  res.status(201).json({ id: result.insertId, mensaje: 'Producto creado correctamente' });
});

export const actualizarProducto = asyncHandler(async (req, res) => {
  await asegurarSchemaProductos();

  const { id } = req.params;
  const {
    sku,
    codigoBarras,
    codigo_barras,
    nombre,
    categoriaId,
    categoria,
    proveedorId,
    proveedor_id,
    precio,
    precioSugerido,
    stock,
    demanda = 'Media',
    promedioVentasDiarias = 0,
    estado = 'Activo',
  } = req.body;

  if (!sku || !nombre || (!categoriaId && !categoria) || precio === undefined || stock === undefined) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios del producto' });
  }

  const categoria_id = categoriaId || await obtenerCategoriaId(categoria);
  const imagenUrlFinal = await resolverImagenProductoUpdate(id, req.body);
  const [anteriores] = await pool.query('SELECT * FROM productos WHERE id = ? LIMIT 1', [id]);
  const anterior = anteriores[0];

  const [result] = await pool.query(
    `
      UPDATE productos
      SET sku = ?,
          codigo_barras = ?,
          imagen_url = ?,
          nombre = ?,
          categoria_id = ?,
          proveedor_id = ?,
          precio = ?,
          precio_sugerido = ?,
          stock = ?,
          demanda = ?,
          promedio_ventas_diarias = ?,
          estado = ?
      WHERE id = ?
    `,
    [
      sku,
      codigoBarras || codigo_barras || null,
      imagenUrlFinal,
      nombre,
      categoria_id,
      proveedorId || proveedor_id || null,
      precio,
      precioSugerido ?? null,
      stock,
      demanda,
      promedioVentasDiarias,
      estado,
      id,
    ],
  );

  if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });

  const nuevo = {
    ...(anterior || {}),
    sku,
    codigo_barras: codigoBarras || codigo_barras || null,
    imagen_url: imagenUrlFinal,
    nombre,
    categoria_id,
    proveedor_id: proveedorId || proveedor_id || null,
    precio,
    precio_sugerido: precioSugerido ?? null,
    stock,
    demanda,
    promedio_ventas_diarias: promedioVentasDiarias,
    estado,
  };

  await registrarBitacora({
    modulo: 'Productos',
    accion: 'Editar producto',
    descripcion: `Se edito el producto ${nombre}.`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: nuevo,
  });

  if (anterior && Number(anterior.stock) !== Number(stock)) {
    await registrarBitacora({
      modulo: 'Productos',
      accion: 'Cambiar stock',
      descripcion: `Se cambio el stock de ${nombre} de ${anterior.stock} a ${stock}.`,
      registro_afectado_id: Number(id),
      datos_anteriores: { stock: anterior.stock },
      datos_nuevos: { stock },
    });
  }

  if (anterior && Number(anterior.precio) !== Number(precio)) {
    await registrarBitacora({
      modulo: 'Productos',
      accion: 'Cambiar precio',
      descripcion: `Se cambio el precio de ${nombre} de ${anterior.precio} a ${precio}.`,
      registro_afectado_id: Number(id),
      datos_anteriores: { precio: anterior.precio },
      datos_nuevos: { precio },
    });
  }

  res.json({ mensaje: 'Producto actualizado correctamente' });
});

export const eliminarProducto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [anteriores] = await pool.query('SELECT * FROM productos WHERE id = ? LIMIT 1', [id]);
  const anterior = anteriores[0];

  const [result] = await pool.query(
    'UPDATE productos SET estado = ? WHERE id = ?',
    ['Inactivo', id],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  await registrarBitacora({
    modulo: 'Productos',
    accion: 'Desactivar producto',
    descripcion: `Se desactivo el producto ${anterior?.nombre || id}.`,
    registro_afectado_id: Number(id),
    datos_anteriores: anterior || null,
    datos_nuevos: { ...(anterior || {}), estado: 'Inactivo' },
  });

  res.json({ mensaje: 'Producto desactivado correctamente' });
});
