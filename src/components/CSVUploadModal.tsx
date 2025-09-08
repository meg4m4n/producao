import React, { useState } from 'react';
import { X, Upload, FileText, Download, AlertTriangle } from 'lucide-react';
import { Producao } from '../types';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (producoes: Omit<Producao, 'id'>[]) => void;
}

const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(file);
      processCSV(file);
    } else {
      alert('Por favor, selecione apenas ficheiros CSV');
    }
  };

  const processCSV = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      
      setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
    } catch (error) {
      alert('Erro ao processar ficheiro CSV');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
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

  const handleUpload = () => {
    if (!selectedFile || previewData.length === 0) return;

    try {
      const producoes: Omit<Producao, 'id'>[] = previewData.map((row, index) => {
        const nextOP = `OP-${new Date().getFullYear()}-${String(Date.now() + index).slice(-4)}`;
        
        return {
          codigoOP: row.codigo_op || nextOP,
          marca: row.marca || '',
          cliente: row.cliente || '',
          referenciaInterna: row.referencia_interna || `REF-${Date.now()}-${index}`,
          referenciaCliente: row.referencia_cliente || '',
          descricao: row.descricao || '',
          tipoPeca: row.tipo_peca || 'T-Shirt',
          genero: (row.genero as any) || 'Unissexo',
          variantes: [
            {
              cor: row.cor || 'Preto',
              tamanhos: {
                'S': parseInt(row.tamanho_s) || 0,
                'M': parseInt(row.tamanho_m) || 0,
                'L': parseInt(row.tamanho_l) || 0,
                'XL': parseInt(row.tamanho_xl) || 0
              }
            }
          ],
          etapa: (row.etapa as any) || 'Desenvolvimento',
          estado: (row.estado as any) || 'Modelagem',
          dataInicio: row.data_inicio || new Date().toISOString().split('T')[0],
          dataPrevisao: row.data_previsao || '',
          dataFinal: row.data_final || '',
          tempoProducaoEstimado: parseInt(row.tempo_estimado) || 0,
          tempoProducaoReal: parseInt(row.tempo_real) || 0,
          temMolde: row.tem_molde === 'true' || row.tem_molde === '1',
          emProducao: row.em_producao === 'true' || row.em_producao === '1',
          problemas: row.problemas === 'true' || row.problemas === '1',
          localProducao: (row.local_producao as any) || 'Interno',
          empresaExterna: row.empresa_externa || '',
          linkOdoo: row.link_odoo || '',
          comments: row.comments || ''
        };
      });

      onUpload(producoes);
    } catch (error) {
      alert('Erro ao processar dados do CSV');
    }
  };

  const downloadTemplate = () => {
    const template = `codigo_op,marca,cliente,referencia_interna,referencia_cliente,descricao,tipo_peca,genero,cor,tamanho_s,tamanho_m,tamanho_l,tamanho_xl,etapa,estado,data_inicio,data_previsao,data_final,tempo_estimado,tempo_real,tem_molde,em_producao,problemas,local_producao,empresa_externa,link_odoo,comments
OP-2025-0001,Nike,SportZone,NK-001-2025,SZ-NIKE-TT-01,T-shirt básica com logotipo Nike,T-Shirt,Unissexo,Preto,30,50,40,30,Desenvolvimento,Modelagem,2025-01-15,2025-02-28,2025-03-05,45,0,false,true,false,Interno,,https://odoo.example.com/production/1,Aguardando aprovação do protótipo`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_producoes.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload de Produções via CSV</h2>
              <p className="text-sm text-gray-600">Importe múltiplas produções de uma só vez</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">Template CSV</h3>
                <p className="text-sm text-blue-700">Descarregue o template para ver o formato correto</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar Template</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arraste o ficheiro CSV aqui
            </h3>
            <p className="text-gray-600 mb-4">ou</p>
            <label className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>Selecionar Ficheiro CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB • {previewData.length} registos encontrados
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Pré-visualização (primeiros 5 registos)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Marca</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cliente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ref. Interna</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo Peça</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cor</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qtd Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{row.marca}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.cliente}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.referencia_interna}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.tipo_peca}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.cor}</td>
                        <td className="px-4 py-2 text-sm text-center text-gray-900">
                          {(parseInt(row.tamanho_s) || 0) + 
                           (parseInt(row.tamanho_m) || 0) + 
                           (parseInt(row.tamanho_l) || 0) + 
                           (parseInt(row.tamanho_xl) || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-900 mb-1">Importante</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Certifique-se de que os clientes e marcas já existem no sistema</li>
                  <li>• Referências internas devem ser únicas</li>
                  <li>• Datas devem estar no formato AAAA-MM-DD</li>
                  <li>• Valores booleanos devem ser 'true' ou 'false'</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || previewData.length === 0 || isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>
                {isProcessing ? 'Processando...' : `Importar ${previewData.length} Produções`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;