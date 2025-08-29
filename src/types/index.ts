export interface Producao {
  id: string;
  marca: string;
  cliente: string;
  referenciaInterna: string;
  referenciaCliente: string;
  descricao: string;
  tipoPeca: string;
  genero: 'Masculino' | 'Feminino' | 'Unissexo';
  tamanho: string;
  quantidade: number;
  etapa: Etapa;
  estado: Estado;
  dataInicio: string;
  dataPrevisao: string;
  dataEstimadaEntrega: string;
  emProducao: boolean;
  localProducao: 'Interno' | 'Externo';
  empresaExterna?: string;
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

export type Estado = 
  | 'Modelagem'
  | 'Aguarda Componentes'
  | 'Aguarda Malha'
  | 'Com Defeito'
  | 'Aguarda Comentários'
  | 'Corte'
  | 'Confecção'
  | 'Transfers'
  | 'Serviços Externos'
  | 'Embalamento';

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

export interface ConfigBD {
  host: string;
  user: string;
  password: string;
  dbName: string;
}

export type PageType = 'producoes' | 'registos' | 'config';