"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, ExternalLink, Lock, Check, Trash2 } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { Toast } from "@/components/ui/toast"

export default function GalleryManagePage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string

  const [user, setUser] = useState<any>(null)
  const [gallery, setGallery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pin, setPin] = useState("")
  const [creating, setCreating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // For selecting photos to add
  const [eventPhotos, setEventPhotos] = useState<any[]>([])
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const [addingPhotos, setAddingPhotos] = useState(false)
  const [removingPhoto, setRemovingPhoto] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
    fetchGallery()
    fetchEventPhotos()
  }, [eventId])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)

        // Check if user is ADMIN
        if (data.user.role !== "ADMIN") {
          setToast({ message: "Only admins can manage galleries", type: "error" })
          setTimeout(() => router.push(`/dashboard/events/${eventId}`), 2000)
        }
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      router.push("/auth/login")
    }
  }

  const fetchGallery = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/gallery`)
      if (response.ok) {
        const data = await response.json()
        setGallery(data.gallery)
      } else {
        setGallery(null)
      }
    } catch (error) {
      console.error("Failed to fetch gallery", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventPhotos = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/photos`)
      if (response.ok) {
        const data = await response.json()
        setEventPhotos(data.photos || [])
      }
    } catch (error) {
      console.error("Failed to fetch event photos", error)
    }
  }

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin || pin.length < 4) {
      setToast({ message: "PIN must be at least 4 characters", type: "error" })
      return
    }
    
    setCreating(true)
    try {
      const response = await fetch(`/api/events/${eventId}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        setToast({ message: "Gallery created successfully", type: "success" })
        fetchGallery()
      } else {
        const data = await response.json()
        setToast({ message: data.message || "Failed to create gallery", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!gallery) return
    setPublishing(true)
    try {
      const action = gallery.isPublished ? "unpublish" : "publish"
      const response = await fetch(`/api/events/${eventId}/gallery/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin || "1234" }), // Use existing PIN or default
      })

      if (response.ok) {
        setToast({ message: `Gallery ${action}ed successfully`, type: "success" })
        fetchGallery()
      } else {
        const data = await response.json()
        setToast({ message: data.message || "Failed to update status", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
    } finally {
      setPublishing(false)
    }
  }

  const handleAddPhotosToGallery = async () => {
    if (selectedPhotoIds.length === 0) return
    
    setAddingPhotos(true)
    try {
      const response = await fetch(`/api/events/${eventId}/gallery/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: selectedPhotoIds }),
      })

      if (response.ok) {
        setToast({ message: "Photos added to gallery", type: "success" })
        setSelectedPhotoIds([])
        fetchGallery()
      } else {
        setToast({ message: "Failed to add photos", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
    } finally {
      setAddingPhotos(false)
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    if (selectedPhotoIds.includes(photoId)) {
      setSelectedPhotoIds(selectedPhotoIds.filter(id => id !== photoId))
    } else {
      setSelectedPhotoIds([...selectedPhotoIds, photoId])
    }
  }

  const handleRemovePhotoFromGallery = async (photoId: string) => {
    setRemovingPhoto(photoId)
    try {
      const response = await fetch(`/api/events/${eventId}/gallery/photos/${photoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setToast({ message: "Photo removed from gallery", type: "success" })
        fetchGallery()
      } else {
        setToast({ message: "Failed to remove photo", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
    } finally {
      setRemovingPhoto(null)
    }
  }

  if (loading) {
    return <DashboardLayout><Loading /></DashboardLayout>
  }

  if (user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">Only admins can manage galleries.</p>
              <Button onClick={() => router.push(`/dashboard/events/${eventId}`)}>
                Back to Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const galleryPhotoIds = gallery?.photos?.map((gp: any) => gp.photoId) || []
  const availablePhotos = eventPhotos.filter(p => !galleryPhotoIds.includes(p.id))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-700" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Gallery</h1>
            <p className="text-gray-600">Manage the public gallery for this event</p>
          </div>
        </div>

        {!gallery ? (
          <Card className="max-w-md border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Create Gallery</CardTitle>
              <CardDescription className="text-gray-600">Setup a secure gallery for your clients</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGallery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-gray-700">Gallery PIN</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pin"
                      type="text"
                      className="pl-9"
                      placeholder="e.g. 1234"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      required
                      minLength={4}
                    />
                  </div>
                  <p className="text-xs text-gray-600">Clients will need this PIN to view the gallery.</p>
                </div>
                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? "Creating..." : "Create Gallery"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Gallery Status</CardTitle>
                  <CardDescription className="text-gray-600">Share and manage visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">Status</p>
                      <p className="text-sm text-gray-600">
                        {gallery.isPublished ? "Published (Visible to clients)" : "Draft (Hidden from clients)"}
                      </p>
                    </div>
                    <Button
                      variant={gallery.isPublished ? "outline" : "default"}
                      onClick={handleTogglePublish}
                      disabled={publishing}
                    >
                      {publishing ? "Updating..." : (gallery.isPublished ? "Unpublish" : "Publish")}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Client Link</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/gallery/${gallery.token}`}
                      />
                      <Button variant="outline" size="icon" onClick={() => window.open(`/gallery/${gallery.token}`, '_blank')}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Photos in Gallery</Label>
                    <p className="text-2xl font-bold text-gray-900">{gallery.photos?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Add Photos to Gallery</CardTitle>
                  <CardDescription className="text-gray-600">Select photos from the event to show in this gallery</CardDescription>
                </CardHeader>
                <CardContent>
                  {availablePhotos.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600">No new photos available to add.</p>
                      <Button variant="ghost" onClick={() => router.push(`/dashboard/events/${eventId}/photos`)}>
                        Upload more event photos
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                        {availablePhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${selectedPhotoIds.includes(photo.id) ? 'border-indigo-500' : 'border-transparent'}`}
                            onClick={() => togglePhotoSelection(photo.id)}
                          >
                            <img
                              src={photo.storageUrl || `https://picsum.photos/seed/${photo.id}/200`}
                              alt="event photo"
                              className="w-full h-20 object-cover"
                            />
                            {selectedPhotoIds.includes(photo.id) && (
                              <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                                <CheckCircle className="text-white h-6 w-6 bg-indigo-500 rounded-full" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        disabled={selectedPhotoIds.length === 0 || addingPhotos}
                        onClick={handleAddPhotosToGallery}
                      >
                        {addingPhotos ? "Adding..." : `Add ${selectedPhotoIds.length} Selected Photos`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {gallery.photos && gallery.photos.length > 0 && (
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">Photos in Gallery</CardTitle>
                  <CardDescription className="text-gray-600">Currently selected photos for this gallery - click to remove</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {gallery.photos.map((gp: any) => (
                      <div key={gp.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={gp.photo.storageUrl || `https://picsum.photos/seed/${gp.photo.id}/200`}
                          alt={gp.photo.filename}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemovePhotoFromGallery(gp.photoId)}
                            disabled={removingPhoto === gp.photoId}
                          >
                            {removingPhoto === gp.photoId ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
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
