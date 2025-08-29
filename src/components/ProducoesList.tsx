import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Package, Calendar, User, Hash, FileText, Search, Filter, MapPin, Building, Eye } from 'lucide-react';
import { Producao, Etapa, Estado } from '../types';
import { etapas, estados } from '../data/constants';
import ProducaoDetailsModal from './ProducaoDetailsModal';

interface ProducoesListProps {
  producoes: Producao[];
  onEdit?: (producao: Producao) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  onUpdate?: () => void;
}

const ProducoesList: React.FC<ProducoesListProps> = ({ 
  producoes, 
  onEdit, 
  onDelete, 
  showActions = false,
  onUpdate
}) => {
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'all'>('all');
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'all'>('all');
  const [busca, setBusca] = useState('');
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  const getEtapaColor = (etapa: Etapa): string => {
    const colors = {
      'Desenvolvimento': 'bg-yellow-100 text-yellow-800',
      '1º proto': 'bg-orange-100 text-orange-800',
      '2º proto': 'bg-orange-100 text-orange-800',
      'Size-Set': 'bg-blue-100 text-blue-800',
      'PPS': 'bg-purple-100 text-purple-800',
      'Produção': 'bg-indigo-100 text-indigo-800',
      'Pronto': 'bg-green-100 text-green-800',
      'Enviado': 'bg-gray-100 text-gray-800',
    };
    return colors[etapa];
  };

  const getEstadoColor = (estado: Estado): string => {
    const colors = {
      'Modelagem': 'bg-yellow-100 text-yellow-700',
      'Aguarda Componentes': 'bg-orange-100 text-orange-700',
      'Aguarda Malha': 'bg-orange-100 text-orange-700',
      'Com Defeito': 'bg-red-100 text-red-700',
      'Aguarda Comentários': 'bg-amber-100 text-amber-700',
      'Corte': 'bg-blue-100 text-blue-700',
      'Confecção': 'bg-indigo-100 text-indigo-700',
      'Transfers': 'bg-purple-100 text-purple-700',
      'Serviços Externos': 'bg-teal-100 text-teal-700',
      'Embalamento': 'bg-green-100 text-green-700',
    };
    return colors[estado];
  };

  const isUrgent = (dataEntrega: string): boolean => {
    const hoje = new Date();
    const entrega = new Date(dataEntrega);
    const diffTime = entrega.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const getQuantidadeTotal = (producao: Producao): number => {
    return producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

  const getTamanhosResumo = (producao: Producao): string => {
    const tamanhos = Array.from(
      new Set(producao.variantes.flatMap(v => Object.keys(v.tamanhos)))
    ).sort();
    return tamanhos.join(', ');
  };

  const producoesFiltradas = useMemo(() => {
    return producoes.filter(producao => {
      const matchEtapa = filtroEtapa === 'all' || producao.etapa === filtroEtapa;
      const matchEstado = filtroEstado === 'all' || producao.estado === filtroEstado;
      const matchBusca = busca === '' || 
        producao.marca.toLowerCase().includes(busca.toLowerCase()) ||
        producao.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaInterna.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaCliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.descricao.toLowerCase().includes(busca.toLowerCase());
      
      return matchEtapa && matchEstado && matchBusca;
    }).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
  }, [filtroEtapa, filtroEstado, busca, producoes]);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por marca, cliente, referência..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por Etapa */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <select
            value={filtroEtapa}
            onChange={(e) => setFiltroEtapa(e.target.value as Etapa | 'all')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as etapas</option>
            {etapas.map(etapa => (
              <option key={etapa} value={etapa}>{etapa}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado */}
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as Estado | 'all')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Produções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {producoesFiltradas.map((producao) => (
          <div 
            key={producao.id} 
            className={`
              rounded-lg border p-4 hover:shadow-md transition-all duration-200 relative overflow-hidden
              ${isUrgent(producao.dataEstimadaEntrega) 
                ? 'bg-red-50 border-red-200' 
                : 'bg-white border-gray-200'
              }
            `}
          >
            {/* Título - Apenas Referência Interna */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">{producao.referenciaInterna}</h3>
              <div className="flex flex-col space-y-1 text-right">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEtapaColor(producao.etapa)}`}>
                  {producao.etapa}
                </span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(producao.estado)}`}>
                  {producao.estado}
                </span>
              </div>
            </div>

            {/* Informações Principais (texto menor) */}
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p className="font-medium text-gray-900 text-sm leading-tight">{producao.descricao}</p>
              
              <div className="grid grid-cols-1 gap-1">
                <div>
                  <span className="text-gray-500">Tamanhos:</span>
                  <span className="ml-1 text-gray-900">{getTamanhosResumo(producao)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Qtd Total:</span>
                  <span className="ml-1 font-bold text-blue-600">{getQuantidadeTotal(producao)} un</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1">
                <div>
                  <span className="text-gray-500">Início:</span>
                  <span className="ml-1 text-gray-900">
                    {new Date(producao.dataInicio).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Entrega:</span>
                  <span className={`ml-1 font-bold ${isUrgent(producao.dataEstimadaEntrega) ? 'text-red-700' : 'text-gray-900'}`}>
                    {new Date(producao.dataEstimadaEntrega).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-xs">
                {producao.localProducao === 'Interno' ? (
                  <Building className="w-3 h-3 text-blue-600" />
                ) : (
                  <MapPin className="w-3 h-3 text-orange-600" />
                )}
                <span className="text-gray-500">Local:</span>
                <span className="text-gray-900 truncate">
                  {producao.localProducao === 'Externo' && producao.empresaExterna ? 'Famalicão' : 'Interno'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <button
                onClick={() => setDetailsModal({ isOpen: true, producao })}
                className="flex items-center space-x-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Eye className="w-3 h-3" />
                <span className="text-xs font-medium">Detalhes</span>
              </button>
              
              {showActions && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit?.(producao)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
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
              absolute bottom-0 left-0 right-0 py-1 px-2 text-center text-xs font-bold tracking-wide
              ${producao.emProducao 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-400 text-white'
              }
            `}>
              {producao.emProducao ? 'EM PRODUÇÃO' : 'PARADO'}
            </div>

            {/* Padding para status bar */}
            <div className="h-6"></div>
          </div>
        ))}
      </div>

      {producoesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma produção encontrada</p>
        </div>
      )}

      {/* Modal de Detalhes */}
      <ProducaoDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, producao: null })}
        producao={detailsModal.producao}
      />
    </div>
  );
};

export default ProducoesList;