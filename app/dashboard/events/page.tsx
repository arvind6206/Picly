"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, Trash2, Edit, Image as ImageIcon } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { Toast } from "@/components/ui/toast"

export default function EventsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchUser()
    fetchEvents()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user", error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Failed to fetch events", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setToast({ message: "Event deleted successfully", type: "success" })
        fetchEvents()
      } else {
        setToast({ message: "Failed to delete event", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Manage your photo events</p>
          </div>
          {user?.role === "ADMIN" && (
            <Button onClick={() => router.push("/dashboard/events/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          )}
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">All Events</CardTitle>
            <CardDescription className="text-gray-600">Your photo gallery events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loading />
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No events yet</p>
                <Button onClick={() => router.push("/dashboard/events/new")}>
                  Create your first event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => router.push(`/dashboard/events/${event.id}`)}>
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">
                        {event.description || "No description"}
                      </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            {event.members?.length || 0} members
                          </span>
                          {event._count?.photos != null && (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="h-4 w-4 text-gray-500" />
                              {event._count.photos} photos
                            </span>
                          )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user?.role === "ADMIN" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-700"
                          onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {user?.role === "ADMIN" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-700 hover:text-red-600"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
