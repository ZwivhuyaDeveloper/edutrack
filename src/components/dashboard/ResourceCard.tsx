import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Video, Link as LinkIcon, Image, File, Download, ExternalLink, Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'

type ResourceType = 'DOCUMENT' | 'VIDEO' | 'LINK' | 'PRESENTATION' | 'SPREADSHEET' | 'IMAGE' | 'OTHER'

interface ResourceCardProps {
  id: string
  title: string
  description?: string
  type: ResourceType
  url: string
  fileSize?: number
  tags?: string[]
  author?: {
    name: string
    avatar?: string
  }
  uploadedAt?: Date | string
  className?: string
}

const resourceConfig = {
  DOCUMENT: {
    icon: FileText,
    color: 'bg-blue-100 text-blue-600',
    label: 'Document'
  },
  VIDEO: {
    icon: Video,
    color: 'bg-purple-100 text-purple-600',
    label: 'Video'
  },
  LINK: {
    icon: LinkIcon,
    color: 'bg-green-100 text-green-600',
    label: 'Link'
  },
  PRESENTATION: {
    icon: Presentation,
    color: 'bg-orange-100 text-orange-600',
    label: 'Presentation'
  },
  SPREADSHEET: {
    icon: FileText,
    color: 'bg-emerald-100 text-emerald-600',
    label: 'Spreadsheet'
  },
  IMAGE: {
    icon: Image,
    color: 'bg-pink-100 text-pink-600',
    label: 'Image'
  },
  OTHER: {
    icon: File,
    color: 'bg-gray-100 text-gray-600',
    label: 'File'
  }
}

export function ResourceCard({
  id,
  title,
  description,
  type,
  url,
  fileSize,
  tags = [],
  author,
  uploadedAt,
  className
}: ResourceCardProps) {
  const config = resourceConfig[type]
  const Icon = config.icon

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{title}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="secondary" className="text-xs">
                {config.label}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {description && (
          <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          {author && <span>{author.name}</span>}
          {fileSize && <span>{formatFileSize(fileSize)}</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1" size="sm">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </a>
          </Button>
          {type !== 'LINK' && (
            <Button asChild variant="outline" size="sm">
              <a href={url} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
