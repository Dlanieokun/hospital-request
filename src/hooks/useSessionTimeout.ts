import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT = 5 * 60 * 1000;
const WARN_BEFORE_TIMEOUT = 60 * 1000;   

interface UseSessionTimeoutOptions {
  onWarning: () => void;
  onTimeout: () => void;
}

export const useSessionTimeout = ({ onWarning, onTimeout }: UseSessionTimeoutOptions) => {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);

    warnTimer.current = setTimeout(onWarning, IDLE_TIMEOUT - WARN_BEFORE_TIMEOUT);
    idleTimer.current = setTimeout(onTimeout, IDLE_TIMEOUT);
  }, [onWarning, onTimeout]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
    };
  }, [reset]);

  return { reset };
};