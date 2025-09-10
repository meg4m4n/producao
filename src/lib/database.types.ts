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
      users: {
        Row: {
          id: string
          email: string
          name: string
          password: string
          role: 'admin' | 'user'
          permissions: Json
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          password: string
          role?: 'admin' | 'user'
          permissions?: Json
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password?: string
          role?: 'admin' | 'user'
          permissions?: Json
          last_login?: string | null
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
          codigo_op: string
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
          data_final: string
          tempo_producao_estimado: number
          tempo_producao_real: number
          tem_molde: boolean
          em_producao: boolean
          problemas: boolean
          local_producao: 'Interno' | 'Externo'
          local_producao_id: string | null
          empresa_externa: string | null
          link_odoo: string | null
          comments: string | null
          pago: boolean
          fastprod: boolean
          pago_parcial: boolean
          pagamentos: Json
          valor_pago: number
          valor_restante: number
          observacoes_financeiras: string | null
          numero_fatura: string | null
          data_fatura: string | null
          valor_fatura: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_op: string
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
          data_final: string
          tempo_producao_estimado?: number
          tempo_producao_real?: number
          tem_molde?: boolean
          em_producao?: boolean
          problemas?: boolean
          local_producao?: 'Interno' | 'Externo'
          local_producao_id?: string | null
          empresa_externa?: string | null
          link_odoo?: string | null
          comments?: string | null
          pago?: boolean
          fastprod?: boolean
          pago_parcial?: boolean
          pagamentos?: Json
          valor_pago?: number
          valor_restante?: number
          observacoes_financeiras?: string | null
          numero_fatura?: string | null
          data_fatura?: string | null
          valor_fatura?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_op?: string
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
          data_final?: string
          tempo_producao_estimado?: number
          tempo_producao_real?: number
          tem_molde?: boolean
          em_producao?: boolean
          problemas?: boolean
          local_producao?: 'Interno' | 'Externo'
          local_producao_id?: string | null
          empresa_externa?: string | null
          link_odoo?: string | null
          comments?: string | null
          pago?: boolean
          fastprod?: boolean
          pago_parcial?: boolean
          pagamentos?: Json
          valor_pago?: number
          valor_restante?: number
          observacoes_financeiras?: string | null
          numero_fatura?: string | null
          data_fatura?: string | null
          valor_fatura?: number | null
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
      tipos_peca: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      locais_producao: {
        Row: {
          id: string
          nome: string
          tipo: 'Interno' | 'Externo'
          endereco: string | null
          contacto: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          tipo?: 'Interno' | 'Externo'
          endereco?: string | null
          contacto?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          tipo?: 'Interno' | 'Externo'
          endereco?: string | null
          contacto?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
      controlo_qualidade_adicional: {
        Row: {
          id: string
          registo_id: string
          linhas: boolean
          borboto: boolean
          sujidade: boolean
          defeito_transfer: boolean
          peca_torta: boolean
          problemas_ferro: boolean
          outros_controlos: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registo_id: string
          linhas?: boolean
          borboto?: boolean
          sujidade?: boolean
          defeito_transfer?: boolean
          peca_torta?: boolean
          problemas_ferro?: boolean
          outros_controlos?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registo_id?: string
          linhas?: boolean
          borboto?: boolean
          sujidade?: boolean
          defeito_transfer?: boolean
          peca_torta?: boolean
          problemas_ferro?: boolean
          outros_controlos?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "controlo_qualidade_adicional_registo_id_fkey"
            columns: ["registo_id"]
            isOneToOne: false
            referencedRelation: "controlo_qualidade_registos"
            referencedColumns: ["id"]
          }
        ]
      }
      controlo_qualidade_comentarios: {
        Row: {
          id: string
          registo_id: string
          comentario: string
          usuario: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registo_id: string
          comentario: string
          usuario?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registo_id?: string
          comentario?: string
          usuario?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "controlo_qualidade_comentarios_registo_id_fkey"
            columns: ["registo_id"]
            isOneToOne: false
            referencedRelation: "controlo_qualidade_registos"
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
      estado_type: 'Modelagem' | 'Aguarda Componentes' | 'FALTA COMPONENTES' | 'Aguarda Malha' | 'Com Defeito' | 'Aguarda Comentários' | 'Corte' | 'Confecção' | 'Transfers' | 'Serviços Externos' | 'Embalamento' | 'Pronto'
      local_producao_type: 'Interno' | 'Externo'
      user_role: 'admin' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}