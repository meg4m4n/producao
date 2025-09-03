import React from 'react';
import { Shield, Wrench } from 'lucide-react';

const ControloQualidade: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controlo de Qualidade</h1>
            <p className="text-gray-600">Sistema de gestão e controlo de qualidade</p>
          </div>
        </div>
      </div>

      {/* Development Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <div className="text-center">
          <Wrench className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">EM DESENVOLVIMENTO</h2>
          <p className="text-yellow-800 text-lg">
            Esta funcionalidade está atualmente em desenvolvimento e estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControloQualidade;