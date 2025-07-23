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
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Format Guidelines:</h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• <strong>JSON:</strong> Array of objects with matching field names</li>
                <li>• <strong>CSV:</strong> First row as headers, subsequent rows as data</li>
                <li>• <strong>XML:</strong> Root element with multiple &lt;item&gt; elements</li>
              </ul>
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