# TradeVault 🏦

A real-time trading platform for crypto, stocks, and commodities with binary options support.

## Features

- **Real-Time Markets**: Live prices for crypto, stocks, and commodities
- **Spot Trading**: Buy and sell assets instantly
- **Binary Options**: Trade with 15s, 30s, 45s, 60s timeframes
- **Live Dashboard**: Track portfolio, P&L, and trade history
- **User Authentication**: Secure account system
- **Portfolio Tracking**: Monitor positions and balance

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account (free tier available)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Running the App

```bash
npm run dev
```

Visit `http://localhost:5173`

## Database Setup

Create these tables in your Supabase project:

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  balance DECIMAL(15,2) DEFAULT 100000,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Portfolios Table
```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  asset_symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  avg_price DECIMAL(15,2) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, asset_symbol)
);
```

### Trade History Table
```sql
CREATE TABLE trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  asset_symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Option Trades Table
```sql
CREATE TABLE option_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  asset_symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  stake DECIMAL(15,2) NOT NULL,
  entry_price DECIMAL(15,2) NOT NULL,
  exit_price DECIMAL(15,2),
  status TEXT NOT NULL,
  payout_amount DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW(),
  settled_at TIMESTAMP
);
```

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Market Data**: CoinGecko API (free tier)
- **Styling**: CSS-in-JS with design system

## Trading Features

### Spot Trading
- Buy and sell assets at market price
- Real-time balance updates
- Portfolio position tracking
- Automatic average price calculation

### Binary Options
- Call/Put predictions
- 4 timeframe options (15s-60s)
- Automatic settlement when timer expires
- Real-time payout calculation
- Toast notifications for results

## Security

- Supabase Row-Level Security (RLS)
- JWT-based authentication
- User can only access their own data
- Server-side trade validation

## License

MIT
