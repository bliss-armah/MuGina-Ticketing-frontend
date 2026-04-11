'use client';
import { useState, useEffect } from 'react';
import { eventsApi } from '../lib/api';
import toast from 'react-hot-toast';

export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.list()
      .then((res) => setEvents(res.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    eventsApi.getById(id)
      .then((res) => setEvent(res.data))
      .catch(() => toast.error('Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  return { event, loading };
}
