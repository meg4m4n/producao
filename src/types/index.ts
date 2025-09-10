export type Estado = 
  | 'Modelagem'
  | 'Aguarda Componentes'
  | 'FALTA COMPONENTES'
  | 'Aguarda Malha'
  | 'Com Defeito'
  | 'Aguarda Comentários'
  | 'Corte'
  | 'Confecção'
  | 'Transfers'
  | 'Serviços Externos'
  | 'Embalamento'
  | 'Pronto';

export type PageType = 'producoes' | 'registos' | 'preparar-componentes' | 'gantt' | 'historico' | 'apps-lomartex' | 'controlo-qualidade';
export type PageType = 'producoes' | 'registos' | 'preparar-componentes' | 'gantt' | 'historico' | 'apps-lomartex' | 'controlo-qualidade' | 'financeiro' | 'users';

export interface TipoPeca {
  id: string;
  nome: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalProducao {
  id: string;
  nome: string;
  tipo: 'Interno' | 'Externo';
  endereco?: string;
  contacto?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
export interface BOMFile {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

export interface PagamentoParcial {
  id: string;
  valor: number;
  data: string;
  observacoes?: string;
}

export interface ProducaoComment {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComponenteHistorico {
  id: string;
  producaoId: string;
  tipo: 'comentario' | 'upload_bom' | 'remover_bom' | 'marcar_completo' | 'estado_alterado';
  descricao: string;
  usuario: string;
  timestamp: string;
  detalhes?: any;
}

export interface BOMFile {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
}

export interface ProducaoComment {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Producao {
  id: string;
  codigoOP: string;
  marca: string;
  cliente: string;
  referenciaInterna: string;
  referenciaCliente: string;
  descricao: string;
  tipoPeca: string;
  genero: 'Masculino' | 'Feminino' | 'Unissexo';
  variantes: {
    cor: string;
    tamanhos: { [tamanho: string]: number };
  }[];
  etapa: Etapa;
  estado: Estado;
  dataInicio: string;
  dataPrevisao: string;
  dataFinal: string;
  tempoProducaoEstimado: number;
  tempoProducaoReal: number;
  temMolde: boolean;
  emProducao?: boolean;
  localProducao: 'Interno' | 'Externo';
  localProducaoId?: string;
  empresaExterna?: string;
  linkOdoo?: string;
  bomFiles?: BOMFile[];
  comments?: string;
  problemas?: boolean;
  pago?: boolean;
  pago_parcial?: boolean;              // atualizado para snake_case
  pagamentos?: PagamentoParcial[];     // já ok
  valor_pago?: number;                 // atualizado para snake_case
  valor_restante?: number;             // atualizado para snake_case
  fastprod?: boolean;
  observacoes_financeiras?: string;    // atualizado para snake_case
  numeroFatura?: string | null;
  dataFatura?: string | null;
  valorFatura?: number | null;
  faturado?: boolean;
}


export interface Cliente {
  id: string;
  nome: string;
  marcas: string[];
}

export interface Registo {
  id: string;
  producaoId: string;
  tipo: 'Entrada' | 'Saída' | 'Transferência';
  quantidade: number;
  data: string;
  observacoes?: string;
  operador: string;
}

export interface Marca {
  id: string;
  nome: string;
  clienteId: string;
  clienteNome: string;
}

export type Etapa = 
  | 'Desenvolvimento'
  | '1º proto'
  | '2º proto'
  | 'Size-Set'
  | 'PPS'
  | 'Produção'
  | 'Pronto'
  | 'Enviado';

// --- Controlo de Qualidade / Modelista ---

export interface TabelaMedidasModelista {
  id: string;
  producao_id: string;
  nome_tabela: string;
  data_registo: string;      // timestamp
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MedidaModelistaDetalhe {
  id: string;
  tabela_id: string;
  cor: string;
  tamanho: string;
  letra_medida: string;
  descricao_medida: string;
  medida_pedida: number;   // cm
  tolerancia: number;      // cm
  created_at?: string;
  updated_at?: string;
}

export interface QCRegisto {
  id: string;
  producao_id: string;
  data_controlo: string;     // timestamp
  cor_controlada: string;
  tamanho_controlado: string;
  responsavel?: string | null;
  resultado_geral?: 'Aprovado' | 'Reprovado' | 'Parcial' | null;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QCMedida {
  id: string;
  registo_id: string;
  letra_medida: string;
  descricao_medida: string;
  medida_pedida_modelista?: number | null;
  tolerancia_modelista?: number | null;
  medida_registada: number;
  desvio?: number | null;           // calculado
  passou_controlo?: boolean | null; // calculado
  created_at?: string;
  updated_at?: string;
}

// Novos tipos para controlo de qualidade expandido
export interface QCControloAdicional {
  id: string;
  registo_id: string;
  linhas: boolean;
  borboto: boolean;
  sujidade: boolean;
  defeito_transfer: boolean;
  peca_torta: boolean;
  problemas_ferro: boolean;
  outros_controlos?: string; // JSON para controlos adicionais
  created_at?: string;
  updated_at?: string;
}

export interface QCComentario {
  id: string;
  registo_id: string;
  comentario: string;
  usuario: string;
  created_at: string;
  updated_at?: string;
}