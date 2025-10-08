'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, Video, Mic, BookOpen, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'Group Call' | 'Script' | 'Podcast' | 'Module'
  url: string
}

export function SearchDropdown() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results)
        setIsOpen(data.results.length > 0)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen || results.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => (prev + 1) % results.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          inputRef.current?.blur()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'Group Call':
      case 'Script':
        return <Video className="h-4 w-4 text-muted-foreground" />
      case 'Podcast':
        return <Mic className="h-4 w-4 text-muted-foreground" />
      case 'Module':
        return <BookOpen className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink)] fill-none" />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search modules, replays, podcasts..."
          className="input-field w-full pl-12 pr-4 h-12"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors",
                  "border-b border-gray-100 last:border-0",
                  selectedIndex === index && "bg-gray-50"
                )}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        {result.type}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
