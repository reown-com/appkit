export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

export type FeatureBag = Record<string, unknown>

export type Layer = Record<string, Json | undefined>

export type ApiEntry = { id: string; isEnabled?: boolean | null; config?: Json | null }
