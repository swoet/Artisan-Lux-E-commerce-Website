"use client";

import { useState, useEffect } from "react";

interface DropCountdownProps {
  dropDate: Date;
}

export default function DropCountdown({ dropDate }: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(dropDate).getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dropDate]);

  if (!timeLeft) {
    return (
      <div className="text-sm text-green-600 font-medium">
        Live Now!
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 rounded-lg p-3">
      <div className="text-xs text-neutral-600 mb-2 text-center">Drops in</div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold text-brand-dark-wood">{timeLeft.days}</div>
          <div className="text-xs text-neutral-600">Days</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-brand-dark-wood">{timeLeft.hours}</div>
          <div className="text-xs text-neutral-600">Hours</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-brand-dark-wood">{timeLeft.minutes}</div>
          <div className="text-xs text-neutral-600">Mins</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-brand-dark-wood">{timeLeft.seconds}</div>
          <div className="text-xs text-neutral-600">Secs</div>
        </div>
      </div>
    </div>
  );
}
