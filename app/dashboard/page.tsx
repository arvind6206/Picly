"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
      // Fetch user info
      const userResponse = await fetch("/api/auth/me")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      // Fetch events
      const eventsResponse = await fetch("/api/events")
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events || [])
      }

      // Fetch team members (only for admins)
      if (user?.role === "ADMIN") {
        const teamResponse = await fetch("/api/users/team-members")
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamMembers(teamData.users || [])
        }
      }

      // Calculate total photos from events
      const eventsResponse2 = await fetch("/api/events")
      if (eventsResponse2.ok) {
        const eventsData2 = await eventsResponse2.json()
        const allEvents = eventsData2.events || []
        let photoCount = 0
        for (const event of allEvents) {
          const photosResponse = await fetch(`/api/events/${event.id}/photos`)
          if (photosResponse.ok) {
            const photosData = await photosResponse.json()
            photoCount += (photosData.photos || []).length
          }
        }
        setTotalPhotos(photoCount)
      }
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
      color: "bg-indigo-500",
    },
    {
      title: "Team Members",
      value: teamMembers.length,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Total Photos",
      value: totalPhotos,
      icon: Image,
      color: "bg-purple-500",
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
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Events */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Events</CardTitle>
            <CardDescription className="text-gray-600">Your latest photo events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loading />
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  {user?.role === "ADMIN" ? "No events yet" : "No events assigned to you yet"}
                </p>
                {user?.role === "ADMIN" && (
                  <Button onClick={() => router.push("/dashboard/events/new")}>
                    Create your first event
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-500">
                        {event.description || "No description"}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "No date"}
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
