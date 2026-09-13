"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toast } from "@/components/ui/toast"
import { Loading } from "@/components/ui/loading"

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchUser()
    fetchEvent()
  }, [eventId])

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data.user)

      // Check if user is ADMIN
      if (response.data.user.role !== "ADMIN") {
        setToast({ message: "Only admins can edit events", type: "error" })
        setTimeout(() => router.push(`/dashboard/events/${eventId}`), 2000)
      }
    } catch (error) {
      router.push("/auth/login")
    }
  }

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}`)
      const event = response.data.event
      setName(event.name)
      setDescription(event.description || "")
      setEventDate(event.eventDate || "")
    } catch (error) {
      console.error("Failed to fetch event", error)
      router.push("/dashboard/events")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Double-check role before submission
    if (user?.role !== "ADMIN") {
      setToast({ message: "Only admins can edit events", type: "error" })
      return
    }

    setLoading(true)

    try {
      const response = await axios.patch(`/api/events/${eventId}`, { name, description, eventDate })
      setToast({ message: "Event updated successfully!", type: "success" })
      setTimeout(() => router.push(`/dashboard/events/${eventId}`), 1000)
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || "Failed to update event", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    )
  }

  if (user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">Only admins can edit events.</p>
              <Button onClick={() => router.push(`/dashboard/events/${eventId}`)}>
                Back to Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600">Update event information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Update the information for this event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Birthday Party, Wedding, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Describe your event"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Event"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
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
