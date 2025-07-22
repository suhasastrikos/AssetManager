import { DatabaseConfig, DatabaseConnection } from '../types';
import { api } from './api';

class DatabaseService {
  async testConnection(config: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/database/test-connection', config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Connection failed'
      };
    }
  }

  async connect(config: DatabaseConfig): Promise<DatabaseConnection> {
    const response = await api.post('/database/connect', config);
    return response.data;
  }

  async disconnect(): Promise<void> {
    await api.post('/database/disconnect');
  }

  async getConnectionStatus(): Promise<DatabaseConnection> {
    const response = await api.get('/database/status');
    return response.data;
  }
}

export const databaseService = new DatabaseService();