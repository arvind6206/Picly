"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Image as ImageIcon, Edit, Plus, ArrowLeft } from "lucide-react"
import { Loading } from "@/components/ui/loading"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  const [user, setUser] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchEvent()
  }, [eventId])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      router.push("/auth/login")
    }
  }

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
      } else {
        router.push("/dashboard/events")
      }
    } catch (error) {
      console.error("Failed to fetch event", error)
      router.push("/dashboard/events")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Event not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-700" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <p className="text-gray-600">{event.description || "No description"}</p>
            </div>
          </div>
          {user?.role === "ADMIN" && (
            <Button onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          )}
        </div>

        {/* Event Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Date</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Team Members</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">{event.members?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200 shadow-sm" onClick={() => router.push(`/dashboard/events/${eventId}/photos`)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
                Manage Photos
              </CardTitle>
              <CardDescription className="text-gray-600">Upload and manage event photos</CardDescription>
            </CardHeader>
          </Card>

          {user?.role === "ADMIN" && (
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200 shadow-sm" onClick={() => router.push(`/dashboard/events/${eventId}/gallery`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <ImageIcon className="h-5 w-5 text-indigo-600" />
                  Client Gallery
                </CardTitle>
                <CardDescription className="text-gray-600">Share and publish photos</CardDescription>
              </CardHeader>
            </Card>
          )}

          {user?.role === "ADMIN" && (
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors border-gray-200 shadow-sm" onClick={() => router.push(`/dashboard/events/${eventId}/members`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Manage Team
                </CardTitle>
                <CardDescription className="text-gray-600">Add or remove team members</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Team Members */}
        {user?.role === "ADMIN" && (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Team Members</CardTitle>
                  <CardDescription className="text-gray-600">People with access to this event</CardDescription>
                </div>
                <Button size="sm" onClick={() => router.push(`/dashboard/events/${eventId}/members`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {event.members && event.members.length > 0 ? (
                <div className="space-y-2">
                  {event.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No team members yet</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
