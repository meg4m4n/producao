import React from 'react';
import { AlertTriangle, Package, Clock, File, DollarSign } from 'lucide-react';
import { Producao } from '../../types';

interface ProducaoFlagsProps {
  producao: Producao;
  onFlagChange: (flag: 'problemas' | 'emProducao' | 'faltaComponentes' | 'faturado' | 'pago', value: boolean) => void;
}

const ProducaoFlags: React.FC<ProducaoFlagsProps> = ({ producao, onFlagChange }) => {
  return (
    <div className="absolute top-2 right-2 flex flex-col space-y-1">
      {/* Problemas */}
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          id={`problemas-${producao.id}`}
          checked={producao.problemas || false}
          onChange={(e) => onFlagChange('problemas', e.target.checked)}
          className="w-3 h-3 text-red-600 border-gray-300 rounded focus:ring-red-500"
        />
        <AlertTriangle 
          className={`w-3 h-3 ${producao.problemas ? 'text-red-600' : 'text-gray-300'}`}
          title="Marcar como tendo problemas"
        />
      </div>

      {/* Em Produção */}
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          id={`producao-${producao.id}`}
          checked={producao.emProducao || false}
          onChange={(e) => onFlagChange('emProducao', e.target.checked)}
          className="w-3 h-3 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <Package 
          className={`w-3 h-3 ${producao.emProducao ? 'text-green-600' : 'text-gray-300'}`}
          title="Marcar como em produção"
        />
      </div>

      {/* Falta Componentes */}
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          id={`falta-componentes-${producao.id}`}
          checked={producao.estado === 'FALTA COMPONENTES'}
          onChange={(e) => onFlagChange('faltaComponentes', e.target.checked)}
          className="w-3 h-3 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
        />
        <Clock 
          className={`w-3 h-3 ${producao.estado === 'FALTA COMPONENTES' ? 'text-yellow-600' : 'text-gray-300'}`}
          title="Marcar como falta componentes"
        />
      </div>

      {/* Faturado */}
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          id={`faturado-${producao.id}`}
          checked={producao.faturado || false}
          onChange={(e) => onFlagChange('faturado', e.target.checked)}
          className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <File
          className={`w-3 h-3 ${producao.faturado ? 'text-blue-600' : 'text-gray-300'}`}
          title="Marcar como faturado"
        />
      </div>

      {/* Pago */}
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          id={`pago-${producao.id}`}
          checked={producao.pago || false}
          onChange={(e) => onFlagChange('pago', e.target.checked)}
          className="w-3 h-3 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <DollarSign
          className={`w-3 h-3 ${producao.pago ? 'text-green-600' : 'text-gray-300'}`}
          title="Marcar como pago"
        />
      </div>
    </div>
  );
};

export default ProducaoFlags;