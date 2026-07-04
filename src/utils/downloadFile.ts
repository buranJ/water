// Достаёт имя файла из заголовка Content-Disposition ответа (filename* или filename).
export const parseContentDispositionFilename = (disposition: string | null): string | null => {
  if (!disposition) return null;
  const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
  if (starMatch) {
    try {
      return decodeURIComponent(starMatch[1]);
    } catch {
      return starMatch[1];
    }
  }
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match ? match[1] : null;
};

// Достраивает полный URL до файла на сервере.
// file_url с бэкенда часто относительный (/media/...). Без префикса baseUrl
// относительный fetch уходит на origin фронтенда и возвращает index.html (SPA),
// из-за чего «скачанный» файл оказывается HTML и не открывается.
export const buildFileUrl = (fileUrl: string): string => {
  const baseUrl = import.meta.env.VITE_API_KEY?.replace('/api/v1/', '') || 'https://bsv.sino0on.ru';
  return fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;
};

// Единое надёжное скачивание файла с сервера по его URL (абсолютному или /media/...).
// Авторизуемся Bearer-токеном из localStorage — так же, как всё API.
// Если blob-скачивание не удалось (например, ограничения CORS на /media), файл
// просто открывается по прямой ссылке — без показа ошибки пользователю.
export const downloadServerFile = async (fileUrl: string, fallbackName?: string): Promise<void> => {
  const fullUrl = buildFileUrl(fileUrl);

  try {
    const rawToken = localStorage.getItem('access_token');
    const token = rawToken ? JSON.parse(rawToken) : null;

    const response = await fetch(fullUrl, {
      headers: typeof token === 'string' && token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Empty file');
    }

    // Имя файла: приоритет — Content-Disposition бэка, иначе имя из URL, иначе fallback
    const name =
      parseContentDispositionFilename(response.headers.get('content-disposition')) ||
      decodeURIComponent(fileUrl.split('/').pop() || fallbackName || 'file');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('downloadServerFile: blob download failed, opening directly', error);
    const a = document.createElement('a');
    a.href = fullUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
