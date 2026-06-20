import React, { useState, useRef, useEffect } from 'react';
import { supportService, SupportChatMessage } from '../../../services/support-service';
import '../styles/SupportChat.css';
import logoImg from '@/assets/logo.svg';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const SupportIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const SendIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '¡Hola! Soy el asistente de EasyEat. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const history: SupportChatMessage[] = messages.map((m) => ({
        role: m.role,
        parts: m.text,
      }));

      const aiResponse = await supportService.sendSupportMessage(trimmedInput, history);

      if (!aiResponse) {
        throw new Error('El asistente no ha devuelto una respuesta válida.');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('[SupportChat] Error:', err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="support-chat-container">
      {isOpen && (
        <div className="support-panel">
          <div className="support-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Asistente <img src={logoImg} alt="EasyEat Logo" style={{ height: '18px' }} />
            </h3>
            <button
              className="support-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="support-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="support-error">{error}</div>}

          <form className="support-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Escribe tu duda aquí..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              className="support-send-btn"
              disabled={!inputValue.trim() || isLoading}
              title="Enviar"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        className={`support-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Cerrar chat' : 'Abrir soporte'}
      >
        {isOpen ? '✕' : <SupportIcon />}
      </button>
    </div>
  );
};

export default SupportChat;
