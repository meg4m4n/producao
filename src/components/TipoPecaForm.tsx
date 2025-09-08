import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { TipoPeca } from '../types';

interface TipoPecaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tipoPeca: Omit<TipoPeca, 'id' | 'created_at' | 'updated_at'>) => void;
  tipoPeca?: TipoPeca;
}

const TipoPecaForm: React.FC<TipoPecaFormProps> = ({ isOpen, onClose, onSave, tipoPeca }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  useEffect(() => {
    if (isOpen && tipoPeca) {
      setFormData({
        nome: tipoPeca.nome || '',
        descricao: tipoPeca.descricao || ''
      });
    } else if (isOpen && !tipoPeca) {
      setFormData({
        nome: '',
        descricao: ''
      });
    }
  }, [isOpen, tipoPeca]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome.trim()) {
      onSave({
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim()
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {tipoPeca ? 'Editar Tipo de Peça' : 'Novo Tipo de Peça'}
            </h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Tipo</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
              placeholder="Ex: T-Shirt, Hoodie, Polo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Descrição detalhada do tipo de peça..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{tipoPeca ? 'Atualizar' : 'Criar'} Tipo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TipoPecaForm;