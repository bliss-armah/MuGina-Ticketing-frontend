'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useEvent } from '../../../../hooks/useEvents';
import { ordersApi } from '../../../../lib/api';
import { Navbar } from '../../../../components/layout/Navbar';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';

interface GuestInfo {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

interface FieldErrors {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

function validate(info: GuestInfo): FieldErrors {
  const errors: FieldErrors = {};
  if (info.guestName.trim().length < 2) errors.guestName = 'Enter your full name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.guestEmail)) errors.guestEmail = 'Enter a valid email';
  if (!/^\d{10,15}$/.test(info.guestPhone.replace(/\s/g, '')))
    errors.guestPhone = 'Enter a valid phone number (10–15 digits)';
  return errors;
}

export default function GuestCheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { event, loading: eventLoading } = useEvent(id);

  const [info, setInfo] = useState<GuestInfo>({ guestName: '', guestEmail: '', guestPhone: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [processing, setProcessing] = useState(false);

  const updateQty = (ticketTypeId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const next = Math.max(0, Math.min(current + delta, 10));
      return { ...prev, [ticketTypeId]: next };
    });
  };

  const totalAmount =
    event?.ticketTypes?.reduce((sum: number, tt: any) => {
      return sum + (quantities[tt.id] || 0) * Number(tt.price);
    }, 0) || 0;

  const hasItems = Object.values(quantities).some((q) => q > 0);

  const handleCheckout = async () => {
    const errors = validate(info);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (!hasItems) {
      toast.error('Select at least one ticket');
      return;
    }

    setProcessing(true);
    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

      const callbackUrl = `${window.location.origin}/tickets/guest?payment=success`;
      const res = await ordersApi.createGuest({ ...info, eventId: id, items, callbackUrl });
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

  const setField = (field: keyof GuestInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfo((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (eventLoading || !event) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-black text-brand-dark">Continue as Guest</h1>
          <p className="text-gray-500 text-sm mt-1">{event.title}</p>
        </div>

        {/* Guest details */}
        <Card>
          <h2 className="font-bold text-gray-800 mb-4">Your Details</h2>
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Kwame Mensah"
              value={info.guestName}
              onChange={setField('guestName')}
              error={fieldErrors.guestName}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="kwame@example.com"
              value={info.guestEmail}
              onChange={setField('guestEmail')}
              error={fieldErrors.guestEmail}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="0201234567"
              value={info.guestPhone}
              onChange={setField('guestPhone')}
              error={fieldErrors.guestPhone}
              hint="Entry PINs will be sent to this number via SMS"
            />
          </div>
        </Card>

        {/* Ticket selection */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">Select Tickets</h2>
          <div className="space-y-3">
            {event.ticketTypes?.map((tt: any) => {
              const qty = quantities[tt.id] || 0;
              const available = tt.quantity - tt.soldCount;

              return (
                <Card key={tt.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{tt.name}</p>
                      {tt.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{tt.description}</p>
                      )}
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

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={() => router.push(`/login?redirect=/events/${id}/checkout`)}
            className="text-brand-gold font-semibold"
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Order summary bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 font-medium">Total</span>
            <span className="text-xl font-black text-brand-dark">GH₵ {totalAmount.toFixed(2)}</span>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={handleCheckout}
            loading={processing}
            disabled={!hasItems}
          >
            Pay with Mobile Money
          </Button>
        </div>
      </div>
    </div>
  );
}
