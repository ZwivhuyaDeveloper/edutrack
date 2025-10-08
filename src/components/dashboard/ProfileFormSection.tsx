import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormField {
  id: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'number'
  value: string | number
  placeholder?: string
  disabled?: boolean
  required?: boolean
  icon?: LucideIcon
  rows?: number
  onChange?: (value: string) => void
}

interface ProfileFormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  fields: FormField[]
  columns?: 1 | 2
  className?: string
}

export function ProfileFormSection({
  title,
  description,
  icon: Icon,
  fields,
  columns = 1,
  className
}: ProfileFormSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "grid gap-4",
          columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        )}>
          {fields.map((field) => {
            const FieldIcon = field.icon

            return (
              <div 
                key={field.id} 
                className={cn(
                  "space-y-2",
                  field.type === 'textarea' && columns === 2 ? "md:col-span-2" : ""
                )}
              >
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
                      value={field.value}
                      onChange={(e) => field.onChange?.(e.target.value)}
                      placeholder={field.placeholder}
                      disabled={field.disabled}
                      required={field.required}
                      rows={field.rows || 3}
                      className={cn(FieldIcon && "pl-10")}
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
                      value={field.value}
                      onChange={(e) => field.onChange?.(e.target.value)}
                      placeholder={field.placeholder}
                      disabled={field.disabled}
                      required={field.required}
                      className={cn(FieldIcon && "pl-10")}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
