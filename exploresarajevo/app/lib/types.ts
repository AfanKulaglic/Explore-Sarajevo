// src/lib/types.ts

import { ReactNode } from 'react';

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  text: ReactNode;
  image: string;
  icon: any;
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  subcategories?: Subcategory[]; // podkategorije su sada dio svake glavne kategorije
}

export interface Business {
  featured: any;
  text: ReactNode;
  subcategory?: Subcategory | null;
  id: string | number;
  name: string;
  slug: string;
  categoryId?: string; // Category name or ID
  parentCategoryId?: string;
  brandId?: string | number | null;
  brandName?: string; // From API
  brandSlug?: string; // From API
  description?: string;
  address?: string;
  location?: string; // "lat,long"
  rating?: number;
  workingHours?: string;
  working_hours?: string; // API uses snake_case
  images?: string[] | null;
  phone?: string;
  website?: string;
  categories?: (Category & { is_highlight?: boolean; is_premium?: boolean })[];
  sections?: { id?: number | string; is_highlight?: boolean; is_premium?: boolean }[];
  types?: any[];
  place_type?: string;
}

export interface AttractiveLocation {
  id: string;
  name: string;
  slug: string;
  categoryId: string; // tip atrakcije npr. history, nature, adventure
  description: string;
  address: string;
  location: string; // "lat,long"
  phone?: string;
  email?: string;
  website?: string;
  images: string[];
  featuredLocation?: boolean;
  categories?: Category[];
  // Optional types array (from API) - added so components can safely access `attraction.types`
  types?: { id?: number | string; name: string }[];
}

export interface ApiResponse {
  businesses: Business[];
  categories: Category[];
  attractiveLocations: AttractiveLocation[];
}

// Hotspot Blocks & Sets
export interface HotspotBlock {
  id: string; // unique per block
  image?: File | string; // File (new upload) or existing image URL
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface HotspotBlockSetStyles {
  blockBackground: string; // rgba(...)
  titleColor: string; // rgba(...)
  descriptionColor: string; // rgba(...)
  buttonBackground: string; // rgba(...)
  buttonTextColor: string; // rgba(...)
}

export interface HotspotBlockSet {
  id: string; // unique per set
  blocks: HotspotBlock[];
  styles: HotspotBlockSetStyles;
}

export interface HotspotPayload {
  sets: HotspotBlockSet[];
}
