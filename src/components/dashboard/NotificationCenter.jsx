import { useMemo, useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import NotificationCard from './NotificationCard';
import {
  canalesData,
  notificacionesInteligentesData,
  productosData,
  serviciosData,
} from '../../data/mockData';
import { generarAlertasPredictivas } from '../../utils/stockPrediction';

const mapServicioToNotification = (servicio) => ({
  id: `servicio-${servicio.id}`,
  tipo: 'Servicio próximo',
  titulo: `${servicio.servicio} por entregar`,
  mensaje: `${servicio.equipo} para ${servicio.cliente} tiene entrega: ${servicio.fechaEntrega} a las ${servicio.horaEntrega}.`,
  prioridad: servicio.prioridad,
  icono: 'Wrench',
  tiempo: `${servicio.fechaEntrega} · ${servicio.horaEntrega}`,
});

const canalSeguimientoNotification = {
  id: 'canal-facebook-seguimiento',
  tipo: 'Seguimiento administrativo',
  titulo: 'Cliente pendiente de confirmación',
  mensaje: 'Pedido registrado desde Facebook requiere confirmación antes de cerrar la venta.',
  prioridad: 'Media',
  icono: 'Clock',
  tiempo: 'Pendiente',
};

const canalVentaNotification = {
  id: 'canal-whatsapp-ventas',
  tipo: 'Canal con alta actividad',
  titulo: 'WhatsApp lidera las ventas del piloto',
  mensaje: 'WhatsApp y tienda física concentran el mayor movimiento. Conviene reforzar atención rápida.',
  prioridad: 'Recomendación',
  icono: 'TrendingUp',
  tiempo: 'Hoy',
};

const NotificationCenter = () => {
  const [seenIds, setSeenIds] = useState([]);

  const notifications = useMemo(() => {
    // En versión futura, estos datos vendrán desde API REST conectada a MySQL.
    // Actualmente se usan datos mock para MVP frontend.
    const predictiveStockAlerts = generarAlertasPredictivas(productosData).slice(0, 4);
    const serviceAlerts = serviciosData.slice(0, 2).map(mapServicioToNotification);
    const channelAlerts = canalesData.some((canal) => canal.nombre === 'WhatsApp')
      ? [canalVentaNotification, canalSeguimientoNotification]
      : [canalSeguimientoNotification];

    return [
      ...notificacionesInteligentesData,
      ...predictiveStockAlerts,
      ...serviceAlerts,
      ...channelAlerts,
    ].filter(
      (notification, index, all) =>
        all.findIndex((item) => item.id === notification.id) === index,
    );
  }, []);

  const visibleNotifications = notifications.filter((notification) => !seenIds.includes(notification.id));
  const criticalCount = visibleNotifications.filter((notification) => notification.prioridad === 'Crítica').length;
  const warningCount = visibleNotifications.filter((notification) =>
    ['Alta', 'Advertencia'].includes(notification.prioridad),
  ).length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2.5 text-primary-700">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Centro de Notificaciones Inteligentes</h2>
              <p className="mt-1 text-sm text-slate-500">
                Alertas predictivas para evitar pérdida de ventas, desabasto y retrasos en servicios.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[320px]">
          <div className="rounded-lg bg-red-50 px-3 py-2">
            <p className="text-lg font-bold text-red-700">{criticalCount}</p>
            <p className="text-xs font-medium text-red-700">Críticas</p>
          </div>
          <div className="rounded-lg bg-orange-50 px-3 py-2">
            <p className="text-lg font-bold text-orange-700">{warningCount}</p>
            <p className="text-xs font-medium text-orange-700">Atención</p>
          </div>
          <div className="rounded-lg bg-green-50 px-3 py-2">
            <p className="text-lg font-bold text-green-700">{seenIds.length}</p>
            <p className="text-xs font-medium text-green-700">Vistas</p>
          </div>
        </div>
      </div>

      {visibleNotifications.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleNotifications.slice(0, 9).map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onSeen={(id) => setSeenIds((current) => [...current, id])}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle size={22} />
          <p className="text-sm font-semibold">Todas las notificaciones inteligentes fueron revisadas.</p>
        </div>
      )}
    </section>
  );
};

export default NotificationCenter;
