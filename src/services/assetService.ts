import { Asset } from '../types';
import { BaseService } from './api';

class AssetService extends BaseService<Asset> {
  constructor() {
    super('/assets');
  }

  async getByProfileId(assetProfileId: string): Promise<Asset[]> {
    const response = await this.getAll({ assetProfileId });
    return response.data;
  }

  async getByStatus(status: string): Promise<Asset[]> {
    const response = await this.getAll({ status });
    return response.data;
  }
}

export const assetService = new AssetService();