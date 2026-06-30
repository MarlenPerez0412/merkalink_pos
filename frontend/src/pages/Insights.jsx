import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '../components';
import {
  Brain,
  Lightbulb,
  PackageSearch,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { getAlertas } from '../services/api/alertasApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getProductos } from '../services/api/productosApi';
import { getVentas } from '../services/api/ventasApi';

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const obtenerCanalLider = (ventas) => {
  if (!ventas.length) return 'Sin ventas registradas';

  const canales = ventas.reduce((acc, venta) => {
    const canal = venta.canal || 'Sin canal';
    acc[canal] = (acc[canal] || 0) + Number(venta.total || 0);
    return acc;
  }, {});

  return (
    Object.entries(canales).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'Sin ventas registradas'
  );
};

const Insights = () => {
  const [empresa, setEmpresa] = useState(null);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [empresaData, productosData, ventasData, alertasData] =
          await Promise.all([
            getEmpresa(),
            getProductos(),
            getVentas(),
            getAlertas(),
          ]);

        if (!activo) return;

        setEmpresa(empresaData || null);
        setProductos(productosData || []);
        setVentas(ventasData || []);
        setAlertas(alertasData || []);
        setError('');
      } catch (err) {
        if (!activo) return;

        setError(
          err.message || 'No se pudieron cargar los insights desde MySQL',
        );
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const productosActivos = useMemo(() => {
    return productos.filter((producto) => producto.estado !== 'Inactivo');
  }, [productos]);

  const productosCriticos = useMemo(() => {
    return productosActivos
      .filter((producto) => Number(producto.stock || 0) < 6)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
  }, [productosActivos]);

  const prediccionesStock = useMemo(() => {
    return productosActivos
      .filter((producto) => Number(producto.stock || 0) < 12)
      .slice(0, 5)
      .map((producto) => {
        const promedio = Number(producto.promedioVentasDiarias || 0);
        const stock = Number(producto.stock || 0);
        const diasRestantes = promedio > 0 ? Math.ceil(stock / promedio) : null;

        return {
          producto: producto.nombre,
          stockActual: stock,
          riesgo: stock < 5 ? 'Crítico' : 'Moderado',
          estimadoAgotamiento:
            diasRestantes !== null
              ? `${diasRestantes} días`
              : 'Sin histórico suficiente',
        };
      });
  }, [productosActivos]);

  const preciosSugeridosCalculados = useMemo(() => {
    return productosActivos
      .filter(
        (producto) =>
          producto.precioSugerido && Number(producto.precioSugerido) > 0,
      )
      .slice(0, 5)
      .map((producto) => ({
        producto: producto.nombre,
        precioActual: Number(producto.precio || 0),
        precioSugerido: Number(producto.precioSugerido || 0),
        motivo:
          producto.demanda === 'Alta'
            ? 'Demanda alta y rotación frecuente'
            : 'Ajuste sugerido por margen y comportamiento de inventario',
      }));
  }, [productosActivos]);

  const productosAltaDemanda = useMemo(() => {
    const acumulado = ventas.reduce((acc, venta) => {
      const key = venta.productoId || venta.producto || venta.producto_id;

      if (!acc[key]) {
        acc[key] = {
          producto: venta.producto || 'Producto sin nombre',
          canal: venta.canal || 'Sin canal',
          cantidad: 0,
          total: 0,
        };
      }

      acc[key].cantidad += Number(venta.cantidad || 0);
      acc[key].total += Number(venta.total || 0);

      return acc;
    }, {});

    return Object.values(acumulado)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ventas]);

  const totalVentas = useMemo(() => {
    return ventas.reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  }, [ventas]);

  const canalLider = useMemo(() => obtenerCanalLider(ventas), [ventas]);

  const productoMasVendido = productosAltaDemanda[0] || null;

  const recomendacionesIA = useMemo(() => {
    const recomendaciones = [];

    if (productosCriticos.length > 0) {
      recomendaciones.push({
        id: 'stock',
        titulo: 'Reabastecimiento prioritario',
        descripcion: `${productosCriticos[0].nombre} tiene solo ${productosCriticos[0].stock} unidades. Se recomienda comprar más inventario pronto.`,
        impacto: 'Alto',
        accion: 'Revisar inventario',
      });
    }

    if (productoMasVendido) {
      recomendaciones.push({
        id: 'demanda',
        titulo: 'Producto con alta demanda',
        descripcion: `${productoMasVendido.producto} lidera las ventas con ${productoMasVendido.cantidad} unidades vendidas.`,
        impacto: 'Alto',
        accion: 'Analizar demanda',
      });
    }

    if (canalLider !== 'Sin ventas registradas') {
      recomendaciones.push({
        id: 'canal',
        titulo: 'Canal con mejor rendimiento',
        descripcion: `${canalLider} concentra el mejor desempeño de ventas. Conviene reforzar la atención en este canal.`,
        impacto: 'Medio',
        accion: 'Revisar canal',
      });
    }

    if (!recomendaciones.length) {
      recomendaciones.push({
        id: 'inicio',
        titulo: 'Comenzar análisis operativo',
        descripcion:
          'Registra ventas y productos para que MercaLink AI genere recomendaciones más precisas.',
        impacto: 'Medio',
        accion: 'Registrar datos',
      });
    }

    return recomendaciones;
  }, [productosCriticos, productoMasVendido, canalLider]);

  const totalAlertas = useMemo(() => {
    return alertas.length;
  }, [alertas]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          <Zap className="text-accent-600" size={30} />
          IA Insights
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Recomendaciones inteligentes para{' '}
          {empresa?.nombre || 'PPC SOLUCIONES'} basadas en inventario, ventas y
          canales.
        </p>
      </div>

      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">
            Cargando IA Insights desde la base de datos...
          </p>
        </Card>
      )}

      {error && (
        <Card className="border border-yellow-200 bg-yellow-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-yellow-800">
            Aviso del sistema
          </p>
          <p className="mt-1 text-sm text-yellow-700">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {recomendacionesIA.map((rec) => (
          <Card key={rec.id} className="p-5" hover={false}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="rounded-lg bg-primary-50 p-3 text-primary-700">
                <Lightbulb size={22} />
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  rec.impacto === 'Alto'
                    ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                    : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'
                }`}
              >
                Impacto {rec.impacto}
              </span>
            </div>

            <h3 className="font-bold text-slate-950">{rec.titulo}</h3>

            <p className="mt-2 text-sm text-slate-600">{rec.descripcion}</p>

            <Button className="mt-4" size="sm" variant="outline">
              {rec.accion}
            </Button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-3">
            <PackageSearch className="text-orange-600" size={22} />
            <h3 className="text-lg font-bold text-slate-950">
              Predicción simple de stock
            </h3>
          </div>

          <div className="space-y-3">
            {prediccionesStock.length > 0 ? (
              prediccionesStock.map((item) => (
                <div key={item.producto} className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">
                      {item.producto}
                    </p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.riesgo === 'Crítico'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {item.riesgo}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Stock {item.stockActual} · Agotamiento estimado:{' '}
                    {item.estimadoAgotamiento}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No hay productos con riesgo de agotamiento.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-3">
            <Brain className="text-violet-600" size={22} />
            <h3 className="text-lg font-bold text-slate-950">
              Precio sugerido simulado
            </h3>
          </div>

          <div className="space-y-3">
            {preciosSugeridosCalculados.length > 0 ? (
              preciosSugeridosCalculados.map((item) => (
                <div key={item.producto} className="rounded-lg bg-slate-50 p-3">
                  <p className="font-semibold text-slate-950">
                    {item.producto}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {formatCurrency(item.precioActual)}
                    </span>

                    <span className="font-bold text-primary-700">
                      {formatCurrency(item.precioSugerido)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">{item.motivo}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No hay precios sugeridos registrados todavía.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="text-green-600" size={22} />
            <h3 className="text-lg font-bold text-slate-950">
              Productos con mayor demanda
            </h3>
          </div>

          <div className="space-y-3">
            {productosAltaDemanda.length > 0 ? (
              productosAltaDemanda.map((item, index) => (
                <div
                  key={`${item.producto}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700">
                      {index + 1}
                    </span>

                    <div>
                      <p className="font-semibold text-slate-950">
                        {item.producto}
                      </p>
                      <p className="text-xs text-slate-500">{item.canal}</p>
                    </div>
                  </div>

                  <span className="font-bold text-slate-950">
                    {item.cantidad}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Todavía no hay ventas suficientes.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5" hover={false}>
        <div className="flex items-center gap-3">
          <Sparkles className="text-primary-700" size={22} />

          <h3 className="text-lg font-bold text-slate-950">
            Resumen IA del piloto
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm leading-6 text-slate-600 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Canal principal
            </p>

            <p className="mt-2 text-base font-bold text-slate-950">
              {canalLider}
            </p>

            <p className="mt-1">
              Este canal concentra el mejor desempeño actual según las ventas
              registradas.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Inventario crítico
            </p>

            <p className="mt-2 text-base font-bold text-slate-950">
              {productosCriticos.length}
            </p>

            <p className="mt-1">
              Productos requieren atención por bajo stock o riesgo de
              agotamiento.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Ventas analizadas
            </p>

            <p className="mt-2 text-base font-bold text-slate-950">
              {formatCurrency(totalVentas)}
            </p>

            <p className="mt-1">
              Monto total considerado para generar recomendaciones del piloto.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Alertas activas
            </p>

            <p className="mt-2 text-base font-bold text-slate-950">
              {totalAlertas}
            </p>

            <p className="mt-1">
              Notificaciones generadas desde la base de datos para apoyar la
              toma de decisiones.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-primary-100 bg-primary-50 p-4">
          <p className="text-sm leading-6 text-slate-700">
            La primera etapa debe priorizar reabastecimiento, rapidez de
            atención, análisis de canales y precios sugeridos para productos con
            mayor demanda.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Insights;