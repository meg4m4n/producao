import React, { useState, useEffect } from 'react';
import { X, Save, Building } from 'lucide-react';
import { Marca, Cliente } from '../types';

interface MarcaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (marca: Omit<Marca, 'id' | 'clienteNome'>) => void;
  marca?: Marca;
  clientes: Cliente[];
}

const MarcaForm: React.FC<MarcaFormProps> = ({ isOpen, onClose, onSave, marca, clientes }) => {
  const [formData, setFormData] = useState({
    nome: marca?.nome || '',
    clienteId: marca?.clienteId || ''
  });

  // Preencher dados quando estiver a editar
  useEffect(() => {
    if (isOpen && marca) {
      setFormData({
        nome: marca.nome || '',
        clienteId: marca.clienteId || ''
      });
    } else if (isOpen && !marca) {
      // Reset form for new marca
      setFormData({
        nome: '',
        clienteId: ''
      });
    }
  }, [isOpen, marca]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nome.trim() && formData.clienteId) {
      onSave({
        nome: formData.nome.trim(),
        clienteId: formData.clienteId
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {marca ? 'Editar Marca' : 'Nova Marca'}
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
          {/* Nome da Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Marca</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
            />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={formData.clienteId}
              onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecionar cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </select>
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
              <span>{marca ? 'Atualizar' : 'Criar'} Marca</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarcaForm;