import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Droplets, Flame, Scale } from 'lucide-react';
import { UserProfile, DayLog } from '../../types';
import { generateCoachAdvice } from '../../services/aiService';
import { useTheme } from '../../services/themeService';

interface CoachViewProps {
  profile: UserProfile;
  todayLog: DayLog;
  geminiApiKey?: string;
  onOpenScientificAssessment?: () => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const CoachView: React.FC<CoachViewProps> = ({
  profile,
  todayLog,
  geminiApiKey,
  onOpenScientificAssessment
}) => {
  const { isDark, activeColor } = useTheme();
  const advice = generateCoachAdvice(todayLog, profile);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Olá ${profile.name}! Sou seu Coach Nutricional Inteligente. Acompanho seu objetivo de ${profile.goalType.toLowerCase()} e o consumo de calorias e macros em tempo real. Como posso te ajudar hoje?`,
      time: '08:50'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    // Call Gemini API if available, or generate contextual nutrition response
    setTimeout(async () => {
      let reply = '';
      if (geminiApiKey && geminiApiKey.trim()) {
        try {
          const prompt = `Você é um nutricionista esportivo amigável, motivador e científico.
O usuário se chama ${profile.name}, pesa ${profile.currentWeightKg}kg, tem meta de ${profile.goalWeightKg}kg e limite de ${profile.dailyCaloriesTarget} kcal/dia.
Ele pergunta: "${userText}".
Responda de forma concisa, objetiva e prática em 2 a 3 frases.`;

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );
          if (res.ok) {
            const data = await res.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          }
        } catch {}
      }

      if (!reply) {
        // High quality heuristic responses
        const lower = userText.toLowerCase();
        if (lower.includes('jantar') || lower.includes('noite') || lower.includes('dinner')) {
          reply = `Para o jantar, uma excelente opção com alta saciedade e poucas calorias é filé de peito de frango grelhado (150g) com salada farta de folhas verdes e brócolis cozido no vapor. Isso garante ~45g de proteína mantendo o déficit calórico!`;
        } else if (lower.includes('proteina') || lower.includes('proteína') || lower.includes('protein')) {
          reply = `Para bater seus ${profile.targetMacros.proteinGrams}g de proteína diários, inclua fontes magras como ovos mexidos, peito de frango, atum, iogurte natural desnatado ou uma dose de Whey Protein após o treino.`;
        } else if (lower.includes('fome') || lower.includes('apetite') || lower.includes('doce')) {
          reply = `A vontade de comer doces costuma estar ligada a sede ou queda rápida de energia. Beba 300ml de água gelada primeiro e, se persistir, aposte em chocolate 70%+ com moderação ou maçã polvilhada com canela!`;
        } else {
          reply = `Excelente pergunta, ${profile.name}! Para sustentar sua meta em ${profile.dailyCaloriesTarget} kcal, priorize hidratação adequada, ingestão consistente de proteínas em cada refeição e controle de porções de carboidratos refinados.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 800);
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
                Análise diária personalizada
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
                className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs transition-colors ${
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
                <p>{msg.text}</p>
                <span
                  className={`text-[9px] block text-right mt-1 font-mono ${
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
            placeholder="Pergunte ao seu Coach IA..."
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
