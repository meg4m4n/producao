export type PageType = 'producoes' | 'registos' | 'config';

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

export interface Cliente {
  id: string;
  nome: string;
  marcas: string[];
}

export interface VarianteProducao {
  cor: string;
  tamanhos: {
    [tamanho: string]: number; // tamanho -> quantidade
  };
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
  variantes: VarianteProducao[];
  etapa: Etapa;
  estado: Estado;
  dataInicio: string;
  dataPrevisao: string;
  dataEstimadaEntrega: string;
  emProducao: boolean;
  localProducao: 'Interno' | 'Externo';
  empresaExterna?: string;
  linkOdoo?: string;
}