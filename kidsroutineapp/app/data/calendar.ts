export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  participants?: string[];
  location?: string;
  description?: string;
};

// Fallback events in case API fails (minimal data)
export const fallbackEvents: CalendarEvent[] = [];


