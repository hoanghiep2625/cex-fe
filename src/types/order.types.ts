// Order and Trading related types
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET';
export type OrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED';

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  qty: string;
  filled_qty: string;
  remaining_qty: string;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface Balance {
  asset: string;
  available: string;
  locked: string;
  wallet_type?: string;
}

export interface CreateOrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price?: string;
  qty: string;
}
