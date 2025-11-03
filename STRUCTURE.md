# CEX Frontend - Project Structure

## 📁 Cấu trúc thư mục

```
src/
├── app/                      # Next.js 15 App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── login/               # Login page
│   └── trade/[pair]/        # Trading page (dynamic route)
│
├── components/              # React Components (organized by domain)
│   ├── ui/                  # Reusable UI components
│   │   ├── CustomCheckbox.tsx
│   │   ├── NumberInput.tsx
│   │   ├── TabUnderline.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ConnectionStatus.tsx
│   │
│   ├── market/              # Market-related components
│   │   ├── MarketHeader.tsx
│   │   ├── TradingPairListPanel.tsx
│   │   └── RecentTrades.tsx
│   │
│   ├── orderbook/           # Order book components
│   │   └── OrderBook.tsx
│   │
│   ├── trading/             # Trading forms & panels
│   │   ├── OrderEntryPanel.tsx
│   │   └── UserOrderManagementPanel.tsx
│   │
│   ├── chart/               # Chart components
│   │   ├── ChartPanel.tsx
│   │   └── CandlestickChart.tsx
│   │
│   ├── common/              # Global UI components
│   │   ├── GlobalStatusBar.tsx
│   │   └── MenuBar.tsx
│   │
│   └── icons/               # Custom icon components
│       └── AdjustIcon.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useOrderBook.ts
│   ├── useRecentTrades.ts
│   ├── useMarketData.ts
│   ├── usePendingOrders.ts
│   ├── useCandles.ts
│   ├── useTicker.ts
│   └── index.ts             # Barrel export for convenience
│
├── context/                 # React Context providers
│   ├── SymbolContext.tsx
│   └── WebSocketContext.tsx
│
├── types/                   # TypeScript type definitions
│   ├── market.types.ts      # Market, Symbol, Trade types
│   ├── order.types.ts       # Order, Balance types
│   └── index.ts             # Barrel export
│
├── services/                # API & WebSocket services
│   ├── api/                 # REST API services (future)
│   └── websocket/           # WebSocket services (future)
│
└── lib/                     # Utilities & config
    ├── axiosInstance.ts     # Axios configuration
    └── constants.ts         # App constants
```

## 🎯 Nguyên tắc tổ chức

### 1. **Components theo domain**
- Mỗi domain có folder riêng (market, trading, orderbook, chart)
- UI components dùng chung trong `/ui`
- Global components trong `/common`

### 2. **Types tập trung**
- Tất cả TypeScript types trong `/types`
- Export thống nhất qua `index.ts`
- Tránh duplicate interface giữa các file

### 3. **Hooks có barrel export**
```typescript
// Thay vì:
import { useAuth } from "@/hooks/useAuth";
import { useOrderBook } from "@/hooks/useOrderBook";

// Có thể dùng:
import { useAuth, useOrderBook } from "@/hooks";
```

### 4. **Import paths**
```typescript
// Components
import OrderBook from "@/components/orderbook/OrderBook";
import MarketHeader from "@/components/market/MarketHeader";
import CustomCheckbox from "@/components/ui/CustomCheckbox";

// Types
import { Symbol, MarketData, Order } from "@/types";

// Hooks
import { useAuth, useOrderBook } from "@/hooks";
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **State**: TanStack Query, Context API
- **API**: Axios
- **Charts**: Lightweight Charts
- **WebSocket**: socket.io-client
- **Toast**: react-hot-toast

## 🚀 Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## 📝 Best Practices

1. **Component naming**: PascalCase (`OrderBook.tsx`)
2. **Hook naming**: camelCase with `use` prefix (`useAuth.ts`)
3. **Type naming**: PascalCase (`Symbol`, `MarketData`)
4. **Folder naming**: lowercase (`orderbook/`, `market/`)

## 🔄 Migration Notes

Refactored from flat structure to domain-based organization:
- All components now organized by domain
- Centralized type definitions
- Added barrel exports for hooks
- Consistent import paths throughout

---

Last updated: November 3, 2025
