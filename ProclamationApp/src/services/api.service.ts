import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  RequestVerificationRequest,
  VerifyCodeRequest,
  RegisterRequest,
  Family,
  FamilyMember,
  CreateFamilyRequest,
  JoinFamilyRequest,
  Message,
  SendMessageRequest,
  Transaction,
  SendMoneyRequest,
  FamilyMemberForTransaction,
} from '../types';

// Update this to your backend URL
// For iOS simulator: http://localhost:5135
// For Android emulator: http://10.0.2.2:5135
// For physical device: http://YOUR_COMPUTER_IP:5135
const API_BASE_URL = 'http://10.211.55.4:5135';

class ApiService {
  public api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await AsyncStorage.getItem('authToken');
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Store token in memory and AsyncStorage
  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  // Clear token
  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  // Get stored token
  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  // Authentication endpoints
  async requestVerification(
    phoneNumber: string
  ): Promise<{ message: string }> {
    const data: RequestVerificationRequest = { phoneNumber };
    const response = await this.api.post('/api/auth/request-verification', data);
    return response.data;
  }

  async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<AuthResponse> {
    const data: VerifyCodeRequest = { phoneNumber, code };
    const response = await this.api.post<AuthResponse>('/api/auth/verify-code', data);
    
    // If we get a token, store it
    if (response.data.token) {
      await this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async register(
    phoneNumber: string,
    displayName: string,
    role: number
  ): Promise<AuthResponse> {
    const data: RegisterRequest = { phoneNumber, displayName, role };
    const response = await this.api.post<AuthResponse>('/api/auth/register', data);
    
    // Store the token
    if (response.data.token) {
      await this.setToken(response.data.token);
    }
    
    return response.data;
  }

  // Logout
  async logout() {
    await this.clearToken();
  }

  // Family endpoints
  async createFamily(data: CreateFamilyRequest): Promise<Family> {
    const response = await this.api.post<Family>('/api/family/create', data);
    return response.data;
  }

  async joinFamily(data: JoinFamilyRequest): Promise<Family> {
    const response = await this.api.post<Family>('/api/family/join', data);
    return response.data;
  }

  async getMyFamily(): Promise<Family> {
    const response = await this.api.get<Family>('/api/family');
    return response.data;
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    const response = await this.api.get<FamilyMember[]>('/api/family/members');
    return response.data;
  }

  async regenerateInviteCode(): Promise<Family> {
    const response = await this.api.post<Family>('/api/family/regenerate-invite');
    return response.data;
  }

  async leaveFamily(): Promise<void> {
    await this.api.delete('/api/family/leave');
  }

  // Message endpoints
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await this.api.post<Message>('/api/message', data);
    return response.data;
  }

  async getMessages(limit: number = 50, beforeId?: number): Promise<Message[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) {
      params.append('beforeId', beforeId.toString());
    }
    const response = await this.api.get<Message[]>(`/api/message?${params.toString()}`);
    return response.data;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await this.api.post(`/api/message/${messageId}/read`);
  }

  async markAllMessagesAsRead(): Promise<void> {
    await this.api.post('/api/message/read-all');
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.api.get<number>('/api/message/unread-count');
    return response.data;
  }

  async deleteMessage(messageId: number): Promise<void> {
    await this.api.delete(`/api/message/${messageId}`);
  }

  // Transaction endpoints
  async sendMoney(data: SendMoneyRequest): Promise<Transaction> {
    const response = await this.api.post<Transaction>('/api/transaction/send', data);
    return response.data;
  }

  async getTransactions(limit: number = 50): Promise<Transaction[]> {
    const response = await this.api.get<Transaction[]>(`/api/transaction?limit=${limit}`);
    return response.data;
  }

  async getMyTransactions(limit: number = 50): Promise<Transaction[]> {
    const response = await this.api.get<Transaction[]>(`/api/transaction/my-history?limit=${limit}`);
    return response.data;
  }

  async getBalance(): Promise<number> {
    const response = await this.api.get<number>('/api/transaction/balance');
    return response.data;
  }

  async getFamilyMembersForTransaction(): Promise<FamilyMemberForTransaction[]> {
    const response = await this.api.get<FamilyMemberForTransaction[]>('/api/transaction/family-members');
    return response.data;
  }
}

export const apiService = new ApiService();

