'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { CreateFormData } from '@/app/create/page'
import Image from 'next/image'

interface UploadStepProps {
  formData: CreateFormData
  updateFormData: (updates: Partial<CreateFormData>) => void
  onNext: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export function UploadStep({ formData, updateFormData, onNext }: UploadStepProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({ title: 'Invalid file type', description: 'Please upload a JPG or PNG image.', variant: 'destructive' })
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: 'File too large', description: 'Maximum size is 10MB.', variant: 'destructive' })
        return
      }

      setIsUploading(true)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        updateFormData({
          file,
          filePreview: reader.result as string,
        })
        setIsUploading(false)
      }
      reader.onerror = () => {
        toast({ title: 'Error reading file', description: 'Please try again.', variant: 'destructive' })
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    },
    [updateFormData]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  const removeFile = () => {
    updateFormData({
      file: null,
      filePreview: null,
    })
  }

  const handleContinue = () => {
    if (!formData.file) {
      toast({ title: 'Please upload an image first', variant: 'destructive' })
      return
    }
    onNext()
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Upload Your Pet Photo
        </h2>
        <p className="text-muted-foreground mb-6">
          Choose a clear, well-lit photo of your pet. JPG or PNG, max 10MB.
        </p>

        {!formData.filePreview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {isUploading ? (
                <div className="animate-pulse">
                  <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Processing...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    {isDragActive
                      ? 'Drop your image here'
                      : 'Drag and drop your pet photo'}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    or click to browse
                  </p>
                  <Button type="button" variant="outline" className="bg-transparent">
                    Select Image
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-secondary">
              <Image
                src={formData.filePreview || "/placeholder.svg"}
                alt="Pet preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
            <p className="text-center text-muted-foreground text-sm mt-4">
              {formData.file?.name}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!formData.file}
            size="lg"
          >
            Continue to Style Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
