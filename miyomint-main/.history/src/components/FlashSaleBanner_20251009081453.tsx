import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';

export default function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const cycleNumber = Math.floor(hours / 14);
      const nextCycleStart = (cycleNumber + 1) * 14;

      const hoursLeft = (nextCycleStart - hours - 1 + 24) % 24;
      const minutesLeft = 59 - minutes;
      const secondsLeft = 59 - seconds;

      return {
        hours: hoursLeft,
        minutes: minutesLeft,
        seconds: secondsLeft
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-3 px-4 shadow-lg sticky top-16 z-40 animate-pulse-glow">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 animate-bounce" fill="currentColor" />
            <span className="font-bold text-base sm:text-lg">SÜPER İNDİRİM KAMPANYASI!</span>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm sm:text-base">
              Bitimine: {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          <div className="text-sm sm:text-base font-semibold bg-white text-red-600 px-4 py-1 rounded-full">
            %33'e Varan İndirim!
          </div>
        </div>
      </div>
    </div>
  );
}
