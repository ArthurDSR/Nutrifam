import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Pause, Flag } from 'lucide-react';
import { FastingSession } from '../../types';

interface FastingCardProps {
  fasting: FastingSession;
  onUpdateFasting: (updated: Partial<FastingSession>) => void;
  onOpenDetail?: () => void;
  isToday?: boolean;
  isPast?: boolean;
  isFuture?: boolean;
}

export const FastingCard: React.FC<FastingCardProps> = ({
  fasting,
  onUpdateFasting,
  onOpenDetail,
  isToday = true,
  isPast = false,
  isFuture = false
}) => {
  const displaySeconds = isFuture ? 0 : fasting.elapsedSeconds;
  const [seconds, setSeconds] = useState(displaySeconds);

  useEffect(() => {
    setSeconds(isFuture ? 0 : fasting.elapsedSeconds);
  }, [fasting.elapsedSeconds, isFuture]);

  // LIVE CLOCK: Only run ticking timer if it is TODAY and fasting is actively running!
  useEffect(() => {
    if (!isToday || !fasting.isActive) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        const hours = next / 3600;
        let stage = 'Digestão e absorção';
        if (hours < 4) stage = 'Digestão e absorção';
        else if (hours < 8) stage = 'Níveis de glicose caindo';
        else if (hours < 12) stage = 'Estabilização de Glicemia';
        else if (hours < 16) stage = 'Queima de gordura (Cetose)';
        else stage = 'Autofagia & Renovação';

        if (next % 15 === 0) {
          onUpdateFasting({ elapsedSeconds: next, stage });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fasting.isActive, isToday, onUpdateFasting]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const targetSeconds = (fasting.targetHours || 16) * 3600;
  const progressPercent = Math.min(100, Math.round((seconds / targetSeconds) * 100));

  const toggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isToday) {
      return;
    }
    if (fasting.isActive) {
      onUpdateFasting({
        isActive: false,
        isManuallyPaused: true,
        isManuallyStopped: false,
        elapsedSeconds: seconds
      });
    } else {
      onUpdateFasting({
        isActive: true,
        isManuallyPaused: false,
        isManuallyStopped: false,
        elapsedSeconds: seconds
      });
    }
  };

  const cardTitle = isPast
    ? (seconds > 0 ? "Jejum Concluído" : "Sem Jejum Registrado")
    : isFuture
    ? "Jejum Programado"
    : fasting.isActive
    ? "Você está em jejum!"
    : seconds > 0
    ? "Jejum pausado"
    : "Jejum não iniciado";

  const cardSubtitle = isPast
    ? (seconds > 0 ? `${formatTime(seconds)} registrados nesta data` : "Nenhum jejum realizado neste dia")
    : isFuture
    ? `Programado: ${fasting.scheduledStartTime || '20:00'} - ${fasting.scheduledEndTime || '12:00'}`
    : fasting.isActive
    ? (fasting.stage || 'Digestão e absorção')
    : seconds > 0
    ? 'Toque para retomar o cronômetro'
    : `Programado: ${fasting.scheduledStartTime || '20:00'} - ${fasting.scheduledEndTime || '12:00'}`;

  return (
    <div
      onClick={onOpenDetail}
      className="bg-white dark:bg-[#232D29] mx-4 my-3 rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] select-none cursor-pointer hover:shadow-md transition-all"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-lg">
            {cardTitle}
          </h3>
          <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 text-xs font-semibold mt-1">
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            <span>{cardSubtitle}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1] block">
            {isPast ? 'Total registrado' : isFuture ? 'Previsto' : fasting.isActive ? 'Tempo decorrido' : seconds > 0 ? 'Tempo pausado' : 'Cronômetro'}
          </span>
          <span className="text-xl font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] tracking-tight font-mono">
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      {/* Progress Bar with Play/Pause & Flag */}
      <div className="mt-4 flex items-center gap-2 bg-rose-50/70 dark:bg-rose-950/30 p-1.5 rounded-full border border-rose-100/50 dark:border-rose-900/30">
        {isToday ? (
          <button
            onClick={toggleActive}
            className="w-7 h-7 rounded-full bg-white dark:bg-[#18201D] text-rose-500 dark:text-rose-400 shadow-xs flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-transform active:scale-90 shrink-0"
            title={fasting.isActive ? 'Pausar jejum' : seconds > 0 ? 'Retomar jejum' : 'Iniciar jejum'}
          >
            {fasting.isActive ? (
              <Pause className="w-3.5 h-3.5 fill-rose-500 dark:fill-rose-400" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-rose-500 dark:fill-rose-400 ml-0.5" />
            )}
          </button>
        ) : (
          <div
            className="w-7 h-7 rounded-full bg-white/80 dark:bg-[#18201D] text-rose-300 dark:text-rose-500/60 shadow-xs flex items-center justify-center shrink-0 cursor-default"
            title={isPast ? 'Histórico do dia (concluído)' : 'Disponível na data correspondente'}
          >
            <Flag className="w-3.5 h-3.5" />
          </div>
        )}

        <div className="flex-1 h-5 bg-rose-100/60 dark:bg-rose-900/40 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-rose-400 dark:bg-rose-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>

        <div
          className="w-7 h-7 rounded-full bg-white/90 dark:bg-[#18201D] text-rose-400 dark:text-rose-400 shadow-xs flex items-center justify-center shrink-0"
          title="Abrir detalhes e planos de jejum"
        >
          <Flag className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
