'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

interface SlideCard {
  id: string;
  content: ReactNode;
}

interface CardSliderProps {
  cards: SlideCard[];
  autoPlayInterval?: number; // ms
  className?: string;
  slidesPerView?: number;
}

export default function CardSlider({
  cards,
  autoPlayInterval = 4000,
  className = '',
  slidesPerView = 3,
}: CardSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = cards.length;
  const maxIndex = Math.max(0, total - slidesPerView);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      const clamped = Math.max(0, Math.min(index, maxIndex));
      if (clamped === current) return;
      setIsAnimating(true);
      setCurrent(clamped);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [current, maxIndex, isAnimating],
  );

  const next = useCallback(() => {
    goTo(current + 1 > maxIndex ? 0 : current + 1);
  }, [current, maxIndex, goTo]);

  const prev = useCallback(() => {
    goTo(current - 1 < 0 ? maxIndex : current - 1);
  }, [current, maxIndex, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPaused || maxIndex === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next, autoPlayInterval, maxIndex]);

  if (!cards.length) return null;

  const gap = 16; // px
  const cardWidth = slidesPerView > 1 ? `calc((100% - ${gap * (slidesPerView - 1)}px) / ${slidesPerView})` : '100%';

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Track */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `translateX(-${current * (100 / slidesPerView)}%)`,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="shrink-0 px-0"
              style={{ width: cardWidth, marginRight: gap / 2 }}
            >
              <div className="h-full">{card.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {maxIndex > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-brand-500'
                  : 'w-1.5 bg-white/15 hover:bg-white/30'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Pause indicator */}
      {isPaused && (
        <div className="mt-2 text-center text-[10px] uppercase tracking-wider text-surface-500">
          Scrolling paused
        </div>
      )}
    </div>
  );
}

/** Minimal dot pagination (for inline use) */
export function Dots({
  total,
  current,
  onDot,
  className = '',
}: {
  total: number;
  current: number;
  onDot: (i: number) => void;
  className?: string;
}) {
  if (total <= 1) return null;
  return (
    <div className={`mt-6 flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDot(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 bg-brand-500'
              : 'w-1.5 bg-white/15 hover:bg-white/30'
          }`}
          aria-label={`Slide ${i + 1}`}
        />
      ))}
    </div>
  );
}
