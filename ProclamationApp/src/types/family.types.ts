export interface Family {
  id: number;
  name: string;
  inviteCode: string;
  inviteCodeExpiresAt: string | null;
  memberCount: number;
  defaultAllowance: number;
  allowChildrenToCreateChores: boolean;
  createdAt: string;
}

export interface FamilyMember {
  id: number;
  displayName: string;
  phoneNumber: string;
  role: number; // 1 = Parent, 2 = Child
  balance: number;
}

export interface CreateFamilyRequest {
  name: string;
  defaultAllowance?: number;
  allowChildrenToCreateChores?: boolean;
}

export interface JoinFamilyRequest {
  inviteCode: string;
}

