import apiClient from './apiClient';

export interface SupportChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export const supportService = {
  /**
   * Send a message to the AI support chatbot.
   * Backend: POST /api/support/chat
   */
  sendSupportMessage: async (
    message: string,
    history: SupportChatMessage[] = [],
  ): Promise<string> => {
    try {
      const response = await apiClient.post('/support/chat', {
        message,
        history,
      });

      return response.data.response;
    } catch (error: any) {
      console.error('[supportService] Error sending message:', error);
      throw new Error(
        error.response?.data?.message ||
          'No se pudo conectar con el asistente. Por favor, inténtalo de nuevo.',
      );
    }
  },
};
