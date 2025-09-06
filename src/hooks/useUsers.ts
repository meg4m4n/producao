import { useState, useEffect } from 'react';
import { User } from '../types/auth';
import * as authService from '../services/authService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar utilizadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newUser = await authService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError('Erro ao criar utilizador');
      throw err;
    }
  };

  const updateUser = async (id: string, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const updatedUser = await authService.updateUser(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      setError('Erro ao atualizar utilizador');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await authService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError('Erro ao eliminar utilizador');
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
};