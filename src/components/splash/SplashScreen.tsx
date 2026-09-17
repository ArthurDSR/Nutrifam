import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { FoodBudMascot } from '../pet/FoodBudMascot';

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

          {/* OFFICIAL FOODBUD RACCOON HEAD ONLY (Blinking head animation) */}
          <div className="relative w-44 h-40 sm:w-52 sm:h-48 drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)]">
            <FoodBudMascot
              headOnly
              isBlinking={isBlinking}
              isHappyBlink={isHappyBlink}
              className="w-full h-full"
            />
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
