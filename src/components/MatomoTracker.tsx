import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initMatomo, trackPageView } from '@/services/matomo';

export default function MatomoTracker() {
  const location = useLocation();

  useEffect(() => {
    initMatomo();
  }, []);

  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path, document.title);
  }, [location.pathname, location.search]);

  return null;
}