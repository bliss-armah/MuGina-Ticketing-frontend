'use client';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { Navbar } from '../components/layout/Navbar';
import { BottomNav } from '../components/layout/BottomNav';
import { EventList } from '../components/events/EventList';
import { useEvents } from '../hooks/useEvents';

export default function HomePage() {
  const { initialize } = useAuthStore();
  const { events, loading } = useEvents();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-brand-dark leading-tight">
            Upcoming <span className="text-brand-gold">Events</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Buy tickets with mobile money</p>
        </div>

        <EventList events={events} loading={loading} />
      </main>

      <BottomNav />
    </div>
  );
}
