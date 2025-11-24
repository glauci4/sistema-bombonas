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
      bombonas: {
        Row: {
          id: string
          name: string
          qr_code: string
          capacity: number
          material: string
          type: string
          status: string
          color: string | null
          location_address: string | null
          current_product: string | null
          total_cycles: number
          owner_id: string
          created_at: string
          updated_at: string
          last_wash_date: string | null
          location_lat: number | null
          location_lng: number | null
        }
        Insert: {
          id?: string
          name: string
          qr_code: string
          capacity: number
          material: string
          type: string
          status?: string
          color?: string | null
          location_address?: string | null
          current_product?: string | null
          total_cycles?: number
          owner_id: string
          created_at?: string
          updated_at?: string
          last_wash_date?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
        Update: {
          id?: string
          name?: string
          qr_code?: string
          capacity?: number
          material?: string
          type?: string
          status?: string
          color?: string | null
          location_address?: string | null
          current_product?: string | null
          total_cycles?: number
          owner_id?: string
          created_at?: string
          updated_at?: string
          last_wash_date?: string | null
          location_lat?: number | null
          location_lng?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bombonas_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lavagens: {
        Row: {
          id: string
          bombona_id: string
          data_lavagem: string
          produto_anterior: string | null
          produto_novo: string | null
          observacoes: string | null
          ciclos_antes: number
          ciclos_depois: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bombona_id: string
          data_lavagem: string
          produto_anterior?: string | null
          produto_novo?: string | null
          observacoes?: string | null
          ciclos_antes?: number
          ciclos_depois?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bombona_id?: string
          data_lavagem?: string
          produto_anterior?: string | null
          produto_novo?: string | null
          observacoes?: string | null
          ciclos_antes?: number
          ciclos_depois?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lavagens_bombona_id_fkey"
            columns: ["bombona_id"]
            referencedRelation: "bombonas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lavagens_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      despachos: {
        Row: {
          id: string
          bombona_id: string
          destino: string
          endereco: string
          latitude: number | null
          longitude: number | null
          data_despacho: string
          data_prevista_retorno: string | null
          responsavel: string
          observacoes: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bombona_id: string
          destino: string
          endereco: string
          latitude?: number | null
          longitude?: number | null
          data_despacho?: string
          data_prevista_retorno?: string | null
          responsavel: string
          observacoes?: string | null
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bombona_id?: string
          destino?: string
          endereco?: string
          latitude?: number | null
          longitude?: number | null
          data_despacho?: string
          data_prevista_retorno?: string | null
          responsavel?: string
          observacoes?: string | null
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "despachos_bombona_id_fkey"
            columns: ["bombona_id"]
            referencedRelation: "bombonas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despachos_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          company: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          company?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          company?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: string
          is_read: boolean
          related_entity: string | null
          related_entity_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          type?: string
          is_read?: boolean
          related_entity?: string | null
          related_entity_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string | null
          type?: string
          is_read?: boolean
          related_entity?: string | null
          related_entity_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          category: string
          subcategory: string | null
          danger_level: string | null
          requires_certification: boolean
          compatible_materials: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          subcategory?: string | null
          danger_level?: string | null
          requires_certification?: boolean
          compatible_materials?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          subcategory?: string | null
          danger_level?: string | null
          requires_certification?: boolean
          compatible_materials?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      tracking_history: {
        Row: {
          id: string
          bombona_id: string
          status: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bombona_id: string
          status: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bombona_id?: string
          status?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_history_bombona_id_fkey"
            columns: ["bombona_id"]
            referencedRelation: "bombonas"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}