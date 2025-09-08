import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { Producao } from '../types';

interface EditDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producao: Producao, newDates: { dataInicio: string; dataFinal: string }) => void;
  producao: Producao | null;
}

const EditDateModal: React.FC<EditDateModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  producao 
}) => {
  const [dates, setDates] = useState({
    dataInicio: '',
    dataFinal: ''
  });

  useEffect(() => {
    if (isOpen && producao) {
      setDates({
        dataInicio: producao.dataInicio,
        dataFinal: producao.dataFinal
      });
    }
  }, [isOpen, producao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (producao && dates.dataInicio && dates.dataFinal) {
      onSave(producao, dates);
    }
  };

  if (!isOpen || !producao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Datas</h2>
              <p className="text-sm text-gray-600">{producao.referenciaInterna}</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
            <input
              type="date"
              value={dates.dataInicio}
              onChange={(e) => setDates(prev => ({ ...prev, dataInicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
            <input
              type="date"
              value={dates.dataFinal}
              onChange={(e) => setDates(prev => ({ ...prev, dataFinal: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Current Values Display */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Valores Atuais</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Início: {new Date(producao.dataInicio).toLocaleDateString('pt-PT')}</p>
              <p>Final: {new Date(producao.dataFinal).toLocaleDateString('pt-PT')}</p>
            </div>
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
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDateModal;