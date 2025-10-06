"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = "learner" | "teacher" | "principal" | "parent"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (role: UserRole) => boolean
  canAccess: (allowedRoles: UserRole[]) => boolean
  switchRole: (newRole: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo purposes - in a real app, this would come from a backend
const mockUsers: Record<string, { password: string; user: User }> = {
  'learner@edutrack.com': {
    password: 'password123',
    user: {
      id: '1',
      name: 'John Student',
      email: 'learner@edutrack.com',
      role: 'learner',
      avatar: '/placeholder-avatar.jpg'
    }
  },
  'teacher@edutrack.com': {
    password: 'password123',
    user: {
      id: '2',
      name: 'Sarah Teacher',
      email: 'teacher@edutrack.com',
      role: 'teacher',
      avatar: '/placeholder-avatar.jpg'
    }
  },
  'principal@edutrack.com': {
    password: 'password123',
    user: {
      id: '3',
      name: 'Mike Principal',
      email: 'principal@edutrack.com',
      role: 'principal',
      avatar: '/placeholder-avatar.jpg'
    }
  },
  'parent@edutrack.com': {
    password: 'password123',
    user: {
      id: '4',
      name: 'Lisa Parent',
      email: 'parent@edutrack.com',
      role: 'parent',
      avatar: '/placeholder-avatar.jpg'
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in on app start
    const savedUser = localStorage.getItem('edutrack_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('edutrack_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockUser = mockUsers[email.toLowerCase()]

    if (mockUser && mockUser.password === password) {
      const userData = mockUser.user
      setUser(userData)
      localStorage.setItem('edutrack_user', JSON.stringify(userData))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('edutrack_user')
  }

  const switchRole = (newRole: UserRole): boolean => {
    if (!user) return false

    // Only principals can switch roles (for demo purposes)
    if (user.role !== 'principal') return false

    const updatedUser = { ...user, role: newRole }
    setUser(updatedUser)
    localStorage.setItem('edutrack_user', JSON.stringify(updatedUser))
    return true
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    return user ? allowedRoles.includes(user.role) : false
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    canAccess,
    switchRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
