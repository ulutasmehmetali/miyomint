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
      if (timeRef.current) timeRef.current.textContent = newTime;
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-red-600 text-white py-3 overflow-hidden relative shadow-md font-semibold tracking-wide select-none">
      <div className="marquee-container">
        <div className="marquee-content">
          <div className="item">
            <Zap className="w-5 h-5" />
            <span>SÜPER İNDİRİM KAMPANYASI!</span>
          </div>

          <div className="item">
            <Clock className="w-5 h-5" />
            <span>
              Bitimine: <span ref={timeRef}>{timeLeft}</span>
            </span>
          </div>

          <div className="item highlight">
            %33’e Varan İndirim!
          </div>
        </div>
      </div>

      <style>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .marquee-content {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          white-space: nowrap;
          animation: smoothScroll 20s linear infinite;
        }

        .item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 1rem;
        }

        .highlight {
          background: white;
          color: #b91c1c;
          padding: 0.3rem 1rem;
          border-radius: 9999px;
          font-weight: 700;
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
