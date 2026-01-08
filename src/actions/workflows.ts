'use server';

import { useStore } from '../store';
import type { ProductType, ChangeType } from '../types';

export async function addProductTypeAction(productType: Omit<ProductType, 'id'> & { teamId: string }) {
  const store = useStore.getState();

  try {
    store.addProductType(productType);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add product type' 
    };
  }
}

export async function removeProductTypeAction(id: string) {
  const store = useStore.getState();

  try {
    store.removeProductType(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove product type' 
    };
  }
}

export async function addChangeTypeAction(changeType: Omit<ChangeType, 'id'>) {
  const store = useStore.getState();

  try {
    store.addChangeType(changeType);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add change type' 
    };
  }
}

export async function removeChangeTypeAction(id: string) {
  const store = useStore.getState();

  try {
    store.removeChangeType(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove change type' 
    };
  }
}

export async function updateChangeTypeAction(
  id: string, 
  updates: { 
    duration_minutes?: number;
    is_exclusive?: boolean;
  }
) {
  const store = useStore.getState();

  try {
    const changeType = store.changeTypes.find(ct => ct.id === id);
    if (!changeType) {
      throw new Error('Change type not found');
    }

    store.updateChangeType(id, {
      ...changeType,
      ...updates
    });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update change type' 
    };
  }
}