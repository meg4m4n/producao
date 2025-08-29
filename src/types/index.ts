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

export type PageType = 'producoes' | 'registos' | 'preparar-componentes';

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
  modelo: string;
  cor: string;
  tamanho: string;
  quantidade: number;
  estado: Estado;
  dataEntrega: string;
  observacoes?: string;
  prioridade: 'Baixa' | 'Média' | 'Alta';
  cliente: string;
  localProducao: 'Interno' | 'Externo';
  empresaExterna?: string;
  linkOdoo?: string;
  bomFiles?: BOMFile[];
  comments?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
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