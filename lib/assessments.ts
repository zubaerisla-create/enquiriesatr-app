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
