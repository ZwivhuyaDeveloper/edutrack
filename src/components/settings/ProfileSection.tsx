"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Save, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { LucideIcon } from 'lucide-react'

interface ProfileField {
  id: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'number'
  value: string | number | null
  placeholder?: string
  disabled?: boolean
  required?: boolean
  icon?: LucideIcon
  onChange?: (value: string) => void
}

interface ProfileSectionProps {
  firstName: string
  lastName: string
  email: string
  avatar?: string | null
  fields: ProfileField[]
  onSave: (data: any) => Promise<void>
  onAvatarUpload?: () => void
  isSaving?: boolean
}

export function ProfileSection({
  firstName,
  lastName,
  email,
  avatar,
  fields,
  onSave,
  onAvatarUpload,
  isSaving: externalIsSaving
}: ProfileSectionProps) {
  const [internalIsSaving, setInternalIsSaving] = useState(false)
  const isSaving = externalIsSaving !== undefined ? externalIsSaving : internalIsSaving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (externalIsSaving === undefined) {
      setInternalIsSaving(true)
    }

    try {
      await onSave(fields)
      if (externalIsSaving === undefined) {
        toast.success('Profile updated successfully')
      }
    } catch (error) {
      if (externalIsSaving === undefined) {
        toast.error('Failed to update profile')
      }
    } finally {
      if (externalIsSaving === undefined) {
        setInternalIsSaving(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {firstName[0]}{lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm" onClick={onAvatarUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} disabled />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              const FieldIcon = field.icon

              return (
                <div
                  key={field.id}
                  className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                >
                  <div className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <div className="relative">
                        {FieldIcon && (
                          <FieldIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        )}
                        <Textarea
                          id={field.id}
                          value={field.value || ''}
                          onChange={(e) => field.onChange?.(e.target.value)}
                          placeholder={field.placeholder}
                          disabled={field.disabled}
                          required={field.required}
                          className={FieldIcon ? 'pl-10' : ''}
                          rows={3}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        {FieldIcon && (
                          <FieldIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                        <Input
                          id={field.id}
                          type={field.type || 'text'}
                          value={field.value || ''}
                          onChange={(e) => field.onChange?.(e.target.value)}
                          placeholder={field.placeholder}
                          disabled={field.disabled}
                          required={field.required}
                          className={FieldIcon ? 'pl-10' : ''}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
