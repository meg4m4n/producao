import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { mockProducoes, etapas } from '../data/mockData';
import { Etapa, Producao } from '../types';
import ProducoesList from '../components/ProducoesList';

const Producoes: React.FC = () => {
  const [producoes] = useState(mockProducoes);

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

  const estatisticas = useMemo(() => {
    const total = producoes.length;
    const emProducao = producoes.filter(p => p.emProducao).length;
    const urgentes = producoes.filter(p => isUrgent(p.dataEstimadaEntrega)).length;
    const prontas = producoes.filter(p => p.etapa === 'Pronto' || p.etapa === 'Enviado').length;
    
    const porEtapa = etapas.reduce((acc, etapa) => {
      acc[etapa] = producoes.filter(p => p.etapa === etapa).length;
      return acc;
    }, {} as Record<Etapa, number>);
    
    return { total, emProducao, urgentes, prontas, porEtapa };
  }, [producoes]);

  const producoesOrdenadas = useMemo(() => {
    return [...producoes].sort((a, b) => {
      // Primeiro ordenar por urgência
      const aUrgent = isUrgent(a.dataEstimadaEntrega);
      const bUrgent = isUrgent(b.dataEstimadaEntrega);
      
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      
      // Depois por data de início (mais recente primeiro)
      return new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime();
    });
  }, [producoes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Produções</h1>
            <p className="text-gray-600">Visão geral e acompanhamento em tempo real</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">{estatisticas.total}</div>
            <div className="text-sm text-gray-500">Total de produções</div>
          </div>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <div className="text-lg font-bold text-red-700">{estatisticas.urgentes}</div>
                <div className="text-sm text-red-600">Entrega Urgente</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-lg font-bold text-blue-700">{estatisticas.prontas}</div>
                <div className="text-sm text-blue-600">Prontas/Enviadas</div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-amber-600" />
              <div>
                <div className="text-lg font-bold text-amber-700">{estatisticas.total - estatisticas.emProducao}</div>
                <div className="text-sm text-amber-600">Paradas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas por Etapa (Compactas) */}
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

      {/* Lista de Produções */}
      <ProducoesList producoes={producoesOrdenadas} />
    </div>
  );
};

export default Producoes;