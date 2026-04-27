'use client';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { useEvent } from '../../../hooks/useEvents';
import { Navbar } from '../../../components/layout/Navbar';
import { BottomNav } from '../../../components/layout/BottomNav';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useAuthStore } from '../../../store/auth.store';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { event, loading } = useEvent(id);
  const { user } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto">
          <Skeleton className="h-64 w-full rounded-none" />
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const handleBuyTickets = () => {
    if (!user) { router.push(`/events/${id}/guest-checkout`); return; }
    router.push(`/events/${id}/checkout`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-br from-primary/30 to-primary/60">
        {event.bannerUrl && (
          <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="warning">{format(new Date(event.startDate), 'EEE, MMM d yyyy')}</Badge>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-brand-dark leading-tight">{event.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
            <span>📍</span><span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <span>🕐</span><span>{format(new Date(event.startDate), 'EEEE, MMMM d · h:mm a')}</span>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-2">About this event</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
        </div>

        {/* Ticket Types */}
        {event.ticketTypes?.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">Ticket Options</h2>
            <div className="space-y-2">
              {event.ticketTypes.map((tt: any) => (
                <div key={tt.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{tt.name}</p>
                    {tt.description && <p className="text-xs text-gray-500 mt-0.5">{tt.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{tt.availableCount ?? tt.quantity - tt.soldCount} remaining</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-brand-dark">
                      {tt.price === 0 ? 'Free' : `GH₵ ${Number(tt.price).toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky buy button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-bottom">
        <div className="max-w-lg mx-auto space-y-2">
          <Button fullWidth size="xl" onClick={handleBuyTickets}>
            🎫 Get Tickets
          </Button>
          {!user && (
            <button
              onClick={() => router.push(`/login?redirect=/events/${id}/checkout`)}
              className="w-full text-center text-sm text-gray-500"
            >
              Have an account?{' '}
              <span className="text-brand-gold font-semibold">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
