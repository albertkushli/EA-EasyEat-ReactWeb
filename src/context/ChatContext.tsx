import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  FC,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { chatService, Message, Conversation, SenderRole } from '@/services/chat-service';

// ─────────────────────────────────────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────────────────────────────────────

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingMessages: boolean;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (contenido: string) => void;
  fetchConversations: () => Promise<void>;
  startConversation: (restaurantId: string) => Promise<string>;
}

const defaultCtx: ChatContextType = {
  socket: null,
  isConnected: false,
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoadingMessages: false,
  setActiveConversationId: () => {},
  sendMessage: () => {},
  fetchConversations: async () => {},
  startConversation: async () => '',
};

const ChatContext = createContext<ChatContextType>(defaultCtx);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated, role, user } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Refs to avoid stale closures in socket listeners
  const activeIdRef = useRef<string | null>(null);
  const roleRef = useRef(role);
  const userRef = useRef(user);

  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);
  useEffect(() => {
    roleRef.current = role;
  }, [role]);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const activeConversation = conversations.find((c) => c._id === activeConversationId) ?? null;

  // ── Fetch conversations (role-aware) ────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      let data: Conversation[] = [];

      if (role === 'customer') {
        const customerId = user._id ?? user.id;
        if (customerId) {
          data = await chatService.getCustomerConversations(customerId);
        }
      } else if (
        (role === 'owner' || role === 'staff') &&
        user.restaurant_id
      ) {
        data = await chatService.getRestaurantConversations(
          user.restaurant_id,
        );
      }

      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch conversations:', err);
      setConversations([]);
    }
  }, [isAuthenticated, user, role]);

  // ── Fetch messages for a conversation ───────────────────────────────────────
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch messages:', err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // ── Socket connection ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSocket(null);
      setIsConnected(false);
      setConversations([]);
      setMessages([]);
      setActiveConversationIdState(null);
      return;
    }

    // Connect to backend socket (proxied by Vite if VITE_API_URL is empty)
    const socketUrl = import.meta.env.VITE_API_URL || '/';
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Chat Socket connected:', newSocket.id);

      // Join the appropriate notification room so we receive conversation updates
      const u = userRef.current;
      const currentRole = roleRef.current;
      if ((currentRole === 'owner' || currentRole === 'staff') && u?.restaurant_id) {
        newSocket.emit('chat:joinRestaurant', { restaurantId: u.restaurant_id });
      } else if (currentRole === 'customer' && u) {
        const customerId = u._id ?? u.id;
        if (customerId) newSocket.emit('chat:joinCustomer', { customerId });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Chat Socket disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('🔌 Socket connect error:', err.message);
    });

    // ── Receive new message ──────────────────────────────────────────────────
    newSocket.on('chat:newMessage', (message: Message) => {
      const currentActiveId = activeIdRef.current;

      // Append to current conversation if it matches
      if (message.conversation === currentActiveId) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update conversation list (last message, ordering)
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === message.conversation);
        if (!exists) {
          // Conversation not yet in list — refresh
          setTimeout(() => fetchConversations(), 500);
          return prev;
        }

        const updated = prev.map((conv) => {
          if (conv._id === message.conversation) {
            return { ...conv, lastMessage: message, lastMessageAt: message.createdAt };
          }
          return conv;
        });

        return [...updated].sort(
          (a, b) =>
            new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime(),
        );
      });
    });

    // ── Conversation updated (e.g. new conv from another user) ───────────────
    newSocket.on('chat:conversationUpdated', () => {
      fetchConversations();
    });

    // ── Chat errors ──────────────────────────────────────────────────────────
    newSocket.on('chat:error', (err: { message: string }) => {
      console.error('❌ Chat socket error:', err.message);
    });

    return () => {
      console.log('🔌 Closing Chat Socket');
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // ── Join / leave conversation rooms ─────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected || !activeConversationId) return;

    socket.emit('chat:joinConversation', { conversationId: activeConversationId });
    fetchMessages(activeConversationId);

    return () => {
      socket.emit('chat:leaveConversation', { conversationId: activeConversationId });
    };
  }, [socket, isConnected, activeConversationId, fetchMessages]);

  // ── Initial conversation fetch ───────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) fetchConversations();
  }, [isAuthenticated, fetchConversations]);

  // ── Public API ───────────────────────────────────────────────────────────────

  const setActiveConversationId = useCallback((id: string | null) => {
    setActiveConversationIdState(id);
    if (!id) setMessages([]);
  }, []);

  /** Create or retrieve a conversation then make it active (customer-side) */
  const startConversation = useCallback(
    async (restaurantId: string): Promise<string> => {
      const u = userRef.current;
      const customerId = u?._id ?? u?.id;

      console.log('[Chat] startConversation called', {
        restaurantId,
        user: u,
        customerId,
        role: roleRef.current,
      });

      if (!customerId) {
        throw new Error(`No se encontró el ID del cliente. Usuario: ${JSON.stringify(u)}`);
      }

      const conv = await chatService.getOrCreateConversation(customerId, restaurantId);
      console.log('[Chat] Conversation received (full object):', JSON.stringify(conv));

      // Mongoose can return either _id or id depending on serialization
      const convId = conv?._id ?? (conv as any)?.id;

      if (!convId) {
        throw new Error(
          `La respuesta del servidor no contiene una conversación válida. Recibido: ${JSON.stringify(conv)}`,
        );
      }

      setActiveConversationId(String(convId));
      await fetchConversations();
      return String(convId);
    },
    [fetchConversations, setActiveConversationId],
  );

  /** Send a message in the active conversation via socket */
  const sendMessage = useCallback(
    (contenido: string) => {
      if (!socket || !isConnected || !activeConversationId) {
        console.warn('Cannot send message: socket not ready or no active conversation');
        return;
      }
      const u = userRef.current;
      const senderId = u?._id ?? u?.id;

      let senderRole: SenderRole = 'customer';
      const currentRole = roleRef.current;
      if (currentRole === 'owner') {
        senderRole = 'owner';
      } else if (currentRole === 'staff' || currentRole === 'admin') {
        senderRole = 'employee';
      }

      socket.emit('chat:sendMessage', {
        conversationId: activeConversationId,
        senderId,
        senderRole,
        contenido,
      });
    },
    [socket, isConnected, activeConversationId],
  );

  const value: ChatContextType = {
    socket,
    isConnected,
    conversations,
    activeConversation,
    messages,
    isLoadingMessages,
    setActiveConversationId,
    sendMessage,
    fetchConversations,
    startConversation,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useChat(): ChatContextType {
  return useContext(ChatContext) ?? defaultCtx;
}
