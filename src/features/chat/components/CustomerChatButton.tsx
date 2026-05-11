import React, { useState } from 'react';
import { MessageSquare, X, Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/context/ChatContext';
import ChatWindow from './ChatWindow';

interface CustomerChatButtonProps {
  restaurantId: string;
  restaurantName?: string;
}

const CustomerChatButton: React.FC<CustomerChatButtonProps> = ({
  restaurantId,
  restaurantName,
}) => {
  const { startConversation, isConnected } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingConv, setIsLoadingConv] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    // Open panel immediately — never block on async
    setIsOpen(true);
    setError(null);
    setIsLoadingConv(true);

    try {
      await startConversation(restaurantId);
    } catch (err: any) {
      console.error('[CustomerChat] Error opening conversation:', err);
      setError(err?.message ?? 'No se pudo abrir el chat. Inténtalo de nuevo.');
    } finally {
      setIsLoadingConv(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  return (
    <>
      {/* ── Trigger button ── */}
      <motion.button
        id={`chat-btn-${restaurantId}`}
        onClick={handleOpen}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-lg
          bg-gradient-to-r from-orange-500 to-orange-600 text-white
          hover:from-orange-600 hover:to-orange-700 transition-all"
      >
        <MessageSquare size={18} />
        Chat con el restaurante
      </motion.button>

      {/* ── Slide-in panel ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              key="chat-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm shadow-2xl flex flex-col bg-white"
            >
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {restaurantName ?? 'Chat con el restaurante'}
                  </h3>
                  <span className={`flex items-center gap-1.5 text-[11px] mt-0.5 ${isConnected ? 'text-green-200' : 'text-red-200'}`}>
                    {isConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
                    {isConnected ? 'Conectado' : 'Sin conexión'}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Cerrar chat"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 flex flex-col">
                {isLoadingConv ? (
                  /* Loading state while we create/load the conversation */
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                    <Loader2 size={36} className="animate-spin text-orange-400" />
                    <p className="text-sm">Abriendo conversación...</p>
                  </div>
                ) : error ? (
                  /* Error state */
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <AlertCircle size={40} className="text-red-400" />
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                    <button
                      onClick={handleOpen}
                      className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  /* Chat window */
                  <ChatWindow isDashboard />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomerChatButton;
