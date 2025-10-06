"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, UserPlus, Users, GraduationCap, UserCheck } from 'lucide-react'

export default function RegisterPage() {
  const [step, setStep] = useState<'role' | 'details' | 'relationships' | 'complete'>('role')
  const [selectedRole, setSelectedRole] = useState<'learner' | 'teacher' | 'principal' | 'parent'>('learner')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [relationshipData, setRelationshipData] = useState({
    selectedChildren: [] as string[],
    selectedParents: [] as string[]
  })
  const [error, setError] = useState('')
  const { register, isLoading, getChildrenForParent, getParentForChild } = useAuth()
  const router = useRouter()

  const handleRoleSelect = (role: 'learner' | 'teacher' | 'principal' | 'parent') => {
    setSelectedRole(role)
    setStep('details')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    return true
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Move to relationships step for parent/learner roles
    if (selectedRole === 'parent' || selectedRole === 'learner') {
      setStep('relationships')
    } else {
      handleRegistration()
    }
  }

  const handleRegistration = async () => {
    setError('')

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        relatedUserIds: selectedRole === 'parent'
          ? relationshipData.selectedChildren
          : selectedRole === 'learner'
          ? relationshipData.selectedParents
          : undefined
      }

      const success = await register(registrationData)
      if (success) {
        setStep('complete')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError('Email already exists or registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
      console.error('Registration error:', err)
    }
  }

  const toggleChildSelection = (childId: string) => {
    setRelationshipData(prev => ({
      ...prev,
      selectedChildren: prev.selectedChildren.includes(childId)
        ? prev.selectedChildren.filter(id => id !== childId)
        : [...prev.selectedChildren, childId]
    }))
  }

  const toggleParentSelection = (parentId: string) => {
    setRelationshipData(prev => ({
      ...prev,
      selectedParents: prev.selectedParents.includes(parentId)
        ? prev.selectedParents.filter(id => id !== parentId)
        : [...prev.selectedParents, parentId]
    }))
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Choose Your Role</CardTitle>
            <CardDescription className="text-center">
              Select the role that best describes you to continue registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => handleRoleSelect('learner')}
              >
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="font-semibold">Student/Learner</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-200"
                onClick={() => handleRoleSelect('parent')}
              >
                <Users className="h-8 w-8 text-green-600" />
                <span className="font-semibold">Parent/Guardian</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
                onClick={() => handleRoleSelect('teacher')}
              >
                <UserCheck className="h-8 w-8 text-purple-600" />
                <span className="font-semibold">Teacher</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-200"
                onClick={() => handleRoleSelect('principal')}
              >
                <UserCheck className="h-8 w-8 text-orange-600" />
                <span className="font-semibold">Principal/Admin</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'relationships') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('details')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl font-bold">
                {selectedRole === 'parent' ? 'Select Your Children' : 'Select Your Parents'}
              </CardTitle>
            </div>
            <CardDescription>
              {selectedRole === 'parent'
                ? 'Choose which students you are the parent or guardian of'
                : 'Choose your parent or guardian from the list below'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedRole === 'parent' ? (
              <div className="space-y-4">
                <Label className="text-base font-medium">Available Students</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {/* Mock available students - in a real app, this would come from an API */}
                  {[
                    { id: '1', name: 'John Student', email: 'learner@edutrack.com' },
                    { id: '5', name: 'Jane Student', email: 'learner2@edutrack.com' }
                  ].map(student => (
                    <label key={student.id} htmlFor={`student-${student.id}`} className={`p-3 border rounded-lg cursor-pointer transition-colors block ${relationshipData.selectedChildren.includes(student.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                        <input
                          id={`student-${student.id}`}
                          type="checkbox"
                          checked={relationshipData.selectedChildren.includes(student.id)}
                          onChange={() => toggleChildSelection(student.id)}
                          className="w-4 h-4"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Label className="text-base font-medium">Available Parents</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {/* Mock available parents - in a real app, this would come from an API */}
                  {[
                    { id: '4', name: 'Lisa Parent', email: 'parent@edutrack.com' }
                  ].map(parent => (
                    <label key={parent.id} htmlFor={`parent-${parent.id}`} className={`p-3 border rounded-lg cursor-pointer transition-colors block ${relationshipData.selectedParents.includes(parent.id) ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{parent.name}</p>
                          <p className="text-sm text-gray-500">{parent.email}</p>
                        </div>
                        <input
                          id={`parent-${parent.id}`}
                          type="checkbox"
                          checked={relationshipData.selectedParents.includes(parent.id)}
                          onChange={() => toggleParentSelection(parent.id)}
                          className="w-4 h-4"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleRegistration}
              className="w-full"
              disabled={isLoading || (selectedRole === 'parent' && relationshipData.selectedChildren.length === 0) || (selectedRole === 'learner' && relationshipData.selectedParents.length === 0)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Complete Registration'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Registration Complete!</CardTitle>
            <CardDescription>
              Your account has been created successfully. Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('role')}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          </div>
          <CardDescription>
            Enter your details to create your EduTrack account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
