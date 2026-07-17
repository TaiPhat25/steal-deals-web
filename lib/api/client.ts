const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7282";

export class ApiClientError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseBody = await parseResponse(response);

  if (!response.ok) {
    const errorMessage =
      typeof responseBody === "object" && responseBody !== null && "detail" in responseBody
        ? String(responseBody.detail)
        : typeof responseBody === "object" && responseBody !== null && "message" in responseBody
          ? String(responseBody.message)
          : "The request failed.";

    throw new ApiClientError(response.status, errorMessage, responseBody);
  }

  return responseBody as T;
}
