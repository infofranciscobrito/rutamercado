import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "rutamercado_favorites";

type Listener = () => void;

let memoryState: string[] = [];
let hydrated = false;
const listeners = new Set<Listener>();

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function writeToStorage(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / privacy-mode errors — memoryState still works this session
  }
}

function setState(next: string[]): void {
  memoryState = next;
  writeToStorage(next);
  listeners.forEach((l) => l());
}

function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  memoryState = readFromStorage();
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key !== STORAGE_KEY) return;
      memoryState = readFromStorage();
      listeners.forEach((l) => l());
    });
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string[] {
  return memoryState;
}

function getServerSnapshot(): string[] {
  return [];
}

export function useFavorites() {
  useEffect(() => {
    if (hydrated) return;
    ensureHydrated();
    // Notify this hook instance after hydration
    listeners.forEach((l) => l());
  }, []);

  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggle = useCallback((id: string) => {
    const current = memoryState;
    if (current.includes(id)) {
      setState(current.filter((v) => v !== id));
    } else {
      setState([...current, id]);
    }
  }, []);

  const remove = useCallback((id: string) => {
    setState(memoryState.filter((v) => v !== id));
  }, []);

  return {
    favorites,
    isFavorite,
    toggle,
    remove,
    count: favorites.length,
  };
}
