import { CollectionResponse, Item, Brand, CategoryData, CollectionMeta } from "./types";
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchCollections,
  fetchProductBySlug,
  fetchCategoryBySlug,
  fetchBrandBySlug,
  ApiProduct,
  ApiBrand,
  ApiCategory,
  ApiCollection
} from "./api";

// Helper function to generate URL-friendly slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[đ]/g, 'd')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Transform API product to frontend Item format
function transformProduct(product: ApiProduct): Item {
  // Get primary category name (first one)
  const primaryCategory = product.categories?.[0]?.name || 'Ostalo';
  const primaryCategoryEn = product.categories?.[0]?.name_en || '';
  
  return {
    id: String(product.id),
    slug: product.slug || slugify(product.title),
    type: product.type || 'product',
    category: primaryCategory,
    category_en: primaryCategoryEn,
    title: product.title,
    short_description: product.short_description || '',
    long_description: product.long_description,
    order: product.display_order,
    ranking_score: product.ranking_score,
    tags: product.tags?.map(t => t.name) || [],
    published_at: product.published_at,
    image: {
      url: product.image_url || '/assets/placeholder.jpg',
      alt: product.image_alt || product.title,
      width: 800,
      height: 600
    },
    image_alt: product.image_alt,
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
    company: {
      id: product.brand?.id ? String(product.brand.id) : '',
      name: product.brand_name || product.brand?.name || 'Unknown',
      logo: product.brand_logo || product.brand?.logo,
      marketplace_url: `/brands/${product.brand_slug || product.brand?.slug || ''}`
    },
    badges: product.badges || [],
    featured: product.featured || false,
    key_features: product.key_features || [],
    specifications: product.specifications,
    cta: {
      label: product.cta_text,
      url: product.cta_url || `/products/${product.slug}`
    },
    cta_text: product.cta_text,
    // English translations
    title_en: product.title_en,
    short_description_en: product.short_description_en,
    long_description_en: product.long_description_en,
    image_alt_en: product.image_alt_en,
    cta_text_en: product.cta_text_en,
    key_features_en: product.key_features_en,
    badges_en: product.badges_en
  };
}

// Transform API brand to frontend Brand format
function transformBrand(brand: ApiBrand): Brand {
  return {
    id: String(brand.id),
    name: brand.name,
    logo: brand.logo_url || brand.logo || '/assets/brand-placeholder.png',
    description: brand.description || '',
    marketplace_url: brand.marketplace_url || `/brands/${brand.slug}`,
    founded: brand.founded,
    headquarters: brand.headquarters,
    values: brand.values || [],
    items: brand.products?.map(transformProduct),
    // English translations
    description_en: brand.description_en
  };
}

// Transform API category to frontend CategoryData format
function transformCategory(category: ApiCategory): CategoryData {
  return {
    name: category.name,
    text: category.description || '',
    image: category.image || '/assets/category-placeholder.jpg',
    // English translations
    name_en: category.name_en,
    text_en: category.description_en
  };
}

// Main data fetcher - replaces mock data
export async function getCollectionData(): Promise<CollectionResponse> {
  try {
    // Fetch all data in parallel
    const [products, categories, brands, collections] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBrands(),
      fetchCollections()
    ]);

    // Get the first active collection for the collection meta (or use default)
    const mainCollection = collections?.[0];
    const collectionMeta: CollectionMeta = mainCollection ? {
      id: String(mainCollection.id),
      title: mainCollection.title || mainCollection.name,
      subtitle: mainCollection.subtitle || '',
      intro: mainCollection.intro || '',
      background_image: mainCollection.background_image || '/assets/editors-hero.jpg'
    } : {
      id: 'default',
      title: 'Pametno odabrano',
      subtitle: 'Proizvodi koje preporučuje naše uredništvo',
      intro: 'Pažljivo odabrani uređaji koji spajaju performanse, stil i vrijednost.',
      background_image: '/assets/editors-hero.jpg'
    };

    // Transform products
    const transformedItems = products.map(transformProduct);

    // Transform brands
    const transformedBrands = brands.map(transformBrand);

    // Transform categories (nested in array to match existing structure)
    const transformedCategories = categories.map(transformCategory);

    return {
      collection: collectionMeta,
      categories: [transformedCategories],
      items: transformedItems,
      brands: transformedBrands
    };
  } catch (error) {
    console.error('Error fetching collection data:', error);
    // Return fallback data
    return {
      collection: {
        id: 'fallback',
        title: 'Pametno odabrano',
        subtitle: 'Proizvodi koje preporučuje naše uredništvo',
        intro: 'Pažljivo odabrani uređaji koji spajaju performanse, stil i vrijednost.',
        background_image: '/assets/editors-hero.jpg'
      },
      categories: [[]],
      items: [],
      brands: []
    };
  }
}

// Get single product by slug
export async function getProductBySlug(slug: string): Promise<Item | null> {
  try {
    const product = await fetchProductBySlug(slug);
    if (!product) return null;
    return transformProduct(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Get category with products
export async function getCategoryWithProducts(slug: string): Promise<{
  category: CategoryData;
  products: Item[];
} | null> {
  try {
    const category = await fetchCategoryBySlug(slug);
    if (!category) return null;
    
    return {
      category: transformCategory(category),
      products: category.products?.map(transformProduct) || []
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

// Get brand with products
export async function getBrandWithProducts(slug: string): Promise<Brand | null> {
  try {
    const brand = await fetchBrandBySlug(slug);
    if (!brand) return null;
    return transformBrand(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

// Get all brands
export async function getAllBrands(): Promise<Brand[]> {
  try {
    const brands = await fetchBrands();
    return brands.map(transformBrand);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

// Get all categories
export async function getAllCategories(): Promise<CategoryData[]> {
  try {
    const categories = await fetchCategories();
    return categories.map(transformCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
