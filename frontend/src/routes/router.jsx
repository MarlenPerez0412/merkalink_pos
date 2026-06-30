import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import {
  AccesoDenegado,
  Alertas,
  Canales,
  Configuracion,
  Dashboard,
  Inventario,
  Login,
  PuntoVenta,
  Ventas,
} from '../pages';

const adminRoles = ['Administrador', 'Administrador General'];
const ventaRoles = ['Administrador', 'Administrador General', 'Cajero'];

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pos',
        element: (
          <ProtectedRoute allowedRoles={ventaRoles}>
            <PuntoVenta />
          </ProtectedRoute>
        ),
      },
      {
        path: '/inventario',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Inventario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/ventas',
        element: (
          <ProtectedRoute allowedRoles={ventaRoles}>
            <Ventas />
          </ProtectedRoute>
        ),
      },
      {
        path: '/canales',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Canales />
          </ProtectedRoute>
        ),
      },
      {
        path: '/origen-venta',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Navigate to="/canales" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/alertas',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Alertas />
          </ProtectedRoute>
        ),
      },
      {
        path: '/configuracion',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Configuracion />
          </ProtectedRoute>
        ),
      },
      {
        path: '/usuarios',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Navigate to="/configuracion?tab=usuarios" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/proveedores',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Navigate to="/configuracion?tab=proveedores" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/bitacora',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Navigate to="/configuracion?tab=bitacora" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/categorias',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Navigate to="/inventario" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/reportes',
        element: (
          <ProtectedRoute allowedRoles={adminRoles}>
            <Navigate to="/" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/cortes-caja',
        element: (
          <ProtectedRoute allowedRoles={ventaRoles}>
            <Navigate to="/ventas" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/acceso-denegado',
        element: <AccesoDenegado />,
      },
    ],
  },
]);

export default router;
