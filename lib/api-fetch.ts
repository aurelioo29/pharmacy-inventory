export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ApiFetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
};

export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<ApiResponse<T>> {
  const { params, headers, ...restOptions } = options;

  const queryString = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)]),
      ).toString()
    : "";

  const response = await fetch(`${url}${queryString}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}
