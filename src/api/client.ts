/**
 * VKO NetWatch API Client Abstraction
 * Handles communication with ASP.NET Core backend at http://localhost:5071
 * with support for SQLite entity models and CORS error handling.
 */

export const DEFAULT_BACKEND_URL = 'http://localhost:5071';

export const getApiBaseUrl = (): string => {
  const stored = localStorage.getItem('vko_api_base_url');
  // Migrate from old 5000 default if present
  if (stored && stored !== 'http://localhost:5000' && stored !== 'http://localhost:5000/api') {
    return stored;
  }
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND_URL;
};

export const setApiBaseUrl = (url: string): void => {
  localStorage.setItem('vko_api_base_url', url);
};

export const isUsingMockApi = (): boolean => {
  const stored = localStorage.getItem('vko_use_mock_api');
  if (stored !== null) return stored === 'true';
  // Disabled by default: connect directly to ASP.NET Core
  return import.meta.env.VITE_USE_MOCK_API === 'true';
};

export const setUsingMockApi = (useMock: boolean): void => {
  localStorage.setItem('vko_use_mock_api', useMock ? 'true' : 'false');
};

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errBody: any = null;
      try {
        errBody = await response.json();
      } catch {
        // ignore non-json error response
      }
      throw new ApiError(
        `ASP.NET Core [${response.status}]: ${response.statusText}`,
        response.status,
        errBody
      );
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    // Provide diagnostic error message for connection / CORS issues
    const rawMsg = error instanceof Error ? error.message : String(error);
    throw new ApiError(
      `Ошибка подключения к ASP.NET Core (${baseUrl}${cleanEndpoint}): ${rawMsg}. ` +
      `Убедитесь, что сервер запущен на ${baseUrl} и в Program.cs включен CORS (app.UseCors(...)).`,
      0
    );
  }
}
