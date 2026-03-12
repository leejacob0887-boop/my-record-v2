export function useDraft<T>(key: string) {
  const load = (): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };

  const save = (data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const clear = () => {
    localStorage.removeItem(key);
  };

  return { load, save, clear };
}
