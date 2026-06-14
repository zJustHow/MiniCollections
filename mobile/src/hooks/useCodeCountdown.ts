import { useCallback, useEffect, useRef, useState } from "react";

export default function useCodeCountdown(initial = 0) {
  const [countdown, setCountdown] = useState(initial);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds = 60) => {
      clear();
      setCountdown(seconds);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clear();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear],
  );

  const reset = useCallback(() => {
    clear();
    setCountdown(0);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { countdown, start, clear, reset };
}
