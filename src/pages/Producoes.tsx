import React, { useState, useMemo } from 'react';
import {
  TrendingUp, AlertTriangle, CheckCircle, Clock, Plus,
  ChevronDown, ChevronUp, Search, Filter, Building
} from 'lucide-react';
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

  const [editModal, setEditModal] = useState<{ isOpen: boolean; producao?: Producao; }>({ isOpen: false });

  // Painel superior SEMPRE escondido por defeito
  const [panelExpanded, setPanelExpanded] = useState(false);

  // Filtros do painel (quando expandido)
  const [filtroProblemas, setFiltroProblemas] = useState<'all' | 'com-problemas' | 'sem-problemas'>('all');
  const [filtroLocal, setFiltroLocal] = useState<string>('all');
  const [busca, setBusca] = useState('');

  // Zoom apenas para a grelha de cards (passado para ProducoesList)
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleCreateProducao = async (novaProducao: Omit<Producao, 'id'>) => {
    try {
      await createProducao(novaProducao);
    } catch {
      alert('Erro ao criar produção');
    }
    setEditModal({ isOpen: false });
  };

  const handleUpdateProducao = async (producaoAtualizada: Producao) => {
    try {
      await updateProducao(producaoAtualizada.id, producaoAtualizada);
    } catch {
      alert('Erro ao atualizar produção');
    }
    setEditModal({ isOpen: false });
  };

  const handleDuplicateProducao = async (producao: Producao) => {
    if (!confirm(`Duplicar a produção "${producao.referenciaInterna}"?`)) return;
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
    } catch {
      alert('Erro ao duplicar produção');
    }
  };

  const handleDeleteProducao = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta produção?')) return;
    try {
      await deleteProducao(id);
    } catch {
      alert('Erro ao remover produção');
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

  // Filtro do painel (aplica-se à visão do dashboard e lista)
  const producoesFiltradasDashboard = useMemo(() => {
    return producoes.filter((producao) => {
      const matchProblemas =
        filtroProblemas === 'all' ||
        (filtroProblemas === 'com-problemas' && producao.problemas) ||
        (filtroProblemas === 'sem-problemas' && !producao.problemas);

      const matchLocal =
        filtroLocal === 'all' ||
        (filtroLocal === 'interno' && producao.localProducao === 'Interno') ||
        (filtroLocal === 'externo' && producao.localProducao === 'Externo') ||
        (producao.localProducaoId === filtroLocal);

      const matchBusca =
        busca === '' ||
        producao.marca.toLowerCase().includes(busca.toLowerCase()) ||
        producao.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaInterna.toLowerCase().includes(busca.toLowerCase()) ||
        producao.codigoOP.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaCliente.toLowerCase().includes(busca.toLowerCase());

      return matchProblemas && matchLocal && matchBusca;
    });
  }, [producoes, filtroProblemas, filtroLocal, busca]);

  // Estatísticas principais
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
      return diffDays <= 2; // atrasado ou a 2 dias
    }).length;

    const porEtapa = etapas.reduce((acc, etapa) => {
      acc[etapa] = producoesFiltradasDashboard.filter(p => p.etapa === etapa).length;
      return acc;
    }, {} as Record<Etapa, number>);

    return { total, emProducao, comProblemas, faltaComponentes, prontas, atrasado, porEtapa };
  }, [producoesFiltradasDashboard]);

  const getQuantidadeTotal = (producao: Producao): number => {
    return producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

  const producoesOrdenadas = useMemo(() => {
    return [...producoesFiltradasDashboard].sort((a, b) => {
      const aUrgent = isUrgent(a.dataFinal);
      const bUrgent = isUrgent(b.dataFinal);
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
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
      {/* Header compacto */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Produções</h1>
            <p className="text-gray-600">Visão geral e acompanhamento em tempo real</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{estatisticas.total}</div>
                  <div className="text-sm text-gray-500">Total de produções</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {producoesFiltradasDashboard.reduce((total, p) => total + getQuantidadeTotal(p), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Quantidade a produzir</div>
                </div>
              </div>
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

        {/* Cards na ORDEM exata pedida */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-2">
          {/* Em Produção */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-lg font-bold text-green-700">{estatisticas.emProducao}</div>
                <div className="text-sm text-green-600">Em Produção</div>
              </div>
            </div>
          </div>

          {/* Falta Componentes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-lg font-bold text-yellow-700">{estatisticas.faltaComponentes}</div>
                <div className="text-sm text-yellow-600">Falta Componentes</div>
              </div>
            </div>
          </div>

          {/* Com Problemas */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-lg font-bold text-red-700">{estatisticas.comProblemas}</div>
                <div className="text-sm text-red-600">Com Problemas</div>
              </div>
            </div>
          </div>

          {/* Atrasado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-700">{estatisticas.atrasado}</div>
                <div className="text-sm text-blue-600">Atrasado</div>
              </div>
            </div>
          </div>

          {/* Prontas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-700">{estatisticas.prontas}</div>
                <div className="text-sm text-blue-600">Prontas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão para expandir/ocultar o painel superior */}
        <div className="flex justify-end">
          <button
            onClick={() => setPanelExpanded(v => !v)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <span>{panelExpanded ? 'Comprimir painel' : 'Expandir painel'}</span>
            {panelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Painel superior (filtros + distribuição por etapas) — escondido por defeito */}
        {panelExpanded && (
          <div className="mt-3 space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              {/* Reset */}
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

            {/* Distribuição por Etapas */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Distribuição por Etapas</h3>
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
            </div>
          </div>
        )}
      </div>

      {/* Lista de Produções (zoom controla a grelha de cards) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Produções Ativas</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Zoom:</span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              -
            </button>
            <span className="text-sm text-gray-600 min-w-[50px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Passamos o scale para a lista (os controlos ficam fora do zoom) */}
        <ProducoesList
          producoes={producoesOrdenadas}
          onUpdateFlags={updateFlags}
          onUpdateFinancialFlags={updateFinancialFlags}
          onEdit={(producao) => setEditModal({ isOpen: true, producao })}
          onDelete={handleDeleteProducao}
          onDuplicate={handleDuplicateProducao}
          showActions={true}
          scale={zoomLevel}
        />
      </div>

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
