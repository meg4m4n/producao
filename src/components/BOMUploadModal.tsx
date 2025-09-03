import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Plus, Trash2 } from 'lucide-react';
import { Producao, BOMFile } from '../types';

interface BOMUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: BOMFile[]) => void;
  producao: Producao | null;
}

const BOMUploadModal: React.FC<BOMUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  producao 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Reset selected files when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setIsDragging(false);
    }
  }, [isOpen]);
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) return;

    // Simular upload real - em produção seria enviado para servidor
    const bomFiles: BOMFile[] = selectedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: `https://storage.example.com/bom/${file.name}`, // URL simulado
      uploadDate: new Date().toISOString()
    }));

    // Simular delay de upload
    setTimeout(() => {
      onUpload(bomFiles);
      setSelectedFiles([]);
      onClose();
      
      // Mostrar feedback de sucesso
      alert(`${bomFiles.length} ficheiro(s) BOM enviado(s) com sucesso!`);
    }, 1000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !producao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload de Ficheiros BOM</h2>
              <p className="text-sm text-gray-600">{producao.referenciaInterna} - {producao.marca}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arraste ficheiros PDF aqui
            </h3>
            <p className="text-gray-600 mb-4">ou</p>
            <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Selecionar Ficheiros</span>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Apenas ficheiros PDF são aceites</p>
          </div>

          {/* Lista de Ficheiros Selecionados */}
          {selectedFiles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Ficheiros Selecionados ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ficheiros Existentes */}
          {(producao.bomFiles || []).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Ficheiros Existentes ({producao.bomFiles?.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {(producao.bomFiles || []).map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedFiles.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>Enviar Ficheiros ({selectedFiles.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BOMUploadModal;