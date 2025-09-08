import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LocalProducao } from '../types';

export const useLocaisProducao = () => {
  const [locaisProducao, setLocaisProducao] = useState<LocalProducao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocaisProducao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locais_producao')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setLocaisProducao(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar locais de produção');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocaisProducao();
  }, []);

  const createLocalProducao = async (local: Omit<LocalProducao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('locais_producao')
        .insert(local)
        .select()
        .single();

      if (error) throw error;
      setLocaisProducao(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError('Erro ao criar local de produção');
      throw err;
    }
  };

  const updateLocalProducao = async (id: string, local: Omit<LocalProducao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('locais_producao')
        .update(local)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLocaisProducao(prev => prev.map(l => l.id === id ? data : l));
      return data;
    } catch (err) {
      setError('Erro ao atualizar local de produção');
      throw err;
    }
  };

  const deleteLocalProducao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locais_producao')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      setLocaisProducao(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      setError('Erro ao desativar local de produção');
      throw err;
    }
  };

  return {
    locaisProducao,
    loading,
    error,
    createLocalProducao,
    updateLocalProducao,
    deleteLocalProducao,
    refetch: fetchLocaisProducao
  };
};