import React, { useState, useEffect } from 'react';
import { X, Save, Package, Plus, Trash2, Copy } from 'lucide-react';
import { Producao, Etapa, Estado } from '../types';
import { etapas, estados } from '../data/mockData';
import { useClientes } from '../hooks/useSupabaseData';

interface ProducaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producao: Omit<Producao, 'id'>) => void;
  producao?: Producao;
}

interface TabelaItem {
  id: string;
  cor: string;
  tamanho: string;
  quantidade: number;
}

const ProducaoForm: React.FC<ProducaoFormProps> = ({ isOpen, onClose, onSave, producao }) => {
  const { clientes, loading: clientesLoading } = useClientes();
  
  const variantesToTabela = (variantes: any[]): TabelaItem[] => {
    const items: TabelaItem[] = [];
    variantes.forEach(variante => {
      Object.entries(variante.tamanhos).forEach(([tamanho, quantidade]) => {
        items.push({
          id: `${variante.cor}-${tamanho}`,
          cor: variante.cor,
          tamanho,
          quantidade: quantidade as number
        });
      });
    });
    return items;
  };

  const tabelaToVariantes = (tabela: TabelaItem[]) => {
    const variantesMap = new Map();
    
    tabela.forEach(item => {
      if (!variantesMap.has(item.cor)) {
        variantesMap.set(item.cor, { cor: item.cor, tamanhos: {} });
      }
      if (item.quantidade > 0) {
        variantesMap.get(item.cor).tamanhos[item.tamanho] = item.quantidade;
      }
    });
    
    return Array.from(variantesMap.values()).filter(v => Object.keys(v.tamanhos).length > 0);
  };

  const [formData, setFormData] = useState({
    marca: '',
    cliente: '',
    referenciaInterna: '',
    referenciaCliente: '',
    descricao: '',
    tipoPeca: '',
    genero: 'Unissexo' as const,
    etapa: 'Desenvolvimento' as Etapa,
    estado: 'Modelagem' as Estado,
    dataInicio: new Date().toISOString().split('T')[0],
    dataPrevisao: '',
    dataEstimadaEntrega: '',
    emProducao: false,
    problemas: false,
    faltaComponentes: false,
    localProducao: 'Interno' as const,
    empresaExterna: '',
    linkOdoo: ''
  });

  const [tabelaItems, setTabelaItems] = useState<TabelaItem[]>([]);
  const [novaCor, setNovaCor] = useState('');
  const [novoTamanho, setNovoTamanho] = useState('');

  // Preencher dados quando estiver a editar
  useEffect(() => {
    if (producao) {
      setFormData({
        marca: producao.marca || '',
        cliente: producao.cliente || '',
        referenciaInterna: producao.referenciaInterna || '',
        referenciaCliente: producao.referenciaCliente || '',
        descricao: producao.descricao || '',
        tipoPeca: producao.tipoPeca || '',
        genero: producao.genero || 'Unissexo',
        etapa: producao.etapa || 'Desenvolvimento',
        estado: producao.estado || 'Modelagem',
        dataInicio: producao.dataInicio || new Date().toISOString().split('T')[0],
        dataPrevisao: producao.dataPrevisao || '',
        dataEstimadaEntrega: producao.dataEstimadaEntrega || '',
        emProducao: producao.emProducao || false,
        problemas: producao.problemas || false,
        faltaComponentes: producao.estado === 'FALTA COMPONENTES' || false,
        localProducao: producao.localProducao || 'Interno',
        empresaExterna: producao.empresaExterna || '',
        linkOdoo: producao.linkOdoo || ''
      });

      setTabelaItems(variantesToTabela(producao.variantes));
    }
  }, [producao]);

  const clienteSelecionado = clientes?.find(c => c.nome === formData.cliente);
  const marcasDisponiveis = clienteSelecionado?.marcas || [];
  const coresUnicas = Array.from(new Set(tabelaItems.map(item => item.cor))).filter(Boolean);
  const tamanhosUnicos = Array.from(new Set(tabelaItems.map(item => item.tamanho))).filter(Boolean);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClienteChange = (cliente: string) => {
    setFormData(prev => ({ ...prev, cliente, marca: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const variantes = tabelaToVariantes(tabelaItems);
    const producaoData = { 
      ...formData, 
      variantes,
      estado: formData.faltaComponentes ? 'FALTA COMPONENTES' : formData.estado
    };
    delete (producaoData as any).faltaComponentes;
    onSave(producaoData);
    onClose();
  };

  // Funções de adicionar/remover/editar cores e tamanhos
  const adicionarCor = () => {
    if (!novaCor.trim() || coresUnicas.includes(novaCor.trim())) return;
    const cor = novaCor.trim();
    const novosItems: TabelaItem[] = tamanhosUnicos.length > 0
      ? tamanhosUnicos.map(tamanho => ({ id: `${cor}-${tamanho}`, cor, tamanho, quantidade: 0 }))
      : ['XS', 'S', 'M', 'L', 'XL'].map(tamanho => ({ id: `${cor}-${tamanho}`, cor, tamanho, quantidade: 0 }));
    setTabelaItems(prev => [...prev, ...novosItems]);
    setNovaCor('');
  };

  const adicionarTamanho = () => {
    if (!novoTamanho.trim() || tamanhosUnicos.includes(novoTamanho.trim().toUpperCase())) return;
    const tamanho = novoTamanho.trim().toUpperCase();
    const novosItems: TabelaItem[] = coresUnicas.length > 0
      ? coresUnicas.map(cor => ({ id: `${cor}-${tamanho}`, cor, tamanho, quantidade: 0 }))
      : [{ id: `Nova Cor-${tamanho}`, cor: 'Nova Cor', tamanho, quantidade: 0 }];
    setTabelaItems(prev => [...prev, ...novosItems]);
    setNovoTamanho('');
  };

  const removerCor = (cor: string) => {
    if (confirm(`Remover todas as entradas da cor "${cor}"?`)) {
      setTabelaItems(prev => prev.filter(item => item.cor !== cor));
    }
  };

  const removerTamanho = (tamanho: string) => {
    if (confirm(`Remover todas as entradas do tamanho "${tamanho}"?`)) {
      setTabelaItems(prev => prev.filter(item => item.tamanho !== tamanho));
    }
  };

  const removerItem = (id: string) => setTabelaItems(prev => prev.filter(item => item.id !== id));

  const duplicarLinha = (item: TabelaItem) => {
    setTabelaItems(prev => [...prev, { ...item, id: `${item.cor}-${item.tamanho}-${Date.now()}` }]);
  };

  const updateItem = (id: string, field: keyof TabelaItem, value: string | number) => {
    setTabelaItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value, id: field === 'cor' || field === 'tamanho' ? `${item.cor}-${item.tamanho}` : item.id } : item));
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setTabelaItems(prev => [...prev, { id: `nova-${Date.now()}`, cor: '', tamanho: '', quantidade: 0 }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Todo o JSX do modal permanece igual */}
        {/* Inputs agora vão aparecer preenchidos ao editar */}
        {/* ... copia todo o JSX do teu modal aqui, como já tinhas no ficheiro original ... */}
        {/* Por ex: Header, form, tabela de cores/tamanhos, datas, checkboxes, botões */}
      </div>
    </div>
  );
};

export default ProducaoForm;
