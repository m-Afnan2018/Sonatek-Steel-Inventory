import { useState, useEffect } from 'react';

/**
 * Returns the current data-theme attribute value ('dark' | 'light') and
 * re-renders any component that uses it the moment the theme changes —
 * achieved via a MutationObserver on document.documentElement.
 */
export function useActiveTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(next);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
