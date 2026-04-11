'use client';
import { useState, useCallback } from 'react';
import { useRequireRole } from '../../hooks/useAuth';
import { useOfflineScanner } from '../../hooks/useOfflineScanner';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { QRScanner } from '../../components/scanner/QRScanner';
import { ScanResult } from '../../components/scanner/ScanResult';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const { user, isLoading } = useRequireRole('GATE_AGENT');
  const [eventId, setEventId] = useState('');
  const [activeEventId, setActiveEventId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [scanEnabled, setScanEnabled] = useState(false);

  const { handleScan, lastResult, scanning, isOnline, downloadForOffline, syncQueue } =
    useOfflineScanner(activeEventId);

  const handleStartScanning = () => {
    if (!eventId.trim()) { toast.error('Enter an event ID first'); return; }
    setActiveEventId(eventId.trim());
    setScanEnabled(true);
  };

  const handleDownload = async () => {
    if (!activeEventId) return;
    setDownloading(true);
    try {
      const count = await downloadForOffline();
      toast.success(`Downloaded ${count} tickets for offline use`);
    } catch {
      toast.error('Download failed. Check connection.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncQueue();
      toast.success('Offline scans synced');
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const onScan = useCallback((payload: string) => {
    if (!scanning) handleScan(payload);
  }, [scanning, handleScan]);

  return (
    <div className="min-h-screen bg-brand-dark text-white pb-24">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Status bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Gate Scanner</h1>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isOnline ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            {isOnline ? 'Online' : 'Offline Mode'}
          </div>
        </div>

        {/* Event setup */}
        {!scanEnabled ? (
          <div className="bg-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-lg">Set Up Scanner</h2>
            <Input
              label="Event ID"
              placeholder="Paste event ID here..."
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
            />
            <Button fullWidth size="lg" onClick={handleStartScanning}>
              📷 Start Scanning
            </Button>
          </div>
        ) : (
          <>
            {/* Scanner controls */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                loading={downloading}
                className="flex-1"
              >
                ⬇️ Download Offline
              </Button>
              {!isOnline && (
                <Button size="sm" variant="ghost" onClick={handleSync} loading={syncing} className="flex-1">
                  🔄 Sync Queue
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={() => { setScanEnabled(false); setActiveEventId(''); }}>
                Stop
              </Button>
            </div>

            {/* Scanner */}
            <div className={`transition-all duration-300 ${scanning ? 'opacity-50' : 'opacity-100'}`}>
              <QRScanner onScan={onScan} enabled={scanEnabled && !scanning} />
            </div>

            {/* Scan result - large for visibility in sunlight */}
            {lastResult && (
              <div className="text-2xl">
                <ScanResult status={lastResult.status} message={lastResult.message} />
              </div>
            )}

            {/* Instructions */}
            {!lastResult && (
              <div className="text-center text-gray-400 py-4">
                <p className="text-4xl mb-2">📷</p>
                <p className="text-sm">Point camera at QR code to scan</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
