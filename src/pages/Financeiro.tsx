import React, { useState, useMemo } from 'react';
import { DollarSign, Edit, Save, X, Plus, Eye, Search, Filter } from 'lucide-react';
import { useProducoes } from '../hooks/useSupabaseData';
import { Producao } from '../types';

interface FinanceiroData extends Producao {
  numeroFatura?: string;
  dataFatura?: string;
  valorFatura?: number;
  pago?: boolean;
}

const Financeiro: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FinanceiroData>>({});
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'pago' | 'nao-pago' | 'nao-faturado'>('all');
  const [busca, setBusca] = useState('');

  const { producoes, loading, error, updateProducao } = useProducoes();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Lomartex.24') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta');
    }
  };

  const handleEdit = (producao: Producao) => {
    setEditingId(producao.id);
    setEditData({
      numeroFatura: producao.numeroFatura || '',
      dataFatura: producao.dataFatura || '',
      valorFatura: producao.valorFatura || 0,
      pago: producao.pago || false
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    const producao = producoes.find(p => p.id === editingId);
    if (!producao) return;

    try {
      const updatedProducao = {
        ...producao,
        numeroFatura: editData.numeroFatura,
        dataFatura: editData.dataFatura,
        valorFatura: editData.valorFatura,
        pago: editData.pago
      };
      
      await updateProducao(editingId, updatedProducao);
      setEditingId(null);
      setEditData({});
    } catch (err) {
      alert('Erro ao atualizar dados financeiros');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const getRowColor = (producao: Producao): string => {
    if (producao.pago && producao.numeroFatura) {
      return 'bg-green-50 border-green-200'; // Faturada e paga
    } else if (producao.numeroFatura && !producao.pago) {
      return 'bg-yellow-50 border-yellow-200'; // Faturada mas não paga
    } else {
      return 'bg-red-50 border-red-200'; // Nem faturada nem paga
    }
  };

  const getStatusText = (producao: Producao): string => {
    if (producao.pago && producao.numeroFatura) {
      return 'Pago';
    } else if (producao.numeroFatura && !producao.pago) {
      return 'Faturado';
    } else {
      return 'Por Faturar';
    }
  };

  const producoesFinanceiras = useMemo(() => {
    return producoes.filter(producao => {
      const matchStatus = filtroStatus === 'all' || 
        (filtroStatus === 'pago' && producao.pago) ||
        (filtroStatus === 'nao-pago' && producao.numeroFatura && !producao.pago) ||
        (filtroStatus === 'nao-faturado' && !producao.numeroFatura);
      
      const matchBusca = busca === '' || 
        producao.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaInterna.toLowerCase().includes(busca.toLowerCase()) ||
        (producao.numeroFatura && producao.numeroFatura.toLowerCase().includes(busca.toLowerCase()));
      
      return matchStatus && matchBusca;
    }).sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
  }, [producoes, filtroStatus, busca]);

  const estatisticas = useMemo(() => {
    const total = producoes.length;
    const pagos = producoes.filter(p => p.pago).length;
    const faturados = producoes.filter(p => p.numeroFatura && !p.pago).length;
    const porFaturar = producoes.filter(p => !p.numeroFatura).length;
    const valorTotal = producoes.reduce((sum, p) => sum + (p.valorFatura || 0), 0);
    const valorPago = producoes.filter(p => p.pago).reduce((sum, p) => sum + (p.valorFatura || 0), 0);
    
    return { total, pagos, faturados, porFaturar, valorTotal, valorPago };
  }, [producoes]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <DollarSign className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
            <p className="text-gray-600">Módulo Financeiro</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Introduza a palavra-passe"
                required
              />
            </div>
            
            {authError && (
              <div className="text-red-600 text-sm text-center">{authError}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Aceder
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-6 h-6 text-red-600" />
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
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Módulo Financeiro</h1>
            <p className="text-gray-600">Gestão de faturação e pagamentos</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{estatisticas.total}</div>
                <div className="text-sm text-blue-600">Total Produções</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{estatisticas.pagos}</div>
                <div className="text-sm text-green-600">Pagos</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">{estatisticas.faturados}</div>
                <div className="text-sm text-yellow-600">Faturados</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{estatisticas.porFaturar}</div>
                <div className="text-sm text-red-600">Por Faturar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">Valor Total</div>
            <div className="text-2xl font-bold text-gray-900">€{estatisticas.valorTotal.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600">Valor Pago</div>
            <div className="text-2xl font-bold text-green-700">€{estatisticas.valorPago.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, referência, fatura..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="pago">Pagos</option>
              <option value="nao-pago">Faturados (não pagos)</option>
              <option value="nao-faturado">Por Faturar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Financeira */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Gestão Financeira</h2>
          <p className="text-gray-600">Faturação e pagamentos das produções</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Fatura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Fatura
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etapa
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {producoesFinanceiras.map((producao) => (
                <tr key={producao.id} className={`hover:bg-gray-50 border-l-4 ${getRowColor(producao)}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{producao.cliente}</div>
                    <div className="text-sm text-gray-500">{producao.marca}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{producao.referenciaInterna}</div>
                    <div className="text-sm text-gray-500">{producao.referenciaCliente}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === producao.id ? (
                      <input
                        type="text"
                        value={editData.numeroFatura || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, numeroFatura: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        placeholder="Nº Fatura"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{producao.numeroFatura || '-'}</div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === producao.id ? (
                      <input
                        type="date"
                        value={editData.dataFatura || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, dataFatura: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {producao.dataFatura ? new Date(producao.dataFatura).toLocaleDateString('pt-PT') : '-'}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingId === producao.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.valorFatura || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, valorFatura: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 text-right"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {producao.valorFatura ? `€${producao.valorFatura.toFixed(2)}` : '-'}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {producao.etapa}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {editingId === producao.id ? (
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={editData.pago || false}
                          onChange={(e) => setEditData(prev => ({ ...prev, pago: e.target.checked }))}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">Pago</label>
                      </div>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producao.pago && producao.numeroFatura ? 'bg-green-100 text-green-800' :
                        producao.numeroFatura && !producao.pago ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(producao)}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {editingId === producao.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(producao)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar dados financeiros"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {producoesFinanceiras.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma produção encontrada</h3>
            <p className="text-gray-500">
              {busca || filtroStatus !== 'all' 
                ? 'Tente ajustar os filtros de pesquisa' 
                : 'Não há dados financeiros disponíveis'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Financeiro;