/**
 * Approximate active (net) calories. The resting 1 MET is excluded because it is
 * already part of the user's daily energy budget. METs describe populations,
 * not a measurement of an individual's expenditure.
 */
export function estimateActiveCalories(met: number, durationMinutes: number, weightKg: number): number {
  if (!Number.isFinite(met) || !Number.isFinite(durationMinutes) || !Number.isFinite(weightKg)) return 0;
  if (durationMinutes <= 0 || weightKg <= 0) return 0;
  return Math.round(Math.max(0, met - 1) * weightKg * durationMinutes / 60);
}

// 2024 Adult Compendium of Physical Activities: representative, non-vigorous
// values. Duration should be the time actually spent doing the activity.
export const JOURNAL_ACTIVITY_TYPES = [
  { title: 'Caminhada', met: 4.0, icon: '🚶' },
  { title: 'Corrida', met: 7.5, icon: '🏃' },
  { title: 'Musculação', met: 3.5, icon: '🏋️' },
  { title: 'Ciclismo', met: 6.8, icon: '🚴' },
  { title: 'Natação', met: 5.8, icon: '🏊' }
] as const;
