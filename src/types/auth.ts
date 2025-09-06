export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  permissions: PagePermission[];
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface PagePermission {
  page: string;
  canView: boolean;
  canEdit: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}