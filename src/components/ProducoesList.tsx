import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Package, Calendar, User, Hash, FileText, Search, Filter, MapPin, Building } from 'lucide-react';
import { Producao, Etapa, Estado } from '../types';
import { etapas, estados } from '../data/mockData';

interface ProducoesListProps {
  producoes: Producao[];
  onEdit?: (producao: Producao) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const ProducoesList: React.FC<ProducoesListProps> = ({ 
  producoes, 
  onEdit, 
  onDelete, 
  showActions = false 
}) => {
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'all'>('all');
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'all'>('all');
  const [busca, setBusca] = useState('');

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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {producoesFiltradas.map((producao) => (
          <div 
            key={producao.id} 
            className={`
              rounded-lg border p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden
              ${isUrgent(producao.dataEstimadaEntrega) 
                ? 'bg-red-50 border-red-200' 
                : 'bg-white border-gray-200'
              }
            `}
          >
            {/* Header do card */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{producao.marca}</h3>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEtapaColor(producao.etapa)}`}>
                  {producao.etapa}
                </span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(producao.estado)}`}>
                  {producao.estado}
                </span>
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Cliente:</span>
                <span className="text-sm font-medium text-gray-900">{producao.cliente}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-1">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Ref. Interna</div>
                    <div className="text-sm font-medium text-gray-900">{producao.referenciaInterna}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Ref. Cliente</div>
                    <div className="text-sm font-medium text-gray-900">{producao.referenciaCliente}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{producao.descricao}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500">Tipo / Género</div>
                  <div className="text-sm font-medium text-gray-900">{producao.tipoPeca} • {producao.genero}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tamanho • Qtd</div>
                  <div className="text-sm font-medium text-gray-900">{producao.tamanho} • {producao.quantidade}un</div>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Início</div>
                    <div className="text-xs font-medium text-gray-900">
                      {new Date(producao.dataInicio).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Entrega</div>
                    <div className={`text-xs font-medium ${isUrgent(producao.dataEstimadaEntrega) ? 'text-red-700' : 'text-gray-900'}`}>
                      {new Date(producao.dataEstimadaEntrega).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Local de Produção */}
              <div className="flex items-center space-x-2 pt-2">
                {producao.localProducao === 'Interno' ? (
                  <Building className="w-4 h-4 text-blue-600" />
                ) : (
                  <MapPin className="w-4 h-4 text-orange-600" />
                )}
                <span className="text-xs text-gray-500">Local:</span>
                <span className="text-xs font-medium text-gray-900">
                  {producao.localProducao}
                  {producao.empresaExterna && ` - ${producao.empresaExterna}`}
                </span>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => onEdit?.(producao)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete?.(producao.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className={`
              absolute bottom-0 left-0 right-0 py-2 px-4 text-center text-xs font-bold tracking-wide
              ${producao.emProducao 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-400 text-white'
              }
            `}>
              {producao.emProducao ? 'EM PRODUÇÃO' : 'PARADO'}
            </div>
          </div>
        ))}
      </div>

      {producoesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma produção encontrada</p>
        </div>
      )}
    </div>
  );
};

export default ProducoesList;