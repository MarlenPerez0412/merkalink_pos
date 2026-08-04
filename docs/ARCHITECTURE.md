# Arquitectura técnica de MercaLink POS

Este documento describe la implementación que existe en el repositorio. No presupone una arquitectura .NET ni presenta como implementados componentes que todavía no existen.

## Alcance y tecnologías

MercaLink POS es un monorepo JavaScript con tres partes:

```text
frontend React/Vite
        |
        | HTTP JSON + Authorization: Bearer
        v
backend Node.js/Express
        |
        | mysql2/promise (SQL directo)
        v
MySQL
```

- `frontend/`: interfaz React, rutas, páginas, componentes y clientes de la API.
- `backend/`: API REST Express, autenticación/autorización, reglas operativas y consultas SQL.
- `backend/database/merkalink_pos_unoprueba.sql`: definición y datos SQL de referencia.

El proyecto no usa C#, namespaces, ASP.NET Core, Entity Framework Core ni un ORM.

## Flujo real del backend

```text
src/app.js
  -> src/routes/*.routes.js
  -> src/middlewares/auth.js
  -> src/controllers/*.controller.js
  -> src/config/db.js (pool mysql2)
  -> MySQL
```

Las rutas definen endpoints y encadenan middleware. Los controllers reciben la solicitud, validan datos manualmente, aplican reglas, ejecutan SQL y construyen la respuesta. El pool de `src/config/db.js` es la única abstracción compartida de acceso a datos.

## Comparación con una arquitectura por capas

### API Layer — parcialmente implementada

Implementado:

- Rutas Express en `backend/src/routes/`.
- Controllers en `backend/src/controllers/`.
- Middleware de autenticación y autorización en `backend/src/middlewares/auth.js`.
- Middleware global de CORS, JSON, archivos estáticos, 404 y errores en `backend/src/app.js`.
- Respuestas HTTP JSON y validaciones manuales dentro de los controllers.

No implementado:

- DTOs o esquemas de entrada/salida formales.
- JWT. El valor actual tiene formato `demo-token-<usuarioId>` y no está firmado ni expira.
- Swagger/OpenAPI.
- Validación declarativa centralizada con una biblioteca de esquemas.

Equivalencias de nombres:

- Los archivos `*.routes.js` cumplen la función de routing de una API.
- `src/middlewares/auth.js` reúne autenticación y autorización por roles.
- Los objetos JSON construidos por controllers funcionan como modelos de respuesta informales, pero no son DTOs independientes.

### Business Logic Layer — existe, pero no está separada

Reglas existentes:

- Validación de stock y cálculo del total de venta usando precios obtenidos de MySQL.
- Transacciones y bloqueos `FOR UPDATE` al registrar ventas.
- Descuento de inventario y creación de detalle de venta.
- Cálculo de cortes de caja, diferencias, totales por método de pago y reportes.
- Reglas de productos, categorías, alertas, proveedores, usuarios y contraseñas.
- Mapeos de filas SQL a objetos JSON mediante funciones locales `map*`.

Estas reglas residen principalmente en `src/controllers/*.controller.js`. No existen directorios o módulos independientes de `services`, `use-cases`, `validators` o `mappers`. Por tanto, la capa está implementada funcionalmente, pero mezclada con HTTP y acceso a datos.

Los controllers con mayor concentración de responsabilidades son `cortesCaja.controller.js`, `productos.controller.js`, `ventas.controller.js`, `alertas.controller.js` y `auth.controller.js`.

### Data Access Layer — parcialmente implementada sin encapsulación

Implementado:

- Pool de conexiones MySQL en `backend/src/config/db.js`.
- SQL parametrizado mediante `mysql2/promise`.
- Transacciones explícitas en operaciones críticas.
- Script SQL de referencia en `backend/database/`.
- Scripts operativos de verificación y corrección en `backend/scripts/`.

No implementado:

- Repositories.
- Entities como modelos de dominio.
- `POSDbContext` o equivalente ORM.
- EF Core y sus migrations; no aplican directamente a este stack.
- Un mecanismo único de migraciones MySQL versionadas.

El equivalente actual de `DbContext` es únicamente el `pool` exportado por `src/config/db.js`. No ofrece seguimiento de entidades ni migraciones. Las entidades existen como tablas MySQL y objetos JavaScript informales.

## Responsabilidades mezcladas detectadas

1. Los controllers ejecutan SQL directamente y también construyen respuestas HTTP.
2. Los cálculos de venta, stock, alertas y cortes están dentro de controllers en lugar de services/use cases.
3. Funciones `map*` locales sustituyen una capa formal de mappers/DTOs.
4. Varios controllers ejecutan `CREATE TABLE` o `ALTER TABLE` durante solicitudes. Los cambios de esquema deberían ejecutarse de manera controlada antes de iniciar la aplicación.
5. El middleware de autenticación consulta MySQL directamente; funciona, pero mezcla seguridad con acceso a datos.
6. La configuración de cargas con Multer y respuestas de upload vive en archivos de rutas.

## Seguridad actual

- Las contraseñas nuevas se derivan con `scrypt`, sal aleatoria y comparación de tiempo constante.
- Existe compatibilidad temporal con contraseñas heredadas sin prefijo `scrypt$`; estas se comparan como texto y se migran al iniciar sesión correctamente.
- El backend vuelve a consultar el usuario y comprueba que esté activo.
- Las rutas sensibles usan autorización por rol o por identidad.
- El token actual no es JWT ni una sesión segura: es predecible, no tiene firma, expiración ni revocación.
- El frontend guarda token, rol y usuario en `localStorage`, lo que amplía el impacto de una vulnerabilidad XSS.

El control de roles no debe confundirse con una autenticación de token segura. El reemplazo por JWT o sesiones opacas requiere diseño de expiración, renovación, revocación, almacenamiento y pruebas; no debe hacerse como un cambio aislado.

## Estado de los componentes solicitados

| Componente | Estado real | Implementación o equivalencia |
| --- | --- | --- |
| Controllers | Implementado | `backend/src/controllers/*.controller.js` |
| DTOs | No implementado | Objetos y mapeos locales informales |
| Services | No implementado como capa | Reglas dentro de controllers |
| Validators | Parcial | Condiciones y expresiones regulares locales |
| Use Cases | No implementado como módulos | Flujos dentro de controllers |
| Mappers | Parcial, con otro patrón | Funciones locales como `mapVenta` y `mapCorte` |
| Repositories | No implementado | SQL directo desde controllers/utilidades/middleware |
| Entidades | Otro patrón | Tablas MySQL y objetos JavaScript sin clases |
| DbContext | No aplica | Pool MySQL2 en `backend/src/config/db.js` |
| JWT | No implementado | Token de demostración predecible |
| Middleware | Implementado | Express, CORS, auth, roles, errores y uploads |
| Swagger/OpenAPI | No implementado | No hay contrato de API generado |
| EF Core migrations | No aplica | SQL de referencia y DDL en runtime/scripts |
| Pruebas automatizadas | No implementado | No hay script ni suite de tests |

## Evolución recomendada sin romper el proyecto

La separación debe hacerse por módulo y con pruebas de caracterización, no mediante una reescritura completa:

1. Añadir pruebas para autenticación, venta POS, stock y cortes de caja.
2. Sustituir el token de demostración por una estrategia de sesión diseñada y probada.
3. Introducir validadores de entrada reutilizables en los endpoints de mayor riesgo.
4. Extraer primero servicios de ventas y cortes, conservando las firmas HTTP actuales.
5. Extraer repositorios MySQL por módulo después de estabilizar los servicios.
6. Mover el DDL de runtime a migraciones SQL versionadas.
7. Documentar la API con OpenAPI a partir del comportamiento probado.

No se recomienda agregar `POSDbContext`, entities o EF Core a este repositorio salvo que se decida explícitamente migrar el backend a .NET. En el stack actual, sus equivalentes coherentes serían repositories MySQL, modelos/DTOs JavaScript, services y migraciones SQL.

## Convenciones para cambios futuros

- Conservar las rutas y contratos JSON existentes mientras se extraen capas.
- Evitar mover varios módulos simultáneamente.
- Mantener SQL parametrizado y transacciones en operaciones de inventario/ventas.
- No confiar en el rol almacenado por el frontend; la autorización definitiva debe seguir en el backend.
- Acompañar cada extracción con pruebas y una migración reversible.
