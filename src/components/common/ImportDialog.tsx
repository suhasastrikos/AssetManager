import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[], format: string) => Promise<void>;
  entityType: string;
  sampleData: any;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  entityType,
  sampleData,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const supportedFormats = [
    { ext: '.json', type: 'application/json', label: 'JSON' },
    { ext: '.csv', type: 'text/csv', label: 'CSV' },
    { ext: '.xml', type: 'text/xml', label: 'XML' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      data.push(obj);
    }
    
    return data;
  };

  const parseXML = (text: string): any[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML format');
    }
    
    const items = xmlDoc.getElementsByTagName('item');
    const data = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const obj: any = {};
      
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j];
        obj[child.tagName] = child.textContent || '';
      }
      
      data.push(obj);
    }
    
    return data;
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await selectedFile.text();
      let data: any[] = [];
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();

      switch (fileExtension) {
        case 'json':
          data = JSON.parse(text);
          if (!Array.isArray(data)) {
            throw new Error('JSON must contain an array of objects');
          }
          break;
        case 'csv':
          data = parseCSV(text);
          break;
        case 'xml':
          data = parseXML(text);
          break;
        default:
          throw new Error('Unsupported file format');
      }

      if (data.length === 0) {
        throw new Error('No data found in file');
      }

      await onImport(data, fileExtension || 'unknown');
      setSuccess(`Successfully imported ${data.length} ${entityType.toLowerCase()}(s)`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadSample = (format: string) => {
    let content = '';
    let mimeType = '';
    let filename = '';

    switch (format) {
      case 'json':
        content = JSON.stringify([sampleData], null, 2);
        mimeType = 'application/json';
        filename = `sample-${entityType.toLowerCase()}.json`;
        break;
      case 'csv':
        const headers = Object.keys(sampleData).join(',');
        const values = Object.values(sampleData).map(v => `"${v}"`).join(',');
        content = `${headers}\n${values}`;
        mimeType = 'text/csv';
        filename = `sample-${entityType.toLowerCase()}.csv`;
        break;
      case 'xml':
        const xmlItems = Object.entries(sampleData)
          .map(([key, value]) => `    <${key}>${value}</${key}>`)
          .join('\n');
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item>\n${xmlItems}\n  </item>\n</root>`;
        mimeType = 'text/xml';
        filename = `sample-${entityType.toLowerCase()}.xml`;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRequiredFields = () => {
    const fieldMappings = {
      'Asset Profiles': [
        '• name (string) - Profile name',
        '• description (string) - Detailed description',
        '• type (string) - Asset type (Building, Room, Floor, Vehicle, Equipment, etc.)',
        '• manufacturer (string) - Manufacturer name',
        '• model (string) - Model number/name',
        '• specifications (string) - Technical specifications'
      ],
      'Device Profiles': [
        '• name (string) - Profile name',
        '• description (string) - Detailed description',
        '• deviceType (string) - Device type (Sensor, Gateway, Controller, etc.)',
        '• manufacturer (string) - Manufacturer name',
        '• model (string) - Model number/name',
        '• firmwareVersion (string) - Firmware version',
        '• transportType (string) - Transport protocol (MQTT, HTTP, CoAP, LWM2M)',
        '• specifications (string) - Technical specifications'
      ],
      'Assets': [
        '• name (string) - Asset name',
        '• description (string) - Detailed description',
        '• label (string) - Unique asset label/identifier',
        '• assetProfileId (string) - ID of the asset profile to use',
        '• type (string) - Asset type',
        '• parentAssetId (string, optional) - ID of parent asset for hierarchy'
      ],
      'Devices': [
        '• name (string) - Device name',
        '• description (string) - Detailed description',
        '• label (string) - Unique device label/identifier',
        '• deviceProfileId (string) - ID of the device profile to use',
        '• assetId (string) - ID of the parent asset',
        '• type (string) - Device type'
      ]
    };

    const fields = fieldMappings[entityType as keyof typeof fieldMappings] || [];
    return (
      <ul className="space-y-1">
        {fields.map((field, index) => (
          <li key={index}>{field}</li>
        ))}
      </ul>
    );
  };

  const getJsonExample = () => {
    const examples = {
      'Asset Profiles': `[
  {
    "name": "Smart Building Profile",
    "description": "Profile for smart office buildings",
    "type": "Building",
    "manufacturer": "ACME Corp",
    "model": "SmartBuild-2024",
    "specifications": "IoT-enabled with sensors and automation"
  }
]`,
      'Device Profiles': `[
  {
    "name": "Temperature Sensor Profile",
    "description": "Profile for temperature monitoring devices",
    "deviceType": "Sensor",
    "manufacturer": "SensorTech",
    "model": "TEMP-2024",
    "firmwareVersion": "1.0.0",
    "transportType": "MQTT",
    "specifications": "Range: -40°C to 85°C, Accuracy: ±0.5°C"
  }
]`,
      'Assets': `[
  {
    "name": "Main Office Building",
    "description": "Primary office building with smart systems",
    "label": "BLDG-001",
    "assetProfileId": "profile-uuid-here",
    "type": "Building"
  }
]`,
      'Devices': `[
  {
    "name": "Lobby Temperature Sensor",
    "description": "Temperature sensor in main lobby",
    "label": "TEMP-LOBBY-001",
    "deviceProfileId": "device-profile-uuid-here",
    "assetId": "asset-uuid-here",
    "type": "Sensor"
  }
]`
    };
    return examples[entityType as keyof typeof examples] || '';
  };

  const getCsvExample = () => {
    const examples = {
      'Asset Profiles': `name,description,type,manufacturer,model,specifications
"Smart Building Profile","Profile for smart office buildings","Building","ACME Corp","SmartBuild-2024","IoT-enabled with sensors and automation"`,
      'Device Profiles': `name,description,deviceType,manufacturer,model,firmwareVersion,transportType,specifications
"Temperature Sensor Profile","Profile for temperature monitoring devices","Sensor","SensorTech","TEMP-2024","1.0.0","MQTT","Range: -40°C to 85°C, Accuracy: ±0.5°C"`,
      'Assets': `name,description,label,assetProfileId,type,parentAssetId
"Main Office Building","Primary office building with smart systems","BLDG-001","profile-uuid-here","Building",""`,
      'Devices': `name,description,label,deviceProfileId,assetId,type
"Lobby Temperature Sensor","Temperature sensor in main lobby","TEMP-LOBBY-001","device-profile-uuid-here","asset-uuid-here","Sensor"`
    };
    return examples[entityType as keyof typeof examples] || '';
  };

  const getXmlExample = () => {
    const examples = {
      'Asset Profiles': `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>
    <name>Smart Building Profile</name>
    <description>Profile for smart office buildings</description>
    <type>Building</type>
    <manufacturer>ACME Corp</manufacturer>
    <model>SmartBuild-2024</model>
    <specifications>IoT-enabled with sensors and automation</specifications>
  </item>
</root>`,
      'Device Profiles': `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>
    <name>Temperature Sensor Profile</name>
    <description>Profile for temperature monitoring devices</description>
    <deviceType>Sensor</deviceType>
    <manufacturer>SensorTech</manufacturer>
    <model>TEMP-2024</model>
    <firmwareVersion>1.0.0</firmwareVersion>
    <transportType>MQTT</transportType>
    <specifications>Range: -40°C to 85°C, Accuracy: ±0.5°C</specifications>
  </item>
</root>`,
      'Assets': `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>
    <name>Main Office Building</name>
    <description>Primary office building with smart systems</description>
    <label>BLDG-001</label>
    <assetProfileId>profile-uuid-here</assetProfileId>
    <type>Building</type>
    <parentAssetId></parentAssetId>
  </item>
</root>`,
      'Devices': `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>
    <name>Lobby Temperature Sensor</name>
    <description>Temperature sensor in main lobby</description>
    <label>TEMP-LOBBY-001</label>
    <deviceProfileId>device-profile-uuid-here</deviceProfileId>
    <assetId>asset-uuid-here</assetId>
    <type>Sensor</type>
  </item>
</root>`
    };
    return examples[entityType as keyof typeof examples] || '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Import {entityType}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload JSON, CSV, or XML files
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sample Downloads */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Download Sample Files:</h4>
              <div className="flex space-x-2">
                {supportedFormats.map((format) => (
                  <button
                    key={format.ext}
                    onClick={() => downloadSample(format.label.toLowerCase())}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.xml"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{success}</span>
                </div>
              </div>
            )}

            {/* Format Guidelines */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Required Fields for {entityType}:</h4>
              <div className="text-xs text-blue-700 space-y-2">
                {getRequiredFields()}
                
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <h5 className="font-medium mb-2">Format Examples:</h5>
                  <div className="space-y-2">
                    <div>
                      <strong>JSON:</strong> Array of objects
                      <pre className="mt-1 p-2 bg-blue-100 rounded text-xs overflow-x-auto">
{getJsonExample()}
                      </pre>
                    </div>
                    <div>
                      <strong>CSV:</strong> Header row + data rows
                      <pre className="mt-1 p-2 bg-blue-100 rounded text-xs overflow-x-auto">
{getCsvExample()}
                      </pre>
                    </div>
                    <div>
                      <strong>XML:</strong> Root with item elements
                      <pre className="mt-1 p-2 bg-blue-100 rounded text-xs overflow-x-auto">
{getXmlExample()}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};