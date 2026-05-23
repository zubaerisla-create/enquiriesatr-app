import { api } from "./api";

export type Category = "FOUNDATION" | "TACTICAL" | "OPERATIONS" | "LEGAL";

export interface Subsection {
  id: number;
  name: string;
  order: number;
  content: string;
}

export interface Module {
  module_id: number;
  name: string;
  order: number;
  category: Category;
  description: string;
  is_free?: boolean;
}

export interface ModuleDetail extends Module {
  subsections: Subsection[];
  topic?: string[];
  use?: string;
}

export interface UserModuleProgress {
  module: number;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
}

export async function fetchModules(): Promise<Module[]> {
  const response = await api.get<Module[]>("/llm/modules/", {
    requireAuth: true,
  });
  return response.data;
}

export async function fetchModuleDetail(moduleId: number): Promise<ModuleDetail> {
  const response = await api.get<ModuleDetail>(`/llm/modules/${moduleId}/`, {
    requireAuth: true,
  });
  return response.data;
}

export async function fetchModuleProgress(): Promise<UserModuleProgress[]> {
  const response = await api.get<UserModuleProgress[]>("/llm/modules/progress/", {
    requireAuth: true,
  });
  return response.data;
}

export async function markModuleComplete(moduleId: number): Promise<{ success: boolean; progress_percent: number; status: string }> {
  const response = await api.post<{ success: boolean; progress_percent: number; status: string }>(
    `/llm/modules/${moduleId}/complete/`,
    {},
    { requireAuth: true }
  );
  return response.data;
}

export function estimateReadingTime(content: string): { hours: number; minutes: number } {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const totalMinutes = Math.max(1, Math.round(words / wordsPerMinute));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}
