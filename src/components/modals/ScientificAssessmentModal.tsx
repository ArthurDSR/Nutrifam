import React, { useState } from 'react';
import { X, Calculator, Check, Droplets } from 'lucide-react';
import { UserProfile } from '../../types';
import { calculateNutrition } from '../../services/nutritionCalculator';
import { useTheme } from '../../services/themeService';

interface ScientificAssessmentModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSaveAssessment: (updatedProfile: Partial<UserProfile>) => void;
}

export const ScientificAssessmentModal: React.FC<ScientificAssessmentModalProps> = ({
  profile,
  onClose,
  onSaveAssessment
}) => {
  const { activeColor } = useTheme();
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [age, setAge] = useState(profile.age || 24);
  const [heightCm, setHeightCm] = useState(profile.heightCm || 170);
  const [currentWeightKg, setCurrentWeightKg] = useState(profile.currentWeightKg || 70);
  const [goalWeightKg, setGoalWeightKg] = useState(profile.goalWeightKg || profile.currentWeightKg || 70);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'high' | 'very_high'>(
    profile.activityLevel || 'moderate'
  );
  const [goalType, setGoalType] = useState<'Lose weight' | 'Maintain weight' | 'Gain muscle'>(
    profile.goalType || 'Gain muscle'
  );
  const [pace, setPace] = useState<'gentle' | 'standard' | 'fast'>('standard');

  // Unified Scientific Calculations (Mifflin-St Jeor & WHO standards)
  const calculation = calculateNutrition({
    gender,
    age,
    heightCm,
    currentWeightKg,
    goalWeightKg,
    goalType,
    activityLevel,
    pace
  });

  const { bmr, tdee, targetCalories, targetMacros, waterLiters } = calculation;
  const { proteinGrams, carbsGrams, fatGrams, fiberGrams } = targetMacros;

  const handleApply = () => {
    onSaveAssessment({
      gender,
      age,
      heightCm,
      currentWeightKg,
      goalWeightKg,
      activityLevel,
      goalType,
      dailyCaloriesTarget: targetCalories,
      targetMacros: {
        proteinGrams,
        carbsGrams,
        fatGrams,
        fiberGrams
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#232D29] w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842] shrink-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5" style={{ color: activeColor.primary }} />
            <h3 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base">Avaliação Nutricional Científica</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center transition-colors border border-[#AEBDB5]/30 dark:border-[#394842]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {/* Gender */}
          <div>
            <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1.5">Sexo Biológico</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  gender === 'male'
                    ? 'bg-[#C9D9C8] text-[#3F4B46] border-[#6F7C76] dark:bg-[#2e473e] dark:text-[#EDF2EF] dark:border-[#527768] shadow-xs'
                    : 'bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] border-[#AEBDB5]/30 dark:border-[#394842]'
                }`}
              >
                Masculino
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 rounded-xl font-bold border transition-all ${
                  gender === 'female'
                    ? 'bg-[#C9D9C8] text-[#3F4B46] border-[#6F7C76] dark:bg-[#2e473e] dark:text-[#EDF2EF] dark:border-[#527768] shadow-xs'
                    : 'bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] border-[#AEBDB5]/30 dark:border-[#394842]'
                }`}
              >
                Feminino
              </button>
            </div>
          </div>

          {/* Age, Height & Weights */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Idade (anos)</label>
              <input
                type="number"
                min={12}
                max={100}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 20)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Altura (cm)</label>
              <input
                type="number"
                min={100}
                max={230}
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value, 10) || 170)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 60)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Peso Meta (kg)</label>
              <input
                type="number"
                step="0.1"
                value={goalWeightKg}
                onChange={(e) => setGoalWeightKg(parseFloat(e.target.value) || 60)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1.5">Nível de Atividade Física</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
            >
              <option value="sedentary">Sedentário (Trabalho de escritório, sem exercícios)</option>
              <option value="light">Levemente Ativo (Caminhadas, exercício 1-3 dias/semana)</option>
              <option value="moderate">Moderadamente Ativo (Treino consistente 3-5 dias/semana)</option>
              <option value="high">Muito Ativo (Treino intenso 6-7 dias/semana)</option>
              <option value="very_high">Extremamente Ativo (Atleta ou trabalho braçal pesado)</option>
            </select>
          </div>

          {/* Goal & Pace */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Objetivo</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
              >
                <option value="Lose weight">Perder Gordura</option>
                <option value="Maintain weight">Manter Peso</option>
                <option value="Gain muscle">Ganhar Massa Muscular</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Ritmo</label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-bold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
              >
                <option value="gentle">Gradual & Confortável</option>
                <option value="standard">Padrão Otimizado</option>
                <option value="fast">Acelerado</option>
              </select>
            </div>
          </div>

          {/* Live Scientific Result Card */}
          <div className="p-4 rounded-2xl bg-[#ECEFE7] dark:bg-[#18201D] border border-[#AEBDB5]/40 dark:border-[#394842] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-xs">Cálculo Científico Dinâmico</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9D9C8] text-[#3F4B46] dark:bg-[#2e473e] dark:text-[#EDF2EF]">
                Mifflin-St Jeor
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
                <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-bold block">Taxa Basal (TMB)</span>
                <span className="text-base font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{bmr} kcal</span>
              </div>

              <div className="p-2.5 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs">
                <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-bold block">Gasto Total (TDEE)</span>
                <span className="text-base font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{tdee} kcal</span>
              </div>
            </div>

            {/* Daily Target Calories & Water */}
            <div className="p-3 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] block">Nova Meta Diária:</span>
                <span className="text-xl font-bold" style={{ color: activeColor.primary }}>{targetCalories} kcal / dia</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-bold block">Meta de Água (35ml/kg):</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400 flex items-center gap-0.5 justify-end">
                  <Droplets className="w-3.5 h-3.5 fill-sky-500" />
                  {waterLiters} Litros
                </span>
              </div>
            </div>

            {/* Target Macros Distribution */}
            <div>
              <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] block mb-1.5">
                Distribuição Ideal de Macronutrientes:
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-1.5 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                  <span className="text-[9px] text-indigo-500 font-bold block">Proteína</span>
                  <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{proteinGrams}g</span>
                </div>
                <div className="p-1.5 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                  <span className="text-[9px] text-amber-500 font-bold block">Carbos</span>
                  <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{carbsGrams}g</span>
                </div>
                <div className="p-1.5 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                  <span className="text-[9px] text-rose-500 font-bold block">Gorduras</span>
                  <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{fatGrams}g</span>
                </div>
                <div className="p-1.5 bg-white dark:bg-[#232D29] rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                  <span className="text-[9px] text-emerald-500 font-bold block">Fibras</span>
                  <span className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{fiberGrams}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842] shrink-0">
          <button
            onClick={handleApply}
            className="w-full py-3.5 rounded-full text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Aplicar Metas ao Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
