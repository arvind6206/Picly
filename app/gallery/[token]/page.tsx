"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Image as ImageIcon, Download } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { Toast } from "@/components/ui/toast"

export default function PublicGalleryPage() {
  const params = useParams()
  const token = params.token as string

  const [pin, setPin] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Check if we already have a token in session storage
  useEffect(() => {
    const savedToken = sessionStorage.getItem(`gallery_${token}`)
    if (savedToken) {
      setIsAuthenticated(true)
      fetchPhotos(savedToken)
    }
  }, [token])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)

    try {
      const response = await axios.post(`/api/gallery/${token}/verify`, { pin })

      if (response.data.galleryToken) {
        sessionStorage.setItem(`gallery_${token}`, response.data.galleryToken)
        setIsAuthenticated(true)
        fetchPhotos(response.data.galleryToken)
      } else {
        setToast({ message: response.data.message || "Invalid PIN", type: "error" })
      }
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || "Something went wrong", type: "error" })
    } finally {
      setVerifying(false)
    }
  }

  const fetchPhotos = async (galleryToken: string) => {
    setLoadingPhotos(true)
    try {
      const response = await axios.get(`/api/gallery/${token}/photos`, {
        headers: {
          Authorization: `Bearer ${galleryToken}`,
        },
      })
      setPhotos(response.data.photos || [])
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token expired or invalid
        sessionStorage.removeItem(`gallery_${token}`)
        setIsAuthenticated(false)
        setToast({ message: "Session expired. Please enter PIN again.", type: "error" })
      } else {
        console.error("Failed to fetch photos", error)
      }
    } finally {
      setLoadingPhotos(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <Lock className="text-indigo-600 h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Private Gallery</CardTitle>
            <CardDescription>Enter the PIN provided by your photographer to view these photos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  maxLength={10}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={verifying}>
                {verifying ? "Verifying..." : "View Gallery"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Event Gallery</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            sessionStorage.removeItem(`gallery_${token}`)
            setIsAuthenticated(false)
          }}>
            <Lock className="h-4 w-4 mr-2" />
            Lock
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingPhotos ? (
          <div className="py-20"><Loading /></div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No photos yet</h3>
            <p className="text-gray-500">The photographer hasn't added any photos to this gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((gp) => (
              <div key={gp.id} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
                <img 
                  src={gp.photo.storageUrl || `https://picsum.photos/seed/${gp.photo.id}/800/600`} 
                  alt={gp.photo.filename} 
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="flex justify-between items-end">
                    <p className="text-white text-sm font-medium truncate pr-2">{gp.photo.filename}</p>
                    <a 
                      href={gp.photo.storageUrl || `https://picsum.photos/seed/${gp.photo.id}/800/600`} 
                      download={gp.photo.filename}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-colors"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
