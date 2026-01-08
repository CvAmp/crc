'use server';

import { useStore } from '../store';
import type { User } from '../types';

export async function loginAction(email: string, password: string) {
  const store = useStore.getState();

  try {
    // Create admin user
    const user: User = {
      id: Math.random().toString(36).substring(2),
      email,
      role: 'ADMIN'
    };
    
    store.setUser(user);
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log in' 
    };
  }
}

export async function logoutAction() {
  const store = useStore.getState();

  try {
    store.setUser(null);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log out' 
    };
  }
}