import React, { useState, useEffect, useRef } from 'react';
import { MobileFrame } from './components/layout/MobileFrame';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { CalorieRingCard } from './components/journal/CalorieRingCard';
import { DateNavigator } from './components/journal/DateNavigator';
import { MealSectionCard } from './components/journal/MealSectionCard';
import { FastingCard } from './components/journal/FastingCard';
import { ActivitiesCard } from './components/journal/ActivitiesCard';
import { WaterChallengeCard } from './components/journal/WaterChallengeCard';
import { NotesCard, CustomizeDiaryButton } from './components/journal/NotesCard';
import { AddFoodModal } from './components/food/AddFoodModal';
import { MealReviewModal } from './components/food/MealReviewModal';
import { FastingDetailModal } from './components/fasting/FastingDetailModal';
import { ProfileHeader } from './components/profile/ProfileHeader';
import { WeightTab } from './components/profile/WeightTab';
import { NutritionTab } from './components/profile/NutritionTab';
import { AddWeightModal } from './components/profile/AddWeightModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { CoachView } from './components/coach/CoachView';
import { calculateUnclaimedQuests } from './components/quests/QuestsView';
import { FoodBudView } from './components/pet/FoodBudView';
import { WorkoutsView } from './components/workout/WorkoutsView';
import { CompletedWorkout } from './types/workout';
import { SettingsModal } from './components/modals/SettingsModal';
import { ScientificAssessmentModal } from './components/modals/ScientificAssessmentModal';
import { AuthModal } from './components/auth/AuthModal';
import { TwoFactorModal } from './components/auth/TwoFactorModal';
import { clearLegacyMfaData, getMfaStatus, verifyTotp } from './services/mfaService';
import { SplashScreen } from './components/splash/SplashScreen';
import { OnboardingSurvey } from './components/onboarding/OnboardingSurvey';
import { NativeHealthNoticeModal } from './components/health/NativeHealthNoticeModal';
import { syncHealthData, isCapacitorNative } from './services/healthSyncService';
import { setupAndroidBackButton } from './services/nativeService';
import { getLocalAuthUser, setLocalAuthUser, logoutAccount, AuthUser } from './services/authService';
import { calculateFastingWindow } from './services/fastingScheduler';
import { syncDayLogMealTargets } from './services/nutritionCalculator';
import { syncExercisesFromSupabase } from './services/exerciseDatabase';
import { initializeLocalFoodCatalog } from './services/localFoodCatalog';

import {
  UserProfile,
  ActiveTab,
  MealType,
  FoodItem,
  ProfileSubTab,
  ActivityEntry,
  WaterLog,
  FastingSession,
  WeightEntry,
  AddFoodSubTab
} from './types';

import {
  getStoredProfile,
  saveStoredProfile,
  getStoredWeightEntries,
  saveStoredWeightEntries,
  getStoredDayLogs,
  saveStoredDayLogs,
  getStoredCustomFoods,
  saveStoredCustomFoods,
  DEFAULT_PROFILE,
  migrateLegacyAccountCache,
  getTodayDateString,
  createEmptyDayLog
} from './services/storage';

import {
  isSupabaseConfigured,
  getSupabase,
  loadProfileFromSupabase,
  loadDayLogsFromSupabase,
  loadWeightEntriesFromSupabase,
  loadCustomFoodsFromSupabase
} from './services/supabaseClient';
import { queueChange, flushPendingChanges, getPendingChanges, getSyncConflicts, getSyncConflictCount, hasPendingChange } from './services/offlineSync';

const CLOUD_PROFILE_FIELDS: (keyof UserProfile)[] = [
  'name', 'avatarText', 'avatarUrl', 'goalType', 'heightCm', 'startWeightKg',
  'currentWeightKg', 'goalWeightKg', 'dailyCaloriesTarget', 'targetMacros',
  'gems', 'burnedCalories', 'appleHealthSynced', 'gender', 'age', 'activityLevel',
  'weeklyPaceKg', 'petLevel', 'petXp', 'petMood', 'petName', 'inventory',
  'equippedCap', 'equippedGlasses', 'equippedClothes', 'showSplashAnimation',
  'isOnboardingCompleted'
];

type AccountSnapshot = {
  profile: string | null;
  logs: Record<string, string>;
  weights: Record<string, string>;
  foods: Record<string, string>;
};

const emptyAccountSnapshot = (): AccountSnapshot => ({ profile: null, logs: {}, weights: {}, foods: {} });

function readCloudSnapshot(userId: string): AccountSnapshot {
  try {
    return { ...emptyAccountSnapshot(), ...JSON.parse(localStorage.getItem(`nutrifam_cloud_snapshot_${userId}`) || '{}') };
  } catch { return emptyAccountSnapshot(); }
}

function writeCloudSnapshot(userId: string, snapshot: AccountSnapshot): void {
  localStorage.setItem(`nutrifam_cloud_snapshot_${userId}`, JSON.stringify(snapshot));
}

export const App: React.FC = () => {
  // Global State
  const [profile, setProfile] = useState(() => { clearLegacyMfaData(); return { ...DEFAULT_PROFILE }; });
  const [dayLogs, setDayLogs] = useState<Record<string, ReturnType<typeof createEmptyDayLog>>>({});
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [syncConflictCount, setSyncConflictCount] = useState(0);
  const authEpochRef = useRef(0);
  const baselineRef = useRef<{ profile: string; logs: Record<string, string>; weights: Record<string, string>; foods: Record<string, string> } | null>(null);
  const cloudBaselineRef = useRef<AccountSnapshot>(emptyAccountSnapshot());

  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const [activeTab, setActiveTab] = useState<ActiveTab>('journal');
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('weight');

  // Detect shared workout link on mount
  useEffect(() => {
    initializeLocalFoodCatalog().catch((error) => {
      console.error('Não foi possível inicializar o catálogo local de alimentos:', error);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('shared_workout')) {
        setActiveTab('workouts');
      }
    }
  }, []);

  // Modals & Subviews
  const [activeMealForAdd, setActiveMealForAdd] = useState<MealType | null>(null);
  const [addFoodInitialSubTab, setAddFoodInitialSubTab] = useState<AddFoodSubTab>('search');
  const [activeMealForReview, setActiveMealForReview] = useState<MealType | null>(null);
  const [isFastingDetailOpen, setIsFastingDetailOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScientificAssessmentOpen, setIsScientificAssessmentOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showSplash, setShowSplash] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [mfaGateUser, setMfaGateUser] = useState<AuthUser | null>(null);
  const [mfaChecking, setMfaChecking] = useState(() => isSupabaseConfigured());
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);
  const [unavailableData, setUnavailableData] = useState<string[]>([]);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);
  const [healthSyncToast, setHealthSyncToast] = useState<string | null>(null);
  const [isOnboardingSurveyOpen, setIsOnboardingSurveyOpen] = useState(false);
  const [isNativeHealthNoticeOpen, setIsNativeHealthNoticeOpen] = useState(false);

  const cloudProfileOwnerRef = useRef<string | null>(null);

  const rememberBaseline = (nextProfile: UserProfile, logs: typeof dayLogs, weights: WeightEntry[], foods: FoodItem[]) => {
    baselineRef.current = {
      profile: JSON.stringify(nextProfile),
      logs: Object.fromEntries(Object.entries(logs).map(([date, log]) => [date, JSON.stringify(log)])),
      weights: Object.fromEntries(weights.map((entry) => [entry.id, JSON.stringify(entry)])),
      foods: Object.fromEntries(foods.map((food) => [food.id, JSON.stringify(food)]))
    };
  };

  const rememberCloudBaseline = (userId: string, nextProfile: UserProfile, logs: typeof dayLogs, weights: WeightEntry[], foods: FoodItem[]) => {
    const snapshot: AccountSnapshot = {
      profile: JSON.stringify(nextProfile),
      logs: Object.fromEntries(Object.entries(logs).map(([date, log]) => [date, JSON.stringify(log)])),
      weights: Object.fromEntries(weights.map((entry) => [entry.id, JSON.stringify(entry)])),
      foods: Object.fromEntries(foods.map((food) => [food.id, JSON.stringify(food)]))
    };
    cloudBaselineRef.current = snapshot;
    writeCloudSnapshot(userId, snapshot);
  };

  const handleAuthSuccess = async (authUser: AuthUser) => {
    const epoch = ++authEpochRef.current;
    setAuthLoadError(null);
    let mfaEnabled = false;
    if (!isSupabaseConfigured()) return;
    if (navigator.onLine) {
      const client = getSupabase();
      const { data, error } = await client!.auth.getUser();
      if (error || data.user?.id !== authUser.id) {
        setAuthLoadError('Esta sessão não foi confirmada pelo Supabase. Entre novamente na conta correta.');
        setMfaChecking(false);
        return;
      }
      try {
        const status = await getMfaStatus();
        mfaEnabled = Boolean(status.factorId);
        if (status.required) {
          setMfaGateUser(authUser);
          setMfaFactorId(status.factorId || null);
          setMfaChecking(false);
          return;
        }
      } catch {
        setAuthLoadError('Não foi possível verificar a A2F. Tente novamente com conexão ativa.');
        setMfaChecking(false);
        return;
      }
    }
    else if (localStorage.getItem('nutrifam_verified_account_id') !== authUser.id) return;
    if (epoch !== authEpochRef.current) return;
    migrateLegacyAccountCache(authUser.id);
    cloudBaselineRef.current = readCloudSnapshot(authUser.id);
    setLocalAuthUser(authUser);
    if (navigator.onLine) localStorage.setItem('nutrifam_verified_account_id', authUser.id);
    setIsAuthModalOpen(false);
    const cached = getStoredProfile(authUser.id);
    const cachedProfile: UserProfile = {
      ...cached, id: authUser.id, email: authUser.email,
      name: cached.name !== 'Meu Perfil' ? cached.name : (authUser.name || cached.name),
      isTwoFactorEnabled: mfaEnabled
    };
    const cachedLogs = getStoredDayLogs(authUser.id);
    const cachedWeights = getStoredWeightEntries(authUser.id);
    const cachedFoods = getStoredCustomFoods(authUser.id);
    if (!navigator.onLine) {
      rememberBaseline(cachedProfile, cachedLogs, cachedWeights, cachedFoods);
      cloudProfileOwnerRef.current = authUser.id;
      setProfile(cachedProfile);
      setDayLogs(cachedLogs);
      setWeightEntries(cachedWeights);
      setCustomFoods(cachedFoods);
      setActiveUserId(authUser.id);
      setSyncConflictCount(getSyncConflictCount(authUser.id));
      setMfaChecking(false);
      return;
    }
    setMfaChecking(true);
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase indisponível.');
      // The signup trigger runs only when auth.users is created. A manually
      // deleted profile must be recreated from server defaults, never cache.
      const { data: profileRow, error: lookupError } = await client.from('profiles')
        .select('id').eq('id', authUser.id).maybeSingle();
      if (lookupError) throw new Error(`Consulta do perfil (${lookupError.code || 'sem código'}): ${lookupError.message}`);
      if (!profileRow) {
        const { error: createError } = await client.from('profiles').insert({
          id: authUser.id,
          name: authUser.name || 'Meu Perfil',
          email: authUser.email,
          avatar_text: (authUser.name?.[0] || 'M').toUpperCase()
        });
        if (createError) {
          // 23505 can refer to the email constraint, not necessarily an already
          // created row for this user. Never treat it as a successful insert.
          throw new Error(`Criação do perfil (${createError.code || 'sem código'}): ${createError.message}`);
        }
      }
      await flushPendingChanges(authUser.id);
      const [remoteProfile, remoteLogs, remoteWeights, remoteFoods] = await Promise.all([
        loadProfileFromSupabase(authUser.id), loadDayLogsFromSupabase(authUser.id),
        loadWeightEntriesFromSupabase(authUser.id), loadCustomFoodsFromSupabase(authUser.id)
      ]);
      if (epoch !== authEpochRef.current) return;
      if (!remoteProfile) {
        const { data: visibleProfile, error: profileError } = await client.from('profiles')
          .select('id').eq('id', authUser.id).maybeSingle();
        if (profileError) throw new Error(`Falha ao ler o perfil (${profileError.code || 'sem código'}): ${profileError.message}`);
        if (!visibleProfile) throw new Error('O login foi aceito, mas o perfil desta conta não está visível no Supabase. Verifique a política de acesso do perfil e a A2F.');
        throw new Error('O perfil existe no Supabase, mas seus dados não puderam ser interpretados pelo app.');
      }
      const unavailable = [
        remoteLogs === null && 'diário',
        remoteWeights === null && 'pesagens',
        remoteFoods === null && 'alimentos personalizados'
      ].filter((value): value is string => Boolean(value));
      const nextProfile: UserProfile = {
        ...DEFAULT_PROFILE, ...remoteProfile, id: authUser.id,
        email: authUser.email, isTwoFactorEnabled: mfaEnabled
      };
      // A falha de uma tabela secundária não invalida a autenticação. O cache
      // pertence a este UUID; nunca o consideramos uma cópia confirmada do servidor.
      const nextLogs = remoteLogs ?? cachedLogs;
      const nextWeights = remoteWeights ?? cachedWeights;
      const nextFoods = remoteFoods ?? cachedFoods;
      rememberBaseline(nextProfile, nextLogs, nextWeights, nextFoods);
      const previousCloud = cloudBaselineRef.current;
      rememberCloudBaseline(authUser.id, nextProfile, nextLogs, nextWeights, nextFoods);
      if (unavailable.length) {
        cloudBaselineRef.current = {
          ...cloudBaselineRef.current,
          logs: remoteLogs === null ? previousCloud.logs : cloudBaselineRef.current.logs,
          weights: remoteWeights === null ? previousCloud.weights : cloudBaselineRef.current.weights,
          foods: remoteFoods === null ? previousCloud.foods : cloudBaselineRef.current.foods
        };
        writeCloudSnapshot(authUser.id, cloudBaselineRef.current);
      }
      setUnavailableData(unavailable);
      setProfile(nextProfile);
      setDayLogs(nextLogs);
      setWeightEntries([...nextWeights]);
      setCustomFoods([...nextFoods]);
      cloudProfileOwnerRef.current = authUser.id;
      setActiveUserId(authUser.id);
      setSyncConflictCount(getSyncConflictCount(authUser.id));
      setMfaChecking(false);
      if (nextProfile.isOnboardingCompleted) setIsOnboardingSurveyOpen(false);
    } catch (error) {
      console.warn('Não foi possível confirmar os dados no Supabase:', error);
      if (epoch === authEpochRef.current) {
        setAuthLoadError(error instanceof Error ? error.message :
          error && typeof error === 'object' && 'message' in error ? String(error.message) :
          'Não foi possível carregar o perfil da conta. Verifique a conexão e tente novamente.');
        setMfaChecking(false);
      }
    }
  };

  const checkMfaBeforeProfile = async (authUser: AuthUser) => {
    setMfaGateUser(null);
    setMfaError(null);
    try {
      const status = await getMfaStatus();
      if (status.required) {
        setMfaFactorId(status.factorId || null);
        setMfaGateUser(authUser);
        setMfaChecking(false);
        return;
      }
      setMfaGateUser(null);
      setMfaFactorId(null);
      await handleAuthSuccess(authUser);
    } catch (error) {
      setAuthLoadError(error instanceof Error ? error.message : 'Não foi possível verificar a A2F.');
    } finally {
      setMfaChecking(false);
    }
  };

  const handleLogout = async () => {
    ++authEpochRef.current;
    setActiveUserId(null);
    setSyncConflictCount(0);
    setUnavailableData([]);
    baselineRef.current = null;
    cloudBaselineRef.current = emptyAccountSnapshot();
    cloudProfileOwnerRef.current = null;
    setProfile({ ...DEFAULT_PROFILE });
    setDayLogs({});
    setWeightEntries([]);
    setCustomFoods([]);
    setActiveTab('journal');
    setIsSettingsOpen(false);
    setIsEditProfileOpen(false);
    setMfaGateUser(null);
    setAuthLoadError(null);
    localStorage.removeItem('nutrifam_verified_account_id');
    await logoutAccount();
  };

  // Check Supabase session, Google/Apple OAuth return callback & local auth session on mount
  useEffect(() => {
    // Detect URL error parameters from Supabase redirect (e.g. invalid redirect_uri or expired link)
    const urlHash = window.location.hash;
    const urlSearch = window.location.search;
    if (urlHash.includes('error_description=') || urlSearch.includes('error_description=')) {
      const rawParams = urlHash.includes('error_description=')
        ? urlHash.replace(/^#/, '')
        : urlSearch.replace(/^\?/, '');
      const params = new URLSearchParams(rawParams);
      const desc = params.get('error_description');
      if (desc) {
        setHealthSyncToast(`Supabase: ${decodeURIComponent(desc.replace(/\+/g, ' '))}`);
        setTimeout(() => setHealthSyncToast(null), 8000);
      }
    }

    // 1. Supabase OAuth & Session listener
    if (isSupabaseConfigured()) {
      const client = getSupabase();
      if (client) {

        const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            const u = session.user;
            const authUser: AuthUser = {
              id: u.id,
              email: u.email || '',
              name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário',
              createdAt: u.created_at,
              provider: (u.app_metadata?.provider as any) || 'email',
              isEmailVerified: Boolean(u.email_confirmed_at)
            };
            setTimeout(() => {
              if (!navigator.onLine && localStorage.getItem('nutrifam_verified_account_id') === authUser.id) {
                void handleAuthSuccess(authUser);
              } else {
                void checkMfaBeforeProfile(authUser);
              }
            }, 0);

            if (window.location.hash && window.location.hash.includes('access_token')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else if (event === 'SIGNED_OUT') {
            setLocalAuthUser(null);
            localStorage.removeItem('nutrifam_verified_account_id');
            setMfaGateUser(null);
            setMfaChecking(false);
            ++authEpochRef.current;
            setActiveUserId(null);
            setSyncConflictCount(0);
            setUnavailableData([]);
            baselineRef.current = null;
            cloudBaselineRef.current = emptyAccountSnapshot();
            setProfile({ ...DEFAULT_PROFILE });
            setDayLogs({});
            setWeightEntries([]);
            setCustomFoods([]);
          } else if (event === 'INITIAL_SESSION' && !session) {
            const cachedUser = getLocalAuthUser();
            if (!navigator.onLine && cachedUser && localStorage.getItem('nutrifam_verified_account_id') === cachedUser.id) {
              void handleAuthSuccess(cachedUser);
            } else {
              setMfaChecking(false);
            }
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      }
    }

    setMfaChecking(false);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured()) void syncExercisesFromSupabase();
  }, []);

  // Sync to localStorage and Supabase
  useEffect(() => {
    if (!activeUserId || profile.id !== activeUserId || !baselineRef.current) return;
    saveStoredProfile(profile);
    const serialized = JSON.stringify(profile);
    if (baselineRef.current.profile !== serialized) {
      const previous = JSON.parse(baselineRef.current.profile) as UserProfile;
      const cloudBase = cloudBaselineRef.current.profile
        ? JSON.parse(cloudBaselineRef.current.profile) as UserProfile
        : null;
      const values: Partial<UserProfile> = {};
      const base: Partial<UserProfile> = {};
      for (const field of CLOUD_PROFILE_FIELDS) {
        if (JSON.stringify(previous[field]) !== JSON.stringify(profile[field])) {
          Object.assign(values, { [field]: profile[field] });
          Object.assign(base, { [field]: cloudBase?.[field] });
        }
      }
      baselineRef.current.profile = serialized;
      if (Object.keys(values).length) {
        queueChange(activeUserId, { kind: 'profilePatch', values, base });
        void flushPendingChanges(activeUserId);
      }
    }
  }, [profile, activeUserId]);

  // When returning to the app/tab, pull remote changes to stay synced across devices
  useEffect(() => {
    if (!activeUserId || !isSupabaseConfigured()) return;

    let cancelled = false;
    const refreshProfileFromCloud = async () => {
      if (document.visibilityState === 'hidden') return;
      await flushPendingChanges(activeUserId);
      const [remoteProfile, remoteLogs, remoteWeights, remoteFoods] = await Promise.all([
        loadProfileFromSupabase(activeUserId), loadDayLogsFromSupabase(activeUserId),
        loadWeightEntriesFromSupabase(activeUserId), loadCustomFoodsFromSupabase(activeUserId)
      ]);
      if (cancelled) return;
      setUnavailableData([
        remoteLogs === null && 'diário',
        remoteWeights === null && 'pesagens',
        remoteFoods === null && 'alimentos personalizados'
      ].filter((value): value is string => Boolean(value)));
      const snapshot: AccountSnapshot = {
        profile: remoteProfile ? JSON.stringify(remoteProfile) : cloudBaselineRef.current.profile,
        logs: remoteLogs === null ? cloudBaselineRef.current.logs : Object.fromEntries(Object.entries(remoteLogs).map(([date, log]) => [date, JSON.stringify(log)])),
        weights: remoteWeights === null ? cloudBaselineRef.current.weights : Object.fromEntries(remoteWeights.map((entry) => [entry.id, JSON.stringify(entry)])),
        foods: remoteFoods === null ? cloudBaselineRef.current.foods : Object.fromEntries(remoteFoods.map((food) => [food.id, JSON.stringify(food)]))
      };
      cloudBaselineRef.current = snapshot;
      writeCloudSnapshot(activeUserId, snapshot);
      if (remoteProfile && !hasPendingChange(activeUserId, 'profile')) {
        setProfile((prev) => {
          const refreshedProfile = {
            ...prev,
            ...remoteProfile,
            // The cloud value is authoritative, including an intentional removal.
            avatarUrl: remoteProfile.avatarUrl
          };
          if (baselineRef.current) baselineRef.current.profile = JSON.stringify(refreshedProfile);
          saveStoredProfile(refreshedProfile);
          return refreshedProfile;
        });
      }
      if (remoteLogs !== null) {
        setDayLogs((prev) => {
          const next = { ...prev };
          for (const [date, log] of Object.entries(remoteLogs)) {
            if (!hasPendingChange(activeUserId, `dayLog:${date}`)) next[date] = log;
          }
          if (baselineRef.current) baselineRef.current.logs = Object.fromEntries(
            Object.entries(next).map(([date, log]) => [date, JSON.stringify(log)]));
          return next;
        });
      }
      if (remoteWeights !== null && !getPendingChanges(activeUserId).some((change) => change.kind === 'weight')) {
        if (baselineRef.current) baselineRef.current.weights = Object.fromEntries(remoteWeights.map((entry) => [entry.id, JSON.stringify(entry)]));
        setWeightEntries(remoteWeights);
      }
      if (remoteFoods !== null && !getPendingChanges(activeUserId).some((change) => change.kind === 'food')) {
        if (baselineRef.current) baselineRef.current.foods = Object.fromEntries(remoteFoods.map((food) => [food.id, JSON.stringify(food)]));
        setCustomFoods(remoteFoods);
      }
    };

    const refreshAfterSync = (event: Event) => {
      if ((event as CustomEvent<{ userId: string }>).detail?.userId === activeUserId) {
        setSyncConflictCount(getSyncConflictCount(activeUserId));
        void refreshProfileFromCloud();
      }
    };
    window.addEventListener('focus', refreshProfileFromCloud);
    window.addEventListener('nutrifam:sync-complete', refreshAfterSync);
    document.addEventListener('visibilitychange', refreshProfileFromCloud);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', refreshProfileFromCloud);
      window.removeEventListener('nutrifam:sync-complete', refreshAfterSync);
      document.removeEventListener('visibilitychange', refreshProfileFromCloud);
    };
  }, [activeUserId]);

  useEffect(() => {
    if (!activeUserId || !baselineRef.current) return;
    saveStoredDayLogs(dayLogs, activeUserId);
    for (const [date, log] of Object.entries(dayLogs)) {
      const serialized = JSON.stringify(log);
      if (baselineRef.current.logs[date] !== serialized) {
        const base = cloudBaselineRef.current.logs[date] ? JSON.parse(cloudBaselineRef.current.logs[date]) : null;
        baselineRef.current.logs[date] = serialized;
        queueChange(activeUserId, { kind: 'dayLog', value: log, base });
      }
    }
    void flushPendingChanges(activeUserId);
  }, [dayLogs, activeUserId]);

  useEffect(() => {
    if (!activeUserId || !baselineRef.current) return;
    saveStoredWeightEntries(weightEntries, activeUserId);
    for (const entry of weightEntries) {
      const serialized = JSON.stringify(entry);
      if (baselineRef.current.weights[entry.id] !== serialized) {
        const base = cloudBaselineRef.current.weights[entry.id] ? JSON.parse(cloudBaselineRef.current.weights[entry.id]) : null;
        baselineRef.current.weights[entry.id] = serialized;
        queueChange(activeUserId, { kind: 'weight', value: entry, base });
      }
    }
    void flushPendingChanges(activeUserId);
  }, [weightEntries, activeUserId]);

  useEffect(() => {
    if (!activeUserId || !baselineRef.current) return;
    saveStoredCustomFoods(customFoods, activeUserId);
    for (const food of customFoods) {
      const serialized = JSON.stringify(food);
      if (baselineRef.current.foods[food.id] !== serialized) {
        const base = cloudBaselineRef.current.foods[food.id] ? JSON.parse(cloudBaselineRef.current.foods[food.id]) : null;
        baselineRef.current.foods[food.id] = serialized;
        queueChange(activeUserId, { kind: 'food', value: food, base });
      }
    }
    void flushPendingChanges(activeUserId);
  }, [customFoods, activeUserId]);

  useEffect(() => {
    if (!activeUserId) return;
    const retry = () => { void flushPendingChanges(activeUserId); };
    window.addEventListener('online', retry);
    window.addEventListener('focus', retry);
    const interval = window.setInterval(retry, 30000);
    return () => {
      window.removeEventListener('online', retry);
      window.removeEventListener('focus', retry);
      window.clearInterval(interval);
    };
  }, [activeUserId]);

  // User dynamic water target based on current weight (35ml/kg + 500ml activity reserve)
  const userWaterTarget = Number(((profile.currentWeightKg * 35 + 500) / 1000).toFixed(1)) || 2.0;

  // Current Day Log
  const currentDayLog = dayLogs[selectedDate] || createEmptyDayLog(selectedDate, profile.dailyCaloriesTarget, userWaterTarget);

  const updateCurrentDayLog = (updated: Partial<typeof currentDayLog>) => {
    const updatedLog = {
      ...currentDayLog,
      ...updated
    };

    setDayLogs((prev) => ({
      ...prev,
      [selectedDate]: updatedLog
    }));

  };

  // Reset / Zero out the current day's log (meals, water, and activities)
  const handleResetDayLog = () => {
    const freshLog = createEmptyDayLog(selectedDate, profile.dailyCaloriesTarget, userWaterTarget);
    setDayLogs((prev) => ({
      ...prev,
      [selectedDate]: freshLog
    }));

    saveStoredDayLogs({
      ...dayLogs,
      [selectedDate]: freshLog
    }, profile.id);


    if (selectedDate === getTodayDateString()) {
      setProfile((prev) => ({
        ...prev,
        burnedCalories: 0
      }));
    }
  };

  // Real-Time Day Rollover & Auto-Reset Monitor
  // Automatically detects when a new day arrives (at midnight, when user unlocks phone, or resumes browser tab)
  useEffect(() => {
    let lastKnownToday = getTodayDateString();

    const checkDayChange = () => {
      const actualToday = getTodayDateString();
      if (actualToday !== lastKnownToday) {
        const previousDay = lastKnownToday;
        lastKnownToday = actualToday;

        // If the user was viewing the previous day (or past day), advance automatically to the new today
        setSelectedDate((currentSelected) => {
          if (currentSelected === previousDay || currentSelected < actualToday) {
            return actualToday;
          }
          return currentSelected;
        });

        // Ensure the new day starts cleanly with 0 calories and 0 water consumed
        setDayLogs((prev) => {
          if (!prev[actualToday]) {
            return {
              ...prev,
              [actualToday]: createEmptyDayLog(actualToday, profile.dailyCaloriesTarget, userWaterTarget)
            };
          }
          return prev;
        });

        // Reset daily burned calories on profile for the new day
        setProfile((prev) => ({
          ...prev,
          burnedCalories: 0
        }));
      }
    };

    // Check periodically every 10 seconds
    const interval = setInterval(checkDayChange, 10000);

    // Check on tab visibility change and window focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDayChange();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkDayChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkDayChange);
    };
  }, [profile.dailyCaloriesTarget, profile.currentWeightKg, userWaterTarget, profile.id]);

  // Automatic Scheduled Fasting Clock Manager - ONLY runs for the actual current day!
  useEffect(() => {
    const checkFastingSchedule = () => {
      const today = getTodayDateString();
      if (selectedDate !== today) {
        return;
      }

      const fasting = currentDayLog.fasting;
      if (!fasting.autoStartEnabled || fasting.isManuallyPaused || fasting.isManuallyStopped) {
        return;
      }

      const startTime = fasting.scheduledStartTime || '20:00';
      const endTime = fasting.scheduledEndTime || '12:00';
      const windowCalc = calculateFastingWindow(
        startTime,
        endTime,
        new Date(),
        fasting.isActive,
        fasting.elapsedSeconds,
        fasting.isManuallyPaused,
        fasting.isManuallyStopped
      );

      if (windowCalc.inWindow && !fasting.isActive) {
        updateCurrentDayLog({
          fasting: {
            ...fasting,
            isActive: true,
            elapsedSeconds: windowCalc.elapsedSeconds,
            stage: windowCalc.stage
          }
        });
      }
    };

    checkFastingSchedule();
    const timer = setInterval(checkFastingSchedule, 15000);
    return () => clearInterval(timer);
  }, [
    currentDayLog.fasting.autoStartEnabled,
    currentDayLog.fasting.scheduledStartTime,
    currentDayLog.fasting.scheduledEndTime,
    currentDayLog.fasting.isActive,
    currentDayLog.fasting.isManuallyPaused,
    currentDayLog.fasting.isManuallyStopped,
    selectedDate
  ]);

  // Guard against non-today dates having active fasting sessions in state
  useEffect(() => {
    const today = getTodayDateString();
    if (selectedDate < today && currentDayLog.fasting.isActive) {
      updateCurrentDayLog({
        fasting: {
          ...currentDayLog.fasting,
          isActive: false,
          stage: currentDayLog.fasting.elapsedSeconds > 0 ? 'Jejum Concluído' : 'Inativo'
        }
      });
    } else if (selectedDate > today && (currentDayLog.fasting.isActive || currentDayLog.fasting.elapsedSeconds > 0)) {
      updateCurrentDayLog({
        fasting: {
          ...currentDayLog.fasting,
          isActive: false,
          elapsedSeconds: 0,
          stage: 'Não Iniciado'
        }
      });
    }
  }, [selectedDate]);

  // Food handlers
  const handleAddFoodToMeal = (mealType: MealType, food: FoodItem) => {
    const meal = currentDayLog.meals[mealType];
    const newLoggedItem = {
      ...food,
      loggedId: 'logged_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      servingsCount: 1,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMeal = {
      ...meal,
      items: [newLoggedItem, ...meal.items]
    };

    updateCurrentDayLog({
      meals: {
        ...currentDayLog.meals,
        [mealType]: updatedMeal
      }
    });

    setProfile((prev) => ({ ...prev, gems: prev.gems + 10 }));
  };

  const handleAddMultipleFoodsToMeal = (mealType: MealType, foods: FoodItem[]) => {
    const meal = currentDayLog.meals[mealType];
    const newItems = foods.map((f, idx) => ({
      ...f,
      loggedId: 'logged_' + Date.now() + '_' + idx,
      servingsCount: 1,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    updateCurrentDayLog({
      meals: {
        ...currentDayLog.meals,
        [mealType]: {
          ...meal,
          items: [...newItems, ...meal.items]
        }
      }
    });

    setProfile((prev) => ({ ...prev, gems: prev.gems + 15 * foods.length }));
  };

  const handleRemoveItem = (mealType: MealType, loggedId: string) => {
    const meal = currentDayLog.meals[mealType];
    updateCurrentDayLog({
      meals: {
        ...currentDayLog.meals,
        [mealType]: {
          ...meal,
          items: meal.items.filter((i) => i.loggedId !== loggedId)
        }
      }
    });
  };

  // Water handler
  const handleUpdateWater = (updatedWater: WaterLog) => {
    updateCurrentDayLog({ water: updatedWater });
  };

  // Fasting handler
  const handleUpdateFasting = (updatedFasting: Partial<FastingSession>) => {
    // If attempting to activate fasting on a past or future date, block activation
    const today = getTodayDateString();
    if (selectedDate !== today && updatedFasting.isActive) {
      return;
    }
    updateCurrentDayLog({
      fasting: {
        ...currentDayLog.fasting,
        ...updatedFasting
      }
    });
  };

  // Activities handler
  const workoutActivityId = (workoutId: string) => `workout:${workoutId}`;

  const handleWorkoutFinished = (workout: CompletedWorkout) => {
    const date = workout.date;
    const id = workoutActivityId(workout.id);
    const existingLog = dayLogs[date] || createEmptyDayLog(date, profile.dailyCaloriesTarget, userWaterTarget);
    if (existingLog.activities.some((activity) => activity.id === id)) return;
    const activity: ActivityEntry = {
      id,
      title: `🏋️ ${workout.title}`,
      durationMinutes: workout.durationMinutes,
      caloriesBurned: workout.caloriesBurned,
      timestamp: workout.endTime
    };
    const activities = [...existingLog.activities, activity];
    setDayLogs((prev) => {
      const log = prev[date] || createEmptyDayLog(date, profile.dailyCaloriesTarget, userWaterTarget);
      if (log.activities.some((item) => item.id === id)) return prev;
      return { ...prev, [date]: { ...log, activities: [...log.activities, activity] } };
    });
    if (date === getTodayDateString()) {
      setProfile((prev) => ({ ...prev, burnedCalories: activities.reduce((sum, item) => sum + item.caloriesBurned, 0) }));
    }
  };

  const exportSyncConflicts = () => {
    if (!activeUserId) return;
    const data = JSON.stringify(getSyncConflicts(activeUserId), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrifam-conflitos-${activeUserId}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleWorkoutDeleted = (workout: CompletedWorkout) => {
    const log = dayLogs[workout.date];
    if (!log) return;
    const activities = log.activities.filter((activity) => activity.id !== workoutActivityId(workout.id));
    if (activities.length === log.activities.length) return;
    setDayLogs((prev) => {
      const current = prev[workout.date];
      if (!current) return prev;
      return { ...prev, [workout.date]: { ...current, activities: current.activities.filter((activity) => activity.id !== workoutActivityId(workout.id)) } };
    });
    if (workout.date === getTodayDateString()) {
      setProfile((prev) => ({ ...prev, burnedCalories: activities.reduce((sum, item) => sum + item.caloriesBurned, 0) }));
    }
  };

  const handleAddActivity = (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    const newActivity: ActivityEntry = {
      ...entry,
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    const updatedActivities = [...currentDayLog.activities, newActivity];
    updateCurrentDayLog({
      activities: updatedActivities
    });
    const totalBurned = updatedActivities.reduce((acc, a) => acc + a.caloriesBurned, 0);
    setProfile((prev) => ({
      ...prev,
      gems: prev.gems + 20,
      burnedCalories: totalBurned
    }));
  };

  const handleRemoveActivity = (id: string) => {
    const updatedActivities = currentDayLog.activities.filter((a) => a.id !== id);
    updateCurrentDayLog({
      activities: updatedActivities
    });
    const totalBurned = updatedActivities.reduce((acc, a) => acc + a.caloriesBurned, 0);
    setProfile((prev) => ({
      ...prev,
      burnedCalories: totalBurned
    }));
  };

  // Quests claim handler (persisted per dayLog so rewards are gained only once per day)
  const handleClaimQuest = (questId: string, rewardGems: number, rewardPetXp: number) => {
    const currentClaimed = currentDayLog.claimedQuestIds || [];
    if (currentClaimed.includes(questId)) return;

    const updatedClaimed = [...currentClaimed, questId];
    updateCurrentDayLog({ claimedQuestIds: updatedClaimed });

    setProfile((prev) => {
      const currentXp = prev.petXp ?? 0;
      const currentLvl = prev.petLevel || 1;
      let nextXp = currentXp + rewardPetXp;
      let nextLvl = currentLvl;
      while (nextXp >= 100 && nextLvl < 4) {
        nextLvl += 1;
        nextXp -= 100;
      }
      return {
        ...prev,
        gems: prev.gems + rewardGems,
        petXp: nextXp,
        petLevel: nextLvl
      };
    });
  };

  // Notes handler
  const handleSaveNote = (note: string) => {
    updateCurrentDayLog({ note });
  };

  // Weight handlers
  const handleSaveWeight = (weight: number, date: string, note?: string) => {
    const newEntry: WeightEntry = {
      id: 'w_' + Date.now(),
      date,
      weightKg: weight,
      note
    };
    setWeightEntries((prev) => [...prev, newEntry]);
    setProfile((prev) => ({
      ...prev,
      // Uma pesagem retroativa compõe o histórico, mas não substitui o peso atual.
      ...(date === getTodayDateString() ? { currentWeightKg: weight } : {}),
      gems: prev.gems + 30
    }));

  };

  // Custom Food handler
  const handleCreateCustomFood = (food: FoodItem) => {
    setCustomFoods((prev) => [food, ...prev]);
  };

  const handleSyncHealth = async (silent = false) => {
    // If running on Web / PWA, health sensor access is restricted to the native Capacitor mobile app
    if (!isCapacitorNative()) {
      if (!silent) {
        setIsNativeHealthNoticeOpen(true);
      }
      return;
    }

    if (!silent) {
      setIsSyncingHealth(true);
      setHealthSyncToast(null);
    }

    try {
      const result = await syncHealthData(selectedDate);
      if (!silent) setIsSyncingHealth(false);

      if (result.success) {
        // 1. Add imported activities avoiding duplicate titles on the same day
        const newActivities: ActivityEntry[] = result.importedActivities.map((act) => ({
          ...act,
          id: 'act_health_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
        }));

        const existingTitles = new Set(currentDayLog.activities.map((a) => a.title));
        const filteredToAdd = newActivities.filter((a) => !existingTitles.has(a.title));

        let finalActivities = currentDayLog.activities;
        if (filteredToAdd.length > 0) {
          finalActivities = [...currentDayLog.activities, ...filteredToAdd];
          updateCurrentDayLog({ activities: finalActivities });
        }

        const totalBurned = finalActivities.reduce((acc, a) => acc + a.caloriesBurned, 0);

        // 2. Update profile burned calories & health provider
        setProfile((prev) => ({
          ...prev,
          burnedCalories: totalBurned,
          appleHealthSynced: true,
          healthProvider: result.provider
        }));

        if (!silent) {
          setHealthSyncToast(result.message);
          setTimeout(() => setHealthSyncToast(null), 4000);
        }
      }
    } catch (err: any) {
      if (!silent) setIsSyncingHealth(false);
      console.warn('Health sync error:', err);
    }
  };

  // Background auto-sync when health provider is connected (Capacitor native app only)
  useEffect(() => {
    if (profile.appleHealthSynced && isCapacitorNative()) {
      handleSyncHealth(true);
    }
  }, [profile.appleHealthSynced, selectedDate]);

  // Android native hardware back button handler (closes active modal or returns to journal)
  useEffect(() => {
    return setupAndroidBackButton(() => {
      if (isSettingsOpen) { setIsSettingsOpen(false); return true; }
      if (isAddWeightOpen) { setIsAddWeightOpen(false); return true; }
      if (isEditProfileOpen) { setIsEditProfileOpen(false); return true; }
      if (isScientificAssessmentOpen) { setIsScientificAssessmentOpen(false); return true; }
      if (isAuthModalOpen) { setIsAuthModalOpen(false); return true; }
      if (isTwoFactorModalOpen) { setIsTwoFactorModalOpen(false); return true; }
      if (isNativeHealthNoticeOpen) { setIsNativeHealthNoticeOpen(false); return true; }
      if (isFastingDetailOpen) { setIsFastingDetailOpen(false); return true; }
      if (activeMealForReview) { setActiveMealForReview(null); return true; }
      if (activeMealForAdd) { setActiveMealForAdd(null); return true; }
      if (activeTab !== 'journal') { setActiveTab('journal'); return true; }
      return false;
    });
  }, [
    isSettingsOpen,
    isAddWeightOpen,
    isEditProfileOpen,
    isScientificAssessmentOpen,
    isAuthModalOpen,
    isTwoFactorModalOpen,
    isNativeHealthNoticeOpen,
    isFastingDetailOpen,
    activeMealForReview,
    activeMealForAdd,
    activeTab
  ]);

  // Complete onboarding from interactive survey
  const handleCompleteOnboarding = (
    completedProfile: UserProfile,
    initialWeight: number
  ) => {
    if (!activeUserId || profile.id !== activeUserId) return;
    setIsOnboardingSurveyOpen(false);

    // 1. Update Profile
    const finalProfile: UserProfile = {
      ...completedProfile,
      id: activeUserId,
      email: profile.email,
      isOnboardingCompleted: true
    };
    setProfile(finalProfile);
    saveStoredProfile(finalProfile);

    // Clean session draft
    try {
      sessionStorage.removeItem('nutrifam_onboarding_draft');
      sessionStorage.removeItem('nutrimonitor_onboarding_draft');
    } catch {}

    // 2. Add first real weight entry to weight history (Zero fictional data!)
    const today = getTodayDateString();
    const initialEntry: WeightEntry = {
      id: 'w_' + Date.now(),
      date: today,
      weightKg: initialWeight,
      note: 'Peso inicial verificado na pesquisa'
    };
    const newWeightEntries = [initialEntry];
    setWeightEntries(newWeightEntries);
    saveStoredWeightEntries(newWeightEntries, finalProfile.id);

    // 3. Update or create today's DayLog with newly calculated targets
    setDayLogs((prev) => {
      const existingToday = prev[today] || createEmptyDayLog(today, finalProfile.dailyCaloriesTarget);
      const syncedToday = syncDayLogMealTargets(existingToday, finalProfile.dailyCaloriesTarget);
      syncedToday.water.targetLiters = Number(((initialWeight * 35 + 500) / 1000).toFixed(1));
      const updatedLogs = { ...prev, [today]: syncedToday };
      saveStoredDayLogs(updatedLogs, finalProfile.id);
      return updatedLogs;
    });

    setActiveTab('journal');
  };

  const handleToggleAppleHealth = () => {
    if (!isCapacitorNative()) {
      setIsNativeHealthNoticeOpen(true);
      return;
    }

    if (!profile.appleHealthSynced) {
      handleSyncHealth(false);
    } else {
      setProfile((prev) => ({
        ...prev,
        appleHealthSynced: false
      }));
    }
  };

  if (mfaChecking) return <div className="min-h-dvh flex items-center justify-center bg-[#F7F4EE] dark:bg-[#18201D] text-sm text-[#3F4B46] dark:text-white">Verificando sua sessão...</div>;

  if (mfaGateUser) return <div className="min-h-dvh flex items-center justify-center bg-[#F7F4EE] dark:bg-[#18201D] p-4">
    <form onSubmit={async (event) => {
      event.preventDefault();
      setMfaError(null);
      try {
        const factorId = mfaFactorId || (await getMfaStatus()).factorId;
        if (!factorId) throw new Error('Fator A2F não encontrado.');
        await verifyTotp(factorId, mfaCode);
        const user = mfaGateUser;
        setMfaGateUser(null);
        setMfaCode('');
        await handleAuthSuccess(user);
      } catch (error) {
        setMfaError(error instanceof Error ? error.message : 'Código inválido ou expirado.');
      }
    }} className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#232D29] p-6 space-y-4 text-[#18201D] dark:text-white">
      <h1 className="text-lg font-bold">Confirme seu segundo fator</h1>
      <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Abra seu aplicativo autenticador e digite o código de 6 dígitos para entrar.</p>
      {mfaError && <p role="alert" className="text-xs text-rose-600">{mfaError}</p>}
      <input value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" aria-label="Código de autenticação" className="w-full rounded-xl bg-[#F7F4EE] dark:bg-[#34423C] p-3 text-center font-mono text-lg tracking-widest" />
      <button type="submit" disabled={mfaCode.length !== 6} className="w-full rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white disabled:opacity-50">Verificar código</button>
      <button type="button" onClick={async () => { await handleLogout(); setMfaGateUser(null); setMfaFactorId(null); setMfaError(null); setMfaCode(''); }} className="w-full text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Sair da conta</button>
    </form>
  </div>;

  if (!activeUserId) return <div className="min-h-dvh flex items-center justify-center bg-[#F7F4EE] dark:bg-[#18201D] p-4">
    <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#232D29] p-6 text-center text-[#18201D] dark:text-white shadow-lg">
      <h1 className="text-2xl font-bold">NutriFam</h1>
      <p className="mt-3 text-sm text-[#6F7C76] dark:text-[#A8B8B1]">Entre na sua conta para acessar seus dados. Depois do primeiro acesso, você poderá continuar usando o app sem internet.</p>
      {authLoadError && <p role="alert" className="mt-4 text-sm text-rose-600">{authLoadError}</p>}
      {authLoadError && <button type="button" onClick={() => window.location.reload()} className="mt-3 text-sm font-bold text-emerald-700">Tentar novamente</button>}
      {!isSupabaseConfigured() && <p role="alert" className="mt-4 text-sm text-rose-600">A autenticação não está configurada neste dispositivo.</p>}
      <button type="button" disabled={!isSupabaseConfigured()} onClick={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }} className="mt-6 w-full rounded-xl bg-emerald-700 py-3 font-bold text-white disabled:opacity-50">Entrar</button>
      <button type="button" disabled={!isSupabaseConfigured()} onClick={() => { setAuthModalMode('register'); setIsAuthModalOpen(true); }} className="mt-3 w-full rounded-xl border border-emerald-700 py-3 font-bold text-emerald-700 disabled:opacity-50">Criar conta</button>
    </div>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuthSuccess={handleAuthSuccess} initialMode={authModalMode} />
  </div>;

  return (
    <MobileFrame>
      {unavailableData.length > 0 && <div role="alert" className="mx-3 mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100">
        Não foi possível atualizar {unavailableData.join(', ')}. Os registros deste aparelho são exibidos provisoriamente; a sincronização será tentada novamente quando a conexão voltar.
      </div>}
      {syncConflictCount > 0 && <div role="alert" className="mx-3 mt-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100">
        {syncConflictCount} alteração(ões) local(is) em conflito não foram enviadas. O valor do servidor foi mantido; os dados locais seguem preservados neste aparelho.
        <button type="button" onClick={exportSyncConflicts} className="mt-1 block font-bold underline">Exportar cópia das alterações</button>
      </div>}
      {!profile.isOnboardingCompleted || isOnboardingSurveyOpen ? (
        <OnboardingSurvey
          key={activeUserId}
          onComplete={handleCompleteOnboarding}
          existingProfile={profile}
          isRedoing={isOnboardingSurveyOpen && Boolean(profile.isOnboardingCompleted)}
          onClose={() => setIsOnboardingSurveyOpen(false)}
          onOpenLogin={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />
      ) : (
        <>
          {/* Main Tab Views */}
          <div className={`flex-1 min-h-0 flex flex-col ${activeTab === 'coach' ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain'}`}>
            {/* TAB 1: JOURNAL (Matching 1f.jpg and 2f.jpg) */}
        {activeTab === 'journal' && (
          <div className="flex-1 flex flex-col pb-6">
            {/* Calorie Ring and Macro Bars (1f.jpg) */}
            <CalorieRingCard
              profile={profile}
              dayLog={currentDayLog}
              onOpenGemsInfo={() => setActiveTab('foodbud')}
              onOpenBurnedInfo={() => {}}
            />

            {/* Date Navigator (< Today >) */}
            <DateNavigator
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onResetDay={handleResetDayLog}
            />

            {/* Meal Sections (Breakfast, Lunch, Dinner, Snacks) */}
            <MealSectionCard
              meal={currentDayLog.meals.breakfast}
              onAddFood={(type) => {
                setActiveMealForAdd(type);
                setAddFoodInitialSubTab('search');
              }}
              onOpenReview={(type) => setActiveMealForReview(type)}
              onRemoveItem={handleRemoveItem}
            />

            <MealSectionCard
              meal={currentDayLog.meals.lunch}
              onAddFood={(type) => {
                setActiveMealForAdd(type);
                setAddFoodInitialSubTab('search');
              }}
              onOpenReview={(type) => setActiveMealForReview(type)}
              onRemoveItem={handleRemoveItem}
            />

            <MealSectionCard
              meal={currentDayLog.meals.dinner}
              onAddFood={(type) => {
                setActiveMealForAdd(type);
                setAddFoodInitialSubTab('search');
              }}
              onOpenReview={(type) => setActiveMealForReview(type)}
              onRemoveItem={handleRemoveItem}
            />

            <MealSectionCard
              meal={currentDayLog.meals.snacks}
              onAddFood={(type) => {
                setActiveMealForAdd(type);
                setAddFoodInitialSubTab('search');
              }}
              onOpenReview={(type) => setActiveMealForReview(type)}
              onRemoveItem={handleRemoveItem}
            />

            {/* Fasting Card ("You're fasting! 09:51:04") (1f.jpg) */}
            <FastingCard
              fasting={currentDayLog.fasting}
              onUpdateFasting={handleUpdateFasting}
              onOpenDetail={() => setIsFastingDetailOpen(true)}
              isToday={selectedDate === getTodayDateString()}
              isPast={selectedDate < getTodayDateString()}
              isFuture={selectedDate > getTodayDateString()}
            />

            {/* Activities Card (2f.jpg) */}
            <ActivitiesCard
              activities={currentDayLog.activities}
              weightKg={profile.currentWeightKg}
              onAddActivity={handleAddActivity}
              onRemoveActivity={handleRemoveActivity}
              onSyncHealth={handleSyncHealth}
              isSyncingHealth={isSyncingHealth}
            />

            {/* Water Challenge Card (6 cups, 1.5L) (2f.jpg) */}
            <WaterChallengeCard
              water={currentDayLog.water}
              onUpdateWater={handleUpdateWater}
            />

            {/* Notes Card (2f.jpg) */}
            <NotesCard
              note={currentDayLog.note}
              onSaveNote={handleSaveNote}
            />

            {/* Customize Diary Button (2f.jpg) */}
            <CustomizeDiaryButton onClick={() => setIsEditProfileOpen(true)} />
          </div>
        )}

        {/* TAB 2: PROFILE (Matching 6f.jpg and 7f.jpg) */}
        {activeTab === 'profile' && (
          <div className="flex-1 flex flex-col">
            <ProfileHeader
              profile={profile}
              activeSubTab={profileSubTab}
              onChangeSubTab={setProfileSubTab}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenScientificAssessment={() => setIsScientificAssessmentOpen(true)}
              onOpenAuth={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              onLogout={handleLogout}
            />

            {profileSubTab === 'weight' ? (
              <WeightTab
                profile={profile}
                weightEntries={weightEntries}
                onOpenAddWeightModal={() => setIsAddWeightOpen(true)}
                onToggleAppleHealth={handleToggleAppleHealth}
              />
            ) : (
              <NutritionTab
                profile={profile}
                dayLogs={dayLogs}
              />
            )}
          </div>
        )}

        {/* TAB: COACH (AI Assistant) */}
        {activeTab === 'coach' && (
          <CoachView
            profile={profile}
            todayLog={currentDayLog}
            geminiApiKey={profile.geminiApiKey}
            onOpenScientificAssessment={() => setIsScientificAssessmentOpen(true)}
            onWorkoutRoutineCreated={() => setActiveTab('workouts')}
            onRecipeCreated={handleCreateCustomFood}
          />
        )}

        {/* TAB: WORKOUTS (Fichas, Séries, Hevy-style tracking) */}
        {activeTab === 'workouts' && (
          <WorkoutsView
            profile={profile}
            onWorkoutFinished={handleWorkoutFinished}
            onWorkoutDeleted={handleWorkoutDeleted}
          />
        )}

        {/* TAB: QUESTS (Redirects/fallback to Pet area) */}
        {activeTab === 'quests' && (
          <FoodBudView
            gems={profile.gems}
            petLevel={profile.petLevel || 1}
            petXp={profile.petXp ?? 0}
            inventory={profile.inventory || []}
            equippedCap={profile.equippedCap ?? null}
            equippedGlasses={profile.equippedGlasses ?? null}
            equippedClothes={profile.equippedClothes ?? null}
            petName={profile.petName}
            dayLog={currentDayLog}
            onClaimQuest={handleClaimQuest}
            onSpendGems={(cost) => setProfile((p) => ({ ...p, gems: Math.max(0, p.gems - cost) }))}
            onUpdatePetProfile={(updates) => setProfile((p) => ({ ...p, ...updates }))}
          />
        )}

        {/* TAB: FOODBUD */}
        {activeTab === 'foodbud' && (
          <FoodBudView
            gems={profile.gems}
            petLevel={profile.petLevel || 1}
            petXp={profile.petXp ?? 0}
            inventory={profile.inventory || []}
            equippedCap={profile.equippedCap ?? null}
            equippedGlasses={profile.equippedGlasses ?? null}
            equippedClothes={profile.equippedClothes ?? null}
            petName={profile.petName}
            dayLog={currentDayLog}
            onClaimQuest={handleClaimQuest}
            onSpendGems={(cost) => setProfile((p) => ({ ...p, gems: Math.max(0, p.gems - cost) }))}
            onUpdatePetProfile={(updates) => setProfile((p) => ({ ...p, ...updates }))}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unclaimedQuestsCount={calculateUnclaimedQuests(currentDayLog)}
      />
      </>
      )}

      {/* Add Food Modal (Matching 3f, 4f, 8f, f14) */}
      {activeMealForAdd && (
        <AddFoodModal
          meal={currentDayLog.meals[activeMealForAdd]}
          allFoods={customFoods}
          customFoods={customFoods}
          initialSubTab={addFoodInitialSubTab}
          onClose={() => setActiveMealForAdd(null)}
          onAddFoodToMeal={handleAddFoodToMeal}
          onAddMultipleFoodsToMeal={handleAddMultipleFoodsToMeal}
          onCreateCustomFood={handleCreateCustomFood}
          onOpenMealReview={() => {
            const mealType = activeMealForAdd;
            setActiveMealForAdd(null);
            setActiveMealForReview(mealType);
          }}
          aiProvider={profile.aiProvider}
          geminiApiKey={profile.geminiApiKey}
          geminiModel={profile.geminiModel}
          openaiApiKey={profile.openaiApiKey}
          openaiModel={profile.openaiModel}
          openrouterApiKey={profile.openrouterApiKey}
          openrouterModel={profile.openrouterModel}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Meal Review Modal matching f10.jpg and f11.jpg */}
      {activeMealForReview && (
        <MealReviewModal
          meal={currentDayLog.meals[activeMealForReview]}
          onClose={() => setActiveMealForReview(null)}
          onOpenAddTab={(subTab) => {
            const mealType = activeMealForReview;
            setActiveMealForReview(null);
            setAddFoodInitialSubTab(subTab);
            setActiveMealForAdd(mealType);
          }}
          onRemoveItem={handleRemoveItem}
        />
      )}

      {/* Fasting Detail Modal matching f15.jpg and f16.jpg */}
      {isFastingDetailOpen && (
        <FastingDetailModal
          fasting={currentDayLog.fasting}
          onClose={() => setIsFastingDetailOpen(false)}
          onUpdateFasting={handleUpdateFasting}
          isToday={selectedDate === getTodayDateString()}
          isPast={selectedDate < getTodayDateString()}
          isFuture={selectedDate > getTodayDateString()}
          onEndFasting={() => {
            handleUpdateFasting({ isActive: false, isManuallyPaused: false, isManuallyStopped: true });
            setIsFastingDetailOpen(false);
          }}
          onCancelFasting={() => {
            handleUpdateFasting({ isActive: false, isManuallyPaused: false, isManuallyStopped: true, elapsedSeconds: 0 });
            setIsFastingDetailOpen(false);
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditProfileOpen(false)}
          onSaveProfile={(updated) => {
            if (updated.currentWeightKg > 0 && updated.currentWeightKg !== profile.currentWeightKg) {
              setWeightEntries((prev) => [...prev, {
                id: 'w_' + Date.now(),
                date: getTodayDateString(),
                weightKg: updated.currentWeightKg,
                note: 'Atualização do perfil'
              }]);
            }
            setProfile(updated);
            if (updated.dailyCaloriesTarget) {
              updateCurrentDayLog(syncDayLogMealTargets(currentDayLog, updated.dailyCaloriesTarget));
            }
          }}
          onOpenScientificAssessment={() => setIsScientificAssessmentOpen(true)}
        />
      )}

      {/* Add Weight Modal */}
      {isAddWeightOpen && (
        <AddWeightModal
          currentWeight={profile.currentWeightKg}
          onClose={() => setIsAddWeightOpen(false)}
          onSaveWeight={handleSaveWeight}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          profile={profile}
          onClose={() => setIsSettingsOpen(false)}
          onSaveAISettings={(provider, geminiKey, openaiKey, openaiModel, openrouterKey, openrouterModel, geminiModel) => {
            setProfile((p) => ({
              ...p,
              aiProvider: provider,
              geminiApiKey: geminiKey,
              geminiModel: geminiModel,
              openaiApiKey: openaiKey,
              openaiModel: openaiModel,
              openrouterApiKey: openrouterKey,
              openrouterModel: openrouterModel
            }));
          }}
          onSaveApiKey={(key) => setProfile((p) => ({ ...p, geminiApiKey: key }))}
          onOpenAuth={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenTwoFactorModal={() => setIsTwoFactorModalOpen(true)}
          onToggleSplashAnimation={(enabled) => setProfile((p) => ({ ...p, showSplashAnimation: enabled }))}
          onSyncHealth={handleSyncHealth}
          onRedoOnboarding={() => setIsOnboardingSurveyOpen(true)}
        />
      )}

      {/* Scientific Nutrition Assessment Modal */}
      {isScientificAssessmentOpen && (
        <ScientificAssessmentModal
          profile={profile}
          onClose={() => setIsScientificAssessmentOpen(false)}
          onSaveAssessment={(updated) => {
            setProfile((prev) => ({
              ...prev,
              ...updated
            }));
            const dayLogUpdates: Partial<typeof currentDayLog> = {};
            if (updated.dailyCaloriesTarget) {
              const synced = syncDayLogMealTargets(currentDayLog, updated.dailyCaloriesTarget);
              dayLogUpdates.meals = synced.meals;
            }
            if (updated.currentWeightKg) {
              const newWaterTarget = Number(((updated.currentWeightKg * 35 + 500) / 1000).toFixed(1));
              dayLogUpdates.water = {
                ...currentDayLog.water,
                targetLiters: newWaterTarget
              };
            }
            if (Object.keys(dayLogUpdates).length > 0) {
              updateCurrentDayLog(dayLogUpdates);
            }
          }}
        />
      )}

      {/* Authentication Modal (Login / Register / Social / A2F) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        onUpdateStatus={(enabled) => {
          setProfile((prev) => ({
            ...prev,
            isTwoFactorEnabled: enabled,
          }));
        }}
      />

      {/* Health Sync Notification Toast */}
      {healthSyncToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span>❤️</span>
          <span>{healthSyncToast}</span>
        </div>
      )}

      {/* Native Health Notice Modal (App Mobile Exclusivity Warning) */}
      <NativeHealthNoticeModal
        isOpen={isNativeHealthNoticeOpen}
        onClose={() => setIsNativeHealthNoticeOpen(false)}
      />

      {/* Animated Splash Screen ("NutriFam" with Raccoon Blinking) */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          isLoggedIn={Boolean(profile.email)}
        />
      )}
    </MobileFrame>
  );
};
