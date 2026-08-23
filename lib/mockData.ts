import {
  CleaningService,
  ServiceCategory,
  ServiceOrder,
  UserProfile,
  SupportTicket,
  CleanerTeam
} from './types';

export const INITIAL_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat_residential',
    name: 'Residential',
    slug: 'residential',
    description: 'Everyday home care and meticulous maintenance for flats and houses',
    icon: 'Home',
    color: 'emerald'
  },
  {
    id: 'cat_deep_clean',
    name: 'Deep Cleaning',
    slug: 'deep-clean',
    description: 'Heavy duty grease removal, grout restoration, and hard-to-reach detailing',
    icon: 'Sparkles',
    color: 'sky'
  },
  {
    id: 'cat_turnover',
    name: 'Move-in / Move-out',
    slug: 'turnover',
    description: '100% deposit-back guaranteed handover cleaning for tenants & landlords',
    icon: 'KeyRound',
    color: 'amber'
  },
  {
    id: 'cat_commercial',
    name: 'Commercial & Office',
    slug: 'commercial',
    description: 'Workplace hygiene, meeting rooms, desk sanitization & kitchen maintenance',
    icon: 'Building2',
    color: 'indigo'
  }
];

export const INITIAL_SERVICES: CleaningService[] = [
  {
    id: 'srv_std_res',
    category_id: 'cat_residential',
    name: 'Premium Residential Regular Clean',
    slug: 'regular-residential',
    short_desc: 'Perfect for weekly or bi-weekly home maintenance and dust-free freshness.',
    description: 'A comprehensive room-by-room maintenance cleaning using eco-certified disinfectants. Includes all bedrooms, bathrooms, kitchen exterior surfaces, living areas, and hard flooring mopping.',
    base_price: 149.0,
    estimated_hours: '3 - 4 hrs',
    popular_badge: 'Most Popular',
    icon: 'Sparkles',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    features: [
      'Eco-certified anti-allergen detergents',
      'All floors vacuumed & steam mopped',
      'Bathroom descaling & mirror polishing',
      'Bed linen changing & bed making',
      'Dusting baseboards, doors & ledges'
    ],
    included_tasks: [
      {
        room: 'Kitchen',
        tasks: ['Countertops wiped & disinfected', 'Sink scrubbed & fixtures polished', 'Microwave interior cleaned', 'Cabinet exteriors wiped', 'Trash emptied & relined', 'Stovetop degreased']
      },
      {
        room: 'Bathrooms',
        tasks: ['Shower glass descaled', 'Toilet sanitized inside & out', 'Vanity and sink scrubbed', 'Mirrors streak-free polished', 'Tile wall splash zone wiped']
      },
      {
        room: 'Bedrooms & Living',
        tasks: ['Dusting all reachable surfaces', 'Making beds & fluffing cushions', 'Vacuuming under light furniture', 'Wiping switch plates & door handles', 'Mopping hard surfaces with fresh microfiber']
      }
    ],
    available_addons: [
      { id: 'add_oven', name: 'Inside Heavy-Duty Oven Degrease', description: 'Deep thermal carbon removal and rack cleaning', price: 45, icon: 'Flame', unit: 'per oven' },
      { id: 'add_fridge', name: 'Inside Refrigerator & Freezer Deep Clean', description: 'Shelves washed, odor neutralizer applied', price: 39, icon: 'Refrigerator', unit: 'per unit' },
      { id: 'add_windows', name: 'Interior Windows & Track Vacuuming', description: 'Up to 8 standard interior windows', price: 49, icon: 'AppWindow', unit: 'up to 8 windows' },
      { id: 'add_cabinets', name: 'Inside Empty Kitchen Cabinets', description: 'Wipe down interior shelves and drawers', price: 35, icon: 'Archive', unit: 'all cabinets' },
      { id: 'add_carpet', name: 'Steam Carpet Extraction (1 Room)', description: 'Hot water fiber rinse for stubborn stains', price: 59, icon: 'Layers', unit: 'per room' }
    ]
  },
  {
    id: 'srv_deep_clean',
    category_id: 'cat_deep_clean',
    name: 'Signature 360° Deep Spring Clean',
    slug: 'deep-clean',
    short_desc: 'Intensive restorative cleaning targeting built-up grime, scale, and overlooked nooks.',
    description: 'Designed for homes that haven’t been professionally detailed in over 2 months. Includes deep grout brushing, behind-appliance access, baseboard detailing, doors, vents, and heavy grease removal.',
    base_price: 249.0,
    estimated_hours: '5 - 6 hrs',
    popular_badge: 'High Impact',
    icon: 'ShieldCheck',
    image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    features: [
      'Grout steam scrubbing & mold treatment',
      'Baseboards & light switch hand-wash',
      'Behind and under accessible heavy appliances',
      'Air conditioning filter & vent dusting',
      'Full kitchen hood grease extraction'
    ],
    included_tasks: [
      {
        room: 'Deep Kitchen',
        tasks: ['Range hood filters degreased', 'Backsplash tiles deep scrubbed', 'Exterior appliances polished', 'Trash can sanitized', 'Sink drain enzyme treatment']
      },
      {
        room: 'Deep Bathrooms',
        tasks: ['High pressure grout scrubbing', 'Limescale removal from faucets', 'Showerhead vinegar wrap & unclog', 'Exhaust fan grill dusted', 'Baseboard scrubbing']
      },
      {
        room: 'Whole Home Detailing',
        tasks: ['Ceiling fan blades hand wiped', 'Door frames & handles sanitized', 'Window sills & tracks cleaned', 'Upholstery vacuumed with HEPA filters']
      }
    ],
    available_addons: [
      { id: 'add_oven', name: 'Inside Heavy-Duty Oven Degrease', description: 'Deep thermal carbon removal and rack cleaning', price: 45, icon: 'Flame', unit: 'per oven' },
      { id: 'add_fridge', name: 'Inside Refrigerator & Freezer Deep Clean', description: 'Shelves washed, odor neutralizer applied', price: 39, icon: 'Refrigerator', unit: 'per unit' },
      { id: 'add_balcony', name: 'Balcony / Patio Pressure Wash', description: 'Floors scrubbed, railings wiped, drain unblocked', price: 65, icon: 'Sun', unit: 'up to 150 sqft' },
      { id: 'add_pet_detox', name: 'Enzyme Pet Odor & Hair Extraction', description: 'UV inspection, deep enzymatic upholstery rinse', price: 55, icon: 'Dog', unit: 'full home' }
    ]
  },
  {
    id: 'srv_move_out',
    category_id: 'cat_turnover',
    name: 'Deposit-Back Move-In / Move-Out Turnover',
    slug: 'move-in-out',
    short_desc: 'Comprehensive empty-property turnover clean designed to pass landlord inspections.',
    description: 'Our strictest protocol tailored for property handovers. Includes all interior cabinets, closets, appliances, baseboards, door frames, switch plates, and a timestamped digital inspection report with photo proof.',
    base_price: 319.0,
    estimated_hours: '6 - 7 hrs',
    popular_badge: '100% Guarantee',
    icon: 'KeyRound',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    features: [
      'Inside all cupboards, closets & pantry shelves',
      'Inside fridge, freezer & oven included',
      'Full landlord inspection checklist report',
      'High-resolution before & after photos',
      '48-hour free re-touch guarantee'
    ],
    included_tasks: [
      {
        room: 'Full Property Cabinetry',
        tasks: ['All kitchen cupboards vacuumed & wiped inside/out', 'Bathroom vanity cabinets cleaned inside', 'Closet shelves and hanging rods wiped down', 'Pantry drawers detailed']
      },
      {
        room: 'Deep Kitchen & Appliances',
        tasks: ['Oven interior scrubbed', 'Fridge interior washed', 'Range hood grease filter cleaned', 'Dishwasher filter and seals cleaned']
      },
      {
        room: 'Hygienic Sanitization',
        tasks: ['Hospital-grade disinfectant in bathrooms', 'Cobwebs removed from all ceiling corners', 'Light switches & outlet covers washed', 'All floors edge-to-edge sanitized']
      }
    ],
    available_addons: [
      { id: 'add_balcony', name: 'Balcony / Patio Pressure Wash', description: 'Floors scrubbed, railings wiped, drain unblocked', price: 65, icon: 'Sun', unit: 'up to 150 sqft' },
      { id: 'add_carpet', name: 'Steam Carpet Extraction (2 Rooms)', description: 'Hot water fiber rinse for stubborn stains', price: 99, icon: 'Layers', unit: '2 rooms' },
      { id: 'add_wall_scuff', name: 'Wall Scuff Mark Removal Buffing', description: 'Magic eraser treatment on reachable scuff marks', price: 49, icon: 'Paintbrush', unit: 'per home' }
    ]
  },
  {
    id: 'srv_commercial',
    category_id: 'cat_commercial',
    name: 'Corporate Office & Workspace Sanitization',
    slug: 'commercial-office',
    short_desc: 'Professional sanitization for offices, meeting rooms, breakrooms, and reception areas.',
    description: 'Reliable corporate cleaning maintaining peak hygiene standards. Covers workstation disinfection, trash disposal, restroom sanitation, coffee station detailing, and floor maintenance.',
    base_price: 219.0,
    estimated_hours: '3 - 5 hrs',
    icon: 'Building2',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    features: [
      'High-touch keyboard & desk sanitization',
      'Breakroom microwave & coffee machine descaling',
      'Recycling & trash bag consolidation',
      'Sanitized rest room replenishment & check',
      'Flexible after-hours dispatch'
    ],
    included_tasks: [
      {
        room: 'Workstations & Common Areas',
        tasks: ['Desks and conference tables wiped', 'Glass partition smudge removal', 'Carpet vacuumed & hard floor buffed', 'Waste bins emptied and sanitized']
      },
      {
        room: 'Staff Kitchenette',
        tasks: ['Microwave inside and out cleaned', 'Sink disinfected and scale removed', 'Countertops wiped and sanitized', 'Fridge exterior polished']
      },
      {
        room: 'Office Restrooms',
        tasks: ['Toilets and urinals sanitized', 'Soap dispensers cleaned and checked', 'Mirrors polished', 'Floor mopped with hospital-grade cleaner']
      }
    ],
    available_addons: [
      { id: 'add_server_room', name: 'Anti-Static Server Room Dusting', description: 'Certified ESD dusting for electronics', price: 89, icon: 'Cpu', unit: 'per room' },
      { id: 'add_carpet_com', name: 'Commercial Carpet Bonnet Cleaning', description: 'Fast-drying high-traffic lane cleaning', price: 120, icon: 'Layers', unit: 'up to 500 sqft' }
    ]
  }
];

export const DEMO_CLEANER_TEAMS: CleanerTeam[] = [
  {
    id: 'team_alpha_01',
    name: 'CleanPro Elite Team Alpha',
    lead_cleaner: 'Elena Rostova',
    lead_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    lead_phone: '+1 (555) 234-8891',
    team_size: 2,
    vehicle_plate: 'CP-789-NY',
    rating: 4.95,
    total_jobs: 482,
    eta_minutes: 14,
    specialty: 'Deep Sanitization & Eco-Certification'
  },
  {
    id: 'team_beta_02',
    name: 'CleanPro Precision Team Beta',
    lead_cleaner: 'Carlos Mendez',
    lead_photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    lead_phone: '+1 (555) 891-3320',
    team_size: 3,
    vehicle_plate: 'CP-452-NY',
    rating: 4.98,
    total_jobs: 630,
    eta_minutes: 0,
    specialty: 'Move-in/out Turnover Specialists'
  }
];

export const DEMO_USER: UserProfile = {
  id: 'usr_client_sarah',
  email: 'allanestq@gmail.com',
  full_name: 'Sarah Jenkins',
  phone: '+1 (555) 749-3021',
  avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  role: 'customer',
  lgpd_consent: true,
  default_address: {
    street: '742 Evergreen Terrace',
    number: 'Apt 4B',
    complement: 'Building B, Floor 4',
    neighborhood: 'Greenwich Village',
    city: 'New York',
    state: 'NY',
    zip_code: '10014',
    access_notes: 'Intercom code #402. Elevator on the right.'
  },
  created_at: '2026-05-10T09:30:00Z'
};

export const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: 'ord_live_8912',
    order_number: 'CP-2026-8912',
    client_id: 'usr_client_sarah',
    client_name: 'Sarah Jenkins',
    client_email: 'allanestq@gmail.com',
    client_phone: '+1 (555) 749-3021',
    service_id: 'srv_std_res',
    service_name: 'Premium Residential Regular Clean',
    category_name: 'Residential',
    status: 'in_progress',
    scheduled_date: '2026-08-22',
    time_slot: '13:00 - 17:00 (Afternoon Slot)',
    address: {
      street: '742 Evergreen Terrace',
      number: 'Apt 4B',
      complement: 'Building B, Floor 4',
      neighborhood: 'Greenwich Village',
      city: 'New York',
      state: 'NY',
      zip_code: '10014',
      access_notes: 'Intercom code #402. Golden retriever is in the crate in bedroom 2.'
    },
    property_details: {
      property_type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      kitchens: 1,
      living_rooms: 1,
      sq_ft: 950,
      has_pets: true,
      pet_details: '1 Friendly Golden Retriever'
    },
    selected_addons: [
      {
        addon_id: 'add_oven',
        name: 'Inside Heavy-Duty Oven Degrease',
        unit_price: 45,
        quantity: 1,
        total_price: 45
      },
      {
        addon_id: 'add_fridge',
        name: 'Inside Refrigerator & Freezer Deep Clean',
        unit_price: 39,
        quantity: 1,
        total_price: 39
      }
    ],
    frequency: 'bi_weekly',
    pricing_breakdown: {
      base_price: 149.0,
      property_size_fee: 20.0,
      extra_rooms_fee: 30.0,
      addons_total: 84.0,
      subtotal: 283.0,
      discount_percentage: 15,
      discount_amount: 42.45,
      taxes_and_insurance: 19.24,
      total_amount: 259.79
    },
    assigned_team: DEMO_CLEANER_TEAMS[0],
    checklist: [
      {
        room_name: 'Kitchen & Dining',
        icon: 'Utensils',
        items: [
          { id: 'chk_1', label: 'Countertops wiped & disinfected', completed: true, completed_at: '13:35', completed_by: 'Elena R.' },
          { id: 'chk_2', label: 'Sink scrubbed & chrome faucets polished', completed: true, completed_at: '13:42', completed_by: 'Elena R.' },
          { id: 'chk_3', label: 'Stovetop degreased & burner caps cleaned', completed: true, completed_at: '13:58', completed_by: 'Elena R.' },
          { id: 'chk_4', label: 'Inside Refrigerator sanitized (Addon)', completed: true, completed_at: '14:15', completed_by: 'Marco S.' },
          { id: 'chk_5', label: 'Inside Oven degreased (Addon)', completed: false }
        ]
      },
      {
        room_name: 'Master Bath & Guest Bath',
        icon: 'Bath',
        items: [
          { id: 'chk_6', label: 'Shower glass descaled & streak-free polished', completed: true, completed_at: '14:28', completed_by: 'Marco S.' },
          { id: 'chk_7', label: 'Toilets sanitized inside & out with bio-shield', completed: true, completed_at: '14:35', completed_by: 'Marco S.' },
          { id: 'chk_8', label: 'Tile grout steam cleaned', completed: false },
          { id: 'chk_9', label: 'Mirrors and vanity lights polished', completed: false }
        ]
      },
      {
        room_name: 'Living Room & Bedrooms',
        icon: 'BedDouble',
        items: [
          { id: 'chk_10', label: 'High dusting & ceiling fan blades cleaned', completed: true, completed_at: '13:20', completed_by: 'Elena R.' },
          { id: 'chk_11', label: 'All floors vacuumed with HEPA filter', completed: false },
          { id: 'chk_12', label: 'Hardwood floor microfiber damp mop', completed: false }
        ]
      }
    ],
    inspection_photos: [
      {
        id: 'pic_01',
        room: 'Kitchen Stovetop & Hood',
        title: 'Heavy Grease Stovetop Detailing',
        before_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        after_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        before_timestamp: '13:12:04',
        after_timestamp: '13:58:22',
        inspector_notes: 'Degreased baked-on oil rings and polished stainless backplate.',
        verified: true
      },
      {
        id: 'pic_02',
        room: 'Master Bathroom Shower',
        title: 'Glass Door Limescale Restoration',
        before_url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80',
        after_url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
        before_timestamp: '13:25:10',
        after_timestamp: '14:28:44',
        inspector_notes: 'Removed 100% hard water scale from floor-to-ceiling glass panel.',
        verified: true
      }
    ],
    payment_status: 'paid',
    payment_details: {
      method: 'pix',
      pix_key: 'payments@cleanpro-ecosystem.com',
      pix_qr_code: '00020126580014BR.GOV.BCB.PIX0136e1b6f001-44bb-4e6a-bc01-cleanpro5204000053039865406259.795802BR5916CleanPro Service6009NEW YORK62070503***6304E8A1',
      paid_at: '2026-08-21T18:40:12Z',
      transaction_id: 'TXN-PIX-99482103'
    },
    notes_for_cleaners: 'Please use extra care with the marble counter in the master bathroom.',
    created_at: '2026-08-20T10:15:00Z',
    updated_at: '2026-08-22T14:40:00Z'
  },
  {
    id: 'ord_past_7741',
    order_number: 'CP-2026-7741',
    client_id: 'usr_client_sarah',
    client_name: 'Sarah Jenkins',
    client_email: 'allanestq@gmail.com',
    client_phone: '+1 (555) 749-3021',
    service_id: 'srv_deep_clean',
    service_name: 'Signature 360° Deep Spring Clean',
    category_name: 'Deep Cleaning',
    status: 'completed',
    scheduled_date: '2026-08-08',
    time_slot: '08:00 - 13:00 (Morning Slot)',
    address: {
      street: '742 Evergreen Terrace',
      number: 'Apt 4B',
      complement: 'Building B, Floor 4',
      neighborhood: 'Greenwich Village',
      city: 'New York',
      state: 'NY',
      zip_code: '10014'
    },
    property_details: {
      property_type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      kitchens: 1,
      living_rooms: 1,
      sq_ft: 950,
      has_pets: true
    },
    selected_addons: [
      {
        addon_id: 'add_windows',
        name: 'Interior Windows & Track Vacuuming',
        unit_price: 49,
        quantity: 1,
        total_price: 49
      }
    ],
    frequency: 'one_time',
    pricing_breakdown: {
      base_price: 249.0,
      property_size_fee: 25.0,
      extra_rooms_fee: 30.0,
      addons_total: 49.0,
      subtotal: 353.0,
      discount_percentage: 0,
      discount_amount: 0,
      taxes_and_insurance: 28.24,
      total_amount: 381.24
    },
    assigned_team: DEMO_CLEANER_TEAMS[1],
    checklist: [
      {
        room_name: 'Full Deep Clean Checklist',
        icon: 'CheckCircle2',
        items: [
          { id: 'c1', label: 'High steam sanitization across all floors', completed: true, completed_at: '11:45' },
          { id: 'c2', label: 'Tile grout deep acid rinse & seal', completed: true, completed_at: '12:10' },
          { id: 'c3', label: 'Air vents and AC grill filters dusted', completed: true, completed_at: '12:30' },
          { id: 'c4', label: 'Interior windows crystal clean polished', completed: true, completed_at: '12:55' }
        ]
      }
    ],
    inspection_photos: [
      {
        id: 'pic_past_01',
        room: 'Living Room Windows',
        title: 'Floor-to-Ceiling Windows & Track Detailing',
        before_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        after_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        before_timestamp: '08:30:15',
        after_timestamp: '12:45:10',
        inspector_notes: 'Tracks vacuumed free of dust and glass sealed with hydrophobic coat.',
        verified: true
      }
    ],
    client_signature: {
      signature_image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 50 Q 50 10 90 40 T 170 30" stroke="%230284c7" stroke-width="3" fill="none"/></svg>',
      signer_name: 'Sarah Jenkins',
      signed_at: '2026-08-08T13:02:11Z'
    },
    payment_status: 'paid',
    payment_details: {
      method: 'credit_card',
      card_last4: '4242',
      card_brand: 'Mastercard',
      paid_at: '2026-08-08T13:05:00Z',
      transaction_id: 'TXN-CC-88401923'
    },
    rating: {
      rating: 5,
      punctuality_score: 5,
      cleanliness_score: 5,
      professionalism_score: 5,
      comment: 'Carlos and the team did an astonishing job! The grout looks brand new and the apartment smells fresh and clean.',
      tags: ['Spotless Detailing', 'Very Punctual', 'Respectful with Pets'],
      submitted_at: '2026-08-08T15:20:00Z'
    },
    created_at: '2026-08-05T11:00:00Z',
    updated_at: '2026-08-08T15:20:00Z'
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_sac_109',
    order_id: 'ord_live_8912',
    client_id: 'usr_client_sarah',
    client_name: 'Sarah Jenkins',
    subject: 'Special Request: Key Pickup & Dog Crate Care',
    department: 'sac',
    status: 'in_progress',
    priority: 'normal',
    messages: [
      {
        id: 'msg_1',
        sender_type: 'client',
        sender_name: 'Sarah Jenkins',
        content: 'Hi! Just wanted to confirm that the team knows our golden retriever Bailey is resting in bedroom 2 and is super gentle.',
        timestamp: '12:30'
      },
      {
        id: 'msg_2',
        sender_type: 'agent',
        sender_name: 'Dispatcher Ryan (CleanPro SAC)',
        content: 'Hello Sarah! Yes, Elena and Marco have this highlighted in their dispatch tablet. They love dogs and will make sure bedroom 2 is treated calmly. Let us know if you need anything else!',
        timestamp: '12:34'
      }
    ],
    created_at: '2026-08-22T12:30:00Z'
  }
];
