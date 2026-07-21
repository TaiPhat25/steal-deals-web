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

type AccessTokenRefreshHandler = () => Promise<string | null>;

let accessTokenRefreshHandler: AccessTokenRefreshHandler | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setAccessTokenRefreshHandler(
  handler: AccessTokenRefreshHandler | null,
) {
  accessTokenRefreshHandler = handler;
}

function refreshAccessTokenOnce() {
  if (!accessTokenRefreshHandler) {
    return Promise.resolve(null);
  }

  if (!refreshInFlight) {
    refreshInFlight = accessTokenRefreshHandler().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

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

  const sendRequest = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let response = await sendRequest();

  const shouldRefresh =
    response.status === 401 &&
    requestHeaders.has("Authorization") &&
    path !== "/api/auth/refresh";

  if (shouldRefresh) {
    const newAccessToken = await refreshAccessTokenOnce();

    if (newAccessToken) {
      requestHeaders.set("Authorization", `Bearer ${newAccessToken}`);
      response = await sendRequest();
    }
  }

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
