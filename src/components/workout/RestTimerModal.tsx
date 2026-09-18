import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Minus, X, BellRing, Minimize2, Maximize2 } from 'lucide-react';
import { useTheme } from '../../services/themeService';

interface RestTimerModalProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
  exerciseName?: string;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  initialSeconds,
  isOpen,
  onClose,
  exerciseName
}) => {
  const { activeColor } = useTheme();
  const [totalTime, setTotalTime] = useState(initialSeconds || 60);
  const [timeLeft, setTimeLeft] = useState(initialSeconds || 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef<any>(null);

  // Sync when initialSeconds changes
  useEffect(() => {
    if (isOpen) {
      const secs = initialSeconds > 0 ? initialSeconds : 60;
      setTotalTime(secs);
      setTimeLeft(secs);
      setIsRunning(true);
    }
  }, [isOpen, initialSeconds]);

  // Audio tone helper
  const playAlarmSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  useEffect(() => {
    if (!isOpen || !isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          playAlarmSound();
          if (navigator.vibrate) {
            try {
              navigator.vibrate([200, 100, 200, 100, 300]);
            } catch {}
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;

  const handleAdjustTime = (deltaSeconds: number) => {
    setTimeLeft((prev) => {
      const next = Math.max(0, prev + deltaSeconds);
      if (next > totalTime) setTotalTime(next);
      return next;
    });
  };

  // Minimized floating pill version
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 bg-[#1E2623] text-white px-4 py-2.5 rounded-full shadow-2xl border border-emerald-500/30 flex items-center gap-3 cursor-pointer animate-fade-in hover:scale-105 transition-transform"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <div className="text-[10px] text-[#A8B8B1] font-semibold uppercase tracking-wider">
            Descanso ({exerciseName || 'Série'})
          </div>
          <div className="text-sm font-black font-mono tracking-tight text-emerald-400">
            {formattedTime}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          className="p-1 hover:bg-white/10 rounded-full text-slate-300"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E2623] rounded-3xl p-6 shadow-2xl border border-[#AEBDB5]/20 dark:border-[#394842] flex flex-col items-center relative text-center">
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6F7C76] dark:text-[#A8B8B1] transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wider">
            <BellRing className="w-3.5 h-3.5 text-emerald-500" />
            Descanso entre séries
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6F7C76] dark:text-[#A8B8B1] transition-colors"
            title="Fechar / Pular"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {exerciseName && (
          <p className="text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF] mb-4 truncate max-w-xs">
            {exerciseName}
          </p>
        )}

        {/* Circular Countdown Progress */}
        <div className="relative w-48 h-48 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-slate-100 dark:stroke-[#2B3732]"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke={timeLeft === 0 ? '#10b981' : activeColor.primary}
              strokeWidth="7"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black font-mono tracking-tight text-[#18201D] dark:text-white">
              {formattedTime}
            </span>
            <span className="text-[11px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1] mt-1">
              {timeLeft === 0 ? 'Hora da próxima série!' : 'Recupere o fôlego'}
            </span>
          </div>
        </div>

        {/* Quick Add/Subtract Controls */}
        <div className="flex items-center gap-3 my-4">
          <button
            onClick={() => handleAdjustTime(-15)}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#2B3732] text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] hover:opacity-80 active:scale-95 transition-transform flex items-center gap-1"
          >
            <Minus className="w-3 h-3" /> 15s
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
            style={{ backgroundColor: activeColor.primary }}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => handleAdjustTime(30)}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#2B3732] text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] hover:opacity-80 active:scale-95 transition-transform flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 30s
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-[#2B3732] hover:bg-slate-200 dark:hover:bg-[#34423C] text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] transition-colors"
        >
          {timeLeft === 0 ? 'Concluir Descanso' : 'Pular Descanso'}
        </button>
      </div>
    </div>
  );
};
