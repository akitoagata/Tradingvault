export interface Asset {
  symbol: string
  name: string
  type: 'crypto' | 'stock' | 'commodity'
  price: number
  change24h: number
  change7d: number
  high24h: number
  low24h: number
  volume: number
  marketCap: number
  sparkline: number[]
}

export const mockAssets: Asset[] = [
  // Crypto
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    price: 43250.50,
    change24h: 2.45,
    change7d: 5.32,
    high24h: 44100,
    low24h: 42500,
    volume: 28500000000,
    marketCap: 850000000000,
    sparkline: [42000, 42500, 41800, 42300, 43000, 42800, 43250],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    price: 2280.75,
    change24h: 1.82,
    change7d: 3.45,
    high24h: 2320,
    low24h: 2200,
    volume: 15200000000,
    marketCap: 273600000000,
    sparkline: [2250, 2265, 2240, 2270, 2290, 2275, 2280],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    type: 'crypto',
    price: 142.50,
    change24h: 4.12,
    change7d: 8.75,
    high24h: 145,
    low24h: 135,
    volume: 2800000000,
    marketCap: 62100000000,
    sparkline: [135, 138, 140, 139, 141, 143, 142],
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    type: 'crypto',
    price: 0.512,
    change24h: -1.23,
    change7d: 2.15,
    high24h: 0.535,
    low24h: 0.505,
    volume: 1600000000,
    marketCap: 28000000000,
    sparkline: [0.500, 0.505, 0.510, 0.515, 0.512, 0.520, 0.512],
  },
  // Stocks
  {
    symbol: 'AAPL',
    name: 'Apple',
    type: 'stock',
    price: 189.45,
    change24h: 1.25,
    change7d: 2.80,
    high24h: 191.20,
    low24h: 188.00,
    volume: 52800000,
    marketCap: 2980000000000,
    sparkline: [187, 188, 189, 188.5, 189, 189.5, 189.45],
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    type: 'stock',
    price: 420.50,
    change24h: 0.95,
    change7d: 1.50,
    high24h: 423.00,
    low24h: 418.75,
    volume: 24500000,
    marketCap: 3125000000000,
    sparkline: [418, 419, 420, 420.5, 420, 420.75, 420.50],
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    type: 'stock',
    price: 248.75,
    change24h: 2.35,
    change7d: 5.45,
    high24h: 252.00,
    low24h: 245.00,
    volume: 128600000,
    marketCap: 785000000000,
    sparkline: [243, 245, 247, 248, 249, 248.5, 248.75],
  },
  {
    symbol: 'GOOGL',
    name: 'Google',
    type: 'stock',
    price: 178.32,
    change24h: 0.68,
    change7d: 1.22,
    high24h: 180.00,
    low24h: 177.00,
    volume: 32100000,
    marketCap: 1850000000000,
    sparkline: [176, 177, 178, 178.5, 178, 178.75, 178.32],
  },
  // Commodities
  {
    symbol: 'GOLD',
    name: 'Gold (per oz)',
    type: 'commodity',
    price: 2045.80,
    change24h: 0.45,
    change7d: 1.85,
    high24h: 2055.00,
    low24h: 2035.00,
    volume: 185000000,
    marketCap: 0,
    sparkline: [2038, 2040, 2042, 2044, 2045, 2046, 2045.80],
  },
  {
    symbol: 'CRUDE',
    name: 'Crude Oil (WTI)',
    type: 'commodity',
    price: 78.45,
    change24h: 1.23,
    change7d: 2.15,
    high24h: 80.00,
    low24h: 77.00,
    volume: 2500000000,
    marketCap: 0,
    sparkline: [76, 77, 78, 78.5, 78.2, 78.6, 78.45],
  },
]

export const getAssetBySymbol = (symbol: string) =>
  mockAssets.find(a => a.symbol === symbol)

export const getAssetsByType = (type: 'crypto' | 'stock' | 'commodity') =>
  mockAssets.filter(a => a.type === type)
