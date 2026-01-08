import { LRUCache } from 'lru-cache';
import type { TimeSlot } from '../../types';

// Configure cache options
const CACHE_OPTIONS = {
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minute TTL
  updateAgeOnGet: true, // Update item age on access
  allowStale: false // Don't serve stale data
};

// Create slot availability cache
export const slotCache = new LRUCache<string, TimeSlot[]>(CACHE_OPTIONS);

// Cache key generator
export const generateCacheKey = (params: {
  date: string;
  productTypeId: string;
  teamId?: string;
}): string => {
  return `slots:${params.date}:${params.productTypeId}:${params.teamId || 'all'}`;
};

// Slot availability checker with caching
export const getAvailableSlots = async (params: {
  date: string;
  productTypeId: string;
  teamId?: string;
}): Promise<TimeSlot[]> => {
  const cacheKey = generateCacheKey(params);
  
  // Try cache first
  const cachedSlots = slotCache.get(cacheKey);
  if (cachedSlots) {
    return cachedSlots;
  }

  // Cache miss - fetch from store
  const slots = await fetchSlotsFromStore(params);
  
  // Cache the results
  slotCache.set(cacheKey, slots);
  
  return slots;
};

// Cache invalidation helper
export const invalidateSlotCache = (params: {
  date?: string;
  productTypeId?: string;
  teamId?: string;
}) => {
  if (!params.date && !params.productTypeId && !params.teamId) {
    // If no params, clear entire cache
    slotCache.clear();
    return;
  }

  // Clear specific cache entries matching params
  for (const key of slotCache.keys()) {
    const [, date, productId, teamId] = key.split(':');
    if (
      (!params.date || date === params.date) &&
      (!params.productTypeId || productId === params.productTypeId) &&
      (!params.teamId || teamId === params.teamId)
    ) {
      slotCache.delete(key);
    }
  }
};

// Helper to fetch slots from store
const fetchSlotsFromStore = async (params: {
  date: string;
  productTypeId: string;
  teamId?: string;
}): Promise<TimeSlot[]> => {
  // Implementation would fetch from your actual data store
  // This is just a placeholder
  return [];
};