import { supabase } from '../lib/supabase';
import { User, LoginCredentials, PagePermission } from '../types/auth';

export const authenticateUser = async (credentials: LoginCredentials): Promise<User | null> => {
  try {
    // For demo purposes, we'll use a simple password check
    // In production, you'd use proper password hashing
    if (credentials.email === 'rmegaguimaraes@gmail.com' && credentials.password === 'mega$3311225') {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .single();

      if (error) throw error;

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions as PagePermission[],
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions as PagePermission[],
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  try {
    if (!userData.password) {
      throw new Error('Palavra-passe é obrigatória');
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name,
        password: userData.password, // In production, this should be hashed
        role: userData.role,
        permissions: userData.permissions
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role,
      permissions: data.permissions as PagePermission[],
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: data.last_login
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
  try {
    const updateData: any = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      permissions: userData.permissions
    };
    
    // Only update password if provided
    if (userData.password) {
      updateData.password = userData.password; // In production, this should be hashed
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role,
      permissions: data.permissions as PagePermission[],
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: data.last_login
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};