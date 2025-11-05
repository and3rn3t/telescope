import { useState } from 'react'

/**
 * Hook that uses localStorage for persistent storage
 * This is a fallback when Spark KV is unavailable
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`jwst-${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
      return defaultValue
    }
  })

  const setStoredValue = (newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
      
      try {
        localStorage.setItem(`jwst-${key}`, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
      
      return valueToStore
    })
  }

  return [value, setStoredValue] as const
}