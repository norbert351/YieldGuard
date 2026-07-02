const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  portfolio: {
    overview: () => fetchApi<any>('/portfolio'),
    positions: () => fetchApi<any>('/portfolio/positions'),
  },
  simulation: {
    list: () => fetchApi<any[]>('/simulation'),
    run: (config: any) => fetchApi<any>('/simulation', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  },
  protocols: {
    list: () => fetchApi<any[]>('/protocols'),
    rates: () => fetchApi<any[]>('/protocols/rates'),
  },
  analytics: {
    metrics: () => fetchApi<any>('/analytics/metrics'),
    history: (days: number) => fetchApi<any[]>(`/analytics/history/${days}`),
  },
};
