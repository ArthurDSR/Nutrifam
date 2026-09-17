import React, { useState } from 'react';
import { X, Flame, Loader2 } from 'lucide-react';
import { ActivityEntry } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface ActivitiesCardProps {
  activities: ActivityEntry[];
  onAddActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  onRemoveActivity: (id: string) => void;
  onSyncHealth?: () => void;
  isSyncingHealth?: boolean;
}

export const ActivitiesCard: React.FC<ActivitiesCardProps> = ({
  activities,
  onAddActivity,
  onRemoveActivity,
  onSyncHealth,
  isSyncingHealth = false
}) => {
  const { t } = useTranslation();
  const { activeColor } = useTheme();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedType, setSelectedType] = useState('Caminhada');
  const [durationMin, setDurationMin] = useState(30);

  const totalCaloriesBurned = activities.reduce((acc, a) => acc + a.caloriesBurned, 0);

  const activityTypes = [
    { title: 'Caminhada', ratePerMin: 4.5, icon: '🚶' },
    { title: 'Corrida', ratePerMin: 11.0, icon: '🏃' },
    { title: 'Musculação', ratePerMin: 6.0, icon: '🏋️' },
    { title: 'Ciclismo', ratePerMin: 8.5, icon: '🚴' },
    { title: 'Natação', ratePerMin: 9.0, icon: '🏊' }
  ];

  const handleSave = () => {
    const act = activityTypes.find((a) => a.title === selectedType) || activityTypes[0];
    const burned = Math.round(act.ratePerMin * durationMin);
    onAddActivity({
      title: `${act.icon} ${selectedType}`,
      caloriesBurned: burned,
      durationMinutes: durationMin
    });
    setIsOpenModal(false);
  };

  return (
    <div className="bg-white dark:bg-[#232D29] mx-4 my-2.5 rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] select-none transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/60 dark:border-amber-700/40 flex items-center justify-center text-xl shadow-2xs">
            🏆
          </div>
          <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base">
            {t('activity.title')}
          </h3>
        </div>
        <span className="text-xs font-bold text-orange-500 dark:text-orange-400">
          {totalCaloriesBurned} {t('activity.burned')}
        </span>
      </div>

      {/* Description / List */}
      {activities.length === 0 ? (
        <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] text-center my-3.5">
          {t('activity.empty')}
        </p>
      ) : (
        <div className="my-3 divide-y divide-[#AEBDB5]/20 dark:divide-[#394842]">
          {activities.map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{item.title}</span>
                <span className="text-[#6F7C76] dark:text-[#A8B8B1] ml-2">({item.durationMinutes} min)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500 dark:text-orange-400 font-extrabold">-{item.caloriesBurned} Cal</span>
                <button
                  onClick={() => onRemoveActivity(item.id)}
                  className="text-[#AEBDB5] dark:text-[#A8B8B1] hover:text-rose-500 dark:hover:text-rose-400 p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          onClick={() => setIsOpenModal(true)}
          className="text-white text-xs font-extrabold px-5 py-2.5 rounded-full shadow-cozy transition-all active:scale-95 hover:opacity-95"
          style={{ backgroundColor: activeColor.primary }}
        >
          {t('activity.add')}
        </button>

        {onSyncHealth && (
          <button
            onClick={onSyncHealth}
            disabled={isSyncingHealth}
            className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold px-4 py-2.5 rounded-full border border-rose-200/60 dark:border-rose-900/40 transition-transform active:scale-95 shadow-2xs disabled:opacity-50"
            title="Importar treinos e gasto calórico do Apple Health / Google Fit"
          >
            {isSyncingHealth ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600 dark:text-rose-400" />
            ) : (
              <span>❤️</span>
            )}
            <span>Sincronizar Saúde</span>
          </button>
        )}
      </div>

      {/* Activity Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#AEBDB5]/30 dark:border-[#394842] animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
              <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base">Registrar Atividade</h4>
              <button onClick={() => setIsOpenModal(false)} className="text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] block mb-1.5">Tipo de Atividade</label>
                <div className="grid grid-cols-3 gap-2">
                  {activityTypes.map((act) => (
                    <button
                      key={act.title}
                      type="button"
                      onClick={() => setSelectedType(act.title)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedType === act.title
                          ? 'border-[#5B8273] bg-[#ECEFE7] dark:bg-[#233730] font-bold text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
                          : 'border-[#AEBDB5]/30 dark:border-[#394842] text-[#6F7C76] dark:text-[#A8B8B1] hover:bg-[#F7F4EE] dark:hover:bg-[#18201D]'
                      }`}
                    >
                      <div className="text-xl mb-1">{act.icon}</div>
                      <div className="text-[11px]">{act.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#6F7C76] dark:text-[#A8B8B1]">Duração (minutos)</span>
                  <span className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">{durationMin} min</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={180}
                  step={5}
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full h-2 bg-[#ECEFE7] dark:bg-[#18201D] rounded-lg cursor-pointer"
                  style={{ accentColor: activeColor.primary }}
                />
              </div>

              <div className="bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl p-3 border border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between text-xs">
                <span className="text-[#6F7C76] dark:text-[#A8B8B1] font-medium">Estimativa de queima:</span>
                <span className="font-black text-orange-500 dark:text-orange-400 text-sm flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  {Math.round(
                    (activityTypes.find((a) => a.title === selectedType)?.ratePerMin || 5) * durationMin
                  )}{' '}
                  Cal
                </span>
              </div>

              <button
                onClick={handleSave}
                className="w-full text-white font-bold py-3 rounded-2xl shadow-cozy transition-transform active:scale-98 hover:opacity-95"
                style={{ backgroundColor: activeColor.primary }}
              >
                Salvar Atividade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
