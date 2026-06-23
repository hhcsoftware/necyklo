/**
 * In-memory bridge for citation text. Reference bodies can be long HTML, which
 * shouldn't travel through navigation params, so the WebView stashes the text
 * here keyed by anchor id and the formSheet route reads it back.
 */
const store = new Map<string, string>();

export function setReference(id: string, text: string): void {
  store.set(id, text);
}

export function getReference(id: string): string | undefined {
  return store.get(id);
}
