import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Producao, Etapa, Estado } from '../../types';
import ProducaoFlags from './ProducaoFlags';
import ProducaoInfo from './ProducaoInfo';

interface ProducaoCardProps {
  producao: Producao;
  onEdit?: (producao: Producao) => void;
  onDelete?: (id: string) => void;
  onFlagChange: (flag: 'problemas' | 'emProducao' | 'faltaComponentes' | 'faturado' | 'pago', value: boolean) => void;
  onViewDetails: (producao: Producao) => void;
  showActions?: boolean;
  isUrgent: (dataEntrega: string) => boolean;
  getEtapaColor: (etapa: Etapa) => string;
  getEstadoColor: (estado: Estado) => string;
  getQuantidadeTotal: (producao: Producao) => number;
  getTamanhosResumo: (producao: Producao) => string;
}

const ProducaoCard: React.FC<ProducaoCardProps> = ({
  producao,
  onEdit,
  onDelete,
  onFlagChange,
  onViewDetails,
  showActions = false,
  isUrgent,
  getEtapaColor,
  getEstadoColor,
  getQuantidadeTotal,
  getTamanhosResumo
}) => {
  const handleFlagChange = (flag: 'problemas' | 'emProducao' | 'faltaComponentes' | 'faturado' | 'pago', value: boolean) => {
    onFlagChange(flag, value);
  };

  return (
    <div 
      className={`
        rounded-lg border p-4 hover:shadow-md transition-all duration-200 relative overflow-hidden
        ${(producao.problemas || false)
          ? 'blink-problems' 
          : producao.estado === 'FALTA COMPONENTES'
            ? 'bg-yellow-100 border-yellow-300'
            : isUrgent(producao.dataEstimadaEntrega)
              ? 'bg-red-50 border-red-300 border-l-4 border-l-red-500'
              : 'bg-white border-gray-200'
        }
      `}
    >
      {/* Quick Action Flags */}
      <ProducaoFlags 
        producao={producao}
        onFlagChange={handleFlagChange}
      />

      {/* Título - Apenas Referência Interna */}
      <div className="flex items-start justify-between mb-3 pr-16">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{producao.referenciaInterna}</h3>
          <div className="space-y-1">
            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${getEtapaColor(producao.etapa)}`}>
              {producao.etapa}
            </span>
            <br />
            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(producao.estado)}`}>
              {producao.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Informações Principais */}
      <ProducaoInfo 
        producao={producao}
        getQuantidadeTotal={getQuantidadeTotal}
        getTamanhosResumo={getTamanhosResumo}
      />

      {/* Actions */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(producao)}
          className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          <Eye className="w-3 h-3" />
          <span className="text-xs">Resumo</span>
        </button>
        
        {showActions && (
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit?.(producao)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar registo completo"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete?.(producao.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`
        absolute bottom-0 left-0 right-0 py-0.5 px-2 text-center text-xs font-bold tracking-wide
        ${(producao.emProducao || false)
          ? 'bg-green-600 text-white' 
          : producao.problemas 
            ? 'bg-red-600 text-white'
            : 'bg-gray-400 text-white'
        }
      `}>
        {(producao.emProducao || false) ? 'EM PRODUÇÃO' : 
         producao.problemas ? 'COM PROBLEMAS' : 'PARADO'}
      </div>
    </div>
  );
};

export default ProducaoCard;