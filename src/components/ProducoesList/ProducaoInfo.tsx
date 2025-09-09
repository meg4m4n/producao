import React from 'react';
import { Building, MapPin } from 'lucide-react';
import { Producao } from '../../types';

interface ProducaoInfoProps {
  producao: Producao;
  getQuantidadeTotal: (producao: Producao) => number;
  getTamanhosResumo: (producao: Producao) => string;
}

const ProducaoInfo: React.FC<ProducaoInfoProps> = ({ 
  producao, 
  getQuantidadeTotal, 
  getTamanhosResumo 
}) => {
  return (
    <div className="space-y-1.5 text-xs text-gray-600 mb-3">
      <p className="font-medium text-gray-900 text-sm leading-tight">{producao.descricao}</p>
      
      <div className="grid grid-cols-2 gap-1">
        <div>
          <span className="text-gray-500">Tamanhos:</span>
          <span className="ml-1 text-gray-900 font-medium">{getTamanhosResumo(producao)}</span>
        </div>
        <div>
          <span className="text-gray-500">Qtd Total:</span>
          <span className="ml-1 font-bold text-blue-600 text-sm">{getQuantidadeTotal(producao)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        <div>
          <span className="text-gray-500">Início:</span>
          <span className="ml-1 text-gray-900 font-medium">
            {new Date(producao.dataInicio).toLocaleDateString('pt-PT')}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Entrega:</span>
          <span className="ml-1 font-bold text-red-700">
            {new Date(producao.dataFinal).toLocaleDateString('pt-PT')}
          </span>
        </div>
      </div>

      {(producao.tempoProducaoEstimado > 0 || producao.tempoProducaoReal > 0) && (
        <div className="grid grid-cols-2 gap-1">
          <div>
            <span className="text-gray-500">Tempo Est.:</span>
            <span className="ml-1 text-gray-900 font-medium">{producao.tempoProducaoEstimado}min</span>
          </div>
          <div>
            <span className="text-gray-500">Tempo Real:</span>
            <span className="ml-1 text-gray-900 font-medium">{producao.tempoProducaoReal || '-'}min</span>
          </div>
        </div>
      )}

      {producao.temMolde && (
        <div className="flex items-center space-x-1">
          <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
            Tem Molde
          </span>
        </div>
      )}

      <div className="flex items-center space-x-1 pt-1">
        {producao.localProducao === 'Interno' ? (
          <Building className="w-3 h-3 text-blue-600" />
        ) : (
          <MapPin className="w-3 h-3 text-orange-600" />
        )}
        <span className="text-gray-500">Local:</span>
        <span className="text-gray-900 font-medium">
          {producao.localProducao === 'Interno' ? 'Interno' : (producao.empresaExterna || 'Externo')}
        </span>
      </div>
    </div>
  );
};

export default ProducaoInfo;
