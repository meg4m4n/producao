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
  | 'Embalamento';

export type PageType = 'producoes' | 'registos' | 'preparar-componentes' | 'gantt' | 'historico' | 'apps-lomartex' | 'controlo-qualidade';
export type PageType = 'producoes' | 'registos' | 'preparar-componentes' | 'gantt' | 'historico' | 'apps-lomartex' | 'controlo-qualidade' | 'financeiro' | 'users';

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
  dataEstimadaEntrega: string;
  emProducao?: boolean;
  localProducao: 'Interno' | 'Externo';
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