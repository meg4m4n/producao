import React, { useState } from 'react';
import { X, Save, Users, Plus, Trash2 } from 'lucide-react';
import { Cliente } from '../types';

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Omit<Cliente, 'id'>) => void;
  cliente?: Cliente;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ isOpen, onClose, onSave, cliente }) => {
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    marcas: cliente?.marcas || ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const marcasFiltradas = formData.marcas.filter(marca => marca.trim() !== '');
    if (formData.nome.trim() && marcasFiltradas.length > 0) {
      onSave({
        nome: formData.nome.trim(),
        marcas: marcasFiltradas
      });
      onClose();
    }
  };

  const addMarca = () => {
    setFormData(prev => ({
      ...prev,
      marcas: [...prev.marcas, '']
    }));
  };

  const removeMarca = (index: number) => {
    setFormData(prev => ({
      ...prev,
      marcas: prev.marcas.filter((_, i) => i !== index)
    }));
  };

  const updateMarca = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      marcas: prev.marcas.map((marca, i) => i === index ? value : marca)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {cliente ? 'Editar Cliente' : 'Novo Cliente'}
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
          {/* Nome do Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cliente</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
            />
          </div>

          {/* Marcas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Marcas</label>
              <button
                type="button"
                onClick={addMarca}
                className="flex items-center space-x-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Adicionar</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.marcas.map((marca, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={marca}
                    onChange={(e) => updateMarca(index, e.target.value)}
                    placeholder="Nome da marca"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={index === 0}
                  />
                  {formData.marcas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMarca(index)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
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
              <span>{cliente ? 'Atualizar' : 'Criar'} Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;