import Card from './Card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => {
  const isPositive = change >= 0;
  const colorMap = {
    primary: 'border-sky-200 bg-sky-50 text-sky-700',
    accent: 'border-violet-200 bg-violet-50 text-violet-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-dark-900 mt-2">{value}</p>
          </div>
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border ${colorMap[color] || colorMap.primary}`}>
            <Icon size={26} strokeWidth={2.4} />
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm">
          {isPositive ? (
            <>
              <ArrowUp size={16} className="text-green-600" />
              <span className="text-green-600 font-medium">{Math.abs(change)}%</span>
            </>
          ) : (
            <>
              <ArrowDown size={16} className="text-red-600" />
              <span className="text-red-600 font-medium">{Math.abs(change)}%</span>
            </>
          )}
          <span className="text-gray-500">vs mes anterior</span>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
