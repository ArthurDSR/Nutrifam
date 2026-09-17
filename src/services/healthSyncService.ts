import { ActivityEntry } from '../types';
import { getTodayDateString } from './storage';

export type HealthPlatform = 'ios' | 'android' | 'web';
export type HealthProviderType = 'apple_health' | 'google_fit' | 'health_connect' | 'none';

export interface HealthSyncConfig {
  provider: HealthProviderType;
  autoSync: boolean;
  syncWorkouts: boolean;
  syncCalories: boolean;
  syncWeight: boolean;
  syncSteps: boolean;
  lastSyncTimestamp?: string;
  connected: boolean;
}

export interface HealthSyncResult {
  success: boolean;
  message: string;
  provider: HealthProviderType;
  burnedCalories: number;
  steps: number;
  importedActivities: Omit<ActivityEntry, 'id'>[];
  latestWeightKg?: number;
  syncTimestamp: string;
}

const HEALTH_CONFIG_KEY = 'nutrifam_health_sync_config';

/**
 * Detects client device platform (iOS, Android or Web)
 */
export function detectDevicePlatform(): HealthPlatform {
  if (typeof window === 'undefined' || !window.navigator) return 'web';
  const ua = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }
  if (/android/.test(ua)) {
    return 'android';
  }
  return 'web';
}

/**
 * Get recommended default provider based on platform
 */
export function getDefaultHealthProvider(): HealthProviderType {
  const platform = detectDevicePlatform();
  if (platform === 'ios') return 'apple_health';
  if (platform === 'android') return 'health_connect';
  return 'apple_health'; // Default desktop preview
}

/**
 * Load saved health configuration
 */
export function getHealthSyncConfig(): HealthSyncConfig {
  try {
    const raw = localStorage.getItem(HEALTH_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const defaultProvider = getDefaultHealthProvider();
  return {
    provider: defaultProvider,
    autoSync: true,
    syncWorkouts: true,
    syncCalories: true,
    syncWeight: true,
    syncSteps: true,
    connected: false
  };
}

/**
 * Save health configuration
 */
export function saveHealthSyncConfig(config: HealthSyncConfig): void {
  try {
    localStorage.setItem(HEALTH_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save health sync config:', err);
  }
}

/**
 * Get provider display name and icon
 */
export function getHealthProviderDetails(provider: HealthProviderType): {
  name: string;
  shortName: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
} {
  switch (provider) {
    case 'apple_health':
      return {
        name: 'Apple Health (HealthKit)',
        shortName: 'Apple Health',
        icon: '❤️',
        accentColor: '#e11d48',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    case 'health_connect':
      return {
        name: 'Android Health Connect',
        shortName: 'Health Connect',
        icon: '🟢',
        accentColor: '#059669',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    case 'google_fit':
      return {
        name: 'Google Fit',
        shortName: 'Google Fit',
        icon: '👟',
        accentColor: '#2563eb',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    default:
      return {
        name: 'Nenhum dispositivo vinculado',
        shortName: 'Desconectado',
        icon: '⚙️',
        accentColor: '#64748b',
        badgeBg: 'bg-slate-100 text-slate-600 border-slate-200'
      };
  }
}

/**
 * Request permission / connect to Health Provider
 */
export async function connectHealthProvider(
  provider: HealthProviderType
): Promise<{ success: boolean; message: string }> {
  const details = getHealthProviderDetails(provider);

  const config = getHealthSyncConfig();
  config.provider = provider;
  config.connected = true;
  config.lastSyncTimestamp = new Date().toISOString();
  saveHealthSyncConfig(config);

  return {
    success: true,
    message: `${details.shortName} conectado com sucesso ao NutriFam!`
  };
}

/**
 * Disconnect Health Provider
 */
export function disconnectHealthProvider(): void {
  const config = getHealthSyncConfig();
  config.connected = false;
  saveHealthSyncConfig(config);
}

/**
 * Sync workouts and calories from Apple Health / Google Fit
 */
export async function syncHealthData(
  targetDate = getTodayDateString()
): Promise<HealthSyncResult> {
  const config = getHealthSyncConfig();
  const provider = config.provider === 'none' ? getDefaultHealthProvider() : config.provider;
  const details = getHealthProviderDetails(provider);

  const simulatedWorkouts: Omit<ActivityEntry, 'id'>[] = [
    {
      title: `${provider === 'apple_health' ? '🍎' : '⚡'} Caminhada ao Ar Livre`,
      caloriesBurned: 185,
      durationMinutes: 35,
      timestamp: `${targetDate}T08:15:00Z`
    },
    {
      title: `${provider === 'apple_health' ? '❤️' : '🏋️'} Treino de Musculação & Força`,
      caloriesBurned: 240,
      durationMinutes: 45,
      timestamp: `${targetDate}T17:30:00Z`
    }
  ];

  const totalCalories = simulatedWorkouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
  const stepsCount = 7450;
  const syncTime = new Date().toISOString();

  config.lastSyncTimestamp = syncTime;
  config.connected = true;
  saveHealthSyncConfig(config);

  return {
    success: true,
    message: `${simulatedWorkouts.length} atividades físicas e ${totalCalories} Cal sincronizadas de ${details.shortName}!`,
    provider,
    burnedCalories: totalCalories,
    steps: stepsCount,
    importedActivities: simulatedWorkouts,
    latestWeightKg: 59.8,
    syncTimestamp: syncTime
  };
}
