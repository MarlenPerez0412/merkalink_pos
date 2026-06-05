import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.routes.js';
import alertasRoutes from './routes/alertas.routes.js';
import bitacoraRoutes from './routes/bitacora.routes.js';
import cajaRoutes from './routes/caja.routes.js';
import canalesRoutes from './routes/canales.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import configuracionRoutes from './routes/configuracion.routes.js';
import cortesCajaRoutes from './routes/cortesCaja.routes.js';
import empresaRoutes from './routes/empresa.routes.js';
import productosRoutes from './routes/productos.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import ventasRoutes from './routes/ventas.routes.js';

import { testConnection } from './config/db.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(process.env.FRONTEND_PUBLIC_DIR || path.resolve(__dirname, '../../frontend/public'));

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (
      process.env.CORS_ORIGIN ||
      'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174'
    )
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/images', express.static(path.join(publicDir, 'images')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API MercaLink POS funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/empresa', empresaRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/canales', canalesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/cortes-caja', cortesCajaRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/caja', cajaRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    mensaje: 'Ruta no encontrada',
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'La imagen supera el tamaño máximo permitido.',
      mensaje: 'La imagen supera el tamaño máximo permitido.',
    });
  }

  if (error?.message === 'Solo se permiten imagenes jpg, jpeg, png o webp') {
    return res.status(400).json({
      success: false,
      message: 'Solo se permiten imagenes JPG, JPEG, PNG o WEBP.',
      mensaje: 'Solo se permiten imagenes JPG, JPEG, PNG o WEBP.',
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    mensaje: error.message || 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'production' ? undefined : error.message,
  });
});

testConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`API MercaLink POS en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MySQL:', error.message);
    process.exit(1);
  });
