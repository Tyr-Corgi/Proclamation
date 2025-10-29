export enum AllowanceFrequency {
  Weekly = 1,
  BiWeekly = 2,
  Monthly = 3,
}

export interface Allowance {
  id: number;
  userId: number;
  userName: string;
  familyId: number;
  amount: number;
  frequency: AllowanceFrequency;
  frequencyName: string;
  dayOfWeek?: number;
  dayOfWeekName?: string;
  dayOfMonth?: number;
  isActive: boolean;
  createdAt: string;
  lastProcessedAt?: string;
  nextPaymentDate?: string;
}

export interface CreateAllowanceRequest {
  userId: number;
  amount: number;
  frequency: AllowanceFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export interface UpdateAllowanceRequest {
  amount?: number;
  frequency?: AllowanceFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isActive?: boolean;
}

