"use client";

import { useState, useEffect, useCallback } from "react";
import { getTimeRemaining } from "@/lib/utils";

interface UseCountdownOptions {
  endDate: string | Date;
  onEnd?: () => void;
}

export function useCountdown({ endDate, onEnd }: UseCountdownOptions) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endDate);
      setTimeLeft(remaining);

      if (remaining.isEnded) {
        clearInterval(timer);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onEnd]);

  const updateEndDate = useCallback((newEndDate: string | Date) => {
    setTimeLeft(getTimeRemaining(newEndDate));
  }, []);

  return { ...timeLeft, updateEndDate };
}
