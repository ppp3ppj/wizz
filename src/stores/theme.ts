import { createSignal, createEffect } from "solid-js";

const STORAGE_KEY = "theme";

function loadTheme(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const [isDark, setIsDark] = createSignal(loadTheme());

createEffect(() => {
  const theme = isDark() ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
});

export { isDark, setIsDark };
