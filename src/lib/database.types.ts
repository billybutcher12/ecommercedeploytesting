export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          category_id: string
          image_urls: string[]
          image_url: string
          sizes: string[]
          colors: string[]
          stock: number
          is_featured: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          price: number
          category_id: string
          image_urls: string[]
          sizes: string[]
          colors: string[]
          stock: number
          is_featured?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          price?: number
          category_id?: string
          image_urls?: string[]
          sizes?: string[]
          colors?: string[]
          stock?: number
          is_featured?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          image_url: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          image_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          image_url?: string
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          status: string
          total: number
          shipping_address: Json
          payment_method: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          status?: string
          total: number
          shipping_address: Json
          payment_method: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          status?: string
          total?: number
          shipping_address?: Json
          payment_method?: string
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          quantity: number
          size: string
          color: string
          price: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          quantity: number
          size: string
          color: string
          price: number
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          quantity?: number
          size?: string
          color?: string
          price?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: string
          avatar_url: string | null
          addresses: Json[] | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          avatar_url?: string | null
          addresses?: Json[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          avatar_url?: string | null
          addresses?: Json[] | null
        }
      },
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string
          created_at?: string
        }
      },
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          avatar_url?: string | null;
        };
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