// Fire-and-forget funnel pings for the hidden hunt. Deduped per browser so the
// counts read as "people who reached this step", not raw events.
export function trackHunt(step: string) {
  try {
    const k = "hg_" + step;
    if (localStorage.getItem(k)) return;
    localStorage.setItem(k, "1");
    const url = "/api/hunt/" + step;
    if (navigator.sendBeacon) navigator.sendBeacon(url);
    else fetch(url, { method: "POST", keepalive: true }).catch(() => {});
  } catch {
    /* analytics is best-effort; never break the page */
  }
}
