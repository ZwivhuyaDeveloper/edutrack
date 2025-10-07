// File upload types and constants

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
}

export interface FileUploadProgress {
  fileId: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

// Allowed file formats for assignments
export const ALLOWED_ASSIGNMENT_FORMATS = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES_PER_ASSIGNMENT = 5

// Get all allowed extensions as a flat array
export const ALLOWED_EXTENSIONS = Object.values(ALLOWED_ASSIGNMENT_FORMATS).flat()

// Get accept string for file input
export const FILE_INPUT_ACCEPT = Object.keys(ALLOWED_ASSIGNMENT_FORMATS).join(',')

// Validate file type
export function isValidFileType(file: File): boolean {
  return Object.keys(ALLOWED_ASSIGNMENT_FORMATS).includes(file.type)
}

// Validate file size
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

// Validate file
export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File): FileValidationResult {
  if (!isValidFileType(file)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
    }
  }
  
  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`
    }
  }
  
  return { valid: true }
}
