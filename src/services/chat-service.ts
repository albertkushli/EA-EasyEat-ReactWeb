import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────
// Types matching the real backend schema
// ─────────────────────────────────────────────────────────────────────

export type SenderRole = 'customer' | 'employee' | 'owner';

/** A single chat message as returned by the backend (Chat model) */
export interface Message {
  _id: string;
  conversation: string;
  customer: any;
  restaurant: any;
  sender: string;
  senderRole: SenderRole;
  contenido: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

/** A populated conversation as returned by the backend */
export interface Conversation {
  _id: string;
  /** Populated Customer object */
  customer: {
    _id: string;
    name: string;
    email?: string;
    profilePictures?: string[];
  } | null;
  /** Populated Restaurant object */
  restaurant: {
    _id: string;
    profile?: { name?: string; logo?: string };
  } | null;
  /** Populated last Chat message object (or null) */
  lastMessage: Message | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────
// Service methods
// ─────────────────────────────────────────────────────────────────────

export const chatService = {
  /**
   * Get or create a conversation between a customer and a restaurant.
   * Backend: POST /chat/conversations
   */
  getOrCreateConversation: async (
    customerId: string,
    restaurantId: string,
  ): Promise<Conversation> => {
    console.log('[chatService] POST /chat/conversations', { customerId, restaurantId });
    const response = await apiClient.post('/chat/conversations', {
      customerId,
      restaurantId,
    });
    console.log(
      '[chatService] Response status:',
      response.status,
      'data:',
      JSON.stringify(response.data),
    );
    // Backend returns { message: '...', data: conversation }
    const conv = response.data?.data ?? response.data;
    return conv;
  },

  /**
   * Get all conversations for a customer.
   * Backend: GET /chat/conversations/customer/:customerId
   */
  getCustomerConversations: async (customerId: string): Promise<Conversation[]> => {
    const response = await apiClient.get(`/chat/conversations/customer/${customerId}`);
    return response.data.data ?? [];
  },

  /**
   * Get all conversations for a restaurant.
   * Backend: GET /chat/conversations/restaurant/:restaurantId
   */
  getRestaurantConversations: async (restaurantId: string): Promise<Conversation[]> => {
    const response = await apiClient.get(`/chat/conversations/restaurant/${restaurantId}`);
    return response.data.data ?? [];
  },

  /**
   * Get all messages for a conversation.
   * Backend: GET /chat/conversations/:conversationId/messages
   */
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
    return response.data.data ?? [];
  },

  /**
   * Mark all messages in a conversation as read.
   * Backend: PATCH /chat/conversations/:conversationId/read
   */
  markConversationAsRead: async (conversationId: string, userId: string): Promise<void> => {
    await apiClient.patch(`/chat/conversations/${conversationId}/read`, {
      userId,
    });
  },
};
