"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type GrayscaleContextType = {
  isGrayscale: boolean
  toggleGrayscale: () => void
}

const GrayscaleContext = createContext<GrayscaleContextType | undefined>(undefined)

export function GrayscaleProvider({ children }: { children: React.ReactNode }) {
  const [isGrayscale, setIsGrayscale] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('grayscale')
    if (saved === 'true') {
      setIsGrayscale(true)
    }
  }, [])

  useEffect(() => {
    if (isGrayscale) {
      document.documentElement.classList.add('filter', 'grayscale')
    } else {
      document.documentElement.classList.remove('grayscale')
      document.documentElement.classList.remove('filter')
    }
    localStorage.setItem('grayscale', String(isGrayscale))
  }, [isGrayscale])

  const toggleGrayscale = () => setIsGrayscale((prev) => !prev)

  return (
    <GrayscaleContext.Provider value={{ isGrayscale, toggleGrayscale }}>
      {children}
    </GrayscaleContext.Provider>
  )
}

export function useGrayscale() {
  const context = useContext(GrayscaleContext)
  if (context === undefined) {
    throw new Error('useGrayscale must be used within a GrayscaleProvider')
  }
  return context
}
