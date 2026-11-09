// Screenshot mode for design handoff (e.g. exporting screens to Figma).
// Only active on the local dev server: /?shot&tab=explore&lesson=... opens the app in a set state
// with demo data, without touching the learner's real progress.
const q = typeof location !== "undefined" ? new URLSearchParams(location.search) : new URLSearchParams();
export const SHOT_MODE = import.meta.env?.DEV && q.has("shot");
export const shot = (k) => (SHOT_MODE ? q.get(k) : null);
