import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare } from 'lucide-react';
import { Producao } from '../types';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comments: string) => void;
  producao: Producao | null;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  producao 
}) => {
  const [comments, setComments] = useState(producao?.comments || '');

  // Preencher comentários quando o modal abrir
  useEffect(() => {
    if (isOpen && producao) {
      setComments(producao.comments || '');
    } else if (!isOpen) {
      setComments('');
    }
  }, [isOpen, producao]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(comments);
    onClose();
  };

  if (!isOpen || !producao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Comentários</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Informações da Produção */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cliente:</span>
                <span className="ml-2 font-medium text-gray-900">{producao.cliente}</span>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  producao.estado === 'FALTA COMPONENTES' ? 'bg-red-100 text-red-800' :
                  producao.estado === 'Aguarda Componentes' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {producao.estado}
                </span>
              </div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Descrição:</span>
              <p className="text-gray-900 font-medium">{producao.descricao}</p>
            </div>
          </div>

          {/* Área de Comentários */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentários sobre Componentes
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={8}
              placeholder="Adicione comentários sobre o estado dos componentes, fornecedores, prazos de entrega, problemas identificados, etc..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Use este espaço para registar informações importantes sobre os componentes
              </p>
              <p className="text-xs text-gray-500">
                {comments.length} caracteres
              </p>
            </div>
          </div>

          {/* Sugestões de Comentários */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Sugestões de Comentários:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setComments(prev => prev + (prev ? '\n\n' : '') + '• Componentes encomendados - aguarda entrega')}
                className="text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                • Componentes encomendados - aguarda entrega
              </button>
              <button
                type="button"
                onClick={() => setComments(prev => prev + (prev ? '\n\n' : '') + '• Falta confirmação de especificações')}
                className="text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                • Falta confirmação de especificações
              </button>
              <button
                type="button"
                onClick={() => setComments(prev => prev + (prev ? '\n\n' : '') + '• Problema com fornecedor - atraso na entrega')}
                className="text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                • Problema com fornecedor - atraso na entrega
              </button>
              <button
                type="button"
                onClick={() => setComments(prev => prev + (prev ? '\n\n' : '') + '• Componentes recebidos - verificar qualidade')}
                className="text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                • Componentes recebidos - verificar qualidade
              </button>
            </div>
          </div>

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
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Comentários</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;