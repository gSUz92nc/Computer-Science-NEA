export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      antonym: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "antonym_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_reference: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_reference_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      definition: {
        Row: {
          id: number
          lang: string | null
          sense_id: number | null
          type: string | null
          value: string | null
        }
        Insert: {
          id: number
          lang?: string | null
          sense_id?: number | null
          type?: string | null
          value?: string | null
        }
        Update: {
          id?: number
          lang?: string | null
          sense_id?: number | null
          type?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "definition_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      dialect: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialect_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      entry: {
        Row: {
          id: number
        }
        Insert: {
          id: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      field: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      kana: {
        Row: {
          entry_id: number | null
          id: number
          no_kanji: number | null
          value: string | null
        }
        Insert: {
          entry_id?: number | null
          id: number
          no_kanji?: number | null
          value?: string | null
        }
        Update: {
          entry_id?: number | null
          id?: number
          no_kanji?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kana_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entry"
            referencedColumns: ["id"]
          },
        ]
      }
      kana_applies_to_kanji: {
        Row: {
          id: number
          kana_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          kana_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          kana_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kana_applies_to_kanji_kana_id_fkey"
            columns: ["kana_id"]
            isOneToOne: false
            referencedRelation: "kana"
            referencedColumns: ["id"]
          },
        ]
      }
      kana_common: {
        Row: {
          id: number
          kana_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          kana_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          kana_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kana_common_kana_id_fkey"
            columns: ["kana_id"]
            isOneToOne: false
            referencedRelation: "kana"
            referencedColumns: ["id"]
          },
        ]
      }
      kana_tags: {
        Row: {
          id: number
          kana_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          kana_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          kana_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kana_tags_kana_id_fkey"
            columns: ["kana_id"]
            isOneToOne: false
            referencedRelation: "kana"
            referencedColumns: ["id"]
          },
        ]
      }
      kanji: {
        Row: {
          entry_id: number | null
          id: number
          value: string | null
        }
        Insert: {
          entry_id?: number | null
          id: number
          value?: string | null
        }
        Update: {
          entry_id?: number | null
          id?: number
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanji_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entry"
            referencedColumns: ["id"]
          },
        ]
      }
      kanji_common: {
        Row: {
          id: number
          kanji_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          kanji_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          kanji_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanji_common_kanji_id_fkey"
            columns: ["kanji_id"]
            isOneToOne: false
            referencedRelation: "kanji"
            referencedColumns: ["id"]
          },
        ]
      }
      kanji_tags: {
        Row: {
          id: number
          kanji_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          kanji_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          kanji_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanji_tags_kanji_id_fkey"
            columns: ["kanji_id"]
            isOneToOne: false
            referencedRelation: "kanji"
            referencedColumns: ["id"]
          },
        ]
      }
      lang_source: {
        Row: {
          id: number
          lang: string | null
          origin: string | null
          sense_id: number | null
          type: string | null
          wasei: number | null
        }
        Insert: {
          id: number
          lang?: string | null
          origin?: string | null
          sense_id?: number | null
          type?: string | null
          wasei?: number | null
        }
        Update: {
          id?: number
          lang?: string | null
          origin?: string | null
          sense_id?: number | null
          type?: string | null
          wasei?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lang_source_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      misc: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "misc_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      part_of_speech: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_of_speech_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      sense: {
        Row: {
          entry_id: number | null
          id: number
        }
        Insert: {
          entry_id?: number | null
          id: number
        }
        Update: {
          entry_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sense_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entry"
            referencedColumns: ["id"]
          },
        ]
      }
      sense_applies_to_kana: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sense_applies_to_kana_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      sense_applies_to_kanji: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sense_applies_to_kanji_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
      sense_info: {
        Row: {
          id: number
          sense_id: number | null
          value: string | null
        }
        Insert: {
          id: number
          sense_id?: number | null
          value?: string | null
        }
        Update: {
          id?: number
          sense_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sense_info_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "sense"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      entry_data: {
        Row: {
          entry_id: number | null
          kana: Json | null
          kanji: Json | null
          senses: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "kana_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entry"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      search_entries: {
        Args: {
          p_kana: string
          p_kanji: string
          p_definition: string
        }
        Returns: {
          entry_id: number
          kana: Json
          kanji: Json
          senses: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
