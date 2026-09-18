import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, ScanLine, Search, Loader2, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { fetchProductByBarcode } from '../../services/localBarcodeService';
import { ProductEvaluation } from '../../types';
import { useTheme } from '../../services/themeService';

interface BarcodeScannerViewProps {
  onProductFound: (product: ProductEvaluation) => void;
}

export const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({ onProductFound }) => {
  const { activeColor } = useTheme();
  const [manualBarcode, setManualBarcode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedSuccessCode, setScannedSuccessCode] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Play audio beep on successful scan
  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not permitted or context unavailable
    }
  };

  const handleLookup = useCallback(async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Prevent re-scanning the same code within 3 seconds
    const now = Date.now();
    if (lastScannedCodeRef.current === cleanCode && now - lastScannedTimeRef.current < 3000) {
      return;
    }

    lastScannedCodeRef.current = cleanCode;
    lastScannedTimeRef.current = now;

    // Play feedback
    playSuccessBeep();
    if (navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {}
    }

    setScannedSuccessCode(cleanCode);
    setIsLoading(true);

    try {
      const product = await fetchProductByBarcode(cleanCode);
      onProductFound(product);
    } catch (err: any) {
      alert(err.message || `Produto com código "${cleanCode}" não encontrado na base de alimentos.`);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setScannedSuccessCode(null);
      }, 2000);
    }
  }, [onProductFound]);

  // Continuous scanning loop using native BarcodeDetector API
  const startDetectionLoop = useCallback(() => {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;

    let detector: any = null;
    if (BarcodeDetectorClass) {
      try {
        detector = new BarcodeDetectorClass({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
        });
      } catch (err) {
        console.warn('BarcodeDetector instantiation failed:', err);
      }
    }

    let scanInterval: any = null;

    if (detector) {
      scanInterval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || isScanningRef.current) {
          return;
        }

        try {
          isScanningRef.current = true;
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue && rawValue !== lastScannedCodeRef.current) {
              handleLookup(rawValue);
            }
          }
        } catch {
          // Frame detection dropped
        } finally {
          isScanningRef.current = false;
        }
      }, 200);
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [handleLookup]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        setTorchSupported(true);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Permissão de câmera não concedida ou dispositivo sem câmera. Utilize a digitação manual ou os exemplos rápidos abaixo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchEnabled;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setTorchEnabled(nextState);
      } catch (err) {
        console.warn('Error toggling flashlight:', err);
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      const cleanup = startDetectionLoop();
      return cleanup;
    }
  }, [isCameraActive, startDetectionLoop]);

  // Sample quick barcodes
  const sampleBarcodes = [
    { name: 'Chocolate 75% Cacau Amma', code: '7898943180015', score: 65, color: 'bg-[#E5A93C]' },
    { name: 'Macarrão SYMBOL', code: '7898099887766', score: 72, color: 'bg-emerald-500' },
    { name: 'Leite Piracanjuba Zero Lactose', code: '7898215150022', score: 80, color: 'bg-emerald-500' }
  ];

  return (
    <div
      className="flex-1 min-h-0 h-full flex flex-col px-4 pt-3 pb-24 overflow-y-auto touch-pan-y bg-[#F7F4EE] dark:bg-[#18201D] transition-colors"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Viewfinder Frame */}
      <div className="relative w-full h-64 bg-slate-950 rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center border border-[#AEBDB5]/30 dark:border-[#394842]">
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {/* Flashlight toggle if supported */}
            {torchSupported && (
              <button
                onClick={toggleTorch}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                  torchEnabled ? 'bg-amber-400 text-slate-900' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title="Alternar Lanterna"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center p-4">
            <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 max-w-xs">
              {cameraError || 'Iniciando câmera para leitura de código de barras...'}
            </p>
            {cameraError && (
              <button
                onClick={startCamera}
                className="mt-3 px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar Novamente
              </button>
            )}
          </div>
        )}

        {/* Scan Target Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`w-64 h-36 border-2 rounded-2xl relative transition-all duration-300 ${
              scannedSuccessCode ? 'border-emerald-500 bg-emerald-500/20 scale-105' : ''
            }`}
            style={{ borderColor: scannedSuccessCode ? '#10b981' : activeColor.primary }}
          >
            {/* Animated scan laser */}
            {!scannedSuccessCode && (
              <div
                className="absolute top-0 left-0 right-0 h-0.5 animate-bounce opacity-90 shadow-sm"
                style={{ backgroundColor: activeColor.primary }}
              />
            )}

            {scannedSuccessCode ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8 animate-pulse mb-1" />
                <span className="text-xs font-bold font-mono text-white bg-black/60 px-2 py-0.5 rounded-full">
                  {scannedSuccessCode}
                </span>
              </div>
            ) : (
              <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold text-white/90 drop-shadow">
                Posicione o código de barras no centro
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold">Consultando produto...</span>
          </div>
        )}
      </div>

      {/* Manual Input */}
      <div className="mt-4">
        <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1.5">
          Ou digite o código de barras (EAN-13 / UPC)
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Ex: 7898943180015"
            className="w-full pl-4 pr-12 py-2.5 bg-white dark:bg-[#232D29] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-full text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 focus:outline-none focus:border-[#6F7C76] shadow-2xs font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleLookup(manualBarcode)}
          />
          <button
            onClick={() => handleLookup(manualBarcode)}
            disabled={isLoading || !manualBarcode.trim()}
            className="absolute right-1.5 w-8 h-8 rounded-full text-white flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40 shadow-xs"
            style={{ backgroundColor: activeColor.primary }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Test Barcodes matching Screen 5f */}
      <div className="mt-5 pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842]">
        <span className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wider block mb-2">
          Testar com produtos reais do design:
        </span>
        <div className="space-y-2">
          {sampleBarcodes.map((item) => (
            <button
              key={item.code}
              onClick={() => handleLookup(item.code)}
              className="w-full p-3 bg-white dark:bg-[#232D29] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl flex items-center justify-between text-left transition-transform active:scale-98 shadow-2xs"
            >
              <div>
                <span className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-xs block">{item.name}</span>
                <span className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-mono">Código: {item.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-extrabold text-white px-2 py-0.5 rounded-lg ${item.color}`}>
                  Score {item.score}
                </span>
                <ScanLine className="w-4 h-4 text-[#6F7C76] dark:text-[#A8B8B1]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
