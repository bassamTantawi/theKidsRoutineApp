import { useEffect, useState } from "react";
import type { CalendarEvent } from "../data/calendar";
import { fallbackEvents } from "../data/calendar";

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        } else {
          console.error("Failed to fetch events:", response.statusText);
          setEvents(fallbackEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents(fallbackEvents);
      } finally {
        setEventsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const refreshEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error refreshing events:", error);
    }
  };

  return { events, eventsLoading, refreshEvents, setEvents };
}

