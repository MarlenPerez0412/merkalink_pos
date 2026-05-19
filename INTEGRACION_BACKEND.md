# Integracion Backend MySQL

Esta rama (`modificacion-1`) agrega una API REST limpia en `server/` para integrar el frontend de MercaLink AI con la base MySQL `merkalink_ai`.

## Estado actual

- El frontend sigue funcionando con datos mock/locales.
- La API REST queda lista para conectarse a MySQL.
- Los servicios frontend en `src/services/api/` permiten migrar pantallas a API de forma incremental.
- `main` queda como respaldo de la version 1 frontend.

## Ejecutar frontend

```bash
npm run dev
```

## Ejecutar backend

```bash
cp server/.env.example server/.env
npm install --prefix server
npm run api:dev
```

Editar `server/.env` con credenciales MySQL:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=merkalink_ai
```

## URL API

```txt
http://localhost:3001/api
```

## Endpoints

- `GET /api/health`
- `GET /api/empresa`
- `GET /api/productos`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `GET /api/ventas`
- `POST /api/ventas`
- `GET /api/canales`
- `GET /api/servicios`
- `GET /api/alertas`
- `PUT /api/alertas/:id/estado`

## Siguiente paso recomendado

Migrar primero `Inventario.jsx` para consumir:

- `getProductos`
- `createProducto`
- `updateProducto`
- `deleteProducto`

desde `src/services/api/productosApi.js`.
