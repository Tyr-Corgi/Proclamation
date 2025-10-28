export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: number;
  familyId: number;
  content: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
  readCount: number;
}

export interface SendMessageRequest {
  content: string;
}

