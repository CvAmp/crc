'use server';

import { useStore } from '../store';
import type { Acceleration } from '../components/accelerations/types';

export async function createAccelerationAction(
  data: Partial<Acceleration>,
  userId: string | undefined
) {
  const store = useStore.getState();

  try {
    store.addAcceleration({
      customer_name: data.customer_name || '',
      order_id: data.order_id || '',
      sr_id: data.sr_id || '',
      site_address: data.site_address || '',
      product_type: data.product_type || '',
      change_types: data.change_types || [],
      created_by: userId || 'anonymous'
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create acceleration' 
    };
  }
}

export async function updateAccelerationAction(
  id: number,
  data: Partial<Acceleration>
) {
  const store = useStore.getState();

  try {
    store.updateAcceleration(id, data);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update acceleration' 
    };
  }
}

export async function deleteAccelerationAction(id: number) {
  const store = useStore.getState();

  try {
    store.removeAcceleration(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete acceleration' 
    };
  }
}