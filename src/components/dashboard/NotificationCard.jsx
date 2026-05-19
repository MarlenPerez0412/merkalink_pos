import {
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle,
  Clock,
  PackageX,
  TrendingUp,
  Wrench,
} from 'lucide-react';

const iconMap = {
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle,
  Clock,
  PackageX,
  TrendingUp,
  Wrench,
};

const priorityStyles = {
  Crítica: {
    card: 'border-red-200 bg-red-50',
    icon: 'bg-red-100 text-red-700',
    badge: 'bg-red-100 text-red-700 ring-red-200',
  },
  Alta: {
    card: 'border-orange-200 bg-orange-50',
    icon: 'bg-orange-100 text-orange-700',
    badge: 'bg-orange-100 text-orange-700 ring-orange-200',
  },
  Advertencia: {
    card: 'border-yellow-200 bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  },
  Media: {
    card: 'border-slate-200 bg-white',
    icon: 'bg-slate-100 text-slate-700',
    badge: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
  Recomendación: {
    card: 'border-violet-200 bg-violet-50',
    icon: 'bg-violet-100 text-violet-700',
    badge: 'bg-violet-100 text-violet-700 ring-violet-200',
  },
  Saludable: {
    card: 'border-green-200 bg-green-50',
    icon: 'bg-green-100 text-green-700',
    badge: 'bg-green-100 text-green-700 ring-green-200',
  },
};

const NotificationCard = ({ notification, onSeen }) => {
  const Icon = iconMap[notification.icono] || Bell;
  const styles = priorityStyles[notification.prioridad] || priorityStyles.Media;

  return (
    <article className={`rounded-lg border p-4 shadow-sm transition hover:shadow-md ${styles.card}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2.5 ${styles.icon}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-black/5">
              {notification.tipo}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${styles.badge}`}>
              {notification.prioridad}
            </span>
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-950">{notification.titulo}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{notification.mensaje}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">{notification.tiempo}</p>
            <button
              type="button"
              onClick={() => onSeen?.(notification.id)}
              className="w-fit rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
            >
              Marcar como visto
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NotificationCard;
