// Market related types
export interface Symbol {
  id: number;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  name?: string;
  status?: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  volume24h: number;
  quoteAssetVolume24h: number;
  name: string;
}

export interface Trade {
  id: string;
  symbol: string;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  takerSide: 'BUY' | 'SELL';
  created_at?: string;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  currentPrice: number;
}
