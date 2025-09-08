import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TipoPeca } from '../types';

export const useTiposPeca = () => {
  const [tiposPeca, setTiposPeca] = useState<TipoPeca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiposPeca = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tipos_peca')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTiposPeca(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar tipos de peça');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposPeca();
  }, []);

  const createTipoPeca = async (tipoPeca: Omit<TipoPeca, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tipos_peca')
        .insert(tipoPeca)
        .select()
        .single();

      if (error) throw error;
      setTiposPeca(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError('Erro ao criar tipo de peça');
      throw err;
    }
  };

  const updateTipoPeca = async (id: string, tipoPeca: Omit<TipoPeca, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tipos_peca')
        .update(tipoPeca)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTiposPeca(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      setError('Erro ao atualizar tipo de peça');
      throw err;
    }
  };

  const deleteTipoPeca = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tipos_peca')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTiposPeca(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Erro ao remover tipo de peça');
      throw err;
    }
  };

  return {
    tiposPeca,
    loading,
    error,
    createTipoPeca,
    updateTipoPeca,
    deleteTipoPeca,
    refetch: fetchTiposPeca
  };
};