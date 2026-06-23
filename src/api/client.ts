import { Platform } from "react-native";

/** Apex host only — the www. host 301-redirects and can drop the query string. */
const API = "https://necyklopedie.org/w/api.php";

const USER_AGENT =
  "necyklo/1.0 (https://necyklopedie.org; contact: minijya@minjiya.com)";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ParamValue = string | number | boolean | undefined;
export type ApiParams = Record<string, ParamValue>;

function buildUrl(params: ApiParams): string {
  const search = new URLSearchParams({ format: "json", formatversion: "2" });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  // Anonymous CORS for the web target (the API echoes access-control-allow-origin).
  if (Platform.OS === "web") search.set("origin", "*");
  return `${API}?${search.toString()}`;
}

/**
 * Performs a MediaWiki API request and unwraps `{ error }` envelopes into
 * thrown {@link ApiError}s. Pass react-query's `signal` to support cancellation.
 */
export async function apiRequest<T>(
  params: ApiParams,
  signal?: AbortSignal,
): Promise<T> {
  // Custom headers trigger a CORS preflight in the browser, so only send the
  // Api-User-Agent on native (browsers attach their own User-Agent anyway).
  const headers: Record<string, string> =
    Platform.OS === "web"
      ? { Accept: "application/json" }
      : { Accept: "application/json", "Api-User-Agent": USER_AGENT };

  const res = await fetch(buildUrl(params), { signal, headers });
  if (!res.ok) {
    throw new ApiError("http_error", `HTTP ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as T & { error?: { code: string; info: string } };
  if (json && typeof json === "object" && "error" in json && json.error) {
    throw new ApiError(json.error.code ?? "api_error", json.error.info ?? "Unknown API error");
  }
  return json;
}
