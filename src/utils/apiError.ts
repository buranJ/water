// Достаёт человекочитаемую причину ошибки из ответа бэка.
// Поддерживает RTK Query error ({ status, data }), где data может быть
// { error }, { detail } или { message }, а также обычные Error.
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object') {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === 'object') {
      const d = data as { error?: unknown; detail?: unknown; message?: unknown };
      const candidate = d.error ?? d.detail ?? d.message;
      if (typeof candidate === 'string' && candidate.trim()) return candidate;
    }
    if (typeof data === 'string' && data.trim()) return data;

    if (error instanceof Error && error.message) return error.message;

    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim() && msg !== 'Rejected') return msg;
  }
  return fallback;
};
