import { Producao, Categoria, Etapa, Estado } from '../types';

export const etapas: Etapa[] = [
  'Desenvolvimento',
  '1º proto',
  '2º proto',
  'Size-Set',
  'PPS',
  'Produção',
  'Pronto',
  'Enviado'
];

export const estados: Estado[] = [
  'Modelagem',
  'Aguarda Componentes',
  'Aguarda Malha',
  'Com Defeito',
  'Aguarda Comentários',
  'Corte',
  'Confecção',
  'Transfers',
  'Serviços Externos',
  'Embalamento'
];

export const categorias: Categoria[] = [
  { id: '1', nome: 'T-Shirts', cor: '#3B82F6' },
  { id: '2', nome: 'Polos', cor: '#10B981' },
  { id: '3', nome: 'Hoodies', cor: '#F59E0B' },
  { id: '4', nome: 'Jackets', cor: '#EF4444' },
  { id: '5', nome: 'Accessories', cor: '#8B5CF6' },
];

export const mockProducoes: Producao[] = [
  {
    id: '1',
    marca: 'Nike',
    cliente: 'SportZone',
    referenciaInterna: 'NK-001-2025',
    referenciaCliente: 'SZ-NIKE-TT-01',
    descricao: 'T-shirt básica com logotipo Nike',
    tipoPeca: 'T-Shirt',
    genero: 'Unissexo',
    tamanho: 'M',
    quantidade: 150,
    etapa: 'Desenvolvimento',
    estado: 'Modelagem',
    dataInicio: '2025-01-15',
    dataPrevisao: '2025-02-28'
  },
  {
    id: '2',
    marca: 'Adidas',
    cliente: 'Decathlon',
    referenciaInterna: 'AD-002-2025',
    referenciaCliente: 'DEC-AD-HD-02',
    descricao: 'Hoodie com capuz e bolso frontal',
    tipoPeca: 'Hoodie',
    genero: 'Masculino',
    tamanho: 'L',
    quantidade: 80,
    etapa: '1º proto',
    estado: 'Aguarda Componentes',
    dataInicio: '2025-01-10',
    dataPrevisao: '2025-03-15'
  },
  {
    id: '3',
    marca: 'Puma',
    cliente: 'JD Sports',
    referenciaInterna: 'PM-003-2025',
    referenciaCliente: 'JD-PM-PL-03',
    descricao: 'Polo com gola em contraste',
    tipoPeca: 'Polo',
    genero: 'Feminino',
    tamanho: 'S',
    quantidade: 200,
    etapa: '2º proto',
    estado: 'Confecção',
    dataInicio: '2025-01-05',
    dataPrevisao: '2025-02-20'
  },
  {
    id: '4',
    marca: 'Under Armour',
    cliente: 'Intersport',
    referenciaInterna: 'UA-004-2025',
    referenciaCliente: 'INT-UA-JK-04',
    descricao: 'Jacket técnica com detalhes refletivos',
    tipoPeca: 'Jacket',
    genero: 'Masculino',
    tamanho: 'XL',
    quantidade: 50,
    etapa: 'PPS',
    estado: 'Transfers',
    dataInicio: '2025-01-01',
    dataPrevisao: '2025-03-01'
  },
  {
    id: '5',
    marca: 'Lacoste',
    cliente: 'El Corte Inglés',
    referenciaInterna: 'LC-005-2025',
    referenciaCliente: 'ECI-LC-PL-05',
    descricao: 'Polo clássico com crocodilo bordado',
    tipoPeca: 'Polo',
    genero: 'Unissexo',
    tamanho: 'M',
    quantidade: 300,
    etapa: 'Produção',
    estado: 'Embalamento',
    dataInicio: '2024-12-20',
    dataPrevisao: '2025-02-10'
  },
  {
    id: '6',
    marca: 'Ralph Lauren',
    cliente: 'Zalando',
    referenciaInterna: 'RL-006-2025',
    referenciaCliente: 'ZAL-RL-TT-06',
    descricao: 'T-shirt premium com logo bordado',
    tipoPeca: 'T-Shirt',
    genero: 'Feminino',
    tamanho: 'S',
    quantidade: 120,
    etapa: 'Pronto',
    estado: 'Embalamento',
    dataInicio: '2024-12-15',
    dataPrevisao: '2025-01-30'
  },
  {
    id: '7',
    marca: 'Tommy Hilfiger',
    cliente: 'Amazon',
    referenciaInterna: 'TH-007-2025',
    referenciaCliente: 'AMZ-TH-HD-07',
    descricao: 'Hoodie com forro interior suave',
    tipoPeca: 'Hoodie',
    genero: 'Masculino',
    tamanho: 'L',
    quantidade: 90,
    etapa: 'Enviado',
    estado: 'Embalamento',
    dataInicio: '2024-12-01',
    dataPrevisao: '2025-01-15'
  },
  {
    id: '8',
    marca: 'Calvin Klein',
    cliente: 'Fnac',
    referenciaInterna: 'CK-008-2025',
    referenciaCliente: 'FNC-CK-TT-08',
    descricao: 'T-shirt minimalista com etiqueta lateral',
    tipoPeca: 'T-Shirt',
    genero: 'Unissexo',
    tamanho: 'M',
    quantidade: 180,
    etapa: 'Size-Set',
    estado: 'Aguarda Comentários',
    dataInicio: '2025-01-12',
    dataPrevisao: '2025-03-05'
  }
];