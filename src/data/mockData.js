// Productos
export const productosData = [
  { id: 1, nombre: 'Termo Rosa', precio: 250, stock: 4, categoria: 'Hogar' },
  { id: 2, nombre: 'Termo Azul', precio: 250, stock: 8, categoria: 'Hogar' },
  { id: 3, nombre: 'Termo Negro', precio: 250, stock: 0, categoria: 'Hogar' },
  { id: 4, nombre: 'Botella Reutilizable', precio: 180, stock: 15, categoria: 'Hogar' },
  { id: 5, nombre: 'Mochila Deportiva', precio: 450, stock: 6, categoria: 'Moda' },
  { id: 6, nombre: 'Auriculares Inalámbricos', precio: 1200, stock: 3, categoria: 'Electrónica' },
  { id: 7, nombre: 'Lámpara LED', precio: 320, stock: 12, categoria: 'Hogar' },
  { id: 8, nombre: 'Cargador Rápido', precio: 150, stock: 20, categoria: 'Electrónica' },
  { id: 9, nombre: 'Funda Protectora', precio: 80, stock: 25, categoria: 'Electrónica' },
  { id: 10, nombre: 'Almohada Ergonómica', precio: 380, stock: 7, categoria: 'Hogar' },
  { id: 11, nombre: 'Café Premium 500g', precio: 95, stock: 30, categoria: 'Alimentos' },
  { id: 12, nombre: 'Té Variado', precio: 65, stock: 18, categoria: 'Alimentos' },
];

// Ventas
export const ventasData = [
  { id: 1, producto: 'Termo Rosa', cantidad: 2, monto: 500, fecha: '2024-05-15', estado: 'completada' },
  { id: 2, producto: 'Auriculares Inalámbricos', cantidad: 1, monto: 1200, fecha: '2024-05-14', estado: 'completada' },
  { id: 3, producto: 'Termo Azul', cantidad: 3, monto: 750, fecha: '2024-05-14', estado: 'pendiente' },
  { id: 4, producto: 'Botella Reutilizable', cantidad: 1, monto: 180, fecha: '2024-05-13', estado: 'completada' },
  { id: 5, producto: 'Mochila Deportiva', cantidad: 2, monto: 900, fecha: '2024-05-13', estado: 'completada' },
  { id: 6, producto: 'Café Premium 500g', cantidad: 5, monto: 475, fecha: '2024-05-12', estado: 'completada' },
];

// Canales de Venta
export const canalesData = [
  { id: 1, nombre: 'e-commerce', plataforma: 'Shopify', productos: 45, ventas: 15000, estado: 'activo' },
  { id: 2, nombre: 'Marketplace', plataforma: 'Mercado Libre', productos: 32, ventas: 12500, estado: 'activo' },
  { id: 3, nombre: 'TikTok Shop', plataforma: 'TikTok', productos: 28, ventas: 8750, estado: 'activo' },
  { id: 4, nombre: 'Instagram', plataforma: 'Instagram Shop', productos: 35, ventas: 9200, estado: 'inactivo' },
  { id: 5, nombre: 'Whatsapp Business', plataforma: 'WhatsApp', productos: 40, ventas: 6800, estado: 'activo' },
];

// KPIs Dashboard
export const kpisData = [
  { id: 1, titulo: 'Ventas Totales', valor: '$45,280', cambio: 12.5, icono: 'TrendingUp' },
  { id: 2, titulo: 'Productos', valor: 42, cambio: 8.2, icono: 'Package' },
  { id: 3, titulo: 'Órdenes Hoy', valor: 23, cambio: 5.1, icono: 'ShoppingCart' },
  { id: 4, titulo: 'Clientes Nuevos', valor: 8, cambio: 2.5, icono: 'Users' },
];

// Data para gráficos
export const ventasChartData = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      label: 'Ventas',
      data: [3200, 4500, 3800, 5200, 4800, 6200, 5500],
      borderColor: 'rgb(6, 168, 225)',
      backgroundColor: 'rgba(6, 168, 225, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 2,
    },
  ],
};

export const categoriasChartData = {
  labels: ['Hogar', 'Electrónica', 'Moda', 'Alimentos', 'Otros'],
  datasets: [
    {
      label: 'Productos por Categoría',
      data: [18, 12, 8, 3, 1],
      backgroundColor: [
        'rgba(6, 168, 225, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(107, 114, 128, 0.8)',
      ],
      borderWidth: 0,
    },
  ],
};

export const canalesChartData = {
  labels: ['E-commerce', 'Marketplace', 'TikTok Shop', 'Instagram', 'WhatsApp'],
  datasets: [
    {
      label: 'Ventas por Canal',
      data: [15000, 12500, 8750, 9200, 6800],
      backgroundColor: [
        'rgba(6, 168, 225, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderWidth: 0,
    },
  ],
};

// Alertas
export const alertasData = [
  {
    id: 1,
    titulo: 'Stock Bajo',
    mensaje: 'Termo Negro está agotado',
    tipo: 'warning',
    timestamp: '2024-05-15 10:30',
  },
  {
    id: 2,
    titulo: 'Nueva Orden',
    mensaje: 'Orden #1024 recibida de Marketplace',
    tipo: 'success',
    timestamp: '2024-05-15 09:15',
  },
  {
    id: 3,
    titulo: 'Revisión de Datos',
    mensaje: 'Se detectó un cambio de precio no autorizado',
    tipo: 'error',
    timestamp: '2024-05-15 08:45',
  },
  {
    id: 4,
    titulo: 'Sistema',
    mensaje: 'Sincronización completada con éxito',
    tipo: 'info',
    timestamp: '2024-05-15 07:30',
  },
];
