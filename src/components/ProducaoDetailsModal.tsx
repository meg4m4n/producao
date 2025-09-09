import React from 'react';
import { X, Package, ExternalLink, Building, MapPin, AlertTriangle, Clock, Printer, Edit, Save } from 'lucide-react';
import { Producao } from '../types';

interface ProducaoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  producao: Producao | null;
  onUpdateFlags?: (flags: { problemas?: boolean; emProducao?: boolean }) => void;
  onUpdateComments?: (comments: string) => void;
}

const ProducaoDetailsModal: React.FC<ProducaoDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  producao,
  onUpdateFlags,
  onUpdateComments
}) => {
  const [editingComments, setEditingComments] = React.useState(false);
  const [commentsText, setCommentsText] = React.useState('');

  React.useEffect(() => {
    if (producao) {
      setCommentsText(producao.comments || '');
    }
  }, [producao]);

  const handleSaveComments = () => {
    if (onUpdateComments) {
      onUpdateComments(commentsText);
      setEditingComments(false);
    }
  };

  if (!isOpen || !producao) return null;

  const handlePrint = () => {
    const quantidadeTotal = producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);

    const todosTamanhos = Array.from(
      new Set(
        producao.variantes.flatMap(v => Object.keys(v.tamanhos))
      )
    ).sort();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resumo de Produção - ${producao.referenciaInterna}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .company { font-size: 24px; font-weight: bold; color: #333; }
            .contact { font-size: 14px; color: #666; margin-top: 5px; }
            .date { font-size: 12px; color: #666; margin-top: 5px; }
            .content { margin-top: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total { font-weight: bold; background-color: #f0f8ff; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status-green { background-color: #d4edda; color: #155724; }
            .status-red { background-color: #f8d7da; color: #721c24; }
            .status-yellow { background-color: #fff3cd; color: #856404; }
            .status-blue { background-color: #d1ecf1; color: #0c5460; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">LOMARTEX</div>
            <div class="contact">info@lomartex.pt</div>
            <div class="date">${new Date().toLocaleDateString('pt-PT')} - ${new Date().toLocaleTimeString('pt-PT')}</div>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">Resumo de Produção</div>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <span class="label">Referência Interna:</span>
                    <span class="value">${producao.referenciaInterna}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Referência Cliente:</span>
                    <span class="value">${producao.referenciaCliente}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Marca:</span>
                    <span class="value">${producao.marca}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Cliente:</span>
                    <span class="value">${producao.cliente}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Tipo de Peça:</span>
                    <span class="value">${producao.tipoPeca}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Género:</span>
                    <span class="value">${producao.genero}</span>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <span class="label">Etapa:</span>
                    <span class="value status status-blue">${producao.etapa}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Estado:</span>
                    <span class="value status ${producao.estado === 'FALTA COMPONENTES' ? 'status-yellow' : 'status-green'}">${producao.estado}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Data Início:</span>
                    <span class="value">${new Date(producao.dataInicio).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Data Entrega:</span>
                    <span class="value">${new Date(producao.dataEstimadaEntrega).toLocaleDateString('pt-PT')}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Local Produção:</span>
                    <p className="text-gray-900">{producao.tempoProducaoEstimado} minutos</p>
                  </div>
                  <div class="info-item">
                    <span class="label">Quantidade Total:</span>
                    <p className="text-gray-900">{producao.tempoProducaoReal || 0} minutos</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Descrição</div>
              <p>${producao.descricao}</p>
            </div>

            <div class="section">
              <div class="section-title">Grelha de Quantidades</div>
              <table>
                <thead>
                  <tr>
                    <th>Cor</th>
                    ${todosTamanhos.map(tamanho => `<th>${tamanho}</th>`).join('')}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${producao.variantes.map(variante => {
                    const totalVariante = Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
                    return `
                      <tr>
                        <td>${variante.cor}</td>
                        ${todosTamanhos.map(tamanho => `<td>${variante.tamanhos[tamanho] || '-'}</td>`).join('')}
                        <td class="total">${totalVariante}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr class="total">
                    <td><strong>Total</strong></td>
                    ${todosTamanhos.map(tamanho => {
                      const totalTamanho = producao.variantes.reduce((sum, variante) => 
                        sum + (variante.tamanhos[tamanho] || 0), 0
                      );
                      return `<td><strong>${totalTamanho || '-'}</strong></td>`;
                    }).join('')}
                    <td class="total"><strong>${quantidadeTotal}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            ${producao.comments ? `
              <div class="section">
                <div class="section-title">Comentários</div>
                <p style="white-space: pre-wrap;">${producao.comments}</p>
              </div>
            ` : ''}

            ${producao.linkOdoo ? `
              <div class="section">
                <div class="section-title">Link Odoo</div>
                <p>${producao.linkOdoo}</p>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

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
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Imprimir resumo"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 print-content">
          {/* Production Summary for Print */}
          <div className="hidden print:block">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">LOMARTEX</h1>
              <p className="text-sm text-gray-600">Resumo de Produção</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleDateString('pt-PT')}</p>
            </div>
          </div>

          {/* Quick Action Flags */}
          <div className="bg-gray-50 rounded-lg p-4 print:hidden">
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
                    onUpdateFlags?.({ faltaComponentes: e.target.checked });
                  }}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="falta-componentes-detail" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span>Falta Componentes</span>
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

          {/* Comentários para Impressão */}
          {producao.comments && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Comentários</h3>
                {!editingComments && onUpdateComments && (
                  <button
                    onClick={() => setEditingComments(true)}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors print:hidden"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {editingComments ? (
                  <div className="space-y-3">
                    <textarea
                      value={commentsText}
                      onChange={(e) => setCommentsText(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Adicione comentários sobre a produção..."
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingComments(false);
                          setCommentsText(producao.comments || '');
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveComments}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        <span>Guardar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{producao.comments}</p>
                )}
              </div>
            </div>
          )}

          {/* Botão de Fechar */}
          <div className="flex justify-end pt-4 border-t border-gray-200 print:hidden">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
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