# MercaLink AI - Frontend SaaS 🚀

Un system moderno, minimalista y profesional de gestión omnicanal inteligente enfocado en **MiPyMEs** (Micro, Pequeñas y Medianas Empresas).

**MercaLink AI** es una plataforma SaaS que permite a los emprendedores gestionar su inventario, ventas y múltiples canales de venta (e-commerce, marketplace, redes sociales) desde un único dashboard inteligente potenciado con IA.

## ✨ Características Principales

### 📊 Dashboard
- **KPIs en Tiempo Real**: Ventas totales, productos, órdenes y clientes nuevos
- **Gráficos Interactivos**: Análisis visual de tendencias semanales
- **Métricas Estratégicas**: Tasa de conversión, ticket promedio, inventario total

### 📦 Gestión de Inventario
- Control total de productos y stock
- Filtrado por categoría
- Alertas de stock bajo
- Tabla interactiva con acciones CRUD
- Indicadores visuales de disponibilidad

### 💰 Análisis de Ventas
- Gráficos de ventas por período
- Distribución por canales
- Órdenes completadas vs pendientes
- Historial de transacciones

### 📲 Canales Omnicanal
- Integración de múltiples plataformas
- Sincronización automática de productos
- Estadísticas por canal
- Control de estado de cada canal

### 🤖 IA Insights
- **Recomendaciones Inteligentes**: Sugerencias para optimizar negocio
- **Predicciones**: Forecast de ventas futuras
- **Análisis de Tendencias**: Comportamiento del mercado

### 🔔 Alertas Inteligentes
- Notificaciones por categoría
- Configuración personalizada
- Historial completo
- Preferencias por canal

### ⚙️ Configuración Avanzada
- Gestión de perfil
- Seguridad y 2FA
- Preferencias de notificaciones
- Personalización de apariencia

## 🎨 Diseño Visual

### Paleta de Colores
- **Azul Primario**: `#0284c7` - Color principal de la marca
- **Morado Acento**: `#9333ea` - Destacados y acciones
- **Blanco**: `#ffffff` - Fondos limpios
- **Gris Claro**: `#f3f4f6` - Fondos secundarios

### Componentes UI
- ✅ Tarjetas con sombras suaves
- ✅ Sidebar deslizable y responsive
- ✅ Navbar con notificaciones
- ✅ Tablas interactivas
- ✅ Gráficos dinámicos
- ✅ Alertas visuales
- ✅ Botones con estados
- ✅ Formularios personalizados

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2** - Librería UI moderna
- **Vite** - Bundler ultrarrápido
- **Tailwind CSS** - Estilos utility-first
- **React Router 6** - Enrutamiento avanzado
- **Chart.js** - Gráficos interactivos
- **Lucide React** - Iconos vectoriales

### Características
- ✅ Components reutilizables y modulares
- ✅ Responsive Design (Móvil, Tablet, Desktop)
- ✅ HMR (Hot Module Replacement)
- ✅ Código limpio y bien documentado
- ✅ Datos Mock para demostración

## 📁 Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── Sidebar.jsx         # Navegación principal
│   ├── Navbar.jsx          # Barra superior
│   ├── Card.jsx            # Tarjeta base
│   ├── Button.jsx          # Botones personalizados
│   ├── StatCard.jsx        # Tarjetas de estadísticas
│   ├── TableProductos.jsx  # Tabla de productos
│   ├── AlertasVisuales.jsx # Componente de alertas
│   ├── ChartComponent.jsx  # Componentes gráficos
│   └── index.js
│
├── pages/                   # Páginas de la aplicación
│   ├── Dashboard.jsx       # Panel principal
│   ├── Inventario.jsx      # Gestión de inventario
│   ├── Ventas.jsx          # Análisis de ventas
│   ├── Canales.jsx         # Canales omnicanal
│   ├── Insights.jsx        # IA Insights
│   ├── Alertas.jsx         # Sistema de alertas
│   ├── Configuracion.jsx   # Configuración
│   └── index.js
│
├── layouts/
│   └── MainLayout.jsx      # Layout principal
│
├── routes/
│   └── router.jsx          # Configuración de routing
│
├── data/
│   └── mockData.js         # Datos de demostración
│
├── main.jsx                # Punto de entrada
├── App.jsx                 # Componente principal
└── index.css               # Estilos globales
```

## 🚀 Instalación y Uso

### Requisitos
- Node.js 16 o superior
- npm o yarn

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd merkalink-ai

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## 📝 Scripts Disponibles

```bash
# Desarrollo con HMR
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🗺️ Navegación de Páginas

```
/ ......................... Dashboard
/inventario ............... Gestión de Inventario
/ventas ................... Análisis de Ventas
/canales .................. Canales Omnicanal
/insights ................. IA Insights
/alertas .................. Alertas
/configuracion ............ Configuración
```

## 📊 Datos Mock

El proyecto incluye datos de demostración en `src/data/mockData.js`:

- **12 Productos**: Con stock, precio y categoría
- **6 Órdenes**: Ejemplos de ventas
- **5 Canales**: Plataformas integradas
- **4 Alertas**: Notificaciones de ejemplo
- **Datos Gráficos**: Listos para Chart.js

Puedes reemplazar estos datos con una API real en el futuro.

## 🎯 Características Por Página

### Dashboard
- 4 KPIs principales
- Gráfico de ventas semanales
- Distribución de categorías
- Métricas de rendimiento

### Inventario
- Listado completo de productos
- Filtrado por categoría
- Indicadores de stock
- Acciones de producto

### Ventas
- Período seleccionable
- 3 KPIs principales
- Gráficos de análisis
- Historial de órdenes

### Canales
- Tarjetas de canales
- Estadísticas por plataforma
- Control de sincronización
- Estados de actividad

### IA Insights
- Recomendaciones inteligentes
- Predicciones de ventas
- Análisis de tendencias
- Información procesada

### Alertas
- Filtrado por tipo
- Configuración de alertas
- Historial de notificaciones
- Preferencias personalizadas

### Configuración
- Perfil de usuario
- Seguridad (2FA, contraseña)
- Notificaciones
- Apariencia

## 🔧 Configuración

### Tailwind CSS
El proyecto usa `tailwind.config.js` con:
- **Colores personalizados**: Primarios, acentos, grises
- **Sombras suaves**: Para mejor legibilidad
- **Animaciones**: Efectos suaves
- **Responsive**: Mobile-first approach

### PostCSS
Configuración en `postcss.config.js` para procesar estilos.

## 📱 Responsive Design

- **Móvil (<768px)**: Sidebar colapsado, menú hamburguesa
- **Tablet (768px-1024px)**: Layout adaptativo
- **Desktop (>1024px)**: Vista completa con sidebar fijo

## 🎓 Best Practices Aplicadas

✅ Componentes funcionales con hooks
✅ Composición sobre herencia
✅ Props tipados y documentados
✅ Código DRY (Don't Repeat Yourself)
✅ Separación de responsabilidades
✅ Naming conventions consistentes
✅ Documentación clara

## 🚧 Próximas Mejoras

- [ ] Conectar con API backend
- [ ] Autenticación real (JWT)
- [ ] Base de datos (PostgreSQL)
- [ ] Exportar reportes (PDF, Excel)
- [ ] Integración de APIs externas
- [ ] Temas personalizables
- [ ] Modo oscuro completo
- [ ] WebSockets para tiempo real
- [ ] Testing automático
- [ ] Optimización SEO

## 📄 Licencia

Proyecto de demostración para MercaLink AI.

## 👨‍💻 Desarrollo

Creado con ❤️ para pequeños y medianos empresarios que sueñan agrandar su negocio.

---

**MercaLink AI** - Tu plataforma inteligente de gestión omnicanal 🎯📱💼

