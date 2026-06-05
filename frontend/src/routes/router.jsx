import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import {
  Alertas,
  Canales,
  Configuracion,
  Dashboard,
  Inventario,
  Login,
  PuntoVenta,
  Ventas,
} from '../pages';

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
          <ProtectedRoute allowedRoles={['Administrador', 'Administrador General']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pos',
        element: <PuntoVenta />,
      },
      {
        path: '/inventario',
        element: (
          <ProtectedRoute allowedRoles={['Administrador', 'Administrador General']}>
            <Inventario />
          </ProtectedRoute>
        ),
      },
      {
        path: '/ventas',
        element: <Ventas />,
      },
      {
        path: '/canales',
        element: (
          <ProtectedRoute allowedRoles={['Administrador', 'Administrador General']}>
            <Canales />
          </ProtectedRoute>
        ),
      },
      {
        path: '/alertas',
        element: (
          <ProtectedRoute allowedRoles={['Administrador', 'Administrador General']}>
            <Alertas />
          </ProtectedRoute>
        ),
      },
      {
        path: '/configuracion',
        element: (
          <ProtectedRoute allowedRoles={['Administrador', 'Administrador General']}>
            <Configuracion />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
