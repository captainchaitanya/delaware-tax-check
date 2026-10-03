import type { ThemePreference } from "./storage";

export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): "light" | "dark" {
  if (preference === "system") {
    return systemDark ? "dark" : "light";
  }
  return preference;
}

export function applyDocumentTheme(preference: ThemePreference): void {
  if (typeof document === "undefined") {
    return;
  }
  const systemDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = resolveTheme(preference, systemDark);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
}

export const THEME_BOOT_SCRIPT = `(function(){try{var raw=localStorage.getItem("founder-desk-v1");var theme=raw?JSON.parse(raw).theme:"system";var dark=theme==="dark"||(theme!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;
