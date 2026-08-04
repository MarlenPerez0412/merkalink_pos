/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import {
  Bell,
  Building2,
  Edit,
  Eye,
  EyeOff,
  FileText,
  History,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Palette,
  Phone,
  Plus,
  Power,
  PowerOff,
  Save,
  Settings,
  Truck,
  Trash2,
  User,
  UserCheck,
  UserX,
  Users,
  Upload,
  X,
  XCircle,
} from 'lucide-react';

import { Button, Card } from '../components';
import { getAlertas } from '../services/api/alertasApi';
import { getBitacora } from '../services/api/bitacoraApi';
import { cambiarPasswordUsuario, updatePerfilUsuario } from '../services/api/authApi';
import { getCanales } from '../services/api/canalesApi';
import { getConfiguracion, updateConfiguracion } from '../services/api/configuracionApi';
import { getEmpresa, updateEmpresa, uploadLogoEmpresa } from '../services/api/empresaApi';
import { getProductos } from '../services/api/productosApi';
import {
  activateProveedor,
  createProveedor,
  deactivateProveedor,
  deleteProveedor,
  getProveedores,
  updateProveedor,
} from '../services/api/proveedoresApi';
import {
  activateUsuario,
  createUsuario,
  deactivateUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from '../services/api/usuariosApi';
import { getVentas } from '../services/api/ventasApi';
import { cargarLogoEmpresaPdf, fitImageToBox, getLogoEmpresaSrc } from '../utils/logo';
import {
  activePanelTab,
  inactivePanelTab,
  tabButtonBase,
} from '../utils/uiStyles';

const tabs = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
  { id: 'proveedores', label: 'Proveedores', icon: Truck, adminOnly: true },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'bitacora', label: 'Bitácora', icon: History, adminOnly: true },
];

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

const PASSWORD_SEGURA_MENSAJE =
  'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';

const passwordRequisitos = [
  { id: 'longitud', label: '8 caracteres', validar: (password) => password.length >= 8 },
  { id: 'mayuscula', label: 'Mayúscula', validar: (password) => /[A-Z]/.test(password) },
  { id: 'minuscula', label: 'Minúscula', validar: (password) => /[a-z]/.test(password) },
  { id: 'numero', label: 'Número', validar: (password) => /\d/.test(password) },
  { id: 'especial', label: 'Carácter especial', validar: (password) => /[^A-Za-z\d]/.test(password) },
];

const validarPasswordSegura = (password = '') => passwordRequisitos.every((requisito) => requisito.validar(String(password)));

const PasswordRequirements = ({ password = '' }) => (
  <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
    <p>{PASSWORD_SEGURA_MENSAJE}</p>
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {passwordRequisitos.map((requisito) => {
        const cumple = requisito.validar(password);

        return (
          <span key={requisito.id} className={cumple ? 'font-semibold text-emerald-700' : 'text-slate-500'}>
            <span
              className={`mr-1 inline-block h-2 w-2 rounded-full ${cumple ? 'bg-emerald-500' : 'bg-slate-300'}`}
              aria-hidden="true"
            />
            {requisito.label}
          </span>
        );
      })}
    </div>
  </div>
);

const empresaFallback = {
  nombre: 'MercaLink POS',
  giro: 'Sistema POS para restaurantes y PyMEs mexicanas',
  direccion: '',
  telefono: '',
  correo: '',
  mision: '',
  vision: '',
  valores: '',
};

const obtenerUsuarioActual = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
};

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const aplicarTema = (tema) => {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');

  if (tema === 'oscuro') root.classList.add('theme-dark');
  if (tema === 'claro') root.classList.add('theme-light');
  if (tema === 'sistema' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    root.classList.add('theme-dark');
  }
};

const Configuracion = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'empresa');
  const [empresa, setEmpresa] = useState(empresaFallback);
  const [formEmpresa, setFormEmpresa] = useState(empresaFallback);
  const [editandoEmpresa, setEditandoEmpresa] = useState(false);
  const [logoVersion, setLogoVersion] = useState(() => Date.now());
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [usarLogoDefault, setUsarLogoDefault] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(obtenerUsuarioActual);
  const [formPerfil, setFormPerfil] = useState({
    nombre: usuarioActual?.nombre || '',
    correo: usuarioActual?.correo || '',
    rol: usuarioActual?.rol || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    passwordActual: '',
    nuevoPassword: '',
    confirmarPassword: '',
  });
  const [passwordVisible, setPasswordVisible] = useState({
    passwordActual: false,
    nuevoPassword: false,
    confirmarPassword: false,
  });
  const [tema, setTema] = useState(() => localStorage.getItem('temaSistema') || 'claro');
  const [stockMinimoAlerta, setStockMinimoAlerta] = useState(5);
  const [alertaProductoAgotado, setAlertaProductoAgotado] = useState(true);
  const [alertaStockBajo, setAlertaStockBajo] = useState(true);
  const [alertaReabastecimiento, setAlertaReabastecimiento] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [filtrosBitacora, setFiltrosBitacora] = useState({
    texto: '',
    modulo: '',
    accion: '',
    fecha: '',
  });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [confirmarEliminarUsuario, setConfirmarEliminarUsuario] = useState(null);
  const [cambiandoEstadoUsuario, setCambiandoEstadoUsuario] = useState(null);
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [confirmarEliminarProveedor, setConfirmarEliminarProveedor] = useState(null);
  const [cambiandoEstadoProveedor, setCambiandoEstadoProveedor] = useState(null);
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmarPassword: '',
    rol: 'Cajero',
    estado: 'Activo',
  });
  const [usuarioPasswordVisible, setUsuarioPasswordVisible] = useState({
    password: false,
    confirmarPassword: false,
  });
  const [formProveedor, setFormProveedor] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'activo',
  });
  const [loading, setLoading] = useState(true);
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [guardandoConfiguracion, setGuardandoConfiguracion] = useState(false);
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  const [guardandoProveedor, setGuardandoProveedor] = useState(false);
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const valoresEmpresa = useMemo(
    () =>
      String(empresa.valores || '')
        .split(',')
        .map((valor) => valor.trim())
        .filter(Boolean),
    [empresa.valores],
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [empresaData, configData, usuariosData, proveedoresData, bitacoraData] = await Promise.all([
        getEmpresa(),
        getConfiguracion(),
        getUsuarios().catch(() => []),
        getProveedores().catch(() => []),
        getBitacora().catch(() => ({ data: [] })),
      ]);
      const empresaCompleta = { ...empresaFallback, ...(empresaData || {}) };

      setEmpresa(empresaCompleta);
      setFormEmpresa(empresaCompleta);
      setStockMinimoAlerta(Number(configData?.stockMinimoAlerta ?? 5));
      setAlertaProductoAgotado(configData?.alertaProductoAgotado ?? true);
      setAlertaStockBajo(configData?.alertaStockBajo ?? true);
      setAlertaReabastecimiento(configData?.alertaReabastecimiento ?? true);
      setUsuarios(usuariosData || []);
      setProveedores(proveedoresData || []);
      setBitacora(bitacoraData?.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos de configuración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'empresa';
    const tabsPermitidos = tabs.filter((tabItem) => !tabItem.adminOnly || usuarioActual?.rol === 'Administrador');
    setActiveTab(tabsPermitidos.some((tabItem) => tabItem.id === tab) ? tab : 'empresa');
  }, [searchParams, usuarioActual?.rol]);

  useEffect(() => {
    aplicarTema(tema);
    localStorage.setItem('temaSistema', tema);
  }, [tema]);

  useEffect(() => {
    const syncSistema = () => {
      if (localStorage.getItem('temaSistema') === 'sistema') aplicarTema('sistema');
    };
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', syncSistema);
    return () => window.matchMedia?.('(prefers-color-scheme: dark)').removeEventListener('change', syncSistema);
  }, []);

  useEffect(() => {
    setFormPerfil({
      nombre: usuarioActual?.nombre || '',
      correo: usuarioActual?.correo || '',
      rol: usuarioActual?.rol || '',
    });
  }, [usuarioActual]);

  const handleGuardarEmpresa = async (event) => {
    event.preventDefault();

    if (!formEmpresa.nombre.trim()) {
      setError('El nombre de la empresa es obligatorio.');
      setMensaje('');
      return;
    }

    try {
      setGuardandoEmpresa(true);
      setError('');
      setMensaje('');
      await updateEmpresa(formEmpresa);
      const empresaActualizada = { ...empresaFallback, ...formEmpresa };
      setEmpresa(empresaActualizada);
      setFormEmpresa(empresaActualizada);
      setEditandoEmpresa(false);
      localStorage.setItem('empresa', JSON.stringify(empresaActualizada));
      window.dispatchEvent(new Event('empresaActualizada'));
      setMensaje('Datos de empresa guardados correctamente. El ticket usará esta información.');
    } catch (err) {
      setError(err.message || 'No se pudo guardar la empresa.');
    } finally {
      setGuardandoEmpresa(false);
    }
  };

  const handleCambiarLogo = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const formatosPermitidos = ['image/png', 'image/jpeg', 'image/webp'];
    if (!formatosPermitidos.includes(file.type)) {
      setError('Solo se permiten imágenes PNG, JPG, JPEG o WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El logo no debe superar los 5 MB.');
      return;
    }

    try {
      setSubiendoLogo(true);
      setError('');
      setMensaje('');
      await uploadLogoEmpresa(file);
      setUsarLogoDefault(false);
      setLogoVersion(Date.now());
      window.dispatchEvent(new Event('empresaActualizada'));
      setMensaje('Logo actualizado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el logo.');
    } finally {
      setSubiendoLogo(false);
    }
  };

  const handleGuardarPerfil = async (event) => {
    event.preventDefault();

    if (!usuarioActual?.id) {
      setError('No se encontró el usuario actual. Inicia sesión nuevamente.');
      return;
    }

    if (!formPerfil.nombre.trim() || !formPerfil.correo.trim()) {
      setError('Nombre y correo son obligatorios.');
      return;
    }

    try {
      setGuardandoPerfil(true);
      setError('');
      setMensaje('');
      const data = await updatePerfilUsuario(usuarioActual.id, {
        nombre: formPerfil.nombre.trim(),
        correo: formPerfil.correo.trim(),
      });
      const usuarioActualizado = data?.usuario || { ...usuarioActual, ...formPerfil };

      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      localStorage.setItem('rol', usuarioActualizado.rol);
      window.dispatchEvent(new Event('usuarioActualizado'));
      setUsuarioActual(usuarioActualizado);
      setMensaje('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo guardar el perfil.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleCambiarPassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.passwordActual || !passwordForm.nuevoPassword || !passwordForm.confirmarPassword) {
      setError('Completa todos los campos de seguridad.');
      setMensaje('');
      return;
    }

    if (passwordForm.nuevoPassword !== passwordForm.confirmarPassword) {
      setError('La nueva contraseña y la confirmación no coinciden.');
      setMensaje('');
      return;
    }

    if (!validarPasswordSegura(passwordForm.nuevoPassword)) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      setMensaje('');
      return;
    }

    try {
      setGuardandoPassword(true);
      setError('');
      setMensaje('');
      await cambiarPasswordUsuario({
        usuarioId: usuarioActual.id,
        passwordActual: passwordForm.passwordActual,
        nuevoPassword: passwordForm.nuevoPassword,
      });
      setPasswordForm({ passwordActual: '', nuevoPassword: '', confirmarPassword: '' });
      setPasswordVisible({ passwordActual: false, nuevoPassword: false, confirmarPassword: false });
      setMensaje('Contraseña actualizada correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setGuardandoPassword(false);
    }
  };

  const handleGuardarConfiguracion = async (event) => {
    event.preventDefault();

    const valor = Number(stockMinimoAlerta);
    if (!Number.isInteger(valor) || valor < 0) {
      setError('El stock mínimo para alerta debe ser un número entero igual o mayor a 0.');
      setMensaje('');
      return;
    }

    try {
      setGuardandoConfiguracion(true);
      setError('');
      setMensaje('');
      const data = await updateConfiguracion({
        stockMinimoAlerta: valor,
        alertaProductoAgotado,
        alertaStockBajo,
        alertaReabastecimiento,
      });
      setStockMinimoAlerta(Number(data?.stockMinimoAlerta ?? valor));
      window.dispatchEvent(new Event('configuracionActualizada'));
      window.dispatchEvent(new Event('alertasActualizadas'));
      setMensaje('Notificaciones guardadas correctamente. Alertas y dashboard usarán esta configuración.');
    } catch (err) {
      setError(err.message || 'No se pudo guardar la configuración.');
    } finally {
      setGuardandoConfiguracion(false);
    }
  };

  const limpiarFormUsuario = () => {
    setUsuarioEditando(null);
    setFormUsuario({
      nombre: '',
      correo: '',
      password: '',
      confirmarPassword: '',
      rol: 'Cajero',
      estado: 'Activo',
    });
    setUsuarioPasswordVisible({ password: false, confirmarPassword: false });
  };

  const editarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormUsuario({
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      password: '',
      confirmarPassword: '',
      rol: usuario.rol || 'Cajero',
      estado: usuario.estado || 'Activo',
    });
    setUsuarioPasswordVisible({ password: false, confirmarPassword: false });
  };

  const handleGuardarUsuario = async (event) => {
    event.preventDefault();

    if (!formUsuario.nombre.trim()) return setError('El nombre del usuario es obligatorio.');
    if (!formUsuario.correo.trim()) return setError('El correo del usuario es obligatorio.');
    if (!usuarioEditando && !formUsuario.password) return setError('La contraseña temporal es obligatoria al crear usuario.');
    if (formUsuario.password !== formUsuario.confirmarPassword) return setError('La contraseña y su confirmación no coinciden.');
    if (formUsuario.password && !validarPasswordSegura(formUsuario.password)) {
      return setError('La contraseña no cumple con los requisitos de seguridad.');
    }

    const payload = {
      nombre: formUsuario.nombre.trim(),
      correo: formUsuario.correo.trim(),
      password: formUsuario.password || undefined,
      rol: formUsuario.rol,
      estado: formUsuario.estado || 'Activo',
    };

    try {
      setGuardandoUsuario(true);
      setError('');
      setMensaje('');

      if (usuarioEditando) {
        await updateUsuario(usuarioEditando.id, payload);
        setMensaje('Usuario actualizado correctamente.');
      } else {
        await createUsuario(payload);
        setMensaje('Usuario creado correctamente.');
      }

      limpiarFormUsuario();
      setUsuarios(await getUsuarios());
    } catch (err) {
      setError(err.message || 'No se pudo guardar el usuario.');
    } finally {
      setGuardandoUsuario(false);
    }
  };

  const confirmarEliminarUsuarioSeleccionado = async () => {
    if (!confirmarEliminarUsuario) return;

    try {
      setError('');
      setMensaje('');
      await deleteUsuario(confirmarEliminarUsuario.id);
      setConfirmarEliminarUsuario(null);
      setUsuarios(await getUsuarios());
      setMensaje('Usuario eliminado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    }
  };

  const cambiarEstadoUsuario = async (usuario) => {
    if (!usuario) return;
    const activo = usuario.estado === 'Activo';

    try {
      setCambiandoEstadoUsuario(usuario.id);
      setError('');
      setMensaje('');

      if (activo) {
        await deactivateUsuario(usuario.id);
        setMensaje('Usuario desactivado correctamente. Ya no podra iniciar sesion.');
      } else {
        await activateUsuario(usuario.id);
        setMensaje('Usuario activado correctamente. Ya puede iniciar sesion segun su rol.');
      }

      setUsuarios(await getUsuarios());
    } catch (err) {
      setError(err.message || 'No se pudo cambiar el estado del usuario.');
    } finally {
      setCambiandoEstadoUsuario(null);
    }
  };

  const limpiarFormProveedor = () => {
    setProveedorEditando(null);
    setFormProveedor({ nombre: '', telefono: '', correo: '', direccion: '', estado: 'activo' });
  };

  const editarProveedor = (proveedor) => {
    setProveedorEditando(proveedor);
    setFormProveedor({
      nombre: proveedor.nombre || '',
      telefono: proveedor.telefono || '',
      correo: proveedor.correo || '',
      direccion: proveedor.direccion || '',
      estado: proveedor.estado || 'activo',
    });
  };

  const handleGuardarProveedor = async (event) => {
    event.preventDefault();

    if (!formProveedor.nombre.trim()) return setError('El nombre del proveedor es obligatorio.');

    try {
      setGuardandoProveedor(true);
      setError('');
      setMensaje('');

      if (proveedorEditando) {
        await updateProveedor(proveedorEditando.id, formProveedor);
        setMensaje('Proveedor actualizado correctamente.');
      } else {
        await createProveedor(formProveedor);
        setMensaje('Proveedor creado correctamente.');
      }

      limpiarFormProveedor();
      setProveedores(await getProveedores());
      window.dispatchEvent(new Event('proveedoresActualizados'));
      window.dispatchEvent(new Event('alertasActualizadas'));
    } catch (err) {
      setError(err.message || 'No se pudo guardar el proveedor.');
    } finally {
      setGuardandoProveedor(false);
    }
  };

  const confirmarBajaProveedor = async () => {
    if (!confirmarEliminarProveedor) return;

    try {
      setError('');
      setMensaje('');
      await deleteProveedor(confirmarEliminarProveedor.id);
      setConfirmarEliminarProveedor(null);
      setProveedores(await getProveedores());
      window.dispatchEvent(new Event('proveedoresActualizados'));
      window.dispatchEvent(new Event('alertasActualizadas'));
      setMensaje('Proveedor eliminado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el proveedor.');
    }
  };

  const cambiarEstadoProveedor = async (proveedor) => {
    if (!proveedor) return;
    const activo = proveedor.estado !== 'inactivo';

    try {
      setCambiandoEstadoProveedor(proveedor.id);
      setError('');
      setMensaje('');

      if (activo) {
        await deactivateProveedor(proveedor.id);
        setMensaje('Proveedor desactivado correctamente. Se conserva para reactivarlo cuando vuelva a estar disponible.');
      } else {
        await activateProveedor(proveedor.id);
        setMensaje('Proveedor activado correctamente. Ya aparece como opcion disponible en el sistema.');
      }

      setProveedores(await getProveedores());
      window.dispatchEvent(new Event('proveedoresActualizados'));
    } catch (err) {
      setError(err.message || 'No se pudo cambiar el estado del proveedor.');
    } finally {
      setCambiandoEstadoProveedor(null);
    }
  };

  const generarReportePdf = async () => {
    try {
      setGenerandoReporte(true);
      setError('');
      setMensaje('');

      const [productosData, ventasData, canalesData, alertasData, usuariosData, proveedoresData, bitacoraData] = await Promise.all([
        getProductos(),
        getVentas(),
        getCanales(),
        getAlertas(),
        getUsuarios().catch(() => usuarios),
        getProveedores().catch(() => proveedores),
        getBitacora().catch(() => ({ data: bitacora })),
      ]);

      const productos = (productosData || []).filter((producto) => producto.estado !== 'Inactivo');
      const ventas = ventasData || [];
      const canales = canalesData || [];
      const alertas = (alertasData || []).filter((alerta) => !['Vista', 'Resuelta', 'Revisada', 'Atendida'].includes(alerta.estado));
      const usuariosActivos = (usuariosData || []).filter((usuario) => usuario.estado !== 'Inactivo');
      const proveedoresActivos = (proveedoresData || []).filter((proveedor) => proveedor.estado !== 'inactivo');
      const movimientos = (bitacoraData?.data || []).slice(0, 12);
      const productosBajoStock = productos.filter(
        (producto) => Number(producto.stock || 0) > 0 && Number(producto.stock || 0) <= Number(stockMinimoAlerta),
      );
      const productosAgotados = productos.filter((producto) => Number(producto.stock || 0) <= 0);
      const totalVentas = ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
      const categorias = productos.reduce((acc, producto) => {
        const categoria = producto.categoria || 'Sin categoria';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {});
      const ventasPorOrigen = ventas.reduce((acc, venta) => {
        const origen = venta.canal || 'Sin origen';
        acc[origen] = (acc[origen] || 0) + Number(venta.total || 0);
        return acc;
      }, {});
      const ventasPorMetodo = ventas.reduce((acc, venta) => {
        const metodo = venta.metodoPago || 'Otro';
        acc[metodo] = (acc[metodo] || 0) + Number(venta.total || 0);
        return acc;
      }, {});
      const ventasPorDia = ventas.reduce((acc, venta) => {
        const fecha = new Date(venta.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        acc[fecha] = (acc[fecha] || 0) + Number(venta.total || 0);
        return acc;
      }, {});
      const fechasVentas = ventas
        .map((venta) => new Date(venta.fecha))
        .filter((fecha) => !Number.isNaN(fecha.getTime()))
        .sort((a, b) => a - b);
      const periodoInicio = fechasVentas[0]?.toLocaleDateString('es-MX') || 'Sin ventas';
      const periodoFin = fechasVentas.at(-1)?.toLocaleDateString('es-MX') || 'Sin ventas';
      const ventasPorDiaItems = Object.entries(ventasPorDia).map(([label, value]) => ({ label, value }));
      const diaMayorVenta = ventasPorDiaItems.reduce((top, item) => (!top || item.value > top.value ? item : top), null);
      const diaMenorVenta = ventasPorDiaItems.reduce((low, item) => (!low || item.value < low.value ? item : low), null);
      const productosVendidos = ventas.reduce((acc, venta) => {
        String(venta.producto || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => {
            const [nombre, cantidadTexto] = item.split(' x');
            acc[nombre] = (acc[nombre] || 0) + Number(cantidadTexto || 1);
          });
        return acc;
      }, {});
      const productosMenosVendidos = Object.entries(productosVendidos)
        .filter(([, value]) => Number(value) > 0)
        .sort((a, b) => a[1] - b[1]);
      const productosSinMovimiento = productos.filter((producto) => !productosVendidos[producto.nombre]);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const left = 14;
      const pageWidth = 216;
      const pageHeight = 279;
      const right = pageWidth - left;
      const palette = [
        [250, 204, 21],
        [34, 197, 94],
        [249, 115, 22],
        [139, 92, 246],
        [56, 189, 248],
        [20, 184, 166],
        [163, 230, 53],
        [239, 68, 68],
      ];
      let y = 16;

      const limpiarPdfTexto = (value = '') =>
        String(value || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\x20-\x7E]/g, '');

      const ensureSpace = (height = 18) => {
        if (y + height > pageHeight - 16) {
          pdf.addPage();
          y = 16;
        }
      };

      const section = (title) => {
        ensureSpace(14);
        y += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(15, 23, 42);
        pdf.text(limpiarPdfTexto(title), left, y);
        y += 5;
        pdf.setDrawColor(250, 204, 21);
        pdf.line(left, y, right, y);
        y += 6;
      };

      const text = (line, x = left) => {
        ensureSpace(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(51, 65, 85);
        pdf.text(limpiarPdfTexto(String(line)), x, y);
        y += 5;
      };

      const limitarTop = (items, maxItems = 5) => {
        const sorted = items.filter((item) => Number(item.value || 0) > 0).sort((a, b) => b.value - a.value);
        const top = sorted.slice(0, maxItems);
        const otros = sorted.slice(maxItems).reduce((sum, item) => sum + Number(item.value || 0), 0);
        return otros > 0 ? [...top, { label: 'Otros', value: otros }] : top;
      };

      const barChart = (items, maxWidth = 76, valueFormatter = (value) => String(value)) => {
        const chartItems = limitarTop(items, 8);
        const max = Math.max(...chartItems.map((item) => Number(item.value || 0)), 1);
        chartItems.forEach((item, index) => {
          ensureSpace(8);
          const width = Math.max(4, (Number(item.value || 0) / max) * maxWidth);
          pdf.setFontSize(8);
          pdf.setTextColor(51, 65, 85);
          pdf.text(limpiarPdfTexto(String(item.label).slice(0, 30)), left, y);
          pdf.setFillColor(...palette[index % palette.length]);
          pdf.rect(left + 58, y - 3.5, width, 4, 'F');
          pdf.text(limpiarPdfTexto(valueFormatter(item.value)), left + 62 + maxWidth, y);
          y += 7;
        });
      };

      const pieChart = (title, items, x, chartY, radius, valueFormatter = (value) => String(value)) => {
        const chartItems = limitarTop(items, 5);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(limpiarPdfTexto(title), x, chartY);

        if (chartItems.length === 0) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(100, 116, 139);
          pdf.text('Sin datos', x, chartY + 12);
          return;
        }

        const total = chartItems.reduce((sum, item) => sum + Number(item.value || 0), 0);
        const cx = x + radius;
        const cy = chartY + radius + 8;
        let start = -Math.PI / 2;

        chartItems.forEach((item, index) => {
          const angle = (Number(item.value || 0) / total) * Math.PI * 2;
          const color = palette[index % palette.length];
          const steps = Math.max(8, Math.ceil(angle / 0.12));
          pdf.setFillColor(...color);
          pdf.setDrawColor(255, 255, 255);
          for (let step = 0; step < steps; step += 1) {
            const a1 = start + (angle * step) / steps;
            const a2 = start + (angle * (step + 1)) / steps;
            pdf.triangle(cx, cy, cx + radius * Math.cos(a1), cy + radius * Math.sin(a1), cx + radius * Math.cos(a2), cy + radius * Math.sin(a2), 'FD');
          }
          start += angle;
        });

        let legendY = chartY + 9;
        chartItems.forEach((item, index) => {
          const percent = total > 0 ? (Number(item.value || 0) / total) * 100 : 0;
          pdf.setFillColor(...palette[index % palette.length]);
          pdf.rect(x + radius * 2 + 8, legendY - 3, 3, 3, 'F');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(51, 65, 85);
          pdf.text(limpiarPdfTexto(`${item.label}: ${percent.toFixed(1)}% (${valueFormatter(item.value)})`), x + radius * 2 + 13, legendY, { maxWidth: 48 });
          legendY += 5;
        });
      };

      const lineChart = (title, items, details = {}) => {
        const chartItems = items.slice(-10);
        ensureSpace(64);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(limpiarPdfTexto(title), left, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(limpiarPdfTexto(details.description || 'Esta gráfica muestra el total vendido por día durante el periodo analizado.'), left, y, { maxWidth: 180 });
        y += 8;
        if (chartItems.length < 2) {
          text('No hay ventas suficientes para generar tendencia diaria.');
          return;
        }
        text(`Periodo: del ${details.periodoInicio} al ${details.periodoFin}`);
        text(`Total del periodo: ${formatCurrency(details.totalPeriodo)}`);
        text(`Día con mayor venta: ${details.diaMayor?.label || 'Sin datos'} - ${formatCurrency(details.diaMayor?.value)}`);
        text(`Día con menor venta: ${details.diaMenor?.label || 'Sin datos'} - ${formatCurrency(details.diaMenor?.value)}`);
        const chartX = left;
        const chartY = y;
        const chartW = 170;
        const chartH = 28;
        const max = Math.max(...chartItems.map((item) => Number(item.value || 0)), 1);
        pdf.setFontSize(6.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Monto vendido', chartX, chartY - 2);
        pdf.text('Fechas / días', chartX + chartW - 24, chartY + chartH + 7);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(chartX, chartY, chartW, chartH);
        pdf.setDrawColor(56, 189, 248);
        chartItems.forEach((item, index) => {
          const px = chartX + (index / Math.max(chartItems.length - 1, 1)) * chartW;
          const py = chartY + chartH - (Number(item.value || 0) / max) * chartH;
          pdf.setFillColor(56, 189, 248);
          pdf.circle(px, py, 1.2, 'F');
          if (index > 0) {
            const prev = chartItems[index - 1];
            const ppx = chartX + ((index - 1) / Math.max(chartItems.length - 1, 1)) * chartW;
            const ppy = chartY + chartH - (Number(prev.value || 0) / max) * chartH;
            pdf.line(ppx, ppy, px, py);
          }
        });
        pdf.setFontSize(6);
        pdf.setTextColor(100, 116, 139);
        pdf.text(limpiarPdfTexto(chartItems[0]?.label || ''), chartX, chartY + chartH + 5);
        pdf.text(limpiarPdfTexto(chartItems.at(-1)?.label || ''), chartX + chartW, chartY + chartH + 5, { align: 'right' });
        pdf.text(limpiarPdfTexto(formatCurrency(max)), chartX + chartW + 2, chartY + 2);
        pdf.text('$0', chartX + chartW + 2, chartY + chartH);
        y += chartH + 8;
      };

      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 32, 'F');
      pdf.setFillColor(250, 204, 21);
      pdf.rect(0, 31, pageWidth, 1.5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(15);
      pdf.text(limpiarPdfTexto(empresa.nombre || 'MercaLink POS'), left, 12);
      const logoPdf = await cargarLogoEmpresaPdf(logoVersion);
      if (logoPdf) {
        const logoBox = fitImageToBox(logoPdf.width, logoPdf.height, right - 40, 6, 40, 25);
        pdf.addImage(logoPdf.dataUrl, 'PNG', logoBox.x, logoBox.y, logoBox.width, logoBox.height, undefined, 'FAST');
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(limpiarPdfTexto(empresa.giro || 'Sistema POS para restaurantes y PyMEs'), left, 19, { maxWidth: 120 });
      pdf.text(limpiarPdfTexto(`Generado: ${new Date().toLocaleString('es-MX')}`), right, 12, { align: 'right' });
      pdf.text(limpiarPdfTexto(`Usuario: ${usuarioActual?.nombre || 'Administrador'}`), right, 19, { align: 'right' });
      y = 40;
      if (empresa.direccion) text(`Dirección: ${empresa.direccion}`);
      if (empresa.telefono) text(`Teléfono: ${empresa.telefono}`);
      if (empresa.correo) text(`Correo: ${empresa.correo}`);

      section('Resumen general');
      text(`Productos activos: ${productos.length}`);
      text(`Ventas registradas: ${ventas.length}`);
      text(`Ventas totales: ${formatCurrency(totalVentas)}`);
      text(`Orígenes de venta activos: ${canales.filter((canal) => canal.estado !== 'Inactivo').length}`);
      text(`Alertas activas: ${alertas.length}`);
      text(`Categorías activas: ${Object.keys(categorias).length}`);
      text(`Proveedores activos: ${proveedoresActivos.length}`);
      text(`Usuarios activos: ${usuariosActivos.length}`);

      section('Gráficas administrativas');
      ensureSpace(95);
      pieChart('Ventas por origen', Object.entries(ventasPorOrigen).map(([label, value]) => ({ label, value })), left, y, 18, formatCurrency);
      pieChart('Productos más vendidos', Object.entries(productosVendidos).map(([label, value]) => ({ label, value })), left + 98, y, 18);
      y += 54;
      lineChart('Evolución de ventas por día', ventasPorDiaItems, {
        periodoInicio,
        periodoFin,
        totalPeriodo: totalVentas,
        diaMayor: diaMayorVenta,
        diaMenor: diaMenorVenta,
        description: 'Esta gráfica muestra el total vendido por día durante el periodo analizado.',
      });

      section('Categorías de inventario');
      barChart(Object.entries(categorias).map(([label, value]) => ({ label, value })), 76, (value) => `${value} productos`);

      section('Inventario critico');
      text(`Stock bajo (1 a ${stockMinimoAlerta}): ${productosBajoStock.length}`);
      text(`Agotados: ${productosAgotados.length}`);
      [...productosAgotados, ...productosBajoStock].slice(0, 12).forEach((producto) => {
        text(`${producto.nombre} - ${producto.categoria || 'Sin categoria'} - Stock ${producto.stock}`);
      });
      text(`Productos sin movimiento: ${productosSinMovimiento.length}`);
      productosSinMovimiento.slice(0, 8).forEach((producto) => {
        text(`${producto.nombre} - ${producto.categoria || 'Sin categoría'} - Stock ${producto.stock}`);
      });

      section('Ventas por origen');
      barChart(
        Object.entries(ventasPorOrigen).map(([label, value]) => ({
          label,
          value,
        })),
        76,
        formatCurrency,
      );

      section('Ventas por método de pago');
      barChart(
        Object.entries(ventasPorMetodo).map(([label, value]) => ({ label, value })),
        76,
        formatCurrency,
      );

      section('Productos mas vendidos');
      barChart(
        Object.entries(productosVendidos)
          .sort((a, b) => b[1] - a[1])
          .map(([label, value]) => ({ label, value })),
        76,
        (value) => `${value} u`,
      );

      section('Productos menos vendidos');
      barChart(
        productosMenosVendidos.map(([label, value]) => ({ label, value })),
        76,
        (value) => `${value} u`,
      );

      section('Alertas activas');
      alertas.slice(0, 12).forEach((alerta) => {
        text(`${alerta.tipo || 'Alerta'} - ${alerta.producto || 'Producto'} - ${alerta.estado || 'Pendiente'}`);
      });

      section('Últimos movimientos del sistema');
      if (movimientos.length === 0) {
        text('No hay movimientos registrados en la bitácora.');
      } else {
        movimientos.forEach((movimiento) => {
          text(`${new Date(movimiento.fecha).toLocaleString('es-MX')} - ${movimiento.usuario || 'Sistema'} - ${movimiento.modulo} - ${movimiento.accion}: ${movimiento.descripcion}`);
        });
      }

      pdf.save('reporte-mercalink-pos.pdf');
      setMensaje('Reporte PDF generado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo generar el reporte PDF.');
    } finally {
      setGenerandoReporte(false);
    }
  };

  const renderEmpresa = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Datos del negocio</h3>
          <p className="text-sm text-slate-500">Informacion usada en tickets y reportes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generarReportePdf}
            disabled={generandoReporte}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            <FileText size={17} />
            {generandoReporte ? 'Generando...' : 'Generar reporte'}
          </button>
          {!editandoEmpresa && (
            <button
              type="button"
              onClick={() => setEditandoEmpresa(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Edit size={17} />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-28 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
              {usarLogoDefault ? (
                <div className="text-center text-sm font-black text-slate-700">
                  {(empresa.nombre || 'ML').slice(0, 2).toUpperCase()}
                </div>
              ) : (
                <img
                  src={getLogoEmpresaSrc(logoVersion)}
                  alt="Logo de empresa"
                  className="max-h-full max-w-full object-contain"
                  onError={() => setUsarLogoDefault(true)}
                />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-950">Logo de empresa</p>
              <p className="text-sm text-slate-500">Se usa en tickets, reportes y cortes de caja.</p>
              <p className="mt-1 text-xs text-slate-500">Ruta fija: /images/logo-empresa.png</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Upload size={17} />
              {subiendoLogo ? 'Subiendo...' : 'Cambiar logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCambiarLogo}
                disabled={subiendoLogo}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setUsarLogoDefault(true);
                setMensaje('Se mostrará el logo por defecto en esta vista.');
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Restaurar logo por defecto
            </button>
          </div>
        </div>
      </div>

      {editandoEmpresa ? (
        <form onSubmit={handleGuardarEmpresa} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ['Nombre de la empresa', 'nombre'],
            ['Giro o descripcion', 'giro'],
            ['Dirección', 'direccion'],
            ['Teléfono', 'telefono'],
            ['Correo', 'correo', 'email'],
            ['Valores', 'valores'],
          ].map(([label, name, type = 'text']) => (
            <label key={name} className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <input
                type={type}
                value={formEmpresa[name] || ''}
                onChange={(event) => setFormEmpresa((prev) => ({ ...prev, [name]: event.target.value }))}
                className={fieldClass}
              />
            </label>
          ))}

          {[
            ['Misión', 'mision'],
            ['Visión', 'vision'],
          ].map(([label, name]) => (
            <label key={name} className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <textarea
                value={formEmpresa[name] || ''}
                onChange={(event) => setFormEmpresa((prev) => ({ ...prev, [name]: event.target.value }))}
                className={`${fieldClass} min-h-24`}
              />
            </label>
          ))}

          <div className="flex gap-3 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormEmpresa(empresa);
                setEditandoEmpresa(false);
              }}
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={guardandoEmpresa}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <Save size={17} />
              {guardandoEmpresa ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <p className="text-sm font-semibold text-primary-200">MercaLink POS</p>
            <h3 className="mt-2 text-2xl font-bold">{empresa.nombre}</h3>
            <p className="mt-2 text-sm text-slate-300">{empresa.giro}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 text-primary-700" size={20} />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Dirección</p>
                  <p className="mt-1 text-sm text-slate-600">{empresa.direccion || 'Sin dirección registrada'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Phone className="text-primary-700" size={18} />
                  <div>
                    <p className="text-xs text-slate-500">Teléfono</p>
                    <p className="text-sm font-semibold text-slate-950">{empresa.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary-700" size={18} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Correo</p>
                    <p className="truncate text-sm font-semibold text-slate-950">{empresa.correo || 'Sin correo'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-4" hover={false}>
              <p className="text-sm font-bold text-slate-950">Misión</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{empresa.mision || 'Sin misión registrada'}</p>
            </Card>
            <Card className="p-4" hover={false}>
              <p className="text-sm font-bold text-slate-950">Visión</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{empresa.vision || 'Sin visión registrada'}</p>
            </Card>
          </div>
          {valoresEmpresa.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {valoresEmpresa.map((valor) => (
                <span
                  key={valor}
                  className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700 ring-1 ring-violet-200"
                >
                  {valor}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPerfil = () => (
    <div className="space-y-8">
      <form className="space-y-5" onSubmit={handleGuardarPerfil}>
        <div>
          <h3 className="text-lg font-bold text-slate-950">Datos del usuario</h3>
          <p className="mt-1 text-sm text-slate-500">Estos datos se reflejan en la barra superior.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              className={fieldClass}
              value={formPerfil.nombre}
              onChange={(event) => setFormPerfil((prev) => ({ ...prev, nombre: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Correo</span>
            <input
              type="email"
              className={fieldClass}
              value={formPerfil.correo}
              onChange={(event) => setFormPerfil((prev) => ({ ...prev, correo: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Rol</span>
            <input className={`${fieldClass} bg-slate-50 text-slate-500`} value={formPerfil.rol} readOnly />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Estado</span>
            <input className={`${fieldClass} bg-slate-50 text-slate-500`} value={usuarioActual?.estado || 'Activo'} readOnly />
          </label>
        </div>
        <button
          type="submit"
          disabled={guardandoPerfil}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <Save size={18} />
          {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <form className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4" onSubmit={handleCambiarPassword}>
        <div className="flex items-center gap-2">
          <Lock size={19} className="text-slate-700" />
          <h3 className="font-bold text-slate-950">Seguridad de la cuenta</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ['Contraseña actual', 'passwordActual'],
            ['Nueva contraseña', 'nuevoPassword'],
            ['Confirmar nueva contraseña', 'confirmarPassword'],
          ].map(([label, name]) => (
            <label key={name} className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
                <input
                  type={passwordVisible[name] ? 'text' : 'password'}
                  className="w-full bg-transparent text-slate-950 outline-none"
                  value={passwordForm[name]}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, [name]: event.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((prev) => ({ ...prev, [name]: !prev[name] }))}
                  className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={passwordVisible[name] ? `Ocultar ${label}` : `Mostrar ${label}`}
                >
                  {passwordVisible[name] ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {name === 'nuevoPassword' && <PasswordRequirements password={passwordForm.nuevoPassword} />}
              {name === 'confirmarPassword' &&
                passwordForm.confirmarPassword &&
                passwordForm.nuevoPassword !== passwordForm.confirmarPassword && (
                  <p className="text-xs font-semibold text-red-600">Las contraseñas no coinciden.</p>
                )}
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={guardandoPassword}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-60"
        >
          <Save size={17} />
          {guardandoPassword ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <Palette size={19} className="text-slate-700" />
          <h3 className="font-bold text-slate-950">Apariencia del sistema</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['claro', 'Claro'],
            ['oscuro', 'Oscuro'],
            ['sistema', 'Sistema'],
          ].map(([value, label]) => (
            <label
              key={value}
              className={`rounded-lg border p-4 text-sm font-semibold transition ${
                tema === value
                  ? 'border-yellow-400 bg-yellow-400 text-slate-950 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tema"
                value={value}
                checked={tema === value}
                onChange={(event) => setTema(event.target.value)}
                className="mr-2"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificaciones = () => (
    <form className="space-y-5" onSubmit={handleGuardarConfiguracion}>
      <h3 className="text-lg font-bold text-slate-950">Preferencias de notificaciones</h3>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="block max-w-xs space-y-2">
          <span className="text-sm font-semibold text-slate-700">Stock mínimo para alerta</span>
          <input
            type="number"
            min="0"
            step="1"
            value={stockMinimoAlerta}
            onChange={(event) => setStockMinimoAlerta(event.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          ['Producto agotado', alertaProductoAgotado, setAlertaProductoAgotado],
          ['Stock bajo', alertaStockBajo, setAlertaStockBajo],
          ['Reabastecimiento recomendado', alertaReabastecimiento, setAlertaReabastecimiento],
        ].map(([label, checked, setter]) => (
          <label key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => setter(event.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-semibold text-slate-800">{label}</span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={guardandoConfiguracion}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        <Save size={18} />
        {guardandoConfiguracion ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );

  const renderUsuarios = () => (
    <div className="space-y-6">
      <form onSubmit={handleGuardarUsuario} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {usuarioEditando ? 'Editar usuario' : 'Crear usuario'}
            </h3>
            <p className="text-sm text-slate-500">Alta de administradores y cajeros desde el sistema.</p>
          </div>
          {usuarioEditando && (
            <button
              type="button"
              onClick={limpiarFormUsuario}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <XCircle size={16} />
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Nombre</span>
            <input
              className={fieldClass}
              value={formUsuario.nombre}
              onChange={(event) => setFormUsuario((prev) => ({ ...prev, nombre: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Correo</span>
            <input
              type="email"
              className={fieldClass}
              value={formUsuario.correo}
              onChange={(event) => setFormUsuario((prev) => ({ ...prev, correo: event.target.value }))}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Rol</span>
            <select
              className={fieldClass}
              value={formUsuario.rol}
              onChange={(event) => setFormUsuario((prev) => ({ ...prev, rol: event.target.value }))}
            >
              <option>Administrador</option>
              <option>Cajero</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Contraseña temporal</span>
            {usuarioEditando && (
              <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-bold uppercase text-amber-800">Recuperacion de contraseña</p>
                <p className="mt-1 text-xs leading-5 text-amber-900">
                  La contraseña actual esta protegida y no se puede visualizar. Para recuperar acceso, asigna una nueva contraseña temporal.
                </p>
                <p className="mt-2 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                  Contraseña actual: protegida
                </p>
              </div>
            )}
            <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
              <input
                type={usuarioPasswordVisible.password ? 'text' : 'password'}
                className="w-full bg-transparent text-slate-950 outline-none"
                value={formUsuario.password}
                onChange={(event) => setFormUsuario((prev) => ({ ...prev, password: event.target.value }))}
                placeholder={usuarioEditando ? 'Opcional para conservar' : ''}
              />
              <button
                type="button"
                onClick={() => setUsuarioPasswordVisible((prev) => ({ ...prev, password: !prev.password }))}
                className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={usuarioPasswordVisible.password ? 'Ocultar contrasena temporal' : 'Mostrar contrasena temporal'}
              >
                {usuarioPasswordVisible.password ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <PasswordRequirements password={formUsuario.password} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Confirmar contraseña</span>
            <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100">
              <input
                type={usuarioPasswordVisible.confirmarPassword ? 'text' : 'password'}
                className="w-full bg-transparent text-slate-950 outline-none"
                value={formUsuario.confirmarPassword}
                onChange={(event) => setFormUsuario((prev) => ({ ...prev, confirmarPassword: event.target.value }))}
              />
              <button
                type="button"
                onClick={() => setUsuarioPasswordVisible((prev) => ({ ...prev, confirmarPassword: !prev.confirmarPassword }))}
                className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={usuarioPasswordVisible.confirmarPassword ? 'Ocultar confirmacion de contrasena' : 'Mostrar confirmacion de contrasena'}
              >
                {usuarioPasswordVisible.confirmarPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {formUsuario.confirmarPassword && formUsuario.password !== formUsuario.confirmarPassword && (
              <p className="text-xs font-semibold text-red-600">Las contraseñas no coinciden.</p>
            )}
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Estado</span>
            <select
              className={fieldClass}
              value={formUsuario.estado}
              onChange={(event) => setFormUsuario((prev) => ({ ...prev, estado: event.target.value }))}
            >
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={guardandoUsuario}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <Plus size={17} />
          {guardandoUsuario ? 'Guardando...' : usuarioEditando ? 'Actualizar usuario' : 'Crear usuario'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[1120px] table-fixed text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="w-[20%] px-4 py-3">Nombre</th>
              <th className="w-[25%] px-4 py-3">Correo</th>
              <th className="w-[13%] px-4 py-3">Rol</th>
              <th className="w-[12%] px-4 py-3">Estado</th>
              <th className="w-[30%] px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="align-middle hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold leading-5 text-slate-950">
                    <span className="block truncate" title={usuario.nombre}>{usuario.nombre}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    <span className="block truncate" title={usuario.correo}>{usuario.correo}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{usuario.rol}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      usuario.estado === 'Activo' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => editarUsuario(usuario)}
                        className="inline-flex min-w-[92px] items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => cambiarEstadoUsuario(usuario)}
                        disabled={cambiandoEstadoUsuario === usuario.id || Number(usuario.id) === Number(usuarioActual?.id)}
                        className={`inline-flex min-w-[112px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                          usuario.estado === 'Activo'
                            ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {usuario.estado === 'Activo' ? <UserX size={15} /> : <UserCheck size={15} />}
                        {cambiandoEstadoUsuario === usuario.id
                          ? 'Procesando...'
                          : usuario.estado === 'Activo'
                            ? 'Desactivar'
                            : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmarEliminarUsuario(usuario)}
                        disabled={Number(usuario.id) === Number(usuarioActual?.id)}
                        className="inline-flex min-w-[96px] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProveedores = () => (
    <div className="space-y-6">
      <form onSubmit={handleGuardarProveedor} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {proveedorEditando ? 'Editar proveedor' : 'Crear proveedor'}
            </h3>
            <p className="text-sm text-slate-500">Datos usados para solicitar compras por WhatsApp.</p>
          </div>
          {proveedorEditando && (
            <button
              type="button"
              onClick={limpiarFormProveedor}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <XCircle size={16} />
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Nombre', 'nombre', 'text'],
            ['Teléfono WhatsApp', 'telefono', 'tel'],
            ['Correo', 'correo', 'email'],
            ['Dirección', 'direccion', 'text'],
          ].map(([label, name, type]) => (
            <label key={name} className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <input
                type={type}
                className={fieldClass}
                value={formProveedor[name]}
                onChange={(event) => setFormProveedor((prev) => ({ ...prev, [name]: event.target.value }))}
              />
            </label>
          ))}
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Estado</span>
            <select
              className={fieldClass}
              value={formProveedor.estado}
              onChange={(event) => setFormProveedor((prev) => ({ ...prev, estado: event.target.value }))}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={guardandoProveedor}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {proveedorEditando ? <Save size={17} /> : <Plus size={17} />}
          {guardandoProveedor ? 'Guardando...' : proveedorEditando ? 'Actualizar proveedor' : 'Crear proveedor'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {['Nombre', 'Teléfono', 'Correo', 'Dirección', 'Estado', 'Acciones'].map((heading) => (
                <th key={heading} className="px-4 py-3">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">
                  No hay proveedores registrados.
                </td>
              </tr>
            ) : (
              proveedores.map((proveedor) => (
                <tr key={proveedor.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{proveedor.nombre}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{proveedor.telefono || 'Sin teléfono'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{proveedor.correo || 'Sin correo'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{proveedor.direccion || 'Sin dirección'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{proveedor.estado}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editarProveedor(proveedor)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil size={16} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => cambiarEstadoProveedor(proveedor)}
                        disabled={cambiandoEstadoProveedor === proveedor.id}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                          proveedor.estado !== 'inactivo'
                            ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {proveedor.estado !== 'inactivo' ? <PowerOff size={16} /> : <Power size={16} />}
                        {cambiandoEstadoProveedor === proveedor.id
                          ? 'Procesando...'
                          : proveedor.estado !== 'inactivo'
                            ? 'Desactivar'
                            : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmarEliminarProveedor(proveedor)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const bitacoraFiltrada = bitacora.filter((item) => {
    const texto = filtrosBitacora.texto.trim().toLowerCase();
    const coincideTexto =
      !texto ||
      `${item.usuario || ''} ${item.modulo || ''} ${item.accion || ''} ${item.descripcion || ''} ${item.registroAfectadoId || ''}`
        .toLowerCase()
        .includes(texto);
    const coincideModulo = !filtrosBitacora.modulo || item.modulo === filtrosBitacora.modulo;
    const coincideAccion = !filtrosBitacora.accion || item.accion === filtrosBitacora.accion;
    const coincideFecha = !filtrosBitacora.fecha || new Date(item.fecha).toISOString().slice(0, 10) === filtrosBitacora.fecha;

    return coincideTexto && coincideModulo && coincideAccion && coincideFecha;
  });

  const modulosBitacora = [...new Set(bitacora.map((item) => item.modulo).filter(Boolean))];
  const accionesBitacora = [...new Set(bitacora.map((item) => item.accion).filter(Boolean))];

  const recargarBitacora = async () => {
    try {
      setError('');
      const data = await getBitacora();
      setBitacora(data?.data || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la bitácora.');
    }
  };

  const renderBitacora = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Buscar</span>
          <input
            className={fieldClass}
            value={filtrosBitacora.texto}
            onChange={(event) => setFiltrosBitacora((prev) => ({ ...prev, texto: event.target.value }))}
            placeholder="Usuario, módulo, acción o descripción"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Módulo</span>
          <select
            className={fieldClass}
            value={filtrosBitacora.modulo}
            onChange={(event) => setFiltrosBitacora((prev) => ({ ...prev, modulo: event.target.value }))}
          >
            <option value="">Todos</option>
            {modulosBitacora.map((modulo) => <option key={modulo}>{modulo}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Acción</span>
          <select
            className={fieldClass}
            value={filtrosBitacora.accion}
            onChange={(event) => setFiltrosBitacora((prev) => ({ ...prev, accion: event.target.value }))}
          >
            <option value="">Todas</option>
            {accionesBitacora.map((accion) => <option key={accion}>{accion}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Fecha</span>
          <input
            type="date"
            className={fieldClass}
            value={filtrosBitacora.fecha}
            onChange={(event) => setFiltrosBitacora((prev) => ({ ...prev, fecha: event.target.value }))}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={recargarBitacora}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        Actualizar bitácora
      </button>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {['Fecha', 'Usuario', 'Módulo', 'Acción', 'Descripción', 'Registro afectado'].map((heading) => (
                <th key={heading} className="px-4 py-3">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bitacoraFiltrada.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-sm text-slate-500">
                  No hay movimientos registrados en la bitácora.
                </td>
              </tr>
            ) : (
              bitacoraFiltrada.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">{new Date(item.fecha).toLocaleString('es-MX')}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.usuario || 'Sistema'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-950">{item.modulo}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.accion}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.descripcion}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{item.registroAfectadoId || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          <Settings size={30} />
          Configuración
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Datos del negocio, perfil y preferencias operativas del POS.
        </p>
      </div>

      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">Cargando información de MercaLink POS...</p>
        </Card>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-red-700">Aviso del sistema</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </Card>
      )}

      {mensaje && (
        <Card className="border border-green-200 bg-green-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-green-700">Operación exitosa</p>
          <p className="mt-1 text-sm text-green-600">{mensaje}</p>
        </Card>
      )}

      <Card className="overflow-hidden" hover={false}>
        <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-700">
          <div className="m-2 inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
            {tabs
              .filter((tab) => !tab.adminOnly || usuarioActual?.rol === 'Administrador')
              .map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchParams({ tab: tab.id });
                  }}
                  className={`${tabButtonBase} min-w-[134px] ${
                    activeTab === tab.id ? activePanelTab : inactivePanelTab
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'empresa' && renderEmpresa()}
          {activeTab === 'perfil' && renderPerfil()}
          {activeTab === 'usuarios' && usuarioActual?.rol === 'Administrador' && renderUsuarios()}
          {activeTab === 'proveedores' && usuarioActual?.rol === 'Administrador' && renderProveedores()}
          {activeTab === 'notificaciones' && renderNotificaciones()}
          {activeTab === 'bitacora' && usuarioActual?.rol === 'Administrador' && renderBitacora()}
        </div>
      </Card>

      {confirmarEliminarUsuario && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Eliminar usuario</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Seguro que deseas eliminar este usuario? Esta accion intentara quitarlo definitivamente del sistema.
                </p>
              </div>
              <button type="button" onClick={() => setConfirmarEliminarUsuario(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmarEliminarUsuario(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarUsuarioSeleccionado}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmarEliminarProveedor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Eliminar proveedor</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  El proveedor se eliminara del sistema y dejara de aparecer en las opciones. Si solo no estara disponible por temporada, usa Desactivar.
                </p>
              </div>
              <button type="button" onClick={() => setConfirmarEliminarProveedor(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmarEliminarProveedor(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarBajaProveedor}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
