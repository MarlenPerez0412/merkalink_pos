
# MercaLink POS

**MercaLink POS** es un sistema web de punto de venta desarrollado para restaurantes y PyMEs. Su propósito es digitalizar la operación comercial de un negocio, administrar ventas, controlar inventario, gestionar usuarios, proveedores, alertas de stock, cortes de caja, reportes administrativos y bitácora de movimientos.

El sistema está diseñado para apoyar la toma de decisiones mediante información clara sobre ventas, productos más vendidos, productos con bajo stock, origen de venta, métodos de pago y movimientos realizados dentro del sistema.

---

## Descripción del proyecto

MercaLink POS permite centralizar las operaciones principales de un restaurante en una plataforma web. El administrador puede gestionar la información general del negocio, productos, categorías, proveedores, usuarios, reportes y configuración, mientras que el cajero puede operar el punto de venta y generar ventas de forma controlada.

El sistema utiliza una arquitectura cliente-servidor, donde el frontend consume una API REST desarrollada en el backend. La información se almacena en una base de datos relacional MySQL.

---

## Objetivo del sistema

Desarrollar una solución POS integral, accesible y segura que permita a las PyMEs mexicanas digitalizar su operación comercial, formalizar su gestión financiera y convertir sus datos transaccionales en información estratégica para la toma de decisiones.

---

## Características principales

* Inicio de sesión con control de roles.
* Rol administrador y rol cajero.
* Punto de Venta con carrito de productos.
* Registro de ventas.
* Selección de origen de venta.
* Administración de productos.
* Administración de categorías.
* Administración de proveedores.
* Administración de usuarios.
* Control de stock.
* Alertas de productos agotados o con bajo stock.
* Solicitud de compra al proveedor por WhatsApp, Gmail o correo predeterminado.
* Configuración de datos de empresa.
* Configuración de notificaciones y stock mínimo.
* Modo claro, oscuro y sistema.
* Generación de tickets PDF.
* Generación de reportes administrativos PDF.
* Generación de cortes de caja PDF.
* Bitácora de movimientos del sistema.
* Reportes con gráficas para toma de decisiones.

---

## Tecnologías utilizadas

### Frontend

* React
* Vite
* Tailwind CSS
* Lucide React
* Chart.js
* jsPDF
* html2canvas

### Backend

* Node.js
* Express
* MySQL2
* CORS
* Dotenv
* Multer

### Base de datos

* MySQL
* MySQL Workbench

---

## Estructura del proyecto

El proyecto está organizado en dos carpetas principales:

```text
merkalink_pos/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/
    ├── src/
    ├── scripts/
    ├── package.json
    └── .env.example
```

### Frontend

Contiene la interfaz web del sistema, desarrollada con React, Vite y Tailwind CSS.

Desde el frontend se manejan las vistas principales del sistema:

* Login
* Dashboard
* Punto de Venta
* Inventario
* Categorías
* Ventas
* Cortes de caja
* Alertas
* Proveedores
* Usuarios
* Configuración
* Bitácora
* Reportes PDF

### Backend

Contiene la API REST desarrollada con Node.js y Express.

El backend se encarga de:

* Recibir peticiones del frontend.
* Validar información.
* Ejecutar consultas en MySQL.
* Registrar ventas.
* Administrar productos, categorías, proveedores y usuarios.
* Generar alertas.
* Registrar bitácora.
* Manejar cortes de caja.
* Devolver respuestas en formato JSON.

Los scripts relacionados con la base de datos se encuentran dentro de la carpeta `backend/scripts/` o se administran directamente desde MySQL Workbench.

---

## Módulos del sistema

### Dashboard

Muestra indicadores generales del negocio, como ventas, productos, alertas, inventario y datos relevantes para la administración.

### Punto de Venta

Permite registrar ventas mediante un carrito de productos. El usuario puede seleccionar productos, cantidad, método de pago y origen de venta. Al finalizar la venta, el sistema genera un ticket PDF.

### Inventario

Permite administrar productos, imágenes, precios, stock, categorías y proveedores. También muestra disponibilidad de productos y alertas relacionadas con inventario.

### Categorías

Permite crear, editar, visualizar y desactivar categorías. Cuando una categoría se elimina de forma lógica, los productos pueden reasignarse a “Sin categoría” para conservar el historial.

### Ventas

Muestra tickets recientes, ventas registradas, métodos de pago, origen de venta, cajero responsable y totales generados.

### Cortes de caja

Permite generar cortes de caja por fecha, horario, turno, cajero y origen de venta.

El administrador puede generar cortes globales o por cajero. El cajero solo puede generar cortes relacionados con sus propias ventas.

### Alertas

Muestra alertas de inventario relacionadas con productos agotados, stock bajo y reabastecimiento. Desde este módulo se puede contactar al proveedor mediante WhatsApp, Gmail o correo predeterminado.

### Proveedores

Permite registrar y editar proveedores, incluyendo datos de contacto como teléfono y correo electrónico para facilitar el reabastecimiento de productos.

### Configuración

Permite modificar datos de empresa, perfil de usuario, contraseña, apariencia del sistema, proveedores, usuarios y configuración de notificaciones.

### Bitácora

Registra acciones importantes realizadas en el sistema, como creación, edición, eliminación lógica, generación de reportes, cortes de caja y solicitudes de compra.

---

## Roles del sistema

### Administrador

El administrador tiene acceso a la mayoría de los módulos del sistema:

* Dashboard
* Punto de Venta
* Inventario
* Categorías
* Ventas
* Cortes de caja
* Alertas
* Proveedores
* Usuarios
* Configuración
* Bitácora
* Reportes

### Cajero

El cajero tiene acceso limitado para operar el punto de venta:

* Punto de Venta
* Registro de ventas
* Tickets propios
* Corte de caja de sus propias ventas
* Cierre de sesión

El cajero no puede modificar usuarios, configuración general, proveedores ni información sensible del sistema.

---

## Base de datos

El sistema utiliza una base de datos relacional en MySQL. Las tablas principales del sistema son:

* empresa
* usuarios
* productos
* categorias
* proveedores
* ventas
* detalle_ventas
* canales
* alertas
* configuracion_sistema
* bitacora_sistema
* cortes_caja
* corte_caja_detalle
* movimientos_caja
* cierres_caja
* cierre_caja_detalle

La base de datos utiliza relaciones mediante llaves foráneas para mantener la integridad referencial entre ventas, productos, usuarios, proveedores, categorías, alertas y cortes de caja.

---

## Integridad de datos

El sistema utiliza relaciones entre tablas para evitar datos huérfanos y mantener la coherencia de la información.

Ejemplos de relaciones:

* Una venta pertenece a un usuario.
* Una venta pertenece a un origen de venta.
* Una venta tiene uno o varios detalles de venta.
* Un detalle de venta pertenece a un producto.
* Un producto pertenece a una categoría.
* Un producto puede tener un proveedor.
* Una alerta pertenece a un producto.
* Un corte de caja puede agrupar varias ventas.

---

## Eliminación lógica y trazabilidad

El sistema no elimina físicamente información crítica cuando puede estar relacionada con ventas, tickets, reportes o cortes de caja.

Se utiliza baja lógica para conservar el historial del sistema:

* Productos: se marcan como inactivos.
* Categorías: se desactivan.
* Usuarios: se marcan como inactivos.
* Orígenes de venta: se desactivan.

La eliminación en cascada se reserva para tablas dependientes, como detalles de ventas o detalles de cortes de caja.

La bitácora permite registrar acciones importantes y mantener trazabilidad sobre los movimientos realizados en el sistema.

---

## Reportes PDF

El sistema genera documentos PDF para facilitar la administración del negocio.

### Ticket de venta

Incluye:

* Datos de la empresa.
* Folio de venta.
* Fecha y hora.
* Cajero.
* Origen de venta.
* Método de pago.
* Productos vendidos.
* Subtotal.
* IVA.
* Total.
* Monto recibido.
* Cambio.

### Reporte general

Incluye:

* Resumen administrativo.
* Productos activos.
* Ventas registradas.
* Ventas totales.
* Orígenes de venta activos.
* Alertas activas.
* Categorías activas.
* Proveedores activos.
* Usuarios activos.
* Gráficas administrativas.
* Ventas por origen.
* Productos más vendidos.
* Inventario crítico.
* Últimos movimientos del sistema.

### Corte de caja

Incluye:

* Folio del corte.
* Fecha y horario.
* Turno.
* Cajero.
* Origen de venta.
* Total de ventas.
* Métodos de pago.
* Monto contado.
* Diferencia.
* Productos vendidos.
* Resumen por cajero.
* Resumen por origen.
* Movimientos del corte.
* Firmas del cajero y administrador.

---

## Solicitud de compra al proveedor

Cuando un producto se encuentra agotado o con stock bajo, el sistema permite preparar una solicitud de compra al proveedor.

Opciones disponibles:

* WhatsApp
* Gmail Web
* Correo predeterminado del equipo

El sistema no guarda credenciales de WhatsApp ni Gmail. Únicamente prepara el mensaje y abre la plataforma correspondiente para que el usuario confirme el envío.

---

## Instalación del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/MarlenPerez0412/merkalink_pos.git
cd merkalink_pos
```

---

## Instalación del frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend normalmente se ejecuta en:

```text
http://localhost:5173
```

---

## Instalación del backend

En otra terminal:

```bash
cd backend
npm install
npm run dev
```

El backend normalmente se ejecuta en:

```text
http://localhost:3001
```

---

## Variables de entorno

Crear un archivo `.env` dentro de la carpeta `backend/` usando como referencia `.env.example`.

Ejemplo:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=merkalink_ai
```

Si el frontend requiere variable de API, crear un archivo `.env` dentro de la carpeta `frontend/`:

```env
VITE_API_URL=http://localhost:3001/api
```

---

## Scripts principales

### Frontend

```bash
npm run dev
npm run build
npm run lint
```

### Backend

```bash
npm run dev
npm start
```

---

## Flujo general del sistema

1. El usuario inicia sesión.
2. El sistema valida su rol.
3. El administrador puede gestionar productos, categorías, usuarios, proveedores y configuración.
4. El cajero registra ventas desde el Punto de Venta.
5. El sistema descuenta stock automáticamente.
6. Se generan alertas si un producto está agotado o bajo de stock.
7. Se pueden generar tickets, reportes y cortes de caja en PDF.
8. Las acciones importantes quedan registradas en bitácora.

---

## Arquitectura del sistema

El sistema utiliza una arquitectura cliente-servidor:

```text
Frontend React
     ↓
API REST Express
     ↓
Base de datos MySQL
```

El frontend no se conecta directamente a MySQL. Todas las operaciones se realizan mediante endpoints del backend.

---

## Endpoints principales

Algunos endpoints utilizados por el sistema son:

```text
/api/auth
/api/productos
/api/categorias
/api/ventas
/api/canales
/api/alertas
/api/empresa
/api/configuracion
/api/proveedores
/api/usuarios
/api/bitacora
/api/cortes-caja
/api/reportes
```

---

## Seguridad y control de acceso

El sistema maneja control de roles para limitar las acciones de cada usuario.

* El administrador puede gestionar información sensible.
* El cajero solo puede operar ventas y cortes propios.
* Las acciones importantes se registran en bitácora.
* La información crítica se conserva mediante baja lógica.

---

## Estado del proyecto

Versión funcional para presentación académica.

El sistema incluye módulos de ventas, inventario, proveedores, alertas, cortes de caja, reportes, configuración, usuarios y bitácora.

---

## Objetivo académico

Este proyecto fue desarrollado como parte de un proceso académico de Ingeniería en Sistemas Computacionales, aplicando conocimientos de:

* Desarrollo web.
* Programación frontend.
* Programación backend.
* Bases de datos relacionales.
* Arquitectura cliente-servidor.
* APIs REST.
* Gestión de inventario.
* Control de ventas.
* Reportes administrativos.
* Seguridad por roles.

---

## Autora

Proyecto desarrollado por:

**Marlen Pérez**
Ingeniería en Sistemas Computacionales

---

## Repositorio

```text
https://github.com/MarlenPerez0412/merkalink_pos
```
