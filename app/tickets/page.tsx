'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ticketsApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from '../../components/layout/Navbar';
import { BottomNav } from '../../components/layout/BottomNav';
import { TicketCard } from '../../components/tickets/TicketCard';
import { TicketSkeleton } from '../../components/ui/Skeleton';

export default function MyTicketsPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('Payment successful! Your tickets are ready.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    ticketsApi.myTickets()
      .then((res) => setTickets(res.data))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-brand-dark mb-6">My Tickets</h1>

        {loading || authLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <TicketSkeleton key={i} />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Tickets Yet</h3>
            <p className="text-gray-400 text-sm">Buy tickets to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
