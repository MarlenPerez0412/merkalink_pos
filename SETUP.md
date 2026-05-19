# MercaLink AI - Frontend SaaS

Un frontend moderno, minimalista y profesional para un sistema de gestión omnicanal inteligente enfocado en MiPyMEs.

## ✨ Características

- **Dashboard Interactivo**: KPIs en tiempo real con gráficos visuales
- **Gestión de Inventario**: Control completo de productos y stock
- **Análisis de Ventas**: Reportes detallados con gráficos dinámicos
- **Canales Omnicanal**: Gestión integrada de múltiples plataformas
- **IA Insights**: Recomendaciones inteligentes y predicciones
- **Alertas Inteligentes**: Notificaciones personalizables
- **Configuración Avanzada**: Personalización completa del sistema
- **Diseño Responsive**: Funciona perfectamente en cualquier dispositivo

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── Card.jsx
│   ├── Button.jsx
│   ├── StatCard.jsx
│   ├── TableProductos.jsx
│   ├── AlertasVisuales.jsx
│   ├── ChartComponent.jsx
│   └── index.js
├── pages/              # Páginas principales
│   ├── Dashboard.jsx
│   ├── Inventario.jsx
│   ├── Ventas.jsx
│   ├── Canales.jsx
│   ├── Insights.jsx
│   ├── Alertas.jsx
│   ├── Configuracion.jsx
│   └── index.js
├── layouts/            # Layouts principales
│   └── MainLayout.jsx
├── routes/             # Configuración de routing
│   └── router.jsx
├── data/               # Datos mock
│   └── mockData.js
├── services/           # Servicios (futuro)
├── main.jsx
├── App.jsx
└── index.css
```

## 🎨 Diseño Visual

- **Colores Principales**:
  - Azul Oscuro: `#0284c7` (primario)
  - Morado: `#9333ea` (acento)
  - Blanco: `#ffffff`
  - Gris Claro: `#f3f4f6`

- **Componentes**:
  - Tarjetas con sombras suaves
  - Sidebar desplegable
  - Navbar con notificaciones
  - Tablas responsive
  - Gráficos interactivos
  - Alertas visuales

## 🚀 Instalación

### Requisitos
- Node.js 16+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd merkalink-ai
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5173`

## 📦 Dependencias Principal

- **React** 19.2.6 - Librería UI
- **React Router** 6.x - Enrutamiento
- **Tailwind CSS** 3.x - Estilos
- **Chart.js** - Gráficos
- **React ChartJS 2** - Componentes de gráficos
- **Lucide React** - Iconos

## 📄 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🗂️ Datos Mock

El proyecto utiliza datos mock temporales ubicados en `src/data/mockData.js`:

- **Productos**: 12 productos de ejemplo con stock
- **Ventas**: 6 órdenes de muestra
- **Canales**: 5 canales de venta integrados
- **Alertas**: 4 alertas de ejemplo
- **Gráficos**: Datos preprocesados para Chart.js

## 🎯 Páginas Disponibles

### 📊 Dashboard
- KPIs principales en tiempo real
- Gráfico de ventas semanales
- Distribución de productos por categoría
- Métricas de conversión y ticket promedio

### 📦 Inventario
- Tabla completa de productos
- Filtrado por categoría
- Estados de stock visual
- Acciones de edición/eliminación

### 💰 Ventas
- Análisis de ventas período comprable
- Órdenes completadas vs pendientes
- Gráficos de distribución por canal
- Historial de órdenes recientes

### 📲 Canales
- Gestión de canales omnicanal
- Sincronización automática
- Estadísticas por canal
- Estados de actividad

### 🤖 IA Insights
- Recomendaciones inteligentes
- Predicciones de ventas
- Análisis de tendencias
- Información procesada por IA

### 🔔 Alertas
- Alertas por categoría
- Configuración de notificaciones
- Historial de alertas
- Preferencias personalizadas

### ⚙️ Configuración
- Gestión de perfil
- Seguridad y autenticación
- Preferencias de notificaciones
- Apariencia del sistema

## 🔧 Configuración de Tailwind CSS

El archivo `tailwind.config.js` incluye:
- Colores personalizados (primarios, acentos, grises)
- Sombras suaves personalizadas
- Animaciones personalizadas
- Extensiones de temas

## 📱 Responsive Design

El proyecto es completamente responsive:
- **Mobile**: Sidebar colapsable, menú hamburguesa
- **Tablet**: Diseño adaptativo
- **Desktop**: Vista completa con sidebar fijo

## 🎨 Paleta de Colores Tailwind

```javascript
colors: {
  primary: { 500: '#0ea5e9', 600: '#0284c7', ... },
  accent: { 500: '#a855f7', 600: '#9333ea', ... },
  dark: { 900: '#111827', 800: '#1f2937', ... }
}
```

## 🚧 Próximas Características

- [ ] Integración con backend
- [ ] Autenticación real
- [ ] Base de datos conectada
- [ ] Exportación de reportes
- [ ] Integración de APIs externas
- [ ] Temas personalizables
- [ ] Modo oscuro completo
- [ ] Notificaciones en tiempo real

## 📝 Notas

- Este proyecto utiliza datos mock para demostración
- Todos los componentes son reutilizables
- El código está optimizado para mantenibilidad
- Sigue mejores prácticas de React 19

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**MercaLink AI** - Gestión inteligente para MiPyMEs 🚀
