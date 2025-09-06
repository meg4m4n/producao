import React, { useState, useMemo } from 'react';
import { DollarSign, Edit, Save, X, Plus, Eye, Search, Filter, Euro, CreditCard } from 'lucide-react';
import { useProducoes } from '../hooks/useSupabaseData';
import { Producao } from '../types';

interface PagamentoParcial {
  id: string;
  valor: number;
  data: string;
  observacoes?: string;
}

interface FinanceiroData extends Producao {
  numeroFatura?: string;
  dataFatura?: string;
  valorFatura?: number;
  pago?: boolean;
  pagoParcial?: boolean;
  pagamentos?: PagamentoParcial[];
  valorPago?: number;
  valorRestante?: number;
  fastprod?: boolean;
  observacoesFinanceiras?: string;
}

const Financeiro: React.FC = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FinanceiroData>>({});
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'pago' | 'pago-parcial' | 'nao-pago' | 'nao-faturado'>('all');
  const [busca, setBusca] = useState('');
  const [showPagamentosModal, setShowPagamentosModal] = useState<string | null>(null);
  const [novoPagamento, setNovoPagamento] = useState({
    valor: 0,
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  const { producoes, loading, error, updateProducao } = useProducoes();

  const handleEdit = (producao: Producao) => {
    setEditingId(producao.id);
    setEditData({
      numeroFatura: producao.numeroFatura || '',
      dataFatura: producao.dataFatura || '',
      valorFatura: producao.valorFatura || 0,
      pago: producao.pago || false,
      pagoParcial: producao.pagoParcial || false,
      pagamentos: producao.pagamentos || [],
      valorPago: producao.valorPago || 0,
      valorRestante: (producao.valorFatura || 0) - (producao.valorPago || 0),
      fastprod: producao.fastprod || false,
      observacoesFinanceiras: producao.observacoesFinanceiras || ''
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    const producao = producoes.find(p => p.id === editingId);
    if (!producao) return;

    try {
      const valorPago = editData.pagamentos?.reduce((sum, p) => sum + p.valor, 0) || 0;
      const valorRestante = (editData.valorFatura || 0) - valorPago;
      
      const updatedProducao = {
        ...producao,
        numeroFatura: editData.numeroFatura,
        dataFatura: editData.dataFatura,
        valorFatura: editData.valorFatura,
        pago: valorRestante <= 0 && (editData.valorFatura || 0) > 0,
        pagoParcial: valorPago > 0 && valorRestante > 0,
        pagamentos: editData.pagamentos,
        valorPago,
        valorRestante,
        fastprod: editData.fastprod,
        observacoesFinanceiras: editData.observacoesFinanceiras
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

  const adicionarPagamento = () => {
    if (novoPagamento.valor <= 0) return;
    
    const pagamento: PagamentoParcial = {
      id: Date.now().toString(),
      valor: novoPagamento.valor,
      data: novoPagamento.data,
      observacoes: novoPagamento.observacoes
    };

    setEditData(prev => ({
      ...prev,
      pagamentos: [...(prev.pagamentos || []), pagamento]
    }));

    setNovoPagamento({
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
  };

  const removerPagamento = (pagamentoId: string) => {
    setEditData(prev => ({
      ...prev,
      pagamentos: prev.pagamentos?.filter(p => p.id !== pagamentoId) || []
    }));
  };

  const getRowColor = (producao: FinanceiroData): string => {
    if (producao.pago && producao.numeroFatura) {
      return 'bg-green-50 border-green-200'; // Faturada e paga
    } else if (producao.pagoParcial) {
      return 'bg-blue-50 border-blue-200'; // Pago parcial
    } else if (producao.numeroFatura && !producao.pago) {
      return 'bg-yellow-50 border-yellow-200'; // Faturada mas não paga
    } else {
      return 'bg-red-50 border-red-200'; // Nem faturada nem paga
    }
  };

  const getStatusText = (producao: FinanceiroData): string => {
    if (producao.pago && producao.numeroFatura) {
      return 'Pago';
    } else if (producao.pagoParcial) {
      return 'Pago Parcial';
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
        (filtroStatus === 'pago-parcial' && producao.pagoParcial) ||
        (filtroStatus === 'nao-pago' && producao.numeroFatura && !producao.pago && !producao.pagoParcial) ||
        (filtroStatus === 'nao-faturado' && !producao.numeroFatura);
      
      const matchBusca = busca === '' || 
        producao.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        producao.referenciaInterna.toLowerCase().includes(busca.toLowerCase()) ||
        (producao.numeroFatura && producao.numeroFatura.toLowerCase().includes(busca.toLowerCase()));
      
      return matchStatus && matchBusca;
    }).sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
  }, [producoes, filtroStatus, busca]);

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
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Módulo Financeiro</h1>
            <p className="text-gray-600">Gestão de faturação e pagamentos</p>
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
              <option value="pago-parcial">Pagos Parcialmente</option>
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
                  Valor Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Restante
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FastProd
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
                        onChange={(e) => {
                          const valor = parseFloat(e.target.value) || 0;
                          const valorPago = editData.pagamentos?.reduce((sum, p) => sum + p.valor, 0) || 0;
                          setEditData(prev => ({ 
                            ...prev, 
                            valorFatura: valor,
                            valorRestante: valor - valorPago
                          }));
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 text-right"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {producao.valorFatura ? `€${producao.valorFatura.toFixed(2)}` : '-'}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-green-700">
                      €{(producao.valorPago || 0).toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${
                      (producao.valorRestante || 0) > 0 ? 'text-red-700' : 'text-green-700'
                    }`}>
                      €{(producao.valorRestante || 0).toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {editingId === producao.id ? (
                      <input
                        type="checkbox"
                        checked={editData.fastprod || false}
                        onChange={(e) => setEditData(prev => ({ ...prev, fastprod: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producao.fastprod ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {producao.fastprod ? 'Sim' : 'Não'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      producao.pago && producao.numeroFatura ? 'bg-green-100 text-green-800' :
                      producao.pagoParcial ? 'bg-blue-100 text-blue-800' :
                      producao.numeroFatura && !producao.pago ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(producao)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {editingId === producao.id ? (
                        <>
                          <button
                            onClick={() => setShowPagamentosModal(producao.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Gerir pagamentos"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
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
                        <>
                          {(producao.pagamentos && producao.pagamentos.length > 0) && (
                            <button
                              onClick={() => setShowPagamentosModal(producao.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Ver pagamentos"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(producao)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar dados financeiros"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Observações em modo de edição */}
        {editingId && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações Financeiras</label>
            <textarea
              value={editData.observacoesFinanceiras || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, observacoesFinanceiras: e.target.value }))}
              rows={3}
              placeholder="Observações sobre faturação, pagamentos, condições especiais..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        )}

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

      {/* Modal de Gestão de Pagamentos */}
      {showPagamentosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Gestão de Pagamentos</h3>
              </div>
              <button
                onClick={() => setShowPagamentosModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Resumo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">€{(editData.valorFatura || 0).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Valor Total</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700">€{(editData.pagamentos?.reduce((sum, p) => sum + p.valor, 0) || 0).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Valor Pago</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-700">€{((editData.valorFatura || 0) - (editData.pagamentos?.reduce((sum, p) => sum + p.valor, 0) || 0)).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Valor Restante</div>
                  </div>
                </div>
              </div>

              {/* Lista de Pagamentos */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Pagamentos Registados</h4>
                {(editData.pagamentos || []).length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum pagamento registado
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(editData.pagamentos || []).map((pagamento) => (
                      <div key={pagamento.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium text-gray-900">
                              €{pagamento.valor.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(pagamento.data).toLocaleDateString('pt-PT')}
                            </div>
                          </div>
                          {pagamento.observacoes && (
                            <div className="text-xs text-gray-500 mt-1">{pagamento.observacoes}</div>
                          )}
                        </div>
                        <button
                          onClick={() => removerPagamento(pagamento.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remover pagamento"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar Novo Pagamento */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Adicionar Pagamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={novoPagamento.valor || ''}
                        onChange={(e) => setNovoPagamento(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data do Pagamento</label>
                    <input
                      type="date"
                      value={novoPagamento.data}
                      onChange={(e) => setNovoPagamento(prev => ({ ...prev, data: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações do Pagamento</label>
                  <input
                    type="text"
                    value={novoPagamento.observacoes}
                    onChange={(e) => setNovoPagamento(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Transferência bancária, cheque, etc..."
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={adicionarPagamento}
                    disabled={novoPagamento.valor <= 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Pagamento</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;