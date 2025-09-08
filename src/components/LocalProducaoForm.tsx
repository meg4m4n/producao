import React, { useState, useEffect } from 'react';
import { X, Save, Building, MapPin } from 'lucide-react';
import { LocalProducao } from '../types';

interface LocalProducaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (local: Omit<LocalProducao, 'id' | 'created_at' | 'updated_at'>) => void;
  local?: LocalProducao;
}

const LocalProducaoForm: React.FC<LocalProducaoFormProps> = ({ isOpen, onClose, onSave, local }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Interno' as 'Interno' | 'Externo',
    endereco: '',
    contacto: '',
    ativo: true
  });

  useEffect(() => {
    if (isOpen && local) {
      setFormData({
        nome: local.nome || '',
        tipo: local.tipo || 'Interno',
        endereco: local.endereco || '',
        contacto: local.contacto || '',
        ativo: local.ativo
      });
    } else if (isOpen && !local) {
      setFormData({
        nome: '',
        tipo: 'Interno',
        endereco: '',
        contacto: '',
        ativo: true
      });
    }
  }, [isOpen, local]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome.trim()) {
      onSave({
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        endereco: formData.endereco.trim(),
        contacto: formData.contacto.trim(),
        ativo: formData.ativo
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
            {formData.tipo === 'Interno' ? (
              <Building className="w-6 h-6 text-blue-600" />
            ) : (
              <MapPin className="w-6 h-6 text-orange-600" />
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {local ? 'Editar Local de Produção' : 'Novo Local de Produção'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Local</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
              placeholder="Ex: Lomartex - Sede, TextilPro Lda..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'Interno' | 'Externo' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Interno">Interno</option>
              <option value="Externo">Externo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Endereço (opcional)</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Endereço completo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contacto (opcional)</label>
            <input
              type="text"
              value={formData.contacto}
              onChange={(e) => setFormData(prev => ({ ...prev, contacto: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email ou telefone..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
              Local Ativo
            </label>
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
              <span>{local ? 'Atualizar' : 'Criar'} Local</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocalProducaoForm;