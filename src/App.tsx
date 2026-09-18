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
import { SettingsModal } from './components/modals/SettingsModal';
import { ScientificAssessmentModal } from './components/modals/ScientificAssessmentModal';
import { AuthModal } from './components/auth/AuthModal';
import { TwoFactorModal } from './components/auth/TwoFactorModal';
import { SplashScreen } from './components/splash/SplashScreen';
import { OnboardingSurvey } from './components/onboarding/OnboardingSurvey';
import { NativeHealthNoticeModal } from './components/health/NativeHealthNoticeModal';
import { syncHealthData, isCapacitorNative } from './services/healthSyncService';
import { setupAndroidBackButton } from './services/nativeService';
import { getLocalAuthUser, setLocalAuthUser, logoutAccount, AuthUser } from './services/authService';
import { calculateFastingWindow } from './services/fastingScheduler';
import { syncDayLogMealTargets } from './services/nutritionCalculator';
import { syncExercisesFromSupabase } from './services/exerciseDatabase';

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
  getTodayDateString,
  createEmptyDayLog
} from './services/storage';

import {
  isSupabaseConfigured,
  getSupabase,
  loadProfileFromSupabase,
  saveProfileToSupabase,
  loadDayLogsFromSupabase,
  saveDayLogToSupabase,
  loadWeightEntriesFromSupabase,
  saveWeightEntryToSupabase,
  loadCustomFoodsFromSupabase,
  saveCustomFoodToSupabase
} from './services/supabaseClient';

export const App: React.FC = () => {
  // Global State
  const [profile, setProfile] = useState(getStoredProfile);
  const [dayLogs, setDayLogs] = useState(getStoredDayLogs);
  const [weightEntries, setWeightEntries] = useState(getStoredWeightEntries);
  const [customFoods, setCustomFoods] = useState(getStoredCustomFoods);

  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const [activeTab, setActiveTab] = useState<ActiveTab>('journal');
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('weight');

  // Detect shared workout link on mount
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
  const [showSplash, setShowSplash] = useState(() => getStoredProfile().showSplashAnimation !== false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);
  const [healthSyncToast, setHealthSyncToast] = useState<string | null>(null);
  const [isOnboardingSurveyOpen, setIsOnboardingSurveyOpen] = useState(false);
  const [isNativeHealthNoticeOpen, setIsNativeHealthNoticeOpen] = useState(false);

  const hasLoadedRemote = useRef(false);

  const handleAuthSuccess = async (authUser: AuthUser) => {
    setIsAuthModalOpen(false);

    // If Supabase is configured, check if this user already has an existing completed profile in Supabase
    if (isSupabaseConfigured()) {
      try {
        const remoteProfile = await loadProfileFromSupabase(authUser.id);
        if (remoteProfile && remoteProfile.isOnboardingCompleted && remoteProfile.currentWeightKg > 0) {
          const mergedProfile: UserProfile = {
            ...remoteProfile,
            id: authUser.id,
            email: authUser.email,
            name: authUser.name || remoteProfile.name,
            avatarText: (authUser.name?.[0] || remoteProfile.name?.[0] || 'A').toUpperCase()
          };
          setProfile(mergedProfile);
          saveStoredProfile(mergedProfile);
          setIsOnboardingSurveyOpen(false);

          const remoteLogs = await loadDayLogsFromSupabase(authUser.id);
          if (remoteLogs && Object.keys(remoteLogs).length > 0) {
            setDayLogs((prev) => ({ ...prev, ...remoteLogs }));
          }

          const remoteWeights = await loadWeightEntriesFromSupabase(authUser.id);
          if (remoteWeights && remoteWeights.length > 0) {
            setWeightEntries(remoteWeights);
          }

          const remoteFoods = await loadCustomFoodsFromSupabase(authUser.id);
          if (remoteFoods && remoteFoods.length > 0) {
            setCustomFoods((prev) => {
              const existingIds = new Set(prev.map((f) => f.id));
              const newOnes = remoteFoods.filter((f) => !existingIds.has(f.id));
              return [...prev, ...newOnes];
            });
          }
          return;
        }
      } catch (err) {
        console.warn('Post-login sync notice:', err);
      }
    }

    // If no completed remote profile exists, this is a fresh user or onboarding is in progress.
    // Update auth credentials without wiping out survey inputs or pushing empty defaults.
    setProfile((prev) => {
      const updatedProfile: UserProfile = {
        ...prev,
        id: authUser.id,
        email: authUser.email,
        name: authUser.name || prev.name,
        avatarText: (authUser.name?.[0] || prev.name?.[0] || 'A').toUpperCase()
      };
      saveStoredProfile(updatedProfile);
      if (isSupabaseConfigured() && updatedProfile.isOnboardingCompleted && updatedProfile.currentWeightKg > 0) {
        saveProfileToSupabase(updatedProfile, authUser.id);
      }
      return updatedProfile;
    });
  };

  const handleLogout = async () => {
    await logoutAccount();
    const cleanProfile: UserProfile = {
      ...profile,
      id: undefined,
      email: undefined
    };
    setProfile(cleanProfile);
    saveStoredProfile(cleanProfile);
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
        // Detect session from redirect hash or storage
        client.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const u = session.user;
            const authUser: AuthUser = {
              id: u.id,
              email: u.email || '',
              name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário',
              createdAt: u.created_at,
              provider: (u.app_metadata?.provider as any) || 'email',
              isEmailVerified: Boolean(u.email_confirmed_at)
            };
            setLocalAuthUser(authUser);
            handleAuthSuccess(authUser);

            // Clean OAuth hash from browser address bar
            if (window.location.hash && window.location.hash.includes('access_token')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        }).catch((err) => {
          console.warn('Supabase getSession notice:', err);
        });

        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
            const u = session.user;
            const authUser: AuthUser = {
              id: u.id,
              email: u.email || '',
              name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário',
              createdAt: u.created_at,
              provider: (u.app_metadata?.provider as any) || 'email',
              isEmailVerified: Boolean(u.email_confirmed_at)
            };
            setLocalAuthUser(authUser);
            await handleAuthSuccess(authUser);

            if (window.location.hash && window.location.hash.includes('access_token')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else if (event === 'SIGNED_OUT') {
            setLocalAuthUser(null);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      }
    }

    // 2. Fallback local user check
    const localUser = getLocalAuthUser();
    if (localUser && (!profile.email || profile.id !== localUser.id)) {
      setProfile((prev) => ({
        ...prev,
        id: localUser.id,
        email: localUser.email,
        name: localUser.name || prev.name
      }));
    }
  }, []);

  // Initial Supabase Sync
  useEffect(() => {
    async function initSupabaseSync() {
      if (!isSupabaseConfigured() || hasLoadedRemote.current) return;
      hasLoadedRemote.current = true;

      try {
        const remoteProfile = await loadProfileFromSupabase();
        if (remoteProfile && remoteProfile.isOnboardingCompleted && remoteProfile.currentWeightKg > 0) {
          setProfile(remoteProfile);
          saveStoredProfile(remoteProfile);
        } else if (profile.isOnboardingCompleted && profile.currentWeightKg > 0) {
          await saveProfileToSupabase(profile);
        }

        const remoteLogs = await loadDayLogsFromSupabase();
        if (remoteLogs && Object.keys(remoteLogs).length > 0) {
          setDayLogs((prev) => ({ ...prev, ...remoteLogs }));
        }

        const remoteWeights = await loadWeightEntriesFromSupabase();
        if (remoteWeights && remoteWeights.length > 0) {
          setWeightEntries(remoteWeights);
        }

        const remoteFoods = await loadCustomFoodsFromSupabase();
        if (remoteFoods && remoteFoods.length > 0) {
          setCustomFoods((prev) => {
            const existingIds = new Set(prev.map((f) => f.id));
            const newOnes = remoteFoods.filter((f) => !existingIds.has(f.id));
            return [...prev, ...newOnes];
          });
        }

        // Sync exercises from user's Supabase database
        await syncExercisesFromSupabase();
      } catch (err) {
        console.warn('Initial Supabase sync notice:', err);
      }
    }

    initSupabaseSync();
  }, []);

  // Sync to localStorage and Supabase
  useEffect(() => {
    saveStoredProfile(profile);
    if (isSupabaseConfigured() && profile.isOnboardingCompleted && profile.currentWeightKg > 0) {
      saveProfileToSupabase(profile);
    }
  }, [profile]);

  useEffect(() => {
    saveStoredDayLogs(dayLogs);
  }, [dayLogs]);

  useEffect(() => {
    saveStoredWeightEntries(weightEntries);
  }, [weightEntries]);

  useEffect(() => {
    saveStoredCustomFoods(customFoods);
  }, [customFoods]);

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

    if (isSupabaseConfigured()) {
      saveDayLogToSupabase(updatedLog, profile.id);
    }
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

    if (isSupabaseConfigured()) {
      saveDayLogToSupabase(freshLog, profile.id);
    }

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
      currentWeightKg: weight,
      gems: prev.gems + 30
    }));

    if (isSupabaseConfigured()) {
      saveWeightEntryToSupabase(newEntry);
    }
  };

  // Custom Food handler
  const handleCreateCustomFood = (food: FoodItem) => {
    setCustomFoods((prev) => [food, ...prev]);
    if (isSupabaseConfigured()) {
      saveCustomFoodToSupabase(food);
    }
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
    initialWeight: number,
    authUser?: AuthUser
  ) => {
    setIsOnboardingSurveyOpen(false);

    // 1. Update Profile
    const finalProfile: UserProfile = {
      ...completedProfile,
      id: authUser?.id || completedProfile.id || profile.id,
      email: authUser?.email || completedProfile.email || profile.email,
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
    saveStoredWeightEntries(newWeightEntries);

    // 3. Update or create today's DayLog with newly calculated targets
    setDayLogs((prev) => {
      const existingToday = prev[today] || createEmptyDayLog(today, finalProfile.dailyCaloriesTarget);
      const syncedToday = syncDayLogMealTargets(existingToday, finalProfile.dailyCaloriesTarget);
      syncedToday.water.targetLiters = Number(((initialWeight * 35 + 500) / 1000).toFixed(1));
      const updatedLogs = { ...prev, [today]: syncedToday };
      saveStoredDayLogs(updatedLogs);
      return updatedLogs;
    });

    // 4. Sync with Supabase if configured
    if (isSupabaseConfigured()) {
      saveProfileToSupabase(finalProfile, finalProfile.id);
      saveWeightEntryToSupabase(initialEntry, finalProfile.id);
    }

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

  return (
    <MobileFrame>
      {!profile.isOnboardingCompleted || isOnboardingSurveyOpen ? (
        <OnboardingSurvey
          onComplete={handleCompleteOnboarding}
          existingProfile={profile}
          isRedoing={isOnboardingSurveyOpen && Boolean(profile.isOnboardingCompleted)}
          onClose={() => setIsOnboardingSurveyOpen(false)}
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
            onUpdateProfile={(updates) => setProfile((p) => ({ ...p, ...updates }))}
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
            setProfile(updated);
            if (isSupabaseConfigured()) {
              saveProfileToSupabase(updated);
            }
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
        userId={profile.id}
        userEmail={profile.email}
        isEnabled={Boolean(profile.isTwoFactorEnabled)}
        onUpdateStatus={(enabled, secret) => {
          setProfile((prev) => ({
            ...prev,
            isTwoFactorEnabled: enabled,
            twoFactorSecret: secret
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
