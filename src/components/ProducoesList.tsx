import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Package, Search, Filter, MapPin, Building, Eye, AlertTriangle, Clock, File, DollarSign  } from 'lucide-react';
import { Producao, Etapa, Estado } from '../types';
import { etapas, estados } from '../data/mockData';
import ProducaoDetailsModal from './ProducaoDetailsModal';

interface ProducoesListProps {
  producoes: Producao[];
  onEdit?: (producao: Producao) => void;
  onDelete?: (id: string) => void;
  onUpdateFlags?: (id: string, flags: { problemas?: boolean; emProducao?: boolean }) => void;
  showActions?: boolean;
}

const ProducoesList: React.FC<ProducoesListProps> = ({ 
  producoes, 
  onEdit, 
  onDelete, 
  onUpdateFlags,
  showActions = false 
}) => {
  const [filtroEtapa, setFiltroEtapa] = useState<Etapa | 'all'>('all');
  const [filtroEstado, setFiltroEstado] = useState<Estado | 'all'>('all');
  const [busca, setBusca] = useState('');
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  const getEtapaColor = (etapa: Etapa): string => {
    const colors = {
      'Desenvolvimento': 'bg-yellow-100 text-yellow-800',
      '1º proto': 'bg-orange