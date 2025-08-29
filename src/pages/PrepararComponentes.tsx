import React, { useState, useMemo } from 'react';
import { Package2, Upload, MessageSquare, FileText, Download, Trash2, Edit3 } from 'lucide-react';
import { mockProducoes } from '../data/mockData';
import { Producao, BOMFile } from '../types';
import ProducoesList from '../components/ProducoesList';
import BOMUploadModal from '../components/BOMUploadModal';
import CommentsModal from '../components/CommentsModal';

const PrepararComponentes: React.FC = () => {
  const [producoes, setProducoes] = useState(mockProducoes);
  const [bomModal, setBomModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });
  
  const [commentsModal, setCommentsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  // Filtrar produções que precisam de componentes
  const producoesPendentes = useMemo(() => {
    return producoes.filter(producao => 
      producao.estado === 'Aguarda Componentes' || 
      producao.estado === 'FALTA COMPONENTES' ||
      producao.etapa === 'Desenvolvimento' ||
      producao.etapa === '1º proto' ||
      producao.etapa === '2º proto'
    );
  }, [producoes]);

  const handleUploadBOM = (producaoId: string, files: BOMFile[]) => {
    setProducoes(prev => prev.map(p => 
      p.id === producaoId 
        ? { ...p, bomFiles: [...(p.bomFiles || []), ...files] }
        : p
    ));
  };

  const handleDeleteBOM = (producaoId: string, bomId: string) => {
    if (confirm('Tem certeza que deseja remover este ficheiro BOM?')) {
      setProducoes(prev => prev.map(p => 
        p.id === producaoId 
          ? { ...p, bomFiles: (p.bomFiles || []).filter(f => f.id !== bomId) }
          : p
      ));
    }
  };

  const handleUpdateComments = (producaoId: string, comments: string) => {
    setProducoes(prev => prev.map(p => 
      p.id === producaoId 
        ? { ...p, comments }
        : p
    ));
  };

  const estatisticas = useMemo(() => {
    const total = producoesPendentes.length;
    const aguardaComponentes = producoesPendentes.filter(p => p.estado === 'Aguarda Componentes').length;
    const faltaComponentes = producoesPendentes.filter(p => p.estado === 'FALTA COMPONENTES').length;
    const desenvolvimento = producoesPendentes.filter(p => p.etapa === 'Desenvolvimento').length;
    
    return { total, aguardaComponentes, faltaComponentes, desenvolvimento };
  }, [producoesPendentes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Package2 className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">A Preparar Componentes</h1>
            <p className="text-gray-600">Gestão de componentes e BOM para produções pendentes</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package2 className="w-6 h-6 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-700">{estatisticas.total}</div>
                <div className="text-sm text-orange-600">Total Pendentes</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package2 className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">{estatisticas.aguardaComponentes}</div>
                <div className="text-sm text-yellow-600">Aguarda Componentes</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package2 className="w-6 h-6 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{estatisticas.faltaComponentes}</div>
                <div className="text-sm text-red-600">Falta Componentes</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package2 className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{estatisticas.desenvolvimento}</div>
                <div className="text-sm text-blue-600">Desenvolvimento</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produções com Ações de Componentes */}
      <div className="space-y-4">
        {producoesPendentes.map((producao) => (
          <div key={producao.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações da Produção */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{producao.referenciaInterna}</h3>
                    <div className="space-y-1">
                      <p className="text-gray-600">{producao.marca} • {producao.cliente}</p>
                      <p className="text-gray-800 font-medium">{producao.descricao}</p>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          producao.etapa === 'Desenvolvimento' ? 'bg-yellow-100 text-yellow-800' :
                          producao.etapa === '1º proto' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {producao.etapa}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          producao.estado === 'FALTA COMPONENTES' ? 'bg-red-100 text-red-800' :
                          producao.estado === 'Aguarda Componentes' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {producao.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variantes Resumo */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Variantes</h4>
                  <div className="space-y-1">
                    {producao.variantes.map((variante, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: getColorHex(variante.cor) }} />
                        <span className="font-medium">{variante.cor}:</span>
                        <span className="text-gray-600">
                          {Object.entries(variante.tamanhos)
                            .filter(([_, qty]) => qty > 0)
                            .map(([tamanho, qty]) => `${tamanho}(${qty})`)
                            .join(', ')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gestão de Componentes */}
              <div className="space-y-4">
                {/* BOM Files */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Ficheiros BOM</h4>
                    <button
                      onClick={() => setBomModal({ isOpen: true, producao })}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(producao.bomFiles || []).length === 0 ? (
                      <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhum ficheiro BOM</p>
                      </div>
                    ) : (
                      (producao.bomFiles || []).map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => window.open(file.url, '_blank')}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Abrir ficheiro"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBOM(producao.id, file.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remover ficheiro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Comentários */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Comentários</h4>
                    <button
                      onClick={() => setCommentsModal({ isOpen: true, producao })}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                    {producao.comments ? (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{producao.comments}</p>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Sem comentários</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datas Importantes */}
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Início:</span> {new Date(producao.dataInicio).toLocaleDateString('pt-PT')}
                  </div>
                  <div>
                    <span className="font-medium">Previsão:</span> {new Date(producao.dataPrevisao).toLocaleDateString('pt-PT')}
                  </div>
                  <div className={`font-medium ${
                    new Date(producao.dataEstimadaEntrega) <= new Date() ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <span>Entrega:</span> {new Date(producao.dataEstimadaEntrega).toLocaleDateString('pt-PT')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {producoesPendentes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma produção pendente</h3>
            <p className="text-gray-500">Todas as produções têm os componentes preparados</p>
          </div>
        )}
      </div>

      {/* Modal de Upload BOM */}
      <BOMUploadModal
        isOpen={bomModal.isOpen}
        onClose={() => setBomModal({ isOpen: false, producao: null })}
        onUpload={(files) => {
          if (bomModal.producao) {
            handleUploadBOM(bomModal.producao.id, files);
          }
        }}
        producao={bomModal.producao}
      />

      {/* Modal de Comentários */}
      <CommentsModal
        isOpen={commentsModal.isOpen}
        onClose={() => setCommentsModal({ isOpen: false, producao: null })}
        onSave={(comments) => {
          if (commentsModal.producao) {
            handleUpdateComments(commentsModal.producao.id, comments);
          }
        }}
        producao={commentsModal.producao}
      />
    </div>
  );
};

// Helper function to get color hex values
const getColorHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Preto': '#000000',
    'Branco': '#FFFFFF',
    'Azul Marinho': '#1e3a8a',
    'Rosa': '#ec4899',
    'Rosa Claro': '#f9a8d4',
    'Cinzento': '#6b7280',
    'Azul': '#3b82f6',
    'Verde': '#10b981',
    'Vermelho': '#ef4444',
    'Amarelo': '#f59e0b'
  };
  return colorMap[colorName] || '#6b7280';
};

export default PrepararComponentes;