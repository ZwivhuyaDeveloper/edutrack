"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationOption {
  id: string
  label: string
  description: string
  enabled: boolean
}

interface NotificationSettingsProps {
  options: NotificationOption[]
  onUpdate: (settings: Record<string, boolean>) => Promise<void>
}

export function NotificationSettings({
  options: initialOptions,
  onUpdate
}: NotificationSettingsProps) {
  const [options, setOptions] = useState(initialOptions)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = (id: string, checked: boolean) => {
    setOptions(prev => prev.map(opt => 
      opt.id === id ? { ...opt, enabled: checked } : opt
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const settings = options.reduce((acc, opt) => ({
        ...acc,
        [opt.id]: opt.enabled
      }), {})

      await onUpdate(settings)
      toast.success('Notification settings updated successfully')
    } catch (error) {
      toast.error('Failed to update notification settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Preferences
        </CardTitle>
        <CardDescription>Choose what notifications you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={option.id}>{option.label}</Label>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <Switch
                id={option.id}
                checked={option.enabled}
                onCheckedChange={(checked) => handleToggle(option.id, checked)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
