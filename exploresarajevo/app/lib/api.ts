// API client for fetching data from Saraya Connect CMS
const API_BASE_URL = process.env.CMS_URL || 'http://localhost:3003';

/**
 * Fetch all businesses with categories, types, and brands
 */
export async function getBusinesses() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/businesses`, {
      next: { revalidate: 60, tags: ['businesses'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch businesses: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
}

/**
 * Fetch all categories with subcategories (types)
 * Used for category pages where we need all categories
 */
export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/categories?all=true`, {
      next: { revalidate: 300, tags: ['categories'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch categories: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch only featured categories (for homepage display)
 * Controlled via CMS featured_category flag
 */
export async function getFeaturedCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/categories`, {
      next: { revalidate: 300, tags: ['categories'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch featured categories: ${res.status}`);
      return [];
    }
    
    const featured = await res.json();
    if (Array.isArray(featured) && featured.length > 0) {
      return featured;
    }
    // Fallback when no categories are marked featured in CMS
    return getCategories();
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    return [];
  }
}

/**
 * Fetch all attractions with categories
 */
export async function getAttractions() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/attractions`, {
      next: { revalidate: 60, tags: ['attractions'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch attractions: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching attractions:', error);
    return [];
  }
}

/**
 * Fetch active events with subevents
 */
export async function getEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/events`, {
      next: { revalidate: 60, tags: ['events'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch events: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Fetch all brands
 */
export async function getBrands() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/brands`, {
      next: { revalidate: 300, tags: ['brands'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch brands: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

/**
 * Fetch all types (subcategories)
 */
export async function getTypes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/types`, {
      next: { revalidate: 300, tags: ['types'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch types: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
}

/**
 * Fetch subevents for a specific event or all subevents
 */
export async function getSubevents(eventId?: string) {
  try {
    const url = eventId 
      ? `${API_BASE_URL}/api/explore/public/subevents?event_id=${eventId}`
      : `${API_BASE_URL}/api/explore/public/subevents`;
      
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['subevents'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch subevents: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching subevents:', error);
    return [];
  }
}

/**
 * Fetch highlights (premium or regular) with context filtering
 */
export async function getHighlights(filters?: {
  place_type?: string;
  level?: string;
  context?: string;
  context_id?: number;
  section_id?: number;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.place_type) params.append('place_type', filters.place_type);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.context) params.append('context', filters.context);
    if (filters?.context_id) params.append('context_id', String(filters.context_id));
    if (filters?.section_id) params.append('section_id', String(filters.section_id));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const url = `${API_BASE_URL}/api/explore/public/highlights${params.toString() ? `?${params}` : ''}`;
    
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['highlights'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch highlights: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return [];
  }
}

/**
 * Fetch homepage listing (featured businesses and attractions)
 */
export async function getHomePageListing(limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/explore/public/homepage-listing?limit=${limit}`, {
      next: { revalidate: 60, tags: ['homepage', 'businesses', 'attractions'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch homepage listing: ${res.status}`);
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching homepage listing:', error);
    return [];
  }
}

