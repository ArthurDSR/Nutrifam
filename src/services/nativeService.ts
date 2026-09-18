import { isCapacitorNative } from './healthSyncService';

/**
 * Initializes native Capacitor features (Status Bar, Splash Screen)
 */
export async function initializeNativeApp(isDark: boolean): Promise<void> {
  if (!isCapacitorNative()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    });
    await StatusBar.setBackgroundColor({
      color: isDark ? '#18201D' : '#F7F4EE'
    });
  } catch (err) {
    console.debug('Native status bar not configured:', err);
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (err) {
    console.debug('Native splash screen not configured:', err);
  }
}

/**
 * Update native status bar style when theme changes
 */
export async function updateNativeStatusBar(isDark: boolean): Promise<void> {
  if (!isCapacitorNative()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    });
    await StatusBar.setBackgroundColor({
      color: isDark ? '#18201D' : '#F7F4EE'
    });
  } catch {}
}

/**
 * Setup hardware back button handler for Android
 */
export function setupAndroidBackButton(onBack: () => boolean): () => void {
  if (!isCapacitorNative()) return () => {};

  let removeListener: (() => void) | undefined;

  import('@capacitor/app').then(({ App: CapApp }) => {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      const handled = onBack();
      if (!handled && !canGoBack) {
        CapApp.exitApp();
      }
    }).then((handle) => {
      removeListener = () => handle.remove();
    });
  }).catch(() => {});

  return () => {
    if (removeListener) removeListener();
  };
}
