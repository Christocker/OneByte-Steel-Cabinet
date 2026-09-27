export function isSameOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  // Fall back to Fetch Metadata when the Origin header is absent.
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) {
    return fetchSite === "same-origin";
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  return false;
}
