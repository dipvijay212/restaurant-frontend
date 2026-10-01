'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface KitchenTimerProps {
  createdAt: string;
  delayedThresholdMinutes?: number;
}

export const KitchenTimer: React.FC<KitchenTimerProps> = ({
  createdAt,
  delayedThresholdMinutes = 15,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const createdMs = new Date(createdAt).getTime();
      const diffSec = Math.max(0, Math.floor((Date.now() - createdMs) / 1000));
      setElapsedSeconds(diffSec);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isDelayed = minutes >= delayedThresholdMinutes;
  const isWarning = minutes >= 10 && minutes < delayedThresholdMinutes;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
        isDelayed
          ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse ring-2 ring-rose-500/50'
          : isWarning
          ? 'bg-amber-950/80 text-amber-300 border-amber-600'
          : 'bg-stone-800 text-stone-300 border-stone-700'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isDelayed ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-stone-400'}`} />
      <span>{formattedTime}</span>
    </div>
  );
};
