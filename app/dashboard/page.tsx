"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Image, Users, Plus } from "lucide-react"
import { Loading } from "@/components/ui/loading"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch user info first
      const userResponse = await axios.get("/api/auth/me")
      setUser(userResponse.data.user)

      // Fetch team members only if user is admin
      if (userResponse.data.user.role === "ADMIN") {
        const teamResponse = await axios.get("/api/users/team-members")
        setTeamMembers(teamResponse.data.users || [])
      }

      // Fetch events
      const eventsResponse = await axios.get("/api/events")
      setEvents(eventsResponse.data.events || [])

      // Calculate total photos from events
      const allEvents = eventsResponse.data.events || []
      let photoCount = 0
      for (const event of allEvents) {
        const photosResponse = await axios.get(`/api/events/${event.id}/photos`)
        photoCount += (photosResponse.data.photos || []).length
      }
      setTotalPhotos(photoCount)
    } catch (error) {
      console.error("Failed to fetch dashboard data", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      title: "Team Members",
      value: teamMembers.length,
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Total Photos",
      value: totalPhotos,
      icon: Image,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to your photo gallery dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className={`bg-gradient-to-br ${stat.color} p-6`}>
                <div className="flex items-center justify-between">
                  <div className={`p-3 bg-white/20 rounded-xl backdrop-blur-sm`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white">{stat.value}</div>
                </div>
              </div>
              <CardContent className="p-4">
                <CardTitle className="text-base font-semibold text-gray-800">{stat.title}</CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Events */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Events</CardTitle>
                <CardDescription className="text-gray-600">Your latest photo events</CardDescription>
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
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <Loading />
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  {user?.role === "ADMIN" ? "No events yet" : "No events assigned to you yet"}
                </p>
                {user?.role === "ADMIN" && (
                  <Button
                    onClick={() => router.push("/dashboard/events/new")}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Create your first event
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{event.name}</h3>
                        <p className="text-sm text-gray-500">
                          {event.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 font-medium">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"}
                      </div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
