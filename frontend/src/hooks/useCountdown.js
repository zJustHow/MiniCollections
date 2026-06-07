import { useCallback, useEffect, useRef, useState } from "react";

export default function useCountdown() {
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const start = useCallback((seconds) => {
    clearTimer();
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearTimer();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setCountdown(0);
  }, [clearTimer]);

  return { countdown, start, reset };
}
