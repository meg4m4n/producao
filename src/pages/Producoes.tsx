import React, { useState, useMemo } from 'react';
import { Filter, Search, Package, Calendar, User, Hash, FileText, Plus } from 'lucide-react';
import { mockProducoes, etapas, estados } from '../data/mockData';
import { Etapa, Estado, Producao } from '../types';
import ProducaoForm from '../components/ProducaoForm';

const Producoes: React.FC = () => {
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'all'>('all');
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'all'>('all');
  const [busca, setBusca] = useState('');
  const [producoes, setProducoes] = useState(mockProducoes);
  const [showForm, setShowForm] = useState(false);

  const handleCreateProducao = (novaProducao: Omit<Producao, 'id'>) => {
    const producao: Producao = {
      ...novaProducao,
      id: Date.now().toString()
    };
    setProducoes(prev => [...prev, producao]);
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
    });
  }, [filtroEtapa, filtroEstado, busca, producoes]);

  const estatisticas = useMemo(() => {
    const total = producoesFiltradas.length;
    const porEtapa = etapas.reduce((acc, etapa) => {
      acc[etapa] = producoesFiltradas.filter(p => p.etapa === etapa).length;
      return acc;
    }, {} as Record<Etapa, number>);
    
    return { total, porEtapa };
  }, [producoesFiltradas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produções</h1>
            <p className="text-gray-600">Gestão e acompanhamento de produções</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Produção</span>
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
              <div className="text-sm text-gray-500">Total de produções</div>
            </div>
          </div>
        </div>

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
      </div>

      {/* Estatísticas por Etapa */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {etapas.map(etapa => (
          <div key={etapa} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getEtapaColor(etapa)} mb-2`}>
              {etapa}
            </div>
            <div className="text-2xl font-bold text-gray-900">{estatisticas.porEtapa[etapa]}</div>
          </div>
        ))}
      </div>

      {/* Lista de Produções */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lista de Produções</h2>
          <p className="text-gray-600">{producoesFiltradas.length} produções encontradas</p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {producoesFiltradas.map((producao) => (
              <div key={producao.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
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

                  <div className="flex items-center space-x-2 pt-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Previsão:</span>
                    <span className="text-xs font-medium text-gray-900">{new Date(producao.dataPrevisao).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Criação */}
      <ProducaoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleCreateProducao}
      />
    </div>
  );
};

export default Producoes;