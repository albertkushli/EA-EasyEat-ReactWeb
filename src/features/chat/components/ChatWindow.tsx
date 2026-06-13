import React, { useState, useEffect, useRef } from 'react';
import { Send, Store, X, Loader2, MessageSquare } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  onClose?: () => void;
  isDashboard?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, isDashboard }) => {
  const { messages, sendMessage, isConnected, activeConversation, isLoadingMessages } = useChat();
  const { role } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [inputText]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !isConnected) return;
    sendMessage(text);
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  /** Decide if the message was sent by the current user */
  const isOwnMessage = (senderRole: string) => {
    if (role === 'customer') return senderRole === 'customer';
    return senderRole === 'employee' || senderRole === 'owner';
  };

  const restaurantName =
    (activeConversation?.restaurant as any)?.profile?.name ?? 'Chat con Restaurante';

  return (
    <div
      className={`flex flex-col h-full bg-white ${!isDashboard ? 'rounded-2xl shadow-2xl border border-gray-100 overflow-hidden' : ''}`}
    >
      {/* ── Header (only in floating mode) ── */}
      {!isDashboard && (
        <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{restaurantName}</h3>
              <div className="flex items-center text-xs opacity-90">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                />
                {isConnected ? 'En línea' : 'Desconectado'}
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 min-h-0">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="text-orange-400 animate-spin" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 opacity-60 py-12">
                <MessageSquare size={48} strokeWidth={1} />
                <p className="text-sm">Di hola para comenzar la conversación</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const mine = isOwnMessage(msg.senderRole);
                return (
                  <motion.div
                    key={msg._id ?? index}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[85%]">
                      <div
                        className={`
                          p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap break-words
                          ${
                            mine
                              ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                          }
                        `}
                      >
                        {msg.contenido}
                        <div
                          className={`text-[10px] mt-1.5 ${mine ? 'text-orange-100 text-right' : 'text-gray-400'}`}
                        >
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2 bg-gray-100 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-200 transition-all">
          <textarea
            ref={textareaRef}
            id="chat-message-input"
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected
                ? 'Escribe... (Enter para enviar, Shift+Enter para nueva línea)'
                : 'Conectando...'
            }
            disabled={!isConnected}
            className="flex-1 bg-transparent border-none outline-none text-sm py-1 resize-none leading-5 disabled:cursor-not-allowed max-h-[120px] overflow-y-auto"
            style={{ minHeight: '20px' }}
          />
          <button
            id="chat-send-button"
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || !isConnected}
            className="mb-0.5 p-2 bg-orange-500 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 pl-1">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
