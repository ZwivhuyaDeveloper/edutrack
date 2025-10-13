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
  onSave: (data: ProfileField[]) => Promise<void>
  onAvatarUpload?: () => void
  isSaving?: boolean
  avatarUploadElement?: React.ReactNode
  uploadingAvatar?: boolean
  avatarPreview?: string | null
}

export function ProfileSection({
  firstName,
  lastName,
  email,
  avatar,
  fields,
  onSave,
  onAvatarUpload,
  isSaving: externalIsSaving,
  avatarUploadElement,
  uploadingAvatar = false,
  avatarPreview
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
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>Update your profile details and contact information</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-start gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed">
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarImage src={avatarPreview || avatar || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                {firstName[0]}{lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-2">Profile Photo</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a professional photo that represents you. This will be visible to students, parents, and staff.
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={onAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG (max 2MB)
                </span>
              </div>
              {avatarUploadElement}
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
                          placeholder={field.placeholder || (field.value ? String(field.value) : 'Not set')}
                          disabled={field.disabled}
                          required={field.required}
                          className={FieldIcon ? 'pl-10' : ''}
                          rows={3}
                        />
                        {!field.disabled && field.value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: {String(field.value).substring(0, 50)}{String(field.value).length > 50 ? '...' : ''}
                          </p>
                        )}
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
                          placeholder={field.placeholder || (field.value ? String(field.value) : 'Not set')}
                          disabled={field.disabled}
                          required={field.required}
                          className={FieldIcon ? 'pl-10' : ''}
                        />
                        {!field.disabled && field.value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: {String(field.value)}
                          </p>
                        )}
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
