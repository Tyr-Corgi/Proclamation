import { apiService } from './api.service';
import { Chore, CreateChoreRequest, UpdateChoreStatusRequest } from '../types/chore';

export const choreService = {
  // Get all chores for the family
  getChores: async (): Promise<Chore[]> => {
    const response = await apiService.api.get('/api/chore');
    return response.data.chores;
  },

  // Get a specific chore by ID
  getChore: async (id: number): Promise<Chore> => {
    const response = await apiService.api.get(`/api/chore/${id}`);
    return response.data;
  },

  // Create a new chore (parents only)
  createChore: async (data: CreateChoreRequest): Promise<Chore> => {
    const response = await apiService.api.post('/api/chore', data);
    return response.data.chore;
  },

  // Claim an available chore
  claimChore: async (id: number): Promise<void> => {
    await apiService.api.post(`/api/chore/${id}/claim`);
  },

  // Submit chore for approval
  completeChore: async (id: number, completionNotes?: string): Promise<void> => {
    await apiService.api.post(`/api/chore/${id}/complete`, {
      completionNotes,
    });
  },

  // Approve a completed chore (parents only)
  approveChore: async (id: number): Promise<{ reward: number }> => {
    const response = await apiService.api.post(`/api/chore/${id}/approve`);
    return response.data;
  },

  // Reject a completed chore (parents only)
  rejectChore: async (id: number): Promise<void> => {
    await apiService.api.post(`/api/chore/${id}/reject`);
  },

  // Delete a chore (parents only)
  deleteChore: async (id: number): Promise<void> => {
    await apiService.api.delete(`/api/chore/${id}`);
  },
};

