import { useState, useCallback } from 'react';

/**
 * useLayout — manages sidebar collapse state
 * Persisted to localStorage so it survives page refresh
 */
function useLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar-collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { collapsed, toggleSidebar };
}

export default useLayout;
