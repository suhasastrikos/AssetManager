import { Attribute } from '../types';
import { BaseService } from './api';

class AttributeService extends BaseService<Attribute> {
  constructor() {
    super('/attributes');
  }

  async getByEntity(entityId: string, entityType: 'ASSET' | 'DEVICE', scope?: string): Promise<Attribute[]> {
    const response = await this.getAll({ entityId, entityType, scope });
    return response.data;
  }

  async saveAttribute(entityId: string, entityType: 'ASSET' | 'DEVICE', scope: string, key: string, value: any): Promise<void> {
    await this.api.post(`${this.endpoint}/${entityType}/${entityId}/${scope}`, { [key]: value });
  }

  async deleteAttribute(entityId: string, entityType: 'ASSET' | 'DEVICE', scope: string, key: string): Promise<void> {
    await this.api.delete(`${this.endpoint}/${entityType}/${entityId}/${scope}/${key}`);
  }
}

export const attributeService = new AttributeService();