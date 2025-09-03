import React from 'react';
import { X, Clock, MessageSquare, Upload, FileText, CheckCircle, Edit } from 'lucide-react';
import { ComponenteHistorico } from '../types';

interface ComponenteHistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  producaoRef: string;
  historico: ComponenteHistorico[];
}

const ComponenteHistoricoModal: React.FC<ComponenteHistoricoModalProps> = ({ 
  isOpen, 
  onClose, 
  producaoRef,
  historico 
}) => {
  if (!isOpen) return null;

  const getIconForTipo = (tipo: ComponenteHistorico['tipo']) => {
    switch (tipo) {
      case 'comentario':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'upload_bom':
        return <Upload className="w-4 h-4 text-green-600" />;
      case 'remover_bom':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'marcar_completo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'estado_alterado':
        return <Edit className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getColorForTipo = (tipo: ComponenteHistorico['tipo']) => {
    switch (tipo) {
      case 'comentario':
        return 'bg-blue-50 border-blue-200';
      case 'upload_bom':
        return 'bg-green-50 border-green-200';
      case 'remover_bom':
        return 'bg-red-50 border-red-200';
      case 'marcar_completo':
        return 'bg-green-50 border-green-200';
      case 'estado_alterado':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Histórico de Componentes</h2>
              <p className="text-sm text-gray-600">{producaoRef}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Timeline */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {historico.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico disponível</h3>
              <p className="text-gray-500">As ações relacionadas com componentes aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item, index) => (
                <div key={item.id} className={`border rounded-lg p-4 ${getColorForTipo(item.tipo)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIconForTipo(item.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{item.descricao}</p>
                        <span className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-600">Por: {item.usuario}</p>
                      {item.detalhes && (
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(item.detalhes, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponenteHistoricoModal;