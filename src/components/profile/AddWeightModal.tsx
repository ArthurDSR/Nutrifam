import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { getTodayDateString } from '../../services/storage';
import { useTheme } from '../../services/themeService';

interface AddWeightModalProps {
  currentWeight: number;
  onClose: () => void;
  onSaveWeight: (weight: number, date: string, note?: string) => void;
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({
  currentWeight,
  onClose,
  onSaveWeight
}) => {
  const { activeColor } = useTheme();
  const [weight, setWeight] = useState(currentWeight.toString());
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weight.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0 || !date || date > getTodayDateString()) return;
    onSaveWeight(parsed, date, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
          <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base">Registrar Nova Pesagem</h4>
          <button onClick={onClose} className="p-1 rounded-full text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Peso (kg) *</label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ex: 59.8"
                className="w-full text-2xl font-black text-[#3F4B46] dark:text-[#EDF2EF] bg-[#F7F4EE] dark:bg-[#18201D] p-3 rounded-2xl border-2 border-[#AEBDB5]/30 dark:border-[#394842] focus:outline-none focus:border-[#6F7C76] font-mono transition-colors"
                autoFocus
              />
              <span className="absolute right-4 text-sm font-bold text-[#6F7C76] dark:text-[#A8B8B1]">kg</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Data da Pesagem</label>
            <input
              type="date"
              required
              max={getTodayDateString()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] font-semibold text-[#3F4B46] dark:text-[#EDF2EF] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">Observação (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Pós-treino, em jejum, etc."
              className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 text-white font-bold py-3.5 rounded-full shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: activeColor.primary }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Salvar Pesagem</span>
          </button>
        </form>
      </div>
    </div>
  );
};
