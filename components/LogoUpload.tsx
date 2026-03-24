'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Upload, X } from 'lucide-react'

type LogoUploadProps = {
  currentLogo?: string | null
  onUploadSuccess?: (url: string) => void
}

export default function LogoUpload({ currentLogo, onUploadSuccess }: LogoUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentLogo || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUploadSuccess?.(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="logo-upload">Company Logo</Label>
        <div className="mt-2">
          {preview ? (
            <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <img
                src={preview}
                alt="Logo preview"
                className="h-16 w-16 object-contain rounded"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Logo uploaded successfully</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload logo
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
