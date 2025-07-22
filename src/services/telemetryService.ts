import { TelemetryData, TelemetryResponse } from '../types';
import { api } from './api';

class TelemetryService {
  async getLatestTelemetry(entityId: string, entityType: 'ASSET' | 'DEVICE', keys?: string[]): Promise<TelemetryResponse> {
    const params = keys ? { keys: keys.join(',') } : {};
    const response = await api.get(`/telemetry/${entityType}/${entityId}/values/timeseries`, { params });
    return response.data;
  }

  async getTelemetryHistory(
    entityId: string, 
    entityType: 'ASSET' | 'DEVICE', 
    keys: string[], 
    startTs: number, 
    endTs: number,
    interval?: number,
    limit?: number
  ): Promise<TelemetryResponse> {
    const params = {
      keys: keys.join(','),
      startTs,
      endTs,
      interval,
      limit
    };
    const response = await api.get(`/telemetry/${entityType}/${entityId}/values/timeseries`, { params });
    return response.data;
  }

  async saveTelemetry(entityId: string, entityType: 'ASSET' | 'DEVICE', data: Record<string, any>): Promise<void> {
    await api.post(`/telemetry/${entityType}/${entityId}`, data);
  }

  async deleteTelemetry(entityId: string, entityType: 'ASSET' | 'DEVICE', keys: string[], startTs?: number, endTs?: number): Promise<void> {
    const params = {
      keys: keys.join(','),
      startTs,
      endTs
    };
    await api.delete(`/telemetry/${entityType}/${entityId}/timeseries/delete`, { params });
  }
}

export const telemetryService = new TelemetryService();