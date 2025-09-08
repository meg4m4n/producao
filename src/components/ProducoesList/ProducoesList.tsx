import React, { useState, useMemo } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import { Producao, Etapa, Estado } from '../../types';
import { etapas, estados } from '../../data/mockData';
import ProducaoCard from './ProducaoCard';
import ProducaoDetailsModal from '../ProducaoDetailsModal';

interface ProducoesListProps {
  producoes: Producao[];
  onEdit?: (producao: Producao) => void;
  onDelete?: (id: string) => void;
  onUpdateFlags?: (id: string, flags: { problemas?: boolean; emProducao?: boolean }) => void;
  onUpdateFinancialFlags?: (id: string, flags: { faturado?: boolean; pago?: boolean }) => void;
  showActions?: boolean;
}

const ProducoesList: React.FC<ProducoesListProps> = ({ 
  producoes, 
  onEdit, 
  onDelete, 
  onUpdateFlags,
  onUpdateFinancialFlags,
  showActions = false 
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
      'FALTA COMPONENTES': 'bg-red-100 text-red-700',
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

  const handleFlagChange = (producaoId: string, flag: 'problemas' | 'emProducao' | 'faltaComponentes' | 'faturado' | 'pago', value: boolean) => {
    if (flag === 'faturado' || flag === 'pago') {
      onUpdateFinancialFlags?.(producaoId, { [flag]: value });
    } else if (flag === 'faltaComponentes') {
      onUpdateFlags?.(producaoId, { faltaComponentes: value });
    } else {
      onUpdateFlags?.(producaoId, { [flag]: value });
    }
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
      </div>

      {/* Lista de Produções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {producoesFiltradas.map((producao) => (
          <ProducaoCard
            key={producao.id}
            producao={producao}
            onEdit={onEdit}
            onDelete={onDelete}
            onFlagChange={(flag, value) => handleFlagChange(producao.id, flag, value)}
            onViewDetails={() => setDetailsModal({ isOpen: true, producao })}
            showActions={showActions}
            isUrgent={isUrgent}
            getEtapaColor={getEtapaColor}
            getEstadoColor={getEstadoColor}
            getQuantidadeTotal={getQuantidadeTotal}
            getTamanhosResumo={getTamanhosResumo}
          />
        ))}
      </div>

      {producoesFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-8">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhuma produção encontrada</p>
        </div>
      )}

      {/* Modal de Detalhes */}
      <ProducaoDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, producao: null })}
        producao={detailsModal.producao}
        onUpdateFlags={(flags) => {
          if (detailsModal.producao && onUpdateFlags) {
            onUpdateFlags(detailsModal.producao.id, flags);
          }
        }}
      />
    </div>
  );
};

export default ProducoesList;