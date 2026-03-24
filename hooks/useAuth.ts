import { useEffect, useState } from 'react'

export interface User {
  id: string
  email: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user')
    setUser(null)
  }

  return { user, isLoading, logout }
}
