import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase, type Portfolio, type TradeHistory } from '@/lib/supabase'
import { useMarketData } from '@/hooks/useMarketData'
import { Link } from 'react-router-dom'

export const Dashboard = () => {
  const { profile } = useAuth()
  const { all: allAssets } = useMarketData()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [trades, setTrades] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: portfolioData } = await supabase
          .from('portfolios')
          .select('*')
          .order('updated_at', { ascending: false })

        const { data: tradeData } = await supabase
          .from('trade_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        setPortfolios(portfolioData || [])
        setTrades(tradeData || [])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculatePortfolioValue = () => {
    return portfolios.reduce((sum, p) => {
      const asset = allAssets.find(a => a.symbol === p.asset_symbol)
      if (asset) return sum + p.quantity * asset.price
      return sum
    }, 0)
  }

  const calculateTotalPL = () => {
    return portfolios.reduce((sum, p) => {
      const asset = allAssets.find(a => a.symbol === p.asset_symbol)
      if (asset) {
        const currentValue = p.quantity * asset.price
        const costValue = p.quantity * p.avg_price
        return sum + (currentValue - costValue)
      }
      return sum
    }, 0)
  }

  const portfolioValue = calculatePortfolioValue()
  const totalPL = calculateTotalPL()
  const totalEquity = (profile?.balance || 0) + portfolioValue
  const plPercent = totalPL / ((profile?.balance || 0) + portfolioValue - totalPL) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Welcome, {profile?.display_name}!</h1>
          <p style={{ color: 'var(--text-light)' }}>Here's your trading overview</p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          <div style={{
            background: 'var(--surface)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
          }}>
            <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Total Equity</p>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              ${totalEquity.toFixed(2)}
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Balance: ${(profile?.balance || 0).toFixed(2)}
            </p>
          </div>

          <div style={{
            background: 'var(--surface)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
          }}>
            <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Portfolio Value</p>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>
              ${portfolioValue.toFixed(2)}
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {portfolios.length} positions
            </p>
          </div>

          <div style={{
            background: 'var(--surface)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
          }}>
            <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>Total P&L</p>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: totalPL >= 0 ? 'var(--success)' : 'var(--danger)',
            }}>
              {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
            </div>
            <p style={{
              color: totalPL >= 0 ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}>
              {totalPL >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Holdings */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Holdings</h2>
          {portfolios.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>No positions yet</p>
              <Link to="/markets" style={{
                background: 'var(--primary)',
                color: 'var(--text)',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}>
                Start Trading
              </Link>
            </div>
          ) : (
            <div style={{
              background: 'var(--surface)',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-dark)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Asset</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Quantity</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Avg Price</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Current Price</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Value</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>P&L</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolios.map((p, idx) => {
                    const asset = allAssets.find(a => a.symbol === p.asset_symbol)
                    const currentValue = p.quantity * (asset?.price || 0)
                    const costValue = p.quantity * p.avg_price
                    const pl = currentValue - costValue
                    const plPercent = (pl / costValue) * 100

                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid var(--border)',
                        background: idx % 2 === 0 ? 'var(--background)' : 'var(--surface)',
                      }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{p.asset_symbol}</td>
                        <td style={{ padding: '1rem' }}>{p.quantity.toFixed(8)}</td>
                        <td style={{ padding: '1rem' }}>${p.avg_price.toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>${asset?.price.toFixed(2) || 'N/A'}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>${currentValue.toFixed(2)}</td>
                        <td style={{
                          padding: '1rem',
                          color: pl >= 0 ? 'var(--success)' : 'var(--danger)',
                          fontWeight: 600,
                        }}>
                          {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <Link to={`/trade/${p.asset_symbol}`} style={{
                            color: 'var(--primary)',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}>
                            Trade
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Trades</h2>
          {trades.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              textAlign: 'center',
              color: 'var(--text-light)',
            }}>
              No trades yet
            </div>
          ) : (
            <div style={{
              background: 'var(--surface)',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-dark)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Asset</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Quantity</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Price</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t, idx) => (
                    <tr key={idx} style={{
                      borderBottom: '1px solid var(--border)',
                      background: idx % 2 === 0 ? 'var(--background)' : 'var(--surface)',
                    }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{t.asset_symbol}</td>
                      <td style={{
                        padding: '1rem',
                        color: t.trade_type === 'buy' ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 600,
                      }}>
                        {t.trade_type.toUpperCase()}
                      </td>
                      <td style={{ padding: '1rem' }}>{t.quantity.toFixed(8)}</td>
                      <td style={{ padding: '1rem' }}>${t.price.toFixed(2)}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>${t.total.toFixed(2)}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
