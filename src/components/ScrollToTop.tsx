import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll to the top on every route change.
 * Skips the reset when the URL carries a hash anchor (#section) so in-page
 * anchor navigation still works.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}
