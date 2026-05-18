import { api } from "./api";

export type NoteCategory = "lessons" | "ai_assistant" | "personal";

export type NoteBackend = {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  referance: string;
  created_at: string;
  updated_at: string;
};

export type NoteCreateInput = {
  title?: string;
  content: string;
  category?: NoteCategory;
  referance?: string;
  conversation_id?: number | null;
};

export type NoteUpdateInput = {
  title?: string;
  content?: string;
  category?: NoteCategory;
  referance?: string;
};

export async function getNotes(): Promise<NoteBackend[]> {
  const response = await api.get<NoteBackend[]>("/users/notes/list/", { requireAuth: true });
  return response.data;
}

export async function createNote(input: NoteCreateInput): Promise<NoteBackend> {
  const response = await api.post<NoteBackend>("/users/notes/create/", input, { requireAuth: true });
  return response.data;
}

export async function updateNoteBackend(id: number, input: NoteUpdateInput): Promise<NoteBackend> {
  const response = await api.patch<NoteBackend>(`/users/notes/${id}/update/`, input, { requireAuth: true });
  return response.data;
}

export async function deleteNoteBackend(id: number): Promise<void> {
  await api.delete(`/users/notes/${id}/delete/`, { requireAuth: true });
}
