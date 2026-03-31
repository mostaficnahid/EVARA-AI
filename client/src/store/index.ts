import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { eventsAPI, guestsAPI, authAPI } from '../api';

// ── Types ─────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  organization?: string;
  role: string;
}

export interface Venue {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
}

export interface AgendaItem {
  time: string;
  title: string;
  speaker?: string;
  duration?: number;
}

export interface Budget {
  total: number;
  spent: number;
  currency: string;
}

export interface Event {
  _id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  venue: Venue;
  category: string;
  status: string;
  expectedGuests: number;
  budget: Budget;
  agenda: AgendaItem[];
  tags: string[];
  color: string;
  aiGenerated?: boolean;
  guests?: Guest[];
  createdAt: string;
}

export interface Guest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  rsvp: string;
  events?: { _id: string; name: string; date: string }[];
}

export interface Stats {
  total: number;
  confirmed: number;
  upcoming: number;
  totalBudget: number;
  totalSpent: number;
  totalGuests: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Auth Store ────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; organization?: string }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem('evara_token', data.token);
        set({ user: data.user, token: data.token, loading: false });
      },

      register: async (formData) => {
        set({ loading: true });
        const { data } = await authAPI.register(formData);
        localStorage.setItem('evara_token', data.token);
        set({ user: data.user, token: data.token, loading: false });
      },

      logout: () => {
        localStorage.removeItem('evara_token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await authAPI.me();
          set({ user: data.user });
        } catch {
          set({ user: null, token: null });
        }
      },
    }),
    { name: 'evara-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);

// ── Events Store ──────────────────────────────────
interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  fetchEvents: (params?: Record<string, string | number>) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  createEvent: (data: Partial<Event>) => Promise<Event>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setSelected: (event: Event | null) => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  selectedEvent: null,
  stats: null,
  loading: false,
  error: null,

  fetchEvents: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data } = await eventsAPI.list(params);
      set({ events: data.events, loading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchStats: async () => {
    const { data } = await eventsAPI.stats();
    set({ stats: data });
  },

  fetchEvent: async (id) => {
    const { data } = await eventsAPI.get(id);
    set({ selectedEvent: data });
  },

  createEvent: async (eventData) => {
    const { data } = await eventsAPI.create(eventData);
    set((s) => ({ events: [...s.events, data] }));
    await get().fetchStats();
    return data;
  },

  updateEvent: async (id, eventData) => {
    const { data } = await eventsAPI.update(id, eventData);
    set((s) => ({
      events: s.events.map((e) => (e._id === id ? data : e)),
      selectedEvent: s.selectedEvent?._id === id ? data : s.selectedEvent,
    }));
  },

  deleteEvent: async (id) => {
    await eventsAPI.delete(id);
    set((s) => ({ events: s.events.filter((e) => e._id !== id), selectedEvent: null }));
    await get().fetchStats();
  },

  setSelected: (event) => set({ selectedEvent: event }),
}));

// ── Guests Store ──────────────────────────────────
interface GuestsState {
  guests: Guest[];
  loading: boolean;
  fetchGuests: (params?: Record<string, string>) => Promise<void>;
  createGuest: (data: Partial<Guest> & { eventId?: string }) => Promise<void>;
  updateGuest: (id: string, data: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
}

export const useGuestsStore = create<GuestsState>((set) => ({
  guests: [],
  loading: false,

  fetchGuests: async (params) => {
    set({ loading: true });
    const { data } = await guestsAPI.list(params);
    set({ guests: data.guests, loading: false });
  },

  createGuest: async (guestData) => {
    const { data } = await guestsAPI.create(guestData);
    set((s) => ({ guests: [...s.guests, data] }));
  },

  updateGuest: async (id, guestData) => {
    const { data } = await guestsAPI.update(id, guestData);
    set((s) => ({ guests: s.guests.map((g) => (g._id === id ? data : g)) }));
  },

  deleteGuest: async (id) => {
    await guestsAPI.delete(id);
    set((s) => ({ guests: s.guests.filter((g) => g._id !== id) }));
  },
}));

// ── AI Chat Store ─────────────────────────────────
interface AIState {
  messages: ChatMessage[];
  isThinking: boolean;
  addMessage: (msg: ChatMessage) => void;
  setThinking: (v: boolean) => void;
  clearChat: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  isThinking: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setThinking: (v) => set({ isThinking: v }),
  clearChat: () => set({ messages: [] }),
}));
