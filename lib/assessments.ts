import { api } from "./api";

export interface AssessmentQuestion {
  [questionKey: string]: any;
  options: string[];
  correct_option: string;
  justification: string;
}

export interface AssessmentResponse {
  success: boolean;
  module_id: number;
  assessment: AssessmentQuestion[];
}

export async function generateAssessment(moduleId: number): Promise<AssessmentResponse> {
  const response = await api.post<AssessmentResponse>(
    "/llm/assessments/",
    { module_id: moduleId },
    { requireAuth: true }
  );
  return response.data;
}

export interface AssessmentSubmission {
  module_id: number;
  score: number;
  total_questions: number;
  percent: number;
  passed: boolean;
  answers: any;
}

export interface UserAssessmentAttempt {
  id: number;
  module_id: number;
  module_name: string;
  score: number;
  total_questions: number;
  percent: number;
  passed: boolean;
  created_at: string;
  answers?: any;
}

export async function submitAssessment(data: AssessmentSubmission): Promise<{ success: boolean; id: number }> {
  const response = await api.post<{ success: boolean; id: number }>(
    "/llm/assessments/submit/",
    data,
    { requireAuth: true }
  );
  return response.data;
}

export async function fetchAssessmentHistory(): Promise<UserAssessmentAttempt[]> {
  const response = await api.get<UserAssessmentAttempt[]>(
    "/llm/assessments/history/",
    { requireAuth: true }
  );
  return response.data;
}

export async function fetchAssessmentDetail(attemptId: number): Promise<UserAssessmentAttempt> {
  const response = await api.get<UserAssessmentAttempt>(
    `/llm/assessments/history/${attemptId}/`,
    { requireAuth: true }
  );
  return response.data;
}
