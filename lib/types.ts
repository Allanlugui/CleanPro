export type ServiceStatus =
  | 'pending'
  | 'confirmed'
  | 'team_assigned'
  | 'en_route'
  | 'in_progress'
  | 'inspecting'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'refunded';
export type PaymentMethod = 'pix' | 'credit_card' | 'invoice';
export type ServiceFrequency = 'one_time' | 'weekly' | 'bi_weekly' | 'monthly';

export interface AddressDetails {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  access_notes?: string;
}

export interface PropertyDetails {
  property_type: 'apartment' | 'house' | 'commercial' | 'studio';
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  living_rooms: number;
  sq_ft?: number;
  has_pets: boolean;
  pet_details?: string;
}

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  unit: string;
}

export interface AddOnSelection {
  addon_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface PricingBreakdown {
  base_price: number;
  property_size_fee: number;
  extra_rooms_fee: number;
  addons_total: number;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  taxes_and_insurance: number;
  total_amount: number;
}

export interface CleanerTeam {
  id: string;
  name: string;
  lead_cleaner: string;
  lead_photo: string;
  lead_phone: string;
  team_size: number;
  vehicle_plate?: string;
  rating: number;
  total_jobs: number;
  eta_minutes?: number;
  specialty: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completed_at?: string;
  completed_by?: string;
}

export interface RoomChecklistSection {
  room_name: string;
  icon: string;
  items: ChecklistItem[];
}

export interface InspectionPhoto {
  id: string;
  room: string;
  title: string;
  before_url: string;
  after_url: string;
  before_timestamp: string;
  after_timestamp: string;
  inspector_notes: string;
  verified: boolean;
}

export interface SignatureRecord {
  signature_image: string;
  signer_name: string;
  signed_at: string;
  ip_fingerprint?: string;
}

export interface OrderRating {
  rating: number; // 1 to 5
  punctuality_score: number;
  cleanliness_score: number;
  professionalism_score: number;
  comment: string;
  tags: string[];
  submitted_at: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  pix_key?: string;
  pix_qr_code?: string;
  pix_expires_at?: string;
  card_last4?: string;
  card_brand?: string;
  installments?: number;
  receipt_url?: string;
  paid_at?: string;
  transaction_id?: string;
}

export interface ServiceOrder {
  id: string;
  order_number: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: string;
  service_name: string;
  category_name: string;
  status: ServiceStatus;
  scheduled_date: string;
  time_slot: string;
  address: AddressDetails;
  property_details: PropertyDetails;
  selected_addons: AddOnSelection[];
  frequency: ServiceFrequency;
  pricing_breakdown: PricingBreakdown;
  assigned_team?: CleanerTeam;
  checklist: RoomChecklistSection[];
  inspection_photos: InspectionPhoto[];
  client_signature?: SignatureRecord;
  payment_status: PaymentStatus;
  payment_details: PaymentDetails;
  rating?: OrderRating;
  notes_for_cleaners?: string;
  created_at: string;
  updated_at: string;
}

export interface CleaningService {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_desc: string;
  description: string;
  base_price: number;
  estimated_hours: string;
  popular_badge?: string;
  icon: string;
  image_url: string;
  features: string[];
  included_tasks: {
    room: string;
    tasks: string[];
  }[];
  available_addons: ServiceAddon[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role: 'client' | 'customer' | 'admin' | 'dispatcher' | 'cleaner';
  full_type?: 'client' | 'admin' | 'dispatcher' | 'cleaner';
  default_address?: AddressDetails;
  lgpd_consent: boolean;
  onboarding_source?: string;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  sender_type: 'client' | 'agent' | 'system';
  sender_name: string;
  content: string;
  timestamp: string;
  attachment_url?: string;
}

export interface SupportTicket {
  id: string;
  order_id?: string;
  client_id: string;
  client_name: string;
  subject: string;
  department: 'sac' | 'ombudsman' | 'billing' | 'emergency';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'normal' | 'high' | 'urgent';
  messages: SupportMessage[];
  created_at: string;
}
