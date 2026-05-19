# MercaLink AI API

API REST preparada para conectar el frontend de MercaLink AI con la base MySQL `merkalink_ai`.

## Requisitos

- Node.js
- MySQL con el script SQL de `merkalink_ai` ejecutado

## Configuracion

1. Copiar variables:

```bash
cp server/.env.example server/.env
```

2. Editar `server/.env`:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=merkalink_ai
```

3. Instalar dependencias del backend:

```bash
npm install --prefix server
```

4. Ejecutar API:

```bash
npm run api:dev
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

## Nota

El frontend aun puede funcionar con datos mock. Los servicios en `src/services/api` quedan listos para migrar pantallas a API REST de forma incremental.
