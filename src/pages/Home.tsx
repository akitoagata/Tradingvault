import { Link } from 'react-router-dom'
import { useMarketData } from '@/hooks/useMarketData'

export const Home = () => {
  const { crypto, stocks, commodities } = useMarketData()

  const featuredAssets = [
    crypto[0],
    crypto[1],
    stocks[0],
    stocks[1],
    commodities[0],
    commodities[1],
  ].filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-dark) 100%)',
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '1rem',
          color: 'var(--text)',
          fontFamily: 'Syne',
        }}>
          Trade Smarter. Move Faster.
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-light)',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
        }}>
          Trade crypto, stocks, and commodities with real-time data and binary options
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/markets" style={{
            background: 'var(--primary)',
            color: 'var(--text)',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '1.1rem',
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            Explore Markets
          </Link>
          <Link to="/register" style={{
            background: 'var(--secondary)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            fontSize: '1.1rem',
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            Start Trading
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
      }}>
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>24/7</div>
          <p style={{ color: 'var(--text-light)' }}>Trading Available</p>
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '0.5rem' }}>3 Asset Classes</div>
          <p style={{ color: 'var(--text-light)' }}>Crypto, Stocks, Commodities</p>
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem' }}>Real-Time</div>
          <p style={{ color: 'var(--text-light)' }}>Live Market Data</p>
        </div>
      </section>

      {/* Featured Markets */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.25rem' }}>Live Markets</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}>
          {featuredAssets.map(asset => (
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
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{asset.symbol}</div>
                <div style={{
                  color: asset.change24h >= 0 ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 600,
                }}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                ${asset.price.toFixed(2)}
              </div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{asset.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem', background: 'var(--surface)', marginTop: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.25rem' }}>Why TradeVault?</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h3>Real-Time Data</h3>
              <p style={{ color: 'var(--text-light)' }}>Live market prices from CoinGecko, always up-to-date</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3>Binary Options</h3>
              <p style={{ color: 'var(--text-light)' }}>15s, 30s, 45s, 60s timeframes with high payouts</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3>Full Portfolio Tracking</h3>
              <p style={{ color: 'var(--text-light)' }}>Monitor positions, P&L, and trade history</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2.25rem' }}>Ready to start trading?</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Create an account and get $100,000 in virtual trading balance
        </p>
        <Link to="/register" style={{
          background: 'var(--primary)',
          color: 'var(--text)',
          padding: '1rem 2.5rem',
          borderRadius: '0.5rem',
          fontWeight: 600,
          fontSize: '1.1rem',
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          Get Started Free
        </Link>
      </section>
    </div>
  )
}
