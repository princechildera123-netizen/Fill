import { FormDocument } from '../types/fill';

const HISTORY_STORAGE_KEY = 'fill_forms_history_v1';

export function loadFormsHistory(): FormDocument[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading forms history:', err);
    return [];
  }
}

export function saveFormsHistory(forms: FormDocument[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(forms));
  } catch (err) {
    console.error('Error saving forms history:', err);
  }
}

export function upsertFormToHistory(form: FormDocument): void {
  const list = loadFormsHistory();
  const idx = list.findIndex((f) => f.id === form.id);
  if (idx >= 0) {
    list[idx] = form;
  } else {
    list.unshift(form);
  }
  saveFormsHistory(list);
}

export function deleteFormFromHistory(formId: string): void {
  const list = loadFormsHistory().filter((f) => f.id !== formId);
  saveFormsHistory(list);
}

export const saveFormDocument = upsertFormToHistory;
export const deleteFormDocument = deleteFormFromHistory;

export function clearFormsHistory(): void {
  saveFormsHistory([]);
}
