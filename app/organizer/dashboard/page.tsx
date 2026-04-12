'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { eventsApi } from '../../../lib/api';
import { useRequireRole } from '../../../hooks/useAuth';
import { Navbar } from '../../../components/layout/Navbar';
import { BottomNav } from '../../../components/layout/BottomNav';
import { DashboardStats } from '../../../components/organizer/DashboardStats';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';

export default function OrganizerDashboardPage() {
  const { user, isLoading } = useRequireRole('ORGANIZER');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.dashboard()
      .then((res) => setEvents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalTicketsSold = events.reduce((sum, e) =>
    sum + (e.ticketTypes?.reduce((s: number, tt: any) => s + tt.soldCount, 0) || 0), 0);
  const totalRevenue = events.reduce((sum, e) =>
    sum + (e.ticketTypes?.reduce((s: number, tt: any) => s + tt.soldCount * Number(tt.price), 0) || 0), 0);

  const stats = [
    { label: 'Total Events', value: events.length, icon: '🎪' },
    { label: 'Tickets Sold', value: totalTicketsSold, icon: '🎫' },
    { label: 'Revenue (GH₵)', value: totalRevenue.toFixed(0), icon: '💰' },
    { label: 'Published', value: events.filter((e) => e.isPublished).length, icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-brand-dark">Dashboard</h1>
            <p className="text-gray-500 text-sm">Welcome, {user?.firstName}</p>
          </div>
          <Link href="/organizer/events/create">
            <Button size="sm">+ Create Event</Button>
          </Link>
        </div>

        <DashboardStats stats={stats} />

        <div>
          <h2 className="font-bold text-gray-800 mb-3">Your Events</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 shimmer" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="text-center py-8">
              <div className="text-3xl mb-2">🎪</div>
              <p className="text-gray-500 text-sm">No events yet. Create your first event!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const sold = event.ticketTypes?.reduce((s: number, tt: any) => s + tt.soldCount, 0) || 0;
                const total = event.ticketTypes?.reduce((s: number, tt: any) => s + tt.quantity, 0) || 0;
                const revenue = event.ticketTypes?.reduce((s: number, tt: any) => s + tt.soldCount * Number(tt.price), 0) || 0;

                const copyGateId = () => {
                  navigator.clipboard.writeText(event.id);
                  toast.success('Event ID copied — share with your gate agents');
                };

                return (
                  <Card key={event.id} padding="md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={event.isPublished ? 'success' : 'neutral'}>
                            {event.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm truncate">{event.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-gray-500">{sold}/{total} sold</span>
                          <span className="text-xs font-semibold text-green-600">GH₵ {revenue.toFixed(2)}</span>
                        </div>
                      </div>

                      {event.isPublished && (
                        <button
                          onClick={copyGateId}
                          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-brand-gold border border-brand-gold/40 rounded-xl px-3 py-1.5 hover:bg-brand-gold/10 active:scale-95 transition-all"
                        >
                          🔑 Copy Gate ID
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
