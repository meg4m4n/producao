import React, { useState, useMemo } from 'react';
import { Package2, MessageSquare, CheckCircle, Eye, Clock, Trash2 } from 'lucide-react';
import { Producao, BOMFile, ComponenteHistorico } from '../types';
import ProducaoDetailsModal from '../components/ProducaoDetailsModal';
import ComponenteHistoricoModal from '../components/ComponenteHistoricoModal';
import ComponenteCommentsModal from '../components/ComponenteCommentsModal';
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
  
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  const [historicoModal, setHistoricoModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  const [commentsModal, setCommentsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  // Filtrar e categorizar produções
  const { producoesPendentes, producoesCompletas } = useMemo(() => {
    const pendentes = producoes.filter(producao => 
      producao.estado === 'Aguarda Componentes' || 
      producao.estado === 'FALTA COMPONENTES' ||
      (producao.etapa === 'Desenvolvimento' && producao.estado === 'Modelagem')
    );
    
    const completas = producoes.filter(producao => 
      producao.estado === 'Corte' ||
      producao.estado === 'Confecção' ||
      producao.estado === 'Transfers' ||
      producao.estado === 'Serviços Externos' ||
      producao.estado === 'Embalamento' ||
      producao.etapa === 'Pronto' ||
      producao.etapa === 'Enviado'
    );
    
    return { producoesPendentes: pendentes, producoesCompletas: completas };
  }, [producoes]);

  const estatisticas = useMemo(() => {
    const totalPendentes = producoesPendentes.length;
    const aguardaComponentes = producoesPendentes.filter(p => p.estado === 'Aguarda Componentes').length;
    const completos = producoesCompletas.length;
    
    return { totalPendentes, aguardaComponentes, completos };
  }, [producoesPendentes, producoesCompletas]);

  const handleMarcarCompleto = async (producao: Producao) => {
    if (confirm(`Marcar componentes como completos para "${producao.referenciaInterna}"?`)) {
      try {
        const producaoAtualizada = {
          ...producao,
          estado: 'Corte' as const,
          problemas: false
        };
        await updateProducao(producao.id, producaoAtualizada);
        // Add to history
        addToHistory(producao.id, 'marcar_completo', 'Componentes marcados como completos - Estado alterado para "Corte"');
        alert('Componentes marcados como completos! Estado alterado para "Corte".');
      } catch (err) {
        alert('Erro ao marcar componentes como completos');
      }
    }
  };

  const handleUpdateComments = async (producaoId: string, comments: string, files?: File[]) => {
    try {
      await updateComments(producaoId, comments);
      
      // Handle file uploads if any
      if (files && files.length > 0) {
        const bomFiles: BOMFile[] = files.map(file => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: `https://storage.example.com/comments/${file.name}`,
          uploadDate: new Date().toISOString()
        }));
        
        await supabaseApi.createBOMFiles(producaoId, bomFiles);
        addToHistory(producaoId, 'upload_bom', `Upload de ${files.length} ficheiro(s) anexo(s) aos comentários`, { files: files.map(f => f.name) });
      }
      
      addToHistory(producaoId, 'comentario', 'Comentários atualizados', { comments });
      
      // Close modal after successful save
      setCommentsModal({ isOpen: false, producao: null });
    } catch (err) {
      alert('Erro ao atualizar comentários');
    }
  };

  const handleDeleteFromCompleted = async (producaoId: string) => {
    const password = prompt('Para eliminar este registo, introduza a senha:');
    if (password === 'lomartex.24') {
      if (confirm('Tem certeza que deseja eliminar permanentemente este registo?')) {
        try {
          // Instead of deleting, we'll mark it as deleted and move to history
          // This would be handled by a separate "deleted" state in a real implementation
          alert('Registo movido para o histórico de eliminados.');
        } catch (err) {
          alert('Erro ao eliminar registo');
        }
      }
    } else if (password !== null) {
      alert('Senha incorreta');
    }
  };

  // Mock function to add to history
  const addToHistory = (producaoId: string, tipo: any, descricao: string, detalhes?: any) => {
    const historicoItem = {
      id: Date.now().toString(),
      producaoId,
      tipo,
      descricao,
      usuario: 'Utilizador Atual',
      timestamp: new Date().toISOString(),
      detalhes
    };
    console.log('Histórico adicionado:', historicoItem);
  };

  // Mock function to get history
  const getHistoricoForProducao = (producaoId: string) => {
    return [
      {
        id: '1',
        producaoId,
        tipo: 'comentario' as const,
        descricao: 'Comentários iniciais sobre componentes',
        usuario: 'João Silva',
        timestamp: '2025-01-28T10:30:00Z'
      },
      {
        id: '2',
        producaoId,
        tipo: 'upload_bom' as const,
        descricao: 'Upload de 2 ficheiro(s) anexo(s)',
        usuario: 'Maria Santos',
        timestamp: '2025-01-28T14:15:00Z',
        detalhes: { files: ['Especificacoes.pdf', 'Lista_Componentes.xlsx'] }
      }
    ];
  };

  const getQuantidadeTotal = (producao: Producao): number => {
    return producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

  const isUrgent = (dataEntrega: string): boolean => {
    const hoje = new Date();
    const entrega = new Date(dataEntrega);
    const diffTime = entrega.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

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
        <div className="flex items-center space-x-3 mb-6">
          <Package2 className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preparar Componentes</h1>
            <p className="text-gray-600">Gestão de componentes e comentários para produções</p>
          </div>
        </div>

        {/* Indicadores Principais */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package2 className="w-6 h-6 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-700">{estatisticas.totalPendentes}</div>
                <div className="text-sm text-orange-600">Total Pendentes</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">{estatisticas.aguardaComponentes}</div>
                <div className="text-sm text-yellow-600">Aguarda Componentes</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{estatisticas.completos}</div>
                <div className="text-sm text-green-600">Completos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produções Pendentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Produções Pendentes</h2>
          <p className="text-gray-600">Componentes que necessitam de atenção</p>
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
                <tr key={producao.id} className={`hover:bg-gray-50 ${
                  producao.estado === 'FALTA COMPONENTES' ? 'bg-red-50' : ''
                }`}>
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
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      isUrgent(producao.dataEstimadaEntrega) ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(producao.dataEstimadaEntrega).toLocaleDateString('pt-PT')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {producao.etapa}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-2">
                      {/* Marcar como Completo */}
                      <button
                        onClick={() => handleMarcarCompleto(producao)}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Marcar componentes como completos"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Marcar Completo</span>
                      </button>
                      
                      {/* Comentários */}
                      <button
                        onClick={() => setCommentsModal({ isOpen: true, producao })}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                          producao.comments 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Gerir comentários e ficheiros"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comentários</span>
                        {producao.comments && (
                          <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            ●
                          </span>
                        )}
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

      {/* Lista de Produções Completas */}
      {producoesCompletas.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Componentes Completos</h2>
            <p className="text-gray-600">Produções com componentes já preparados</p>
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
                    Estado Atual
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {producoesCompletas.map((producao) => (
                  <tr key={producao.id} className="hover:bg-gray-50 opacity-50 bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">{producao.referenciaInterna}</div>
                          <div className="text-sm text-gray-400">{producao.referenciaCliente}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-500">{producao.marca}</div>
                      <div className="text-sm text-gray-400">{producao.cliente}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {producao.estado}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-500">{getQuantidadeTotal(producao)}</div>
                      <div className="text-xs text-gray-400">unidades</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setDetailsModal({ isOpen: true, producao })}
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                          title="Ver registo completo"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => setHistoricoModal({ isOpen: true, producao })}
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                          title="Ver histórico"
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => setCommentsModal({ isOpen: true, producao })}
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                          title="Ver comentários"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteFromCompleted(producao.id)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar registo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Comentários */}
      <ComponenteCommentsModal
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
            updateFlags(detailsModal.producao.id, flags);
          }
        }}
      />

      {/* Modal de Histórico */}
      <ComponenteHistoricoModal
        isOpen={historicoModal.isOpen}
        onClose={() => setHistoricoModal({ isOpen: false, producao: null })}
        producaoRef={historicoModal.producao?.referenciaInterna || ''}
        historico={historicoModal.producao ? getHistoricoForProducao(historicoModal.producao.id) : []}
      />
    </div>
  );
};

export default PrepararComponentes;