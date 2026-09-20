// The three reader preferences live as data attributes on <html> and in
// localStorage. The inline script in Head.astro applies them before first
// paint; the components call this when the reader changes one.
const KEYS = {
  theme: "gnet-theme",
  accent: "gnet-accent",
  motion: "gnet-motion",
} as const;

export type PreferenceName = keyof typeof KEYS;

export function setPreference(name: PreferenceName, value: string): void {
  document.documentElement.dataset[name] = value;
  try {
    localStorage.setItem(KEYS[name], value);
  } catch {
    // Storage can be blocked (private windows); the choice just won't persist.
  }
}
