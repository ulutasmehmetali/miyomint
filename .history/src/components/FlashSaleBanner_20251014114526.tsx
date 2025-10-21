import { Zap, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date();
      target.setHours(23, 59, 59, 999);
      const diff = target.getTime() - now;
      if (diff <= 0) return "00:00:00";
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((diff / (1000 * 60)) % 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor((diff / 1000) % 60)
        .toString()
        .padStart(2, "0");
      return `${h}:${m}:${s}`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      if (timeRef.current) {
        // sadece rakam değişiyor, DOM yeniden render olmuyor
        timeRef.current.textContent = newTime;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-red-600 text-white py-3 overflow-hidden relative shadow-md font-semibold tracking-wide select-none">
      <div className="marquee-container">
        <div className="marquee-content flex items-center gap-10 text-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span>SÜPER İNDİRİM KAMPANYASI!</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>
              Bitimine: <span ref={timeRef}>{timeLeft}</span>
            </span>
          </div>

          {/* sabit, hareket etmeyen kutu */}
          <div className="bg-white text-red-700 px-4 py-1 rounded-full font-bold text-base shadow-sm flex-shrink-0">
            %33’e Varan İndirim!
          </div>
        </div>
      </div>

      <style jsx>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .marquee-content {
          display: inline-block;
          white-space: nowrap;
          animation: smoothScroll 20s linear infinite;
        }

        @keyframes smoothScroll {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
