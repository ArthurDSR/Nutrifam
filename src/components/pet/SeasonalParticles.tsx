import React, { useMemo } from 'react';
import { Season } from './FoodBudView';

interface SeasonalParticlesProps {
  season: Season;
}

export const SeasonalParticles: React.FC<SeasonalParticlesProps> = ({ season }) => {
  // Generate a stable set of particles with random properties
  const particles = useMemo(() => {
    const count = season === 'winter' ? 22 : season === 'spring' ? 18 : season === 'autumn' ? 16 : 14;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 96 + 2, // 2% to 98%
      delay: Math.random() * 8, // 0 to 8s
      duration: 5 + Math.random() * 6, // 5s to 11s
      size: 6 + Math.random() * 10,
      opacity: 0.4 + Math.random() * 0.5,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 40
    }));
  }, [season]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5] select-none" aria-hidden="true">
      <style>{`
        @keyframes fallAndSway {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(620px) translateX(var(--drift)) rotate(var(--rot));
            opacity: 0;
          }
        }
        @keyframes floatSummerGlow {
          0% {
            transform: translateY(600px) translateX(0) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          50% {
            transform: translateY(300px) translateX(var(--drift)) scale(1.2);
            opacity: 0.95;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(0px) translateX(calc(var(--drift) * -1)) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((p) => {
        if (season === 'winter') {
          // Delicate Snowflakes
          return (
            <div
              key={p.id}
              className="absolute top-0 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
              style={{
                left: `${p.left}%`,
                width: `${p.size * 0.6 + 3}px`,
                height: `${p.size * 0.6 + 3}px`,
                opacity: p.opacity,
                animation: `fallAndSway ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
                '--drift': `${p.drift * 1.2}px`,
                '--rot': `${p.rotation}deg`
              } as React.CSSProperties}
            />
          );
        }

        if (season === 'spring') {
          // Sakura Cherry Blossom Petals
          return (
            <div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.left}%`,
                width: `${p.size + 4}px`,
                height: `${p.size * 1.3 + 4}px`,
                opacity: p.opacity,
                animation: `fallAndSway ${p.duration + 2}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                animationDelay: `${p.delay}s`,
                '--drift': `${p.drift * 1.5}px`,
                '--rot': `${p.rotation + 360}deg`
              } as React.CSSProperties}
            >
              <svg viewBox="0 0 20 26" className="w-full h-full drop-shadow-xs">
                <path
                  d="M 10 2 C 16 7, 18 16, 12 24 C 9 20, 4 20, 2 15 C 0 9, 4 2, 10 2 Z"
                  fill="#F472B6"
                  opacity="0.85"
                />
                <path
                  d="M 10 4 C 14 8, 15 15, 11 21 C 9 18, 5 18, 3 14 C 2 9, 5 4, 10 4 Z"
                  fill="#FDF2F8"
                  opacity="0.5"
                />
              </svg>
            </div>
          );
        }

        if (season === 'autumn') {
          // Warm Autumn Falling Leaves (Maple / Birch)
          const leafColors = ['#D97706', '#EA580C', '#B45309', '#CA8A04', '#C2410C'];
          const color = leafColors[p.id % leafColors.length];

          return (
            <div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.left}%`,
                width: `${p.size + 6}px`,
                height: `${p.size + 6}px`,
                opacity: p.opacity,
                animation: `fallAndSway ${p.duration + 1}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                '--drift': `${p.drift * 2}px`,
                '--rot': `${p.rotation + 540}deg`
              } as React.CSSProperties}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xs">
                <path
                  d="M 12 2 C 14 6, 19 6, 21 11 C 18 13, 19 18, 14 18 C 14 22, 11 22, 10 20 L 9 23 L 8 23 L 9 19 C 5 18, 5 13, 2 11 C 5 7, 9 6, 12 2 Z"
                  fill={color}
                  opacity="0.9"
                />
                <line x1="12" y1="4" x2="10" y2="19" stroke="#78350F" strokeWidth="1" opacity="0.6" />
              </svg>
            </div>
          );
        }

        // Summer: Golden Sunbeam Sparkles / Fireflies rising & drifting
        return (
          <div
            key={p.id}
            className="absolute bottom-0"
            style={{
              left: `${p.left}%`,
              width: `${p.size * 0.7 + 4}px`,
              height: `${p.size * 0.7 + 4}px`,
              animation: `floatSummerGlow ${p.duration + 3}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`
            } as React.CSSProperties}
          >
            <div className="w-full h-full rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.95)] animate-pulse" />
          </div>
        );
      })}
    </div>
  );
};
