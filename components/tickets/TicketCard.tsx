'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import { QRDisplay } from './QRDisplay';
import { Button } from '../ui/Button';

interface TicketCardProps {
  ticket: {
    id: string;
    status: string;
    isUsed: boolean;
    qrPayload: string;
    qrImageUrl?: string;
    createdAt: string;
    order?: any;
  };
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);

  const statusVariant = ticket.isUsed ? 'neutral' : ticket.status === 'ACTIVE' ? 'success' : 'error';
  const statusLabel = ticket.isUsed ? 'Used' : ticket.status;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Ticket tear-off style */}
      <div className="bg-brand-dark p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-brand-gold font-black text-sm tracking-wider">MuGina</span>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        <p className="font-bold text-base truncate">
          {ticket.order?.event?.title || 'Event Ticket'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {ticket.order?.event?.location && `📍 ${ticket.order.event.location}`}
        </p>
      </div>

      {/* Dashed line separator */}
      <div className="relative h-px bg-gray-200">
        <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-200" />
        <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-200" />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div>
            <p className="text-xs text-gray-400">Ticket ID</p>
            <p className="font-mono text-xs font-bold">{ticket.id.substring(0, 8).toUpperCase()}...</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Purchased</p>
            <p className="font-medium text-xs">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</p>
          </div>
        </div>

        <Button
          variant={showQR ? 'secondary' : 'primary'}
          size="sm"
          fullWidth
          onClick={() => setShowQR(!showQR)}
          disabled={ticket.isUsed}
        >
          {showQR ? 'Hide QR Code' : '📱 Show QR Code'}
        </Button>

        {showQR && !ticket.isUsed && (
          <div className="mt-4 flex justify-center">
            <QRDisplay value={ticket.qrPayload} size={180} label="Show this at the gate" />
          </div>
        )}

        {ticket.isUsed && (
          <div className="mt-3 text-center text-xs text-gray-400 bg-gray-50 rounded-xl py-2">
            ✅ This ticket has been scanned
          </div>
        )}
      </div>
    </div>
  );
}
