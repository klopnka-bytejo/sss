'use client'

import { useState, useEffect } from 'react'

export function useAdminUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/admin/messages', {
          credentials: 'include',
        })
        
        if (res.ok) {
          const data = await res.json()
          const total = (data.conversations || []).reduce(
            (sum: number, conv: any) => sum + (conv.unread_count || 0),
            0
          )
          setUnreadCount(total)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch admin unread messages:', error)
      }
    }

    fetchUnreadCount()
    
    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return unreadCount
}
