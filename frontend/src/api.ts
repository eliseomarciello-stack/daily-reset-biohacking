import Constants from 'expo-constants';

const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_BACKEND_URL;

if (!backendUrl) {
  // Fail fast — no fallback URLs by design.
  // eslint-disable-next-line no-console
  console.warn('EXPO_PUBLIC_BACKEND_URL is not defined');
}

export const API_BASE = `${backendUrl}/api`;

export type ResetInput = {
  energy_score: number;
  focus_score: number;
  stress_score: number;
  sleep_score: number;
  movement_type: string;
  body_feeling: string;
  nutrition_status: string;
  cravings_level: string;
  caffeine_use: string;
  natural_light: string;
  routine_done: string;
  improvement_area: string;
  available_time: string;
};

export type Reset = ResetInput & {
  id: string;
  created_at: string;
  generated_pattern: string;
  generated_summary: string;
  generated_worked: string;
  generated_friction: string;
  generated_adjustment: string;
  generated_micro_action: string;
  generated_avoidance: string;
};

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Errore ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  createReset: (input: ResetInput) =>
    req<Reset>('/resets', { method: 'POST', body: JSON.stringify(input) }),
  listResets: () => req<Reset[]>('/resets'),
  getReset: (id: string) => req<Reset>(`/resets/${id}`),
  submitEmailLead: (email: string) =>
    req<{ id: string; email: string; created_at: string }>('/email-leads', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};
