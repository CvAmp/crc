'use server';

import { useStore } from '../store';
import type { User, Team } from '../types';

export async function addTeamAction(team: Omit<Team, 'id'>) {
  const store = useStore.getState();

  try {
    store.addTeam(team);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add team' 
    };
  }
}

export async function removeTeamAction(id: string) {
  const store = useStore.getState();

  try {
    store.removeTeam(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove team' 
    };
  }
}

export async function addUserAction(user: Omit<User, 'id'>) {
  const store = useStore.getState();

  try {
    store.addUser(user);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add user' 
    };
  }
}

export async function removeUserAction(id: string) {
  const store = useStore.getState();

  try {
    store.removeUser(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove user' 
    };
  }
}

export async function updateUserAction(id: string, updates: Partial<User>) {
  const store = useStore.getState();

  try {
    store.updateUser(id, updates);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update user' 
    };
  }
}