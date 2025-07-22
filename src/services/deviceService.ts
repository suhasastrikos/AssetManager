import { Device } from '../types';
import { BaseService } from './api';

class DeviceService extends BaseService<Device> {
  constructor() {
    super('/devices');
  }

  async getByAssetId(assetId: string): Promise<Device[]> {
    const response = await this.getAll({ assetId });
    return response.data;
  }

  async getByProfileId(deviceProfileId: string): Promise<Device[]> {
    const response = await this.getAll({ deviceProfileId });
    return response.data;
  }

  async getByStatus(status: string): Promise<Device[]> {
    const response = await this.getAll({ status });
    return response.data;
  }
}

export const deviceService = new DeviceService();