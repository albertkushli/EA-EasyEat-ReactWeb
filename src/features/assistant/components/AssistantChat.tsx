import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Send, Loader2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { askAssistant } from '@/services/llm.service';
import '@/styles/AssistantChat.css';
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [inputText]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const result = await askAssistant(text);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: result.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: t('assistant.error', "An error occurred. Please try again."),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Backdrop */}
      <div
        className={`ac-backdrop ${isOpen ? 'ac-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side panel */}
      <div
        ref={panelRef}
        className={`ac-panel ${isOpen ? 'ac-panel--open' : ''}`}
        role="dialog"
        aria-label={t('assistant.title', "Assistent IA")}
        aria-modal="true"
      >
        {/* Header */}
        <div className="ac-header">
          <div className="ac-header__left">
            <div className="ac-header__avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="ac-header__title">{t('assistant.title', 'AI Assistant')}</h3>
              <span className="ac-header__subtitle">{t('assistant.subtitle', "EasyEat · IA")}</span>
              <span className="ac-header__subtitle">{t('assistant.notes1', "The assistant has no memory.")}</span>
              <span className="ac-header__subtitle">{t('assistant.notes2', "Conversations are not saved.")}</span>
            </div>
          </div>
          <div className="ac-header__actions">
            {messages.length > 0 && (
              <button
                className="ac-icon-btn"
                onClick={handleClearChat}
                title={t('assistant.clear', 'Clear conversation')}
                aria-label={t('assistant.clear', 'Clear conversation')}
              >
                <RotateCcw size={16} />
              </button>
            )}
            <button
              className="ac-icon-btn"
              onClick={onClose}
              aria-label={t('assistant.close', 'Close assistant')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ac-messages">
          {messages.length === 0 && !isLoading ? (
            <div className="ac-empty">
              <div className="ac-empty__orb">
                <Bot size={32} />
              </div>
              <p className="ac-empty__title">{t('assistant.empty.title', 'How can I help you?')}</p>
              <p className="ac-empty__desc">
                {t('assistant.empty.desc', 'Ask me anything about restaurants, menu, recommendations, or points.')}
              </p>
              <div className="ac-suggestions">
                {[
                  t('assistant.suggestion.1', "What restaurants do you have available?"),
                  t('assistant.suggestion.2', "Where can I eat for less than €10?"),
                  t('assistant.suggestion.3', "Recommend me a pizza restaurant"),
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="ac-suggestion-chip"
                    onClick={() => {
                      setInputText(suggestion);
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`ac-message ac-message--${msg.role}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="ac-message__avatar">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className="ac-message__bubble">
                    <p className="ac-message__text">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </p>
                    <span className="ac-message__time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="ac-message ac-message--assistant">
                  <div className="ac-message__avatar">
                    <Bot size={14} />
                  </div>
                  <div className="ac-message__bubble ac-message__bubble--loading">
                    <Loader2 size={16} className="ac-spinner" />
                    <span>{t('assistant.thinking', 'Thinking...')}</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ac-input-area">
          <div className="ac-input-wrap">
            <textarea
              ref={textareaRef}
              id="assistant-chat-input"
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('assistant.placeholder', 'Type your message...')}
              disabled={isLoading}
              className="ac-textarea"
              style={{ minHeight: '20px' }}
            />
            <button
              id="assistant-send-button"
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="ac-send-btn"
              aria-label={t('assistant.send', 'Send message')}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="ac-input-hint">
            {t('assistant.hint', 'Enter to send · Shift+Enter for new line')}
          </p>
        </div>
      </div>
    </>
  );
};

export default AssistantChat;
