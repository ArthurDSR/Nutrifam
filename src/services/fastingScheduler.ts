/**
 * Fasting Scheduler & Clock Window Calculator
 */

export interface FastingWindowCalculation {
  inWindow: boolean;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  stage: string;
  nextEventText: string;
}

export function calculateFastingWindow(
  startTimeStr = '20:00',
  endTimeStr = '12:00',
  now = new Date(),
  isActive = true,
  currentElapsedSeconds = 0,
  isManuallyPaused = false,
  isManuallyStopped = false
): FastingWindowCalculation {
  const [startH, startM] = startTimeStr.split(':').map((n) => parseInt(n, 10) || 0);
  const [endH, endM] = endTimeStr.split(':').map((n) => parseInt(n, 10) || 0);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = currentMinutes * 60 + now.getSeconds();

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  let inWindow = false;
  let elapsedSeconds = 0;
  let totalDurationSeconds = 0;

  if (startMinutes < endMinutes) {
    // Daytime window (e.g. 08:00 to 16:00)
    totalDurationSeconds = (endMinutes - startMinutes) * 60;
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      inWindow = true;
      elapsedSeconds = currentSeconds - startMinutes * 60;
    }
  } else {
    // Overnight window (e.g. 20:00 to 12:00 next day)
    const minutesInDay = 24 * 60;
    totalDurationSeconds = (minutesInDay - startMinutes + endMinutes) * 60;

    if (currentMinutes >= startMinutes) {
      inWindow = true;
      elapsedSeconds = currentSeconds - startMinutes * 60;
    } else if (currentMinutes < endMinutes) {
      inWindow = true;
      elapsedSeconds = (minutesInDay - startMinutes) * 60 + currentSeconds;
    }
  }

  // If user passed a specific elapsed seconds, respect it
  if (currentElapsedSeconds > 0) {
    elapsedSeconds = currentElapsedSeconds;
  }

  elapsedSeconds = Math.max(0, Math.min(totalDurationSeconds, elapsedSeconds));

  const hours = elapsedSeconds / 3600;
  let stage = 'Digestão e absorção';
  if (isManuallyPaused || (!isActive && elapsedSeconds > 0)) {
    stage = 'Jejum pausado';
  } else if (isManuallyStopped || !isActive) {
    stage = 'Janela de alimentação aberta';
  } else {
    if (hours >= 16) stage = 'Autofagia e Renovação Celular';
    else if (hours >= 12) stage = 'Queima de Gordura (Cetose)';
    else if (hours >= 8) stage = 'Estabilização de Glicemia';
    else if (hours >= 4) stage = 'Queda de Insulina e Glicose';
    else stage = 'Digestão e absorção';
  }

  let nextEventText = '';
  if (isManuallyPaused || (!isActive && elapsedSeconds > 0)) {
    nextEventText = `Jejum pausado em ${Math.floor(elapsedSeconds / 3600)}h ${Math.floor((elapsedSeconds % 3600) / 60)}m. Toque para retomar.`;
  } else if (isManuallyStopped || !isActive) {
    nextEventText = `Jejum parado/não iniciado. Próximo ciclo programado: ${startTimeStr} às ${endTimeStr}.`;
  } else if (inWindow) {
    const remainingSecs = Math.max(0, totalDurationSeconds - elapsedSeconds);
    const remH = Math.floor(remainingSecs / 3600);
    const remM = Math.floor((remainingSecs % 3600) / 60);
    nextEventText = `Jejum em andamento até às ${endTimeStr} (restam ~${remH}h ${remM}m)`;
  } else {
    nextEventText = `Fora da janela. Próximo início programado às ${startTimeStr}`;
  }

  return {
    inWindow,
    elapsedSeconds,
    totalDurationSeconds,
    stage,
    nextEventText
  };
}
