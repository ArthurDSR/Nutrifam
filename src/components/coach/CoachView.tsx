import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Droplets, Flame, Scale, Dumbbell, Check, BookmarkPlus } from 'lucide-react';
import { UserProfile, DayLog } from '../../types';
import { WorkoutRoutine } from '../../types/workout';
import { generateCoachAdvice, askCoachAI, CoachHistoryMessage } from '../../services/aiService';
import { saveWorkoutRoutineToSupabase } from '../../services/supabaseClient';
import { useTheme } from '../../services/themeService';

interface CoachViewProps {
  profile: UserProfile;
  todayLog: DayLog;
  geminiApiKey?: string;
  onOpenScientificAssessment?: () => void;
  onWorkoutRoutineCreated?: () => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
  workoutProposal?: WorkoutRoutine;
  isSavedToRoutines?: boolean;
}

/**
 * Extracts any ```workout_proposal ... ``` code block from text and parses JSON
 */
function extractWorkoutProposal(text: string): { cleanText: string; proposal?: WorkoutRoutine } {
  const match = text.match(/```workout_proposal\s*([\s\S]*?)\s*```/);
  if (!match) return { cleanText: text };

  try {
    const jsonStr = match[1].trim();
    const parsed = JSON.parse(jsonStr);
    const proposal: WorkoutRoutine = {
      id: `ai_routine_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: parsed.title || 'Ficha Sugerida pelo Coach IA',
      description: parsed.description || 'Treino montado sob medida pelo Coach IA',
      category: parsed.category || 'custom',
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const cleanText = text.replace(/```workout_proposal[\s\S]*?```/, '').trim();
    return { cleanText, proposal };
  } catch (err) {
    console.warn('Failed to parse workout proposal JSON:', err);
    return { cleanText: text };
  }
}

export const CoachView: React.FC<CoachViewProps> = ({
  profile,
  todayLog,
  geminiApiKey,
  onOpenScientificAssessment,
  onWorkoutRoutineCreated
}) => {
  const { isDark, activeColor } = useTheme();
  const effectiveProfile = geminiApiKey
    ? { ...profile, geminiApiKey: profile.geminiApiKey || geminiApiKey }
    : profile;
  const advice = generateCoachAdvice(todayLog, effectiveProfile);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Olá ${profile.name}! Sou seu Coach Nutricional e Esportivo com IA. Acompanho suas calorias, macros e também posso montar suas fichas de treino sob medida, dar receitas fit e analisar seu progresso. Como posso te ajudar hoje?`,
      time: '08:50'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [savingRoutineId, setSavingRoutineId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSaveProposalToRoutines = async (msgIndex: number, proposal: WorkoutRoutine) => {
    setSavingRoutineId(proposal.id);
    try {
      await saveWorkoutRoutineToSupabase(proposal, profile.id);
      setMessages((prev) =>
        prev.map((m, idx) => (idx === msgIndex ? { ...m, isSavedToRoutines: true } : m))
      );
      if (onWorkoutRoutineCreated) {
        onWorkoutRoutineCreated();
      }
    } catch (err) {
      console.warn('Error saving AI routine:', err);
      alert('Não foi possível salvar a ficha. Verifique sua conexão.');
    } finally {
      setSavingRoutineId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsg: Message = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    setIsTyping(true);

    // Build multi-turn history payload for context
    const historyPayload: CoachHistoryMessage[] = nextMessages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    setTimeout(async () => {
      let rawReply = '';
      try {
        rawReply = await askCoachAI(userText, effectiveProfile, todayLog, historyPayload);
      } catch (err) {
        console.warn('Coach AI error:', err);
      }

      if (!rawReply) {
        rawReply = `Excelente pergunta, ${profile.name}! Para sustentar sua meta em ${profile.dailyCaloriesTarget} kcal, priorize hidratação adequada, ingestão consistente de proteínas em cada refeição e controle de porções de carboidratos refinados.`;
      }

      const { cleanText, proposal } = extractWorkoutProposal(rawReply);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: cleanText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          workoutProposal: proposal,
          isSavedToRoutines: false
        }
      ]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden select-none bg-[#F7F4EE] dark:bg-[#18201D] transition-colors duration-200">
      {/* Scrollable Area: Header Diagnostics + Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-3 space-y-3.5">
        {/* Header card */}
        <div className="bg-white dark:bg-[#232D29] rounded-3xl p-4 shadow-cozy border border-[#AEBDB5]/30 dark:border-[#394842] transition-colors">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xs border transition-colors"
              style={{
                backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                color: activeColor.primary
              }}
            >
              <Bot className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-base leading-tight">
                NutriCoach IA
              </h2>
              <p className="text-[11px] font-semibold text-[#6F7C76] dark:text-[#A8B8B1]">
                Treinos científicos, receitas & análise diária
              </p>
            </div>
          </div>

          {/* Scientific assessment shortcut button */}
          {onOpenScientificAssessment && (
            <button
              onClick={onOpenScientificAssessment}
              className="mt-2.5 w-full py-2.5 px-4 rounded-full bg-[#C9D9C8] hover:bg-[#C8E6C9] dark:bg-[#2e473e] dark:hover:bg-[#38584c] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs border-2 border-[#6F7C76] dark:border-[#527768] transition-all active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3F4B46] dark:text-[#C9D9C8]" />
              <span>Fazer Avaliação Científica (Mifflin-St Jeor)</span>
            </button>
          )}

          {/* Daily Diagnostics */}
          <div className="mt-3 space-y-2 text-xs">
            <div className="bg-[#F7F4EE] dark:bg-[#233730] p-2.5 rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs flex items-start gap-2">
              <Flame className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-[#3F4B46] dark:text-[#EDF2EF] font-medium text-[11px] leading-snug">
                {advice.calorieStatus}
              </span>
            </div>

            <div className="bg-[#F7F4EE] dark:bg-[#233730] p-2.5 rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs flex items-start gap-2">
              <Scale className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-[#3F4B46] dark:text-[#EDF2EF] font-medium text-[11px] leading-snug">
                {advice.macroAdvice}
              </span>
            </div>

            <div className="bg-[#F7F4EE] dark:bg-[#233730] p-2.5 rounded-2xl border border-[#AEBDB5]/20 dark:border-[#394842] shadow-2xs flex items-start gap-2">
              <Droplets className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <span className="text-[#3F4B46] dark:text-[#EDF2EF] font-medium text-[11px] leading-snug">
                {advice.waterAdvice}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 pt-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 shadow-2xs mt-1 border"
                  style={{
                    backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                    borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                    color: activeColor.primary
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs transition-colors ${
                  msg.sender === 'user'
                    ? 'rounded-tr-none border'
                    : 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-tl-none font-medium'
                }`}
                style={
                  msg.sender === 'user'
                    ? {
                        backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                        borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                        color: isDark ? activeColor.darkText : activeColor.textDark
                      }
                    : undefined
                }
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Workout Proposal Interactive Card */}
                {msg.workoutProposal && (
                  <div className="mt-3 p-3 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Dumbbell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#18201D] dark:text-white leading-tight">
                          {msg.workoutProposal.title}
                        </h4>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                          Divisão {msg.workoutProposal.category}
                        </span>
                      </div>
                    </div>

                    {msg.workoutProposal.description && (
                      <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1]">
                        {msg.workoutProposal.description}
                      </p>
                    )}

                    {/* Exercises snippet */}
                    <div className="space-y-1 pt-1 border-t border-[#AEBDB5]/20 dark:border-[#394842]">
                      {msg.workoutProposal.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-[#3F4B46] dark:text-[#EDF2EF] truncate max-w-[170px]">
                            • {ex.exerciseName}
                          </span>
                          <span className="font-mono text-[#6F7C76] dark:text-[#A8B8B1]">
                            {ex.targetSets}×{ex.targetReps}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Save Button */}
                    <button
                      type="button"
                      disabled={msg.isSavedToRoutines || savingRoutineId === msg.workoutProposal.id}
                      onClick={() => handleSaveProposalToRoutines(index, msg.workoutProposal!)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                        msg.isSavedToRoutines
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'
                      }`}
                    >
                      {msg.isSavedToRoutines ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Salvo na sua Ficha de Treinos!
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          Salvar na Minha Ficha de Treinos
                        </>
                      )}
                    </button>
                  </div>
                )}

                <span
                  className={`text-[9px] block text-right mt-1.5 font-mono ${
                    msg.sender === 'user'
                      ? 'text-[#6F7C76] dark:text-[#A8B8B1]'
                      : 'text-[#6F7C76] dark:text-[#A8B8B1]'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-1 border shadow-2xs"
                  style={{
                    backgroundColor: isDark ? activeColor.darkBg : activeColor.pastel,
                    borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                    color: activeColor.primary
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-[#6F7C76] dark:text-[#A8B8B1] text-xs pl-9">
              <span
                className="inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: activeColor.primary }}
              />
              <span>Coach analisando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar - firmly anchored at bottom */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 bg-white dark:bg-[#232D29] border-t border-[#AEBDB5]/30 dark:border-[#394842] p-3 transition-colors"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pergunte ao seu Coach (treinos, receitas, macros)..."
            className="w-full pl-4 pr-12 py-2.5 bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/40 dark:border-[#394842] rounded-full text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/70 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#5B8273] shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="absolute right-1 w-8 h-8 rounded-full text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40 shadow-xs hover:opacity-95"
            style={{ backgroundColor: activeColor.primary }}
            aria-label="Enviar mensagem"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
