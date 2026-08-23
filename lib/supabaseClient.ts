import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import {
  CleaningService,
  ServiceCategory,
  ServiceOrder,
  UserProfile,
  SupportTicket,
  SupportMessage,
  OrderRating,
  SignatureRecord,
  AddressDetails
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_ORDERS,
  INITIAL_SUPPORT_TICKETS,
  DEMO_USER
} from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key'
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (e) {
      console.warn('Supabase initialization error, operating in resilient mode:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// Storage Keys
const STORAGE_KEYS = {
  SERVICES: 'cleanpro_pwa_services_v2',
  CATEGORIES: 'cleanpro_pwa_categories_v2',
  ORDERS: 'cleanpro_pwa_orders_v2',
  TICKETS: 'cleanpro_pwa_tickets_v2',
  USER: 'cleanpro_pwa_user_v2',
  REMEMBER_ME: 'cleanpro_remember_me_v2',
};

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export interface ClientSignUpParams {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  defaultAddress?: AddressDetails;
  lgpdConsent: boolean;
  rememberMe?: boolean;
  onboardingSource?: string;
}

export const CleanProAPI = {
  // Services & Categories
  async getCategories(): Promise<ServiceCategory[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('service_categories').select('*');
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.CATEGORIES, data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase categories query notice:', err);
      }
    }
    return getLocalItem<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async getServices(): Promise<CleaningService[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('cleaning_services').select('*');
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.SERVICES, data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase services query notice:', err);
      }
    }
    return getLocalItem<CleaningService[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  },

  async getServiceById(id: string): Promise<CleaningService | null> {
    const services = await this.getServices();
    return services.find(s => s.id === id || s.slug === id) || null;
  },

  // Customer Orders (CRUD + Live Sync)
  async getOrders(clientId?: string): Promise<ServiceOrder[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('service_orders').select('*').order('created_at', { ascending: false });
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setLocalItem(STORAGE_KEYS.ORDERS, data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase orders query notice:', err);
      }
    }
    const localOrders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    if (clientId) {
      return localOrders.filter(o => o.client_id === clientId);
    }
    return localOrders;
  },

  async getOrderById(orderId: string): Promise<ServiceOrder | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('service_orders')
          .select('*')
          .or(`id.eq.${orderId},order_number.eq.${orderId}`)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase order fetch notice:', err);
      }
    }
    const orders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.find(o => o.id === orderId || o.order_number === orderId) || null;
  },

  async createOrder(orderPayload: Omit<ServiceOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<ServiceOrder> {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: ServiceOrder = {
      ...orderPayload,
      id: `ord_${Date.now()}_${randomNum}`,
      order_number: `CP-2026-${randomNum}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('service_orders').insert(newOrder).select().single();
        if (!error && data) {
          const cached = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
          setLocalItem(STORAGE_KEYS.ORDERS, [data, ...cached.filter(o => o.id !== data.id)]);
          return data;
        } else if (error) {
          console.warn('Supabase service_orders table insertion note:', error.message);
        }
      } catch (err) {
        console.warn('Supabase live order submission note:', err);
      }
    }

    const currentOrders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updated = [newOrder, ...currentOrders.filter(o => o.id !== newOrder.id)];
    setLocalItem(STORAGE_KEYS.ORDERS, updated);
    return newOrder;
  },

  async updateOrder(orderId: string, updates: Partial<ServiceOrder>): Promise<ServiceOrder | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('service_orders')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single();
        if (!error && data) {
          const cached = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
          const idx = cached.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            cached[idx] = data;
            setLocalItem(STORAGE_KEYS.ORDERS, cached);
          }
          return data;
        }
      } catch (err) {
        console.warn('Supabase order update notice:', err);
      }
    }

    const currentOrders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = currentOrders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const updatedOrder: ServiceOrder = {
      ...currentOrders[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    currentOrders[index] = updatedOrder;
    setLocalItem(STORAGE_KEYS.ORDERS, currentOrders);
    return updatedOrder;
  },

  // Real-Time Postgres Subscription for Service Orders
  subscribeToOrders(
    onOrderChange: (event: 'INSERT' | 'UPDATE' | 'DELETE', order: ServiceOrder) => void,
    clientId?: string
  ): () => void {
    const supabase = getSupabase();
    if (!supabase) {
      return () => {};
    }

    try {
      const channelId = `service_orders_feed_${clientId || 'global'}_${Date.now()}`;
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'service_orders',
            ...(clientId ? { filter: `client_id=eq.${clientId}` } : {})
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              onOrderChange('INSERT', payload.new as ServiceOrder);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              onOrderChange('UPDATE', payload.new as ServiceOrder);
            } else if (payload.eventType === 'DELETE' && payload.old) {
              onOrderChange('DELETE', payload.old as ServiceOrder);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('🟢 Supabase Realtime WebSocket active on service_orders');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime channel subscription error:', err);
      return () => {};
    }
  },

  // Toggle checklist item
  async toggleChecklistItem(orderId: string, itemId: string, completed: boolean, cleanerName = 'Field Inspector'): Promise<ServiceOrder | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const updatedChecklist = order.checklist.map(section => ({
      ...section,
      items: section.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            completed,
            completed_at: completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            completed_by: completed ? cleanerName : undefined,
          };
        }
        return item;
      })
    }));

    return this.updateOrder(orderId, { checklist: updatedChecklist });
  },

  // Advance Order Status Simulator (for live interactive tracking demo)
  async advanceOrderStatus(orderId: string): Promise<ServiceOrder | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const sequence: ServiceOrder['status'][] = [
      'pending',
      'confirmed',
      'team_assigned',
      'en_route',
      'in_progress',
      'inspecting',
      'completed'
    ];

    const currentIndex = sequence.indexOf(order.status);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) return order;

    const nextStatus = sequence[currentIndex + 1];
    return this.updateOrder(orderId, { status: nextStatus });
  },

  // Submit client signature
  async submitSignature(orderId: string, signature: SignatureRecord): Promise<ServiceOrder | null> {
    return this.updateOrder(orderId, {
      client_signature: signature,
      status: 'completed',
    });
  },

  // Submit client review & rating
  async submitRating(orderId: string, rating: OrderRating): Promise<ServiceOrder | null> {
    return this.updateOrder(orderId, { rating });
  },

  // Mark payment as paid
  async markAsPaid(orderId: string, method: 'pix' | 'credit_card' = 'pix'): Promise<ServiceOrder | null> {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    return this.updateOrder(orderId, {
      payment_status: 'paid',
      payment_details: {
        ...order.payment_details,
        method,
        paid_at: new Date().toISOString(),
        transaction_id: `TXN-${method.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      }
    });
  },

  // Client Quick Onboarding & Authentication
  async signUpClient(params: ClientSignUpParams): Promise<UserProfile> {
    const { email, password, fullName, phone, defaultAddress, lgpdConsent, rememberMe, onboardingSource } = params;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || `CleanPro2026!${Math.floor(100 + Math.random() * 900)}`;

    const supabase = getSupabase();
    let authUser: User | null = null;
    let userId = `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              role: 'client',
              full_type: 'client',
              onboarding_source: onboardingSource || 'web',
            },
          },
        });

        if (authError) {
          // If user already exists in auth, attempt sign-in
          if (authError.message.toLowerCase().includes('already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPass,
            });
            if (signInError) {
              throw new Error('This email is already registered. Please sign in with your password.');
            }
            if (signInData?.user) {
              authUser = signInData.user;
              userId = signInData.user.id;
            }
          } else {
            throw authError;
          }
        } else if (authData?.user) {
          authUser = authData.user;
          userId = authData.user.id;
        }
      } catch (err) {
        console.warn('Supabase Auth warning during signup:', err);
      }
    }

    const newProfile: UserProfile = {
      id: userId,
      email: cleanEmail,
      full_name: fullName.trim() || cleanEmail.split('@')[0],
      phone: phone.trim() || '+1 (555) 301-4492',
      role: 'client',
      full_type: 'client',
      default_address: defaultAddress,
      lgpd_consent: lgpdConsent,
      onboarding_source: onboardingSource || 'direct',
      created_at: new Date().toISOString(),
    };

    // Insert into `profiles` table in Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: cleanEmail,
              full_name: newProfile.full_name,
              phone: newProfile.phone,
              role: 'client',
              full_type: 'client',
              default_address: defaultAddress,
              lgpd_consent: lgpdConsent,
              onboarding_source: onboardingSource || 'direct',
              created_at: newProfile.created_at,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
          .select()
          .single();

        if (!error && data) {
          newProfile.id = data.id || userId;
        }
      } catch (err) {
        console.warn('Supabase profiles insert notice:', err);
      }
    }

    // Persist session preference
    if (rememberMe !== undefined && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
    }

    setLocalItem(STORAGE_KEYS.USER, newProfile);
    return newProfile;
  },

  async login(email: string, password?: string, rememberMe = true): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabase();

    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          // Fetch real profile from `profiles` table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileData) {
            const userProfile: UserProfile = {
              id: profileData.id,
              email: profileData.email || cleanEmail,
              full_name: profileData.full_name || 'Client',
              phone: profileData.phone || '+1 (555) 301-4492',
              role: 'client',
              full_type: 'client',
              default_address: profileData.default_address,
              lgpd_consent: profileData.lgpd_consent ?? true,
              onboarding_source: profileData.onboarding_source,
              created_at: profileData.created_at || new Date().toISOString(),
            };
            setLocalItem(STORAGE_KEYS.USER, userProfile);
            return userProfile;
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid credentials';
        throw new Error(message);
      }
    }

    // Standard client login helper
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || 'Valued Client',
      phone: '+1 (555) 301-4492',
      role: 'client',
      full_type: 'client',
      lgpd_consent: true,
      default_address: {
        street: '742 Evergreen Terrace',
        number: 'Apt 4B',
        neighborhood: 'Greenwich Village',
        city: 'New York',
        state: 'NY',
        zip_code: '10014',
      },
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
    }
    setLocalItem(STORAGE_KEYS.USER, user);
    return user;
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const u = sessionData.session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();

          if (profile) {
            const userProfile: UserProfile = {
              id: profile.id,
              email: profile.email || u.email || '',
              full_name: profile.full_name || u.user_metadata?.full_name || 'Client',
              phone: profile.phone || u.user_metadata?.phone || '+1 (555) 301-4492',
              role: 'client',
              full_type: 'client',
              default_address: profile.default_address,
              lgpd_consent: profile.lgpd_consent ?? true,
              created_at: profile.created_at || new Date().toISOString(),
            };
            setLocalItem(STORAGE_KEYS.USER, userProfile);
            return userProfile;
          }
        }
      } catch (err) {
        console.warn('Supabase session fetch notice:', err);
      }
    }

    const storedUser = getLocalItem<UserProfile | null>(STORAGE_KEYS.USER, DEMO_USER);
    return storedUser;
  },

  async logout(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase logout notice:', err);
      }
    }
    setLocalItem(STORAGE_KEYS.USER, null);
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return null;
    const updated = { ...currentUser, ...updates };

    const supabase = getSupabase();
    if (supabase && currentUser.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.full_name,
            phone: updated.phone,
            default_address: updated.default_address,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);
      } catch (err) {
        console.warn('Supabase profile update notice:', err);
      }
    }

    setLocalItem(STORAGE_KEYS.USER, updated);
    return updated;
  },

  // Customer Support (SAC / Ombudsman)
  async getSupportTickets(clientId?: string): Promise<SupportTicket[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
        if (clientId) {
          query = query.eq('client_id', clientId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase tickets fetch error:', err);
      }
    }
    const tickets = getLocalItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_SUPPORT_TICKETS);
    if (clientId) {
      return tickets.filter(t => t.client_id === clientId);
    }
    return tickets;
  },

  async createSupportTicket(ticketPayload: Omit<SupportTicket, 'id' | 'created_at'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticketPayload,
      id: `tkt_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('support_tickets').insert(newTicket).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase create support ticket note:', err);
      }
    }

    const tickets = getLocalItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_SUPPORT_TICKETS);
    const updated = [newTicket, ...tickets];
    setLocalItem(STORAGE_KEYS.TICKETS, updated);
    return newTicket;
  },

  async sendSupportMessage(ticketId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportTicket | null> {
    const fullMessage: SupportMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const tickets = getLocalItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_SUPPORT_TICKETS);
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) return null;

    tickets[index].messages.push(fullMessage);
    setLocalItem(STORAGE_KEYS.TICKETS, tickets);
    return tickets[index];
  },

  // Reset demo data to defaults
  resetToDefaults(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_SUPPORT_TICKETS));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
  }
};
