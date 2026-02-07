'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Brain, MessageCircle, Orbit } from 'lucide-react'

type TabKey = 'chat' | 'map' | 'memory'

function activeTab(pathname: string, tabParam: string | null): TabKey {
  if (pathname === '/memories') return 'memory'
  if (pathname === '/chat') return 'chat'
  if (pathname === '/space') {
    if (tabParam === 'map' || tabParam === 'memory' || tabParam === 'chat') return tabParam
    return 'chat'
  }
  return 'chat'
}

function tabHref(key: TabKey) {
  return `/space?tab=${key}`
}

export function BottomTabs({
  currentTab,
  onTabChange,
}: {
  currentTab: TabKey
  onTabChange: (tab: TabKey) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs ${
            currentTab === 'chat' ? 'bg-black/5 text-black' : 'text-black/60'
          }`}
        >
          <MessageCircle className="h-5 w-5" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onTabChange('map')}
          className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs ${
            currentTab === 'map' ? 'bg-black/5 text-black' : 'text-black/60'
          }`}
        >
          <Orbit className="h-5 w-5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => onTabChange('memory')}
          className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs ${
            currentTab === 'memory' ? 'bg-black/5 text-black' : 'text-black/60'
          }`}
        >
          <Brain className="h-5 w-5" />
          <span>Me</span>
        </button>
      </div>
    </nav>
  )
}

