
import React from 'react';
import { X, Check } from 'lucide-react';
import { useTheme } from '../../services/themeService';

interface FastingPlan {
  id: string;
  name: string;
  targetHours: number;
  description: string;
  category: 'Beginners' | 'Intermediate' | 'Expert';
}

const FASTING_PLANS: FastingPlan[] = [
  // Beginners
  {
    id: 'plan_12_12',
    name: '12:12 Circadian Fast',
    targetHours: 12,
    description: 'You probably already fast this way!',
    category: 'Beginners'
  },
  {
    id: 'plan_14_10',
    name: '14:10 Beginners Fast',
    targetHours: 14,
    description: "Late breakfast to have access to the 'ketosis' stage of fasting",
    category: 'Beginners'
  },
  // Intermediate
  {
    id: 'plan_16_8',
    name: '16:8',
    targetHours: 16,
    description: 'Go through all the stages of fasting by skipping one meal',
    category: 'Intermediate'
  },
  {
    id: 'plan_17_7',
    name: '17:7',
    targetHours: 17,
    description: 'Extend your ketosis stage by increasing your fasting phase',
    category: 'Intermediate'
  },
  // Expert
  {
    id: 'plan_18_6',
    name: '18:6 Expert fasting',
    targetHours: 18,
    description: 'Eating window is small, do that only after having achieved 16:8.',
    category: 'Expert'
  },
  {
    id: 'plan_20_4',
    name: '20:4 OMAD',
    targetHours: 20,
    description: 'One meal a day, only for the most expert faster.',
    category: 'Expert'
  }
];

interface FastingPlansModalProps {
  currentPlanHours: number;
  onClose: () => void;
  onSelectPlan: (hours: number) => void;
}

export const FastingPlansModal: React.FC<FastingPlansModalProps> = ({
  currentPlanHours,
  onClose,
  onSelectPlan
}) => {
  const { activeColor } = useTheme();
  const categories: ('Beginners' | 'Intermediate' | 'Expert')[] = ['Beginners', 'Intermediate', 'Expert'];

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F4EE] dark:bg-[#18201D] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 transition-colors">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center border-b border-[#AEBDB5]/20 dark:border-[#394842] bg-white dark:bg-[#232D29] select-none">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center border border-[#AEBDB5]/30 dark:border-[#394842]"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="flex-1 text-center font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base -ml-10">
          Jejum Intermitente
        </h2>
      </div>

      {/* Plans List */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10 space-y-6 select-none">
        {categories.map((cat) => {
          const catPlans = FASTING_PLANS.filter((p) => p.category === cat);
          return (
            <div key={cat}>
              <h3 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base mb-3">
                {cat === 'Beginners' ? 'Iniciantes' : cat === 'Intermediate' ? 'Intermediário' : 'Avançado'}
              </h3>
              <div className="space-y-3">
                {catPlans.map((plan) => {
                  const isSelected = plan.targetHours === currentPlanHours;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        onSelectPlan(plan.targetHours);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                        isSelected
                          ? 'border-2 bg-[#ECEFE7] dark:bg-[#232D29]'
                          : 'border-[#AEBDB5]/30 dark:border-[#394842] bg-white dark:bg-[#232D29] hover:border-[#6F7C76]'
                      }`}
                      style={{
                        borderColor: isSelected ? activeColor.primary : undefined
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Circle Donut graphic */}
                        <div
                          className="w-12 h-12 rounded-full border-4 shrink-0 flex items-center justify-center text-xs font-bold"
                          style={{
                            borderColor: activeColor.pastel,
                            backgroundColor: activeColor.bgTintLight,
                            color: activeColor.textDark
                          }}
                        >
                          {plan.targetHours}h
                        </div>

                        <div>
                          <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">
                            {plan.name}
                          </h4>
                          <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5 leading-snug">
                            {plan.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          className="w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0 ml-2"
                          style={{ backgroundColor: activeColor.primary }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-center text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] pt-4">
          Você tem um rastreador de jejum ativo
        </p>
      </div>
    </div>
  );
};
