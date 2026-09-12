"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Plus, Trash2 } from "lucide-react"
import { Loading } from "@/components/ui/loading"
import { Toast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"

export default function TeamPage() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchUser()
    fetchUsers()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)

        // Check if user is ADMIN
        if (data.user.role !== "ADMIN") {
          setToast({ message: "Only admins can manage team members", type: "error" })
          setTimeout(() => router.push("/dashboard"), 2000)
        }
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      router.push("/auth/login")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/team-members")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!name || !email || !password) return

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "TEAM_MEMBER" }),
      })

      if (response.ok) {
        setToast({ message: "Team member added successfully", type: "success" })
        setShowAddModal(false)
        setName("")
        setEmail("")
        setPassword("")
        fetchUsers()
      } else {
        const data = await response.json()
        setToast({ message: data.message || "Failed to add team member", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Something went wrong", type: "error" })
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
              <p className="text-gray-600 mb-4">Only admins can manage team members.</p>
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600">Manage your team members</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 text-indigo-600" />
              All Team Members
            </CardTitle>
            <CardDescription className="text-gray-600">People in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No team members yet</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Team Member"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleAddUser} disabled={!name || !email || !password}>
              Add Member
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

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
