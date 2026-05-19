import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const AlertasVisuales = ({ type = 'info', title, message, onClose, closeable = true }) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      Icon: Info,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      Icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      Icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      Icon: AlertCircle,
    },
  };

  const style = styles[type] || styles.info;
  const Icon = style.Icon;

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex items-start gap-4`}>
      <Icon className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        {title && <p className={`${style.text} font-semibold mb-1`}>{title}</p>}
        {message && <p className={`${style.text} text-sm`}>{message}</p>}
      </div>
      {closeable && (
        <button
          onClick={onClose}
          className={`${style.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default AlertasVisuales;
