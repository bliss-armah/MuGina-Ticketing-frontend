'use client';
import { useState, useCallback } from 'react';
import { scannerApi } from '../lib/api';
import {
  getCachedEventTickets,
  cacheEventTickets,
  markTicketUsedOffline,
  queueOfflineScan,
  getOfflineScanQueue,
  clearScanQueue,
} from '../lib/offline';

export type ScanStatus = 'valid' | 'already_used' | 'invalid' | 'offline_valid' | 'offline_invalid' | null;

export function useOfflineScanner(eventId: string) {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{ status: ScanStatus; message: string } | null>(null);
  const [isOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const vibrate = (pattern: number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const clearResult = useCallback(() => {
    setLastResult(null);
    setScanning(false);
  }, []);

  const validateOnline = useCallback(async (qrPayload: string): Promise<{ status: ScanStatus; message: string }> => {
    const response = await scannerApi.validate({ qrPayload, eventId });
    return response.data;
  }, [eventId]);

  const validateOffline = useCallback(async (qrPayload: string): Promise<{ status: ScanStatus; message: string }> => {
    try {
      const [encoded] = qrPayload.split('.');
      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
      const ticketId = decoded.ticketId;

      const cached = await getCachedEventTickets(eventId);
      if (!cached) {
        return { status: 'offline_invalid', message: 'No offline data. Connect to download tickets.' };
      }

      const ticket = cached.find((t) => t.id === ticketId);
      if (!ticket) {
        return { status: 'offline_invalid', message: 'Ticket not found in offline cache' };
      }

      if (ticket.isUsed) {
        return { status: 'already_used', message: 'Ticket already used' };
      }

      await markTicketUsedOffline(eventId, ticketId);
      await queueOfflineScan({ qrPayload, eventId, scannedAt: new Date().toISOString(), localResult: 'valid' });
      return { status: 'offline_valid', message: 'Valid (offline mode — will sync)' };
    } catch {
      return { status: 'offline_invalid', message: 'Could not validate ticket offline' };
    }
  }, [eventId]);

  const handleScan = useCallback(async (qrPayload: string) => {
    if (scanning) return;
    setScanning(true);

    try {
      const result = navigator.onLine
        ? await validateOnline(qrPayload)
        : await validateOffline(qrPayload);

      setLastResult(result);
      vibrate(result.status === 'valid' || result.status === 'offline_valid' ? [100, 50, 100] : [300]);
    } catch {
      const fallback = await validateOffline(qrPayload);
      setLastResult(fallback);
    }
  }, [scanning, validateOnline, validateOffline]);

  const handlePinScan = useCallback(async (pin: string) => {
    if (scanning) return;
    setScanning(true);

    try {
      if (!navigator.onLine) {
        setLastResult({ status: 'offline_invalid', message: 'PIN validation requires an internet connection' });
        return;
      }
      const response = await scannerApi.validatePin({ pin, eventId });
      setLastResult(response.data);
      vibrate(response.data.status === 'valid' ? [100, 50, 100] : [300]);
    } catch {
      setLastResult({ status: 'invalid', message: 'Could not validate PIN' });
    }
  }, [scanning, eventId]);

  const downloadForOffline = useCallback(async () => {
    const response = await scannerApi.getEventTickets(eventId);
    await cacheEventTickets(eventId, response.data);
    return response.data.length;
  }, [eventId]);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const queue = await getOfflineScanQueue();
    for (const scan of queue) {
      try {
        await scannerApi.validate({ qrPayload: scan.qrPayload, eventId: scan.eventId });
      } catch {
        // ticket may already be processed
      }
    }
    await clearScanQueue();
  }, []);

  return { handleScan, handlePinScan, clearResult, lastResult, scanning, isOnline, downloadForOffline, syncQueue };
}
