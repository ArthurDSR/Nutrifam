import React, { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useTheme } from '../../services/themeService';

interface NotesCardProps {
  note: string;
  onSaveNote: (note: string) => void;
}

export const NotesCard: React.FC<NotesCardProps> = ({ note, onSaveNote }) => {
  const { activeColor } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  const handleSave = () => {
    onSaveNote(draft);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-[#232D29] mx-4 my-2.5 rounded-3xl p-5 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] select-none transition-all">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100/80 dark:border-amber-700/40 flex items-center justify-center text-xl shadow-2xs">
          ✏️
        </div>
        <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base">
          Notas do Dia
        </h3>
      </div>

      {/* Note Content / Editing */}
      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Como foi o seu dia, sua energia e alimentação?..."
            rows={3}
            className="w-full text-xs p-3 rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] focus:outline-none focus:border-[#5B8273] resize-none bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF]"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs px-4 py-1.5 rounded-full text-[#6F7C76] dark:text-[#A8B8B1] hover:bg-[#F7F4EE] dark:hover:bg-[#18201D] font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="text-xs px-5 py-1.5 rounded-full text-white font-bold flex items-center gap-1 shadow-cozy hover:opacity-95 transition-all"
              style={{ backgroundColor: activeColor.primary }}
            >
              <Check className="w-3.5 h-3.5" />
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] text-center my-3 px-2">
            {note ? (
              <span className="text-[#3F4B46] dark:text-[#EDF2EF] italic block text-left bg-[#F7F4EE] dark:bg-[#18201D] p-2.5 rounded-xl border border-[#AEBDB5]/20 dark:border-[#394842]">
                "{note}"
              </span>
            ) : (
              'Adicione uma anotação sobre como você se sentiu hoje'
            )}
          </p>

          <div className="flex justify-center mt-1">
            <button
              onClick={() => {
                setDraft(note);
                setIsEditing(true);
              }}
              className="text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-cozy transition-transform active:scale-95 flex items-center gap-1.5 hover:opacity-95"
              style={{ backgroundColor: activeColor.primary }}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{note ? 'Editar nota' : 'Adicionar nota'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export const CustomizeDiaryButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div className="flex justify-center my-4 pb-4">
      <button
        onClick={onClick}
        className="px-6 py-2 rounded-full border border-[#AEBDB5]/30 dark:border-[#394842] bg-white/80 dark:bg-[#232D29] hover:bg-white dark:hover:bg-[#253933] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] text-xs font-bold shadow-cozy transition-all active:scale-95"
      >
        Personalizar diário
      </button>
    </div>
  );
};
