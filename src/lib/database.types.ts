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
        ]
      }
      jmdict_kana: {
        Row: {
          applies_to_kanji: string[]
          common: boolean
          id: string
          tags: string[]
          text: string
          word_id: number
        }
        Insert: {
          applies_to_kanji: string[]
          common: boolean
          id?: string
          tags: string[]
          text: string
          word_id?: number
        }
        Update: {
          applies_to_kanji?: string[]
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
        ]
      }
      jmdict_sense: {
        Row: {
          antonym: Json
          applies_to_kana: string[]
          applies_to_kanji: string[]
          dialect: string[]
          field: string[]
          id: string
          info: string[]
          language_source: Json
          misc: string[]
          part_of_speech: string[]
          related: Json
          word_id: number
        }
        Insert: {
          antonym: Json
          applies_to_kana: string[]
          applies_to_kanji: string[]
          dialect: string[]
          field: string[]
          id?: string
          info: string[]
          language_source: Json
          misc: string[]
          part_of_speech: string[]
          related: Json
          word_id?: number
        }
        Update: {
          antonym?: Json
          applies_to_kana?: string[]
          applies_to_kanji?: string[]
          dialect?: string[]
          field?: string[]
          id?: string
          info?: string[]
          language_source?: Json
          misc?: string[]
          part_of_speech?: string[]
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
      [_ in never]: never
    }
    Functions: {
      jsonb_text_concat: {
        Args: {
          "": Json
        }
        Returns: string
      }
      search_dictionary: {
        Args: {
          search_term_kata: string
          search_term_hira?: string
        }
        Returns: {
          id: number
          kanji: Json
          kana: Json
          sense: Json
          gloss: Json
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
