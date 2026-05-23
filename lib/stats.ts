import { api } from "./api";

export interface UserStats {
  modules_completed: number;
  modules_total: number;
  avg_quiz_score: number;
  day_streak: number;
  assessments_passed: number;
  assessments_total: number;
  notes_count: number;
}

export async function fetchUserStats(): Promise<UserStats> {
  const response = await api.get<UserStats>("/users/stats/", { requireAuth: true });
  return response.data;
}
