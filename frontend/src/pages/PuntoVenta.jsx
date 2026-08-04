/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import {
  Barcode,
  CreditCard,
  Download,
  ImageIcon,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  XCircle,
} from 'lucide-react';
import { getProductos } from '../services/api/productosApi';
import { createVentaPos } from '../services/api/ventasApi';
import { getEmpresa } from '../services/api/empresaApi';
import { getCanales } from '../services/api/canalesApi';
import { getConfiguracion } from '../services/api/configuracionApi';
import { liberarReservaStock, reservarStockTemporal } from '../services/api/reservasStockApi';
import { getImageSrc } from '../utils/images';
import { getEstadoStock } from '../utils/stock';
import { cargarLogoEmpresaPdf, fitImageToBox } from '../utils/logo';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(Number(value || 0));

const obtenerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
};

const limpiarTexto = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');

const crearReservaToken = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `reserva-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const agregarLinea = (pdf, texto, x, y, opciones = {}) => {
  pdf.text(limpiarTexto(texto), x, y, opciones);
};

const normalizarProducto = (producto) => ({
  ...producto,
  codigoBarras: producto.codigoBarras || producto.codigo_barras || '',
  imagenUrl: producto.imagenUrl || producto.imagen_url || '',
  categoria: producto.categoria || producto.categoria_nombre || 'Sin categoria',
  precio: Number(producto.precio || 0),
  stock: Number(producto.stockDisponible ?? producto.stock_disponible ?? producto.stock ?? 0),
  stockFisico: Number(producto.stockFisico ?? producto.stock_fisico ?? producto.stock ?? 0),
  stockReservado: Number(producto.stockReservado ?? producto.stock_reservado ?? 0),
  stockDisponible: Number(producto.stockDisponible ?? producto.stock_disponible ?? producto.stock ?? 0),
});

const PuntoVenta = () => {
  const [usuario] = useState(obtenerUsuario);
  const [empresa, setEmpresa] = useState(null);
  const [productos, setProductos] = useState([]);
  const carritoRef = useRef([]);
  const [busqueda, setBusqueda] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [origenesVenta, setOrigenesVenta] = useState([]);
  const [stockMinimoAlerta, setStockMinimoAlerta] = useState(5);
  const [reservaToken, setReservaToken] = useState(crearReservaToken);
  const [canalId, setCanalId] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [ticket, setTicket] = useState(null);
  const [whatsappCliente, setWhatsappCliente] = useState('');
  const [compartirError, setCompartirError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingOrigenes, setLoadingOrigenes] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductos({ reservaToken });
      setProductos((data || []).map(normalizarProducto).filter((producto) => producto.estado !== 'Inactivo'));
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, [reservaToken]);

  const cargarEmpresa = async () => {
    try {
      const data = await getEmpresa();
      setEmpresa(data || null);
    } catch {
      setEmpresa(null);
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const data = await getConfiguracion();
      setStockMinimoAlerta(Number(data?.stockMinimoAlerta || 5));
    } catch {
      setStockMinimoAlerta(5);
    }
  };

  const cargarOrigenesVenta = async () => {
    try {
      setLoadingOrigenes(true);
      const data = await getCanales();
      const origenesActivos = (data || []).filter((canal) => {
        const estado = String(canal.estado || 'Activo').toLowerCase();
        return estado === 'activo' || estado === 'activa';
      });

      setOrigenesVenta(origenesActivos);

      if (origenesActivos.length > 0) {
        const mostrador = origenesActivos.find((canal) => canal.nombre?.toLowerCase() === 'mostrador');
        setCanalId((actual) => actual || String((mostrador || origenesActivos[0]).id));
      }
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los origenes de venta.');
      setOrigenesVenta([]);
    } finally {
      setLoadingOrigenes(false);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarEmpresa();
    cargarOrigenesVenta();
    cargarConfiguracion();
  }, [cargarProductos]);

  useEffect(() => {
    carritoRef.current = carrito;
  }, [carrito]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      cargarProductos();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [cargarProductos]);

  useEffect(() => {
    const liberarAlSalir = () => {
      if (carritoRef.current.length > 0) {
        liberarReservaStock(reservaToken).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', liberarAlSalir);

    return () => {
      window.removeEventListener('beforeunload', liberarAlSalir);
      liberarAlSalir();
    };
  }, [reservaToken]);

  useEffect(() => {
    const recargarEmpresa = () => cargarEmpresa();
    const recargarConfiguracion = () => cargarConfiguracion();

    window.addEventListener('empresaActualizada', recargarEmpresa);
    window.addEventListener('configuracionActualizada', recargarConfiguracion);

    return () => {
      window.removeEventListener('empresaActualizada', recargarEmpresa);
      window.removeEventListener('configuracionActualizada', recargarConfiguracion);
    };
  }, []);

  const reservasTemporales = useMemo(() => {
    return carrito.reduce((acc, item) => {
      acc[item.id] = Number(item.cantidad || 0);
      return acc;
    }, {});
  }, [carrito]);

  const productosConStockTemporal = useMemo(() => {
    return productos.map((producto) => {
      const stockReal = Number(producto.stockDisponible ?? producto.stock ?? 0);
      const reservado = Number(reservasTemporales[producto.id] || 0);
      const stockDisponible = Math.max(0, stockReal - reservado);

      return {
        ...producto,
        stockReal,
        stockReservadoTemporal: reservado,
        stockDisponible,
        stock: stockDisponible,
      };
    });
  }, [productos, reservasTemporales]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productosConStockTemporal;

    return productosConStockTemporal.filter((producto) =>
      `${producto.nombre} ${producto.sku} ${producto.codigoBarras} ${producto.categoria}`
        .toLowerCase()
        .includes(texto),
    );
  }, [productosConStockTemporal, busqueda]);

  const total = useMemo(() => {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }, [carrito]);

  const subtotal = total / 1.16;
  const iva = total - subtotal;
  const recibidoNumero = Number(montoRecibido || 0);
  const cambio = metodoPago === 'Efectivo' ? Math.max(0, recibidoNumero - total) : 0;
  const empresaNombre = empresa?.nombre || 'MercaLink POS';
  const folioTicket = ticket?.folio || `POS-${ticket?.ventaId || ticket?.id || '000000'}`;
  const fechaTicket = ticket?.fecha ? new Date(ticket.fecha).toLocaleString('es-MX') : '';

  const construirMensajeTicket = () =>
    [
      `Gracias por su compra en ${empresaNombre}.`,
      `Folio: ${folioTicket}.`,
      `Total: ${formatCurrency(ticket?.total)}.`,
      `Fecha: ${fechaTicket}.`,
    ].join(' ');

  const cerrarTicket = () => {
    setTicket(null);
    setWhatsappCliente('');
    setCompartirError('');
  };

  const enviarPorWhatsapp = () => {
    const digitos = whatsappCliente.replace(/\D/g, '');

    if (!digitos) {
      setCompartirError('Ingresa el número de WhatsApp del cliente.');
      return;
    }

    const numero = digitos.length === 10 ? `52${digitos}` : digitos;

    if (numero.length < 12 || numero.length > 15) {
      setCompartirError('Ingresa un número de WhatsApp válido.');
      return;
    }

    setCompartirError('');
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(construirMensajeTicket())}`, '_blank', 'noopener,noreferrer');
  };

  const reservarCantidadProducto = async (productoId, cantidad) => {
    await reservarStockTemporal({
      token: reservaToken,
      productoId,
      cantidad,
    });
  };

  const agregarProducto = async (producto) => {
    const stockReal = Number(producto.stockReal ?? producto.stock ?? 0);
    const reservadoActual = Number(reservasTemporales[producto.id] || 0);
    const stockDisponible = Math.max(0, stockReal - reservadoActual);

    if (stockDisponible <= 0) {
      setError(`Sin stock disponible para ${producto.nombre}.`);
      return;
    }

    setError('');
    setMensaje('');

    const existente = carrito.find((item) => item.id === producto.id);
    const nuevaCantidad = existente ? existente.cantidad + 1 : 1;

    if (nuevaCantidad > stockReal) {
      setError(`Solo hay ${stockReal} unidades disponibles para ${producto.nombre}.`);
      return;
    }

    try {
      setReservando(true);
      await reservarCantidadProducto(producto.id, nuevaCantidad);

      setCarrito((current) => {
        const itemExistente = current.find((item) => item.id === producto.id);

        if (itemExistente) {
          return current.map((item) =>
            item.id === producto.id ? { ...item, cantidad: nuevaCantidad } : item,
          );
        }

        return [
          ...current,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio || 0),
            stock: stockReal,
            stockReal,
            codigoBarras: producto.codigoBarras,
            reservaToken,
            cantidad: 1,
          },
        ];
      });

      await cargarProductos();
    } catch (err) {
      setError(err.message || `No se pudo reservar stock para ${producto.nombre}.`);
    } finally {
      setReservando(false);
    }
  };

  const actualizarCantidad = async (productoId, delta) => {
    const itemActual = carrito.find((item) => item.id === productoId);
    if (!itemActual) return;

    const cantidad = Math.min(itemActual.stock, Math.max(0, itemActual.cantidad + delta));

    try {
      setReservando(true);
      await reservarCantidadProducto(productoId, cantidad);
      setCarrito((current) =>
        current
          .map((item) => (item.id === productoId ? { ...item, cantidad } : item))
          .filter((item) => item.cantidad > 0),
      );
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la reserva de stock.');
    } finally {
      setReservando(false);
    }
  };

  const quitarProducto = async (productoId) => {
    try {
      setReservando(true);
      await reservarCantidadProducto(productoId, 0);
      setCarrito((current) => current.filter((item) => item.id !== productoId));
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo liberar la reserva de stock.');
    } finally {
      setReservando(false);
    }
  };

  const handleCodigoSubmit = (event) => {
    event.preventDefault();
    const codigo = codigoBarras.trim();
    if (!codigo) return;

    const producto = productosConStockTemporal.find(
      (item) => String(item.codigoBarras || item.codigo_barras || '') === codigo,
    );

    if (!producto) {
      setError(`No se encontro producto con codigo ${codigo}.`);
      return;
    }

    agregarProducto(producto);
    setCodigoBarras('');
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      setError('Agrega al menos un producto al carrito.');
      return;
    }

    if (metodoPago === 'Efectivo' && recibidoNumero < total) {
      setError('El monto recibido debe cubrir el total de la venta.');
      return;
    }

    if (!canalId) {
      setError('Selecciona un origen de venta. Si no hay opciones, crea primero un origen desde la seccion Origen de venta.');
      return;
    }

    const sinStock = carrito.find((item) => item.cantidad > Number(item.stockReal ?? item.stock ?? 0));
    if (sinStock) {
      setError(`Stock insuficiente para ${sinStock.nombre}.`);
      return;
    }

    try {
      setProcesando(true);
      setError('');
      setMensaje('');

      const response = await createVentaPos({
        productos: carrito.map((item) => ({
          productoId: item.id,
          cantidad: item.cantidad,
        })),
        metodoPago,
        cajeroId: usuario?.id || null,
        usuarioActualId: usuario?.id || null,
        canalId: Number(canalId),
        montoRecibido: metodoPago === 'Efectivo' ? recibidoNumero : total,
        cambio,
        reservaToken,
      });

      setTicket({
        ...response,
        cajero: usuario?.nombre || response.cajero || 'Cajero demo',
        canal: response.canal || origenesVenta.find((canal) => String(canal.id) === String(canalId))?.nombre || 'Sin origen',
        subtotal,
        iva,
        montoRecibido: metodoPago === 'Efectivo' ? recibidoNumero : total,
        cambio,
      });
      setCarrito([]);
      setReservaToken(crearReservaToken());
      setMontoRecibido('');
      setWhatsappCliente('');
      setCompartirError('');
      setMensaje('Venta registrada correctamente.');
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'No se pudo finalizar la venta.');
    } finally {
      setProcesando(false);
    }
  };

  const generarTicketPdf = async () => {
    if (!ticket) return;

    const productosTicket = ticket.productos || [];
    const pageWidth = 80;
    const negocio = empresa?.nombre || 'Taqueria / Restaurante';
    const giro = empresa?.giro || '';
    const direccion = empresa?.direccion || '';
    const telefono = empresa?.telefono || '';
    const correo = empresa?.correo || '';
    const left = 6;
    const right = pageWidth - 6;
    const logoPdf = await cargarLogoEmpresaPdf();
    const logoHeight = logoPdf ? fitImageToBox(logoPdf.width, logoPdf.height, pageWidth / 2 - 12.5, 10, 25, 20).height : 0;
    const direccionLineasEstimadas = direccion ? Math.min(2, Math.max(1, Math.ceil(limpiarTexto(direccion).length / 42))) : 0;
    const productHeight = productosTicket.reduce((height, item) => {
      const lines = Math.min(2, Math.max(1, Math.ceil(limpiarTexto(item.nombre).length / 22)));
      return height + Math.max(5.2, lines * 3.2 + 1.6);
    }, 0);
    const headerHeight =
      10 +
      logoHeight +
      (logoPdf ? 2.5 : 0) +
      5 +
      (giro ? 3 : 0) +
      3.5 +
      direccionLineasEstimadas * 3 +
      (telefono ? 3 : 0) +
      (correo ? 3 : 0) +
      9.5 +
      5 * 3.4 +
      8;
    const totalsHeight = 4 + 3.5 + 3.5 + 4.5 + 3.5 + 3.5 + 2 + 5.5 + 4 + 4 + 9;
    const pageHeight = Math.ceil(Math.max(132, headerHeight + 3.6 + productHeight + totalsHeight + 14));
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });

    let y = 7;

    pdf.setFillColor(243, 244, 246);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.setFillColor(229, 231, 235);
    pdf.rect(4, 5, pageWidth - 6.5, pageHeight - 8.5, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.rect(3, 3, pageWidth - 6, pageHeight - 6, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(3, 3, pageWidth - 6, pageHeight - 6);
    pdf.setFillColor(243, 244, 246);
    for (let x = 4.2; x < pageWidth - 5; x += 3) {
      pdf.triangle(x, 3, x + 1.5, 5, x + 3, 3, 'F');
    }
    pdf.setFillColor(250, 204, 21);
    pdf.rect(7, 7, pageWidth - 14, 0.6, 'F');
    y = 10;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    if (logoPdf) {
      const logoBox = fitImageToBox(logoPdf.width, logoPdf.height, pageWidth / 2 - 12.5, y, 25, 20);
      pdf.addImage(logoPdf.dataUrl, 'PNG', logoBox.x, logoBox.y, logoBox.width, logoBox.height, undefined, 'FAST');
      y += logoBox.height + 2.5;
    }
    agregarLinea(pdf, negocio, pageWidth / 2, y, { align: 'center' });
    y += 5;

    if (giro) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      agregarLinea(pdf, giro, pageWidth / 2, y, { align: 'center' });
      y += 3;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    agregarLinea(pdf, 'MercaLink POS', pageWidth / 2, y, { align: 'center' });
    y += 3.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    if (direccion) {
      const direccionLineas = pdf.splitTextToSize(limpiarTexto(direccion), 64);
      direccionLineas.slice(0, 2).forEach((linea) => {
        agregarLinea(pdf, linea, pageWidth / 2, y, { align: 'center' });
        y += 3;
      });
    }
    if (telefono) {
      agregarLinea(pdf, `Tel: ${telefono}`, pageWidth / 2, y, { align: 'center' });
      y += 3;
    }
    if (correo) {
      agregarLinea(pdf, correo, pageWidth / 2, y, { align: 'center' });
      y += 3;
    }

    y += 1.5;
    pdf.setDrawColor(156, 163, 175);
    pdf.setLineDashPattern([1.4, 1], 0);
    pdf.line(left, y, right, y);
    pdf.setLineDashPattern([], 0);
    y += 4;

    pdf.setFontSize(7.5);
    agregarLinea(pdf, `Folio: ${ticket.folio || `POS-${ticket.ventaId || ticket.id}`}`, left, y);
    y += 3.4;
    agregarLinea(pdf, `Fecha: ${new Date(ticket.fecha).toLocaleString('es-MX')}`, left, y);
    y += 3.4;
    agregarLinea(pdf, `Cajero: ${ticket.cajero || usuario?.nombre || 'Cajero'}`, left, y);
    y += 3.4;
    agregarLinea(pdf, `Origen: ${ticket.canal || 'Sin origen'}`, left, y);
    y += 3.4;
    agregarLinea(pdf, `Metodo de pago: ${ticket.metodoPago || metodoPago}`, left, y);
    y += 4;

    pdf.setDrawColor(156, 163, 175);
    pdf.setLineDashPattern([1.4, 1], 0);
    pdf.line(left, y, right, y);
    pdf.setLineDashPattern([], 0);
    y += 4;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.3);
    agregarLinea(pdf, 'Producto', left, y);
    agregarLinea(pdf, 'Cant', 42, y, { align: 'center' });
    agregarLinea(pdf, 'P.Unit', 56, y, { align: 'right' });
    agregarLinea(pdf, 'Subt', right, y, { align: 'right' });
    y += 3.6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.2);

    productosTicket.forEach((item) => {
      const nombreLineas = pdf.splitTextToSize(limpiarTexto(item.nombre), 30).slice(0, 2);

      nombreLineas.forEach((linea, index) => {
        agregarLinea(pdf, linea, left, y + index * 3);
      });

      agregarLinea(pdf, String(item.cantidad), 42, y, { align: 'center' });
      agregarLinea(pdf, formatCurrency(item.precioUnitario).replace('MXN', '').trim(), 56, y, {
        align: 'right',
      });
      agregarLinea(pdf, formatCurrency(item.subtotal).replace('MXN', '').trim(), right, y, {
        align: 'right',
      });

      y += Math.max(4.8, nombreLineas.length * 3 + 1.2);
    });

    y += 1;
    pdf.setDrawColor(156, 163, 175);
    pdf.setLineDashPattern([1.4, 1], 0);
    pdf.line(left, y, right, y);
    pdf.setLineDashPattern([], 0);
    y += 4;

    const imprimirTotal = (label, value, bold = false) => {
      pdf.setFont('helvetica', bold ? 'bold' : 'normal');
      pdf.setFontSize(bold ? 9.5 : 7.8);
      agregarLinea(pdf, label, left, y);
      agregarLinea(pdf, formatCurrency(value).replace('MXN', '').trim(), right, y, { align: 'right' });
      y += bold ? 4.5 : 3.5;
    };

    imprimirTotal('Subtotal sin IVA', ticket.subtotal || ticket.total);
    imprimirTotal('IVA', ticket.iva || 0);
    imprimirTotal('Total', ticket.total, true);
    imprimirTotal('Recibido', ticket.montoRecibido || ticket.total);
    imprimirTotal('Cambio', ticket.cambio || 0);

    y += 2;
    pdf.setDrawColor(156, 163, 175);
    pdf.setLineDashPattern([1.4, 1], 0);
    pdf.line(left, y, right, y);
    pdf.setLineDashPattern([], 0);
    y += 5.5;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    agregarLinea(pdf, 'Gracias por su compra', pageWidth / 2, y, { align: 'center' });
    y += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    agregarLinea(pdf, 'Ticket generado por MercaLink POS', pageWidth / 2, y, { align: 'center' });
    y += 6;
    pdf.setFillColor(243, 244, 246);
    const dentadoY = pageHeight - 3;
    for (let x = 4.2; x < pageWidth - 5; x += 3) {
      pdf.triangle(x, dentadoY, x + 1.5, dentadoY - 2, x + 3, dentadoY, 'F');
    }

    pdf.save(`${ticket.folio || `POS-${ticket.ventaId || ticket.id || '000000'}`}.pdf`);
    setMensaje('Ticket PDF generado correctamente.');
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-700">MercaLink POS</p>
          <div className="mt-1 flex items-center gap-3">
            <ShoppingCart size={30} className="text-slate-950" />
            <h1 className="text-3xl font-bold text-slate-950">Punto de Venta</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Venta rapida para restaurante con inventario y ticket conectado a MySQL.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <Search size={22} className="text-slate-950" />
                <div>
                  <h2 className="font-bold text-slate-950">Localizar producto</h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Buscar producto</span>
                <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-slate-950">
                  <Search size={18} className="text-slate-400" />
                  <input
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    className="w-full bg-transparent py-1 outline-none"
                    placeholder="Nombre, SKU, codigo o categoria"
                  />
                </div>
              </label>

              <form onSubmit={handleCodigoSubmit} className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Codigo de barras</span>
                <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-slate-950">
                  <Barcode size={18} className="text-slate-400" />
                  <input
                    value={codigoBarras}
                    onChange={(event) => setCodigoBarras(event.target.value)}
                    className="w-full bg-transparent py-1 outline-none"
                    placeholder="Escanear o escribir y Enter"
                  />
                </div>
              </form>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart size={22} className="text-slate-950" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ficha de catalogo</p>
                  <h2 className="font-bold text-slate-950">Productos disponibles</h2>
                </div>
              </div>
              <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {productosFiltrados.length} productos
              </span>
            </div>
            <div className="max-h-[640px] overflow-auto bg-slate-50 p-4">
              {loading && <p className="p-5 text-sm text-slate-500">Cargando productos...</p>}
              {!loading && productosFiltrados.length === 0 && (
                <p className="p-5 text-sm text-slate-500">No hay productos disponibles.</p>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {productosFiltrados.slice(0, 24).map((producto) => {
                  const imagenProducto = getImageSrc(producto.imagenUrl);
                  const estadoStock = getEstadoStock(producto, stockMinimoAlerta);
                  const sinStock = !estadoStock.disponible;
                  const reservado = Number(producto.stockReservadoTemporal || 0);

                  return (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => agregarProducto(producto)}
                      disabled={sinStock || reservando}
                      className="group flex min-h-[340px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="grid h-40 w-full place-items-center overflow-hidden bg-slate-100 sm:h-44">
                        {imagenProducto ? (
                          <img
                            src={imagenProducto}
                            alt={producto.nombre}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.classList.add('hidden');
                              event.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={imagenProducto ? 'hidden' : 'grid place-items-center text-slate-400'}>
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <ImageIcon size={34} />
                            <span className="text-xs font-semibold">Sin imagen</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 min-h-[3rem] text-base font-bold leading-6 text-slate-950">
                              {producto.nombre}
                            </p>
                            <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                              {producto.categoria}
                            </p>
                          </div>
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-yellow-400 text-black ring-1 ring-yellow-300 transition group-hover:bg-yellow-300">
                            <Plus size={18} />
                          </span>
                        </div>
                        <p className="mt-3 text-2xl font-black text-slate-950">{formatCurrency(producto.precio)}</p>
                        <div className="mt-auto grid gap-2 pt-4 text-[11px] font-semibold text-slate-500">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">SKU {producto.sku || 'N/A'}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">
                              {producto.codigoBarras || 'Sin codigo'}
                            </span>
                          </div>
                          <span
                            className={`w-fit rounded-full px-2.5 py-1 ${
                              estadoStock.className
                            }`}
                          >
                            {estadoStock.label} - Disponible {producto.stockDisponible}
                          </span>
                          {reservado > 0 && (
                            <span className="w-fit rounded-full bg-yellow-100 px-2.5 py-1 text-yellow-800">
                              Reservado temporal: {reservado}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="hidden divide-y divide-slate-100">
              {loading && <p className="p-5 text-sm text-slate-500">Cargando productos...</p>}
              {!loading && productosFiltrados.length === 0 && (
                <p className="p-5 text-sm text-slate-500">No hay productos disponibles.</p>
              )}
              {productosFiltrados.slice(0, 16).map((producto) => (
                <div
                  key={producto.id}
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{producto.nombre}</p>
                    <p className="text-xs text-slate-500">
                      SKU {producto.sku} - Codigo {producto.codigoBarras || producto.codigo_barras || 'N/A'}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {formatCurrency(producto.precio)} - Disponible {producto.stockDisponible}
                  </div>
                  <button
                    type="button"
                    onClick={() => agregarProducto(producto)}
                    disabled={reservando || Number(producto.stockDisponible || 0) <= 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {reservando ? 'Reservando...' : 'Agregar'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <ShoppingCart size={22} className="text-slate-950" />
                <div>
                  <h2 className="font-bold text-slate-950">Carrito y pago</h2>
                </div>
              </div>
            </div>

            <div className="p-5">
            {carrito.length > 0 && (
              <p className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-800">
                Reserva temporal: {reservaToken.slice(-8).toUpperCase()}
              </p>
            )}

            <div className="space-y-3">
              {carrito.length === 0 && (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  Agrega productos para iniciar la venta.
                </p>
              )}

              {carrito.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.nombre}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(item.precio)} c/u</p>
                      <p className="mt-1 text-xs font-semibold text-yellow-700">
                        Apartado en esta venta: {item.cantidad} de {item.stockReal ?? item.stock}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => quitarProducto(item.id)}
                      disabled={reservando}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.id, -1)}
                        disabled={reservando}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 text-center font-bold">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(item.id, 1)}
                        disabled={reservando}
                        className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <p className="font-bold text-slate-950">
                      {formatCurrency(item.precio * item.cantidad)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA</span>
                <span className="font-semibold">{formatCurrency(iva)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-950">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Origen de venta</span>
              <select
                value={canalId}
                onChange={(event) => setCanalId(event.target.value)}
                disabled={loadingOrigenes || origenesVenta.length === 0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              >
                {loadingOrigenes && <option value="">Cargando origenes...</option>}
                {!loadingOrigenes && origenesVenta.length === 0 && <option value="">Sin origenes activos</option>}
                {!loadingOrigenes &&
                  origenesVenta.map((canal) => (
                    <option key={canal.id} value={canal.id}>
                      {canal.nombre}
                    </option>
                  ))}
              </select>
              {!loadingOrigenes && origenesVenta.length === 0 && (
                <span className="block text-xs font-medium text-red-600">
                  Crea primero un origen desde la seccion Origen de venta.
                </span>
              )}
            </label>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Metodo de pago</span>
              <select
                value={metodoPago}
                onChange={(event) => {
                  setMetodoPago(event.target.value);
                  setMontoRecibido('');
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
              >
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
              </select>
            </label>

            {metodoPago === 'Efectivo' && (
              <label className="mt-4 block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Monto recibido</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoRecibido}
                  onChange={(event) => setMontoRecibido(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-950"
                  placeholder="0.00"
                />
                <span className="block text-sm font-semibold text-slate-600">
                  Cambio: {formatCurrency(cambio)}
                </span>
              </label>
            )}

            <button
              type="button"
              onClick={finalizarVenta}
              disabled={procesando || reservando}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CreditCard size={18} />
              {procesando ? 'Procesando...' : reservando ? 'Reservando stock...' : 'Finalizar venta'}
            </button>
            </div>
          </section>

          {ticket && (
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Download size={22} className="text-slate-950" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Ficha de ticket</p>
                    <h2 className="font-bold text-slate-950">Comprobante de venta</h2>
                  </div>
                </div>
              </div>

              <div className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-green-800">Venta realizada - Folio {folioTicket}</p>
                  <p className="mt-1 text-xs font-semibold text-green-700">
                    Ticket listo para descargar o compartir.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarTicket}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  aria-label="Cerrar previsualizacion del ticket"
                >
                  <XCircle size={19} />
                </button>
              </div>

              <div className="mx-auto max-w-[300px] rounded-sm border border-slate-300 bg-white p-4 font-mono text-slate-950 shadow-sm">
                <div className="border-b border-dashed border-slate-400 pb-3 text-center">
                  <h2 className="text-lg font-black uppercase tracking-wide">
                    {empresaNombre}
                  </h2>
                  <p className="text-xs font-bold uppercase">MercaLink POS</p>
                  {empresa?.telefono && <p className="text-[11px]">Tel. {empresa.telefono}</p>}
                </div>
                <div className="space-y-1 border-b border-dashed border-slate-400 py-3 text-xs">
                  <p>Folio: {folioTicket}</p>
                  <p>Fecha: {fechaTicket}</p>
                  <p>Cajero: {ticket.cajero}</p>
                  <p>Origen de venta: {ticket.canal || 'Sin origen'}</p>
                  <p>Método de pago: {ticket.metodoPago}</p>
                </div>
                <div className="border-b border-dashed border-slate-400 py-3 text-xs">
                  <div className="mb-2 grid grid-cols-[1fr_34px_56px] gap-2 font-bold">
                    <span>Producto</span>
                    <span className="text-right">Cant</span>
                      <span className="text-right">Subt</span>
                    </div>
                  {(ticket.productos || []).map((item) => (
                    <div key={item.productoId} className="grid grid-cols-[1fr_34px_56px] gap-2 py-1">
                      <span>
                        {item.nombre}
                        <span className="block text-[10px]">{formatCurrency(item.precioUnitario)} c/u</span>
                      </span>
                      <span className="text-right">{item.cantidad}</span>
                      <span className="text-right font-bold">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal sin IVA</span>
                    <span>{formatCurrency(ticket.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA</span>
                    <span>{formatCurrency(ticket.iva)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black">
                    <span>Total</span>
                    <span>{formatCurrency(ticket.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recibido</span>
                    <span>{formatCurrency(ticket.montoRecibido)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cambio</span>
                    <span>{formatCurrency(ticket.cambio)}</span>
                  </div>
                  <p className="pt-4 text-center font-black uppercase">Gracias por su compra</p>
                  <p className="text-center text-[10px]">Ticket listo para impresion</p>
                </div>
              </div>

              <button
                type="button"
                onClick={generarTicketPdf}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Download size={17} />
                Descargar ticket PDF
              </button>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <h3 className="font-bold text-slate-950">Compartir ticket</h3>
                  <p className="text-xs font-semibold text-slate-500">Opcional después de generar la venta</p>
                </div>

                {compartirError && (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {compartirError}
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  <label className="block space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-500">WhatsApp del cliente</span>
                    <input
                      type="tel"
                      value={whatsappCliente}
                      onChange={(event) => setWhatsappCliente(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950"
                      placeholder="10 digitos o numero con lada"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={enviarPorWhatsapp}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <MessageCircle size={17} />
                    Enviar por WhatsApp
                  </button>
                </div>

              </div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default PuntoVenta;
