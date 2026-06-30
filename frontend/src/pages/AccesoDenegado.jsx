import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AccesoDenegado = () => (
  <div className="grid min-h-[60vh] place-items-center px-4">
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-red-600">
        <ShieldAlert size={26} />
      </div>
      <h1 className="mt-4 text-2xl font-black text-slate-950">Acceso denegado</h1>
      <p className="mt-2 text-sm font-medium text-slate-600">
        No tienes permisos para acceder a este módulo.
      </p>
      <Link
        to="/pos"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Volver al punto de venta
      </Link>
    </section>
  </div>
);

export default AccesoDenegado;
