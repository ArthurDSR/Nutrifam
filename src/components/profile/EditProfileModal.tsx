import React, { useState, useRef } from 'react';
import { X, Check, Calculator, Camera, Trash2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { calculateNutrition } from '../../services/nutritionCalculator';
import { useTheme } from '../../services/themeService';

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
  onOpenScientificAssessment?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onClose,
  onSaveProfile,
  onOpenScientificAssessment
}) => {
  const { activeColor, isDark } = useTheme();
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [goalType, setGoalType] = useState(profile.goalType);
  const [heightCm, setHeightCm] = useState(profile.heightCm.toString());
  const [startWeightKg, setStartWeightKg] = useState(profile.startWeightKg.toString());
  const [currentWeightKg, setCurrentWeightKg] = useState(profile.currentWeightKg.toString());
  const [goalWeightKg, setGoalWeightKg] = useState(profile.goalWeightKg.toString());
  const [dailyCaloriesTarget, setDailyCaloriesTarget] = useState(profile.dailyCaloriesTarget.toString());

  const handleAutoCalculate = () => {
    const h = parseFloat(heightCm.replace(',', '.')) || profile.heightCm || 170;
    const w = parseFloat(currentWeightKg.replace(',', '.')) || profile.currentWeightKg;
    const g = parseFloat(goalWeightKg.replace(',', '.')) || profile.goalWeightKg || w;
    const result = calculateNutrition({
      gender: profile.gender || 'male',
      age: profile.age || 25,
      heightCm: h,
      currentWeightKg: w,
      goalWeightKg: g,
      goalType,
      activityLevel: profile.activityLevel || 'moderate',
      pace: 'standard'
    });
    setDailyCaloriesTarget(result.targetCalories.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Usuário',
      avatarText: (name.trim() || 'U')[0].toUpperCase(),
      avatarUrl: avatarUrl.trim() || undefined,
      goalType,
      heightCm: parseFloat(heightCm.replace(',', '.')) || profile.heightCm,
      startWeightKg: parseFloat(startWeightKg.replace(',', '.')) || profile.startWeightKg,
      currentWeightKg: parseFloat(currentWeightKg.replace(',', '.')) || profile.currentWeightKg,
      goalWeightKg: parseFloat(goalWeightKg.replace(',', '.')) || profile.goalWeightKg,
      dailyCaloriesTarget: parseInt(dailyCaloriesTarget, 10) || profile.dailyCaloriesTarget || 2000
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
          <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base">Editar Perfil & Metas</h4>
          <button onClick={onClose} className="p-1 rounded-full text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Avatar / Photo with Secondary Color Styling */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-[26px] border-[2.5px] shadow-sm flex items-center justify-center text-3xl font-black transition-all overflow-hidden"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, ${activeColor.darkBg} 0%, #18201D 100%)`
                    : `linear-gradient(135deg, ${activeColor.pastel} 0%, ${activeColor.bgTintLight} 100%)`,
                  borderColor: activeColor.primary,
                  boxShadow: isDark
                    ? `0 4px 16px ${activeColor.primary}25`
                    : `0 4px 16px ${activeColor.primary}35`,
                  color: isDark ? activeColor.darkText : activeColor.primary
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="select-none tracking-tight">{(name.trim() || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-transform active:scale-90 border-2"
                style={{
                  backgroundColor: activeColor.primary,
                  borderColor: isDark ? '#232D29' : '#ffffff',
                  color: '#ffffff'
                }}
                aria-label="Escolher foto"
                title="Escolher foto"
              >
                <Camera className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold transition-opacity hover:opacity-80"
                style={{ color: activeColor.primary }}
              >
                {avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[11px] font-medium text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover</span>
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] font-semibold focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Objetivo</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] font-semibold focus:outline-none transition-colors"
            >
              <option value="Lose weight">Lose weight (Emagrecimento)</option>
              <option value="Maintain weight">Maintain weight (Manutenção)</option>
              <option value="Gain muscle">Gain muscle (Ganho de Massa)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Altura (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] font-semibold focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Peso Inicial (kg)</label>
              <input
                type="number"
                step="0.1"
                value={startWeightKg}
                onChange={(e) => setStartWeightKg(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] font-semibold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Peso Meta (kg)</label>
              <input
                type="number"
                step="0.1"
                value={goalWeightKg}
                onChange={(e) => setGoalWeightKg(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] text-rose-600 dark:text-rose-400 font-bold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">Meta Calórica Diária (kcal/dia)</label>
              <button
                type="button"
                onClick={handleAutoCalculate}
                className="text-[10px] font-bold flex items-center gap-1 hover:underline transition-colors"
                style={{ color: activeColor.primary }}
              >
                <Calculator className="w-3 h-3" />
                Calcular BMR
              </button>
            </div>
            <input
              type="number"
              value={dailyCaloriesTarget}
              onChange={(e) => setDailyCaloriesTarget(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-black text-[#3F4B46] dark:text-[#EDF2EF] text-base focus:outline-none transition-colors"
            />
            {onOpenScientificAssessment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenScientificAssessment();
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-[#ECEFE7] dark:bg-[#18201D] hover:bg-[#C8E6C9]/50 dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] text-[11px] font-bold flex items-center justify-center gap-1.5 border border-[#AEBDB5]/30 dark:border-[#394842] transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" style={{ color: activeColor.primary }} />
                <span>Abrir Avaliação Científica Completa</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 text-white font-bold py-3.5 rounded-full shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Salvar Alterações</span>
          </button>
        </form>
      </div>
    </div>
  );
};
