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
  AddressDetails,
  ServiceRow,
  ServiceOrderRow,
  SupportTicketRow,
  ChatMessageRow,
  ProfileRow,
  ServiceOrderStatus,
  ServiceCategoryName,
  RoomChecklistSection
} from './types';
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from './catalogPresets';

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
      console.warn('Supabase initialization warning:', e);
      return null;
    }
  }
  return supabaseInstance;
}

// Local persistence cache keys
const STORAGE_KEYS = {
  SERVICES: 'cleanpro_prod_services_v4',
  CATEGORIES: 'cleanpro_prod_categories_v4',
  ORDERS: 'cleanpro_prod_orders_v4',
  TICKETS: 'cleanpro_prod_tickets_v4',
  USER: 'cleanpro_prod_user_v4',
  REMEMBER_ME: 'cleanpro_remember_me_v4',
};

async function withTimeout<T>(promise: Promise<T>, ms = 2500, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return res;
  } catch {
    clearTimeout(timer!);
    return fallback;
  }
}

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
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
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
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

// Helper: map a DB service row or preset into a fully hydrated CleaningService UI object
function mapDbServiceToUi(row: ServiceRow | Partial<CleaningService>): CleaningService {
  const preset = DEFAULT_SERVICES.find(s => s.id === row.id || s.category === row.category) || DEFAULT_SERVICES[0];
  const title = (row as ServiceRow).title || (row as CleaningService).name || preset.name;
  const category = ((row as ServiceRow).category || (row as CleaningService).category || preset.category) as ServiceCategoryName;
  const base_price = Number(row.base_price ?? preset.base_price);
  const duration_minutes = Number((row as ServiceRow).duration_minutes ?? preset.duration_minutes ?? 120);

  return {
    id: row.id || preset.id,
    category_id: category,
    category: category,
    name: title,
    title: title,
    slug: (row as CleaningService).slug || preset.slug,
    short_desc: (row as CleaningService).short_desc || (row as ServiceRow).description || preset.short_desc,
    description: (row as ServiceRow).description || (row as CleaningService).description || preset.description,
    base_price: base_price,
    duration_minutes: duration_minutes,
    estimated_hours: `${Math.round(duration_minutes / 60)} - ${Math.round(duration_minutes / 60) + 1} hrs`,
    popular_badge: (row as CleaningService).popular_badge || preset.popular_badge,
    icon: (row as CleaningService).icon || preset.icon || 'Sparkles',
    image_url: (row as CleaningService).image_url || preset.image_url,
    features: Array.isArray(row.features) && row.features.length > 0 ? (row.features as string[]) : preset.features,
    is_active: (row as ServiceRow).is_active ?? true,
    included_tasks: (row as CleaningService).included_tasks || preset.included_tasks,
    available_addons: (row as CleaningService).available_addons || preset.available_addons,
  };
}

// Helper: map DB service_orders row into UI ServiceOrder
function mapDbOrderToUi(dbRow: any): ServiceOrder {
  const service = DEFAULT_SERVICES.find(s => s.id === dbRow.service_id) || DEFAULT_SERVICES[0];
  const orderNumber = dbRow.id ? `CP-${dbRow.id.slice(0, 8).toUpperCase()}` : `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let parsedAddress: AddressDetails;
  if (typeof dbRow.address === 'string' && dbRow.address.startsWith('{')) {
    try {
      parsedAddress = JSON.parse(dbRow.address);
    } catch {
      parsedAddress = {
        street: dbRow.address,
        number: dbRow.unit_or_suite || '1',
        neighborhood: 'Central',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
      };
    }
  } else {
    parsedAddress = {
      street: dbRow.address || '123 Park Avenue',
      number: dbRow.unit_or_suite || '1',
      neighborhood: 'Downtown',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      access_notes: dbRow.notes || undefined,
    };
  }

  const checklist: RoomChecklistSection[] = Array.isArray(dbRow.checklist) && dbRow.checklist.length > 0
    ? dbRow.checklist
    : service.included_tasks.map((group, gIdx) => ({
        room_name: group.room,
        icon: 'Sparkles',
        items: group.tasks.map((t, tIdx) => ({
          id: `chk_${gIdx}_${tIdx}`,
          label: t,
          completed: dbRow.status === 'completed'
        }))
      }));

  return {
    id: dbRow.id,
    order_number: orderNumber,
    client_id: dbRow.client_id,
    client_name: dbRow.profiles?.full_name || 'Valued Client',
    client_email: dbRow.profiles?.email || 'client@cleanpro.com',
    client_phone: dbRow.profiles?.phone || '+1 (555) 301-4492',
    operational_id: dbRow.operational_id,
    service_id: dbRow.service_id,
    service_name: dbRow.services?.title || service.name,
    category_name: dbRow.services?.category || service.category,
    status: dbRow.status as ServiceOrderStatus,
    scheduled_date: dbRow.scheduled_date,
    time_slot: '08:00 - 12:00 (Morning Slot)',
    address: parsedAddress,
    property_details: {
      property_type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      kitchens: 1,
      living_rooms: 1,
      sq_ft: 900,
      has_pets: false,
    },
    selected_addons: [],
    frequency: 'one_time',
    pricing_breakdown: {
      base_price: Number(dbRow.total_price || service.base_price),
      property_size_fee: 0,
      extra_rooms_fee: 0,
      addons_total: 0,
      subtotal: Number(dbRow.total_price || service.base_price),
      discount_percentage: 0,
      discount_amount: 0,
      taxes_and_insurance: 0,
      total_amount: Number(dbRow.total_price || service.base_price),
    },
    assigned_team: dbRow.operational ? {
      id: dbRow.operational_id || 'team_1',
      name: dbRow.operational.full_name || 'CleanPro Dispatch Squad Alpha',
      lead_cleaner: dbRow.operational.full_name || 'Inspector David Vance',
      lead_photo: dbRow.operational.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      lead_phone: dbRow.operational.phone || '+1 (555) 892-3341',
      team_size: 2,
      rating: 4.95,
      total_jobs: 142,
      specialty: `${service.category} Certified Specialist`
    } : undefined,
    checklist,
    inspection_photos: Array.isArray(dbRow.inspection_photos) ? dbRow.inspection_photos : [],
    client_signature_url: dbRow.client_signature_url,
    client_signature: dbRow.client_signature_url ? {
      signature_image: dbRow.client_signature_url,
      signer_name: dbRow.profiles?.full_name || 'Client',
      signed_at: dbRow.updated_at || new Date().toISOString()
    } : undefined,
    payment_status: 'paid',
    payment_details: {
      method: 'pix',
      paid_at: dbRow.created_at,
      transaction_id: `TXN-PAY-${dbRow.id ? dbRow.id.slice(0, 8) : '001'}`
    },
    notes_for_cleaners: dbRow.notes,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at || dbRow.created_at,
  };
}

export const CleanProAPI = {
  // 1. Service Categories
  async getCategories(): Promise<ServiceCategory[]> {
    return DEFAULT_CATEGORIES;
  },

  // 2. Services Catalog (queries Supabase 'services' table)
  async getServices(): Promise<CleaningService[]> {
    const supabase = getSupabase();
    if (supabase) {
      const result = await withTimeout(
        (async () => {
          try {
            const { data, error } = await supabase
              .from('services')
              .select('*')
              .eq('is_active', true)
              .order('base_price');

            if (!error && data && data.length > 0) {
              const mapped = data.map((row: ServiceRow) => mapDbServiceToUi(row));
              setLocalItem(STORAGE_KEYS.SERVICES, mapped);
              return mapped;
            }
          } catch (err) {
            console.warn('Supabase services fetch notice:', err);
          }
          return null;
        })(),
        2000,
        null
      );
      if (result) return result;
    }
    return getLocalItem<CleaningService[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  },

  async getServiceById(id: string): Promise<CleaningService | null> {
    const services = await this.getServices();
    return services.find(s => s.id === id || s.slug === id || s.category === id) || null;
  },

  // 3. Service Orders (queries Supabase 'service_orders' table)
  async getOrders(clientId?: string): Promise<ServiceOrder[]> {
    const supabase = getSupabase();
    if (supabase) {
      const result = await withTimeout(
        (async () => {
          try {
            let query = supabase
              .from('service_orders')
              .select(`
                *,
                services:service_id(title, category, duration_minutes, base_price),
                profiles:client_id(full_name, email, phone),
                operational:operational_id(full_name, phone, avatar_url)
              `)
              .order('created_at', { ascending: false });

            if (clientId) {
              query = query.eq('client_id', clientId);
            }

            const { data, error } = await query;
            if (!error && data) {
              const mapped = data.map((row: any) => mapDbOrderToUi(row));
              setLocalItem(STORAGE_KEYS.ORDERS, mapped);
              return mapped;
            }
          } catch (err) {
            console.warn('Supabase orders query notice:', err);
          }
          return null;
        })(),
        2500,
        null
      );
      if (result !== null) return result;
    }

    const localOrders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, []);
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
          .select(`
            *,
            services:service_id(title, category, duration_minutes, base_price),
            profiles:client_id(full_name, email, phone),
            operational:operational_id(full_name, phone, avatar_url)
          `)
          .eq('id', orderId)
          .maybeSingle();

        if (!error && data) return mapDbOrderToUi(data);
      } catch (err) {
        console.warn('Supabase order lookup error:', err);
      }
    }
    const orders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, []);
    return orders.find(o => o.id === orderId || o.order_number === orderId) || null;
  },

  async createOrder(orderPayload: Omit<ServiceOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<ServiceOrder> {
    const orderId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;
    const orderNum = `CP-${orderId.slice(0, 8).toUpperCase()}`;

    const newOrder: ServiceOrder = {
      ...orderPayload,
      id: orderId,
      order_number: orderNum,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const formattedAddress = `${orderPayload.address.street}, ${orderPayload.address.number}${orderPayload.address.complement ? ` - ${orderPayload.address.complement}` : ''}, ${orderPayload.address.neighborhood}, ${orderPayload.address.city} - ${orderPayload.address.state}`;

    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbPayload = {
          id: orderId,
          client_id: orderPayload.client_id,
          service_id: orderPayload.service_id,
          status: 'pending',
          scheduled_date: new Date(orderPayload.scheduled_date).toISOString(),
          total_price: orderPayload.pricing_breakdown.total_amount,
          address: formattedAddress,
          unit_or_suite: orderPayload.address.complement || null,
          notes: orderPayload.notes_for_cleaners || orderPayload.address.access_notes || null,
          inspection_photos: [],
          checklist: orderPayload.checklist || []
        };

        const { data, error } = await supabase.from('service_orders').insert(dbPayload).select().single();
        if (!error && data) {
          const mapped = mapDbOrderToUi({ ...data, profiles: { full_name: orderPayload.client_name, email: orderPayload.client_email, phone: orderPayload.client_phone } });
          const cached = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, []);
          setLocalItem(STORAGE_KEYS.ORDERS, [mapped, ...cached.filter(o => o.id !== mapped.id)]);
          return mapped;
        } else if (error) {
          console.warn('Supabase service_orders insert note:', error.message);
        }
      } catch (err) {
        console.warn('Supabase live order submission note:', err);
      }
    }

    const currentOrders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, []);
    const updated = [newOrder, ...currentOrders.filter(o => o.id !== newOrder.id)];
    setLocalItem(STORAGE_KEYS.ORDERS, updated);
    return newOrder;
  },

  async updateOrder(orderId: string, updates: Partial<ServiceOrder>): Promise<ServiceOrder | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const dbUpdates: Partial<ServiceOrderRow> = {};
        if (updates.status) dbUpdates.status = updates.status as ServiceOrderStatus;
        if (updates.client_signature_url) dbUpdates.client_signature_url = updates.client_signature_url;
        if (updates.client_signature?.signature_image) dbUpdates.client_signature_url = updates.client_signature.signature_image;
        if (updates.checklist) dbUpdates.checklist = updates.checklist;

        const { data, error } = await supabase
          .from('service_orders')
          .update(dbUpdates)
          .eq('id', orderId)
          .select(`
            *,
            services:service_id(title, category, duration_minutes, base_price),
            profiles:client_id(full_name, email, phone),
            operational:operational_id(full_name, phone, avatar_url)
          `)
          .single();

        if (!error && data) {
          const mapped = mapDbOrderToUi(data);
          const cached = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, []);
          const idx = cached.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            cached[idx] = mapped;
            setLocalItem(STORAGE_KEYS.ORDERS, cached);
          }
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase order update error:', err);
      }
    }

    const currentOrders = getLocalItem<ServiceOrder[]>(STORAGE_KEYS.ORDERS, []);
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
          async (payload) => {
            if (payload.new) {
              const fullOrder = await CleanProAPI.getOrderById((payload.new as any).id);
              if (fullOrder) {
                onOrderChange(payload.eventType as any, fullOrder);
              }
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('🟢 Supabase Realtime WebSocket channel active on service_orders');
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

  async toggleChecklistItem(orderId: string, itemId: string, completed: boolean, cleanerName = 'Inspector'): Promise<ServiceOrder | null> {
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

  async submitSignature(orderId: string, signature: SignatureRecord): Promise<ServiceOrder | null> {
    return this.updateOrder(orderId, {
      client_signature: signature,
      client_signature_url: signature.signature_image,
      status: 'completed',
    });
  },

  async submitRating(orderId: string, rating: OrderRating): Promise<ServiceOrder | null> {
    return this.updateOrder(orderId, { rating });
  },

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

  // 4. Client Authentication (Supabase Auth + 'profiles' table)
  async signUpClient(params: ClientSignUpParams): Promise<UserProfile> {
    const { email, password, fullName, phone, defaultAddress, lgpdConsent, rememberMe, onboardingSource } = params;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || `CleanPro2026!${Math.floor(100 + Math.random() * 900)}`;

    const supabase = getSupabase();
    let authUser: User | null = null;
    let userId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;

    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              full_type: 'client',
            },
          },
        });

        if (authError) {
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
        console.warn('Supabase Auth notice during signup:', err);
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

    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: cleanEmail,
              full_name: newProfile.full_name,
              phone: newProfile.phone,
              full_type: 'client',
              company_name: null,
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
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
            phone: profileData.phone || '',
            role: profileData.full_type || 'client',
            full_type: profileData.full_type || 'client',
            avatar_url: profileData.avatar_url || undefined,
            company_name: profileData.company_name || undefined,
            lgpd_consent: true,
            created_at: profileData.created_at || new Date().toISOString(),
          };
          setLocalItem(STORAGE_KEYS.USER, userProfile);
          return userProfile;
        }
      }
    }

    // Fallback client session
    const user: UserProfile = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()) || 'Valued Client',
      phone: '+1 (555) 301-4492',
      role: 'client',
      full_type: 'client',
      lgpd_consent: true,
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
      const liveUser = await withTimeout(
        (async () => {
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
                  phone: profile.phone || u.user_metadata?.phone || '',
                  role: profile.full_type || 'client',
                  full_type: profile.full_type || 'client',
                  avatar_url: profile.avatar_url || undefined,
                  company_name: profile.company_name || undefined,
                  lgpd_consent: true,
                  created_at: profile.created_at || new Date().toISOString(),
                };
                setLocalItem(STORAGE_KEYS.USER, userProfile);
                return userProfile;
              }
            }
          } catch (err) {
            console.warn('Supabase session fetch notice:', err);
          }
          return null;
        })(),
        1200,
        null
      );
      if (liveUser) return liveUser;
    }

    const storedUser = getLocalItem<UserProfile | null>(STORAGE_KEYS.USER, null);
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
    setLocalItem(STORAGE_KEYS.ORDERS, []);
    setLocalItem(STORAGE_KEYS.TICKETS, []);
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

  // 5. Customer Support ('support_tickets' & 'chat_messages' tables)
  async getSupportTickets(clientId?: string): Promise<SupportTicket[]> {
    const supabase = getSupabase();
    if (supabase) {
      const ticketsResult = await withTimeout(
        (async () => {
          try {
            let query = supabase
              .from('support_tickets')
              .select(`
                *,
                profiles:client_id(full_name, email),
                chat_messages(id, ticket_id, sender_id, message, attachments, is_internal_note, created_at)
              `)
              .order('created_at', { ascending: false });

            if (clientId) {
              query = query.eq('client_id', clientId);
            }
            const { data, error } = await query;
            if (!error && data) {
              return data.map((t: any) => ({
                id: t.id,
                client_id: t.client_id,
                client_name: t.profiles?.full_name || 'Client',
                assigned_to: t.assigned_to,
                service_order_id: t.service_order_id,
                subject: t.subject,
                category: t.category,
                department: (t.category === 'Ombudsman' ? 'ombudsman' : 'sac') as any,
                status: t.status,
                priority: t.priority,
                resolution_notes: t.resolution_notes,
                messages: Array.isArray(t.chat_messages) ? t.chat_messages.map((m: any) => ({
                  id: m.id,
                  ticket_id: m.ticket_id,
                  sender_id: m.sender_id,
                  sender_type: m.sender_id === clientId ? 'client' : 'agent',
                  sender_name: m.sender_id === clientId ? 'You' : 'Dispatcher Ryan (CleanPro)',
                  content: m.message,
                  timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  attachments: m.attachments,
                  is_internal_note: m.is_internal_note
                })) : [],
                created_at: t.created_at
              })) as SupportTicket[];
            }
          } catch (err) {
            console.warn('Supabase tickets fetch error:', err);
          }
          return null;
        })(),
        1800,
        null
      );
      if (ticketsResult !== null) return ticketsResult;
    }
    const tickets = getLocalItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
    if (clientId) {
      return tickets.filter(t => t.client_id === clientId);
    }
    return tickets;
  },

  async createSupportTicket(ticketPayload: Omit<SupportTicket, 'id' | 'created_at'>): Promise<SupportTicket> {
    const ticketId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;
    const newTicket: SupportTicket = {
      ...ticketPayload,
      id: ticketId,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('support_tickets').insert({
          id: ticketId,
          client_id: ticketPayload.client_id,
          service_order_id: ticketPayload.service_order_id || null,
          subject: ticketPayload.subject,
          category: ticketPayload.department === 'ombudsman' ? 'Ombudsman' : 'SAC Support',
          status: 'open',
          priority: ticketPayload.priority === 'urgent' ? 'urgent' : ticketPayload.priority === 'high' ? 'high' : 'medium'
        }).select().single();

        if (!error && data) {
          // If initial message provided, insert to chat_messages
          if (ticketPayload.messages && ticketPayload.messages.length > 0) {
            const initialMsg = ticketPayload.messages[0];
            await supabase.from('chat_messages').insert({
              ticket_id: ticketId,
              sender_id: ticketPayload.client_id,
              message: initialMsg.content,
              is_internal_note: false
            });
          }
          return newTicket;
        }
      } catch (err) {
        console.warn('Supabase create support ticket note:', err);
      }
    }

    const tickets = getLocalItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
    const updated = [newTicket, ...tickets];
    setLocalItem(STORAGE_KEYS.TICKETS, updated);
    return newTicket;
  },

  async sendSupportMessage(ticketId: string, message: Omit<SupportMessage, 'id' | 'timestamp'>): Promise<SupportTicket | null> {
    const fullMessage: SupportMessage = {
      ...message,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const currentUser = await this.getCurrentUser();
        await supabase.from('chat_messages').insert({
          ticket_id: ticketId,
          sender_id: currentUser?.id || '00000000-0000-4000-8000-000000000000',
          message: message.content,
          is_internal_note: false,
          attachments: []
        });

        const tickets = await this.getSupportTickets();
        const found = tickets.find(t => t.id === ticketId);
        if (found) return found;
      } catch (err) {
        console.warn('Supabase send support message error:', err);
      }
    }

    const tickets = getLocalItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, []);
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) return null;

    tickets[index].messages.push(fullMessage);
    setLocalItem(STORAGE_KEYS.TICKETS, tickets);
    return tickets[index];
  },

  // Clear local device cache
  clearLocalCache(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};
