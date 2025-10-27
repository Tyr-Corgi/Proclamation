export enum UserRole {
  Parent = 1,
  Child = 2,
}

export interface User {
  id: number;
  phoneNumber: string;
  displayName: string;
  role: UserRole;
  familyId: number | null;
  balance: number;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  requiresRegistration?: boolean;
}

export interface RequestVerificationRequest {
  phoneNumber: string;
}

export interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  displayName: string;
  role: UserRole;
}

