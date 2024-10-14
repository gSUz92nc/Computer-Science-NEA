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
      jlpt_levels: {
        Row: {
          level: number
        }
        Insert: {
          level: number
        }
        Update: {
          level?: number
        }
        Relationships: []
      }
      jlpt_words: {
        Row: {
          id: number
          level: number
        }
        Insert: {
          id?: number
          level: number
        }
        Update: {
          id?: number
          level?: number
        }
        Relationships: [
          {
            foreignKeyName: "jlpt_words_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "jmdict_word"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jlpt_words_level_fkey"
            columns: ["level"]
            isOneToOne: false
            referencedRelation: "jlpt_levels"
            referencedColumns: ["level"]
          },
        ]
      }
      jmdict_gloss: {
        Row: {
          fts: unknown | null
          id: string
          sense_id: string
          text: string
          type: string | null
        }
        Insert: {
          fts?: unknown | null
          id?: string
          sense_id: string
          text: string
          type?: string | null
        }
        Update: {
          fts?: unknown | null
          id?: string
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
          dialect: string[]
          field: string[]
          id: string
          info: string[]
          misc: string[]
          related: Json
          word_id: number
        }
        Insert: {
          antonym: Json
          dialect: string[]
          field: string[]
          id?: string
          info: string[]
          misc: string[]
          related: Json
          word_id?: number
        }
        Update: {
          antonym?: Json
          dialect?: string[]
          field?: string[]
          id?: string
          info?: string[]
          misc?: string[]
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
      get_jmdict_entries: {
        Args: {
          gloss_input?: string
          kanji_input?: string
          hiragana_input?: string
          katakana_input?: string
        }
        Returns: {
          id: number
          senses: Json
          kana: Json
          kanji: Json
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
