'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useEvent } from '../../../../hooks/useEvents';
import { useAuth } from '../../../../hooks/useAuth';
import { ordersApi } from '../../../../lib/api';
import { Navbar } from '../../../../components/layout/Navbar';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { event, loading: eventLoading } = useEvent(id);
  const { user } = useAuth(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [processing, setProcessing] = useState(false);

  const updateQty = (ticketTypeId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const next = Math.max(0, Math.min(current + delta, 10));
      return { ...prev, [ticketTypeId]: next };
    });
  };

  const totalAmount = event?.ticketTypes?.reduce((sum: number, tt: any) => {
    return sum + (quantities[tt.id] || 0) * Number(tt.price);
  }, 0) || 0;

  const hasItems = Object.values(quantities).some((q) => q > 0);

  const handleCheckout = async () => {
    if (!hasItems) { toast.error('Select at least one ticket'); return; }
    if (!user) { router.push('/login'); return; }

    setProcessing(true);
    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

      const callbackUrl = `${window.location.origin}/tickets?payment=success`;
      const res = await ordersApi.create({ eventId: id, items, callbackUrl });
      const { payment } = res.data;

      if (payment?.authorizationUrl) {
        window.location.href = payment.authorizationUrl;
      } else {
        toast.error('Could not initiate payment');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (eventLoading || !event) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-black text-brand-dark">Select Tickets</h1>
        <p className="text-gray-500 text-sm">{event.title}</p>

        <div className="space-y-3">
          {event.ticketTypes?.map((tt: any) => {
            const qty = quantities[tt.id] || 0;
            const available = tt.quantity - tt.soldCount;

            return (
              <Card key={tt.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{tt.name}</p>
                    {tt.description && <p className="text-xs text-gray-500 mt-0.5">{tt.description}</p>}
                    <p className="font-black text-brand-dark mt-1">
                      {tt.price === 0 ? 'Free' : `GH₵ ${Number(tt.price).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-gray-400">{available} available</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(tt.id, -1)}
                      disabled={qty === 0}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold disabled:opacity-30 active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-black text-lg">{qty}</span>
                    <button
                      onClick={() => updateQty(tt.id, 1)}
                      disabled={qty >= available || qty >= 10}
                      className="w-10 h-10 rounded-full bg-brand-gold text-white flex items-center justify-center text-xl font-bold disabled:opacity-30 active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Order summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-xl font-black text-brand-dark">GH₵ {totalAmount.toFixed(2)}</span>
          </div>
          <Button fullWidth size="lg" onClick={handleCheckout} loading={processing} disabled={!hasItems}>
            💳 Pay with Mobile Money
          </Button>
        </div>
      </div>
    </div>
  );
}
