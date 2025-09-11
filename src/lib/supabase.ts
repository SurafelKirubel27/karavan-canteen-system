import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  role: 'teacher' | 'canteen'
  department?: string
  phone?: string
  created_at: string
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  image_url?: string
  available: boolean
  prep_time: number
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'declined'
  total_amount: number
  delivery_location: string
  special_instructions?: string
  created_at: string
  updated_at: string
  users?: User
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price_at_time: number
  menu_item?: MenuItem
}
