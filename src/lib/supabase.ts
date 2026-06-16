import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Profile = {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  balance: number
  created_at: string
}

export type Portfolio = {
  id: string
  user_id: string
  asset_symbol: string
  asset_type: 'crypto' | 'stock' | 'commodity'
  quantity: number
  avg_price: number
  updated_at: string
}

export type TradeHistory = {
  id: string
  user_id: string
  asset_symbol: string
  asset_type: 'crypto' | 'stock' | 'commodity'
  trade_type: 'buy' | 'sell'
  quantity: number
  price: number
  total: number
  created_at: string
}

export type OptionTrade = {
  id: string
  user_id: string
  asset_symbol: string
  asset_type: 'crypto' | 'stock' | 'commodity'
  direction: 'call' | 'put'
  duration_seconds: number
  stake: number
  entry_price: number
  exit_price: number | null
  status: 'active' | 'won' | 'lost'
  payout_amount: number | null
  created_at: string
  settled_at: string | null
}
