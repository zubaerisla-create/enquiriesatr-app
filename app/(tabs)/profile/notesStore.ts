import { useState, useEffect } from 'react';
import { getNotes, createNote, updateNoteBackend, deleteNoteBackend, type NoteBackend, type NoteCategory } from "../../../lib/notes";

export type NoteType = "LESSON" | "AI ASSISTANT" | "PERSONAL";

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  body: string;
  source: string;
  date: string;
}

let notes: Note[] = [];
const listeners = new Set<() => void>();

export const notifyListeners = () => listeners.forEach(l => l());

export const mapBackendToFrontend = (n: NoteBackend): Note => {
  let mappedType: NoteType = "PERSONAL";
  if (n.category === "lessons") {
    mappedType = "LESSON";
  } else if (n.category === "ai_assistant") {
    mappedType = "AI ASSISTANT";
  }

  const dateStr = new Date(n.created_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return {
    id: String(n.id),
    type: mappedType,
    title: n.title,
    body: n.content,
    source: n.referance || (mappedType === "AI ASSISTANT" ? "AI Assistant" : ""),
    date: dateStr
  };
};

export const useNotesStore = () => {
  const [state, setState] = useState(notes);

  useEffect(() => {
    const listener = () => setState([...notes]);
    listeners.add(listener);

    if (notes.length === 0) {
      loadNotes();
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
};

export const loadNotes = async () => {
  try {
    const backendNotes = await getNotes();
    notes = backendNotes.map(mapBackendToFrontend);
    notifyListeners();
  } catch (err) {
    console.error(err);
  }
};

export const addNote = async (content: string, title?: string, category?: NoteCategory, referance?: string) => {
  try {
    const newBackend = await createNote({ content, title, category, referance });
    notes = [mapBackendToFrontend(newBackend), ...notes];
    notifyListeners();
  } catch (err) {
    console.error(err);
  }
};

export const updateNote = async (id: string, updates: { title?: string; body?: string; category?: NoteCategory; referance?: string }) => {
  try {
    const backendUpdates = {
      title: updates.title,
      content: updates.body,
      category: updates.category,
      referance: updates.referance
    };
    const updatedBackend = await updateNoteBackend(Number(id), backendUpdates);
    notes = notes.map(n => n.id === id ? mapBackendToFrontend(updatedBackend) : n);
    notifyListeners();
  } catch (err) {
    console.error(err);
  }
};

export const deleteNote = async (id: string) => {
  try {
    await deleteNoteBackend(Number(id));
    notes = notes.filter(n => n.id !== id);
    notifyListeners();
  } catch (err) {
    console.error(err);
  }
};

export const getNote = (id: string) => {
  return notes.find(n => n.id === id);
};

export default function NotesStoreRoute() {
  return null;
}
