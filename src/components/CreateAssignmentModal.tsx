/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react'
import { 
  validateFile, 
  formatFileSize, 
  MAX_FILES_PER_ASSIGNMENT,
  FILE_INPUT_ACCEPT
} from '@/types/file-upload'

interface CreateAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  title: string
  description: string
  dueDate: string
  maxPoints: string
  classId: string
  subjectId: string
}

export function CreateAssignmentModal({ open, onOpenChange, onSuccess }: CreateAssignmentModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: '',
    classId: '',
    subjectId: ''
  })
  
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    
    // When class changes, reload subjects for that class
    if (field === 'classId') {
      setFormData(prev => ({ ...prev, subjectId: '' }))
      fetchSubjects(value)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (!response.ok) {
        console.error('Failed to fetch classes:', response.status)
        setClasses([])
        return
      }
      const contentType = response.headers.get('content-type') || ''
      const text = await response.text()
      if (!text) {
        setClasses([])
        return
      }
      if (!contentType.includes('application/json')) {
        console.error('[CreateAssignmentModal] Non-JSON classes response. Status:', response.status, 'Content-Type:', contentType)
        setClasses([])
        return
      }
      const data = JSON.parse(text)
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchSubjects = async (classId?: string) => {
    try {
      const url = classId ? `/api/subjects?classId=${classId}` : '/api/subjects'
      const response = await fetch(url)
      if (!response.ok) {
        console.error('Failed to fetch subjects:', response.status)
        setSubjects([])
        return
      }
      const contentType = response.headers.get('content-type') || ''
      const text = await response.text()
      if (!text) {
        setSubjects([])
        return
      }
      if (!contentType.includes('application/json')) {
        console.error('[CreateAssignmentModal] Non-JSON subjects response. Status:', response.status, 'Content-Type:', contentType)
        setSubjects([])
        return
      }
      const data = JSON.parse(text)
      setSubjects(data.subjects || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  // Load classes and subjects when modal opens
  useEffect(() => {
    if (open) {
      setIsLoadingData(true)
      Promise.all([fetchClasses(), fetchSubjects()])
        .finally(() => setIsLoadingData(false))
    }
  }, [open])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (files.length + selectedFiles.length > MAX_FILES_PER_ASSIGNMENT) {
      setError(`Maximum ${MAX_FILES_PER_ASSIGNMENT} files allowed`)
      return
    }

    const validFiles: File[] = []
    const errors: string[] = []

    selectedFiles.forEach(file => {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.dueDate) {
      setError('Due date is required')
      return
    }
    if (!formData.classId) {
      setError('Please select a class')
      return
    }
    if (!formData.subjectId) {
      setError('Please select a subject')
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Upload files if any
      const fileUrls: string[] = []
      
      if (files.length > 0) {
        const formDataUpload = new FormData()
        files.forEach(file => {
          formDataUpload.append('files', file)
        })

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload files')
        }

        const uploadResult = await uploadResponse.json()
        fileUrls.push(...uploadResult.urls)
      }

      // Step 2: Create assignment
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate).toISOString(),
        maxPoints: formData.maxPoints ? parseFloat(formData.maxPoints) : null,
        classId: formData.classId,
        subjectId: formData.subjectId,
        attachments: fileUrls
      }

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create assignment')
      }

      // Success
      onOpenChange(false)
      resetForm()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      maxPoints: '',
      classId: '',
      subjectId: ''
    })
    setFiles([])
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Add assignment details and attach files for your students
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Algebra Assignment 3"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide instructions and details..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Class and Subject */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select
                value={formData.classId}
                onValueChange={(value) => handleInputChange('classId', value)}
                disabled={isSubmitting || isLoadingData}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder={isLoadingData ? "Loading..." : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 && (
                    <div className="px-2 py-1 text-sm text-gray-500">No classes available</div>
                  )}
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => handleInputChange('subjectId', value)}
                disabled={isSubmitting || isLoadingData || !formData.classId}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder={isLoadingData ? "Loading..." : !formData.classId ? "Select class first" : "Select subject"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 && (
                    <div className="px-2 py-1 text-sm text-gray-500">No subjects available</div>
                  )}
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Max Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPoints">Max Points</Label>
              <Input
                id="maxPoints"
                type="number"
                min="0"
                step="0.5"
                value={formData.maxPoints}
                onChange={(e) => handleInputChange('maxPoints', e.target.value)}
                placeholder="e.g., 100"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                multiple
                accept={FILE_INPUT_ACCEPT}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting || files.length >= MAX_FILES_PER_ASSIGNMENT}
                aria-label="Upload assignment attachments"
              />
              
              <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supported: PDF, DOCX, XLSX, PPTX, Images, ZIP (Max {MAX_FILES_PER_ASSIGNMENT} files, 10MB each)
              </p>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || files.length >= MAX_FILES_PER_ASSIGNMENT}
              >
                Select Files
              </Button>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
