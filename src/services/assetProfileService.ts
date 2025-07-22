import { AssetProfile } from '../types';
import { BaseService } from './api';

class AssetProfileService extends BaseService<AssetProfile> {
  constructor() {
    super('/asset-profiles');
  }

  async getByCategory(category: string): Promise<AssetProfile[]> {
    const response = await this.getAll({ category });
    return response.data;
  }
}

export const assetProfileService = new AssetProfileService();