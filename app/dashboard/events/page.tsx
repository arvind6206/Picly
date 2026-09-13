"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
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
      const response = await axios.get("/api/auth/me")
      setUser(response.data.user)
    } catch (error) {
      console.error("Failed to fetch user", error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/events")
      setEvents(response.data.events || [])
    } catch (error) {
      console.error("Failed to fetch events", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      await axios.delete(`/api/events/${eventId}`)
      setToast({ message: "Event deleted successfully", type: "success" })
      fetchEvents()
    } catch (error) {
      setToast({ message: "Failed to delete event", type: "error" })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Events</h1>
            <p className="text-gray-600">Manage your photo events</p>
          </div>
          {user?.role === "ADMIN" && (
            <Button
              onClick={() => router.push("/dashboard/events/new")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          )}
        </div>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="text-xl font-bold text-gray-900">All Events</CardTitle>
            <CardDescription className="text-gray-600">Your photo gallery events</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <Loading />
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-gray-500 mb-4">No events yet</p>
                <Button
                  onClick={() => router.push("/dashboard/events/new")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Create your first event
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-1">
                          {user?.role === "ADMIN" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {user?.role === "ADMIN" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => router.push(`/dashboard/events/${event.id}`)}
                      >
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">{event.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {event.description || "No description"}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-100">
                            <Calendar className="h-3 w-3" />
                            {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"}
                          </span>
                          <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-100">
                            <Users className="h-3 w-3" />
                            {event.members?.length || 0}
                          </span>
                        </div>
                      </div>
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
