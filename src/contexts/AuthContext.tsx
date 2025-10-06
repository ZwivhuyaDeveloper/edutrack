"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = "learner" | "teacher" | "principal" | "parent"

export interface RegistrationData {
  name: string
  email: string
  password: string
  role: UserRole
  relatedUserIds?: string[] // For parent-child relationships
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface ParentChildRelationship {
  parentId: string
  childId: string
  relationship: 'parent' | 'guardian'
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
  register: (userData: RegistrationData) => Promise<boolean>
  getRelatedUsers: (userId: string) => User[]
  getChildrenForParent: (parentId: string) => User[]
  getParentForChild: (childId: string) => User | null
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
  },
  'learner2@edutrack.com': {
    password: 'password123',
    user: {
      id: '5',
      name: 'Jane Student',
      email: 'learner2@edutrack.com',
      role: 'learner',
      avatar: '/placeholder-avatar.jpg'
    }
  }
}

// Mock parent-child relationships
const mockParentChildRelationships: ParentChildRelationship[] = [
  { parentId: '4', childId: '1', relationship: 'parent' }, // Lisa Parent -> John Student
  { parentId: '4', childId: '5', relationship: 'parent' }, // Lisa Parent -> Jane Student
]

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

  const register = async (userData: RegistrationData): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if email already exists
    if (mockUsers[userData.email.toLowerCase()]) {
      setIsLoading(false)
      return false
    }

    // Create new user
    const newUser: User = {
      id: (Object.keys(mockUsers).length + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: '/placeholder-avatar.jpg'
    }

    // Add to mock users
    mockUsers[userData.email.toLowerCase()] = {
      password: userData.password,
      user: newUser
    }

    // Handle parent-child relationships if provided
    if (userData.relatedUserIds && userData.relatedUserIds.length > 0) {
      userData.relatedUserIds.forEach(relatedId => {
        if (userData.role === 'parent') {
          mockParentChildRelationships.push({
            parentId: newUser.id,
            childId: relatedId,
            relationship: 'parent'
          })
        } else if (userData.role === 'learner') {
          mockParentChildRelationships.push({
            parentId: relatedId,
            childId: newUser.id,
            relationship: 'parent'
          })
        }
      })
    }

    setIsLoading(false)
    return true
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

  const getRelatedUsers = (userId: string): User[] => {
    const relatedUsers: User[] = []

    // Find relationships for this user
    mockParentChildRelationships.forEach(relationship => {
      if (relationship.parentId === userId || relationship.childId === userId) {
        const relatedUserId = relationship.parentId === userId ? relationship.childId : relationship.parentId
        const relatedUser = Object.values(mockUsers).find(mockUser => mockUser.user.id === relatedUserId)?.user
        if (relatedUser) {
          relatedUsers.push(relatedUser)
        }
      }
    })

    return relatedUsers
  }

  const getChildrenForParent = (parentId: string): User[] => {
    const children: User[] = []

    mockParentChildRelationships.forEach(relationship => {
      if (relationship.parentId === parentId) {
        const child = Object.values(mockUsers).find(mockUser => mockUser.user.id === relationship.childId)?.user
        if (child) {
          children.push(child)
        }
      }
    })

    return children
  }

  const getParentForChild = (childId: string): User | null => {
    const relationship = mockParentChildRelationships.find(rel => rel.childId === childId)
    if (relationship) {
      return Object.values(mockUsers).find(mockUser => mockUser.user.id === relationship.parentId)?.user || null
    }
    return null
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    canAccess,
    switchRole,
    register,
    getRelatedUsers,
    getChildrenForParent,
    getParentForChild
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
