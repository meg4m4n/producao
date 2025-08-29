import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Activity, Users, Building } from 'lucide-react';
import { etapas, estados } from '../data/constants';
import ProducaoForm from '../components/ProducaoForm';
import ProducoesList from '../components/ProducoesList';
import ClienteForm from '../components/ClienteForm';
import MarcaForm from '../components/MarcaForm';
import { Producao, Cliente, Marca } from '../types';
import { 
  getClientes, 
  createCliente, 
  updateCliente, 
  deleteCliente,
  getMarcas,
  createMarca,
  updateMarca,
  deleteMarca,
  getProducoes,
  createProducao,
  updateProducao,
  deleteProducao
} from '../services/api';

type GestaoTab = 'producoes' | 'clientes' | 'marcas';

const Registos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GestaoTab>('producoes');
  const [clientesState, setClientesState] = useState<Cliente[]>([]);
  const [marcasState, setMarcasState] = useState<Marca[]>([]);
  const [producoesState, setProducoesState] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states

  const [producaoForm, setProducaoForm] = useState<{
    isOpen: boolean;
    producao?: Producao;
  }>({ isOpen: false });

  const [clienteForm, setClienteForm] = useState<{
    isOpen: boolean;
    cliente?: Cliente;
  }>({ isOpen: false });

  const [marcaForm, setMarcaForm] = useState<{
    isOpen: boolean;
    marca?: Marca;
  }>({ isOpen: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, marcasData, producoesData] = await Promise.all([
          getClientes(),
          getMarcas(),
          getProducoes()
        ]);
        setClientesState(clientesData);
        setMarcasState(marcasData);
        setProducoesState(producoesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateProducao = async (novaProducao: Omit<Producao, 'id'>) => {
    try {
      const producao = await createProducao(novaProducao);
      setProducoesState(prev => [...prev, producao]);
    } catch (error) {
      console.error('Error creating producao:', error);
      alert('Erro ao criar produção');
    }
  };

  const handleUpdateProducao = async (producaoAtualizada: Producao) => {
    try {
      await updateProducao(producaoAtualizada.id, producaoAtualizada);
      setProducoesState(prev => prev.map(p => 
        p.id === producaoAtualizada.id ? producaoAtualizada : p
      ));
    } catch (error) {
      console.error('Error updating producao:', error);
      alert('Erro ao atualizar produção');
    }
  };

  const handleDeleteProducao = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta produção?')) {
      try {
        await deleteProducao(id);
        setProducoesState(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting producao:', error);
        alert('Erro ao remover produção');
      }
    }
  };

  const handleSaveCliente = async (cliente: Omit<Cliente, 'id'>) => {
    try {
      if (clienteForm.cliente) {
        // Editar cliente existente
        const clienteAtualizado = await updateCliente(clienteForm.cliente.id, cliente);
        setClientesState(prev => prev.map(c => 
          c.id === clienteForm.cliente!.id ? clienteAtualizado : c
        ));
      } else {
        // Criar novo cliente
        const novoCliente = await createCliente(cliente);
        setClientesState(prev => [...prev, novoCliente]);
      }
      setClienteForm({ isOpen: false });
    } catch (error) {
      console.error('Error saving cliente:', error);
      alert('Erro ao guardar cliente');
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      try {
        await deleteCliente(id);
        setClientesState(prev => prev.filter(c => c.id !== id));
        // Atualizar marcas também
        setMarcasState(prev => prev.filter(m => m.clienteId !== id));
      } catch (error) {
        console.error('Error deleting cliente:', error);
        alert('Erro ao remover cliente');
      }
    }
  };

  const handleSaveMarca = async (marca: Omit<Marca, 'id' | 'clienteNome'>) => {
    try {
      if (marcaForm.marca) {
        // Editar marca existente
        const marcaAtualizada = await updateMarca(marcaForm.marca.id, marca);
        setMarcasState(prev => prev.map(m => 
          m.id === marcaForm.marca!.id ? marcaAtualizada : m
        ));
      } else {
        // Criar nova marca
        const novaMarca = await createMarca(marca);
        setMarcasState(prev => [...prev, novaMarca]);
      }
      setMarcaForm({ isOpen: false });
    } catch (error) {
      console.error('Error saving marca:', error);
      alert('Erro ao guardar marca');
    }
  };

  const handleDeleteMarca = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta marca?')) {
      try {
        await deleteMarca(id);
        setMarcasState(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error deleting marca:', error);
        alert('Erro ao remover marca');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar dados...</p>
        </div>
      </div>
    );
  }

  const refreshData = async () => {
    try {
      const [clientesData, marcasData, producoesData] = await Promise.all([
        getClientes(),
        getMarcas(),
        getProducoes()
      ]);
      setClientesState(clientesData);
      setMarcasState(marcasData);
      setProducoesState(producoesData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const tabs = [
    { id: 'producoes' as GestaoTab, label: 'Produções', icon: Package },
    { id: 'clientes' as GestaoTab, label: 'Clientes', icon: Users },
    { id: 'marcas' as GestaoTab, label: 'Marcas', icon: Building },
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
      
      <ProducoesList
        producoes={producoesState}
        onEdit={(producao) => {
          setProducaoForm({ isOpen: true, producao });
        }}
        onDelete={handleDeleteProducao}
        showActions={true}
        onUpdate={refreshData}
      />
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
        {clientesState.map((cliente) => (
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

  const renderMarcas = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestão de Marcas</h3>
        <button 
          onClick={() => setMarcaForm({ isOpen: true })}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Marca</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marcasState.map((marca) => (
          <div key={marca.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-900">{marca.nome}</span>
                  <p className="text-sm text-gray-500">{marca.clienteNome}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setMarcaForm({ isOpen: true, marca })}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteMarca(marca.id)}
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
        <p className="text-gray-600">Gestão completa de produções, clientes e marcas</p>
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
          {activeTab === 'marcas' && renderMarcas()}
        </div>
      </div>

      {/* Modal de Produção */}
      <ProducaoForm
        isOpen={producaoForm.isOpen}
        onClose={() => setProducaoForm({ isOpen: false })}
        onSave={async (producaoData) => {
          if (producaoForm.producao) {
            await handleUpdateProducao(producaoData as Producao);
          } else {
            await handleCreateProducao(producaoData);
          }
          setProducaoForm({ isOpen: false });
          await refreshData();
        }}
        producao={producaoForm.producao}
        clientes={clientesState}
        marcas={marcasState}
      />

      {/* Modal de Cliente */}
      <ClienteForm
        isOpen={clienteForm.isOpen}
        onClose={() => setClienteForm({ isOpen: false })}
        onSave={handleSaveCliente}
        cliente={clienteForm.cliente}
      />

      {/* Modal de Marca */}
      <MarcaForm
        isOpen={marcaForm.isOpen}
        onClose={() => setMarcaForm({ isOpen: false })}
        onSave={handleSaveMarca}
        marca={marcaForm.marca}
        clientes={clientesState}
      />
    </div>
  );
};

export default Registos;