export interface Shelf {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  max_capacity_slots: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShelfCreate {
  name: string;
  code: string;
  description?: string;
  max_capacity_slots?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  minimum_threshold: number;
  reorder_point: number;
  lead_time_days: number;
  unit_cost_gold: number;
  shelf_id: string;
  shelf_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IngredientCreate {
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  minimum_threshold: number;
  reorder_point: number;
  lead_time_days: number;
  unit_cost_gold: number;
  shelf_id: string;
}

export interface SaleCreate {
  ingredient_id: string;
  quantity: number;
  sale_price_gold: number;
  customer_type?: string;
  sold_at?: string;
}

export interface SaleResponse {
  sale_id: string;
  ingredient_id: string;
  ingredient_name?: string;
  quantity_sold: number;
  sale_price_gold: number;
  remaining_stock: number;
  warning?: string | null;
  sold_at: string;
}

export interface StockAdjustCreate {
  ingredient_id: string;
  delta: number;
  reason: string;
  notes?: string;
}

export interface StockMovement {
  movement_id: string;
  ingredient_id: string;
  ingredient_name?: string | null;
  change_type: string;
  delta: number;
  previous_stock: number;
  resulting_stock: number;
  reason?: string | null;
  created_at: string;
}

export interface PotionEvent {
  id: string;
  name: string;
  event_type: string;
  multiplier: number;
  affected_ingredient_ids: string[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface EventCreate {
  name: string;
  event_type?: string;
  multiplier: number;
  affected_ingredient_ids: string[];
  starts_at: string;
  ends_at: string;
  is_active?: boolean;
}

export interface Anomaly {
  id: string;
  ingredient_id: string;
  ingredient_name?: string;
  anomaly_type: 'SPIKE' | 'SUDDEN_DRAIN' | 'PROLONGED_ZERO';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anomaly_score: number;
  expected_consumption: number;
  actual_consumption: number;
  window_start: string;
  window_end: string;
  status: 'UNRESOLVED' | 'ACKNOWLEDGED' | 'RESOLVED';
  detected_at: string;
}

export interface DailySalesHistoryItem {
  date: string;
  total_quantity: number;
  total_sales_gold: number;
}

export interface DemandHistoryResponse {
  ingredient_id: string;
  ingredient_name: string;
  history: DailySalesHistoryItem[];
}

export interface DailyForecastItem {
  date: string;
  predicted_demand: number;
  lower_bound: number;
  upper_bound: number;
  event_multiplier: number;
  applied_event_name?: string | null;
}

export interface ForecastResponse {
  ingredient_id: string;
  ingredient_name: string;
  current_stock: number;
  forecast: DailyForecastItem[];
}

export interface ProphecyStockout {
  ingredient_id: string;
  name: string;
  current_stock: number;
  unit: string;
  depletion_rate_per_day: number;
  days_until_stockout: number;
  stockout_date?: string | null;
  urgency: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  minimum_threshold: number;
  is_stocked_out: boolean;
}

export interface ReorderRecommendation {
  ingredient_id: string;
  ingredient_name: string;
  current_stock: number;
  unit: string;
  recommended_quantity: number;
  estimated_cost_gold: number;
  urgency: 'CRITICAL' | 'SOON' | 'NORMAL';
  projected_stockout_date?: string | null;
  days_until_stockout?: number | null;
  reasoning: string;
}

// ----------------- AUTHENTICATION -----------------
export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  title: string;
  avatar_emoji: string;
  created_at: string;
}

export interface UserRegister {
  email: string;
  password: string;
  username: string;
  role?: string;
  title?: string;
  avatar_emoji?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DemoUser {
  name: string;
  email: string;
  password: string;
  role: string;
  avatar: string;
  badge: string;
}

