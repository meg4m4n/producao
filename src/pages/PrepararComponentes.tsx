import React, { useState, useMemo } from 'react';
import { Package2, Upload, MessageSquare, FileText, Download, Trash2, Edit3, Eye, Edit } from 'lucide-react';
import { Producao, BOMFile } from '../types';
import BOMUploadModal from '../components/BOMUploadModal';
import CommentsModal from '../components/CommentsModal';
import ProducaoDetailsModal from '../components/ProducaoDetailsModal';
import ProducaoForm from '../components/ProducaoForm';
import { useProducoes } from '../hooks/useSupabaseData';
import * as supabaseApi from '../services/supabaseApi';

const PrepararComponentes: React.FC = () => {
  const { 
    producoes, 
    loading, 
    error, 
    updateProducao, 
    updateFlags, 
    updateComments 
  } = useProducoes();
  
  const [bomModal, setBomModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });
  
  const [commentsModal, setCommentsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  // Filtrar produções que precisam de componentes
  const producoesPendentes = useMemo(() => {
    return producoes.filter(producao => 
      producao.estado === 'Aguarda Componentes' || 
      producao.estado === 'FALTA COMPONENTES' ||
      (producao.etapa === 'Desenvolvimento' && producao.estado === 'Modelagem')
    );
  }, [producoes]);

  const handleUploadBOM = async (producaoId: string, files: BOMFile[]) => {
    try {
      await supabaseApi.createBOMFiles(producaoId, files);
      // Refresh data to get updated BOM files
      window.location.reload();
    } catch (err) {
      alert('Erro ao fazer upload dos ficheiros BOM');
    }
  };

  const handleDeleteBOM = async (producaoId: string, bomId: string) => {
    if (confirm('Tem certeza que deseja remover este ficheiro BOM?')) {
      try {
        await supabaseApi.deleteBOMFile(bomId);
        // Refresh data to get updated BOM files
        window.location.reload();
      } catch (err) {
        alert('Erro ao remover ficheiro BOM');
      }
    }
  };

  const handleUpdateComments = async (producaoId: string, comments: string) => {
    try {
      await updateComments(producaoId, comments);
    } catch (err) {
      alert('Erro ao atualizar comentários');
    }
  };

  const handleUpdateFlags = async (id: string, flags: { problemas?: boolean; emProducao?: boolean }) => {
    try {
      await updateFlags(id, flags);
    } catch (err) {
      alert('Erro ao atualizar flags');
    }
  };

  const handleUpdateProducao = async (producaoAtualizada: Producao) => {
    try {
      await updateProducao(producaoAtualizada.id, producaoAtualizada);
    } catch (err) {
      alert('Erro ao atualizar produção');
    }
    setEditModal({ isOpen: false, producao: null });
  };

  const getQuantidadeTotal = (producao: Producao): number => {
    return producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

  const estatisticas = useMemo(() => {
    const total = producoesPendentes.length;
    const aguardaComponentes = producoesPendentes.filter(p => p.estado === 'Aguarda Componentes').length;
    const faltaComponentes = producoesPendentes.filter(p => p.estado === 'FALTA COMPONENTES').length;
    const desenvolvimento = producoesPendentes.filter(p => p.etapa === 'Desenvolvimento').length;
    
    return { total, aguardaComponentes, faltaComponentes, desenvolvimento };
  }, [producoesPendentes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Package2 className="w-6 h-6 text-red-600" />
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

      {/* Tabela de Produções Pendentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Produções Pendentes de Componentes</h2>
          <p className="text-gray-600">Gerir BOM e comentários para produções que aguardam componentes</p>
        </div>

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
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOM
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comentários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {producoesPendentes.map((producao) => (
                <tr key={producao.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producao.referenciaInterna}</div>
                        <div className="text-sm text-gray-500">{producao.referenciaCliente}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{producao.marca}</div>
                    <div className="text-sm text-gray-500">{producao.cliente}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      producao.estado === 'FALTA COMPONENTES' ? 'bg-red-100 text-red-800' :
                      producao.estado === 'Aguarda Componentes' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {producao.estado}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-blue-600">{getQuantidadeTotal(producao)}</div>
                    <div className="text-xs text-gray-500">unidades</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        (producao.bomFiles || []).length > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <FileText className="w-3 h-3 mr-1" />
                        {(producao.bomFiles || []).length}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      producao.comments 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {producao.comments ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      new Date(producao.dataEstimadaEntrega) <= new Date() ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(producao.dataEstimadaEntrega).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {producao.etapa}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setBomModal({ isOpen: true, producao })}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Upload BOM"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCommentsModal({ isOpen: true, producao })}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Editar comentários"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditModal({ isOpen: true, producao })}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Editar registo completo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDetailsModal({ isOpen: true, producao })}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Ver registo completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {producoesPendentes.length === 0 && (
          <div className="text-center py-12">
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

      {/* Modal de Detalhes */}
      <ProducaoDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, producao: null })}
        producao={detailsModal.producao}
        onUpdateFlags={(flags) => {
          if (detailsModal.producao) {
            handleUpdateFlags(detailsModal.producao.id, flags);
          }
        }}
      />

      {/* Modal de Edição */}
      <ProducaoForm
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, producao: null })}
        onSave={handleUpdateProducao}
        producao={editModal.producao || undefined}
      />
    </div>
  );
};

export default PrepararComponentes;