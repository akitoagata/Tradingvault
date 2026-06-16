import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/AuthGuard'
import { useMarketData } from '@/hooks/useMarketData'
import { supabase, type Portfolio } from '@/lib/supabase'
import { useSettlementNotification } from '@/hooks/useSettlementNotification'

export const Trade = () => {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { all: assets } = useMarketData()
  const [mode, setMode] = useState<'spot' | 'options'>('spot')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [direction, setDirection] = useState<'call' | 'put'>('call')
  const [timeframe, setTimeframe] = useState(15)
  const [quantity, setQuantity] = useState('')
  const [stake, setStake] = useState('')
  const [sideType, setSideType] = useState<'buy' | 'sell'>('buy')
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [activeOptions, setActiveOptions] = useState<any[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showToast } = useSettlementNotification()

  const asset = assets.find(a => a.symbol === symbol)
  const balance = profile?.balance || 0
  const holding = portfolios.find(p => p.asset_symbol === symbol)

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const { data: portfolioData } = await supabase
          .from('portfolios')
          .select('*')
          .eq('asset_symbol', symbol)
        setPortfolios(portfolioData || [])

        const { data: optionData } = await supabase
          .from('option_trades')
          .select('*')
          .eq('asset_symbol', symbol)
          .eq('status', 'active')
        setActiveOptions(optionData || [])
      }
      fetchData()
    }
  }, [symbol, user])

  // Settle expired options
  useEffect(() => {
    const checkSettlements = async () => {
      const now = Date.now()
      for (const option of activeOptions) {
        const expiryTime = new Date(option.created_at).getTime() + option.duration_seconds * 1000
        if (now >= expiryTime) {
          await settleOption(option)
        }
      }
    }

    const interval = setInterval(checkSettlements, 1000)
    return () => clearInterval(interval)
  }, [activeOptions])

  const settleOption = async (option: any) => {
    try {
      const currentPrice = asset?.price || 0
      const won = (option.direction === 'call' && currentPrice > option.entry_price) ||
                  (option.direction === 'put' && currentPrice < option.entry_price)

      const payout = won ? option.stake * (1 + (option.duration_seconds === 15 ? 0.1 : option.duration_seconds === 30 ? 0.25 : option.duration_seconds === 45 ? 0.4 : 0.65)) : 0

      await supabase
        .from('option_trades')
        .update({
          status: won ? 'won' : 'lost',
          exit_price: currentPrice,
          payout_amount: payout,
          settled_at: new Date().toISOString(),
        })
        .eq('id', option.id)

      if (won) {
        await supabase
          .from('profiles')
          .update({ balance: balance + payout - option.stake })
          .eq('id', user!.id)
      }

      showToast({
        symbol: option.asset_symbol,
        direction: option.direction.toUpperCase(),
        result: won ? 'WON' : 'LOST',
        amount: won ? payout - option.stake : -option.stake,
      })

      setActiveOptions(prev => prev.filter(o => o.id !== option.id))
    } catch (error) {
      console.error('Settlement error:', error)
    }
  }

  const handleExecuteTrade = async () => {
    if (!user || !asset) return

    setLoading(true)
    try {
      if (mode === 'spot') {
        const qty = parseFloat(quantity)
        const total = qty * asset.price

        if (sideType === 'buy') {
          if (total > balance) throw new Error('Insufficient balance')

          const existing = portfolios.find(p => p.asset_symbol === symbol)
          if (existing) {
            const newAvgPrice = (existing.quantity * existing.avg_price + qty * asset.price) / (existing.quantity + qty)
            await supabase
              .from('portfolios')
              .update({
                quantity: existing.quantity + qty,
                avg_price: newAvgPrice,
              })
              .eq('id', existing.id)
          } else {
            await supabase.from('portfolios').insert({
              user_id: user.id,
              asset_symbol: symbol,
              asset_type: asset.type,
              quantity: qty,
              avg_price: asset.price,
            })
          }

          await supabase
            .from('profiles')
            .update({ balance: balance - total })
            .eq('id', user.id)
        } else {
          if (!holding || holding.quantity < qty) throw new Error('Insufficient holdings')

          if (holding.quantity === qty) {
            await supabase.from('portfolios').delete().eq('id', holding.id)
          } else {
            await supabase
              .from('portfolios')
              .update({ quantity: holding.quantity - qty })
              .eq('id', holding.id)
          }

          await supabase
            .from('profiles')
            .update({ balance: balance + total })
            .eq('id', user.id)
        }

        await supabase.from('trade_history').insert({
          user_id: user.id,
          asset_symbol: symbol,
          asset_type: asset.type,
          trade_type: sideType,
          quantity: qty,
          price: asset.price,
          total,
        })
      } else {
        const stakeAmount = parseFloat(stake)
        if (stakeAmount > balance) throw new Error('Insufficient balance')

        await supabase
          .from('option_trades')
          .insert({
            user_id: user.id,
            asset_symbol: symbol,
            asset_type: asset.type,
            direction,
            duration_seconds: timeframe,
            stake: stakeAmount,
            entry_price: asset.price,
            status: 'active',
          })

        await supabase
          .from('profiles')
          .update({ balance: balance - stakeAmount })
          .eq('id', user.id)
      }

      setQuantity('')
      setStake('')
      setShowConfirm(false)

      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('asset_symbol', symbol)
      setPortfolios(portfolioData || [])
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!asset) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Asset not found</p>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '2.25rem' }}>
                {symbol} - ${asset.price.toFixed(2)}
              </h1>
              <div style={{
                color: asset.change24h >= 0 ? 'var(--success)' : 'var(--danger)',
                fontSize: '1.25rem',
                fontWeight: 700,
              }}>
                {asset.change24h >= 0 ? '↑' : '↓'} {asset.change24h.toFixed(2)}%
              </div>
            </div>
            <p style={{ color: 'var(--text-light)' }}>{asset.name} • Balance: ${balance.toFixed(2)}</p>
          </div>

          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            background: 'var(--surface)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            width: 'fit-content',
          }}>
            <button
              onClick={() => setMode('spot')}
              style={{
                padding: '0.75rem 1.5rem',
                background: mode === 'spot' ? 'var(--primary)' : 'transparent',
                color: mode === 'spot' ? 'var(--text)' : 'var(--text-light)',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Spot Trading
            </button>
            <button
              onClick={() => setMode('options')}
              style={{
                padding: '0.75rem 1.5rem',
                background: mode === 'options' ? 'var(--primary)' : 'transparent',
                color: mode === 'options' ? 'var(--text)' : 'var(--text-light)',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Binary Options 🚀
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            {/* Chart Area */}
            <div style={{
              background: 'var(--surface)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--text-light)',
            }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📊 Real-time Chart</div>
              <div style={{ textAlign: 'center' }}>
                <p>Live price chart for {symbol}</p>
                <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                  Current Price: ${asset.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Order Form */}
            <div style={{
              background: 'var(--surface)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid var(--border)',
              height: 'fit-content',
            }}>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>
                {mode === 'spot' ? 'Place Order' : 'Binary Option'}
              </h3>

              {mode === 'spot' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Side Selector */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSideType('buy')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: sideType === 'buy' ? 'var(--success)' : 'var(--surface-dark)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setSideType('sell')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: sideType === 'sell' ? 'var(--danger)' : 'var(--surface-dark)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      SELL
                    </button>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.00"
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Quick % Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[10, 25, 50, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => {
                          if (sideType === 'buy') {
                            setQuantity((balance * (pct / 100) / asset.price).toFixed(8))
                          } else if (holding) {
                            setQuantity((holding.quantity * (pct / 100)).toFixed(8))
                          }
                        }}
                        style={{
                          padding: '0.5rem',
                          background: 'var(--surface-dark)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{ background: 'var(--surface-dark)', padding: '1rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>Total</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      ${((parseFloat(quantity) || 0) * asset.price).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={!quantity || loading}
                    style={{
                      padding: '1rem',
                      background: sideType === 'buy' ? 'var(--success)' : 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      opacity: !quantity || loading ? 0.5 : 1,
                    }}
                  >
                    {sideType.toUpperCase()} {quantity && parseFloat(quantity) > 0 ? parseFloat(quantity).toFixed(4) : '...'} {symbol}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Direction */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setDirection('call')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: direction === 'call' ? 'var(--success)' : 'var(--surface-dark)',
                        color: direction === 'call' ? 'white' : 'var(--text)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      📈 CALL (Up)
                    </button>
                    <button
                      onClick={() => setDirection('put')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: direction === 'put' ? 'var(--danger)' : 'var(--surface-dark)',
                        color: direction === 'put' ? 'white' : 'var(--text)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      📉 PUT (Down)
                    </button>
                  </div>

                  {/* Timeframe */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      Expiry Time
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      {[
                        { value: 15, payout: 10 },
                        { value: 30, payout: 25 },
                        { value: 45, payout: 40 },
                        { value: 60, payout: 65 },
                      ].map(t => (
                        <button
                          key={t.value}
                          onClick={() => setTimeframe(t.value)}
                          style={{
                            padding: '0.75rem',
                            background: timeframe === t.value ? 'var(--primary)' : 'var(--surface-dark)',
                            color: 'var(--text)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          {t.value}s<br />+{t.payout}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stake */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                      Stake Amount
                    </label>
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder="0.00"
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Quick % */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[10, 25, 50, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setStake((balance * (pct / 100)).toFixed(2))}
                        style={{
                          padding: '0.5rem',
                          background: 'var(--surface-dark)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* Payout Preview */}
                  <div style={{ background: 'var(--surface-dark)', padding: '1rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                      Potential Payout
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                      ${((parseFloat(stake) || 0) * (1 + ({
                        15: 0.1,
                        30: 0.25,
                        45: 0.4,
                        60: 0.65,
                      }[timeframe] || 0))).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={!stake || loading}
                    style={{
                      padding: '1rem',
                      background: direction === 'call' ? 'var(--success)' : 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      opacity: !stake || loading ? 0.5 : 1,
                    }}
                  >
                    {direction.toUpperCase()} - ${parseFloat(stake) || 0}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Options */}
          {mode === 'options' && activeOptions.length > 0 && (
            <div style={{ marginTop: '2rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Active Options</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {activeOptions.map(option => {
                  const createdAt = new Date(option.created_at).getTime()
                  const expiryAt = createdAt + option.duration_seconds * 1000
                  const elapsed = Math.min(Date.now() - createdAt, option.duration_seconds * 1000)
                  const progress = (elapsed / (option.duration_seconds * 1000)) * 100

                  return (
                    <div key={option.id} style{{
                      background: 'var(--surface-dark)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: `2px solid ${option.direction === 'call' ? 'var(--success)' : 'var(--danger)'}`,
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: option.direction === 'call' ? 'var(--success)' : 'var(--danger)' }}>
                        {option.direction.toUpperCase()} - ${option.stake.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>
                        Entry: ${option.entry_price.toFixed(2)}
                      </div>
                      <div style={{
                        background: 'var(--background)',
                        height: '4px',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem',
                      }}>
                        <div style={{
                          background: option.direction === 'call' ? 'var(--success)' : 'var(--danger)',
                          height: '100%',
                          width: `${progress}%`,
                          transition: 'width 0.1s linear',
                        }} />
                      </div>
                      <div style={{ fontSize: '0.85rem', textAlign: 'center', color: progress > 90 ? 'var(--danger)' : 'var(--text-light)' }}>
                        {Math.ceil((expiryAt - Date.now()) / 1000)}s remaining
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
