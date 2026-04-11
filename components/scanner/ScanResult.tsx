import { clsx } from 'clsx';
import type { ScanStatus } from '../../hooks/useOfflineScanner';

interface ScanResultProps {
  status: ScanStatus;
  message: string;
}

export function ScanResult({ status, message }: ScanResultProps) {
  const configs = {
    valid: {
      bg: 'bg-green-500',
      icon: '✅',
      label: 'VALID',
      text: 'text-white',
    },
    offline_valid: {
      bg: 'bg-green-500',
      icon: '✅',
      label: 'VALID (Offline)',
      text: 'text-white',
    },
    already_used: {
      bg: 'bg-red-500',
      icon: '❌',
      label: 'ALREADY USED',
      text: 'text-white',
    },
    invalid: {
      bg: 'bg-yellow-500',
      icon: '⚠️',
      label: 'INVALID',
      text: 'text-white',
    },
    offline_invalid: {
      bg: 'bg-yellow-500',
      icon: '⚠️',
      label: 'INVALID',
      text: 'text-white',
    },
  };

  const config = status ? configs[status] : null;
  if (!config) return null;

  return (
    <div className={clsx('rounded-2xl p-6 text-center', config.bg, config.text)}>
      <div className="text-5xl mb-2">{config.icon}</div>
      <div className="text-2xl font-black tracking-wide mb-1">{config.label}</div>
      <div className="text-sm opacity-90">{message}</div>
    </div>
  );
}
