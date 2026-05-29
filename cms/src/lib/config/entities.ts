// Centralized entity names configuration
// Use this as the single source of truth for all entity names across the CMS

export const ENTITIES = {
  // Explore Sarajevo entities
  explore: {
    businesses: {
      singular: 'Biznis',
      plural: 'Biznisi',
      description: 'Poslovni objekti i kompanije',
    },
    attractions: {
      singular: 'Atrakcija',
      plural: 'Atrakcije',
      description: 'Turističke lokacije i znamenitosti',
    },
    events: {
      singular: 'Događaj',
      plural: 'Događaji',
      description: 'Nadolazeći događaji i manifestacije',
    },
    categories: {
      singular: 'Kategorija',
      plural: 'Kategorije',
      description: 'Kategorije za biznise i atrakcije',
    },
    types: {
      singular: 'Tip',
      plural: 'Tipovi',
      description: 'Podtipovi kategorija',
    },
    sections: {
      singular: 'Sekcija',
      plural: 'Sekcije',
      description: 'Početna stranica sekcije',
    },
  },
  
  // Pametno Odabrano entities
  pametno: {
    products: {
      singular: 'Proizvod',
      plural: 'Proizvodi',
      description: 'Proizvodi u katalogu',
    },
    categories: {
      singular: 'Kategorija',
      plural: 'Kategorije',
      description: 'Kategorije proizvoda',
    },
    brands: {
      singular: 'Brend',
      plural: 'Brendovi',
      description: 'Brendovi proizvoda',
    },
  },
  
  // Hotspot entities
  hotspot: {
    businesses: {
      singular: 'Biznis',
      plural: 'Biznisi',
      description: 'Biznisi za mobilnu aplikaciju',
    },
    categories: {
      singular: 'Kategorija',
      plural: 'Kategorije',
      description: 'Kategorije za mobilnu aplikaciju',
    },
    tags: {
      singular: 'Tag',
      plural: 'Tagovi',
      description: 'Oznake za filtriranje',
    },
  },
  
  // CRM entities
  crm: {
    clients: {
      singular: 'Klijent',
      plural: 'Klijenti',
      description: 'Poslovni klijenti',
    },
    contacts: {
      singular: 'Kontakt',
      plural: 'Kontakti',
      description: 'Kontakt osobe klijenata',
    },
  },
  
  // System entities
  system: {
    users: {
      singular: 'Korisnik',
      plural: 'Korisnici',
      description: 'CMS korisnici',
    },
    roles: {
      singular: 'Uloga',
      plural: 'Uloge',
      description: 'Korisničke uloge',
    },
    activityLogs: {
      singular: 'Aktivnost',
      plural: 'Aktivnosti',
      description: 'Log aktivnosti korisnika',
    },
  },
} as const;

// Navigation section titles
export const NAV_SECTIONS = {
  dashboard: 'Dashboard',
  crm: 'CRM',
  explore: 'Explore Sarajevo',
  pametno: 'Pametno Odabrano',
  hotspot: 'Hotspot',
  settings: 'Postavke',
} as const;

// User roles with translations
export const USER_ROLES = {
  owner: {
    name: { bs: 'Vlasnik', en: 'Owner' },
    description: { bs: 'Potpuni pristup svemu uključujući upravljanje korisnicima', en: 'Full access to everything including user management' },
    level: 100,
  },
  admin: {
    name: { bs: 'Administrator', en: 'Administrator' },
    description: { bs: 'Potpuni pristup sadržaju, ne može upravljati korisnicima', en: 'Full content access, cannot manage users' },
    level: 80,
  },
  moderator: {
    name: { bs: 'Moderator', en: 'Moderator' },
    description: { bs: 'Može uređivati dodijeljen sadržaj', en: 'Can edit assigned content' },
    level: 50,
  },
  employee: {
    name: { bs: 'Zaposlenik', en: 'Employee' },
    description: { bs: 'Ograničen pristup samo dodijeljenim sekcijama', en: 'Limited access to assigned sections only' },
    level: 20,
  },
} as const;

// Helper to get role name/description by language
export function getRoleName(role: keyof typeof USER_ROLES, lang: 'bs' | 'en' = 'bs'): string {
  return USER_ROLES[role]?.name[lang] || role;
}

export function getRoleDescription(role: keyof typeof USER_ROLES, lang: 'bs' | 'en' = 'bs'): string {
  return USER_ROLES[role]?.description[lang] || '';
}

// Sections that can be assigned to users
export const ASSIGNABLE_SECTIONS = [
  { key: 'crm', name: 'CRM', icon: 'Users' },
  { key: 'explore', name: 'Explore Sarajevo', icon: 'Globe' },
  { key: 'pametno', name: 'Pametno Odabrano', icon: 'Package' },
  { key: 'hotspot', name: 'Hotspot', icon: 'Smartphone' },
] as const;

// Action types for activity logging
export const ACTION_TYPES = {
  create: { name: 'Kreiranje', color: 'green' },
  update: { name: 'Ažuriranje', color: 'blue' },
  delete: { name: 'Brisanje', color: 'red' },
  login: { name: 'Prijava', color: 'gray' },
  logout: { name: 'Odjava', color: 'gray' },
  upload: { name: 'Upload', color: 'purple' },
  reorder: { name: 'Promjena redoslijeda', color: 'orange' },
} as const;

// Helper to get entity name
export function getEntityName(
  section: keyof typeof ENTITIES,
  entity: string,
  type: 'singular' | 'plural' = 'plural'
): string {
  const sectionData = ENTITIES[section] as Record<string, { singular: string; plural: string }>;
  return sectionData?.[entity]?.[type] || entity;
}

// Type exports
export type UserRole = keyof typeof USER_ROLES;
export type AssignableSection = (typeof ASSIGNABLE_SECTIONS)[number]['key'];
export type ActionType = keyof typeof ACTION_TYPES;
