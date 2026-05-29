/**
 * Database types for Supabase
 * Auto-generated types would go here, but we'll define the ones we need manually
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  sarayaconnect: {
    Tables: {
      [tableName: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
  public: {
    Tables: {
      // =====================================================
      // HOTSPOT TABLES (hs_ prefix)
      // =====================================================
      hs_hero_videos: {
        Row: {
          id: number
          video_url: string
          video_url_alt: string | null
          poster_url: string | null
          title_ba: string | null
          title_en: string | null
          subtitle_ba: string | null
          subtitle_en: string | null
          button_text_ba: string | null
          button_text_en: string | null
          button_link: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          video_url: string
          video_url_alt?: string | null
          poster_url?: string | null
          title_ba?: string | null
          title_en?: string | null
          subtitle_ba?: string | null
          subtitle_en?: string | null
          button_text_ba?: string | null
          button_text_en?: string | null
          button_link?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          video_url?: string
          video_url_alt?: string | null
          poster_url?: string | null
          title_ba?: string | null
          title_en?: string | null
          subtitle_ba?: string | null
          subtitle_en?: string | null
          button_text_ba?: string | null
          button_text_en?: string | null
          button_link?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      hs_hero_banners: {
        Row: {
          id: number
          title: string
          subtitle: string | null
          badge: string | null
          cta_text: string | null
          cta_url: string | null
          image_url: string | null
          gradient_from: string
          gradient_to: string
          is_active: boolean
          display_order: number
          start_at: string | null
          end_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          subtitle?: string | null
          badge?: string | null
          cta_text?: string | null
          cta_url?: string | null
          image_url?: string | null
          gradient_from?: string
          gradient_to?: string
          is_active?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          subtitle?: string | null
          badge?: string | null
          cta_text?: string | null
          cta_url?: string | null
          image_url?: string | null
          gradient_from?: string
          gradient_to?: string
          is_active?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hs_news_cards: {
        Row: {
          id: number
          title: string
          description: string | null
          image_url: string | null
          cta_text: string | null
          cta_url: string | null
          badge: string | null
          badge_color: string
          is_active: boolean
          display_order: number
          start_at: string | null
          end_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          image_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          badge?: string | null
          badge_color?: string
          is_active?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          image_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          badge?: string | null
          badge_color?: string
          is_active?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hs_block_sets: {
        Row: {
          id: number
          name: string
          slug: string | null
          title: string | null
          subtitle: string | null
          icon: string | null
          layout: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          title?: string | null
          subtitle?: string | null
          icon?: string | null
          layout?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          title?: string | null
          subtitle?: string | null
          icon?: string | null
          layout?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      hs_block_items: {
        Row: {
          id: number
          block_set_id: number | null
          title: string
          subtitle: string | null
          description: string | null
          image_url: string | null
          icon: string | null
          cta_text: string | null
          cta_text_en: string | null
          cta_url: string | null
          badge: string | null
          badge_color: string | null
          business_id: number | null
          attraction_id: number | null
          event_id: number | null
          pametno_product_id: number | null
          is_active: boolean
          is_featured: boolean
          display_order: number
          start_at: string | null
          end_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          block_set_id?: number | null
          title: string
          subtitle?: string | null
          description?: string | null
          image_url?: string | null
          icon?: string | null
          cta_text?: string | null
          cta_text_en?: string | null
          cta_url?: string | null
          badge?: string | null
          badge_color?: string | null
          business_id?: number | null
          attraction_id?: number | null
          event_id?: number | null
          pametno_product_id?: number | null
          is_active?: boolean
          is_featured?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          block_set_id?: number | null
          title?: string
          subtitle?: string | null
          description?: string | null
          image_url?: string | null
          icon?: string | null
          cta_text?: string | null
          cta_text_en?: string | null
          cta_url?: string | null
          badge?: string | null
          badge_color?: string | null
          business_id?: number | null
          attraction_id?: number | null
          event_id?: number | null
          pametno_product_id?: number | null
          is_active?: boolean
          is_featured?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hs_quick_fun: {
        Row: {
          id: number
          title: string
          subtitle: string | null
          description: string | null
          icon: string | null
          image_url: string | null
          cta_text: string | null
          cta_url: string | null
          fun_type: string
          badge: string | null
          badge_color: string | null
          config: Json
          is_active: boolean
          display_order: number
          start_at: string | null
          end_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          subtitle?: string | null
          description?: string | null
          icon?: string | null
          image_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          fun_type?: string
          badge?: string | null
          badge_color?: string | null
          config?: Json
          is_active?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          subtitle?: string | null
          description?: string | null
          icon?: string | null
          image_url?: string | null
          cta_text?: string | null
          cta_url?: string | null
          fun_type?: string
          badge?: string | null
          badge_color?: string | null
          config?: Json
          is_active?: boolean
          display_order?: number
          start_at?: string | null
          end_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hs_site_config: {
        Row: {
          id: number
          site_name: string
          city_name: string
          city_lat: number
          city_lon: number
          timezone: string
          base_currency: string
          target_currencies: Json
          footer_icons: Json
          footer_links: Json
          social_links: Json
          primary_color: string
          updated_at: string
        }
        Insert: {
          id?: number
          site_name?: string
          city_name?: string
          city_lat?: number
          city_lon?: number
          timezone?: string
          base_currency?: string
          target_currencies?: Json
          footer_icons?: Json
          footer_links?: Json
          social_links?: Json
          primary_color?: string
          updated_at?: string
        }
        Update: {
          id?: number
          site_name?: string
          city_name?: string
          city_lat?: number
          city_lon?: number
          timezone?: string
          base_currency?: string
          target_currencies?: Json
          footer_icons?: Json
          footer_links?: Json
          social_links?: Json
          primary_color?: string
          updated_at?: string
        }
      }
      hs_navigation_chips: {
        Row: {
          id: number
          category_id: number | null
          custom_label: string | null
          custom_icon: string | null
          custom_url: string | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: number
          category_id?: number | null
          custom_label?: string | null
          custom_icon?: string | null
          custom_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          category_id?: number | null
          custom_label?: string | null
          custom_icon?: string | null
          custom_url?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      // =====================================================
      // EXISTING TABLES (that we'll use)
      // =====================================================
      attractions: {
        Row: {
          id: number
          name: string
          slug: string | null
          description: string | null
          media: Json | null
          address: string | null
          location: string | null
          featured_location: boolean
          created_at: string
          updated_at: string
          display_order: number
          price_info: string | null
          opening_hours: string | null
          email: string | null
          phone: string | null
          website: string | null
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          description?: string | null
          media?: Json | null
          address?: string | null
          location?: string | null
          featured_location?: boolean
          created_at?: string
          updated_at?: string
          display_order?: number
          price_info?: string | null
          opening_hours?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          description?: string | null
          media?: Json | null
          address?: string | null
          location?: string | null
          featured_location?: boolean
          created_at?: string
          updated_at?: string
          display_order?: number
          price_info?: string | null
          opening_hours?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
        }
      }
      businesses: {
        Row: {
          id: number
          name: string
          slug: string | null
          address: string | null
          location: string | null
          rating: number | null
          working_hours: string | null
          media: Json | null
          telephone: string | null
          website: string | null
          description: string | null
          brand_id: number | null
          featured_business: boolean
          created_at: string
          updated_at: string
          display_order: number
          price_range: string | null
          email: string | null
          social_media: Json | null
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          address?: string | null
          location?: string | null
          rating?: number | null
          working_hours?: string | null
          media?: Json | null
          telephone?: string | null
          website?: string | null
          description?: string | null
          brand_id?: number | null
          featured_business?: boolean
          created_at?: string
          updated_at?: string
          display_order?: number
          price_range?: string | null
          email?: string | null
          social_media?: Json | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          address?: string | null
          location?: string | null
          rating?: number | null
          working_hours?: string | null
          media?: Json | null
          telephone?: string | null
          website?: string | null
          description?: string | null
          brand_id?: number | null
          featured_business?: boolean
          created_at?: string
          updated_at?: string
          display_order?: number
          price_range?: string | null
          email?: string | null
          social_media?: Json | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string | null
          description: string | null
          image: string | null
          created_at: string
          updated_at: string
          display_order: number
          featured_category: boolean
          icon: string | null
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          description?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
          display_order?: number
          featured_category?: boolean
          icon?: string | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          description?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
          display_order?: number
          featured_category?: boolean
          icon?: string | null
        }
      }
      sections: {
        Row: {
          id: number
          name: string
          slug: string | null
          description: string | null
          image: string | null
          meta: Json
          featured: boolean
          created_at: string
          updated_at: string
          domain: string | null
          display_order: number
          is_active: boolean
        }
        Insert: {
          id?: number
          name: string
          slug?: string | null
          description?: string | null
          image?: string | null
          meta?: Json
          featured?: boolean
          created_at?: string
          updated_at?: string
          domain?: string | null
          display_order?: number
          is_active?: boolean
        }
        Update: {
          id?: number
          name?: string
          slug?: string | null
          description?: string | null
          image?: string | null
          meta?: Json
          featured?: boolean
          created_at?: string
          updated_at?: string
          domain?: string | null
          display_order?: number
          is_active?: boolean
        }
      }
      pametno_products: {
        Row: {
          id: number
          slug: string
          title: string
          short_description: string | null
          long_description: string | null
          image_url: string | null
          image_alt: string | null
          gallery: Json
          brand_id: number | null
          type: string
          key_features: Json
          specifications: Json
          ranking_score: number
          display_order: number
          featured: boolean
          badges: Json
          price: number | null
          currency: string
          cta_url: string | null
          cta_text: string | null
          published_at: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          title: string
          short_description?: string | null
          long_description?: string | null
          image_url?: string | null
          image_alt?: string | null
          gallery?: Json
          brand_id?: number | null
          type?: string
          key_features?: Json
          specifications?: Json
          ranking_score?: number
          display_order?: number
          featured?: boolean
          badges?: Json
          price?: number | null
          currency?: string
          cta_url?: string | null
          cta_text?: string | null
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          short_description?: string | null
          long_description?: string | null
          image_url?: string | null
          image_alt?: string | null
          gallery?: Json
          brand_id?: number | null
          type?: string
          key_features?: Json
          specifications?: Json
          ranking_score?: number
          display_order?: number
          featured?: boolean
          badges?: Json
          price?: number | null
          currency?: string
          cta_url?: string | null
          cta_text?: string | null
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pametno_brands: {
        Row: {
          id: number
          name: string
          slug: string
          logo: string | null
          description: string | null
          marketplace_url: string | null
          founded: string | null
          headquarters: string | null
          values: Json
          created_at: string
          updated_at: string
          logo_url: string | null
          website_url: string | null
          client_id: number | null
        }
        Insert: {
          id?: number
          name: string
          slug: string
          logo?: string | null
          description?: string | null
          marketplace_url?: string | null
          founded?: string | null
          headquarters?: string | null
          values?: Json
          created_at?: string
          updated_at?: string
          logo_url?: string | null
          website_url?: string | null
          client_id?: number | null
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          logo?: string | null
          description?: string | null
          marketplace_url?: string | null
          founded?: string | null
          headquarters?: string | null
          values?: Json
          created_at?: string
          updated_at?: string
          logo_url?: string | null
          website_url?: string | null
          client_id?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for cleaner code
export type HeroVideo = Database['public']['Tables']['hs_hero_videos']['Row']
export type HeroBanner = Database['public']['Tables']['hs_hero_banners']['Row']
export type NewsCard = Database['public']['Tables']['hs_news_cards']['Row']
export type BlockSet = Database['public']['Tables']['hs_block_sets']['Row']
export type BlockItem = Database['public']['Tables']['hs_block_items']['Row']
export type QuickFun = Database['public']['Tables']['hs_quick_fun']['Row']
export type SiteConfig = Database['public']['Tables']['hs_site_config']['Row']
export type NavigationChip = Database['public']['Tables']['hs_navigation_chips']['Row']
export type Attraction = Database['public']['Tables']['attractions']['Row']
export type Business = Database['public']['Tables']['businesses']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type PametnoProduct = Database['public']['Tables']['pametno_products']['Row']
export type PametnoBrand = Database['public']['Tables']['pametno_brands']['Row']
