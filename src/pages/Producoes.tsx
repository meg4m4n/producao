import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Plus, Edit, ChevronDown, ChevronUp, MessageSquare, Search, Filter, Copy, Building, MapPin } from 'lucide-react';
import { etapas } from '../data/mockData';
import { Etapa, Producao } from '../types';
import ProducoesList from '../components/ProducoesList';
import ProducaoForm from '../components/ProducaoForm';
import { useProducoes } from '../hooks/useSupabaseData';
import { useLocaisProducao } from '../hooks/useLocaisProducao';

const Producoes: React.FC = () => {
  const { 
    producoes, 
    loading, 
    error, 
    createProducao, 
    updateProducao, 
    deleteProducao, 
    updateFlags,
    updateFinancialFlags
  } = useProducoes();
  
  const { locaisProducao } = useLocaisProducao();
  
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    producao?: Producao;
  }>({ isOpen: false });
  
  const [dashboardCollapsed, setDashboardCollapsed] = useState(false);
  const [filtroProblemas, setFiltroProblemas] = useState<'all' | 'com-problemas' | 'sem-problemas'>('all');
  const [filtroLocal, setFiltroLocal] = useState<string>('all');
  const [busca, setBusca] = useState('');

  const handleCreateProducao = async (novaProducao: Omit<Producao, 'id'>) => {
    try {
      await createProducao(novaProducao);
    } catch (err) {
      alert('Erro ao criar produção');
    }
    setEditModal({ isOpen: false });
  };

  const handleUpdateProducao = async (producaoAtualizada: Producao) => {
    try {
      await updateProducao(producaoAtualizada.id, producaoAtualizada);
    } catch (err) {
      alert('Erro ao atualizar produção');
    }
    setEditModal({ isOpen: false });
  };

  const handleDuplicateProducao = async (producao: Producao) => {
    if (confirm(`Duplicar a produção "${producao.referenciaInterna}"?`)) {
      try {
        const nextOP = `OP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        const duplicatedProducao = {
          ...producao,
          codigoOP: nextOP,
          referenciaInterna: `${producao.referenciaInterna}-COPY`,
          referenciaCliente: `${producao.referenciaCliente}-COPY`,
          dataInicio: new Date().toISOString().split('T')[0],
          dataPrevisao: '',
          dataFinal: '',
          etapa: 'Desenvolvimento' as const,
          estado: 'Modelagem' as const,
          emProducao: false,
          problemas: false,
          tempoProducaoReal: 0,
          comments: `Duplicado de ${producao.referenciaInterna}`
        };
        delete (duplicatedProducao as any).id;
        await createProducao(duplicatedProducao);
        alert('Produção duplicada com sucesso!');
      } catch (err) {
        alert('Erro ao duplicar produção');
      }
    }
  };

  const handleDeleteProducao = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta produção?')) {
      try {
        await deleteProducao(id);
      } catch (err) {
        alert('Erro ao remover produção');
      }
    }
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

  const isUrgent = (dataEntrega: string): boolean => {
    const hoje = new Date();
    const entrega = new Date(dataEntrega);
    const diffTime = entrega.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const producoesFiltradasDashboard = useMemo(() => {
    return producoes.filter(producao => {
      const matchProblemas = filtroProblemas === 'all' || 
        (filtroProblemas === 'com-problemas' && producao.problemas) ||
        (filtroProblemas === 'sem-problemas' && !producao.problemas);
      
      const matchLocal = filtroLocal === 'all' || 
        (filtroLocal === 'interno' && producao.localProducao === 'Interno') ||
        (filtroLocal === 'externo' && producao.localProducao === 'Externo') ||
        (producao.localProducaoId === filtroLocal);
      
      const matchBusca = busca === '' || 
        producao.marca.toLowerCase().includes(busca.toLowerCase()) ||
        producao.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaInterna.toLowerCase().includes(busca.toLowerCase()) ||
        producao.codigoOP.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaCliente.toLowerCase().includes(busca.toLowerCase());
      
      return matchProblemas && matchLocal && matchBusca;
    });
  }, [producoes, filtroProblemas, filtroLocal, busca]);

  const estatisticas = useMemo(() => {
    const total = producoesFiltradasDashboard.length;
    const emProducao = producoesFiltradasDashboard.filter(p => p.emProducao || false).length;
    const comProblemas = producoesFiltradasDashboard.filter(p => p.problemas || false).length;
    const faltaComponentes = producoesFiltradasDashboard.filter(p => p.estado === 'FALTA COMPONENTES').length;
    const prontas = producoesFiltradasDashboard.filter(p => p.estado === 'Pronto').length;
    const atrasado = producoesFiltradasDashboard.filter(p => {
      const hoje = new Date();
      const entrega = new Date(p.dataFinal);
      const diffTime = entrega.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2; // Overdue or within 2 days
    }).length;
    
    const porEtapa = etapas.reduce((acc, etapa) => {
      acc[etapa] = producoesFiltradasDashboard.filter(p => p.etapa === etapa).length;
      return acc;
    }, {} as Record<Etapa, number>);
    
    return { total, emProducao, comProblemas, faltaComponentes, prontas, atrasado, porEtapa };
  }, [producoesFiltradasDashboard]);

  const producoesOrdenadas = useMemo(() => {
    return [...producoesFiltradasDashboard].sort((a, b) => {
      // Primeiro ordenar por urgência
      const aUrgent = isUrgent(a.dataFinal);
      const bUrgent = isUrgent(b.dataFinal);
      
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      
      // Depois por data de início (mais recente primeiro)
      return new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime();
    });
  }, [producoesFiltradasDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produções...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Produções</h1>
            <p className="text-gray-600">Visão geral e acompanhamento em tempo real</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">{estatisticas.total}</div>
              <div className="text-sm text-gray-500">Total de produções</div>
            </div>
            <button 
              onClick={() => setEditModal({ isOpen: true })}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Produção</span>
            </button>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-700">{estatisticas.emProducao}</div>
                <div className="text-sm text-green-600">Em Produção</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-lg font-bold text-red-700">{estatisticas.comProblemas}</div>
                <div className="text-sm text-red-600">Com Problemas</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-lg font-bold text-yellow-700">{estatisticas.faltaComponentes}</div>
                <div className="text-sm text-yellow-600">Falta Componentes</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-700">{estatisticas.prontas}</div>
                <div className="text-sm text-blue-600">Prontas</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-700">{estatisticas.atrasado}</div>
                <div className="text-sm text-blue-600">Atrasado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros do Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código OP, marca, cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro Problemas */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={filtroProblemas}
              onChange={(e) => setFiltroProblemas(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="com-problemas">Com Problemas</option>
              <option value="sem-problemas">Sem Problemas</option>
            </select>
          </div>

          {/* Filtro Local */}
          <div className="relative">
            <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={filtroLocal}
              onChange={(e) => setFiltroLocal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os locais</option>
              <option value="interno">Interno</option>
              <option value="externo">Externo</option>
              {locaisProducao.map(local => (
                <option key={local.id} value={local.id}>{local.nome}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setBusca('');
              setFiltroProblemas('all');
              setFiltroLocal('all');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Estatísticas por Etapa (Compactas) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Distribuição por Etapas</h3>
            <button
              onClick={() => setDashboardCollapsed(!dashboardCollapsed)}
              className="flex items-center space-x-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-xs">
                {dashboardCollapsed ? 'Expandir' : 'Comprimir'}
              </span>
              {dashboardCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {!dashboardCollapsed && (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
              {etapas.map(etapa => (
                <div key={etapa} className="text-center">
                  <div className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${getEtapaColor(etapa)} mb-1`}>
                    {estatisticas.porEtapa[etapa]}
                  </div>
                  <div className="text-xs text-gray-600 truncate">{etapa}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de Produções */}
      <ProducoesList 
        producoes={producoesOrdenadas} 
        onUpdateFlags={updateFlags}
        onUpdateFinancialFlags={updateFinancialFlags}
        onEdit={(producao) => setEditModal({ isOpen: true, producao })}
        onDelete={handleDeleteProducao}
        onDuplicate={handleDuplicateProducao}
        showActions={true}
      />

      {/* Modal de Produção */}
      <ProducaoForm
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        onSave={editModal.producao ? handleUpdateProducao : handleCreateProducao}
        producao={editModal.producao}
      />
    </div>
  );
};

export default Producoes;