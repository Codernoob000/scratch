export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const val = localStorage.getItem(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable or quota exceeded
    }
  },
};

