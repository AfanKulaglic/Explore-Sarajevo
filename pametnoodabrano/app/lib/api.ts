// API client for pametno-saraya frontend
// Fetches data from the Express backend at port 3003

// Server-side fetches use internal URL (faster, no proxy), client-side falls back to public URL
const API_BASE = process.env.CMS_URL || 'http://localhost:3003';

// Type definitions for API responses (matching database schema)
export interface ApiProduct {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  image_url: string;
  image_alt: string;
  gallery: string[];
  brand_id: number | null;
  type: string;
  key_features: string[];
  specifications: Record<string, string>;
  ranking_score: number;
  display_order: number;
  featured: boolean;
  badges: string[];
  cta_url: string;
  cta_text: string;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // English translations
  title_en?: string;
  short_description_en?: string;
  long_description_en?: string;
  image_alt_en?: string;
  cta_text_en?: string;
  key_features_en?: string[];
  badges_en?: string[];
  // Joined data
  brand_name: string | null;
  brand_slug: string | null;
  brand_logo: string | null;
  brand?: {
    id: number;
    name: string;
    slug: string;
    logo: string;
  };
  categories: Array<{ id: number; name: string; slug: string; name_en?: string }>;
  tags: Array<{ id: number; name: string; slug: string; name_en?: string }>;
}

export interface ApiBrand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  logo_url: string;  // Actual logo field from database
  description: string;
  marketplace_url: string;
  founded: string;
  headquarters: string;
  values: string[];
  created_at: string;
  updated_at: string;
  // English translation
  description_en?: string;
  products?: ApiProduct[];
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // English translations
  name_en?: string;
  description_en?: string;
  products?: ApiProduct[];
}

export interface ApiCollection {
  id: number;
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  background_image: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // English translations
  name_en?: string;
  title_en?: string;
  subtitle_en?: string;
  intro_en?: string;
  products?: ApiProduct[];
}

// Fetch all products (published only)
export async function fetchProducts(options?: {
  featured?: boolean;
  category_id?: number;
  brand_id?: number;
}): Promise<ApiProduct[]> {
  const params = new URLSearchParams();
  if (options?.featured) params.append('featured', 'true');
  if (options?.category_id) params.append('category_id', String(options.category_id));
  if (options?.brand_id) params.append('brand_id', String(options.brand_id));

  const url = `${API_BASE}/api/pametno/public/products${params.toString() ? '?' + params : ''}`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error('Failed to fetch products:', res.status);
    return [];
  }
  return res.json();
}

// Fetch single product by slug
export async function fetchProductBySlug(slug: string): Promise<ApiProduct | null> {
  const res = await fetch(`${API_BASE}/api/pametno/public/products/${slug}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

// Fetch featured products
export async function fetchFeaturedProducts(limit: number = 10): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/api/pametno/public/featured?limit=${limit}`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    console.error('Failed to fetch featured products:', res.status);
    return [];
  }
  return res.json();
}

// Fetch all categories (active only)
export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_BASE}/api/pametno/public/categories`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    console.error('Failed to fetch categories:', res.status);
    return [];
  }
  return res.json();
}

// Fetch category with products by slug
export async function fetchCategoryBySlug(slug: string): Promise<ApiCategory | null> {
  const res = await fetch(`${API_BASE}/api/pametno/public/categories/${slug}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

// Fetch all brands
export async function fetchBrands(): Promise<ApiBrand[]> {
  const res = await fetch(`${API_BASE}/api/pametno/public/brands`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    console.error('Failed to fetch brands:', res.status);
    return [];
  }
  return res.json();
}

// Fetch brand with products by slug
export async function fetchBrandBySlug(slug: string): Promise<ApiBrand | null> {
  const res = await fetch(`${API_BASE}/api/pametno/public/brands/${slug}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

// Fetch all collections (active only)
export async function fetchCollections(): Promise<ApiCollection[]> {
  const res = await fetch(`${API_BASE}/api/pametno/public/collections`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    console.error('Failed to fetch collections:', res.status);
    return [];
  }
  return res.json();
}

// Fetch collection with products by slug
export async function fetchCollectionBySlug(slug: string): Promise<ApiCollection | null> {
  const res = await fetch(`${API_BASE}/api/pametno/public/collections/${slug}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}
