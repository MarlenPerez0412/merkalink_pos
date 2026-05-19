import { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { mockPreciosDinamicos } from '../services/mockData';

export default function PreciosDinamicos() {
  const [iaActiva, setIaActiva] = useState(false);
  const [productos] = useState(mockPreciosDinamicos);

  const calcularPrecioDinamico = (prod) => {
    if (!iaActiva) return prod.precioBase;

    let factor = 1;
    if (prod.demanda === 'Alta' && prod.precioCompetencia > prod.precioBase) {
      factor += 0.08;
    }
    if (prod.demanda === 'Baja') {
      factor -= 0.1;
    }
    if (prod.costoLogistica === 'Alto') {
      factor += 0.03;
    }

    return Math.round(prod.precioBase * factor);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 text-merka-dark">
          <div className="rounded-2xl bg-merka-purple/10 p-3 text-merka-purple">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Precios Dinámicos Inteligentes</h2>
            <p className="mt-1 text-sm text-slate-500">PPC Soluciones ahora puede ver recomendaciones de precio basadas en demanda, competencia y logística.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
            <TrendingUp className="h-4 w-4 text-merka-purple" />
            <span className="text-sm font-medium">IA de optimización</span>
          </div>

          <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 border border-slate-200">
            <span>Optimización por IA Activa</span>
            <button
              type="button"
              onClick={() => setIaActiva((prev) => !prev)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                iaActiva ? 'bg-merka-purple/80' : 'bg-slate-300'
              }`}
            >
              <span className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                iaActiva ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </button>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {productos.map((prod) => {
          const precioSugerido = calcularPrecioDinamico(prod);
          const diferencia = precioSugerido - prod.precioBase;
          const cambioPositivo = diferencia > 0;

          return (
            <article key={prod.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full bg-merka-purple/10 px-3 py-1 text-xs font-semibold text-merka-purple">{prod.categoria}</span>
                  <h3 className="mt-4 text-xl font-semibold text-merka-dark">{prod.nombre}</h3>
                </div>
                <div className="rounded-3xl bg-slate-50 p-3 text-merka-purple">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 rounded-3xl bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500">
                <div className="space-y-1">
                  <p>Demanda</p>
                  <p className={`${prod.demanda === 'Alta' ? 'text-emerald-600' : 'text-amber-600'}`}>{prod.demanda}</p>
                </div>
                <div className="space-y-1">
                  <p>Competencia</p>
                  <p className="text-merka-dark">${prod.precioCompetencia}</p>
                </div>
                <div className="space-y-1">
                  <p>Logística</p>
                  <p className={`${prod.costoLogistica === 'Alto' ? 'text-rose-600' : 'text-slate-600'}`}>{prod.costoLogistica}</p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-100 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Precio Base</p>
                    <p className="mt-2 text-lg font-semibold text-slate-500 line-through">${prod.precioBase.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-merka-purple">Precio IA</p>
                    <p className="mt-2 text-3xl font-bold text-merka-dark">${precioSugerido.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {iaActiva && diferencia !== 0 && (
                <div className={`mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${
                  cambioPositivo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  <span className="flex items-center gap-2">
                    {cambioPositivo ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {cambioPositivo ? `Sube ${diferencia.toFixed(2)}` : `Baja ${Math.abs(diferencia).toFixed(2)}`}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">IA</span>
                </div>
              )}

              {!iaActiva && (
                <div className="mt-4 rounded-2xl bg-merka-purple/5 px-4 py-3 text-sm text-merka-purple">Activa la optimización para ver recomendaciones IA en tiempo real.</div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
