import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Tag, Activity } from 'lucide-react';
import { categorias, etapas, estados } from '../data/mockData';
import EditModal from '../components/EditModal';
import { Categoria } from '../types';

type GestaoTab = 'categorias' | 'etapas' | 'estados';

const Registos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GestaoTab>('categorias');
  const [categoriasState, setCategoriasState] = useState(categorias);
  const [etapasState, setEtapasState] = useState(etapas);
  const [estadosState, setEstadosState] = useState(estados);
  
  // Modal states
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: 'categoria' | 'etapa' | 'estado' | 'new';
    item?: any;
    index?: number;
  }>({ isOpen: false, type: 'categoria' });

  const handleSaveCategoria = (nome: string, cor?: string) => {
    if (editModal.type === 'new') {
      const novaCategoria: Categoria = {
        id: Date.now().toString(),
        nome,
        cor: cor || '#3B82F6'
      };
      setCategoriasState(prev => [...prev, novaCategoria]);
    } else if (editModal.index !== undefined) {
      setCategoriasState(prev => prev.map((cat, idx) => 
        idx === editModal.index ? { ...cat, nome, cor: cor || cat.cor } : cat
      ));
    }
    setEditModal({ isOpen: false, type: 'categoria' });
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

  const handleDelete = (type: 'categoria' | 'etapa' | 'estado', index: number) => {
    if (confirm('Tem certeza que deseja remover este item?')) {
      switch (type) {
        case 'categoria':
          setCategoriasState(prev => prev.filter((_, idx) => idx !== index));
          break;
        case 'etapa':
          setEtapasState(prev => prev.filter((_, idx) => idx !== index));
          break;
        case 'estado':
          setEstadosState(prev => prev.filter((_, idx) => idx !== index));
          break;
      }
    }
  };

  const tabs = [
    { id: 'categorias' as GestaoTab, label: 'Categorias', icon: Tag },
    { id: 'etapas' as GestaoTab, label: 'Etapas', icon: Package },
    { id: 'estados' as GestaoTab, label: 'Estados', icon: Activity },
  ];

  const renderCategorias = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestão de Categorias</h3>
        <button 
          onClick={() => setEditModal({ isOpen: true, type: 'new' })}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriasState.map((categoria, index) => (
          <div key={categoria.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: categoria.cor }}
                />
                <span className="font-medium text-gray-900">{categoria.nome}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditModal({ 
                    isOpen: true, 
                    type: 'categoria', 
                    item: categoria, 
                    index 
                  })}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete('categoria', index)}
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
        <p className="text-gray-600">Gestão de categorias, etapas e estados do sistema</p>
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
          {activeTab === 'categorias' && renderCategorias()}
          {activeTab === 'etapas' && renderEtapas()}
          {activeTab === 'estados' && renderEstados()}
        </div>
      </div>

      {/* Modal de Edição */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: 'categoria' })}
        onSave={
          activeTab === 'categorias' ? handleSaveCategoria :
          activeTab === 'etapas' ? handleSaveEtapa :
          handleSaveEstado
        }
        title={
          editModal.type === 'new' ? `Nova ${activeTab.slice(0, -1)}` :
          `Editar ${activeTab.slice(0, -1)}`
        }
        value={editModal.item || ''}
        color={editModal.item?.cor}
        showColorPicker={activeTab === 'categorias'}
      />
    </div>
  );
};

export default Registos;