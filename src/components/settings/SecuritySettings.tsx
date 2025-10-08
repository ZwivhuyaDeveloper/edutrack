import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Shield } from 'lucide-react'

interface SecuritySettingsProps {
  accountStatus?: 'active' | 'inactive' | 'suspended'
  showClerkMessage?: boolean
}

export function SecuritySettings({
  accountStatus = 'active',
  showClerkMessage = true
}: SecuritySettingsProps) {
  const statusConfig = {
    active: { variant: 'default' as const, label: 'Active', message: 'Your account is active and in good standing' },
    inactive: { variant: 'secondary' as const, label: 'Inactive', message: 'Your account is currently inactive' },
    suspended: { variant: 'destructive' as const, label: 'Suspended', message: 'Your account has been suspended' }
  }

  const config = statusConfig[accountStatus]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Settings
        </CardTitle>
        <CardDescription>Manage your account security</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showClerkMessage && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Password and authentication settings are managed through your school&apos;s authentication system.
              Please contact your school administrator for password resets or security concerns.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Account Status</Label>
          <div className="flex items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            <span className="text-sm text-gray-600">{config.message}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
