import React, { useEffect, useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatWindow from '../components/ChatWindow';
import { User, Search, MessageSquare, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Conversation } from '@/services/chat-service';

const RestaurantChatDashboard: React.FC = () => {
  const {
    conversations,
    activeConversation,
    setActiveConversationId,
    fetchConversations,
    isConnected,
  } = useChat();

  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Track which conversations have new messages since last viewed
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const prevMessages = useRef<Set<string>>(new Set());
  const autoSelectedRef = useRef(false);

  // Auto-select the first conversation when list loads
  useEffect(() => {
    if (!autoSelectedRef.current && conversations.length > 0 && !activeConversation) {
      setActiveConversationId(conversations[0]._id);
      autoSelectedRef.current = true;
    }
  }, [conversations, activeConversation, setActiveConversationId]);

  // Track new messages for unread badge
  useEffect(() => {
    conversations.forEach((conv) => {
      const lastMsgId = conv.lastMessage?._id;
      if (!lastMsgId) return;
      const isActive = activeConversation?._id === conv._id;
      // Only mark as unread if it's a new message and the conversation is not active
      if (!prevMessages.current.has(lastMsgId) && !isActive) {
        setUnreadIds((prev) => new Set(prev).add(conv._id));
      }
      prevMessages.current.add(lastMsgId);
    });
  }, [conversations, activeConversation]);

  // Clear unread when conversation becomes active
  useEffect(() => {
    if (!activeConversation) return;
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(activeConversation._id);
      return next;
    });
  }, [activeConversation]);

  // Periodic refresh fallback (every 30s) in case WebSocket misses events
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchConversations();
    setIsRefreshing(false);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getCustomerName = (conv: Conversation) => conv.customer?.name ?? 'Cliente';

  const getCustomerAvatar = (conv: Conversation) => conv.customer?.profilePictures?.[0] ?? null;

  const getLastMessageText = (conv: Conversation) =>
    conv.lastMessage?.contenido ?? 'Empieza a chatear...';

  const filtered = conversations.filter((c) =>
    getCustomerName(c).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* ── Conversation sidebar ── */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30 shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="text-orange-500" size={22} />
              Mensajes
              {conversations.length > 0 && (
                <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {/* Manual refresh button */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Actualizar conversaciones"
                className="p-1.5 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              {/* Connection badge */}
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-gray-400 text-center space-y-3 h-full">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare size={28} />
              </div>
              <p className="text-sm">
                {search ? 'No se encontraron resultados' : 'No hay conversaciones activas aún'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/60">
              {filtered.map((conv) => {
                const isActive = activeConversation?._id === conv._id;
                const hasUnread = unreadIds.has(conv._id);
                return (
                  <button
                    key={conv._id}
                    id={`conv-${conv._id}`}
                    onClick={() => {
                      setActiveConversationId(conv._id);
                    }}
                    className={`w-full p-4 flex items-start gap-3 transition-all hover:bg-white relative ${
                      isActive ? 'bg-white shadow-sm z-10' : ''
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-r"
                      />
                    )}

                    {/* Avatar */}
                    <div className="relative w-11 h-11 flex-shrink-0">
                      <div className="w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 overflow-hidden border border-orange-50">
                        {getCustomerAvatar(conv) ? (
                          <img
                            src={getCustomerAvatar(conv)!}
                            alt={getCustomerName(conv)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={22} />
                        )}
                      </div>
                      {/* Unread dot */}
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4
                          className={`truncate text-sm ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}
                        >
                          {getCustomerName(conv)}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                          {formatDate(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}
                      >
                        {getLastMessageText(conv)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeConversation ? (
          <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 overflow-hidden">
                {getCustomerAvatar(activeConversation) ? (
                  <img
                    src={getCustomerAvatar(activeConversation)!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {getCustomerName(activeConversation)}
                </h3>
                <p className="text-[10px] text-green-500 font-semibold">Cliente</p>
              </div>
            </div>

            {/* Chat messages + input */}
            <div className="flex-1 min-h-0">
              <ChatWindow isDashboard />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/20">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-center mb-6">
              <MessageSquare size={48} className="text-orange-200" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600">Bandeja de entrada</h3>
            <p className="text-sm mt-2 max-w-xs text-center px-6 text-gray-400">
              Selecciona una conversación para responder en tiempo real.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantChatDashboard;
