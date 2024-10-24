export interface Entry {
    entry_id: number
    kana: Kana[]
    kanji: Kanji[]
    senses: Sense[]
  }
  
  export interface Kana {
    kana_id: number
    kana_tags: any[]
    kana_common: any[]
    kana_applies_to_kanji: any[]
  }
  
  export interface Kanji {
    kanji_id: number
    kanji_tags: any[]
    kanji_common: any[]
  }
  
  export interface Sense {
    misc: any[]
    field: any[]
    antonym: any[]
    dialect: any[]
    sense_id: number
    definition: Definition[]
    sense_info: any[]
    lang_source: any[]
    part_of_speech: PartOfSpeech[]
    cross_reference: any[]
    sense_applies_to_kana: any[]
    sense_applies_to_kanji: any[]
  }
  
  export interface Definition {
    id: number
    lang: string
    type: any
    value: string
    sense_id: number
  }
  
  export interface PartOfSpeech {
    id: number
    value: string
    sense_id: number
  }
  