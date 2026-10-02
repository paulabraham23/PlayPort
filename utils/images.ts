/** True when the string can be requested as a picture. Search-page links are not pictures. */
export function isDisplayableImage(uri?: string | null) {
  const trimmed = uri?.trim() ?? '';
  if (!trimmed) return false;
  if (trimmed.startsWith('data:image/')) return true;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname.replace(/^www\./, '');
    const googleSearch =
      (host === 'google.com' || host.endsWith('.google.com') || host.endsWith('.google.co.in')) &&
      url.pathname.startsWith('/search');
    return !googleSearch;
  } catch {
    return false;
  }
}

export function firstDisplayableImage(uris?: string[] | null) {
  return uris?.find((uri) => isDisplayableImage(uri));
}
