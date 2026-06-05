import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Store } from 'lucide-react';
import { loginUsuario } from '../services/api/authApi';

const slides = [
  {
    image: '/images/login/restaurante-1.jpg',
    title: 'Digitaliza tu restaurante con un punto de venta inteligente',
  },
  {
    image: '/images/login/restaurante-2.jpg',
    title: 'Controla ventas, inventario y tickets desde una sola plataforma',
  },
  {
    image: '/images/login/pos-1.jpg',
    title: 'Convierte tus ventas diarias en decisiones claras',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [imagenesConError, setImagenesConError] = useState({});
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await loginUsuario(formData);
      const { usuario, token } = response;

      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('token', token);
      localStorage.setItem('rol', usuario.rol);

      navigate(usuario.rol === 'Cajero' ? '/pos' : '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block">
        {slides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt="Restaurante y punto de venta"
            onError={() => setImagenesConError((current) => ({ ...current, [slide.image]: true }))}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            } ${imagenesConError[slide.image] ? 'hidden' : ''}`}
          />
        ))}

        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="relative z-10 flex h-full flex-col justify-end px-12 pb-14 text-white">
          <div className="mb-8 flex gap-2">
            {slides.map((slide, index) => (
              <span
                key={slide.image}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeSlide ? 'w-12 bg-white' : 'w-5 bg-white/40'
                }`}
              />
            ))}
          </div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            MercaLink POS
          </p>
          <h1 className="max-w-2xl text-5xl font-bold leading-tight">
            {slides[activeSlide].title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
            Operación comercial, caja, inventario y tickets conectados a MySQL para restaurantes y PyMEs mexicanas.
          </p>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="mb-5 inline-flex rounded-lg bg-slate-950 p-3 text-white">
              <Store size={28} />
            </div>
            <p className="text-sm font-semibold text-primary-700">MercaLink POS</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-slate-500">
              Acceso para administradores y cajeros del punto de venta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Correo</span>
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-slate-950">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className="w-full bg-transparent py-1 outline-none"
                  placeholder="admin@merkalinkpos.com"
                  required
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Contraseña</span>
              <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-slate-950">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent py-1 outline-none"
                  placeholder="123456"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Las cuentas son creadas por el Administrador General desde Configuración &gt; Usuarios.
            </div>
          </form>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            Imagenes locales esperadas: public/images/login/restaurante-1.jpg,
            public/images/login/restaurante-2.jpg y public/images/login/pos-1.jpg.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
