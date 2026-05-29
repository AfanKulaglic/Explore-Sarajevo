// Types for Smart Picks Saraya

export interface Company {
  id: string;
  name: string;
  logo?: string;
  marketplace_url: string;
}

export interface CTA {
  label?: string;
  url: string;
}

export interface ImageData {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface CollectionMeta {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  background_image: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  marketplace_url: string;
  founded?: string;
  headquarters?: string;
  values?: string[];
  items?: Item[];
  // English translations
  name_en?: string;
  description_en?: string;
}

export interface CollectionResponse {
  collection: CollectionMeta;
  categories?: CategoryData[][];
  items: Item[];
  brands?: Brand[];
}

export interface Item {
  id: string;
  slug: string;
  type: string;
  category: string;
  category_en?: string;
  title: string;
  short_description: string;
  long_description?: string;
  order?: number;
  price?: number;
  currency?: string;
  ranking_score?: number;
  tags?: string[];
  published_at?: string;
  image: ImageData;
  image_alt?: string;
  gallery?: string[];
  company: Company;
  badges?: string[];
  featured?: boolean;
  key_features?: string[];
  specifications?: Record<string, string>;
  cta: CTA;
  cta_text?: string;
  // English translations (from CMS)
  title_en?: string;
  short_description_en?: string;
  long_description_en?: string;
  image_alt_en?: string;
  cta_text_en?: string;
  key_features_en?: string[];
  badges_en?: string[];
}

export interface CategoryData {
  name: string;
  text: string;
  image: string;
  // English translations
  name_en?: string;
  text_en?: string;
}
