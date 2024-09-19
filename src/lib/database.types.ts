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
      jmdict_gloss: {
        Row: {
          gender: string | null
          id: string
          lang: string
          sense_id: string
          text: string
          type: string | null
        }
        Insert: {
          gender?: string | null
          id?: string
          lang: string
          sense_id: string
          text: string
          type?: string | null
        }
        Update: {
          gender?: string | null
          id?: string
          lang?: string
          sense_id?: string
          text?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jmdict_gloss_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "jmdict_sense"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jmdict_gloss_sense_id_fkey"
            columns: ["sense_id"]
            isOneToOne: false
            referencedRelation: "mv_jmdict"
            referencedColumns: ["sense_id"]
          },
        ]
      }
      jmdict_kana: {
        Row: {
          applies_to_kanji: string[] | null
          common: boolean
          id: string
          tags: string[]
          text: string
          word_id: number
        }
        Insert: {
          applies_to_kanji?: string[] | null
          common: boolean
          id?: string
          tags: string[]
          text: string
          word_id?: number
        }
        Update: {
          applies_to_kanji?: string[] | null
          common?: boolean
          id?: string
          tags?: string[]
          text?: string
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "jmdict_kana_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "jmdict_word"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jmdict_kana_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "mv_jmdict"
            referencedColumns: ["word_id"]
          },
        ]
      }
      jmdict_kanji: {
        Row: {
          common: boolean
          id: string
          tags: string[]
          text: string
          word_id: number
        }
        Insert: {
          common: boolean
          id?: string
          tags: string[]
          text: string
          word_id?: number
        }
        Update: {
          common?: boolean
          id?: string
          tags?: string[]
          text?: string
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "jmdict_kanji_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "jmdict_word"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jmdict_kanji_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "mv_jmdict"
            referencedColumns: ["word_id"]
          },
        ]
      }
      jmdict_sense: {
        Row: {
          antonym: Json
          applies_to_kana: string[] | null
          applies_to_kanji: string[] | null
          dialect: string[]
          field: string[]
          id: string
          info: string[]
          language_source: Json | null
          misc: string[]
          part_of_speech: string[] | null
          related: Json
          word_id: number
        }
        Insert: {
          antonym: Json
          applies_to_kana?: string[] | null
          applies_to_kanji?: string[] | null
          dialect: string[]
          field: string[]
          id?: string
          info: string[]
          language_source?: Json | null
          misc: string[]
          part_of_speech?: string[] | null
          related: Json
          word_id?: number
        }
        Update: {
          antonym?: Json
          applies_to_kana?: string[] | null
          applies_to_kanji?: string[] | null
          dialect?: string[]
          field?: string[]
          id?: string
          info?: string[]
          language_source?: Json | null
          misc?: string[]
          part_of_speech?: string[] | null
          related?: Json
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "jmdict_sense_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "jmdict_word"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jmdict_sense_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "mv_jmdict"
            referencedColumns: ["word_id"]
          },
        ]
      }
      jmdict_word: {
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
    }
    Views: {
      mv_jmdict: {
        Row: {
          gloss_gender: string | null
          gloss_lang: string | null
          gloss_text: string | null
          gloss_type: string | null
          kana_common: boolean | null
          kana_tags: string[] | null
          kana_text: string | null
          kanji_common: boolean | null
          kanji_tags: string[] | null
          kanji_text: string | null
          sense_antonym: Json | null
          sense_applies_to_kana: string[] | null
          sense_applies_to_kanji: string[] | null
          sense_dialect: string[] | null
          sense_field: string[] | null
          sense_id: string | null
          sense_info: string[] | null
          sense_misc: string[] | null
          sense_part_of_speech: string[] | null
          sense_related: Json | null
          word_id: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      search_jmdict: {
        Args: {
          search_term: string
        }
        Returns: {
          word_id: number
          kana_text: string
          kana_common: boolean
          kana_tags: string[]
          sense_id: string
          sense_part_of_speech: string[]
          sense_applies_to_kanji: string[]
          sense_applies_to_kana: string[]
          sense_related: Json
          sense_antonym: Json
          sense_field: string[]
          sense_dialect: string[]
          sense_misc: string[]
          sense_info: string[]
          gloss_lang: string
          gloss_gender: string
          gloss_type: string
          gloss_text: string
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
