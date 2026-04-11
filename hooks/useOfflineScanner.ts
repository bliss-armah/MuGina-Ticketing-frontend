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
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const vibrate = (pattern: number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const validateOnline = useCallback(async (qrPayload: string): Promise<{ status: ScanStatus; message: string }> => {
    const response = await scannerApi.validate({ qrPayload, eventId });
    return response.data;
  }, [eventId]);

  const validateOffline = useCallback(async (qrPayload: string): Promise<{ status: ScanStatus; message: string }> => {
    try {
      // Extract ticket ID from payload
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
      let result: { status: ScanStatus; message: string };

      if (navigator.onLine) {
        result = await validateOnline(qrPayload);
      } else {
        result = await validateOffline(qrPayload);
      }

      setLastResult(result);

      if (result.status === 'valid' || result.status === 'offline_valid') {
        vibrate([100, 50, 100]);
      } else {
        vibrate([300]);
      }
    } catch {
      const offline = await validateOffline(qrPayload);
      setLastResult(offline);
    } finally {
      setTimeout(() => setScanning(false), 1500);
    }
  }, [scanning, validateOnline, validateOffline]);

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

  return { handleScan, lastResult, scanning, isOnline, downloadForOffline, syncQueue };
}
