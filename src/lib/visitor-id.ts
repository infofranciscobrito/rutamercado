const KEY = "rm_visitor_id";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function hasVoted(marketId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(`rm_voted_${marketId}`) === "true";
  } catch {
    return false;
  }
}

export function markVoted(marketId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`rm_voted_${marketId}`, "true");
  } catch {
    // ignore
  }
}
