"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Toast } from "@/components/ui/toast"
import { Loading } from "@/components/ui/loading"

export default function NewEventPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)

        // Check if user is ADMIN
        if (data.user.role !== "ADMIN") {
          setToast({ message: "Only admins can create events", type: "error" })
          setTimeout(() => router.push("/dashboard/events"), 2000)
        }
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Double-check role before submission
    if (user?.role !== "ADMIN") {
      setToast({ message: "Only admins can create events", type: "error" })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, eventDate }),
      })

      const data = await response.json()

      if (response.ok) {
        setToast({ message: "Event created successfully!", type: "success" })
        setTimeout(() => router.push("/dashboard/events"), 1000)
      } else {
        setToast({ message: data.message || "Failed to create event", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
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
              <p className="text-gray-600 mb-4">Only admins can create events.</p>
              <Button onClick={() => router.push("/dashboard/events")}>
                Back to Events
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600">Add a new photo event to your gallery</p>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Event Details</CardTitle>
            <CardDescription className="text-gray-600">Fill in the information for your new event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Event Name *</Label>
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
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Describe your event"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-gray-700">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Event"}
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
