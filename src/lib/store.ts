import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { User, CalendarEvent, ProductType, ChangeType, Team } from '../types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Teams
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  removeTeam: (id: string) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  
  // Calendar events
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'event_id'>) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  
  // Product types
  productTypes: ProductType[];
  addProductType: (productType: Omit<ProductType, 'id'>) => void;
  removeProductType: (id: string) => void;
  
  // Change types
  changeTypes: ChangeType[];
  addChangeType: (changeType: Omit<ChangeType, 'id'>) => void;
  removeChangeType: (id: string) => void;
}

const initialState = {
  templates: [
    {
      id: uuidv4(),
      name: 'Default SOW Template',
      type: 'sow',
      content: `Scope of Work Details\n\n` +
        `Customer: {CustomerName}\n` +
        `Service Order: {SOID}\n` +
        `Service Request: {SRID}\n` +
        `Site Address: {CustomerAddress}\n\n` +
        `Appointment Date: {EventDate}\n` +
        `Time: {EventStartTime} - {EventEndTime}\n\n` +
        `Product Type: {ProductType}\n` +
        `Change Types: {ChangeTypes}\n\n` +
        `Bridge Details:\n{Bridge}\n\n` +
        `Notes:\n{Notes}`,
      is_active: true
    }
  ],
  teams: [],
  users: [],
  events: [],
  productTypes: [],
  changeTypes: []
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // Teams
      teams: [],
      addTeam: async (team) => {
        const newTeam = {
          id: uuidv4(),
          name: team.name,
          created_at: new Date().toISOString()
        };
        set((state) => ({ teams: [...state.teams, newTeam] }));
      },
      removeTeam: async (id) => {
        set((state) => ({
          teams: state.teams.filter((team) => team.id !== id)
        }));
      },
      
      // Users
      users: [],
      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: generateId() }]
      })),
      removeUser: (id) => set((state) => ({
        users: state.users.filter((user) => user.id !== id)
      })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map((user) => 
          user.id === id ? { ...user, ...updates } : user
        )
      })),
      
      // Calendar events
      events: [],
      addEvent: (event) => set((state) => ({
        events: [...state.events, { 
          ...event, 
          id: generateId(),
          event_id: state.events.length + 1
        }]
      })),
      removeEvent: (id) => set((state) => ({
        events: state.events.filter((event) => event.id !== id)
      })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? { ...event, ...updates } : event
        )
      })),
      
      // Product types
      productTypes: [],
      addProductType: (productType) => set((state) => ({
        productTypes: [...state.productTypes, { ...productType, id: generateId() }]
      })),
      removeProductType: (id) => set((state) => ({
        productTypes: state.productTypes.filter((pt) => pt.id !== id)
      })),
      
      // Change types
      changeTypes: [],
      addChangeType: (changeType) => set((state) => ({
        changeTypes: [...state.changeTypes, { ...changeType, id: generateId() }]
      })),
      removeChangeType: (id) => set((state) => ({
        changeTypes: state.changeTypes.filter((ct) => ct.id !== id)
      }))
    }),
    {
      name: 'calendar-tool-storage'
    }
  )
);