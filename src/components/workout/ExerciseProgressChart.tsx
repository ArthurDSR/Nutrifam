import React, { useState, useMemo } from 'react';
import { TrendingUp, Dumbbell, Calendar, Award, ChevronDown } from 'lucide-react';
import { CompletedWorkout, ExerciseProgressEntry } from '../../types/workout';
import { computeExerciseProgression } from '../../services/workoutService';
import { EXERCISE_DATABASE } from '../../services/exerciseDatabase';
import { useTheme } from '../../services/themeService';

interface ExerciseProgressChartProps {
  history: CompletedWorkout[];
  initialExerciseId?: string;
}

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({
  history,
  initialExerciseId
}) => {
  const { activeColor } = useTheme();

  // Find all unique exercises present in workout history
  const exercisesWithHistory = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of history) {
      for (const ex of w.exercises) {
        if (!map.has(ex.exerciseId)) {
          map.set(ex.exerciseId, ex.exerciseName);
        }
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [history]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
    if (initialExerciseId) return initialExerciseId;
    if (exercisesWithHistory.length > 0) return exercisesWithHistory[0].id;
    return 'chest_bench_press_barbell';
  });

  const progressionData: ExerciseProgressEntry[] = useMemo(() => {
    return computeExerciseProgression(selectedExerciseId, history);
  }, [selectedExerciseId, history]);

  // Max Stats
  const bestRecord = useMemo(() => {
    if (progressionData.length === 0) return null;
    let max1RM = 0;
    let maxWeight = 0;
    for (const item of progressionData) {
      if (item.estimated1RM > max1RM) max1RM = item.estimated1RM;
      if (item.weightKg > maxWeight) maxWeight = item.weightKg;
    }
    const latest = progressionData[progressionData.length - 1];
    return { max1RM, maxWeight, latest };
  }, [progressionData]);

  // Chart SVG calculations
  const chartPoints = useMemo(() => {
    if (progressionData.length < 2) return null;
    const weights = progressionData.map((d) => d.weightKg);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1;

    const width = 300;
    const height = 120;
    const padding = 20;

    const points = progressionData.map((d, idx) => {
      const x = padding + (idx / (progressionData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.weightKg - minW) / range) * (height - 2 * padding);
      return { x, y, data: d };
    });

    const pathString = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');

    return { points, pathString, width, height, minW, maxW };
  }, [progressionData]);

  return (
    <div className="space-y-4">
      {/* Exercise Selector */}
      <div className="bg-white dark:bg-[#1E2623] p-4 rounded-3xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
        <label className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wider block mb-1.5">
          Selecione o Exercício
        </label>
        <div className="relative">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#F7F4EE] dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl text-xs font-bold text-[#18201D] dark:text-white appearance-none focus:outline-none"
          >
            {exercisesWithHistory.length > 0 ? (
              <optgroup label="Exercícios com Histórico">
                {exercisesWithHistory.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
            <optgroup label="Catálogo Completo">
              {EXERCISE_DATABASE.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1E2623] p-4 rounded-3xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 mb-1">
            <Award className="w-4 h-4" />
            <span>Recorde (1RM Est.)</span>
          </div>
          <div className="text-xl font-black text-[#18201D] dark:text-white font-mono">
            {bestRecord ? `${bestRecord.max1RM} kg` : '--'}
          </div>
          <div className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
            Fórmula de Epley
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E2623] p-4 rounded-3xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 mb-1">
            <Dumbbell className="w-4 h-4" />
            <span>Carga Máxima</span>
          </div>
          <div className="text-xl font-black text-[#18201D] dark:text-white font-mono">
            {bestRecord ? `${bestRecord.maxWeight} kg` : '--'}
          </div>
          <div className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
            Maior peso registrado
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#1E2623] p-4 rounded-3xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Treinos Feitos</span>
          </div>
          <div className="text-xl font-black text-[#18201D] dark:text-white font-mono">
            {progressionData.length}
          </div>
          <div className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
            Sessões registradas
          </div>
        </div>
      </div>

      {/* Progression Chart */}
      <div className="bg-white dark:bg-[#1E2623] p-5 rounded-3xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-black text-[#18201D] dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Evolução da Carga de Trabalho
            </h3>
            <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
              Acompanhamento ao longo das semanas
            </span>
          </div>
        </div>

        {progressionData.length === 0 ? (
          <div className="py-10 text-center">
            <Dumbbell className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF]">
              Nenhum dado registrado para este exercício ainda.
            </p>
            <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5">
              Conclua uma sessão de treino incluindo este exercício para ver seu gráfico de evolução.
            </p>
          </div>
        ) : progressionData.length === 1 ? (
          <div className="py-6 text-center bg-[#F7F4EE] dark:bg-[#232D29] rounded-2xl">
            <p className="text-xs font-bold text-[#18201D] dark:text-white">
              Primeiro registro concluído!
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
              {progressionData[0].weightKg} kg × {progressionData[0].reps} reps ({progressionData[0].date})
            </p>
            <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] mt-2">
              Faça mais um treino para traçar a curva de progressão de cargas.
            </p>
          </div>
        ) : chartPoints ? (
          <div>
            <div className="w-full overflow-hidden flex justify-center">
              <svg
                viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                className="w-full max-w-sm h-36 overflow-visible"
              >
                {/* Horizontal Guide Lines */}
                <line
                  x1="10"
                  y1="20"
                  x2={chartPoints.width - 10}
                  y2="20"
                  stroke="#888"
                  strokeDasharray="4 4"
                  opacity="0.15"
                />
                <line
                  x1="10"
                  y1={chartPoints.height - 20}
                  x2={chartPoints.width - 10}
                  y2={chartPoints.height - 20}
                  stroke="#888"
                  strokeDasharray="4 4"
                  opacity="0.15"
                />

                {/* Path */}
                <path
                  d={chartPoints.pathString}
                  fill="none"
                  stroke={activeColor.primary}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Circles for points */}
                {chartPoints.points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    className="fill-white dark:fill-[#1E2623] stroke-emerald-500 stroke-2"
                  />
                ))}
              </svg>
            </div>

            {/* Timeline history list */}
            <div className="mt-4 pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842] space-y-2">
              <h4 className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase">
                Histórico detalhado por data
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 touch-pan-y pr-1">
                {[...progressionData].reverse().map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#232D29] text-xs font-semibold"
                  >
                    <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-mono text-[11px]">
                      {item.date}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#18201D] dark:text-white font-mono font-bold">
                        {item.weightKg} kg × {item.reps} reps
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        1RM: {item.estimated1RM} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
