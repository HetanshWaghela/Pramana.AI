// Chat API service for managing user conversations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ChatMessage {
  id?: number;
  chat_id?: string;
  message_type: 'human' | 'ai';
  content: string;
  message_id?: string;
  created_at?: string;
}

export interface Chat {
  id: string;
  user_id?: number;
  title: string;
  preview?: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface ChatListItem {
  id: string;
  title: string;
  preview?: string;
  created_at: string;
  updated_at: string;
}

class ChatService {
  private getToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('ChatService getToken:', token ? 'Token exists' : 'No token');
    return token;
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
    console.log('ChatService headers:', headers);
    return headers;
  }

  async getUserChats(): Promise<ChatListItem[]> {
    const headers = this.getHeaders();
    console.log('Fetching chats with headers:', headers);
    const response = await fetch(`${API_BASE_URL}/chats`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch chats');
    }

    return response.json();
  }

  async createChat(id?: string, title: string = 'New Chat'): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ id, title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Chat not found');
      }
      throw new Error('Failed to fetch chat');
    }

    return response.json();
  }

  async updateChat(chatId: string, data: { title?: string; preview?: string }): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update chat');
    }

    return response.json();
  }

  async deleteChat(chatId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
  }

  async addMessages(chatId: string, messages: Omit<ChatMessage, 'id' | 'chat_id' | 'created_at'>[]): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('Failed to add messages');
    }

    return response.json();
  }

  async clearMessages(chatId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to clear messages');
    }
  }
}

export const chatService = new ChatService();
export default chatService;
