import { apiService } from './api.service';
import { Allowance, CreateAllowanceRequest, UpdateAllowanceRequest } from '../types/allowance';

export const allowanceService = {
  // Get all allowances for the family
  getAllowances: async (): Promise<Allowance[]> => {
    const response = await apiService.api.get('/api/allowance');
    return response.data.allowances;
  },

  // Get a specific allowance by ID
  getAllowance: async (id: number): Promise<Allowance> => {
    const response = await apiService.api.get(`/api/allowance/${id}`);
    return response.data;
  },

  // Create a new allowance (parents only)
  createAllowance: async (data: CreateAllowanceRequest): Promise<Allowance> => {
    const response = await apiService.api.post('/api/allowance', data);
    return response.data.allowance;
  },

  // Update an allowance (parents only)
  updateAllowance: async (id: number, data: UpdateAllowanceRequest): Promise<void> => {
    await apiService.api.put(`/api/allowance/${id}`, data);
  },

  // Delete an allowance (parents only)
  deleteAllowance: async (id: number): Promise<void> => {
    await apiService.api.delete(`/api/allowance/${id}`);
  },

  // Manually process allowances (parents only)
  processAllowances: async (): Promise<{ count: number }> => {
    const response = await apiService.api.post('/api/allowance/process');
    return response.data;
  },
};

