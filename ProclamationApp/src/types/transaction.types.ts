export interface Transaction {
  id: number;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
  type: number;
  typeName: string;
  timestamp: string;
  createdAt: string;
  description?: string;
}

export interface SendMoneyRequest {
  toUserId: number;
  amount: number;
  description?: string;
}

export interface FamilyMemberForTransaction {
  id: number;
  displayName: string;
  role: number;
  balance: number;
}

