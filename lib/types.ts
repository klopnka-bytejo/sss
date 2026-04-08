import React from "react"

// User & Auth Types
export type UserRole = 'client' | 'pro' | 'admin'

export interface Profile {
  id: string
  email: string
  username: string | null
  avatar_url: string | null
  role: UserRole
  balance_cents: number
  created_at: string
  updated_at: string
}

export interface ProProfile {
  id: string
  display_name: string
  bio: string | null
  games: string[]
  rating: number
  total_reviews: number
  total_orders: number
  is_verified: boolean
  is_online: boolean
  hourly_rate_cents: number | null
  created_at: string
  // Joined from profiles
  profile?: Profile
}

// Game Types
export interface Game {
  id: string
  name: string
  slug: string
  logo_url: string | null
  banner_url: string | null
  short_description: string | null
  long_description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

// Service Types
export type ServiceCategory = 'boosting' | 'coaching' | 'account'
export type PriceType = 'fixed' | 'hourly' | 'per_rank'
export type PricingType = 'fixed' | 'dynamic'
export type DeliveryType = 'piloted' | 'selfplay' | 'coaching'

export interface Service {
  id: string
  pro_id: string | null
  title: string
  description: string | null
  category: ServiceCategory
  game: string
  game_id: string | null
  price_cents: number
  base_price_cents: number
  price_type: PriceType
  pricing_type: PricingType
  price_per_level_cents: number | null
  price_per_rank_cents: number | null
  speed_multiplier_normal: number
  speed_multiplier_express: number
  speed_multiplier_super: number
  delivery_type: DeliveryType
  estimated_hours: number | null
  min_level: number | null
  max_level: number | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined
  game_info?: Game
  addons?: ServiceAddon[]
}

// Service Add-on Types
export interface ServiceAddon {
  id: string
  service_id: string
  name: string
  description: string | null
  price_cents: number
  is_percentage: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

// Discount Types
export type DiscountType = 'percentage' | 'fixed'
export type DiscountTargetType = 'game' | 'service' | 'all'

export interface Discount {
  id: string
  title: string
  code: string | null
  discount_type: DiscountType
  discount_value: number
  target_type: DiscountTargetType
  target_id: string | null
  min_order_cents: number
  max_uses: number | null
  uses_count: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

// Order Types
export type OrderStatus = 'pending' | 'paid' | 'in_progress' | 'pending_review' | 'completed' | 'disputed' | 'refunded' | 'cancelled'
export type PaymentMethod = 'stripe' | 'paypal' | 'crypto'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export interface Order {
  id: string
  order_number: string
  client_id: string
  pro_id: string | null
  service_id: string
  status: OrderStatus
  total_cents: number
  subtotal_cents: number | null
  discount_id: string | null
  discount_amount_cents: number
  selected_addons: SelectedAddon[]
  selected_options: Record<string, unknown>
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  stripe_payment_intent_id: string | null
  requirements: Record<string, unknown>
  notes: string | null
  proof_link: string | null
  proof_notes: string | null
  started_at: string | null
  completed_at: string | null
  completed_at_hold: string | null
  payout_released_at: string | null
  created_at: string
  updated_at: string
  // Joined
  client?: Profile
  pro?: Profile
  service?: Service
  discount?: Discount
}

export interface SelectedAddon {
  id: string
  name: string
  price_cents: number
}

export interface OrderMessage {
  id: string
  order_id: string
  sender_id: string
  message: string
  is_system: boolean
  created_at: string
  // Joined
  sender?: Profile
}

// Review Types
export interface Review {
  id: string
  order_id: string
  client_id: string
  pro_id: string
  rating: number
  comment: string | null
  created_at: string
  // Joined
  client?: Profile
}

// Dispute Types
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed'

export interface Dispute {
  id: string
  order_id: string
  opened_by: string
  reason: string
  status: DisputeStatus
  resolution: string | null
  resolved_by: string | null
  created_at: string
  resolved_at: string | null
  // Joined
  order?: Order
  opener?: Profile
}

// Transaction Types
export type TransactionType = 'deposit' | 'withdrawal' | 'order_payment' | 'order_earning' | 'refund' | 'fee'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount_cents: number
  balance_after_cents: number
  reference_id: string | null
  description: string | null
  created_at: string
}

// Admin Audit Log
export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown>
  created_at: string
  // Joined
  admin?: Profile
}

// Navigation
export type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

// Phase 1 Games (now loaded from database)
export const SUPPORTED_GAMES = [
  'Call of Duty',
  'World of Warcraft',
  'Fortnite',
  'Destiny 2',
  'EA FC 26',
  'Battlefield',
  'Elden Ring',
  'Arc Raiders',
] as const

export type SupportedGame = typeof SUPPORTED_GAMES[number]

// Dashboard Stats
export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeOrders: number
  totalUsers: number
  totalPros: number
  openDisputes: number
}

// Form Types
export interface SignUpFormData {
  email: string
  password: string
  username: string
  role: UserRole
}

export interface ServiceFormData {
  title: string
  description: string
  category: ServiceCategory
  game: string
  price_cents: number
  price_type: PriceType
}
