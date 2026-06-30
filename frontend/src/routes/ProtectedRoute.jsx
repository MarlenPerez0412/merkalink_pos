import { Navigate, useLocation } from 'react-router-dom';

const getSession = () => ({
  token: localStorage.getItem('token'),
  rol: localStorage.getItem('rol'),
  usuario: localStorage.getItem('usuario'),
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { token, rol, usuario } = getSession();

  if (!token || !usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allowedRoles && !allowedRoles.includes(rol)) {
    return (
      <Navigate
        to="/acceso-denegado"
        replace
        state={{ from: location.pathname, message: 'No tienes permisos para acceder a este módulo.' }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
