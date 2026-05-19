import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';

const botReplies = [
  '¡Hola! ¿En qué puedo ayudarte hoy?',
  'Puedo mostrarte información de inventario, ventas o canales.',
  'Te recomiendo revisar los productos con stock bajo.',
  'Si quieres, te guío para crear una alerta inteligente.',
  'También puedo ayudarte a interpretar tus gráficos de ventas.',
];

const getBotReply = (text) => {
  const normalized = text.toLowerCase();
  if (normalized.includes('stock') || normalized.includes('inventario')) {
    return 'El inventario actual tiene varios productos con stock bajo. Revisa la tabla de inventario y ajusta las alertas.';
  }
  if (normalized.includes('ventas') || normalized.includes('reportes')) {
    return 'Tus ventas muestran una tendencia positiva. Revisa el dashboard para ver los canales más efectivos.';
  }
  if (normalized.includes('canal') || normalized.includes('marketplace')) {
    return 'Los canales activos están sincronizados. Prioriza los canales con mejor conversión.';
  }
  return botReplies[Math.floor(Math.random() * botReplies.length)];
};

const ChatbotWidget = ({ isOpen, onToggle, onClose }) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hola, soy tu asistente inteligente de MercaLink. ¿Cómo puedo ayudarte?' },
  ]);
  const messageListRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft('');

    timeoutRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: getBotReply(text),
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 max-w-[360px]">
      <div className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl transition-all duration-300 ${
        isOpen ? 'w-[360px]' : 'w-16'
      }`}>
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <MessageSquare size={20} />
            </div>
            {isOpen && (
              <div>
                <p className="font-semibold">Asistente MercaLink</p>
                <p className="text-xs text-white/80">Chat de ayuda instantánea</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white"
            onClick={onToggle}
          >
            {isOpen ? <X size={20} /> : <Sparkles size={20} />}
          </button>
        </div>

        {isOpen && (
          <div className="flex h-[500px] flex-col bg-slate-50">
            <div className="flex-1 overflow-y-auto px-4 py-4" ref={messageListRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                      message.sender === 'bot'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Escribe tu pregunta..."
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white transition hover:bg-primary-700"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotWidget;
