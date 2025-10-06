"use client"

import { useState } from 'react'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Users } from 'lucide-react'

interface RoleSwitcherProps {
  className?: string
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { user, switchRole } = useAuth()
  const [isSwitching, setIsSwitching] = useState(false)

  // Only show for principals (admin users)
  if (!user || user.role !== 'principal') {
    return null
  }

  const handleRoleSwitch = async (newRole: UserRole) => {
    if (newRole === user.role) return

    setIsSwitching(true)
    const success = switchRole(newRole)

    if (success) {
      // Add a small delay to show the switching state
      setTimeout(() => {
        setIsSwitching(false)
        // Force page reload to update all components with new role
        window.location.reload()
      }, 500)
    } else {
      setIsSwitching(false)
    }
  }

  const roles: { role: UserRole; label: string; color: string }[] = [
    { role: 'learner', label: 'Student View', color: 'bg-blue-100 text-blue-800' },
    { role: 'teacher', label: 'Teacher View', color: 'bg-green-100 text-green-800' },
    { role: 'parent', label: 'Parent View', color: 'bg-purple-100 text-purple-800' },
    { role: 'principal', label: 'Admin View', color: 'bg-red-100 text-red-800' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Users className="mr-2 h-4 w-4" />
          Switch View
          {isSwitching && <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Switch User Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map(({ role, label, color }) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            disabled={isSwitching || role === user.role}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={color}>
                {label}
              </Badge>
            </div>
            {role === user.role && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
