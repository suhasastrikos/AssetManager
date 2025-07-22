import { DeviceProfile } from '../types';
import { BaseService } from './api';

class DeviceProfileService extends BaseService<DeviceProfile> {
  constructor() {
    super('/device-profiles');
  }

  async getByType(deviceType: string): Promise<DeviceProfile[]> {
    const response = await this.getAll({ deviceType });
    return response.data;
  }
}

export const deviceProfileService = new DeviceProfileService();