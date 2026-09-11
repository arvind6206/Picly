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
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

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

  const stats = [
    {
      title: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "bg-indigo-500",
    },
    {
      title: "Team Members",
      value: "5",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Total Photos",
      value: "0",
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
          <Button onClick={() => router.push("/dashboard/events/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Your latest photo events</CardDescription>
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
