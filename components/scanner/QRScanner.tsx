'use client';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (result: string) => void;
  enabled?: boolean;
}

export function QRScanner({ onScan, enabled = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Keep onScan in a ref so the animation-frame loop never captures a stale closure
  const onScanRef = useRef(onScan);
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    function tick() {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code?.data) {
        onScanRef.current(code.data);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          tick();
        }
      } catch {
        setError('Camera access denied. Please allow camera permission.');
      }
    }

    start();

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [enabled]);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-900">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <p className="text-red-400 text-sm text-center">📷 {error}</p>
        </div>
      ) : (
        <>
          {/* Single video element — no visible canvas */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
          {/* Hidden canvas used only for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {ready ? (
            /* Scan-area overlay */
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Dark vignette outside the scan box */}
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative w-56 h-56 bg-transparent">
                {/* Clear hole — cut out the vignette */}
                <div className="absolute inset-0 bg-transparent mix-blend-normal" />
                {/* Corner markers */}
                <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-brand-gold rounded-tl-xl" />
                <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-brand-gold rounded-tr-xl" />
                <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-brand-gold rounded-bl-xl" />
                <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-brand-gold rounded-br-xl" />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Starting camera…</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
