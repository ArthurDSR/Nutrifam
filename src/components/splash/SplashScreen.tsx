import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  isLoggedIn?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, isLoggedIn }) => {
  // Animation Phases
  // headPhase: 'rising' | 'centered'
  const [headPhase, setHeadPhase] = useState<'rising' | 'centered'>('rising');
  // blinkStage: 0 = open, 1 = first blink (closed), 2 = open, 3 = second blink (closed), 4 = open with joy
  const [blinkStage, setBlinkStage] = useState<number>(0);
  // textPhase: 'hidden' | 'rising'
  const [textPhase, setTextPhase] = useState<'hidden' | 'rising'>('hidden');
  // fadeOutPhase: boolean
  const [isFadingOut, setIsFadingOut] = useState(false);
  // isDone: unmount
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // 1. Head rises smoothly and gracefully (80ms)
    const t0 = setTimeout(() => {
      setHeadPhase('centered');
    }, 80);

    // 2. First eye blink (starts at 500ms, reopens at 700ms)
    const t1 = setTimeout(() => {
      setBlinkStage(1); // Eyes close
    }, 500);

    const t2 = setTimeout(() => {
      setBlinkStage(2); // Eyes reopen
    }, 700);

    // 3. Second happy smile blink with sparkles (starts at 950ms, reopens at 1150ms)
    const t3 = setTimeout(() => {
      setBlinkStage(3); // Eyes close with cute happy smile
    }, 950);

    const t4 = setTimeout(() => {
      setBlinkStage(4); // Eyes reopen with extra sparkle
    }, 1150);

    // 4. "NutriFam" title and subtitle rise smoothly from bottom
    const t5 = setTimeout(() => {
      setTextPhase('rising');
    }, 700);

    // 5. Fade out splash screen gently at 1800ms
    const t6 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // 6. Complete and unmount at 2200ms
    const t7 = setTimeout(() => {
      setIsDone(true);
      if (onFinish) onFinish();
    }, 2200);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [onFinish]);

  if (isDone) return null;

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsDone(true);
      if (onFinish) onFinish();
    }, 150);
  };

  const isBlinking = blinkStage === 1 || blinkStage === 3;
  const isHappyBlink = blinkStage === 3 || blinkStage === 4;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col justify-between items-center select-none cursor-pointer overflow-hidden transition-opacity duration-500 ease-out bg-gradient-to-b from-[#0e1e19] via-[#122822] to-[#091410] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>

      {/* Top subtle bar */}
      <div className="w-full pt-8 px-6 flex justify-between items-center text-[11px] font-bold text-emerald-300/40">
        <span>NUTRIFAM APP</span>
        <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          {isLoggedIn ? 'USUÁRIO CONECTADO' : 'TOQUE PARA PULAR'}
        </span>
      </div>

      {/* Center: Raccoon Head Vector Animation */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full px-6">
        {/* Animated container that rises up */}
        <div
          className={`transform transition-all duration-600 ease-out flex flex-col items-center ${
            headPhase === 'rising'
              ? 'translate-y-36 opacity-0 scale-90'
              : 'translate-y-0 opacity-100 scale-100'
          }`}
        >
          {/* Sparkles accent behind raccoon head */}
          {blinkStage >= 2 && (
            <div className="absolute -top-6 -right-4 text-amber-300 animate-pulse">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
          )}

          {/* RACCOON HEAD SVG */}
          <div className="relative w-44 h-44 drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)]">
            <svg viewBox="0 0 130 130" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="splashEarGradL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8F684D" />
                  <stop offset="100%" stopColor="#6B4934" />
                </linearGradient>
                <linearGradient id="splashEarGradR" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8F684D" />
                  <stop offset="100%" stopColor="#6B4934" />
                </linearGradient>
                <linearGradient id="splashFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A77A58" />
                  <stop offset="100%" stopColor="#8F684D" />
                </linearGradient>
              </defs>

              {/* 1. EARS - ADORABLE ROUNDED EARS */}
              {/* Left Ear */}
              <path
                d="M 26 62 C 20 40, 28 16, 40 16 C 52 16, 58 32, 60 42 Z"
                fill="url(#splashEarGradL)"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 32 56 C 28 36, 34 23, 40 23 C 46 23, 52 34, 52 42 Z"
                fill="#fda4af"
              />
              <path d="M 36 34 C 40 40, 44 42, 48 40" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Right Ear */}
              <path
                d="M 104 62 C 110 40, 102 16, 90 16 C 78 16, 72 32, 70 42 Z"
                fill="url(#splashEarGradR)"
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 98 56 C 102 36, 96 23, 90 23 C 84 23, 78 34, 78 42 Z"
                fill="#fda4af"
              />
              <path d="M 94 34 C 90 40, 86 42, 82 40" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* 2. HEAD BASE */}
              <ellipse cx="65" cy="62" rx="42" ry="34" fill="url(#splashFurGrad)" stroke="#1e293b" strokeWidth="2.5" />

              {/* 3. CHEEK WHITE FLUFF */}
              <path d="M 22 64 C 18 72, 26 80, 36 82 C 30 74, 26 68, 22 64 Z" fill="#E9D9BD" />
              <path d="M 108 64 C 112 72, 104 80, 94 82 C 100 74, 104 68, 108 64 Z" fill="#E9D9BD" />

              {/* 4. RACCOON BANDIT MASK */}
              <path
                d="M 28 58 C 40 53, 53 55, 65 60 C 77 55, 90 53, 102 58 C 106 68, 98 77, 86 77 C 75 77, 71 70, 65 70 C 59 70, 55 77, 44 77 C 32 77, 24 68, 28 58 Z"
                fill="#513B35"
              />

              {/* Soft tan brow markings shared with the FoodBud character */}
              <path d="M 39 52 Q 46 47 53 53" stroke="#D8BB8C" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 77 53 Q 84 47 91 52" stroke="#D8BB8C" strokeWidth="4" fill="none" strokeLinecap="round" />

              {/* 5. SNOUT / MUZZLE */}
              <ellipse cx="65" cy="74" rx="16" ry="11" fill="#ffffff" />

              {/* Cute Rounded Button Nose */}
              <ellipse cx="65" cy="71" rx="5" ry="3.5" fill="#0f172a" />
              <ellipse cx="63.8" cy="70" rx="1.6" ry="1" fill="#ffffff" opacity="0.8" />

              {/* Cute Smile */}
              <path
                d="M 59 77 Q 62 81 65 77 Q 68 81 71 77"
                stroke="#0f172a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Rosy Cheeks when smiling / blinking */}
              {isHappyBlink && (
                <>
                  <ellipse cx="36" cy="72" rx="5" ry="3.5" fill="#fbcfe8" opacity="0.9" />
                  <ellipse cx="94" cy="72" rx="5" ry="3.5" fill="#fbcfe8" opacity="0.9" />
                </>
              )}

              {/* Whiskers */}
              <line x1="44" y1="72" x2="26" y2="70" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="44" y1="76" x2="28" y2="78" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="86" y1="72" x2="104" y2="70" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="86" y1="76" x2="102" y2="78" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />

              {/* 6. EYES WITH ANIMATED BLINKING */}
              {isBlinking ? (
                /* CLOSED EYELIDS (BLINK) */
                <>
                  {/* Left Closed Eye Arc */}
                  <path
                    d="M 40 63 Q 46 69 52 63"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Right Closed Eye Arc */}
                  <path
                    d="M 78 63 Q 84 69 90 63"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                /* OPEN EYES (GLOSSY ANIME) */
                <>
                  {/* Left Eye */}
                  <ellipse cx="46" cy="62" rx="6" ry="6.5" fill="#ffffff" />
                  <circle cx="46" cy="62" r="5" fill="#0f172a" />
                  <circle cx="44.2" cy="60.2" r="2" fill="#ffffff" />
                  <circle cx="48" cy="63.5" r="0.8" fill="#ffffff" />

                  {/* Right Eye */}
                  <ellipse cx="84" cy="62" rx="6" ry="6.5" fill="#ffffff" />
                  <circle cx="84" cy="62" r="5" fill="#0f172a" />
                  <circle cx="82.2" cy="60.2" r="2" fill="#ffffff" />
                  <circle cx="86" cy="63.5" r="0.8" fill="#ffffff" />
                </>
              )}
            </svg>
          </div>

          {/* Subtle status tag */}
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-emerald-300 text-[10px] font-extrabold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            <span>Seu Companheiro de Hábitos</span>
          </div>
        </div>
      </div>

      {/* Bottom: "NutriFam" App Name Rises Up */}
      <div className="w-full pb-10 px-6 flex flex-col items-center text-center">
        <div
          className={`transform transition-all duration-500 ease-out flex flex-col items-center ${
            textPhase === 'hidden'
              ? 'translate-y-12 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="relative">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
              Nutri<span className="text-emerald-400">Fam</span>
            </h1>
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full mx-auto mt-1.5"></div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-emerald-100/70 mt-2 tracking-wide">
            Nutrição, Evolução & Saúde em Família
          </p>

          <p className="text-[10px] font-semibold text-slate-400/50 mt-4 uppercase tracking-widest">
            Toque para entrar
          </p>
        </div>
      </div>
    </div>
  );
};
