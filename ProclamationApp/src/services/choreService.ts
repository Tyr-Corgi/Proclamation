import api from './api';
import { Chore, CreateChoreRequest, UpdateChoreStatusRequest } from '../types/chore';

export const choreService = {
  // Get all chores for the family
  getChores: async (): Promise<Chore[]> => {
    const response = await api.get('/chore');
    return response.data.chores;
  },

  // Get a specific chore by ID
  getChore: async (id: number): Promise<Chore> => {
    const response = await api.get(`/chore/${id}`);
    return response.data;
  },

  // Create a new chore (parents only)
  createChore: async (data: CreateChoreRequest): Promise<Chore> => {
    const response = await api.post('/chore', data);
    return response.data.chore;
  },

  // Claim an available chore
  claimChore: async (id: number): Promise<void> => {
    await api.post(`/chore/${id}/claim`);
  },

  // Submit chore for approval
  completeChore: async (id: number, completionNotes?: string): Promise<void> => {
    await api.post(`/chore/${id}/complete`, {
      completionNotes,
    });
  },

  // Approve a completed chore (parents only)
  approveChore: async (id: number): Promise<{ reward: number }> => {
    const response = await api.post(`/chore/${id}/approve`);
    return response.data;
  },

  // Reject a completed chore (parents only)
  rejectChore: async (id: number): Promise<void> => {
    await api.post(`/chore/${id}/reject`);
  },

  // Delete a chore (parents only)
  deleteChore: async (id: number): Promise<void> => {
    await api.delete(`/chore/${id}`);
  },
};

