# MercaLink POS

Proyecto POS para restaurantes y PyMEs mexicanas, organizado en frontend, backend, base de datos y documentacion.

## Estructura

```txt
merkalink-pos/
  frontend/   React + Vite + Tailwind CSS
  backend/    Node.js + Express + MySQL
  database/   Scripts SQL de base de datos y ajustes
  docs/       Documentacion tecnica y de instalacion
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Variables:

```bash
cp .env.example .env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Backend

```bash
cd backend
npm install
npm run dev
```

Variables:

```bash
cp .env.example .env
```

`backend/.env`:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=merkalink_ai
DB_PORT=3306
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
FRONTEND_PUBLIC_DIR=../frontend/public
PRODUCT_IMAGES_DIR=../frontend/public/images/productos
```

## Base De Datos

Los scripts SQL estan en `database/`:

- `database/POS_DB_SAFE.sql`
- `database/POS_RESTAURANTE_AJUSTES.sql`

## Imagenes

Las imagenes publicas viven en `frontend/public/images/`.

En MySQL se debe guardar la ruta publica:

```txt
/images/productos/nombre-archivo.webp
```

El backend sube imagenes locales a `frontend/public/images/productos/` y sirve `/images` desde esa carpeta.

## Scripts Desde Raiz

```bash
npm run dev:frontend
npm run dev:backend
npm run build:frontend
npm run lint:frontend
```

## Documentacion

Consulta `docs/` para guias completas:

- `docs/SETUP.md`
- `docs/INTEGRACION_BACKEND.md`
- `docs/RESIDENCIA_POS.md`
