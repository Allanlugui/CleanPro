import { CleaningService, ServiceCategory } from './types';

export const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'Residential',
    name: 'Residential',
    slug: 'residential',
    description: 'Everyday home care and meticulous maintenance for flats and houses',
    icon: 'Home',
    color: 'emerald'
  },
  {
    id: 'Commercial',
    name: 'Commercial',
    slug: 'commercial',
    description: 'Workplace hygiene, meeting rooms, desk sanitization & office maintenance',
    icon: 'Building2',
    color: 'indigo'
  },
  {
    id: 'Deep Cleaning',
    name: 'Deep Cleaning',
    slug: 'deep-clean',
    description: 'Heavy duty grease removal, grout restoration, and hard-to-reach detailing',
    icon: 'Sparkles',
    color: 'sky'
  },
  {
    id: 'Post-Construction',
    name: 'Post-Construction',
    slug: 'post-construction',
    description: 'Drywall dust removal, residue cleanup, and site turnover detailing',
    icon: 'Paintbrush',
    color: 'amber'
  },
  {
    id: 'Disinfection & Sanitization',
    name: 'Disinfection & Sanitization',
    slug: 'disinfection',
    description: 'Hospital-grade misting, anti-pathogen fogging & high-touch sanitization',
    icon: 'ShieldCheck',
    color: 'emerald'
  },
  {
    id: 'Move-In/Move-Out',
    name: 'Move-In/Move-Out',
    slug: 'move-in-out',
    description: '100% deposit-back guaranteed handover cleaning for tenants & landlords',
    icon: 'KeyRound',
    color: 'violet'
  },
  {
    id: 'Carpet & Upholstery',
    name: 'Carpet & Upholstery',
    slug: 'carpet-upholstery',
    description: 'Steam extraction, stain elimination and deep fiber restoration',
    icon: 'Layers',
    color: 'rose'
  }
];

export const DEFAULT_SERVICES: CleaningService[] = [
  {
    id: '7b8b2cb3-0e83-4a67-b5b4-2b6d1e4a1101',
    category_id: 'Residential',
    category: 'Residential',
    name: 'Premium Residential Regular Clean',
    title: 'Premium Residential Regular Clean',
    slug: 'regular-residential',
    short_desc: 'Perfect for weekly or bi-weekly home maintenance and dust-free freshness.',
    description: 'A comprehensive room-by-room maintenance cleaning using eco-certified disinfectants. Includes all bedrooms, bathrooms, kitchen exterior surfaces, living areas, and hard flooring mopping.',
    base_price: 149.0,
    duration_minutes: 180,
    estimated_hours: '3 - 4 hrs',
    popular_badge: 'Most Popular',
    icon: 'Sparkles',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    is_active: true,
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
        tasks: [
          'Countertops wiped & disinfected',
          'Sink scrubbed & fixtures polished',
          'Microwave interior cleaned',
          'Cabinet exteriors wiped',
          'Trash emptied & relined',
          'Stovetop degreased'
        ]
      },
      {
        room: 'Bathrooms',
        tasks: [
          'Shower glass descaled',
          'Toilet sanitized inside & out',
          'Vanity and sink scrubbed',
          'Mirrors streak-free polished',
          'Tile wall splash zone wiped'
        ]
      },
      {
        room: 'Bedrooms & Living',
        tasks: [
          'Dusting all reachable surfaces',
          'Making beds & fluffing cushions',
          'Vacuuming under light furniture',
          'Wiping switch plates & door handles',
          'Mopping hard surfaces with fresh microfiber'
        ]
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
    id: '7b8b2cb3-0e83-4a67-b5b4-2b6d1e4a1102',
    category_id: 'Deep Cleaning',
    category: 'Deep Cleaning',
    name: 'Signature 360° Deep Spring Clean',
    title: 'Signature 360° Deep Spring Clean',
    slug: 'deep-clean',
    short_desc: 'Intensive restorative cleaning targeting built-up grime, scale, and overlooked nooks.',
    description: 'Designed for homes that haven’t been professionally detailed in over 2 months. Includes deep grout brushing, behind-appliance access, baseboard detailing, doors, vents, and heavy grease removal.',
    base_price: 249.0,
    duration_minutes: 300,
    estimated_hours: '5 - 6 hrs',
    popular_badge: 'High Impact',
    icon: 'ShieldCheck',
    image_url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    is_active: true,
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
    id: '7b8b2cb3-0e83-4a67-b5b4-2b6d1e4a1103',
    category_id: 'Move-In/Move-Out',
    category: 'Move-In/Move-Out',
    name: 'Deposit-Back Move-In / Move-Out Turnover',
    title: 'Deposit-Back Move-In / Move-Out Turnover',
    slug: 'move-in-out',
    short_desc: 'Comprehensive empty-property turnover clean designed to pass landlord inspections.',
    description: 'Our strictest protocol tailored for property handovers. Includes all interior cabinets, closets, appliances, baseboards, door frames, switch plates, and a timestamped digital inspection report with photo proof.',
    base_price: 319.0,
    duration_minutes: 360,
    estimated_hours: '6 - 7 hrs',
    popular_badge: '100% Guarantee',
    icon: 'KeyRound',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    is_active: true,
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
    id: '7b8b2cb3-0e83-4a67-b5b4-2b6d1e4a1104',
    category_id: 'Commercial',
    category: 'Commercial',
    name: 'Corporate Office & Workspace Sanitization',
    title: 'Corporate Office & Workspace Sanitization',
    slug: 'commercial-office',
    short_desc: 'Professional sanitization for offices, meeting rooms, breakrooms, and reception areas.',
    description: 'Reliable corporate cleaning maintaining peak hygiene standards. Covers workstation disinfection, trash disposal, restroom sanitation, coffee station detailing, and floor maintenance.',
    base_price: 219.0,
    duration_minutes: 240,
    estimated_hours: '3 - 5 hrs',
    icon: 'Building2',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    is_active: true,
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
  },
  {
    id: '7b8b2cb3-0e83-4a67-b5b4-2b6d1e4a1105',
    category_id: 'Post-Construction',
    category: 'Post-Construction',
    name: 'Post-Construction Rough & Final Detailing',
    title: 'Post-Construction Rough & Final Detailing',
    slug: 'post-construction-detail',
    short_desc: 'Heavy-duty removal of drywall dust, paint splatter, adhesive, and construction debris.',
    description: 'Multi-stage deep extraction after renovations or new builds. Includes HEPA air scrubbing, paint and tape residue removal from glass, floor vacuuming and damp mop scrub.',
    base_price: 349.0,
    duration_minutes: 360,
    estimated_hours: '6 - 8 hrs',
    icon: 'Paintbrush',
    image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    features: [
      'HEPA filtration drywall dust extraction',
      'Paint overspray and adhesive sticker scraping',
      'Window glass & track detailed polish',
      'Light fixtures, outlets & switch plate wipe',
      'HVAC intake vent vacuuming'
    ],
    included_tasks: [
      {
        room: 'All Rooms & Hallways',
        tasks: ['Ceilings, walls and baseboards dusted', 'Floors deep vacuumed & mopped multiple passes', 'Doors and hardware polished']
      },
      {
        room: 'Glass & Fixtures',
        tasks: ['Labels and tape removed from new windows', 'Plumbing fixtures descaled and polished', 'Cabinet interiors vacuumed']
      }
    ],
    available_addons: [
      { id: 'add_debris_haul', name: 'Debris & Packaging Bag Hauling', description: 'Removal of cardboard boxes and renovation bags', price: 95, icon: 'Archive', unit: 'per load' }
    ]
  },
  {
    id: '7b8b2cb3-0e83-4a67-b5b4-2b6d1e4a1106',
    category_id: 'Disinfection & Sanitization',
    category: 'Disinfection & Sanitization',
    name: 'Certified Antimicrobial Misting & Disinfection',
    title: 'Certified Antimicrobial Misting & Disinfection',
    slug: 'antimicrobial-disinfection',
    short_desc: 'Hospital-grade electrostatic fogging and microbial decontamination protocol.',
    description: 'EPA-registered hospital-grade disinfectant fogging capable of eliminating 99.99% of bacteria and viruses on all exposed surfaces, fabrics, and ventilation surfaces.',
    base_price: 199.0,
    duration_minutes: 120,
    estimated_hours: '2 - 3 hrs',
    icon: 'ShieldCheck',
    image_url: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    features: [
      'EPA-registered broad-spectrum disinfectant',
      'Electrostatic 360° contact fogging',
      'Touchpoint dwell-time sterilization',
      'Official sanitization certificate issued',
      'Safe for pets and children within 30 min'
    ],
    included_tasks: [
      {
        room: 'Full Premise Treatment',
        tasks: ['Complete room fogging aerosol mist', 'Door handles, railings, controls wiped', 'Kitchen prep areas sanitized', 'Bathroom fixtures sterilized']
      }
    ],
    available_addons: [
      { id: 'add_hvac_mist', name: 'HVAC Air Return Sanitization', description: 'Disinfectant mist through primary air intake', price: 49, icon: 'Cpu', unit: 'per system' }
    ]
  },
  {
    id: '7b8b2cb3-0e83-4a67-b5b4-2b6d1e4a1107',
    category_id: 'Carpet & Upholstery',
    category: 'Carpet & Upholstery',
    name: 'Hot Water Thermal Carpet & Sofa Extraction',
    title: 'Hot Water Thermal Carpet & Sofa Extraction',
    slug: 'carpet-upholstery-deep',
    short_desc: 'Industrial hot water steam extraction, allergen flush, and deep fabric revival.',
    description: 'Dual-motor hot water injection and powerful vacuum extraction to remove embedded dust mites, pet dander, coffee stains, and odors from carpets and sofas.',
    base_price: 179.0,
    duration_minutes: 150,
    estimated_hours: '2 - 4 hrs',
    icon: 'Layers',
    image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    features: [
      '200°F hot water steam injection',
      'Enzyme pretreatment for spots & stains',
      'Deep fiber pile lift and groom',
      'Quick-dry turbo fan technology',
      'Fabric protection seal application'
    ],
    included_tasks: [
      {
        room: 'Carpet Areas',
        tasks: ['Pre-vacuum with commercial upright', 'Enzyme pre-spray on high traffic zones', 'Hot water extraction extraction pass', 'Fiber neutralization rinse']
      }
    ],
    available_addons: [
      { id: 'add_sofa_clean', name: '3-Seater Fabric Sofa Extraction', description: 'Deep shampoo and hot water extraction', price: 79, icon: 'Sofa', unit: 'per sofa' }
    ]
  }
];
