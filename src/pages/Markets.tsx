import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarketData } from '@/hooks/useMarketData'

export const Markets = () => {
  const { crypto, stocks, commodities } = useMarketData()
  const [activeTab, setActiveTab] = useState<'all' | 'crypto' | 'stock' | 'commodity'>('all')
  const [sortBy, setSortBy] = useState<'price' | 'change24h' | 'volume'>('price')

  const getAssets = () => {
    let assets: any[] = []
    if (activeTab === 'all') {
      assets = [...crypto, ...stocks, ...commodities]
    } else if (activeTab === 'crypto') {
      assets = crypto
    } else if (activeTab === 'stock') {
      assets = stocks
    } else {
      assets = commodities
    }
    return assets.sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price
      if (sortBy === 'change24h') return b.change24h - a.change24h
      return b.volume - a.volume
    })
  }

  const assets = getAssets()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Global Markets</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Real-time prices for crypto, stocks, and commodities
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}>
          {(['all', 'crypto', 'stock', 'commodity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: activeTab === tab ? 'var(--primary)' : 'var(--surface)',
                color: activeTab === tab ? 'var(--text)' : 'var(--text)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'all' ? 'All Markets' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
          >
            <option value="price">Sort by Price</option>
            <option value="change24h">Sort by 24h Change</option>
            <option value="volume">Sort by Volume</option>
          </select>
        </div>

        {/* Market Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {assets.map(asset => (
            <Link
              key={asset.symbol}
              to={`/trade/${asset.symbol}`}
              style={{
                background: 'var(--surface)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 16px rgba(212,175,55,0.1)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{asset.symbol}</div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                    {asset.name}
                  </p>
                </div>
                <div style={{
                  background: asset.type === 'crypto' ? 'rgba(212,175,55,0.1)' :
                    asset.type === 'stock' ? 'rgba(16,185,129,0.1)' :
                    'rgba(184,149,106,0.1)',
                  color: asset.type === 'crypto' ? 'var(--primary)' :
                    asset.type === 'stock' ? 'var(--secondary)' :
                    'var(--accent)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}>
                  {asset.type}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                  ${asset.price.toFixed(2)}
                </div>
                <div style={{
                  color: asset.change24h >= 0 ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                }}>
                  {asset.change24h >= 0 ? '↑' : '↓'} {asset.change24h.toFixed(2)}% (24h)
                </div>
              </div>

              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-light)',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
              }}>
                <div>Volume: ${(asset.volume / 1e9).toFixed(1)}B</div>
                {asset.marketCap > 0 && (
                  <div>Market Cap: ${(asset.marketCap / 1e9).toFixed(1)}B</div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = `/trade/${asset.symbol}`
                }}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  background: 'var(--primary)',
                  color: 'var(--text)',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Trade
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
