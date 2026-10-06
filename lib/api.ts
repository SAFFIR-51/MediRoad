/**
 * PHP JSON API 호출 헬퍼 (/api/*.php, 규약은 docs/개편_사양.md 6장).
 * 응답은 { ok: true, ... } 또는 { ok: false, error, errors? }.
 * 상태를 바꾸는 요청에는 CSRF 방지용 X-Requested-With 헤더가 필수다.
 */

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type Options = { method?: "GET" | "POST"; body?: unknown; form?: FormData };

export async function api<T = Record<string, unknown>>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { "X-Requested-With": "mediroad", Accept: "application/json" };
  const init: RequestInit = { method: opts.method ?? (opts.body !== undefined || opts.form ? "POST" : "GET"), credentials: "same-origin", headers };
  if (opts.form) init.body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }
  let res: Response;
  try {
    res = await fetch(`/api/${path}`, init);
  } catch {
    throw new ApiError(0, "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  let data: { ok?: boolean; error?: string; errors?: Record<string, string> } | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok || !data?.ok) {
    throw new ApiError(res.status, data?.error || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.", data?.errors);
  }
  return data as T;
}

/** 로그인 후 돌아올 주소. `/`로 시작하고 `//`가 아닌 경우만 허용 (외부 주소로 튕기기 방지) */
export function safeNext(next: string | null | undefined, fallback = "/") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/** 현재 페이지로 돌아오는 로그인 주소 */
export function loginHref(next?: string) {
  const n = next ?? (typeof window === "undefined" ? "/" : window.location.pathname + window.location.search);
  return `/login/?next=${encodeURIComponent(n)}`;
}
