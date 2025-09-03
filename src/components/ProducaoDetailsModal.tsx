import React from 'react';
import { X, Package, ExternalLink, Building, MapPin, AlertTriangle } from 'lucide-react';
import { Producao } from '../types';

interface ProducaoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  producao: Producao | null;
  onUpdateFlags?: (flags: { problemas?: boolean; emProducao?: boolean }) => void;
}

const ProducaoDetailsModal: React.FC<ProducaoDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  producao,
  onUpdateFlags
}) => {
  if (!isOpen || !producao) return null;

  const quantidadeTotal = producao.variantes.reduce((total, variante) => {
    return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
  }, 0);

  const todosTamanhos = Array.from(
    new Set(
      producao.variantes.flatMap(v => Object.keys(v.tamanhos))
    )
  ).sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Registo Completo - {producao.referenciaInterna}</h2>
              <p className="text-gray-600">{producao.marca} • {producao.cliente}</p>
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
          {/* Quick Action Flags */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Estado Rápido</h3>
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="problemas-detail"
                  checked={producao.problemas || false}
                  onChange={(e) => {
                    onUpdateFlags?.({ problemas: e.target.checked });
                    // Update local state immediately for visual feedback
                    if (producao) {
                      producao.problemas = e.target.checked;
                    }
                  }}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="problemas-detail" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Com Problemas</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="producao-detail"
                  checked={producao.emProducao || false}
                  onChange={(e) => {
                    onUpdateFlags?.({ emProducao: e.target.checked });
                    // Update local state immediately for visual feedback
                    if (producao) {
                      producao.emProducao = e.target.checked;
                    }
                  }}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="producao-detail" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Package className="w-4 h-4 text-green-600" />
                  <span>Em Produção</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="falta-componentes-detail"
                  checked={producao.estado === 'FALTA COMPONENTES'}
                  onChange={(e) => {
                    // This checkbox is read-only, showing current state from database
                    // Estado changes should be done through the main form
                  }}
                  disabled
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="falta-componentes-detail" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span>Falta Componentes (Estado atual: {producao.estado})</span>
                </label>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Peça</label>
                <p className="text-gray-900">{producao.tipoPeca}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                <p className="text-gray-900">{producao.genero}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <p className="text-gray-900">{producao.descricao}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referência Cliente</label>
                <p className="text-gray-900">{producao.referenciaCliente}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Total</label>
                <p className="text-2xl font-bold text-blue-600">{quantidadeTotal} unidades</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local de Produção</label>
                <div className="flex items-center space-x-2">
                  {producao.localProducao === 'Interno' ? (
                    <Building className="w-4 h-4 text-blue-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-orange-600" />
                  )}
                  <span className="text-gray-900">
                    {producao.localProducao === 'Interno' ? 'Interno' : (producao.empresaExterna || 'Externo')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grelha de Quantidades */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grelha de Quantidades por Cor/Tamanho</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Cor
                    </th>
                    {todosTamanhos.map(tamanho => (
                      <th key={tamanho} className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                        {tamanho}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {producao.variantes.map((variante, index) => {
                    const totalVariante = Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getColorHex(variante.cor) }} />
                            <span>{variante.cor}</span>
                          </div>
                        </td>
                        {todosTamanhos.map(tamanho => (
                          <td key={tamanho} className="px-4 py-3 text-center text-sm text-gray-900 border-b border-gray-200">
                            {variante.tamanhos[tamanho] || '-'}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center text-sm font-bold text-blue-600 border-b border-gray-200">
                          {totalVariante}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                    {todosTamanhos.map(tamanho => {
                      const totalTamanho = producao.variantes.reduce((sum, variante) => 
                        sum + (variante.tamanhos[tamanho] || 0), 0
                      );
                      return (
                        <td key={tamanho} className="px-4 py-3 text-center text-sm font-bold text-gray-900">
                          {totalTamanho || '-'}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center text-sm font-bold text-blue-600">
                      {quantidadeTotal}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Link do Odoo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link do Odoo</label>
            <div className="flex items-center space-x-3">
              <input
                type="url"
                value={producao.linkOdoo || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                placeholder="Nenhum link configurado"
              />
              {producao.linkOdoo && (
                <a
                  href={producao.linkOdoo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir</span>
                </a>
              )}
            </div>
          </div>

          {/* Botão de Fechar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get color hex values
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Preto': '#000000',
    'Branco': '#FFFFFF',
    'Azul Marinho': '#1e3a8a',
    'Rosa': '#ec4899',
    'Rosa Claro': '#f9a8d4',
    'Cinzento': '#6b7280',
    'Azul': '#3b82f6',
    'Verde': '#10b981',
    'Vermelho': '#ef4444',
    'Amarelo': '#f59e0b'
  };
  return colorMap[colorName] || '#6b7280';
};

export default ProducaoDetailsModal;