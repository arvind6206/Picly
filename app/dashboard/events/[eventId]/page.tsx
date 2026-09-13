"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
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
  const [photoCount, setPhotoCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchEvent()
    fetchPhotoCount()
  }, [eventId])

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data.user)
    } catch (error) {
      router.push("/auth/login")
    }
  }

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}`)
      setEvent(response.data.event)
    } catch (error) {
      console.error("Failed to fetch event", error)
      router.push("/dashboard/events")
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotoCount = async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}/photos`)
      setPhotoCount(response.data.photos?.length || 0)
    } catch (error) {
      console.error("Failed to fetch photo count", error)
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
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"}
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <CardTitle className="text-base font-semibold text-gray-800">Event Date</CardTitle>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{event.members?.length || 0}</div>
              </div>
            </div>
            <CardContent className="p-4">
              <CardTitle className="text-base font-semibold text-gray-800">Team Members</CardTitle>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{photoCount}</div>
              </div>
            </div>
            <CardContent className="p-4">
              <CardTitle className="text-base font-semibold text-gray-800">Photos</CardTitle>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg group overflow-hidden" onClick={() => router.push(`/dashboard/events/${eventId}/photos`)}>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 group-hover:from-indigo-600 group-hover:to-indigo-700 transition-colors">
              <ImageIcon className="h-8 w-8 text-white mb-2" />
              <CardTitle className="text-white text-lg">Manage Photos</CardTitle>
              <CardDescription className="text-indigo-100">Upload and manage event photos</CardDescription>
            </div>
          </Card>

          {user?.role === "ADMIN" && (
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg group overflow-hidden" onClick={() => router.push(`/dashboard/events/${eventId}/gallery`)}>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 group-hover:from-purple-600 group-hover:to-purple-700 transition-colors">
                <ImageIcon className="h-8 w-8 text-white mb-2" />
                <CardTitle className="text-white text-lg">Client Gallery</CardTitle>
                <CardDescription className="text-purple-100">Share and publish photos</CardDescription>
              </div>
            </Card>
          )}

          {user?.role === "ADMIN" && (
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg group overflow-hidden" onClick={() => router.push(`/dashboard/events/${eventId}/members`)}>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 group-hover:from-emerald-600 group-hover:to-emerald-700 transition-colors">
                <Users className="h-8 w-8 text-white mb-2" />
                <CardTitle className="text-white text-lg">Manage Team</CardTitle>
                <CardDescription className="text-emerald-100">Add or remove team members</CardDescription>
              </div>
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
