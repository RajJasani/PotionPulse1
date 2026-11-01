/**
 * Typed API Client for Madam Hexley's Potion Pantry
 * Shared between Web Dashboard (Vite) and Mobile App (Expo React Native)
 */

import {
  Shelf,
  ShelfCreate,
  Ingredient,
  IngredientCreate,
  SaleCreate,
  SaleResponse,
  StockAdjustCreate,
  StockMovement,
  PotionEvent,
  EventCreate,
  Anomaly,
  DemandHistoryResponse,
  ForecastResponse,
  ProphecyStockout,
  ReorderRecommendation,
} from './api.types';

export class PotionPantryClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl.replace(/\/$/, '');
    } else if (typeof window !== 'undefined') {
      const envUrl = (import.meta as any)?.env?.VITE_API_URL || (window as any)?.__POTION_API_URL__;
      this.baseUrl = envUrl ? envUrl.replace(/\/$/, '') : '';
    } else {
      this.baseUrl = 'http://localhost:8000';
    }
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  // --- SYSTEM HEALTH ---
  async checkHealth(): Promise<{ status: string; service: string; version?: string }> {
    return this.request<{ status: string; service: string; version?: string }>('/health');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        let errorDetail = `Arcane error: ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson && errJson.detail) {
            errorDetail = errJson.detail;
          }
        } catch {
          // fallback to status text
        }
        throw new Error(errorDetail);
      }
      return (await response.json()) as T;
    } catch (err: any) {
      console.error(`PotionPantryClient Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // --- SHELVES ---
  async getShelves(): Promise<Shelf[]> {
    return this.request<Shelf[]>('/shelves');
  }

  async createShelf(data: ShelfCreate): Promise<Shelf> {
    return this.request<Shelf>('/shelves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getShelf(id: string): Promise<Shelf> {
    return this.request<Shelf>(`/shelves/${id}`);
  }

  // --- INGREDIENTS ---
  async getIngredients(params?: {
    shelf_id?: string;
    category?: string;
    low_stock_only?: boolean;
  }): Promise<Ingredient[]> {
    const query = new URLSearchParams();
    if (params?.shelf_id) query.append('shelf_id', params.shelf_id);
    if (params?.category) query.append('category', params.category);
    if (params?.low_stock_only) query.append('low_stock_only', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Ingredient[]>(`/ingredients${qs}`);
  }

  async getIngredient(id: string): Promise<Ingredient> {
    return this.request<Ingredient>(`/ingredients/${id}`);
  }

  async createIngredient(data: IngredientCreate): Promise<Ingredient> {
    return this.request<Ingredient>('/ingredients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIngredient(id: string, data: Partial<IngredientCreate>): Promise<Ingredient> {
    return this.request<Ingredient>(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIngredient(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/ingredients/${id}`, {
      method: 'DELETE',
    });
  }

  // --- SALES & MOVEMENTS ---
  async recordSale(data: SaleCreate): Promise<SaleResponse> {
    return this.request<SaleResponse>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adjustStock(data: StockAdjustCreate): Promise<StockMovement> {
    return this.request<StockMovement>('/stock/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStockMovements(params?: { ingredient_id?: string; limit?: number }): Promise<StockMovement[]> {
    const query = new URLSearchParams();
    if (params?.ingredient_id) query.append('ingredient_id', params.ingredient_id);
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<StockMovement[]>(`/stock/movements${qs}`);
  }

  async getDemandHistory(ingredientId: string, days: number = 30): Promise<DemandHistoryResponse> {
    return this.request<DemandHistoryResponse>(`/sales/history/${ingredientId}?days=${days}`);
  }

  // --- ML INTELLIGENCE & PROPHECIES ---
  async getForecast(ingredientId: string, horizonDays: number = 14): Promise<ForecastResponse> {
    return this.request<ForecastResponse>(`/forecasts/${ingredientId}?horizon_days=${horizonDays}`);
  }

  async getStockoutProphecies(): Promise<ProphecyStockout[]> {
    return this.request<ProphecyStockout[]>('/prophecies/stockouts');
  }

  async getReorderRecommendations(): Promise<ReorderRecommendation[]> {
    return this.request<ReorderRecommendation[]>('/recommendations/reorder');
  }

  // --- ANOMALIES (STRANGE HAPPENINGS) ---
  async getAnomalies(status?: string): Promise<Anomaly[]> {
    const qs = status ? `?status=${status}` : '';
    return this.request<Anomaly[]>(`/anomalies${qs}`);
  }

  async resolveAnomaly(id: string, data: { status: 'ACKNOWLEDGED' | 'RESOLVED'; notes?: string }): Promise<Anomaly> {
    return this.request<Anomaly>(`/anomalies/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scanAnomalies(): Promise<{ status: string; total_anomalies_detected: number; new_anomalies_recorded: number }> {
    return this.request<{ status: string; total_anomalies_detected: number; new_anomalies_recorded: number }>(
      '/anomalies/scan',
      { method: 'POST' }
    );
  }

  async getEventSuggestions(recentDays: number = 30): Promise<any[]> {
    return this.request<any[]>(`/anomalies/suggestions?recent_days=${recentDays}`);
  }

  // --- EVENTS (MIDNIGHT CURSE / FULL MOON) ---
  async getEvents(activeOnly: boolean = false): Promise<PotionEvent[]> {
    const qs = activeOnly ? '?active_only=true' : '';
    return this.request<PotionEvent[]>(`/events${qs}`);
  }

  async createEvent(data: EventCreate): Promise<PotionEvent> {
    return this.request<PotionEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: EventCreate): Promise<PotionEvent> {
    return this.request<PotionEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Default global instance pointing to local backend
export const api = new PotionPantryClient();
