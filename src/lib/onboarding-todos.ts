export const ONBOARDING_TODOS_EVENT = "aair:onboarding-todos";

const STORAGE_KEY = "aair:onboarding-todos";

export interface ManualTodoState {
  connected: boolean;
  events: boolean;
}

const EMPTY: ManualTodoState = { connected: false, events: false };

export function parseTodos(raw: string): ManualTodoState {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw) as Partial<ManualTodoState>;
    return {
      connected: Boolean(value.connected),
      events: Boolean(value.events),
    };
  } catch {
    return EMPTY;
  }
}

export function subscribeTodos(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ONBOARDING_TODOS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ONBOARDING_TODOS_EVENT, callback);
  };
}

export function getTodosSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function getTodosServerSnapshot() {
  return "";
}

export function setTodo(key: keyof ManualTodoState, value: boolean) {
  const current = parseTodos(getTodosSnapshot());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, [key]: value }));
  window.dispatchEvent(new Event(ONBOARDING_TODOS_EVENT));
}
