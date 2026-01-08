import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { User, CalendarEvent, ProductType, ChangeType, Team, AccelerationField, Template } from '../types';

type Theme = 'light' | 'dark';

interface StandardSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  totalSlots: number;
  teamId?: string;
  slotsBitmap: number[];
}

interface BlockedDate {
  date: string;
  reason: string;
  teamId?: string;
  applyToAllTeams: boolean;
}

interface Acceleration {
  id: number;
  customer_name: string;
  order_id: string;
  sr_id: string;
  site_address: string;
  product_type: string;
  change_types: string[];
  created_at: string;
  created_by: string;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Theme state
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Impersonation state
  impersonatedUser: { id: string; role: UserRole } | null;
  setImpersonatedUser: (user: { id: string; role: UserRole } | null) => void;
  
  // Teams
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
  setTeams: (teams: Team[]) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  setUsers: (users: User[]) => void;
  
  // Calendar events
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'event_id'>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  setEvents: (events: CalendarEvent[]) => void;
  
  // Product types
  productTypes: ProductType[];
  addProductType: (productType: Omit<ProductType, 'id'>) => Promise<void>;
  removeProductType: (id: string) => Promise<void>;
  setProductTypes: (productTypes: ProductType[]) => void;
  
  // Change types
  changeTypes: ChangeType[];
  addChangeType: (changeType: Omit<ChangeType, 'id'>) => Promise<void>;
  removeChangeType: (id: string) => Promise<void>;
  setChangeTypes: (changeTypes: ChangeType[]) => void;
  
  // Acceleration fields
  accelerationFields: AccelerationField[];
  setAccelerationFields: (fields: AccelerationField[]) => void;
  addAccelerationField: (field: Omit<AccelerationField, 'id'>) => void;
  updateAccelerationField: (id: string, updates: Partial<AccelerationField>) => void;
  removeAccelerationField: (id: string) => void;
  
  // Templates
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  removeTemplate: (id: string) => void;
  setTemplateActive: (id: string) => void;
  setTemplatesInactive: (type: Template['type']) => void;
  
  // Standard slots
  standardSlots: StandardSlot[];
  setStandardSlots: (slots: StandardSlot[]) => void;
  addStandardSlot: (slot: Omit<StandardSlot, 'id'>) => void;
  removeStandardSlot: (id: string) => void;
  
  // Blocked dates
  blockedDates: BlockedDate[];
  addBlockedDate: (date: BlockedDate) => void;
  removeBlockedDate: (date: string) => void;
  
  // Accelerations
  accelerations: Acceleration[];
  addAcceleration: (acceleration: Omit<Acceleration, 'id' | 'created_at'>) => void;
  removeAcceleration: (id: number) => void;
  updateAcceleration: (id: number, updates: Partial<Acceleration>) => void;
}

// Helper to generate IDs
const generateId = () => uuidv4();

// Initialize with some default data
const initialState = {
  templates: [
    {
      id: generateId(),
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
  changeTypes: [],
  accelerationFields: [
    {
      id: generateId(),
      name: 'customer_name',
      label: 'Customer Name',
      type: 'text',
      required: true,
      order: 10,
      show_in_create_form: true
    },
    {
      id: generateId(),
      name: 'order_id',
      label: 'Order ID',
      type: 'text',
      required: true,
      order: 20,
      show_in_create_form: true
    },
    {
      id: generateId(),
      name: 'sr_id',
      label: 'SR ID',
      type: 'text',
      required: true,
      order: 30,
      show_in_create_form: true
    },
    {
      id: generateId(),
      name: 'site_address',
      label: 'Site Address',
      type: 'textarea',
      required: true,
      order: 40,
      show_in_create_form: true
    },
    {
      id: generateId(),
      name: 'product_type',
      label: 'Product Type',
      type: 'product_type',
      required: true,
      order: 50,
      show_in_create_form: true
    },
    {
      id: generateId(),
      name: 'change_types',
      label: 'Change Types',
      type: 'change_type',
      required: true,
      order: 60,
      show_in_create_form: true
    }
  ]
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // Theme state
      theme: 'light' as Theme,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),

      // Impersonation
      impersonatedUser: null,
      setImpersonatedUser: (user) => set({ impersonatedUser: user }),
      
      // Teams
      teams: initialState.teams,
      setTeams: (teams) => set({ teams }),
      addTeam: async (team) => {
        const newTeam = {
          id: generateId(),
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
      users: initialState.users,
      setUsers: (users) => set({ users }),
      addUser: async (user) => {
        const newUser = {
          id: generateId(),
          ...user,
          created_at: new Date().toISOString()
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },
      removeUser: async (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id)
        }));
      },
      updateUser: async (id, updates) => {
        set((state) => ({
          users: state.users.map((user) => 
            user.id === id ? { ...user, ...updates } : user
          )
        }));
      },
      
      // Calendar events
      events: initialState.events,
      setEvents: (events) => set({ events }),
      addEvent: async (event) => {
        set((state) => {
          const newEvent = {
            id: generateId(),
            event_id: state.events.length + 1,
            ...event,
            created_at: new Date().toISOString()
          };
          return { events: [...state.events, newEvent] };
        });
      },
      removeEvent: async (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id)
        }));
      },
      updateEvent: async (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          )
        }));
      },
      
      // Product types
      productTypes: initialState.productTypes,
      setProductTypes: (productTypes) => set({ productTypes }),
      addProductType: async (productType) => {
        const newProductType = {
          id: generateId(),
          ...productType
        };
        set((state) => ({ productTypes: [...state.productTypes, newProductType] }));
      },
      removeProductType: async (id) => {
        set((state) => ({
          productTypes: state.productTypes.filter((pt) => pt.id !== id),
          // Also remove associated change types
          changeTypes: state.changeTypes.filter((ct) => ct.product_type_id !== id)
        }));
      },
      
      // Change types
      changeTypes: initialState.changeTypes,
      setChangeTypes: (changeTypes) => set({ changeTypes }),
      addChangeType: async (changeType) => {
        const newChangeType = {
          id: generateId(),
          ...changeType
        };
        set((state) => ({ changeTypes: [...state.changeTypes, newChangeType] }));
      },
      removeChangeType: async (id) => {
        set((state) => ({
          changeTypes: state.changeTypes.filter((ct) => ct.id !== id)
        }));
      },
      
      // Acceleration fields
      accelerationFields: initialState.accelerationFields,
      setAccelerationFields: (fields) => set({ accelerationFields: fields }), 
      addAccelerationField: async (field) => {
        const newField = {
          id: generateId(),
          ...field
        };
        set((state) => ({ 
          accelerationFields: [...state.accelerationFields, newField]
        }));
      },
      updateAccelerationField: async (id, updates) => {
        set((state) => ({
          accelerationFields: state.accelerationFields.map((field) =>
            field.id === id ? { ...field, ...updates } : field
          )
        }));
      },
      removeAccelerationField: async (id) => {
        set((state) => ({
          accelerationFields: state.accelerationFields.filter((field) => field.id !== id)
        }));
      },
      
      // Templates
      templates: initialState.templates,
      addTemplate: async (template) => {
        const newTemplate = {
          id: generateId(),
          ...template
        };
        set((state) => ({ 
          templates: [...state.templates, newTemplate]
        }));
      },
      updateTemplate: async (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          )
        }));
      },
      removeTemplate: async (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id)
        }));
      },
      setTemplateActive: (id) => set((state) => {
        const template = state.templates.find(t => t.id === id);
        if (!template) return state;
        
        return {
          templates: state.templates.map(t => ({
            ...t,
            is_active: t.id === id && t.type === template.type
          }))
        };
      }),
      setTemplatesInactive: (type) => set((state) => ({
        templates: state.templates.map(t => 
          t.type === type ? { ...t, is_active: false } : t
        )
      })),
      
      // Standard slots
      standardSlots: [],
      setStandardSlots: (slots) => set({ standardSlots: slots }), 
      addStandardSlot: async (slot) => {
        const newSlot = {
          id: generateId(),
          ...slot
        };
        set((state) => ({ 
          standardSlots: [...state.standardSlots, newSlot]
        }));
      },
      removeStandardSlot: async (id) => {
        set((state) => ({
          standardSlots: state.standardSlots.filter((slot) => slot.id !== id)
        }));
      },
      
      // Blocked dates
      blockedDates: [],
      addBlockedDate: async (date) => {
        set((state) => ({ 
          blockedDates: [...state.blockedDates, date]
        }));
      },
      removeBlockedDate: async (date) => {
        set((state) => ({
          blockedDates: state.blockedDates.filter((d) => d.date !== date)
        }));
      },
      
      // Accelerations
      accelerations: [],
      addAcceleration: async (acceleration) => {
        set((state) => {
          const newAcceleration = {
            id: state.accelerations.length + 1,
            ...acceleration,
            created_at: new Date().toISOString()
          };
          return {
            accelerations: [...state.accelerations, newAcceleration]
          };
        });
      },
      removeAcceleration: async (id) => {
        set((state) => ({
          accelerations: state.accelerations.filter((a) => a.id !== id)
        }));
      },
      updateAcceleration: async (id, updates) => {
        set((state) => ({
          accelerations: state.accelerations.map((acceleration) =>
            acceleration.id === id ? { ...acceleration, ...updates } : acceleration
          )
        }));
      }
    }),
    {
      name: 'calendar-tool-storage',
      version: 1
    }
  )
);