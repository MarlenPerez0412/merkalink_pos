import { useState } from 'react';
import { Button, Card } from '../components';
import { AlertCircle, Edit2, Globe, Plus, Radio, Trash2, TrendingUp } from 'lucide-react';
import { canalesData, empresaData } from '../data/mockData';

const Canales = () => {
  const [canales] = useState(canalesData);
  const [showForm, setShowForm] = useState(false);
  const totalVentas = canales.reduce((sum, canal) => sum + canal.ventas, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Canales de venta</h2>
          <p className="mt-1 text-sm text-slate-500">Canales disponibles para el piloto de {empresaData.nombre}.</p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)} size="md">
          <Plus size={18} />
          Nuevo canal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Canales activos', value: canales.filter((canal) => canal.estado === 'activo').length, icon: Globe, className: 'bg-primary-50 text-primary-700' },
          { label: 'Productos sincronizados', value: canales.reduce((sum, canal) => sum + canal.productos, 0), icon: Radio, className: 'bg-violet-50 text-violet-700' },
          { label: 'Ventas totales', value: `$${totalVentas.toLocaleString()}`, icon: TrendingUp, className: 'bg-green-50 text-green-700' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${item.className}`}>
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">Conectar canal</h3>
          <p className="mb-4 text-sm text-slate-500">Formulario visual sin integración backend.</p>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <input className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="WhatsApp" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Plataforma</span>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
                <option>WhatsApp Business</option>
                <option>Facebook Marketplace</option>
                <option>Instagram</option>
                <option>Punto de venta local</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Estado</span>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Regla de sincronización</span>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
                <option>Inventario y precio</option>
                <option>Solo inventario</option>
                <option>Solo ventas</option>
              </select>
            </label>
            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-4">
              <Button type="button">Guardar mock</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {canales.map((canal) => (
          <Card key={canal.id} className="p-5" hover={false}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{canal.nombre}</h3>
                <p className="text-sm text-slate-500">{canal.plataforma} · {canal.ultimaSync}</p>
              </div>
              <span className="w-fit rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                {canal.estado}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Productos</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{canal.productos}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Ventas</p>
                <p className="mt-1 text-xl font-bold text-slate-950">${canal.ventas.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Conversión</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{canal.conversion}%</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit2 size={16} />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                <Trash2 size={16} />
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-primary-200 bg-primary-50 p-5" hover={false}>
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0 text-primary-700" size={22} />
          <div>
            <h3 className="font-bold text-slate-950">Sincronización del piloto</h3>
            <p className="mt-1 text-sm text-slate-700">
              MercaLink AI centraliza WhatsApp, Facebook, Instagram y tienda física usando datos mock para esta primera etapa.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Canales;
