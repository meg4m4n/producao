import { Producao, Cliente, Etapa, Estado } from '../types';

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

export const clientes: Cliente[] = [
  { 
    id: '1', 
    nome: 'SportZone', 
    marcas: ['Nike', 'Adidas', 'Puma'] 
  },
  { 
    id: '2', 
    nome: 'Decathlon', 
    marcas: ['Adidas', 'Under Armour', 'Quechua'] 
  },
  { 
    id: '3', 
    nome: 'JD Sports', 
    marcas: ['Puma', 'Nike', 'Jordan'] 
  },
  { 
    id: '4', 
    nome: 'Intersport', 
    marcas: ['Under Armour', 'Nike', 'Adidas'] 
  },
  { 
    id: '5', 
    nome: 'El Corte Inglés', 
    marcas: ['Lacoste', 'Ralph Lauren', 'Tommy Hilfiger'] 
  },
  { 
    id: '6', 
    nome: 'Zalando', 
    marcas: ['Ralph Lauren', 'Calvin Klein', 'Tommy Hilfiger'] 
  },
  { 
    id: '7', 
    nome: 'Amazon', 
    marcas: ['Tommy Hilfiger', 'Calvin Klein', 'Lacoste'] 
  },
  { 
    id: '8', 
    nome: 'Fnac', 
    marcas: ['Calvin Klein', 'Nike', 'Adidas'] 
  }
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
    variantes: [
      {
        cor: 'Preto',
        tamanhos: { 'S': 30, 'M': 50, 'L': 40, 'XL': 30 }
      },
      {
        cor: 'Branco',
        tamanhos: { 'S': 25, 'M': 45, 'L': 35, 'XL': 25 }
      }
    ],
    etapa: 'Desenvolvimento',
    estado: 'Modelagem',
    dataInicio: '2025-01-15',
    dataPrevisao: '2025-02-28',
    dataEstimadaEntrega: '2025-03-05',
    emProducao: true,
    localProducao: 'Interno',
    linkOdoo: 'https://odoo.example.com/production/1'
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
    variantes: [
      {
        cor: 'Azul Marinho',
        tamanhos: { 'M': 20, 'L': 30, 'XL': 30 }
      }
    ],
    etapa: '1º proto',
    estado: 'Aguarda Componentes',
    dataInicio: '2025-01-10',
    dataPrevisao: '2025-03-15',
    dataEstimadaEntrega: '2025-03-20',
    emProducao: true,
    localProducao: 'Externo',
    empresaExterna: 'TextilPro Lda'
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
    variantes: [
      {
        cor: 'Rosa',
        tamanhos: { 'XS': 40, 'S': 60, 'M': 50, 'L': 30 }
      },
      {
        cor: 'Branco',
        tamanhos: { 'XS': 20, 'S': 40, 'M': 30, 'L': 20 }
      }
    ],
    etapa: '2º proto',
    estado: 'Confecção',
    dataInicio: '2025-01-05',
    dataPrevisao: '2025-02-20',
    dataEstimadaEntrega: '2025-02-25',
    emProducao: true,
    localProducao: 'Interno'
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
    variantes: [
      {
        cor: 'Preto',
        tamanhos: { 'L': 25, 'XL': 25 }
      }
    ],
    etapa: 'PPS',
    estado: 'Transfers',
    dataInicio: '2025-01-01',
    dataPrevisao: '2025-03-01',
    dataEstimadaEntrega: '2025-01-28',
    emProducao: false,
    localProducao: 'Externo',
    empresaExterna: 'Fashion Works'
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
    variantes: [
      {
        cor: 'Branco',
        tamanhos: { 'S': 50, 'M': 100, 'L': 75, 'XL': 50 }
      },
      {
        cor: 'Azul Marinho',
        tamanhos: { 'S': 25, 'M': 50, 'L': 40, 'XL': 25 }
      }
    ],
    etapa: 'Produção',
    estado: 'Embalamento',
    dataInicio: '2024-12-20',
    dataPrevisao: '2025-02-10',
    dataEstimadaEntrega: '2025-02-15',
    emProducao: true,
    localProducao: 'Interno'
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
    variantes: [
      {
        cor: 'Rosa Claro',
        tamanhos: { 'XS': 30, 'S': 40, 'M': 30, 'L': 20 }
      }
    ],
    etapa: 'Pronto',
    estado: 'Embalamento',
    dataInicio: '2024-12-15',
    dataPrevisao: '2025-01-30',
    dataEstimadaEntrega: '2025-01-30',
    emProducao: false,
    localProducao: 'Interno'
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
    variantes: [
      {
        cor: 'Cinzento',
        tamanhos: { 'M': 30, 'L': 35, 'XL': 25 }
      }
    ],
    etapa: 'Enviado',
    estado: 'Embalamento',
    dataInicio: '2024-12-01',
    dataPrevisao: '2025-01-15',
    dataEstimadaEntrega: '2025-01-15',
    emProducao: false,
    localProducao: 'Interno'
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
    variantes: [
      {
        cor: 'Preto',
        tamanhos: { 'S': 45, 'M': 60, 'L': 45, 'XL': 30 }
      }
    ],
    etapa: 'Size-Set',
    estado: 'Aguarda Comentários',
    dataInicio: '2025-01-12',
    dataPrevisao: '2025-03-05',
    dataEstimadaEntrega: '2025-01-27',
    emProducao: true,
    localProducao: 'Externo',
    empresaExterna: 'Premium Textiles'
  }
];