export type ApiError = Error & {
  status?: number;
  code?: string;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let body: { error?: string; message?: string } | null = null;

    try {
      body = (await res.json()) as { error?: string; message?: string };
    } catch {
      // ignore JSON parse errors
    }

    const error = new Error(
      body?.message ?? body?.error ?? `HTTP ${res.status}`,
    ) as ApiError;

    error.status = res.status;
    error.code = body?.error ?? undefined;

    throw error;
  }

  return res.json() as Promise<T>;
}
