import { useEffect, useState } from 'react';

function getInitial() {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode() {
  const [enabled, setEnabled] = useState(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', enabled);
    localStorage.setItem('darkMode', String(enabled));
  }, [enabled]);

  return [enabled, setEnabled];
}
