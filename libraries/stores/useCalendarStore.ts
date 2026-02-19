import { useCalendarContext } from "@/libraries/contexts/CalendarContext";

// Re-export the calendar context hook for backward compatibility
export const useCalendarStore = useCalendarContext;

// Re-export types for backward compatibility
export type { CalendarPersistedState } from "@/libraries/contexts/CalendarContext";
