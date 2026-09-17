import React, { useState, useRef, useEffect } from 'react';
import { Camera, ScanLine, Search, Loader2, RefreshCw } from 'lucide-react';
import { fetchProductByBarcode } from '../../services/openFoodFactsService';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Permissão de câmera não concedida ou dispositivo sem câmera. Utilize a digitação manual ou os exemplos rápidos abaixo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleLookup = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    try {
      const product = await fetchProductByBarcode(code.trim());
      onProductFound(product);
    } catch (err: any) {
      alert(err.message || 'Erro ao buscar código de barras.');
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="relative w-full h-56 bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center border border-[#AEBDB5]/30 dark:border-[#394842]">
        {isCameraActive ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
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

        {/* Scan Frame Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-64 h-32 border-2 rounded-2xl relative shadow-lg"
            style={{ borderColor: activeColor.primary }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5 animate-bounce opacity-80"
              style={{ backgroundColor: activeColor.primary }}
            />
            <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold text-white/90 drop-shadow">
              Aponte para o código de barras
            </div>
          </div>
        </div>
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
