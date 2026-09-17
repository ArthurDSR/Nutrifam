import React, { useState, useEffect } from 'react';
import { X, Edit3, Play, Pause, Flag, Zap, Clock } from 'lucide-react';
import { FastingSession } from '../../types';
import { FastingPlansModal } from './FastingPlansModal';
import { calculateFastingWindow } from '../../services/fastingScheduler';
import { useTheme } from '../../services/themeService';

interface FastingDetailModalProps {
  fasting: FastingSession;
  onClose: () => void;
  onUpdateFasting: (updated: Partial<FastingSession>) => void;
  onEndFasting: () => void;
  onCancelFasting: () => void;
  isToday?: boolean;
  isPast?: boolean;
  isFuture?: boolean;
}

export const FastingDetailModal: React.FC<FastingDetailModalProps> = ({
  fasting,
  onClose,
  onUpdateFasting,
  onEndFasting,
  onCancelFasting,
  isToday = true,
  isPast = false,
  isFuture = false
}) => {
  const { activeColor } = useTheme();
  const displaySeconds = isFuture ? 0 : fasting.elapsedSeconds;
  const [seconds, setSeconds] = useState(displaySeconds);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [startTime, setStartTime] = useState(fasting.scheduledStartTime || '20:00');
  const [endTime, setEndTime] = useState(fasting.scheduledEndTime || '12:00');
  const [autoStart, setAutoStart] = useState(fasting.autoStartEnabled !== false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  useEffect(() => {
    setSeconds(isFuture ? 0 : fasting.elapsedSeconds);
  }, [fasting.elapsedSeconds, isFuture]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isToday && fasting.isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [fasting.isActive, isToday]);

  const windowCalc = calculateFastingWindow(
    startTime,
    endTime,
    new Date(),
    fasting.isActive,
    seconds,
    fasting.isManuallyPaused,
    fasting.isManuallyStopped
  );

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const targetSecs = (fasting.targetHours || 16) * 3600;
  const progressPercent = Math.min(100, (seconds / targetSecs) * 100);

  const handleSaveSchedule = () => {
    const targetHours = Math.round(windowCalc.totalDurationSeconds / 3600);
    onUpdateFasting({
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      autoStartEnabled: autoStart,
      isManuallyStopped: false,
      targetHours: targetHours > 0 ? targetHours : 16
    });
    setIsEditingSchedule(false);
  };

  const handleToggleActive = () => {
    if (!isToday) return;
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

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-center items-stretch sm:items-center animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full sm:h-[92vh] sm:max-h-[850px] sm:rounded-[32px] bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] flex flex-col overflow-hidden shadow-cozy relative transition-colors">
        {/* Top Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center transition-colors border border-[#AEBDB5]/30 dark:border-[#394842]"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Center Pill: Your fasting plan ✎ */}
          <button
            onClick={() => setShowPlansModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] text-xs font-bold transition-all active:scale-95 shadow-2xs"
          >
            <span>Plano: {fasting.targetHours || 16}h</span>
            <Edit3 className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
          </button>

          <div className="w-10" />
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center justify-between touch-pan-y">
          {/* Automatic Schedule Card */}
          <div className="w-full bg-[#ECEFE7] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-3.5 mb-3 text-xs transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                <Clock className="w-4 h-4" style={{ color: activeColor.primary }} />
                <span>Horário Programado do Jejum</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842]">
                {autoStart ? 'Auto-início Ativo' : 'Manual'}
              </span>
            </div>

            {isEditingSchedule ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                      Início do Jejum
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] font-mono text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                      Fim do Jejum
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] font-mono text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-[#3F4B46] dark:text-[#EDF2EF] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoStart}
                    onChange={(e) => setAutoStart(e.target.checked)}
                    className="rounded"
                    style={{ accentColor: activeColor.primary }}
                  />
                  <span>Iniciar sozinho quando der o horário</span>
                </label>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    className="flex-1 py-2 rounded-full text-white font-bold text-xs shadow-xs"
                    style={{ backgroundColor: activeColor.primary }}
                  >
                    Salvar Horários
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingSchedule(false)}
                    className="px-4 py-2 rounded-full bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-[#3F4B46] dark:text-[#EDF2EF]">
                  <span>
                    Janela: <strong>{fasting.scheduledStartTime || '20:00'}</strong> até às{' '}
                    <strong>{fasting.scheduledEndTime || '12:00'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingSchedule(true)}
                    className="text-[11px] font-bold hover:underline"
                    style={{ color: activeColor.primary }}
                  >
                    Alterar Horário
                  </button>
                </div>
                <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] mt-1 font-medium">
                  {windowCalc.nextEventText}
                </p>
              </div>
            )}
          </div>

          {/* Timer & Stage Center Section */}
          <div className="flex flex-col items-center my-2">
            <span className="text-xs font-semibold text-[#6F7C76] dark:text-[#A8B8B1]">
              {isPast
                ? (seconds > 0 ? 'Jejum Concluído no Dia' : 'Sem Jejum Registrado')
                : isFuture
                ? 'Jejum Programado'
                : fasting.isActive
                ? 'Tempo Decorrido'
                : seconds > 0
                ? 'Tempo Pausado'
                : 'Jejum Não Iniciado'}
            </span>

            <div className="text-5xl font-black text-[#3F4B46] dark:text-[#EDF2EF] font-mono tracking-tight my-2">
              {formatTime(seconds)}
            </div>

            {/* Metabolic Stage with Lightning Icon */}
            <div className="flex items-center gap-1.5 font-bold text-sm mb-4" style={{ color: activeColor.primary }}>
              <Zap className="w-4 h-4 fill-current" />
              <span>{isFuture ? 'Programado' : windowCalc.stage}</span>
            </div>

            {/* Timeline Bar with Play/Flag */}
            <div className="w-full max-w-sm flex items-center gap-2 bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] p-1.5 rounded-full mb-4">
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={!isToday}
                className={`w-9 h-9 rounded-full bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xs flex items-center justify-center transition-transform ${!isToday ? 'opacity-40 cursor-not-allowed' : 'active:scale-90'}`}
                style={{ color: activeColor.primary }}
                title={!isToday ? 'Disponível apenas no dia atual' : fasting.isActive ? 'Pausar jejum' : 'Iniciar/Retomar jejum'}
              >
                {fasting.isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <div className="flex-1 h-4 bg-[#ECEFE7] dark:bg-[#233730] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: activeColor.primary,
                    width: `${Math.max(5, progressPercent)}%`
                  }}
                />
              </div>

              <div className="w-9 h-9 rounded-full bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xs flex items-center justify-center">
                <Flag className="w-4 h-4" style={{ color: activeColor.primary }} />
              </div>
            </div>

            {/* Started and Goal info columns */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-3 text-xs px-2 mb-4">
              <div className="bg-[#F7F4EE] dark:bg-[#18201D] p-3 rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842]">
                <span className="font-bold block text-[11px]" style={{ color: activeColor.primary }}>Início</span>
                <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block text-xs mt-0.5">
                  {fasting.scheduledStartTime || '20:00'}
                </span>
                <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">Ativação programada</span>
              </div>

              <div className="bg-[#F7F4EE] dark:bg-[#18201D] p-3 rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] text-right">
                <span className="font-bold block text-[11px]" style={{ color: activeColor.primary }}>Meta</span>
                <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block text-xs mt-0.5">
                  {fasting.scheduledEndTime || '12:00'} ({fasting.targetHours || 16}h)
                </span>
                <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">Janela alimentar</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="w-full max-w-xs space-y-2 mt-auto pt-4 pb-2">
            {!isToday ? (
              <div className="w-full py-3 px-4 rounded-2xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#6F7C76] dark:text-[#A8B8B1] text-xs font-bold text-center">
                {isPast ? 'Registro histórico desta data (concluído)' : 'O cronômetro estará disponível nesta data'}
              </div>
            ) : fasting.isActive ? (
              <button
                type="button"
                onClick={handleToggleActive}
                className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pausar Jejum Temporariamente</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleActive}
                className="w-full py-3 rounded-full text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: activeColor.primary }}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{seconds > 0 ? 'Retomar Jejum' : 'Iniciar Jejum Agora'}</span>
              </button>
            )}

            {/* Complete Fasting Cycle */}
            {isToday && seconds > 0 && (
              <button
                type="button"
                onClick={onEndFasting}
                className="w-full py-2.5 rounded-full bg-[#C9D9C8] hover:bg-[#C8E6C9] text-[#3F4B46] border-2 border-[#6F7C76] dark:bg-[#2e473e] dark:text-[#EDF2EF] dark:border-[#527768] font-bold text-xs shadow-xs transition-transform active:scale-95"
              >
                Concluir e Salvar Ciclo
              </button>
            )}

            {/* Cancel & Reset */}
            {isToday && (
              <button
                type="button"
                onClick={() => {
                  setSeconds(0);
                  onCancelFasting();
                }}
                className="w-full py-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
              >
                Cancelar e zerar cronômetro
              </button>
            )}
          </div>
        </div>

        {/* Plans selector sub-modal */}
        {showPlansModal && (
          <FastingPlansModal
            currentPlanHours={fasting.targetHours || 16}
            onClose={() => setShowPlansModal(false)}
            onSelectPlan={(h) => {
              onUpdateFasting({ targetHours: h });
            }}
          />
        )}
      </div>
    </div>
  );
};
