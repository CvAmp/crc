import { useStore } from '../store';
import type { User } from '../types';

export async function login(email: string, password: string): Promise<User> {
  try {
    // Return a default admin user
    return {
      id: 'default-admin',
      email: email,
      role: 'ADMIN' as const,
      teamId: null
    };
  } catch (err) {
    console.error('Login error:', err);
    throw new Error('Invalid email or password');
  }
}

export async function logout(): Promise<void> {
  const store = useStore.getState();
  store.setUser(null);
}

export async function getCurrentUser(): Promise<User | null> {
  // Return a default admin user
  return {
    id: 'default-admin',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    teamId: null
  };
}