'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { eventsApi } from '../../../../lib/api';
import { useRequireRole } from '../../../../hooks/useAuth';
import { Navbar } from '../../../../components/layout/Navbar';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

interface TicketTypeForm {
  name: string;
  description: string;
  price: string;
  quantity: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { isLoading } = useRequireRole('ORGANIZER');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '', location: '', isPublished: false,
  });

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: 'Regular', description: '', price: '', quantity: '' },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', description: '', price: '', quantity: '' }]);
  };

  const updateTicketType = (index: number, field: string, value: string) => {
    setTicketTypes(ticketTypes.map((tt, i) => i === index ? { ...tt, [field]: value } : tt));
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length === 1) return;
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));

      const file = fileRef.current?.files?.[0];
      if (file) formData.append('banner', file);

      const eventRes = await eventsApi.create(formData);
      const eventId = eventRes.data.id;

      // Create ticket types
      await Promise.all(
        ticketTypes
          .filter((tt) => tt.name && tt.price && tt.quantity)
          .map((tt) =>
            eventsApi.addTicketType(eventId, {
              name: tt.name,
              description: tt.description,
              price: Number(tt.price),
              quantity: Number(tt.quantity),
            })
          )
      );

      toast.success('Event created successfully!');
      router.push('/organizer/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-black text-brand-dark mb-6">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <Card>
            <p className="text-sm font-semibold text-gray-700 mb-3">Event Banner</p>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-brand-gold transition-colors overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-1">📸</div>
                  <p className="text-xs">Tap to upload banner</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </Card>

          {/* Event Details */}
          <Card>
            <p className="text-sm font-semibold text-gray-700 mb-4">Event Details</p>
            <div className="space-y-4">
              <Input label="Event Title *" placeholder="e.g. Accra Music Festival 2025" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div>
                <label className="text-sm font-semibold text-gray-700">Description *</label>
                <textarea
                  rows={4}
                  placeholder="Tell people about your event..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-gold focus:outline-none text-sm resize-none"
                />
              </div>
              <Input label="Location *" placeholder="e.g. AICC, Accra" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date & Time *" type="datetime-local" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                <Input label="End Date & Time" type="datetime-local" value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded accent-brand-gold" />
                <span className="text-sm font-medium text-gray-700">Publish immediately</span>
              </label>
            </div>
          </Card>

          {/* Ticket Types */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700">Ticket Types</p>
              <button type="button" onClick={addTicketType}
                className="text-brand-gold text-sm font-semibold">+ Add Type</button>
            </div>
            <div className="space-y-4">
              {ticketTypes.map((tt, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Type {i + 1}</span>
                    {ticketTypes.length > 1 && (
                      <button type="button" onClick={() => removeTicketType(i)}
                        className="text-red-400 text-xs">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Name" placeholder="VIP / Regular" value={tt.name}
                      onChange={(e) => updateTicketType(i, 'name', e.target.value)} />
                    <Input label="Price (GH₵)" type="number" min="0" placeholder="150" value={tt.price}
                      onChange={(e) => updateTicketType(i, 'price', e.target.value)} />
                  </div>
                  <Input label="Quantity" type="number" min="1" placeholder="100" value={tt.quantity}
                    onChange={(e) => updateTicketType(i, 'quantity', e.target.value)} />
                </div>
              ))}
            </div>
          </Card>

          <Button type="submit" fullWidth size="xl" loading={submitting}>
            🚀 Create Event
          </Button>
        </form>
      </main>
    </div>
  );
}
