export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    credentials: "same-origin",
  });
  const data = (await response.json().catch(() => null)) as
    T | { message?: string | string[] } | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? Array.isArray(data.message)
          ? data.message[0]
          : data.message
        : undefined;
    throw new ApiRequestError(message || "REQUEST_FAILED", response.status);
  }

  return data as T;
}
