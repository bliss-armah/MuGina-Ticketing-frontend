import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string;
    bannerUrl?: string;
    ticketTypes?: Array<{ price: number }>;
  };
}

export function EventCard({ event }: EventCardProps) {
  const minPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map((t) => t.price))
    : 0;

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform">
        <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-200">
          {event.bannerUrl ? (
            <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-5xl">🎪</div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="warning">
              {format(new Date(event.startDate), 'MMM d')}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 mb-2">
            {event.title}
          </h3>

          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
            <span>📍</span>
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
            <span>🕐</span>
            <span>{format(new Date(event.startDate), 'EEEE, MMMM d · h:mm a')}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {minPrice === 0 ? (
                <span className="text-green-600 font-bold text-sm">Free</span>
              ) : (
                <span className="text-brand-dark font-bold text-sm">
                  From GH₵ {minPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="bg-brand-gold text-white text-xs px-3 py-1.5 rounded-full font-semibold">
              Get Tickets
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
