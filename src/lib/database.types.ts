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
      clientes: {
        Row: {
          id: string
          nome: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      marcas: {
        Row: {
          id: string
          nome: string
          cliente_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          cliente_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          cliente_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marcas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          }
        ]
      }
      producoes: {
        Row: {
          id: string
          marca_id: string
          cliente_id: string
          referencia_interna: string
          referencia_cliente: string
          descricao: string
          tipo_peca: string
          genero: 'Masculino' | 'Feminino' | 'Unissexo'
          etapa: 'Desenvolvimento' | '1º proto' | '2º proto' | 'Size-Set' | 'PPS' | 'Produção' | 'Pronto' | 'Enviado'
          estado: 'Modelagem' | 'Aguarda Componentes' | 'FALTA COMPONENTES' | 'Aguarda Malha' | 'Com Defeito' | 'Aguarda Comentários' | 'Corte' | 'Confecção' | 'Transfers' | 'Serviços Externos' | 'Embalamento'
          data_inicio: string
          data_previsao: string
          data_estimada_entrega: string
          em_producao: boolean
          problemas: boolean
          local_producao: 'Interno' | 'Externo'
          empresa_externa: string | null
          link_odoo: string | null
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          marca_id: string
          cliente_id: string
          referencia_interna: string
          referencia_cliente: string
          descricao: string
          tipo_peca: string
          genero?: 'Masculino' | 'Feminino' | 'Unissexo'
          etapa?: 'Desenvolvimento' | '1º proto' | '2º proto' | 'Size-Set' | 'PPS' | 'Produção' | 'Pronto' | 'Enviado'
          estado?: 'Modelagem' | 'Aguarda Componentes' | 'FALTA COMPONENTES' | 'Aguarda Malha' | 'Com Defeito' | 'Aguarda Comentários' | 'Corte' | 'Confecção' | 'Transfers' | 'Serviços Externos' | 'Embalamento'
          data_inicio: string
          data_previsao: string
          data_estimada_entrega: string
          em_producao?: boolean
          problemas?: boolean
          local_producao?: 'Interno' | 'Externo'
          empresa_externa?: string | null
          link_odoo?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          marca_id?: string
          cliente_id?: string
          referencia_interna?: string
          referencia_cliente?: string
          descricao?: string
          tipo_peca?: string
          genero?: 'Masculino' | 'Feminino' | 'Unissexo'
          etapa?: 'Desenvolvimento' | '1º proto' | '2º proto' | 'Size-Set' | 'PPS' | 'Produção' | 'Pronto' | 'Enviado'
          estado?: 'Modelagem' | 'Aguarda Componentes' | 'FALTA COMPONENTES' | 'Aguarda Malha' | 'Com Defeito' | 'Aguarda Comentários' | 'Corte' | 'Confecção' | 'Transfers' | 'Serviços Externos' | 'Embalamento'
          data_inicio?: string
          data_previsao?: string
          data_estimada_entrega?: string
          em_producao?: boolean
          problemas?: boolean
          local_producao?: 'Interno' | 'Externo'
          empresa_externa?: string | null
          link_odoo?: string | null
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producoes_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          }
        ]
      }
      producao_variantes: {
        Row: {
          id: string
          producao_id: string
          cor: string
          tamanho: string
          quantidade: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          producao_id: string
          cor: string
          tamanho: string
          quantidade?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          producao_id?: string
          cor?: string
          tamanho?: string
          quantidade?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "producao_variantes_producao_id_fkey"
            columns: ["producao_id"]
            isOneToOne: false
            referencedRelation: "producoes"
            referencedColumns: ["id"]
          }
        ]
      }
      bom_files: {
        Row: {
          id: string
          producao_id: string
          nome: string
          url: string
          upload_date: string
          created_at: string
        }
        Insert: {
          id?: string
          producao_id: string
          nome: string
          url: string
          upload_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          producao_id?: string
          nome?: string
          url?: string
          upload_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bom_files_producao_id_fkey"
            columns: ["producao_id"]
            isOneToOne: false
            referencedRelation: "producoes"
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
      genero_type: 'Masculino' | 'Feminino' | 'Unissexo'
      etapa_type: 'Desenvolvimento' | '1º proto' | '2º proto' | 'Size-Set' | 'PPS' | 'Produção' | 'Pronto' | 'Enviado'
      estado_type: 'Modelagem' | 'Aguarda Componentes' | 'FALTA COMPONENTES' | 'Aguarda Malha' | 'Com Defeito' | 'Aguarda Comentários' | 'Corte' | 'Confecção' | 'Transfers' | 'Serviços Externos' | 'Embalamento'
      local_producao_type: 'Interno' | 'Externo'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}