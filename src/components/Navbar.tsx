import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X } from 'lucide-react'

export const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <Link to="/" style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        fontFamily: 'Syne',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        🏦 TradeVault
      </Link>

      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        '@media (max-width: 768px)': {
          display: mobileOpen ? 'flex' : 'none',
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          flexDirection: 'column',
          background: 'var(--surface)',
          padding: '2rem',
          borderBottom: '1px solid var(--border)',
        },
      }} className={mobileOpen ? 'mobile-menu-open' : ''}>
        <Link to="/markets" style={{ color: 'var(--text)', fontWeight: 500 }}>
          Markets
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: 'var(--text)', fontWeight: 500 }}>
              Dashboard
            </Link>
            <button onClick={handleSignOut} style={{
              background: 'var(--primary)',
              color: 'var(--text)',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
            }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--text)', fontWeight: 500 }}>
              Sign In
            </Link>
            <Link to="/register" style={{
              background: 'var(--primary)',
              color: 'var(--text)',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
            }}>
              Get Started
            </Link>
          </>
        )}
      </div>

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          '@media (max-width: 768px)': {
            display: 'block',
          },
        }}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-open {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  )
}
