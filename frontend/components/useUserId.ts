'use client'

import { useEffect, useMemo, useState } from 'react'

const KEY = 'personalos.userId'

export function useUserId() {
  const [userId, setUserId] = useState('default_user')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY)
      if (stored) setUserId(stored)
    } finally {
      setReady(true)
    }
  }, [])

  const actions = useMemo(() => {
    return {
      set(next: string) {
        const value = (next || '').trim() || 'default_user'
        setUserId(value)
        try {
          window.localStorage.setItem(KEY, value)
        } catch {}
      },
    }
  }, [])

  return { userId, ready, ...actions }
}

