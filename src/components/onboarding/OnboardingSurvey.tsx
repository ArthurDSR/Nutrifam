import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Flame,
  Droplets,
  Scale,
  Ruler,
  TrendingDown,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  Dumbbell,
  X
} from 'lucide-react';
import { UserProfile } from '../../types';
import { calculateNutrition } from '../../services/nutritionCalculator';
import {
  loginWithOAuth,
  registerAccount,
  getLocalAuthUser,
  AuthUser
} from '../../services/authService';
import { useTheme } from '../../services/themeService';
import { FoodBudMascot, FoodBudMood } from '../pet/FoodBudMascot';

interface OnboardingSurveyProps {
  onComplete: (completedProfile: UserProfile, initialWeight: number, authUser?: AuthUser) => void;
  existingProfile?: UserProfile;
  isRedoing?: boolean;
  onClose?: () => void;
  onOpenLogin?: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type RaccoonPose = 'welcome' | 'thinking' | 'intellectual' | 'curious' | 'sporty' | 'cloud' | 'celebrate';

const ONBOARDING_DRAFT_KEY = 'nutrifam_onboarding_draft';
const LEGACY_ONBOARDING_DRAFT_KEY = 'nutrimonitor_onboarding_draft';

function parseSurveyNumber(val: string): number {
  if (!val) return 0;
  const clean = val.toString().replace(',', '.').replace(/[^0-9.]/g, '').trim();
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({
  onComplete,
  existingProfile,
  isRedoing = false,
  onClose,
  onOpenLogin
}) => {
  const { isDark } = useTheme();
  const isUserRedoing = Boolean(
    isRedoing || (existingProfile?.isOnboardingCompleted && existingProfile?.name)
  );

  const initialUser: AuthUser | null = (() => {
    const local = getLocalAuthUser();
    if (local) return local;
    if (existingProfile?.email) {
      return {
        id: existingProfile.id || 'local_user',
        email: existingProfile.email,
        name: existingProfile.name || 'Usuário',
        provider: 'email'
      };
    }
    return null;
  })();

  // Load draft if user refreshed or redirected from OAuth
  const draft = (() => {
    try {
      const raw = sessionStorage.getItem(ONBOARDING_DRAFT_KEY) || sessionStorage.getItem(LEGACY_ONBOARDING_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // If user is redoing the survey, skip Step 1 (Name & Pet name) directly to Step 2 (Goal)
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    if (draft?.currentStep) return draft.currentStep as Step;
    if (isUserRedoing) return 2;
    return 1;
  });

  // User & Pet Names (pre-filled from existingProfile when redoing)
  const [userName, setUserName] = useState<string>(() => draft?.userName || existingProfile?.name || '');
  const [petName, setPetName] = useState<string>(() => draft?.petName || existingProfile?.petName || 'FoodBud');

  // Biometrics & Goals (Pre-fill with existing values if redoing, or wait for fresh input)
  const [goalType, setGoalType] = useState<'Lose weight' | 'Maintain weight' | 'Gain muscle' | null>(
    () => draft?.goalType || existingProfile?.goalType || null
  );
  const [gender, setGender] = useState<'male' | 'female' | null>(() => draft?.gender || existingProfile?.gender || null);
  const [ageInput, setAgeInput] = useState<string>(() => draft?.ageInput || (existingProfile?.age ? String(existingProfile.age) : ''));
  const [heightInput, setHeightInput] = useState<string>(
    () => draft?.heightInput || (existingProfile?.heightCm && existingProfile.heightCm > 0 ? String(existingProfile.heightCm) : '')
  );
  const [currentWeightInput, setCurrentWeightInput] = useState<string>(
    () =>
      draft?.currentWeightInput ||
      (existingProfile?.currentWeightKg && existingProfile.currentWeightKg > 0
        ? String(existingProfile.currentWeightKg)
        : '')
  );
  const [goalWeightInput, setGoalWeightInput] = useState<string>(
    () =>
      draft?.goalWeightInput ||
      (existingProfile?.goalWeightKg && existingProfile.goalWeightKg > 0 ? String(existingProfile.goalWeightKg) : '')
  );
  const [pace, setPace] = useState<'gentle' | 'standard' | 'fast'>(
    () =>
      draft?.pace ||
      existingProfile?.pace ||
      (existingProfile?.weeklyPaceKg === 0.25 ? 'gentle' : existingProfile?.weeklyPaceKg === 0.75 ? 'fast' : 'standard')
  );
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'high' | 'very_high' | null>(
    () => draft?.activityLevel || existingProfile?.activityLevel || null
  );

  // Save draft continuously so OAuth redirects or reload never drops survey state
  useEffect(() => {
    try {
      sessionStorage.setItem(
        ONBOARDING_DRAFT_KEY,
        JSON.stringify({
          currentStep,
          userName,
          petName,
          goalType,
          gender,
          ageInput,
          heightInput,
          currentWeightInput,
          goalWeightInput,
          pace,
          activityLevel
        })
      );
    } catch {}
  }, [
    currentStep,
    userName,
    petName,
    goalType,
    gender,
    ageInput,
    heightInput,
    currentWeightInput,
    goalWeightInput,
    pace,
    activityLevel
  ]);

  // Account / Registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(initialUser);

  // Calculated Results
  const [calculatedPlan, setCalculatedPlan] = useState<ReturnType<typeof calculateNutrition> | null>(null);

  // Errors for current step validation
  const [stepError, setStepError] = useState<string | null>(null);

  // Compute live BMI with decimal safety (handling both comma and dot)
  const currentHeightCm = parseSurveyNumber(heightInput);
  const currentWeightKg = parseSurveyNumber(currentWeightInput);
  const goalWeightKg = parseSurveyNumber(goalWeightInput);
  const parsedAge = parseInt(ageInput.replace(/[^0-9]/g, ''), 10) || 0;

  const liveBMI =
    currentHeightCm > 0 && currentWeightKg > 0
      ? (currentWeightKg / ((currentHeightCm / 100) * (currentHeightCm / 100))).toFixed(1)
      : null;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (bmi < 24.9) return { label: 'Peso saudável 🌱', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (bmi < 29.9) return { label: 'Sobrepeso leve', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Obesidade', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  // Trigger celebration confetti when reaching step 8
  useEffect(() => {
    if (currentStep === 8) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // silent fallback
      }
    }
  }, [currentStep]);

  // Determine raccoon pose and dialogue for each step
  const getRaccoonState = (): { pose: RaccoonPose; dialogue: string; moodBadge: string } => {
    switch (currentStep) {
      case 1:
        return {
          pose: 'welcome',
          dialogue: userName
            ? `Muito prazer, ${userName}! Eu sou o ${petName || 'FoodBud'} 🦝. Vou te guiar rumo à sua melhor forma física!`
            : 'Oi! Eu sou seu FoodBud 🦝. Vou te acompanhar todos os dias com nutrição inteligente e hábitos saudáveis. Como posso te chamar?',
          moodBadge: 'Amigável & Animado'
        };
      case 2:
        if (goalType === 'Lose weight') {
          return {
            pose: 'thinking',
            dialogue: 'Perfeito! Vamos queimar gordura com déficit calórico equilibrado, mantendo seus músculos fortes e sem passar fome!',
            moodBadge: 'Focado em Resultados'
          };
        }
        if (goalType === 'Gain muscle') {
          return {
            pose: 'sporty',
            dialogue: 'Excelente! Vamos focar em superávit limpo e alta ingestão de proteínas para construir massa magra com qualidade!',
            moodBadge: 'Modo Força Ativado'
          };
        }
        if (goalType === 'Maintain weight') {
          return {
            pose: 'intellectual',
            dialogue: 'Ótima escolha! Manter o peso com nutrientes balanceados e longevidade é a chave para uma saúde de ferro!',
            moodBadge: 'Equilíbrio Total'
          };
        }
        return {
          pose: 'thinking',
          dialogue: 'Qual é o seu objetivo principal hoje? Cada corpo é único e vou calibrar suas metas para você!',
          moodBadge: 'Curioso'
        };
      case 3:
        return {
          pose: 'intellectual',
          dialogue: 'Para calcular sua Taxa Metabólica Basal (TMB) pela fórmula de Mifflin-St Jeor, preciso do seu sexo biológico e idade.',
          moodBadge: 'Cientista Nutricional'
        };
      case 4:
        return {
          pose: 'curious',
          dialogue: 'Agora suas medidas reais de hoje! Nada de números fictícios: digite sua altura e peso exatos para um cálculo impecável.',
          moodBadge: 'Medindo com Precisão'
        };
      case 5:
        if (goalType === 'Maintain weight') {
          return {
            pose: 'welcome',
            dialogue: `Como seu objetivo é manter, sua meta será manter os ${currentWeightKg || 0} kg com ótima energia e bem-estar!`,
            moodBadge: 'Sustentabilidade'
          };
        }
        const hasValidWeightGoal = goalWeightKg >= 30 && goalWeightKg <= 300 && currentWeightKg >= 30;
        const diff = hasValidWeightGoal ? Math.abs(goalWeightKg - currentWeightKg) : 0;
        const paceKg = pace === 'gentle' ? 0.25 : pace === 'standard' ? 0.5 : 0.75;
        const estimatedWeeks = paceKg > 0 && diff > 0 ? Math.ceil(diff / paceKg) : 0;
        return {
          pose: 'sporty',
          dialogue: estimatedWeeks > 0
            ? `Com ritmo de ${paceKg} kg/sem, a previsão é atingir sua meta em ~${estimatedWeeks} semanas de forma segura e duradoura!`
            : 'Qual peso você quer alcançar e em qual velocidade prefere evoluir?',
          moodBadge: 'Estratégico'
        };
      case 6:
        return {
          pose: 'sporty',
          dialogue: 'Como é sua rotina diária de movimentos e treinos? Isso define seu Fator de Atividade Física (TDEE).',
          moodBadge: 'Energia Pura'
        };
      case 7:
        return {
          pose: 'cloud',
          dialogue: 'Quase lá! Vamos conectar sua conta para salvar suas metas na nuvem com segurança e nunca perder seu progresso.',
          moodBadge: 'Segurança na Nuvem'
        };
      case 8:
        return {
          pose: 'celebrate',
          dialogue: `Viva! 🎉 Calculei todas as suas metas científicas, ${userName || 'campeão'}! Vamos juntos transformar sua saúde!`,
          moodBadge: 'Comemoração!'
        };
    }
  };

  const raccoonState = getRaccoonState();

  // Validate step before advancing
  const handleNextStep = () => {
    setStepError(null);

    if (currentStep === 1) {
      if (!userName.trim()) {
        setStepError('Por favor, digite seu nome para continuarmos.');
        return;
      }
      if (!petName.trim()) {
        setPetName('FoodBud');
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!goalType) {
        setStepError('Por favor, selecione qual é o seu objetivo.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!gender) {
        setStepError('Por favor, selecione seu sexo biológico.');
        return;
      }
      if (!parsedAge || parsedAge < 10 || parsedAge > 110) {
        setStepError('Por favor, informe uma idade válida entre 10 e 110 anos.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!currentHeightCm || currentHeightCm < 90 || currentHeightCm > 240) {
        setStepError('Por favor, informe uma altura válida entre 90 cm e 240 cm.');
        return;
      }
      if (!currentWeightKg || currentWeightKg < 30 || currentWeightKg > 300) {
        setStepError('Por favor, informe seu peso real atual entre 30 kg e 300 kg.');
        return;
      }
      // If maintaining, goal weight is automatically current weight
      if (goalType === 'Maintain weight') {
        setGoalWeightInput(currentWeightKg.toString());
      }
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      if (goalType !== 'Maintain weight') {
        if (!goalWeightKg || goalWeightKg < 30 || goalWeightKg > 300) {
          setStepError('Por favor, informe seu peso meta desejado.');
          return;
        }
      }
      setCurrentStep(6);
      return;
    }

    if (currentStep === 6) {
      if (!activityLevel) {
        setStepError('Por favor, selecione seu nível de atividade física.');
        return;
      }

      // Compute scientific nutrition targets
      const assessment = calculateNutrition({
        gender: gender || 'male',
        age: parsedAge || 25,
        heightCm: currentHeightCm,
        currentWeightKg: currentWeightKg,
        goalWeightKg: goalType === 'Maintain weight' ? currentWeightKg : goalWeightKg,
        goalType: goalType || 'Lose weight',
        activityLevel: activityLevel || 'moderate',
        pace
      });
      setCalculatedPlan(assessment);

      // If already logged in, skip Step 7 and jump directly to celebration (step 8)
      if (registeredUser || existingProfile?.email) {
        setCurrentStep(8);
      } else {
        setCurrentStep(7);
      }
      return;
    }

    if (currentStep === 7) {
      // Step 7 allows skipping or guest mode
      setCurrentStep(8);
      return;
    }

    if (currentStep === 8) {
      handleFinishOnboarding();
    }
  };

  const handlePrevStep = () => {
    setStepError(null);
    // If returning from step 8 and already authenticated, skip step 7 backward
    if (currentStep === 8 && (registeredUser || existingProfile?.email)) {
      setCurrentStep(6);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  // Google OAuth in Onboarding
  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await loginWithOAuth('google');
      if (!res.success) {
        setAuthError(res.message);
        setIsAuthLoading(false);
      }
      // If redirecting, browser will redirect to Google
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao conectar com Google');
      setIsAuthLoading(false);
    }
  };

  // Traditional Email Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !email.includes('@')) {
      setAuthError('Digite um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setAuthError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('As senhas não coincidem.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const res = await registerAccount(email.trim(), password, userName.trim() || 'Usuário');
      setIsAuthLoading(false);
      if (res.success && res.user) {
        setRegisteredUser(res.user);
        setCurrentStep(8);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setIsAuthLoading(false);
      setAuthError(err.message || 'Erro ao cadastrar conta.');
    }
  };

  // Final confirmation to launch main app
  const handleFinishOnboarding = () => {
    const validHeight = parseSurveyNumber(heightInput) || currentHeightCm || 170;
    const validCurrentWeight = parseSurveyNumber(currentWeightInput) || currentWeightKg || 70;
    const validGoalWeight = goalType === 'Maintain weight'
      ? validCurrentWeight
      : (parseSurveyNumber(goalWeightInput) || goalWeightKg || validCurrentWeight);

    const finalPlan = calculatedPlan || calculateNutrition({
      gender: gender || 'male',
      age: parsedAge || 25,
      heightCm: validHeight,
      currentWeightKg: validCurrentWeight,
      goalWeightKg: validGoalWeight,
      goalType: goalType || 'Lose weight',
      activityLevel: activityLevel || 'moderate',
      pace
    });

    const completedProfile: UserProfile = {
      ...(existingProfile || {}),
      id: registeredUser?.id || existingProfile?.id,
      email: registeredUser?.email || existingProfile?.email,
      name: userName.trim() || existingProfile?.name || 'Meu Perfil',
      avatarText: (userName.trim()[0] || existingProfile?.name?.[0] || 'A').toUpperCase(),
      goalType: goalType || existingProfile?.goalType || 'Lose weight',
      heightCm: validHeight,
      startWeightKg: validCurrentWeight,
      currentWeightKg: validCurrentWeight,
      goalWeightKg: validGoalWeight,
      dailyCaloriesTarget: finalPlan.targetCalories,
      targetMacros: finalPlan.targetMacros,
      gems: existingProfile?.gems !== undefined ? existingProfile.gems : 50,
      burnedCalories: existingProfile?.burnedCalories || 0,
      appleHealthSynced: Boolean(existingProfile?.appleHealthSynced),
      gender: gender || existingProfile?.gender || 'male',
      age: parsedAge || existingProfile?.age || 25,
      activityLevel: activityLevel || existingProfile?.activityLevel || 'moderate',
      weeklyPaceKg: pace === 'gentle' ? 0.25 : pace === 'standard' ? 0.5 : 0.75,
      pace,
      petName: petName.trim().slice(0, 14) || existingProfile?.petName || 'FoodBud',
      petLevel: existingProfile?.petLevel || 1,
      petXp: existingProfile?.petXp !== undefined ? existingProfile.petXp : 10,
      petMood: existingProfile?.petMood || 'happy',
      inventory: existingProfile?.inventory || ['cap_lilac', 'glasses_round'],
      equippedCap: existingProfile?.equippedCap !== undefined ? existingProfile.equippedCap : 'cap_lilac',
      equippedGlasses: existingProfile?.equippedGlasses !== undefined ? existingProfile.equippedGlasses : null,
      equippedClothes: existingProfile?.equippedClothes !== undefined ? existingProfile.equippedClothes : null,
      showSplashAnimation: existingProfile?.showSplashAnimation !== undefined ? existingProfile.showSplashAnimation : true,
      isOnboardingCompleted: true
    };

    try {
      sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
    } catch {}

    onComplete(completedProfile, validCurrentWeight, registeredUser || undefined);
  };

  // Render Vector Raccoon with specific poses and accessories matching FoodBud
  const renderRaccoon = () => {
    const { pose } = raccoonState;
    const mood: FoodBudMood =
      pose === 'celebrate' || pose === 'welcome' ? 'love' : 'happy';
    const equippedCap =
      pose === 'celebrate'
        ? 'cap_gold'
        : pose === 'sporty'
        ? 'cap_headband'
        : 'cap_lilac';
    const equippedGlasses = pose === 'intellectual' ? 'glasses_round' : null;

    return (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none transition-transform duration-300">
        <FoodBudMascot
          mood={mood}
          petLevel={1}
          equippedCap={equippedCap}
          equippedGlasses={equippedGlasses}
          equippedClothes={null}
          className="w-24 h-24 sm:w-26 sm:h-26 object-contain drop-shadow-md"
        />
      </div>
    );
  };

  return (
    <div className={`onboarding-shell ${isDark ? 'onboarding-dark bg-gradient-to-b from-[#14201C] via-[#1B2A25] to-[#101714]' : 'onboarding-light bg-gradient-to-b from-[#F7F4EE] via-[#EFF2EB] to-[#E5ECE5]'} flex-1 flex flex-col h-full text-slate-100 overflow-hidden select-none transition-colors duration-300`}>
      {/* Top Header: Step Indicator, Back Button & Close Button */}
      <div className="pt-4 pb-2 px-5 flex items-center justify-between z-20 shrink-0">
        <div className="w-14 flex items-center">
          {currentStep > 1 && currentStep < 8 ? (
            <button
              onClick={handlePrevStep}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition active:scale-95 text-emerald-300"
              title="Voltar pergunta anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Progress Dots / Bar */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === currentStep
                    ? 'w-6 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : s < currentStep
                    ? 'w-2.5 bg-emerald-600/80'
                    : 'w-2 bg-white/15'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-emerald-400/80 tracking-wider uppercase">
            Passo {currentStep} de 8
          </span>
        </div>

        <div className="w-24 flex items-center justify-end gap-1.5">
          {onOpenLogin && currentStep === 1 && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 px-2.5 py-1 rounded-full transition shrink-0"
              title="Acessar com conta existente"
            >
              Entrar
            </button>
          )}
          {currentStep === 7 && (
            <button
              onClick={() => setCurrentStep(8)}
              className="text-[11px] font-bold text-slate-400 hover:text-white underline transition"
            >
              Pular
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
              title="Fechar e voltar ao diário"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Raccoon Mascot & Speech Bubble Section */}
      <div className="px-5 pt-1 pb-3 flex items-center gap-3.5 z-20 shrink-0">
        <div className="relative shrink-0">{renderRaccoon()}</div>
        <div className="flex-1 relative bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 shadow-lg">
          {/* Speech bubble tail pointing left to raccoon */}
          <div className="absolute top-6 -left-2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white/15" />
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wide">
              {petName || 'FoodBud'}
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              {raccoonState.moodBadge}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-snug font-medium">
            {raccoonState.dialogue}
          </p>
        </div>
      </div>

      {/* Error Notice */}
      {stepError && (
        <div className="mx-5 mb-2 py-2 px-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>⚠️</span>
          <span>{stepError}</span>
        </div>
      )}

      {/* Main Dynamic Step Content */}
      <div className="flex-1 overflow-y-auto px-5 py-2 z-20 flex flex-col justify-start">
        {/* STEP 1: WELCOME & NAMES */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white">Bem-vindo ao NutriFam!</h2>
              <p className="text-xs text-slate-300">
                Seu assistente inteligente de nutrição e saúde baseado na ciência.
              </p>
            </div>

            <div className="space-y-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Como você se chama? <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    maxLength={30}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Nome do seu Guaxinim (Mascote)
                  </label>
                  <span className="text-[10px] text-slate-400">{petName.length}/14 letras</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                    <FoodBudMascot headOnly className="w-full h-full" mood="happy" petLevel={1} />
                  </div>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value.slice(0, 14))}
                    placeholder="Ex: FoodBud, Dexter, Bob..."
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    maxLength={14}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ele vai comemorar cada refeição registrada e subir de nível com você!
                </p>
              </div>
            </div>

            {/* Quick Login Option for Users with Existing Account */}
            {onOpenLogin && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Já possui uma conta?</p>
                    <p className="text-[11px] text-slate-300">Carregue seus dados, mascote e metas direto da nuvem.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                >
                  Fazer Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PRIMARY GOAL */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">Qual é seu objetivo principal?</h2>
              <p className="text-xs text-slate-300">Ajustaremos a proporção exata de calorias e macros.</p>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Lose weight */}
              <button
                type="button"
                onClick={() => setGoalType('Lose weight')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  goalType === 'Lose weight'
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xl shrink-0">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Perder Peso</h3>
                    {goalType === 'Lose weight' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-300">Queimar gordura corporal mantendo massa muscular.</p>
                </div>
              </button>

              {/* Option 2: Maintain weight */}
              <button
                type="button"
                onClick={() => setGoalType('Maintain weight')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  goalType === 'Maintain weight'
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 text-xl shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Manter o Peso</h3>
                    {goalType === 'Maintain weight' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-300">Equilíbrio calórico, energia e longevidade saudável.</p>
                </div>
              </button>

              {/* Option 3: Gain muscle */}
              <button
                type="button"
                onClick={() => setGoalType('Gain muscle')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  goalType === 'Gain muscle'
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xl shrink-0">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Ganhar Massa Muscular</h3>
                    {goalType === 'Gain muscle' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-300">Hipertrofia, ganho de força e superávit de proteínas.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BIOLOGICAL GENDER & AGE */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">Sexo Biológico & Idade</h2>
              <p className="text-xs text-slate-300">
                Necessários para o cálculo de taxa metabólica basal humana.
              </p>
            </div>

            {/* Gender Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Sexo Biológico <span className="text-emerald-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    gender === 'male'
                      ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-2xl">👨</span>
                  <span className="text-xs font-bold">Masculino</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    gender === 'female'
                      ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-2xl">👩</span>
                  <span className="text-xs font-bold">Feminino</span>
                </button>
              </div>
            </div>

            {/* Age Input */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Qual é a sua idade? <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ex: 28"
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  maxLength={3}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  anos
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                O metabolismo basal diminui cerca de 2% por década a partir dos 20 anos.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: REAL HEIGHT & CURRENT WEIGHT (ZERO FICTIONAL DATA) */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">Medidas Reais de Hoje</h2>
              <p className="text-xs text-slate-300">
                Insira seus dados reais para que seu plano seja 100% verdadeiro.
              </p>
            </div>

            <div className="space-y-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sua Altura <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Ex: 175"
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-12 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    maxLength={3}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    cm
                  </span>
                </div>
              </div>

              {/* Current Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Seu Peso Atual <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={currentWeightInput}
                    onChange={(e) => setCurrentWeightInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                    placeholder="Ex: 78.5"
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-12 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    maxLength={6}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    kg
                  </span>
                </div>
              </div>

              {/* Real-time BMI feedback card */}
              {liveBMI && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Seu IMC Atual
                    </span>
                    <span className="text-base font-black text-white">{liveBMI} kg/m²</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      getBMICategory(parseFloat(liveBMI)).color
                    }`}
                  >
                    {getBMICategory(parseFloat(liveBMI)).label}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: GOAL WEIGHT & PACE */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">Meta de Peso & Ritmo</h2>
              <p className="text-xs text-slate-300">
                Defina o peso que você busca e a velocidade da sua evolução.
              </p>
            </div>

            {goalType === 'Maintain weight' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
                <span className="text-3xl">⚖️</span>
                <h3 className="text-sm font-bold text-white">Manutenção dos {currentWeightKg} kg</h3>
                <p className="text-xs text-slate-300">
                  Seu plano calórico será ajustado para manter sua composição corporal e energia máxima!
                </p>
              </div>
            ) : (
              <div className="space-y-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Peso que deseja alcançar <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={goalWeightInput}
                      onChange={(e) => setGoalWeightInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                      placeholder={goalType === 'Lose weight' ? 'Ex: 70.0' : 'Ex: 82.0'}
                      className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-10 pr-12 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      maxLength={6}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      kg
                    </span>
                  </div>
                </div>

                {/* Pace Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Ritmo Semanal
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPace('gentle')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        pace === 'gentle'
                          ? 'bg-emerald-500/25 border-emerald-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <span className="text-sm block">🐢</span>
                      <span className="text-[11px] font-bold block">Suave</span>
                      <span className="text-[9px] text-slate-400 block">0.25 kg/sem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPace('standard')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        pace === 'standard'
                          ? 'bg-emerald-500/25 border-emerald-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <span className="text-sm block">🏃</span>
                      <span className="text-[11px] font-bold block">Moderado</span>
                      <span className="text-[9px] text-emerald-300 block">0.50 kg/sem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPace('fast')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        pace === 'fast'
                          ? 'bg-emerald-500/25 border-emerald-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <span className="text-sm block">⚡</span>
                      <span className="text-[11px] font-bold block">Rápido</span>
                      <span className="text-[9px] text-slate-400 block">0.75 kg/sem</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: ACTIVITY LEVEL */}
        {currentStep === 6 && (
          <div className="space-y-3">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">Nível de Atividade Física</h2>
              <p className="text-xs text-slate-300">
                Multiplicador FAO/OMS para calcular seu gasto calórico total diário (TDEE).
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'sedentary' as const,
                  icon: '🛋️',
                  title: 'Sedentário',
                  desc: 'Pouco movimento, trabalho sentado, sem exercícios regulares.'
                },
                {
                  id: 'light' as const,
                  icon: '🚶',
                  title: 'Levemente Ativo',
                  desc: 'Caminhadas leves ou exercícios leves 1 a 3 dias por semana.'
                },
                {
                  id: 'moderate' as const,
                  icon: '🏃',
                  title: 'Moderadamente Ativo',
                  desc: 'Exercícios moderados ou academia 3 a 5 dias por semana.'
                },
                {
                  id: 'high' as const,
                  icon: '⚡',
                  title: 'Muito Ativo',
                  desc: 'Treinos intensos ou esportes exigentes 6 a 7 dias por semana.'
                }
              ].map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActivityLevel(act.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center gap-3 ${
                    activityLevel === act.id
                      ? 'bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl shrink-0">{act.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white">{act.title}</h4>
                      {activityLevel === act.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{act.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: ACCOUNT CREATION / CLOUD SYNC */}
        {currentStep === 7 && (
          <div className="space-y-3.5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-black text-white">Salve seu Perfil na Nuvem</h2>
              <p className="text-xs text-slate-300">
                Sincronize suas metas para não perder seu progresso se trocar de aparelho.
              </p>
            </div>

            {authError && (
              <div className="py-2 px-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAuthLoading}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-3 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-3 active:scale-98 disabled:opacity-70"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            <div className="flex items-center gap-3 my-1 text-slate-400">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] uppercase font-bold">ou com e-mail</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email / Password form */}
            <form onSubmit={handleEmailRegister} className="space-y-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha (mínimo 6 dígitos)"
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 shadow-md"
              >
                {isAuthLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <span>Criar Conta e Salvar Metas</span>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Continuar como Convidado (Salvar apenas no aparelho)
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: THE SCIENTIFIC REVEAL & CELEBRATION */}
        {currentStep === 8 && calculatedPlan && (
          <div className="space-y-3.5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plano Nutricional Pronto</span>
              </div>
              <h2 className="text-lg font-black text-white">Suas Metas Diárias Científicas</h2>
            </div>

            {/* Daily Calorie Target Hero */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/40 rounded-3xl p-4 text-center shadow-xl space-y-1 relative overflow-hidden">
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-300">
                Meta Diária Recomendada
              </span>
              <div className="text-4xl font-black text-white tracking-tight">
                {calculatedPlan.targetCalories.toLocaleString('pt-BR')} <span className="text-lg text-emerald-400 font-bold">kcal</span>
              </div>
              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-300">
                <span>TMB: <b>{calculatedPlan.bmr} kcal</b></span>
                <span>•</span>
                <span>Gasto Total (TDEE): <b>{calculatedPlan.tdee} kcal</b></span>
              </div>
            </div>

            {/* Target Macros Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-blue-400 uppercase block">Proteínas</span>
                <span className="text-base font-black text-white block">
                  {calculatedPlan.targetMacros.proteinGrams}g
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {Math.round((calculatedPlan.targetMacros.proteinGrams * 4 / calculatedPlan.targetCalories) * 100)}% das kcal
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Carboidratos</span>
                <span className="text-base font-black text-white block">
                  {calculatedPlan.targetMacros.carbsGrams}g
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {Math.round((calculatedPlan.targetMacros.carbsGrams * 4 / calculatedPlan.targetCalories) * 100)}% das kcal
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-rose-400 uppercase block">Gorduras</span>
                <span className="text-base font-black text-white block">
                  {calculatedPlan.targetMacros.fatGrams}g
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {Math.round((calculatedPlan.targetMacros.fatGrams * 9 / calculatedPlan.targetCalories) * 100)}% das kcal
                </span>
              </div>
            </div>

            {/* Water and Fiber Indicators */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Água Diária</span>
                  <span className="text-xs font-black text-white">
                    {calculatedPlan.waterLiters} Litros / dia
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Fibras Mínimas</span>
                  <span className="text-xs font-black text-white">
                    {calculatedPlan.targetMacros.fiberGrams}g / dia
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation Action */}
      <div className={`p-5 pb-6 z-20 shrink-0 bg-gradient-to-t ${isDark ? 'from-[#101714] via-[#101714]/95' : 'from-[#E5ECE5] via-[#E5ECE5]/95'} to-transparent`}>
        {currentStep < 8 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="onboarding-primary-action w-full text-white font-black py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-98 text-sm"
          >
            <span>{currentStep === 7 ? 'Continuar para Resultados' : 'Próxima Pergunta'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="onboarding-primary-action w-full hover:brightness-105 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-98 text-sm tracking-wide"
          >
            <span>
              {isUserRedoing
                ? `Salvar e Atualizar Metas com ${petName || 'FoodBud'} 🚀`
                : `Começar Minha Jornada com ${petName || 'FoodBud'} 🚀`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
