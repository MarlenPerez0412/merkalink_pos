import { useState } from 'react';
import { Card, Button, AlertasVisuales } from '../components';
import { Zap, TrendingUp, Brain, Lightbulb } from 'lucide-react';

const Insights = () => {
  const [activeTab, setActiveTab] = useState('recomendaciones');

  const recomendaciones = [
    {
      id: 1,
      titulo: 'Aumentar Stock de Produtos Populares',
      descripcion: 'Los productos "Termo Azul" y "Auriculares" tienen alta demanda. Se recomienda aumentar el stock.',
      impacto: 'Alto',
      icon: TrendingUp,
    },
    {
      id: 2,
      titulo: 'Optimizar Precios',
      descripcion: 'Análisis de competencia sugiere reducir precio de "Café Premium" en 5% para mejorar competitividad.',
      impacto: 'Medio',
      icon: Brain,
    },
    {
      id: 3,
      titulo: 'Crear Promoción Cross-Sell',
      descripcion: 'Clientes que compran "Termo" tambíen compran "Botella Reutilizable". Crear pack por 15% de descuento.',
      impacto: 'Alto',
      icon: Lightbulb,
    },
  ];

  const predicciones = [
    {
      periodo: 'Próxima Semana',
      ventasEstimadas: '$48,500',
      confianza: '92%',
      tendencia: '↑',
    },
    {
      periodo: 'Próximo Mes',
      ventasEstimadas: '$195,200',
      confianza: '87%',
      tendencia: '↑',
    },
    {
      periodo: 'Próximo Trimestre',
      ventasEstimadas: '$625,800',
      confianza: '78%',
      tendencia: '→',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-dark-900 flex items-center gap-2">
          <Zap className="text-accent-600" size={32} />
          IA Insights
        </h2>
        <p className="text-gray-600 text-sm">Análisis inteligente impulsado por IA</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {['recomendaciones', 'predicciones', 'tendencias'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-dark-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Recomendaciones */}
      {activeTab === 'recomendaciones' && (
        <div className="space-y-4">
          {recomendaciones.map(rec => {
            const Icon = rec.icon;
            return (
              <Card key={rec.id} className="p-6 hover:shadow-md-soft">
                <div className="flex gap-4">
                  <div className="bg-gradient-to-br from-primary-100 to-accent-100 p-3 rounded-lg h-fit">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-dark-900">{rec.titulo}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        rec.impacto === 'Alto'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Impacto {rec.impacto}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{rec.descripcion}</p>
                    <Button size="sm" variant="outline">Aplicar Recomendación</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Predicciones */}
      {activeTab === 'predicciones' && (
        <div className="space-y-4">
          {predicciones.map((pred, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-dark-900 mb-2">{pred.periodo}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ventas Estimadas</p>
                      <p className="text-2xl font-bold text-dark-900">{pred.ventasEstimadas}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Confianza de Predicción</p>
                      <p className="text-2xl font-bold text-primary-600">{pred.confianza}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{pred.tendencia}</p>
                  <p className="text-xs text-gray-600 mt-2">Tendencia</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tendencias */}
      {activeTab === 'tendencias' && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-dark-900 mb-4">Análisis de Tendencias</h3>
          <AlertasVisuales
            type="info"
            title="Análisis en Tiempo Real"
            message="Se están procesando millones de datos para generar insights personalizados. Este análisis se actualiza cada hora."
            closeable={false}
          />
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
              <p className="font-semibold text-dark-900 mb-2">📈 Categoría Hogar en Crecimiento</p>
              <p className="text-sm text-gray-700">Crecimiento del 23% en últimas 2 semanas</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-accent-50 to-purple-50 rounded-lg border border-accent-200">
              <p className="font-semibold text-dark-900 mb-2">🛍️ Compras Agrupadas Detectadas</p>
              <p className="text-sm text-gray-700">Los clientes compran múltiples productos en una sola orden 38% más frecuentemente</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-dark-900 mb-2">⏰ Horario Peak</p>
              <p className="text-sm text-gray-700">Las compras se concentran entre 8PM - 11PM. Mejor momento para campañas</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Insights;
