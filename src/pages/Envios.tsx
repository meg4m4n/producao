import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Package, Calendar, Euro, Archive, Eye, CreditCard as Edit2, Trash2 } from 'lucide-react';
import {
  getEnvios,
  createEnvio,
  updateEnvio,
  deleteEnvio,
  uploadCartaPorte,
  updateEnvioPago,
  Envio,
} from '../services/supabaseApi';
import EnvioForm, { EnvioFormData } from '../components/EnvioForm';
import EnvioDetailsModal from '../components/EnvioDetailsModal';

export default function Envios() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEnvio, setEditingEnvio] = useState<Envio | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistorico, setShowHistorico] = useState(false);
  const itemsPerPage = 10;
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    envio: Envio | null;
  }>({ isOpen: false, envio: null });

  useEffect(() => {
    loadEnvios();
  }, []);

  const loadEnvios = async () => {
    setLoading(true);
    try {
      const data = await getEnvios();
      setEnvios(data);
    } catch (error) {
      console.error('Erro ao carregar envios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnvio = async (formData: EnvioFormData) => {
    try {
      let cartaPorteUrl = null;

      if (editingEnvio) {
        // Update existing envio
        if (formData.carta_porte_file) {
          cartaPorteUrl = await uploadCartaPorte(formData.carta_porte_file, editingEnvio.id);
        }

        await updateEnvio(editingEnvio.id, {
          cliente_id: formData.cliente_id,
          descricao: formData.descricao,
          responsavel: formData.responsavel,
          pedido_por: formData.pedido_por,
          pago_por: formData.pago_por,
          transportadora: formData.transportadora,
          tracking: formData.tracking,
          valor_custo: formData.valor_custo,
          valor_cobrar: formData.valor_cobrar,
          carta_porte_url: cartaPorteUrl || editingEnvio.carta_porte_url,
          numero_fatura: formData.numero_fatura,
        });
      } else {
        // Create new envio
        const newEnvio = await createEnvio({
          cliente_id: formData.cliente_id,
          descricao: formData.descricao,
          responsavel: formData.responsavel,
          pedido_por: formData.pedido_por,
          pago_por: formData.pago_por,
          transportadora: formData.transportadora,
          tracking: formData.tracking,
          valor_custo: formData.valor_custo,
          valor_cobrar: formData.valor_cobrar,
          carta_porte_url: cartaPorteUrl,
          numero_fatura: formData.numero_fatura,
        });

        if (formData.carta_porte_file) {
          cartaPorteUrl = await uploadCartaPorte(formData.carta_porte_file, newEnvio.id);
          await updateEnvio(newEnvio.id, {
            carta_porte_url: cartaPorteUrl,
          });
        }
      }

      setShowForm(false);
      setEditingEnvio(null);
      loadEnvios();
    } catch (error) {
      console.error('Erro ao salvar envio:', error);
      alert('Erro ao salvar envio');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)}€`;
  };

  const getTrackingUrl = (transportadora: string, tracking: string): string | null => {
    if (!tracking) return null;
    
    const transportadoraLower = transportadora.toLowerCase();
    
    if (transportadoraLower.includes('tnt')) {
      return `https://www.tnt.com/express/pt_pt/site/shipping-tools/tracking.html?searchType=con&cons=${tracking}`;
    } else if (transportadoraLower.includes('dhl')) {
      return `https://www.dhl.com/pt-pt/home/tracking/tracking-express.html?submit=1&tracking-id=${tracking}`;
    } else if (transportadoraLower.includes('ups')) {
      return `https://www.ups.com/track?loc=pt_PT&tracknum=${tracking}`;
    }
    
    return null;
  };

  const handleTogglePago = async (envioId: string, currentPago: boolean) => {
    try {
      await updateEnvioPago(envioId, !currentPago);
      await loadEnvios();
    } catch (error) {
      console.error('Erro ao atualizar estado de pagamento:', error);
      alert('Erro ao atualizar estado de pagamento');
    }
  };

  const handleEditEnvio = (envio: Envio) => {
    setEditingEnvio(envio);
    setShowForm(true);
  };

  const handleDeleteEnvio = async (envioId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este envio?')) {
      return;
    }

    try {
      await deleteEnvio(envioId);
      await loadEnvios();
    } catch (error) {
      console.error('Erro ao eliminar envio:', error);
      alert('Erro ao eliminar envio');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEnvio(null);
  };

  const enviosAtivos = envios.filter(e => !e.pago);
  const enviosPagos = envios.filter(e => e.pago);

  const displayEnvios = showHistorico ? enviosPagos : enviosAtivos;
  const totalPages = Math.ceil(displayEnvios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnvios = displayEnvios.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">A carregar envios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Envios</h1>
          <p className="text-gray-600 mt-1">Gestão de envios e transportadoras</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowHistorico(!showHistorico);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showHistorico
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Archive size={20} />
            {showHistorico ? 'Ver Ativos' : 'Ver Pagos'}
          </button>
          <button
            onClick={() => {
              setEditingEnvio(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Novo Envio
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transportadora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  A Cobrar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEnvios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      {showHistorico ? 'Nenhum envio pago' : 'Nenhum envio ativo'}
                    </p>
                    <p className="text-gray-400 mt-1">
                      {showHistorico
                        ? 'Marque envios como pagos para movê-los para o histórico'
                        : 'Clique em "Novo Envio" para criar o primeiro envio'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentEnvios.map((envio) => (
                  <tr
                    key={envio.id}
                    className={`transition-colors ${
                      envio.pago
                        ? 'bg-green-50 hover:bg-green-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={envio.pago ? 'pago' : 'pendente'}
                        onChange={(e) => handleTogglePago(envio.id, envio.pago)}
                        className={`px-3 py-1 text-sm font-medium rounded-lg border-0 cursor-pointer transition-colors ${
                          envio.pago
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(envio.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {envio.cliente_nome || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={envio.descricao}>
                        {envio.descricao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{envio.transportadora}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {envio.tracking ? (
                        (() => {
                          const trackingUrl = getTrackingUrl(envio.transportadora, envio.tracking);
                          return trackingUrl ? (
                            <a
                              href={trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink size={14} />
                              {envio.tracking}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-600">{envio.tracking}</span>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <Euro size={14} className="text-gray-400" />
                        {formatCurrency(envio.valor_cobrar)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailsModal({ isOpen: true, envio })}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Ver todos os detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditEnvio(envio)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="Editar envio"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEnvio(envio.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar envio"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                A mostrar {startIndex + 1} a {Math.min(endIndex, displayEnvios.length)} de {displayEnvios.length}{' '}
                envios {showHistorico ? 'pagos' : 'ativos'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <EnvioForm
          onSubmit={handleCreateEnvio}
          onClose={handleCloseForm}
          editingEnvio={editingEnvio}
        />
      )}

      {/* Modal de Detalhes */}
      <EnvioDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, envio: null })}
        envio={detailsModal.envio}
      />
    </div>
  );
}
