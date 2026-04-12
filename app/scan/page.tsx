'use client';
import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { useRequireRole } from '../../hooks/useAuth';
import { useOfflineScanner } from '../../hooks/useOfflineScanner';
import { eventsApi } from '../../lib/api';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { QRScanner } from '../../components/scanner/QRScanner';
import { ScanResult } from '../../components/scanner/ScanResult';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  startDate: string;
  location: string;
}

export default function ScanPage() {
  const { user, isLoading: authLoading } = useRequireRole(['GATE_AGENT', 'ORGANIZER']);

  // Organizer: event list
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Gate agent: manual ID entry
  const [enteredId, setEnteredId] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [idError, setIdError] = useState('');

  // Shared scanner state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeEventId, setActiveEventId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [scanEnabled, setScanEnabled] = useState(false);

  const { handleScan, lastResult, scanning, isOnline, downloadForOffline, syncQueue } =
    useOfflineScanner(activeEventId);

  // Load organizer's own events (organizer path only)
  useEffect(() => {
    if (!user || user.role !== 'ORGANIZER') { setEventsLoading(false); return; }
    eventsApi.dashboard()
      .then((res) => setEvents(res.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setEventsLoading(false));
  }, [user]);

  const activateEvent = (event: Event) => {
    setSelectedEvent(event);
    setActiveEventId(event.id);
    setScanEnabled(true);
  };

  // Gate agent: validate the pasted ID against the API
  const handleLoadEvent = async () => {
    const id = enteredId.trim();
    if (!id) { setIdError('Paste an event ID first'); return; }
    setIdError('');
    setLoadingEvent(true);
    try {
      const res = await eventsApi.getById(id);
      activateEvent(res.data);
    } catch {
      setIdError('Event not found. Check the ID and try again.');
    } finally {
      setLoadingEvent(false);
    }
  };

  const handleStop = () => {
    setScanEnabled(false);
    setSelectedEvent(null);
    setActiveEventId('');
    setEnteredId('');
    setIdError('');
  };

  const handleDownload = async () => {
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

  if (authLoading) return null;

  const isOrganizer = user?.role === 'ORGANIZER';

  return (
    <div className="min-h-screen bg-brand-dark text-white pb-24">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Gate Scanner</h1>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            isOnline ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            {isOnline ? 'Online' : 'Offline Mode'}
          </div>
        </div>

        {!scanEnabled ? (
          isOrganizer ? (
            /* ── ORGANIZER: pick from their own events ────────────── */
            <div className="space-y-3">
              <h2 className="font-bold text-lg text-white/80">Select an event to scan</h2>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-white/10 animate-pulse" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="text-sm">No published events found</p>
                </div>
              ) : (
                events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => activateEvent(event)}
                    className="w-full text-left bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all rounded-2xl p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-gold/20 flex items-center justify-center text-2xl flex-shrink-0">
                      🎪
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(event.startDate), 'MMM d, yyyy · h:mm a')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">📍 {event.location}</p>
                    </div>
                    <span className="ml-auto text-gray-400 flex-shrink-0">›</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* ── GATE AGENT: enter the event ID shared by organizer ── */
            <div className="bg-white/10 rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="font-bold text-lg">Enter Event ID</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Ask the event organizer for the Gate ID and paste it below.
                </p>
              </div>
              <Input
                label="Event ID"
                placeholder="Paste event ID here..."
                value={enteredId}
                onChange={(e) => { setEnteredId(e.target.value); setIdError(''); }}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
              />
              {idError && (
                <p className="text-red-400 text-sm">{idError}</p>
              )}
              <Button fullWidth size="lg" loading={loadingEvent} onClick={handleLoadEvent}>
                Load Event
              </Button>
            </div>
          )
        ) : (
          /* ── Active scanner (both roles) ──────────────────────────── */
          <>
            {selectedEvent && (
              <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="text-xl">🎪</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-white truncate">{selectedEvent.title}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(selectedEvent.startDate), 'MMM d · h:mm a')} · {selectedEvent.location}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={handleDownload} loading={downloading} className="flex-1">
                ⬇️ Offline
              </Button>
              {!isOnline && (
                <Button size="sm" variant="ghost" onClick={handleSync} loading={syncing} className="flex-1">
                  🔄 Sync
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={handleStop}>
                Stop
              </Button>
            </div>

            <div className={`transition-all duration-300 ${scanning ? 'opacity-50' : 'opacity-100'}`}>
              <QRScanner onScan={onScan} enabled={!scanning} />
            </div>

            {lastResult ? (
              <div className="text-2xl">
                <ScanResult status={lastResult.status} message={lastResult.message} />
              </div>
            ) : (
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
