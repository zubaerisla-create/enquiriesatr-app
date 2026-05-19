import { api } from "./api";
import * as SecureStore from "expo-secure-store";

export interface SearchQuestion {
  id: number;
  key: string;
  label: string;
  order: number;
}

export interface SearchTemplate {
  id: number;
  slug: string;
  title: string;
  order: number;
  questions: SearchQuestion[];
}

export interface SearchLogPayload {
  template_slug: string;
  answers: Record<string, boolean>;
}

export interface SearchOperationPayload {
  name: string;
  notes: string;
  logs: SearchLogPayload[];
}

const TEMPLATES_CACHE_KEY = "search_templates_cache";
const PENDING_QUEUE_KEY = "pending_search_operations";

export async function fetchTemplates(): Promise<SearchTemplate[]> {
  try {
    const response = await api.get<SearchTemplate[]>("/operative-tools/templates/", { requireAuth: true });
    await SecureStore.setItemAsync(TEMPLATES_CACHE_KEY, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    const cached = await SecureStore.getItemAsync(TEMPLATES_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}

export async function getCachedTemplates(): Promise<SearchTemplate[] | null> {
  const cached = await SecureStore.getItemAsync(TEMPLATES_CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

export async function submitOperation(payload: SearchOperationPayload): Promise<{ success: boolean; queued: boolean }> {
  try {
    await api.post("/operative-tools/operations/create/", payload, { requireAuth: true });
    return { success: true, queued: false };
  } catch (error: any) {
    const isNetworkError = !error.status || error.status >= 500 || error.message?.includes("network") || error.message?.includes("Network");
    if (isNetworkError) {
      await queueOperation(payload);
      return { success: true, queued: true };
    }
    throw error;
  }
}

async function queueOperation(payload: SearchOperationPayload): Promise<void> {
  const existingQueue = await SecureStore.getItemAsync(PENDING_QUEUE_KEY);
  const queue: SearchOperationPayload[] = existingQueue ? JSON.parse(existingQueue) : [];
  queue.push(payload);
  await SecureStore.setItemAsync(PENDING_QUEUE_KEY, JSON.stringify(queue));
}

export async function syncPendingOperations(): Promise<number> {
  const existingQueue = await SecureStore.getItemAsync(PENDING_QUEUE_KEY);
  if (!existingQueue) {
    return 0;
  }

  const queue: SearchOperationPayload[] = JSON.parse(existingQueue);
  if (queue.length === 0) {
    return 0;
  }

  const remainingQueue: SearchOperationPayload[] = [];
  let syncCount = 0;

  for (const payload of queue) {
    try {
      await api.post("/operative-tools/operations/create/", payload, { requireAuth: true });
      syncCount++;
    } catch (error: any) {
      const isNetworkError = !error.status || error.status >= 500 || error.message?.includes("network") || error.message?.includes("Network");
      if (isNetworkError) {
        remainingQueue.push(payload);
      }
    }
  }

  await SecureStore.setItemAsync(PENDING_QUEUE_KEY, JSON.stringify(remainingQueue));
  return syncCount;
}
