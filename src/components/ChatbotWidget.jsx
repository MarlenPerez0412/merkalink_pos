import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { chatbotConversacionesIniciales, empresaData } from '../data/mockData';
import { getUniversalBotResponse } from '../utils/chatbotResponses';

const storageKey = 'merkalink-chatbot-messages';

const getInitialMessages = () => {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
  } catch {
    return chatbotConversacionesIniciales;
  }

  return chatbotConversacionesIniciales;
};

const ChatbotWidget = ({ isOpen, onToggle }) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(getInitialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || isTyping) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        autor: 'usuario',
        texto: text,
      },
    ]);
    setDraft('');
    setIsTyping(true);

    timeoutRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          autor: 'ia',
          texto: getUniversalBotResponse(text),
        },
      ]);
      setIsTyping(false);
    }, 550);
  };

  const clearConversation = () => {
    setMessages(chatbotConversacionesIniciales);
    setDraft('');
    window.localStorage.removeItem(storageKey);
  };

  return (
    <div className="fixed bottom-6 right-4 z-50 max-w-[calc(100vw-2rem)] sm:right-6">
      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 ${
        isOpen ? 'w-[min(390px,calc(100vw-2rem))]' : 'w-16'
      }`}>
        <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500/20 text-primary-100">
              {isOpen ? <Bot size={21} /> : <MessageSquare size={20} />}
            </div>
            {isOpen && (
              <div className="min-w-0">
                <p className="truncate font-semibold">MercaBot AI</p>
                <p className="truncate text-xs text-slate-300">{empresaData.nombre} · chat local</p>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={isOpen ? 'Cerrar chatbot' : 'Abrir chatbot'}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/15"
            onClick={onToggle}
          >
            {isOpen ? <X size={20} /> : <Sparkles size={20} />}
          </button>
        </div>

        {isOpen && (
          <div className="flex h-[540px] max-h-[calc(100vh-9rem)] flex-col bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
              <p className="text-xs font-medium text-slate-500">Historial registrado localmente</p>
              <button
                type="button"
                onClick={clearConversation}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                Limpiar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4" ref={messageListRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.autor === 'ia' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.autor === 'ia'
                        ? 'border border-slate-200 bg-white text-slate-800'
                        : 'border border-primary-200 bg-primary-50 text-slate-950'
                    }`}
                  >
                    {message.texto}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mb-4 flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    MercaBot está escribiendo...
                  </div>
                </div>
              )}
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
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Escribe tu pregunta..."
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim() || isTyping}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <Send size={18} />
                  Enviar
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
