"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loading } from "@/components/ui/loading"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await axios.get("/api/auth/me")
      router.push("/dashboard")
    } catch (error) {
      router.push("/auth/login")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loading />
    </div>
  )
}
