export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/bar/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;

    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // ignore parse errors
    }

    throw new Error(message);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
