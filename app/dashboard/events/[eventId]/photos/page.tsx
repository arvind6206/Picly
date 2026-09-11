"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Upload, ArrowLeft, Plus } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { Toast } from "@/components/ui/toast"

export default function EventPhotosPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotos()
  }, [eventId])

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/photos`)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error("Failed to fetch photos", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setUploading(true)
    const file = e.target.files[0]
    
    // In a real app, you would upload to S3 here.
    // For this dummy implementation, we use a placeholder image or Object URL
    const dummyStorageUrl = "https://picsum.photos/seed/" + Math.random() + "/800/600"
    
    try {
      const response = await fetch(`/api/events/${eventId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          storageKey: "dummy/" + file.name,
          storageUrl: dummyStorageUrl,
          fileSize: file.size,
        }),
      })

      if (response.ok) {
        setToast({ message: "Photo uploaded successfully", type: "success" })
        fetchPhotos()
      } else {
        setToast({ message: "Failed to upload photo", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Photos</h1>
              <p className="text-gray-600">Upload and view photos for this event</p>
            </div>
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Photos</CardTitle>
            <CardDescription>{photos.length} photos uploaded</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loading />
            ) : photos.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No photos uploaded yet</p>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  Upload your first photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={photo.storageUrl || `https://picsum.photos/seed/${photo.id}/800/600`} 
                      alt={photo.filename} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-white text-sm truncate">{photo.filename}</p>
                      <p className="text-gray-300 text-xs">By: {photo.uploadedBy?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  )
}
