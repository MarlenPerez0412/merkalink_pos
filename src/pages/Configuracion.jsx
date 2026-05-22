/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '../components';
import {
  Bell,
  Building2,
  Download,
  Lock,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  Settings,
  User,
} from 'lucide-react';
import { getEmpresa } from '../services/api/empresaApi';

const tabs = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'seguridad', label: 'Seguridad', icon: Lock },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
];

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

const empresaFallback = {
  nombre: 'PPC SOLUCIONES',
  giro: 'Comercio al por menor de computadoras y sus accesorios',
  direccion: 'Esq. Norte 3 C VBH #416, col. Victor Bravo Aguja, Santa Lucía del Camino',
  telefono: '9511396031',
  correo: 'jos.salas10@gmail.com',
  mision:
    'Empresa responsable en equipos electrónicos, ensamble de equipo de cómputo, reparaciones de celulares, impresoras y tabletas. Especialistas en software y soporte técnico en hardware.',
  vision:
    'Ofrecer a nuestros clientes un servicio de excelente calidad haciendo uso de diferentes herramientas tecnológicas.',
  valores: 'honestidad, puntualidad, calidad en el servicio, profesionalismo, respeto, tolerancia, solidaridad, justicia',
};

const convertirValores = (valores) => {
  if (Array.isArray(valores)) return valores;

  if (typeof valores === 'string') {
    return valores
      .split(',')
      .map((valor) => valor.trim())
      .filter(Boolean);
  }

  return [];
};

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('empresa');
  const [empresa, setEmpresa] = useState(empresaFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const valoresEmpresa = useMemo(() => convertirValores(empresa.valores), [empresa.valores]);

  const cargarEmpresa = async () => {
    try {
      const data = await getEmpresa();

      if (data) {
        setEmpresa({
          ...empresaFallback,
          ...data,
        });
      }

      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos de la empresa desde MySQL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpresa();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          <Settings size={30} />
          Configuración
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Perfil empresarial y preferencias visuales del piloto.
        </p>
      </div>

      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">Cargando información de PPC SOLUCIONES...</p>
        </Card>
      )}

      {error && (
        <Card className="border border-yellow-200 bg-yellow-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-yellow-800">Aviso del sistema</p>
          <p className="mt-1 text-sm text-yellow-700">{error}</p>
        </Card>
      )}

      <Card className="overflow-hidden" hover={false}>
        <div className="overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
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
          {activeTab === 'empresa' && (
            <div className="space-y-5">
              <div className="rounded-lg bg-slate-950 p-5 text-white">
                <p className="text-sm font-semibold text-primary-200">
                  Implementación PPC SOLUCIONES
                </p>

                <h3 className="mt-2 text-2xl font-bold">{empresa.nombre}</h3>

                <p className="mt-2 text-sm text-slate-300">{empresa.giro}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 text-primary-700" size={20} />

                    <div>
                      <p className="text-sm font-semibold text-slate-950">Dirección</p>
                      <p className="mt-1 text-sm text-slate-600">{empresa.direccion}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <Phone className="text-primary-700" size={18} />

                      <div>
                        <p className="text-xs text-slate-500">Teléfono</p>
                        <p className="text-sm font-semibold text-slate-950">{empresa.telefono}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary-700" size={18} />

                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Correo</p>
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {empresa.correo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-4" hover={false}>
                  <p className="text-sm font-bold text-slate-950">Misión</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{empresa.mision}</p>
                </Card>

                <Card className="p-4" hover={false}>
                  <p className="text-sm font-bold text-slate-950">Visión</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{empresa.vision}</p>
                </Card>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">Valores</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {valoresEmpresa.map((valor) => (
                    <span
                      key={valor}
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700 ring-1 ring-violet-200"
                    >
                      {valor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'perfil' && (
            <form className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Datos editables del negocio</h3>
                <p className="mt-1 text-sm text-slate-500">
                  En esta versión los datos se consultan desde MySQL. Para guardar cambios se
                  requiere agregar PUT /api/empresa en el backend.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Nombre comercial</span>
                  <input className={fieldClass} defaultValue={empresa.nombre} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Giro</span>
                  <input className={fieldClass} defaultValue={empresa.giro} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Teléfono</span>
                  <input type="tel" className={fieldClass} defaultValue={empresa.telefono} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Correo</span>
                  <input type="email" className={fieldClass} defaultValue={empresa.correo} />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Dirección</span>
                <textarea className={`${fieldClass} min-h-24`} defaultValue={empresa.direccion} />
              </label>

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  <Save size={18} />
                  Guardar cambios
                </button>
              </div>
            </form>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-950">Seguridad</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-semibold text-slate-950">Cambiar contraseña</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Control visual, sin autenticación real en esta versión.
                  </p>

                  <Button className="mt-4" variant="outline" size="sm">
                    Cambiar contraseña
                  </Button>
                </div>

                <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
                  <p className="font-semibold text-slate-950">Autenticación de dos factores</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Elemento mock para presentación del MVP.
                  </p>

                  <Button className="mt-4" variant="outline" size="sm">
                    Habilitar 2FA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Preferencias de notificaciones
              </h3>

              <div className="mt-4 space-y-3">
                {[
                  { label: 'Stock crítico', email: true, app: true },
                  { label: 'Ventas por WhatsApp', email: true, app: true },
                  { label: 'Cambios de precio sugerido', email: false, app: true },
                  { label: 'Reportes semanales del piloto', email: true, app: false },
                ].map((notif) => (
                  <div
                    key={notif.label}
                    className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium text-slate-900">{notif.label}</span>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" defaultChecked={notif.email} className="h-4 w-4" />
                        Email
                      </label>

                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" defaultChecked={notif.app} className="h-4 w-4" />
                        App
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                Guardar preferencias
              </button>
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-950">Apariencia</h3>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">Tema</p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {['Claro', 'Oscuro', 'Sistema'].map((theme, index) => (
                    <label
                      key={theme}
                      className="rounded-lg border border-slate-200 p-4 hover:border-primary-300"
                    >
                      <input type="radio" name="theme" defaultChecked={index === 0} />
                      <span className="ml-2 font-medium text-slate-900">{theme}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
              >
                Guardar preferencias
              </button>
            </div>
          )}
        </div>
      </Card>

      <Card className="border-red-200 bg-red-50 p-5" hover={false}>
        <h3 className="text-lg font-bold text-red-900">Datos de la cuenta</h3>

        <p className="mt-1 text-sm text-red-800">
          Descarga visual de datos para revisar la interfaz de exportación del MVP.
        </p>

        <Button className="mt-4" variant="outline" size="sm">
          <Download size={16} />
          Descargar datos
        </Button>
      </Card>
    </div>
  );
};

export default Configuracion;