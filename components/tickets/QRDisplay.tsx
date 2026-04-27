'use client';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export function QRDisplay({ value, size = 200, label }: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      {label && <p className="text-xs text-gray-500 text-center font-medium">{label}</p>}
    </div>
  );
}
