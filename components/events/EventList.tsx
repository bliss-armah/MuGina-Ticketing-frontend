import { EventCard } from './EventCard';
import { EventCardSkeleton } from '../ui/Skeleton';

interface EventListProps {
  events: any[];
  loading: boolean;
}

export function EventList({ events, loading }: EventListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🎪</div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">No Events Yet</h3>
        <p className="text-gray-400 text-sm">Check back soon for upcoming events!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => <EventCard key={event.id} event={event} />)}
    </div>
  );
}
