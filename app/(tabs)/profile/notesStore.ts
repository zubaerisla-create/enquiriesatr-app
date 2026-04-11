import { useState, useEffect } from 'react';

export type NoteType = "LESSON" | "AI ASSISTANT" | "PERSONAL";

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  body: string;
  source: string;
  date: string;
}

const initialNotes: Note[] = [
  {
    id: "1",
    type: "LESSON",
    title: "Threat Matrix Notes",
    body: "Intent + Capability + Opportunity = Threat exists. Always evaluate all three axes before escalating",
    source: "Lesson: Threat & Risk Assessment",
    date: "22 Mar 2026",
  },
  {
    id: "2",
    type: "AI ASSISTANT",
    title: "House Search Procedure",
    body: "Key points saved from AI: 1. Establish perimeter first 2. Two-person search method 3. Clear entry point",
    source: "AI Assistant",
    date: "26 Mar 2026",
  },
  {
    id: "3",
    type: "LESSON",
    title: "SDR Planning Reminders",
    body: "SDR must have multiple decision points. Vary the route each time. Use natural cover changes (shops,",
    source: "Lesson: Surveillance Detection Routes",
    date: "18 Mar 2026",
  },
];

let notes: Note[] = [...initialNotes];
const listeners = new Set<() => void>();

export const notifyListeners = () => listeners.forEach(l => l());

export const useNotesStore = () => {
  const [state, setState] = useState(notes);
  
  useEffect(() => {
    const listener = () => setState([...notes]);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  
  return state;
};

export const addNote = (note: Note) => {
  notes = [note, ...notes];
  notifyListeners();
};

export const updateNote = (updatedNote: Note) => {
  notes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
  notifyListeners();
};

export const deleteNote = (id: string) => {
  notes = notes.filter(n => n.id !== id);
  notifyListeners();
};

export const getNote = (id: string) => {
  return notes.find(n => n.id === id);
};
