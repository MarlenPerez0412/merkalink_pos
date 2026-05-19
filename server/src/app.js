import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import alertasRoutes from './routes/alertas.routes.js';
import canalesRoutes from './routes/canales.routes.js';
import empresaRoutes from './routes/empresa.routes.js';
import productosRoutes from './routes/productos.routes.js';
import serviciosRoutes from './routes/servicios.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import { testConnection } from './config/db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API MercaLink AI funcionando' });
});

app.use('/api/empresa', empresaRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/canales', canalesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/alertas', alertasRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  console.error(error);
  return res.status(500).json({
    mensaje: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'production' ? undefined : error.message,
  });
});

testConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`API MercaLink AI en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MySQL:', error.message);
    process.exit(1);
  });
