import Card from './Card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => {
  const isPositive = change >= 0;
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-dark-900 mt-2">{value}</p>
          </div>
          <div className={`bg-gradient-to-br ${colorMap[color]} p-3 rounded-lg`}>
            <Icon size={24} className="text-white" />
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
