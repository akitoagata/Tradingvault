import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { mockAssets, type Asset } from '@/mocks/marketData'

interface MarketData {
  crypto: Asset[]
  stocks: Asset[]
  commodities: Asset[]
  all: Asset[]
  loading: boolean
  error: string | null
}

let cachedData: MarketData | null = null
let lastFetch = 0
const CACHE_DURATION = 60000 // 60 seconds

export const useMarketData = () => {
  const [data, setData] = useState<MarketData>({
    crypto: [],
    stocks: [],
    commodities: [],
    all: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const now = Date.now()
        if (cachedData && now - lastFetch < CACHE_DURATION) {
          setData(cachedData)
          return
        }

        // Call the edge function to fetch real market data
        const { data: response, error } = await supabase.functions.invoke('fetch-market-data')

        if (error) throw error

        const marketData = response || mockAssets

        const organized: MarketData = {
          crypto: marketData.filter(a => a.type === 'crypto'),
          stocks: marketData.filter(a => a.type === 'stock'),
          commodities: marketData.filter(a => a.type === 'commodity'),
          all: marketData,
          loading: false,
          error: null,
        }

        cachedData = organized
        lastFetch = now
        setData(organized)
      } catch (error) {
        console.error('Market data fetch error:', error)
        // Fallback to mock data
        const organized: MarketData = {
          crypto: mockAssets.filter(a => a.type === 'crypto'),
          stocks: mockAssets.filter(a => a.type === 'stock'),
          commodities: mockAssets.filter(a => a.type === 'commodity'),
          all: mockAssets,
          loading: false,
          error: 'Using cached market data',
        }
        cachedData = organized
        setData(organized)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, CACHE_DURATION)
    return () => clearInterval(interval)
  }, [])

  return data
}
