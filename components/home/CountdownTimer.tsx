"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  hours: number;
  className?: string;
  compact?: boolean;
};

function formatTwoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

export default function CountdownTimer({ hours, className, compact }: CountdownTimerProps) {
  const durationMs = hours * 60 * 60 * 1000;
  const [remainingMs, setRemainingMs] = useState(durationMs);

  useEffect(() => {
    const targetTime = Date.now() + durationMs;

    const intervalId = window.setInterval(() => {
      setRemainingMs(Math.max(targetTime - Date.now(), 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [durationMs]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hoursLeft = Math.floor(totalSeconds / 3600);
  const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
  const secondsLeft = totalSeconds % 60;

  if (compact) {
    return (
      <span className={className}>
        {formatTwoDigits(hoursLeft)}:{formatTwoDigits(minutesLeft)}:{formatTwoDigits(secondsLeft)}
      </span>
    );
  }

  return (
    <span className={className}>
      {formatTwoDigits(hoursLeft)}h {formatTwoDigits(minutesLeft)}m {formatTwoDigits(secondsLeft)}s
    </span>
  );
}
