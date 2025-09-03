import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Activity, Users, Building, Search, Filter, Eye } from 'lucide-react';
import { etapas, estados } from '../data/mockData';
import EditModal from '../components/EditModal';
import ProducaoForm from '../components/ProducaoForm';
import ProducaoDetailsModal from '../components/ProducaoDetailsModal';
import ClienteForm from '../components/ClienteForm';
import { Producao, Cliente, Etapa, Estado } from '../types';
import { useProducoes, useClientes } from '../hooks/useSupabaseData';

type GestaoTab = 'producoes' | 'clientes' | 'etapas' | 'estados';

const Registos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GestaoTab>('producoes');
  
  const { 
    producoes, 
    loading: producoesLoading, 
    createProducao, 
    updateProducao, 
    deleteProducao, 
    updateFlags 
  } = useProducoes();
  
  const { 
    clientes, 
    loading: clientesLoading, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes();
  
  const [etapasState, setEtapasState] = useState(etapas);
  const [estadosState, setEstadosState] = useState(estados);
  
  // Filtros para produções
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'all'>('all');
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'all'>('all');
  const [busca, setBusca] = useState('');
  
  // Modal states
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: 'etapa' | 'estado' | 'new';
    item?: any;
    index?: number;
  }>({ isOpen: false, type: 'etapa' });

  const [producaoForm, setProducaoForm] = useState<{
    isOpen: boolean;
    producao?: Producao;
  }>({ isOpen: false });

  const [producaoDetails, setProducaoDetails] = useState<{
    isOpen: boolean;
    producao?: Producao;
  }>({ isOpen: false });

  const [clienteForm, setClienteForm] = useState<{
    isOpen: boolean;
    cliente?: Cliente;
  }>({ isOpen: false });

  // Filtrar produções
  const producoesFiltradas = React.useMemo(() => {
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
    }).sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
  }, [producoes, filtroEtapa, filtroEstado, busca]);

  const handleCreateProducao = async (novaProducao: Omit<Producao, 'id'>) => {
    try {
      await createProducao(novaProducao);
    } catch (err) {
      alert('Erro ao criar produção');
    }
  };

  const handleUpdateProducao = async (producaoAtualizada: Producao) => {
    try {
      await updateProducao(producaoAtualizada.id, producaoAtualizada);
    } catch (err) {
      alert('Erro ao atualizar produção');
    }
  };

  const handleUpdateFlags = async (id: string, flags: { problemas?: boolean; emProducao?: boolean }) => {
    try {
      await updateFlags(id, flags);
    } catch (err) {
      alert('Erro ao atualizar flags');
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

  const handleSaveCliente = async (cliente: Omit<Cliente, 'id'>) => {
    if (clienteForm.cliente) {
      // Editar cliente existente
      try {
        await updateCliente(clienteForm.cliente.id, cliente);
      } catch (err) {
        alert('Erro ao atualizar cliente');
      }
    } else {
      // Criar novo cliente
      try {
        await createCliente(cliente);
      } catch (err) {
        alert('Erro ao criar cliente');
      }
    }
    setClienteForm({ isOpen: false });
  };

  const handleDeleteCliente = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      try {
        await deleteCliente(id);
      } catch (err) {
        alert('Erro ao remover cliente');
      }
    }
  };

  const handleSaveEtapa = (nome: string) => {
    if (editModal.type === 'new') {
      setEtapasState(prev => [...prev, nome as any]);
    } else if (editModal.index !== undefined) {
      setEtapasState(prev => prev.map((etapa, idx) => 
        idx === editModal.index ? nome as any : etapa
      ));
    }
    setEditModal({ isOpen: false, type: 'etapa' });
  };

  const handleSaveEstado = (nome: string) => {
    if (editModal.type === 'new') {
      setEstadosState(prev => [...prev, nome as any]);
    } else if (editModal.index !== undefined) {
      setEstadosState(prev => prev.map((estado, idx) => 
        idx === editModal.index ? nome as any : estado
      ));
    }
    setEditModal({ isOpen: false, type: 'estado' });
  };

  const handleDelete = (type: 'etapa' | 'estado', index: number) => {
    if (confirm('Tem certeza que deseja remover este item?')) {
      switch (type) {
        case 'etapa':
          setEtapasState(prev => prev.filter((_, idx) => idx !== index));
          break;
        case 'estado':
          setEstadosState(prev => prev.filter((_, idx) => idx !== index));
          break;
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

  const getQuantidadeTotal = (producao: Producao): number => {
    return producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

  const tabs = [
    { id: 'producoes' as GestaoTab, label: 'Produções', icon: Package },
    { id: 'clientes' as GestaoTab, label: 'Clientes', icon: Users },
    { id: 'etapas' as GestaoTab, label: 'Etapas', icon: Building },
    { id: 'estados' as GestaoTab, label: 'Estados', icon: Activity },
  ];

  const renderProducoes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestão de Produções</h3>
        <button 
          onClick={() => setProducaoForm({ isOpen: true })}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Produção</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg p-4">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
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
                  Entrega
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
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={producao.descricao}>
                      {producao.descricao}
                    </div>
                    <div className="text-sm text-gray-500">
                      {producao.tipoPeca} • {producao.genero} • {producao.localProducao === 'Interno' ? 'Interno' : (producao.empresaExterna || 'Externo')}
                    </div>
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
                    <div className="flex flex-col space-y-1">
                      {producao.emProducao && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Em Produção
                        </span>
                      )}
                      {producao.problemas && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Com Problemas
                        </span>
                      )}
                      {!producao.emProducao && !producao.problemas && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Parado
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setProducaoDetails({ isOpen: true, producao })}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalhes completos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProducaoForm({ isOpen: true, producao })}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Editar produção"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProducao(producao.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remover produção"
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
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma produção encontrada</h3>
            <p className="text-gray-500">
              {busca || filtroEtapa !== 'all' || filtroEstado !== 'all' 
                ? 'Tente ajustar os filtros de pesquisa' 
                : 'Adicione uma nova produção para começar'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderClientes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestão de Clientes e Marcas</h3>
        <button 
          onClick={() => setClienteForm({ isOpen: true })}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">{cliente.nome}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setClienteForm({ isOpen: true, cliente })}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteCliente(cliente.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Marcas</label>
              <div className="flex flex-wrap gap-1">
                {cliente.marcas.map(marca => (
                  <span key={marca} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {marca}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEtapas = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestão de Etapas</h3>
        <button 
          onClick={() => setEditModal({ isOpen: true, type: 'new' })}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Etapa</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {etapasState.map((etapa, index) => (
          <div key={etapa} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">{etapa}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditModal({ 
                    isOpen: true, 
                    type: 'etapa', 
                    item: etapa, 
                    index 
                  })}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete('etapa', index)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEstados = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestão de Estados</h3>
        <button 
          onClick={() => setEditModal({ isOpen: true, type: 'new' })}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Estado</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {estadosState.map((estado, index) => (
          <div key={estado} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 text-sm">{estado}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditModal({ 
                    isOpen: true, 
                    type: 'estado', 
                    item: estado, 
                    index 
                  })}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete('estado', index)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registos</h1>
        <p className="text-gray-600">Gestão completa de produções, clientes, etapas e estados</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'producoes' && renderProducoes()}
          {activeTab === 'clientes' && renderClientes()}
          {activeTab === 'etapas' && renderEtapas()}
          {activeTab === 'estados' && renderEstados()}
        </div>
      </div>

      {/* Modal de Edição */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: 'etapa' })}
        onSave={
          activeTab === 'etapas' ? handleSaveEtapa : handleSaveEstado
        }
        title={
          editModal.type === 'new' ? `Nova ${activeTab.slice(0, -1)}` :
          `Editar ${activeTab.slice(0, -1)}`
        }
        value={editModal.item || ''}
        showColorPicker={false}
      />

      {/* Modal de Produção */}
      <ProducaoForm
        isOpen={producaoForm.isOpen}
        onClose={() => setProducaoForm({ isOpen: false })}
        onSave={producaoForm.producao ? handleUpdateProducao : handleCreateProducao}
        producao={producaoForm.producao}
      />

      {/* Modal de Detalhes da Produção */}
      <ProducaoDetailsModal
        isOpen={producaoDetails.isOpen}
        onClose={() => setProducaoDetails({ isOpen: false })}
        producao={producaoDetails.producao || null}
        onUpdateFlags={(flags) => {
          if (producaoDetails.producao) {
            handleUpdateFlags(producaoDetails.producao.id, flags);
          }
        }}
      />

      {/* Modal de Cliente */}
      <ClienteForm
        isOpen={clienteForm.isOpen}
        onClose={() => setClienteForm({ isOpen: false })}
        onSave={handleSaveCliente}
        cliente={clienteForm.cliente}
      />
    </div>
  );
};

export default Registos;