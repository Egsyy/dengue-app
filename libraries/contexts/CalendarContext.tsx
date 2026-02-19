"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// Extend dayjs with plugins
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export type CalendarPersistedState = {
  /** Stored as YYYY-MM-DD for safe serialization */
  selectedDateISO: string | null;
  /** Stored as YYYY-MM-DD for safe serialization */
  latestDateISO: string | null;
  setSelectedDateISO: (iso: string | null) => void;
  setLatestDateISO: (iso: string | null) => void;
  clearSelectedDate: () => void;

  // Derived getters (methods)
  selectedDate: Date | null;
  selectDate: (date: Date) => void;
  isoWeek: number | null;
  isoYear: number | null;
  /** Always returns a valid YYYY-MM-DD string (falls back if not selected yet) */
  getStringDate: string;
  getWeekDateRange: () => Date[] | null;
  getWeekDateRangeString: () => string;
  isInISOWeekRange: (dateString: string) => boolean;
  isDateIsDisabled: (date: Date) => boolean;
  addLatestWeatherPooledDate: (date: Date) => void;

  // Add hydration flag
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

interface CalendarContextType extends CalendarPersistedState {}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  children,
}) => {
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);
  const [latestDateISO, setLatestDateISO] = useState<string | null>(null);
  const [_hasHydrated, setHasHydrated] = useState<boolean>(false);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const persistedState = localStorage.getItem("dengue-watch:calendar");
        if (persistedState) {
          const parsedState = JSON.parse(persistedState);
          if (parsedState.selectedDateISO) {
            setSelectedDateISO(parsedState.selectedDateISO);
          }
          if (parsedState.latestDateISO) {
            setLatestDateISO(parsedState.latestDateISO);
          }
        }
      } catch (error) {
        console.error(
          "Failed to load calendar state from localStorage:",
          error,
        );
      }
      setHasHydrated(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (_hasHydrated && typeof window !== "undefined") {
      try {
        const stateToPersist = {
          selectedDateISO,
          latestDateISO,
        };
        localStorage.setItem(
          "dengue-watch:calendar",
          JSON.stringify(stateToPersist),
        );
      } catch (error) {
        console.error("Failed to save calendar state to localStorage:", error);
      }
    }
  }, [selectedDateISO, latestDateISO, _hasHydrated]);

  // Context value with all the methods and computed properties
  const contextValue: CalendarContextType = {
    selectedDateISO,
    latestDateISO,
    _hasHydrated,

    setHasHydrated,

    setSelectedDateISO: (iso) => {
      console.log("🔧 setSelectedDateISO called with:", iso);
      setSelectedDateISO(iso);
    },

    setLatestDateISO: (iso) => {
      setLatestDateISO(iso);
    },

    clearSelectedDate: () => {
      setSelectedDateISO(null);
    },

    // Computed property
    get selectedDate() {
      return selectedDateISO ? new Date(selectedDateISO) : null;
    },

    // Action to select a date
    selectDate: (date: Date) => {
      const formatted = dayjs(date).format("YYYY-MM-DD");
      console.log("🎯 selectDate called!", { date, formatted });
      setSelectedDateISO(formatted);
      console.log("📊 New selectedDateISO:", selectedDateISO);
    },

    // Get ISO week number
    get isoWeek() {
      return selectedDateISO ? dayjs(selectedDateISO).isoWeek() : null;
    },

    // Get ISO year
    get isoYear() {
      return selectedDateISO ? dayjs(selectedDateISO).isoWeekYear() : null;
    },

    // Get string date in YYYY-MM-DD format
    get getStringDate() {
      // Never return null/undefined to avoid API calls sending invalid dates.
      // Preference order: selected date -> latest pooled date -> today.
      return dayjs(selectedDateISO ?? latestDateISO ?? new Date()).format(
        "YYYY-MM-DD",
      );
    },

    // Get the date range for the current ISO week
    getWeekDateRange: () => {
      if (!selectedDateISO) return null;

      const selectedDayjs = dayjs(selectedDateISO);
      const startOfWeek = selectedDayjs.startOf("isoWeek");
      const dates: Date[] = [];

      for (let i = 0; i < 7; i++) {
        dates.push(startOfWeek.add(i, "day").toDate());
      }

      return dates;
    },

    // Get the date range as a string
    getWeekDateRangeString: () => {
      const dates = contextValue.getWeekDateRange();
      if (!dates) return "";
      return dates.map((d) => dayjs(d).format("YYYY-MM-DD")).join(" ");
    },

    // Check if a date string is in the same ISO week as the selected date
    isInISOWeekRange: (dateString: string) => {
      if (!selectedDateISO) return false;

      const selectedDayjs = dayjs(selectedDateISO);
      const dateDayjs = dayjs(dateString);

      return (
        selectedDayjs.isoWeek() === dateDayjs.isoWeek() &&
        selectedDayjs.isoWeekYear() === dateDayjs.isoWeekYear()
      );
    },

    // Check if a date is disabled (after the latest pooled date)
    isDateIsDisabled: (date: Date) => {
      const cutoff = dayjs().add(1, "year").startOf("isoWeek");

      return (
        dayjs(date).isSame(cutoff, "day") || dayjs(date).isAfter(cutoff, "day")
      );
    },

    // Add the latest weather pooled date
    addLatestWeatherPooledDate: (date: Date) => {
      setLatestDateISO(dayjs(date).format("YYYY-MM-DD"));
    },
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Hook to use the calendar context
export const useCalendarContext = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider",
    );
  }
  return context;
};
