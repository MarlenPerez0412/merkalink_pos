import { Navigate } from 'react-router-dom';

const getSession = () => ({
  token: localStorage.getItem('token'),
  rol: localStorage.getItem('rol'),
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, rol } = getSession();

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(rol)) return <Navigate to="/pos" replace />;

  return children;
};

export default ProtectedRoute;
