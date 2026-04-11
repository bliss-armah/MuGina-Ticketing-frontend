'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
  enabled?: boolean;
}

export function QRScanner({ onScan, enabled = true }: QRScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const scannerId = 'mugina-qr-scanner';
    if (!document.getElementById(scannerId)) return;

    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (enabled) onScan(decodedText);
        },
        undefined,
      )
      .then(() => setStarted(true))
      .catch((err) => {
        setError('Camera access denied. Please allow camera permission.');
        console.error(err);
      });

    return () => {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(() => {});
      }
    };
  }, [enabled, onScan]);

  return (
    <div className="relative w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-sm text-red-600">
          📷 {error}
        </div>
      )}
      <div id="mugina-qr-scanner" ref={containerRef} className="w-full rounded-2xl overflow-hidden" />
      {!started && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">Starting camera...</p>
          </div>
        </div>
      )}
    </div>
  );
}
