import React, { useState, useMemo } from 'react';
import { Archive, Trash2, RotateCcw, Search, Filter, Eye, AlertTriangle } from 'lucide-react';
import { Producao, Etapa, Estado } from '../types';
import { etapas, estados } from '../data/mockData';
import ProducaoDetailsModal from '../components/ProducaoDetailsModal';
import { useProducoes } from '../hooks/useSupabaseData';

const Historico: React.FC = () => {
  const { producoes, loading, error, deleteProducao } = useProducoes();
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'all'>('all');
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'all'>('all');
  const [busca, setBusca] = useState('');
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  // Filter productions that are completed or should be in history
  const producoesHistorico = useMemo(() => {
    return producoes.filter(producao => 
      producao.etapa === 'Pronto' || 
      producao.etapa === 'Enviado' ||
      producao.estado === 'Embalamento'
    );
  }, [producoes]);

  // Apply filters
  const producoesFiltradas = useMemo(() => {
    return producoesHistorico.filter(producao => {
      const matchEtapa = filtroEtapa === 'all' || producao.etapa === filtroEtapa;
      const matchEstado = filtroEstado === 'all' || producao.estado === filtroEstado;
      const matchBusca = busca === '' || 
        producao.marca.toLowerCase().includes(busca.toLowerCase()) ||
        producao.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaInterna.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaCliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.descricao.toLowerCase().includes(busca.toLowerCase());
      
      return matchEtapa && matchEstado && matchBusca;
    }).sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
  }, [producoesHistorico, filtroEtapa, filtroEstado, busca]);

  const handlePermanentDelete = async (id: string) => {
    const password = prompt('Para eliminar permanentemente este registo, introduza a senha:');
    if (password === 'lomartex.24') {
      if (confirm('ATENÇÃO: Esta ação irá eliminar permanentemente o registo. Esta ação não pode ser desfeita. Continuar?')) {
        try {
          await deleteProducao(id);
          alert('Registo eliminado permanentemente.');
        } catch (err) {
          alert('Erro ao eliminar registo');
        }
      }
    } else if (password !== null) {
      alert('Senha incorreta');
    }
  };

  const handleRestore = async (producao: Producao) => {
    if (confirm(`Restaurar "${producao.referenciaInterna}" para a lista ativa?`)) {
      try {
        // In a real implementation, this would update a "deleted" flag
        // For now, we'll just show a message
        alert('Funcionalidade de restauro será implementada na versão completa');
      } catch (err) {
        alert('Erro ao restaurar registo');
      }
    }
  };

  const getQuantidadeTotal = (producao: Producao): number => {
    return producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Archive className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Erro ao carregar dados</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Archive className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico</h1>
            <p className="text-gray-600">Produções completas, enviadas e eliminadas</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Archive className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{producoesHistorico.length}</div>
                <div className="text-sm text-green-600">Total no Histórico</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">
                  {producoesHistorico.filter(p => p.etapa === 'Pronto').length}
                </div>
                <div className="text-sm text-blue-600">Prontas</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Archive className="w-6 h-6 text-gray-600" />
              <div>
                <div className="text-2xl font-bold text-gray-700">
                  {producoesHistorico.filter(p => p.etapa === 'Enviado').length}
                </div>
                <div className="text-sm text-gray-600">Enviadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
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

          {/* Filter by Stage */}
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

          {/* Filter by State */}
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

      {/* Productions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Registos Históricos</h2>
          <p className="text-gray-600">Produções completas e enviadas</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca / Cliente
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etapa
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Entrega
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {producoesFiltradas.map((producao) => (
                <tr key={producao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{producao.referenciaInterna}</div>
                      <div className="text-sm text-gray-500">{producao.referenciaCliente}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{producao.marca}</div>
                    <div className="text-sm text-gray-500">{producao.cliente}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEtapaColor(producao.etapa)}`}>
                      {producao.etapa}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(producao.estado)}`}>
                      {producao.estado}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-blue-600">{getQuantidadeTotal(producao)}</div>
                    <div className="text-xs text-gray-500">unidades</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(producao.dataEstimadaEntrega).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Início: {new Date(producao.dataInicio).toLocaleDateString('pt-PT')}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setDetailsModal({ isOpen: true, producao })}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleRestore(producao)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Restaurar para lista ativa"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handlePermanentDelete(producao.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar permanentemente (requer senha)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {producoesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registo no histórico</h3>
            <p className="text-gray-500">
              {busca || filtroEtapa !== 'all' || filtroEstado !== 'all' 
                ? 'Tente ajustar os filtros de pesquisa' 
                : 'Registos completos e enviados aparecerão aqui'
              }
            </p>
          </div>
        )}
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-900 mb-1">Informação Importante</h3>
            <p className="text-sm text-amber-800">
              A eliminação permanente de registos requer a senha "lomartex.24" e não pode ser desfeita. 
              Use esta funcionalidade com cuidado.
            </p>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <ProducaoDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, producao: null })}
        producao={detailsModal.producao}
      />
    </div>
  );
};

const getQuantidadeTotal = (producao: Producao): number => {
  return producao.variantes.reduce((total, variante) => {
    return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
  }, 0);
};

export default Historico;