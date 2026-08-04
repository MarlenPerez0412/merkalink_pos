/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { CreditCard, Eye, FileText, Plus, TrendingDown, TrendingUp, X } from 'lucide-react';
import { BarChart, Card, LineChart, defaultChartOptions } from '../components';
import { getCanales } from '../services/api/canalesApi';
import { createCorteCaja, getCorteCaja, getCorteCajaReporte, getCortesCaja } from '../services/api/cortesCajaApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getUsuarios } from '../services/api/usuariosApi';
import { getVentaDetalle, getVentas } from '../services/api/ventasApi';
import { cargarLogoEmpresaPdf, fitImageToBox } from '../utils/logo';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const obtenerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
};

const esCajero = (usuario) => String(usuario?.rol || '').trim() === 'Cajero';

const getFechaKey = (fecha) => {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const filtrarVentasPorPeriodo = (ventas, periodo) => {
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  if (periodo === 'Dia') {
    return ventas.filter((venta) => getFechaKey(venta.fecha) === getFechaKey(hoy));
  }

  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - (periodo === 'Semana' ? 6 : 29));
  inicio.setHours(0, 0, 0, 0);

  return ventas.filter((venta) => {
    const fechaVenta = new Date(venta.fecha);
    return fechaVenta >= inicio && fechaVenta <= hoy;
  });
};

const generarVentasPorDia = (ventas, periodo) => {
  const hoy = new Date();
  const cantidadDias = periodo === 'Dia' ? 1 : periodo === 'Semana' ? 7 : 30;

  const dias = Array.from({ length: cantidadDias }, (_, index) => {
    const date = new Date(hoy);
    date.setDate(hoy.getDate() - (cantidadDias - 1 - index));

    return {
      key: getFechaKey(date),
      label:
        periodo === 'Mes'
          ? date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
          : diasSemana[date.getDay()],
      total: 0,
    };
  });

  ventas.forEach((venta) => {
    const dia = dias.find((item) => item.key === getFechaKey(venta.fecha));
    if (dia) dia.total += Number(venta.total || 0);
  });

  return {
    labels: dias.map((item) => item.label),
    datasets: [
      {
        label: 'Ventas',
        data: dias.map((item) => item.total),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
};

const generarVentasPorCanal = (ventas) => {
  const canalesMap = ventas.reduce((acc, venta) => {
    const canal = venta.canal || 'Sin canal';
    acc[canal] = (acc[canal] || 0) + Number(venta.total || 0);
    return acc;
  }, {});

  return {
    labels: Object.keys(canalesMap),
    datasets: [
      {
        label: 'Ventas por canal',
        data: Object.values(canalesMap),
        backgroundColor: ['#0ea5e9', '#22c55e', '#f97316', '#ec4899', '#64748b'],
        borderRadius: 8,
      },
    ],
  };
};

const Ventas = () => {
  const [usuarioActual] = useState(obtenerUsuario);
  const [periodo, setPeriodo] = useState('Semana');
  const [ventas, setVentas] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [canales, setCanales] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [detalleCorte, setDetalleCorte] = useState(null);
  const [detalleVenta, setDetalleVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [guardandoCorte, setGuardandoCorte] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formCorte, setFormCorte] = useState({
    usuarioId: '',
    canalId: '',
    fecha: getFechaKey(new Date()),
    horaInicio: '08:00',
    horaFin: '16:00',
    turno: 'Matutino',
    montoContado: '',
    observaciones: '',
  });

  const cargarDatos = useCallback(async () => {
    try {
      const scopeParams = esCajero(usuarioActual) ? { usuario_id: usuarioActual?.id, rol: usuarioActual?.rol } : {};
      const [ventasData, empresaData, usuariosData, canalesData, cortesData] = await Promise.all([
        getVentas(scopeParams),
        getEmpresa(),
        getUsuarios().catch(() => []),
        getCanales().catch(() => []),
        getCortesCaja(scopeParams).catch(() => []),
      ]);

      setVentas(ventasData || []);
      setEmpresa(empresaData || null);
      setUsuarios(usuariosData || []);
      setCanales(canalesData || []);
      setCortes(cortesData || []);
      if (esCajero(usuarioActual)) {
        setFormCorte((prev) => ({ ...prev, usuarioId: String(usuarioActual?.id || '') }));
      }
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las ventas desde MySQL.');
    } finally {
      setLoading(false);
    }
  }, [usuarioActual]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const recargarDatosCompartidos = () => cargarDatos();

    window.addEventListener('empresaActualizada', recargarDatosCompartidos);
    window.addEventListener('usuarioActualizado', recargarDatosCompartidos);

    return () => {
      window.removeEventListener('empresaActualizada', recargarDatosCompartidos);
      window.removeEventListener('usuarioActualizado', recargarDatosCompartidos);
    };
  }, [cargarDatos]);

  const ventasFiltradas = useMemo(() => filtrarVentasPorPeriodo(ventas, periodo), [ventas, periodo]);
  const ventasRecientes = useMemo(
    () => [...ventasFiltradas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    [ventasFiltradas],
  );
  const totalVentas = useMemo(
    () => ventasFiltradas.reduce((sum, venta) => sum + Number(venta.total || 0), 0),
    [ventasFiltradas],
  );
  const promedioPorOrden = ventasFiltradas.length > 0 ? totalVentas / ventasFiltradas.length : 0;
  const ventasPorDiaData = useMemo(
    () => generarVentasPorDia(ventasFiltradas, periodo),
    [ventasFiltradas, periodo],
  );
  const ventasPorCanalData = useMemo(() => generarVentasPorCanal(ventasFiltradas), [ventasFiltradas]);

  const textoPeriodo = {
    Dia: 'Ventas registradas hoy.',
    Semana: 'Ventas registradas en los ultimos 7 dias.',
    Mes: 'Ventas registradas en los ultimos 30 dias.',
  };

  const chartOptions = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: { ...defaultChartOptions.plugins.legend, display: false },
    },
  };

  const consultarDetalle = async (ventaId) => {
    try {
      setLoadingDetalle(true);
      setError('');
      const data = await getVentaDetalle(ventaId);
      setDetalleVenta(data);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el detalle de la venta.');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const crearCorte = async (event) => {
    event.preventDefault();

    try {
      setGuardandoCorte(true);
      setError('');
      setSuccess('');
      const usuarioIdCorte = esCajero(usuarioActual)
        ? Number(usuarioActual?.id || 0)
        : formCorte.usuarioId
          ? Number(formCorte.usuarioId)
          : null;
      await createCorteCaja({
        usuarioId: usuarioIdCorte,
        usuarioActualId: usuarioActual?.id || null,
        rol: usuarioActual?.rol || '',
        canalId: formCorte.canalId ? Number(formCorte.canalId) : null,
        fecha: formCorte.fecha,
        horaInicio: formCorte.horaInicio,
        horaFin: formCorte.horaFin,
        turno: formCorte.turno,
        montoContado: Number(formCorte.montoContado || 0),
        observaciones: formCorte.observaciones,
      });
      setCortes(await getCortesCaja(esCajero(usuarioActual) ? { usuario_id: usuarioActual?.id, rol: usuarioActual?.rol } : {}));
      setSuccess('Corte de caja generado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo generar el corte de caja.');
    } finally {
      setGuardandoCorte(false);
    }
  };

  const verDetalleCorte = async (corteId) => {
    try {
      setDetalleCorte(await getCorteCaja(
        corteId,
        esCajero(usuarioActual) ? { usuario_id: usuarioActual?.id, rol: usuarioActual?.rol } : {},
      ));
    } catch (err) {
      setError(err.message || 'No se pudo cargar el corte de caja.');
    }
  };

  const calcularDineroCaja = (corte) => Number(corte.montoContado || 0);
  const obtenerGananciaEstimada = () => 'Pendiente de costo';

  const generarPdfCorte = async (corteId) => {
    try {
      const data = await getCorteCajaReporte(
        corteId,
        esCajero(usuarioActual) ? { usuario_id: usuarioActual?.id, rol: usuarioActual?.rol } : {},
      );
      const corte = data.corte;
      const empresaPdf = data.empresa || empresa || {};
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const left = 14;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const right = pageWidth - left;
      const logoPdf = await cargarLogoEmpresaPdf();
      const palette = {
        navy: [15, 23, 42],
        gold: [250, 204, 21],
        green: [34, 197, 94],
        orange: [249, 115, 22],
        purple: [139, 92, 246],
        sky: [56, 189, 248],
        red: [239, 68, 68],
        teal: [20, 184, 166],
        lime: [163, 230, 53],
        rose: [251, 113, 133],
        gray: [100, 116, 139],
      };
      const chartPalette = [
        palette.gold,
        palette.green,
        palette.orange,
        palette.purple,
        palette.sky,
        palette.teal,
        palette.lime,
        palette.rose,
        palette.navy,
      ];
      const methodColors = {
        efectivo: palette.green,
        tarjeta: palette.sky,
        transferencia: palette.purple,
        plataforma: palette.orange,
        plataformas: palette.orange,
        digital: palette.orange,
        otro: palette.gray,
        otros: palette.gray,
      };
      const channelColors = {
        mostrador: palette.gold,
        'didi food': palette.orange,
        didi: palette.orange,
        'uber eats': palette.green,
        uber: palette.green,
        whatsapp: palette.teal,
        facebook: palette.sky,
        instagram: palette.purple,
        otro: palette.gray,
        otros: palette.gray,
        'sin origen': palette.gray,
      };
      let y = 48;

      const limpiarPdfTexto = (value = '') =>
        String(value || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\x20-\x7E]/g, '');

      const fechaPdf = (value) => (value ? new Date(value).toLocaleDateString('es-MX') : 'N/A');
      const horaPdf = (value) => (value ? String(value).slice(0, 5) : 'N/A');
      const fechaHoraPdf = (value) => (value ? new Date(value).toLocaleString('es-MX') : 'N/A');
      const monto = (value) => formatCurrency(value);
      const colorKey = (value = '') =>
        limpiarPdfTexto(value)
          .trim()
          .toLowerCase();
      const formatChartValue = (value, mode = 'number') => (mode === 'currency' ? monto(value) : String(Number(value || 0)));
      const pickMappedColor = (label, colorMap, fallback = palette.gray) => {
        const key = colorKey(label);
        return colorMap[key] || Object.entries(colorMap).find(([mapKey]) => key.includes(mapKey))?.[1] || fallback;
      };

      const prepareChartItems = (items, {
        maxItems = 6,
        colorMap = null,
        highlightLabel = '',
        highlightColor = null,
        fallbackPalette = chartPalette,
        sortDirection = 'desc',
      } = {}) => {
        const sorted = items
          .filter((item) => Number(item.value || 0) > 0)
          .sort((a, b) => (
            sortDirection === 'asc'
              ? Number(a.value || 0) - Number(b.value || 0)
              : Number(b.value || 0) - Number(a.value || 0)
          ));
        const mainItems = sorted.slice(0, maxItems);
        const otherItems = sorted.slice(maxItems);
        const grouped = [...mainItems];

        if (otherItems.length > 0) {
          grouped.push({
            label: 'Otros',
            value: otherItems.reduce((sum, item) => sum + Number(item.value || 0), 0),
            color: palette.gray,
          });
        }

        const highlightKey = colorKey(highlightLabel);
        return grouped.map((item, index) => {
          const itemKey = colorKey(item.label);
          let color = item.color;
          if (!color && highlightKey && itemKey === highlightKey && highlightColor) color = highlightColor;
          if (!color && colorMap) color = pickMappedColor(item.label, colorMap, null);
          if (!color) color = fallbackPalette[index % fallbackPalette.length];
          return { ...item, color };
        });
      };

      const addHeader = () => {
        pdf.setFillColor(...palette.navy);
        pdf.rect(0, 0, pageWidth, 38, 'F');
        pdf.setFillColor(...palette.gold);
        pdf.rect(0, 37, pageWidth, 1, 'F');
        pdf.setTextColor(255, 255, 255);
        let textX = left;
        if (logoPdf) {
          const logoBox = fitImageToBox(logoPdf.width, logoPdf.height, left, 6, 25, 18);
          pdf.addImage(logoPdf.dataUrl, 'PNG', logoBox.x, logoBox.y, logoBox.width, logoBox.height, undefined, 'FAST');
          textX = left + Math.max(29, logoBox.width + 5);
        }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(limpiarPdfTexto(empresaPdf.nombre || 'MercaLink POS'), textX, 11);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const datosEmpresa = [
          empresaPdf.giro,
          empresaPdf.direccion && `Direccion: ${empresaPdf.direccion}`,
          empresaPdf.telefono && `Tel: ${empresaPdf.telefono}`,
          empresaPdf.correo && `Correo: ${empresaPdf.correo}`,
        ].filter(Boolean).join(' | ');
        pdf.text(limpiarPdfTexto(datosEmpresa || 'Sistema POS para restaurantes y PyMEs'), textX, 18, { maxWidth: 98 });
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('Corte de caja', right, 12, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(limpiarPdfTexto(`Folio: ${corte.folio}`), right, 19, { align: 'right' });
        pdf.text(limpiarPdfTexto(`Generado: ${fechaHoraPdf(new Date())}`), right, 25, { align: 'right' });
        pdf.text(limpiarPdfTexto(`Usuario: ${usuarioActual?.nombre || 'Sistema'}`), right, 31, { align: 'right' });
        pdf.setTextColor(15, 23, 42);
      };

      const ensureSpace = (height = 20) => {
        if (y + height > pageHeight - 18) {
          pdf.addPage();
          addHeader();
          y = 48;
        }
      };

      const section = (title) => {
        ensureSpace(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...palette.navy);
        pdf.text(limpiarPdfTexto(title), left, y);
        y += 3;
        pdf.setDrawColor(...palette.gold);
        pdf.line(left, y, right, y);
        y += 6;
      };

      const card = (x, cardY, width, title, value, detail = '', color = [15, 23, 42]) => {
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(x, cardY, width, 24, 2, 2, 'FD');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text(limpiarPdfTexto(title), x + 4, cardY + 7);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...color);
        pdf.text(limpiarPdfTexto(String(value)), x + 4, cardY + 14);
        if (detail) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(100, 116, 139);
          pdf.text(limpiarPdfTexto(detail), x + 4, cardY + 20, { maxWidth: width - 8 });
        }
      };

      const drawTable = (headers, rows, widths) => {
        const rowBaseHeight = 7;
        const tableWidth = widths.reduce((sum, width) => sum + width, 0);
        const drawHeader = () => {
          pdf.setFillColor(241, 245, 249);
          pdf.setDrawColor(226, 232, 240);
          pdf.rect(left, y, tableWidth, rowBaseHeight, 'FD');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(51, 65, 85);
          let x = left;
          headers.forEach((header, index) => {
            pdf.text(limpiarPdfTexto(header), x + 2, y + 4.7, { maxWidth: widths[index] - 4 });
            x += widths[index];
          });
          y += rowBaseHeight;
        };

        ensureSpace(rowBaseHeight * 2);
        drawHeader();

        rows.forEach((row) => {
          const lineGroups = row.map((cell, index) =>
            pdf.splitTextToSize(limpiarPdfTexto(cell), widths[index] - 4),
          );
          const rowHeight = Math.max(rowBaseHeight, Math.max(...lineGroups.map((lines) => lines.length)) * 4 + 3);
          ensureSpace(rowHeight + 2);
          if (y === 48) drawHeader();
          pdf.setDrawColor(226, 232, 240);
          pdf.rect(left, y, tableWidth, rowHeight);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(51, 65, 85);
          let x = left;
          lineGroups.forEach((lines, index) => {
            pdf.text(lines, x + 2, y + 4.5);
            x += widths[index];
          });
          y += rowHeight;
        });
        y += 4;
      };

      const drawPieChart = (title, items, x, chartY, radius, options = {}) => {
        const cleanItems = prepareChartItems(items, options);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...palette.navy);
        pdf.text(limpiarPdfTexto(title), x, chartY);

        if (cleanItems.length === 0) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(100, 116, 139);
          pdf.text('No hay datos de ventas en este corte.', x, chartY + 12, { maxWidth: 72 });
          return;
        }

        const total = cleanItems.reduce((sum, item) => sum + Number(item.value || 0), 0);
        const cx = x + radius;
        const cy = chartY + radius + 8;
        let start = -Math.PI / 2;

        cleanItems.forEach((item, index) => {
          const value = Number(item.value || 0);
          const angle = (value / total) * Math.PI * 2;
          const color = item.color || chartPalette[index % chartPalette.length];
          const steps = Math.max(8, Math.ceil(angle / 0.12));
          pdf.setFillColor(...color);
          pdf.setDrawColor(255, 255, 255);
          pdf.setLineWidth(0.35);
          for (let step = 0; step < steps; step += 1) {
            const a1 = start + (angle * step) / steps;
            const a2 = start + (angle * (step + 1)) / steps;
            pdf.triangle(
              cx,
              cy,
              cx + radius * Math.cos(a1),
              cy + radius * Math.sin(a1),
              cx + radius * Math.cos(a2),
              cy + radius * Math.sin(a2),
              'FD',
            );
          }
          start += angle;
        });

        let legendY = chartY + 9;
        cleanItems.forEach((item, index) => {
          const color = item.color || chartPalette[index % chartPalette.length];
          const percent = total > 0 ? (Number(item.value || 0) / total) * 100 : 0;
          pdf.setFillColor(...color);
          pdf.setDrawColor(255, 255, 255);
          pdf.rect(x + radius * 2 + 8, legendY - 3, 3, 3, 'F');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(51, 65, 85);
          pdf.text(
            limpiarPdfTexto(`${item.label}: ${percent.toFixed(1)}% (${formatChartValue(item.value, options.valueMode)})`),
            x + radius * 2 + 13,
            legendY,
            { maxWidth: 42 },
          );
          legendY += 5;
        });
      };

      const drawBarChart = (title, items, x, chartY, width, height, options = {}) => {
        const cleanItems = prepareChartItems(items, { maxItems: 6, ...options });
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...palette.navy);
        pdf.text(limpiarPdfTexto(title), x, chartY);

        if (cleanItems.length === 0) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(100, 116, 139);
          pdf.text('No hay datos de ventas en este corte.', x, chartY + 12, { maxWidth: width });
          return;
        }

        const max = Math.max(...cleanItems.map((item) => Number(item.value || 0)), 1);
        let barY = chartY + 8;
        cleanItems.forEach((item, index) => {
          const barWidth = Math.max(4, (Number(item.value || 0) / max) * (width - 42));
          const color = item.color || chartPalette[index % chartPalette.length];
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(51, 65, 85);
          pdf.text(limpiarPdfTexto(String(item.label).slice(0, 21)), x, barY);
          pdf.setFillColor(...color);
          pdf.roundedRect(x + 34, barY - 3.4, barWidth, 3.8, 1, 1, 'F');
          pdf.text(limpiarPdfTexto(formatChartValue(item.value, options.valueMode)), x + 37 + width - 42, barY);
          barY += Math.min(7, height / cleanItems.length);
        });
      };

      const diferencia = Number(corte.diferencia || 0);
      const diferenciaTexto = diferencia === 0 ? 'Sin diferencia' : diferencia > 0 ? 'Sobrante' : 'Faltante';
      const diferenciaColor = diferencia === 0 ? [71, 85, 105] : diferencia > 0 ? [22, 163, 74] : [220, 38, 38];

      addHeader();

      section('Datos del corte');
      const datosCorte = [
        ['Fecha del corte', fechaPdf(corte.fecha), 'Turno', corte.turno || 'N/A'],
        ['Hora inicio', horaPdf(corte.horaInicio), 'Hora fin', horaPdf(corte.horaFin)],
        ['Cajero', corte.cajero || 'Todos', 'Origen', corte.canal || 'Todos'],
        ['Estado', corte.estado || 'cerrado', 'Folio', corte.folio],
      ];
      drawTable(['Campo', 'Valor', 'Campo', 'Valor'], datosCorte, [38, 58, 38, 58]);

      section('Resumen financiero');
      const cardWidth = 45;
      card(left, y, cardWidth, 'Total de ventas', monto(corte.totalVentas), `${corte.numeroVentas || 0} tickets`);
      card(left + 49, y, cardWidth, 'Efectivo', monto(corte.totalEfectivo), 'Ventas pagadas en efectivo');
      card(left + 98, y, cardWidth, 'Tarjeta', monto(corte.totalTarjeta), 'Ventas pagadas con tarjeta');
      card(left + 147, y, cardWidth, 'Transferencia', monto(corte.totalTransferencia), 'Pagos por transferencia');
      y += 29;
      card(left, y, cardWidth, 'Monto contado', monto(corte.montoContado), 'Capturado al cierre');
      card(left + 49, y, cardWidth, 'Diferencia', monto(corte.diferencia), diferenciaTexto, diferenciaColor);
      card(left + 98, y, cardWidth, 'Promedio ticket', monto(data.resumen?.promedioTicket), 'Venta promedio');
      card(left + 147, y, cardWidth, 'Plataformas', monto(data.resumen?.totalPlataformas), 'Canales no mostrador');
      y += 33;

      section('Balance del corte');
      const totalVendido = Number(corte.totalVentas || 0);
      const efectivoRecibido = Number(corte.totalEfectivo || 0);
      const tarjetaRecibida = Number(corte.totalTarjeta || 0);
      const transferenciaRecibida = Number(corte.totalTransferencia || 0);
      const totalPlataformas = Number(data.resumen?.totalPlataformas || 0);
      const montoContado = Number(corte.montoContado || 0);
      const faltante = diferencia < 0 ? Math.abs(diferencia) : 0;
      const sobrante = diferencia > 0 ? diferencia : 0;
      const balanceFinal = montoContado + tarjetaRecibida + transferenciaRecibida + totalPlataformas - faltante;
      drawTable(
        ['Activos', 'Monto', 'Pasivos / salidas', 'Monto'],
        [
          ['Dinero en caja', monto(montoContado), 'Retiros de caja', 'No registrado'],
          ['Total vendido', monto(totalVendido), 'Gastos registrados', 'No registrado'],
          ['Efectivo recibido', monto(efectivoRecibido), 'Ajustes negativos', 'No registrado'],
          ['Tarjeta', monto(tarjetaRecibida), 'Diferencia faltante', monto(faltante)],
          ['Transferencia', monto(transferenciaRecibida), 'Sobrante', monto(sobrante)],
          ['Plataformas', monto(totalPlataformas), 'Balance final estimado', monto(balanceFinal)],
        ],
        [48, 38, 62, 44],
      );
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Utilidad estimada: pendiente de costos. Para calcular ganancia real falta registrar costo de productos.', left, y, { maxWidth: 180 });
      y += 8;

      pdf.addPage();
      addHeader();
      y = 48;

      section('Resumen operativo');
      drawTable(
        ['Indicador', 'Resultado', 'Indicador', 'Resultado'],
        [
          ['Productos vendidos', String(data.resumen?.totalProductosVendidos || 0), 'Producto mas vendido', data.resumen?.productoMasVendido || 'Sin datos'],
          ['Mayor ingreso', data.resumen?.productoMayorIngreso || 'Sin datos', 'Canal con mas ventas', data.resumen?.canalMasVentas || 'Sin datos'],
          ['Metodo mas usado', data.resumen?.metodoPagoMasUsado || 'Sin datos', 'Numero de tickets', String(corte.numeroVentas || 0)],
        ],
        [42, 54, 42, 56],
      );

      section('Ventas por cajero');
      if ((data.resumenCajeros || []).length > 0) {
        drawTable(
          ['Cajero', 'Tickets', 'Total vendido', 'Efectivo', 'Tarjeta', 'Transferencia', 'Promedio'],
          data.resumenCajeros.map((cajero) => [
            cajero.cajero || 'Sin cajero registrado',
            String(cajero.tickets || 0),
            monto(cajero.total),
            monto(cajero.efectivo),
            monto(cajero.tarjeta),
            monto(cajero.transferencia),
            monto(cajero.promedioTicket),
          ]),
          [42, 18, 30, 25, 25, 28, 24],
        );
      } else if (corte.cajero) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(limpiarPdfTexto(`Este corte corresponde unicamente al cajero ${corte.cajero}.`), left, y);
        y += 8;
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text('No hay datos registrados en este periodo.', left, y);
        y += 8;
      }

      section('Graficas de analisis');
      ensureSpace(108);
      const productosPorCantidad = (data.productos || []).map((producto) => ({
        label: producto.nombre,
        value: producto.cantidad,
      }));
      const productosPorIngreso = (data.productos || []).map((producto) => ({
        label: producto.nombre,
        value: producto.total,
      }));
      const productoMasVendido = [...productosPorCantidad].sort((a, b) => Number(b.value || 0) - Number(a.value || 0))[0];
      const productoMayorIngreso = [...productosPorIngreso].sort((a, b) => Number(b.value || 0) - Number(a.value || 0))[0];
      drawPieChart(
        'Productos por cantidad',
        productosPorCantidad,
        left,
        y,
        18,
        {
          highlightLabel: productoMasVendido?.label,
          highlightColor: palette.gold,
        },
      );
      drawPieChart(
        'Ingresos por producto',
        productosPorIngreso,
        left + 98,
        y,
        18,
        {
          highlightLabel: productoMayorIngreso?.label,
          highlightColor: palette.green,
          valueMode: 'currency',
        },
      );
      pdf.addPage();
      addHeader();
      y = 48;
      section('Graficas por venta');
      ensureSpace(56);
      drawPieChart(
        'Ventas por metodo',
        (data.totalesMetodoPago || []).map((metodo) => ({ label: metodo.metodo, value: metodo.total })),
        left,
        y,
        18,
        {
          colorMap: methodColors,
          valueMode: 'currency',
        },
      );
      drawPieChart(
        'Ventas por origen',
        (data.totalesCanal || []).map((canal) => ({ label: canal.canal, value: canal.total })),
        left + 98,
        y,
        18,
        {
          colorMap: channelColors,
          valueMode: 'currency',
        },
      );
      y += 58;
      pdf.addPage();
      addHeader();
      y = 48;
      section('Graficas operativas');
      ensureSpace(58);
      drawBarChart(
        'Ventas por cajero',
        (data.resumenCajeros || []).map((cajero) => ({ label: cajero.cajero || 'Sin cajero', value: cajero.total })),
        left,
        y,
        82,
        42,
        { valueMode: 'currency' },
      );
      drawBarChart(
        'Top productos mas vendidos',
        productosPorCantidad,
        left + 98,
        y,
        82,
        42,
        {
          highlightLabel: productoMasVendido?.label,
          highlightColor: palette.gold,
        },
      );
      y += 50;

      pdf.addPage();
      addHeader();
      y = 48;

      section('Detalle de ventas');
      drawTable(
        ['Folio', 'Hora', 'Cajero', 'Origen', 'Metodo', 'Total', 'Productos'],
        (data.ventas || []).map((venta) => [
          venta.folio,
          fechaHoraPdf(venta.fecha),
          venta.cajero || 'Sin cajero registrado',
          venta.canal || 'Sin origen',
          venta.metodoPago || 'Otro',
          monto(venta.total),
          venta.productos || 'Sin productos',
        ]),
        [24, 30, 28, 27, 22, 22, 39],
      );

      section('Productos vendidos');
      drawTable(
        ['Producto', 'Categoria', 'Cantidad', 'Precio prom.', 'Total', '%'],
        (data.productos || []).map((producto) => [
          producto.nombre,
          producto.categoria || 'Sin categoria',
          String(producto.cantidad || 0),
          monto(producto.precioPromedio),
          monto(producto.total),
          `${Number(producto.participacion || 0).toFixed(1)}%`,
        ]),
        [48, 34, 21, 28, 28, 13],
      );

      section('Movimientos realizados durante el corte');
      if ((data.movimientos || []).length === 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text('No se registraron movimientos adicionales durante este corte.', left, y);
        y += 8;
      } else {
        drawTable(
          ['Hora', 'Usuario', 'Modulo', 'Accion', 'Descripcion'],
          data.movimientos.map((movimiento) => [
            fechaHoraPdf(movimiento.fecha),
            movimiento.usuario || 'Sistema',
            movimiento.modulo,
            movimiento.accion,
            movimiento.descripcion,
          ]),
          [32, 30, 30, 34, 66],
        );
        if (data.hayMasMovimientos) {
          ensureSpace(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(100, 116, 139);
          pdf.text('Se registraron mas movimientos durante este corte. Consulte la bitacora del sistema para ver el detalle completo.', left, y, { maxWidth: 180 });
          y += 8;
        }
      }

      section('Observaciones y firmas');
      const observaciones = corte.observaciones || 'Sin observaciones.';
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      pdf.text(pdf.splitTextToSize(limpiarPdfTexto(observaciones), 180), left, y);
      y += 22;
      ensureSpace(28);
      pdf.setDrawColor(148, 163, 184);
      pdf.line(left, y, left + 72, y);
      pdf.line(right - 72, y, right, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Firma del cajero', left + 18, y);
      pdf.text('Firma del administrador', right - 57, y);
      y += 12;
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Documento generado automaticamente por MercaLink POS.', pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save(`corte-caja-${corte.folio || corteId}.pdf`);
      setSuccess('Corte de caja PDF generado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo generar el PDF de corte.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <TrendingUp size={30} className="text-slate-950" />
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Ventas</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Ingresos, ordenes y tickets POS de {empresa?.nombre || 'MercaLink POS'}.
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {['Dia', 'Semana', 'Mes'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriodo(item)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                periodo === item
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-red-700">Aviso del sistema</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </Card>
      )}

      {success && (
        <Card className="border border-green-200 bg-green-50 p-4" hover={false}>
          <p className="text-sm font-semibold text-green-700">Operacion exitosa</p>
          <p className="mt-1 text-sm text-green-600">{success}</p>
        </Card>
      )}

      {loading && (
        <Card className="p-4" hover={false}>
          <p className="text-sm text-slate-500">Cargando ventas desde MySQL...</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: 'Total ventas',
            value: formatCurrency(totalVentas),
            detail: textoPeriodo[periodo],
            icon: TrendingUp,
            iconClass: 'bg-green-50 text-green-700',
          },
          {
            label: 'Ordenes completadas',
            value: ventasFiltradas.length,
            detail: `${ventasFiltradas.length} ventas en ${periodo.toLowerCase()}`,
            icon: CreditCard,
            iconClass: 'bg-blue-50 text-blue-700',
          },
          {
            label: 'Promedio por orden',
            value: formatCurrency(promedioPorOrden),
            detail: 'Calculado segun el filtro seleccionado',
            icon: TrendingDown,
            iconClass: 'bg-violet-50 text-violet-700',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-5" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${item.iconClass}`}>
                  <Icon size={22} />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{item.detail}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">Ventas por {periodo.toLowerCase()}</h3>
          <p className="mb-5 text-sm text-slate-500">{textoPeriodo[periodo]}</p>
          <div className="h-80">
            <LineChart data={ventasPorDiaData} options={chartOptions} />
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <h3 className="text-lg font-bold text-slate-950">Ventas por canal</h3>
          <p className="mb-5 text-sm text-slate-500">
            Distribucion de ventas segun el filtro seleccionado.
          </p>
          <div className="h-80">
            <BarChart data={ventasPorCanalData} options={chartOptions} />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden" hover={false}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-950">Cortes de caja</h3>
          <p className="mt-1 text-sm text-slate-500">Cierre de turno por fecha, horario, cajero y origen de venta.</p>
        </div>

        <div className="space-y-5 p-5">
          <form onSubmit={crearCorte} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Cajero</span>
              {esCajero(usuarioActual) ? (
                <input
                  value={usuarioActual?.nombre || 'Cajero'}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-600 outline-none"
                />
              ) : (
                <select
                  value={formCorte.usuarioId}
                  onChange={(event) => setFormCorte((prev) => ({ ...prev, usuarioId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
                >
                  <option value="">Todos</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                  ))}
                </select>
              )}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Origen / sucursal</span>
              <select
                value={formCorte.canalId}
                onChange={(event) => setFormCorte((prev) => ({ ...prev, canalId: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              >
                <option value="">Todos</option>
                {canales.map((canal) => (
                  <option key={canal.id} value={canal.id}>{canal.nombre}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Fecha</span>
              <input
                type="date"
                value={formCorte.fecha}
                onChange={(event) => setFormCorte((prev) => ({ ...prev, fecha: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Turno</span>
              <select
                value={formCorte.turno}
                onChange={(event) => setFormCorte((prev) => ({ ...prev, turno: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              >
                {['Matutino', 'Vespertino', 'Nocturno', 'Personalizado'].map((turno) => (
                  <option key={turno}>{turno}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Hora inicio</span>
              <input
                type="time"
                value={formCorte.horaInicio}
                onChange={(event) => setFormCorte((prev) => ({ ...prev, horaInicio: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Hora fin</span>
              <input
                type="time"
                value={formCorte.horaFin}
                onChange={(event) => setFormCorte((prev) => ({ ...prev, horaFin: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Monto contado</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formCorte.montoContado}
                onChange={(event) => setFormCorte((prev) => ({ ...prev, montoContado: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
                placeholder="0.00"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Observaciones</span>
              <input
                value={formCorte.observaciones}
                onChange={(event) => setFormCorte((prev) => ({ ...prev, observaciones: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              />
            </label>
            <div className="md:col-span-2 xl:col-span-4">
              <button
                type="submit"
                disabled={guardandoCorte}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                <span className="relative inline-grid h-5 w-5 place-items-center">
                  <FileText size={19} />
                  <Plus size={10} className="absolute -right-1 -top-1 rounded-full bg-white text-slate-950" />
                </span>
                {guardandoCorte ? 'Generando...' : 'Nuevo corte'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {['Folio', 'Fecha', 'Turno', 'Cajero', 'Origen', 'Total vendido', 'Monto contado', 'Diferencia', 'Estado', 'Acciones'].map((heading) => (
                    <th key={heading} className="px-4 py-3">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cortes.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-sm text-slate-500">
                      No hay cortes de caja registrados.
                    </td>
                  </tr>
                ) : (
                  cortes.map((corte) => (
                    <tr key={corte.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-950">{corte.folio}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(corte.fecha).toLocaleDateString('es-MX')}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{corte.turno}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{corte.cajero || 'Todos'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{corte.canal || 'Todos'}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-950">{formatCurrency(corte.totalVentas)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(corte.montoContado)}</td>
                      <td className={`px-4 py-3 text-sm font-semibold ${Number(corte.diferencia) < 0 ? 'text-red-600' : 'text-green-700'}`}>
                        {formatCurrency(corte.diferencia)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {corte.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => verDetalleCorte(corte.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Eye size={16} />
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => generarPdfCorte(corte.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <FileText size={16} />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden" hover={false}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-950">Tickets recientes - {periodo}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Folio', 'Fecha', 'Cajero', 'Canal', 'Metodo de pago', 'Estado', 'Productos', 'Total', 'Detalle'].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {ventasRecientes.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-5 py-6 text-center text-sm text-slate-500">
                    No hay ventas registradas en este periodo.
                  </td>
                </tr>
              )}

              {ventasRecientes.map((venta) => (
                <tr key={venta.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {venta.folio || `POS-${String(venta.id).padStart(6, '0')}`}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {new Date(venta.fecha).toLocaleString('es-MX')}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{venta.cajero || 'Sin cajero registrado'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{venta.canal || 'Sin canal'}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{venta.metodoPago || 'N/A'}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                      {venta.estado || 'Completada'}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                    <span className="line-clamp-2">{venta.producto}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {formatCurrency(venta.total)}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => consultarDetalle(venta.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={16} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {detalleCorte && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{detalleCorte.folio}</h3>
                <p className="text-sm text-slate-500">
                  {detalleCorte.turno} - {new Date(detalleCorte.fecha).toLocaleDateString('es-MX')} - {detalleCorte.horaInicio} a {detalleCorte.horaFin}
                </p>
              </div>
              <button type="button" onClick={() => setDetalleCorte(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-5">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="block text-xs font-semibold text-slate-500">Total vendido</span>
                <strong>{formatCurrency(detalleCorte.totalVentas)}</strong>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-green-800">
                <span className="block text-xs font-semibold text-green-700">Dinero en caja</span>
                <strong>{formatCurrency(calcularDineroCaja(detalleCorte))}</strong>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-yellow-800">
                <span className="block text-xs font-semibold text-yellow-700">Ganancia estimada</span>
                <strong>{obtenerGananciaEstimada(detalleCorte)}</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="block text-xs font-semibold text-slate-500">Monto contado</span>
                <strong>{formatCurrency(detalleCorte.montoContado)}</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="block text-xs font-semibold text-slate-500">Diferencia</span>
                <strong>{formatCurrency(detalleCorte.diferencia)}</strong>
              </div>
            </div>

            <h4 className="mt-5 font-bold text-slate-950">Productos vendidos por turno</h4>
            <div className="mt-2 space-y-2">
              {detalleCorte.productos.length === 0 ? (
                <p className="text-sm text-slate-500">No hay productos vendidos en este corte.</p>
              ) : (
                detalleCorte.productos.map((producto) => (
                  <div key={producto.id} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm">
                    <span>{producto.nombre} x {producto.cantidad}</span>
                    <strong>{formatCurrency(producto.total)}</strong>
                  </div>
                ))
              )}
            </div>

            <h4 className="mt-5 font-bold text-slate-950">Ventas incluidas</h4>
            <div className="mt-2 space-y-2">
              {detalleCorte.ventas.length === 0 ? (
                <p className="text-sm text-slate-500">No hay ventas incluidas.</p>
              ) : (
                detalleCorte.ventas.map((venta) => (
                  <div key={venta.id} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm">
                    <span>{venta.folio} - {new Date(venta.fecha).toLocaleString('es-MX')}</span>
                    <strong>{formatCurrency(venta.total)}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {detalleVenta && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{detalleVenta.folio}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(detalleVenta.fecha).toLocaleString('es-MX')} - {detalleVenta.cajero}
                </p>
              </div>
              <button type="button" onClick={() => setDetalleVenta(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {loadingDetalle ? (
              <p className="text-sm text-slate-500">Cargando detalle...</p>
            ) : (
              <div className="space-y-3">
                {detalleVenta.productos.map((item) => (
                  <div key={item.detalleId} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm">
                    <span>
                      <strong>{item.nombre}</strong>
                      <br />
                      {item.cantidad} x {formatCurrency(item.precioUnitario)}
                    </span>
                    <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-200 pt-3 font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(detalleVenta.total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;
