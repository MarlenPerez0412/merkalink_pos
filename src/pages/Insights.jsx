import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '../components';
import {
  Bot,
  Brain,
  Lightbulb,
  PackageSearch,
  Send,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  chatbotConversacionesIniciales,
  empresaData,
  preciosSugeridos,
  prediccionesStock,
  productosAltaDemanda,
  recomendacionesIA,
} from '../data/mockData';
import { getUniversalBotResponse } from '../utils/chatbotResponses';

const insightsChatStorageKey = 'merkalink-insights-chat-messages';

const getInitialChatMessages = () => {
  try {
    const stored = window.localStorage.getItem(insightsChatStorageKey);
    if (stored) return JSON.parse(stored);
  } catch {
    return chatbotConversacionesIniciales;
  }

  return chatbotConversacionesIniciales;
};

const MercaBot = () => {
  const [messages, setMessages] = useState(getInitialChatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    window.localStorage.setItem(insightsChatStorageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        autor: 'usuario',
        texto: trimmed,
      },
    ]);
    setInput('');
    setIsTyping(true);

    timeoutRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          autor: 'ia',
          texto: getUniversalBotResponse(trimmed),
        },
      ]);
      setIsTyping(false);
    }, 550);
  };

  const clearConversation = () => {
    setMessages(chatbotConversacionesIniciales);
    setInput('');
    window.localStorage.removeItem(insightsChatStorageKey);
  };

  return (
    <Card className="overflow-hidden" hover={false}>
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-500/20 p-2 text-primary-100">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="font-bold">MercaBot AI</h3>
            <p className="text-xs text-slate-300">Asistente mock para {empresaData.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-200 ring-1 ring-green-400/20">
            Local
          </span>
          <button
            type="button"
            onClick={clearConversation}
            className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/15"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="h-[420px] space-y-4 overflow-y-auto bg-slate-50 p-4" ref={messageListRef}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                message.autor === 'usuario'
                  ? 'border border-primary-200 bg-primary-50 text-slate-950'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              {message.texto}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              MercaBot está escribiendo...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSend();
              }
            }}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="Pregunta por stock, ventas, canal, precio..."
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 bg-green-600 text-white hover:bg-green-700"
          >
            <Send size={17} />
            Enviar
          </Button>
        </div>
      </div>
    </Card>
  );
};

const Insights = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          <Zap className="text-accent-600" size={30} />
          IA Insights
        </h2>
        <p className="mt-1 text-sm text-slate-500">Recomendaciones y simulaciones IA para {empresaData.nombre}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {recomendacionesIA.map((rec) => (
          <Card key={rec.id} className="p-5" hover={false}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="rounded-lg bg-primary-50 p-3 text-primary-700">
                <Lightbulb size={22} />
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                rec.impacto === 'Alto'
                  ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'
              }`}>
                Impacto {rec.impacto}
              </span>
            </div>
            <h3 className="font-bold text-slate-950">{rec.titulo}</h3>
            <p className="mt-2 text-sm text-slate-600">{rec.descripcion}</p>
            <Button className="mt-4" size="sm" variant="outline">{rec.accion}</Button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-3">
            <PackageSearch className="text-orange-600" size={22} />
            <h3 className="text-lg font-bold text-slate-950">Predicción simple de stock</h3>
          </div>
          <div className="space-y-3">
            {prediccionesStock.map((item) => (
              <div key={item.producto} className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{item.producto}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.riesgo === 'Crítico' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {item.riesgo}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">Stock {item.stockActual} · Agotamiento estimado: {item.estimadoAgotamiento}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-3">
            <Brain className="text-violet-600" size={22} />
            <h3 className="text-lg font-bold text-slate-950">Precio sugerido simulado</h3>
          </div>
          <div className="space-y-3">
            {preciosSugeridos.map((item) => (
              <div key={item.producto} className="rounded-lg bg-slate-50 p-3">
                <p className="font-semibold text-slate-950">{item.producto}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">${item.precioActual}</span>
                  <span className="font-bold text-primary-700">${item.precioSugerido}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.motivo}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-3">
            <TrendingUp className="text-green-600" size={22} />
            <h3 className="text-lg font-bold text-slate-950">Productos con mayor demanda</h3>
          </div>
          <div className="space-y-3">
            {productosAltaDemanda.map((item, index) => (
              <div key={item.producto} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{item.producto}</p>
                    <p className="text-xs text-slate-500">{item.canal}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-950">{item.ventas}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.35fr]">
        <Card className="p-5" hover={false}>
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary-700" size={22} />
            <h3 className="text-lg font-bold text-slate-950">Resumen IA del piloto</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>WhatsApp y tienda física concentran la actividad más fuerte de PPC SOLUCIONES.</p>
            <p>El inventario crítico está en accesorios de alta rotación: cargadores, micas y cables.</p>
            <p>La primera etapa debe priorizar reabastecimiento, rapidez de atención y precios sugeridos para productos de alta demanda.</p>
          </div>
        </Card>

        <MercaBot />
      </div>
    </div>
  );
};

export default Insights;
