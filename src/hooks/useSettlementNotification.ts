import { useState, useCallback } from 'react'

export interface SettlementToast {
  id: string
  symbol: string
  direction: string
  result: 'WON' | 'LOST'
  amount: number
  timestamp: number
}

export const useSettlementNotification = () => {
  const [toasts, setToasts] = useState<SettlementToast[]>([])

  const showToast = useCallback((notification: Omit<SettlementToast, 'id' | 'timestamp'>) => {
    const id = `${notification.symbol}-${Date.now()}`
    const newToast: SettlementToast = {
      ...notification,
      id,
      timestamp: Date.now(),
    }
    setToasts(prev => [...prev, newToast])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, showToast, dismissToast }
}
