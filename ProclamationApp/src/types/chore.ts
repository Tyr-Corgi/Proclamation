export enum ChoreStatus {
  Available = 1,
  InProgress = 2,
  PendingApproval = 3,
  Completed = 4,
  Cancelled = 5,
}

export interface Chore {
  id: number;
  title: string;
  description: string;
  reward: number;
  assignedToId?: number;
  assignedToName?: string;
  createdById: number;
  createdByName: string;
  familyId: number;
  status: ChoreStatus;
  statusName: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  claimedAt?: string;
  completionNotes?: string;
}

export interface CreateChoreRequest {
  title: string;
  description: string;
  reward: number;
  dueDate?: string;
}

export interface UpdateChoreStatusRequest {
  status: ChoreStatus;
  completionNotes?: string;
}

