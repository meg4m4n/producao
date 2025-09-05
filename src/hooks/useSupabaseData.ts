import { useState, useEffect } from 'react';
import { Producao, Cliente } from '../types';
import * as supabaseApi from '../services/supabaseApi';

export const useProducoes = () => {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducoes = async () => {
    try {
      setLoading(true);
      const data = await supabaseApi.getProducoes();
      setProducoes(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produções');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducoes();
  }, []);

  const createProducao = async (producao: Omit<Producao, 'id'>) => {
    try {
      const novaProducao = await supabaseApi.createProducao(producao);
      setProducoes(prev => [...prev, novaProducao]);
      return novaProducao;
    } catch (err) {
      setError('Erro ao criar produção');
      throw err;
    }
  };

  const updateProducao = async (id: string, producao: Omit<Producao, 'id'>) => {
    try {
      const producaoAtualizada = await supabaseApi.updateProducao(id, producao);
      setProducoes(prev => prev.map(p => p.id === id ? { ...producaoAtualizada, id } : p));
      return producaoAtualizada;
    } catch (err) {
      setError('Erro ao atualizar produção');
      console.error('Update error:', err);
      throw err;
    }
  };

  const deleteProducao = async (id: string) => {
    try {
      await supabaseApi.deleteProducao(id);
      setProducoes(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Erro ao remover produção');
      throw err;
    }
  };

  const updateFlags = async (id: string, flags: { problemas?: boolean; emProducao?: boolean; faltaComponentes?: boolean; pago?: boolean }) => {
    try {
      await supabaseApi.updateProducaoFlags(id, flags);
      setProducoes(prev => prev.map(p => p.id === id ? { 
        ...p, 
        problemas: flags.problemas !== undefined ? flags.problemas : p.problemas,
        emProducao: flags.emProducao !== undefined ? flags.emProducao : p.emProducao,
        pago: flags.pago !== undefined ? flags.pago : p.pago,
        estado: flags.faltaComponentes !== undefined 
          ? (flags.faltaComponentes ? 'FALTA COMPONENTES' as const : 'Aguarda Componentes' as const)
          : p.estado
      } : p));
    } catch (err) {
      setError('Erro ao atualizar flags');
      throw err;
    }
  };

  const updateComments = async (id: string, comments: string) => {
    try {
      await supabaseApi.updateProducaoComments(id, comments);
      setProducoes(prev => prev.map(p => p.id === id ? { ...p, comments } : p));
    } catch (err) {
      setError('Erro ao atualizar comentários');
      throw err;
    }
  };

  return {
    producoes,
    loading,
    error,
    createProducao,
    updateProducao,
    deleteProducao,
    updateFlags,
    updateComments,
    refetch: fetchProducoes
  };
};

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await supabaseApi.getClientes();
      setClientes(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const createCliente = async (cliente: Omit<Cliente, 'id'>) => {
    try {
      const novoCliente = await supabaseApi.createCliente(cliente);
      setClientes(prev => [...prev, novoCliente]);
      return novoCliente;
    } catch (err) {
      setError('Erro ao criar cliente');
      throw err;
    }
  };

  const updateCliente = async (id: string, cliente: Omit<Cliente, 'id'>) => {
    try {
      const clienteAtualizado = await supabaseApi.updateCliente(id, cliente);
      setClientes(prev => prev.map(c => c.id === id ? clienteAtualizado : c));
      return clienteAtualizado;
    } catch (err) {
      setError('Erro ao atualizar cliente');
      throw err;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      await supabaseApi.deleteCliente(id);
      setClientes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError('Erro ao remover cliente');
      throw err;
    }
  };

  return {
    clientes,
    loading,
    error,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes
  };
};