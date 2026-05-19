import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import {
  Dashboard,
  Inventario,
  Ventas,
  Canales,
  Insights,
  Alertas,
  Configuracion,
} from '../pages';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/inventario',
        element: <Inventario />,
      },
      {
        path: '/ventas',
        element: <Ventas />,
      },
      {
        path: '/canales',
        element: <Canales />,
      },
      {
        path: '/insights',
        element: <Insights />,
      },
      {
        path: '/alertas',
        element: <Alertas />,
      },
      {
        path: '/configuracion',
        element: <Configuracion />,
      },
    ],
  },
]);

export default router;
