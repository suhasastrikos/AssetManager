export interface AssetProfile {
  id: string;
  name: string;
  description: string;
  type: string;
  manufacturer: string;
  model: string;
  specifications: string;
  defaultAttributes: Record<string, any>;
  rules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeviceProfile {
  id: string;
  name: string;
  description: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  transportType: 'HTTP' | 'MQTT' | 'CoAP' | 'LWM2M';
  specifications: string;
  defaultAttributes: Record<string, any>;
  alarmRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  label: string;
  assetProfileId: string;
  assetProfile?: AssetProfile;
  parentAssetId?: string;
  parentAsset?: Asset;
  type: string;
  attributes: Record<string, any>;
  additionalInfo: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  description: string;
  label: string;
  deviceProfileId: string;
  deviceProfile?: DeviceProfile;
  assetId: string;
  asset?: Asset;
  type: string;
  attributes: Record<string, any>;
  credentials: {
    credentialsType: 'ACCESS_TOKEN' | 'MQTT_BASIC' | 'X509_CERTIFICATE';
    credentialsId: string;
  };
  additionalInfo: Record<string, any>;
  isActive: boolean;
  lastActivityTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attribute {
  id: string;
  entityId: string;
  entityType: 'ASSET' | 'DEVICE';
  scope: 'CLIENT_SCOPE' | 'SERVER_SCOPE' | 'SHARED_SCOPE';
  key: string;
  value: any;
  lastUpdateTs: number;
}

export interface TelemetryData {
  entityId: string;
  entityType: 'ASSET' | 'DEVICE';
  key: string;
  ts: number;
  value: any;
}

export interface TelemetryResponse {
  [key: string]: Array<{
    ts: number;
    value: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface DatabaseConnection {
  isConnected: boolean;
  config?: DatabaseConfig;
  connectionTime?: string;
}