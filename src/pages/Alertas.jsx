import { useMemo, useState } from 'react';
import { Bell, Brain, CheckCircle, Trash2 } from 'lucide-react';
import { Button, Card } from '../components';
import NotificationCard from '../components/dashboard/NotificationCard';
import {
  empresaData,
  notificacionesInteligentesData,
  productosData,
  serviciosData,
} from '../data/mockData';
import { generarAlertasPredictivas } from '../utils/stockPrediction';

const filters = ['todas', 'Crítica', 'Alta', 'Advertencia', 'Recomendación', 'Media', 'Saludable'];

const mapServicioToNotification = (servicio) => ({
  id: `alerta-servicio-${servicio.id}`,
  tipo: 'Servicio próximo',
  titulo: `${servicio.equipo} requiere seguimiento`,
  mensaje: `${servicio.servicio} para ${servicio.cliente}. Entrega: ${servicio.fechaEntrega} a las ${servicio.horaEntrega}.`,
  prioridad: servicio.prioridad,
  icono: 'Wrench',
  tiempo: `${servicio.fechaEntrega} · ${servicio.horaEntrega}`,
});

const Alertas = () => {
  const initialNotifications = useMemo(() => {
    // En versión futura, estos datos vendrán desde API REST.
    // Esta lógica podrá conectarse a MySQL cuando exista backend.
    // Actualmente se usan datos mock para MVP frontend.
    const stockNotifications = generarAlertasPredictivas(productosData);
    const serviceNotifications = serviciosData.map(mapServicioToNotification);

    return [
      ...notificacionesInteligentesData,
      ...stockNotifications,
      ...serviceNotifications,
    ].filter(
      (notification, index, all) =>
        all.findIndex((item) => item.id === notification.id) === index,
    );
  }, []);

  const [notifications, setNotifications] = useState(initialNotifications);
  const [filtro, setFiltro] = useState('todas');

  const filteredNotifications =
    filtro === 'todas'
      ? notifications
      : notifications.filter((notification) => notification.prioridad === filtro);

  const handleSeen = (id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            <Bell className="text-yellow-600" size={30} />
            Alertas inteligentes
          </h2>
          <p className="mt-1 text-sm text-slate-500">Notificaciones predictivas del negocio piloto {empresaData.nombre}.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setNotifications(initialNotifications)}
        >
          Restaurar mock
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total alertas', value: notifications.length, className: 'text-slate-950', icon: Bell },
          { label: 'Críticas', value: notifications.filter((item) => item.prioridad === 'Crítica').length, className: 'text-red-600', icon: Trash2 },
          { label: 'Recomendaciones IA', value: notifications.filter((item) => item.prioridad === 'Recomendación').length, className: 'text-violet-600', icon: Brain },
          { label: 'Saludables', value: notifications.filter((item) => item.prioridad === 'Saludable').length, className: 'text-green-600', icon: CheckCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4" hover={false}>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon size={14} />
                {item.label}
              </div>
              <p className={`mt-2 text-2xl font-bold ${item.className}`}>{item.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-4" hover={false}>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setFiltro(filter)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                filtro === filter
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter === 'todas' ? 'Todas' : filter}
            </button>
          ))}
        </div>
      </Card>

      {filteredNotifications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onSeen={handleSeen}
            />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center" hover={false}>
          <Bell size={42} className="mx-auto text-slate-300" />
          <p className="mt-3 font-medium text-slate-500">No hay notificaciones en esta categoría.</p>
        </Card>
      )}

      <Card className="p-5" hover={false}>
        <h3 className="text-lg font-bold text-slate-950">Configuración de alertas</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { label: 'Stock crítico en accesorios', enabled: true },
            { label: 'Predicción de desabasto', enabled: true },
            { label: 'Servicios por entregar', enabled: true },
            { label: 'Seguimiento de canales digitales', enabled: true },
          ].map((setting) => (
            <label key={setting.label} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="text-sm font-medium text-slate-800">{setting.label}</span>
              <input type="checkbox" defaultChecked={setting.enabled} className="h-4 w-4 rounded border-slate-300 text-primary-600" />
            </label>
          ))}
        </div>
        <Button className="mt-4 w-full sm:w-auto">Guardar preferencias</Button>
      </Card>
    </div>
  );
};

export default Alertas;
