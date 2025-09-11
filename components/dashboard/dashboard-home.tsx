"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Import your role-specific dashboards
import DashboardAdmin from "@/components/dashboard/roles/DashboardAdmin"
import DashboardTeacher from "@/components/dashboard/roles/DashboardTeacher"
import DashboardStudent from "@/components/dashboard/roles/DashboardStudent"

type User = {
  id: number
  username: string
  role: "admin" | "teacher" | "student"
}

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`,
          { credentials: "include" }
        )

        if (!res.ok) {
          router.push("/login")
          return
        }

        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("Failed to fetch user:", err)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return <p className="text-center mt-10">Loading dashboard...</p>
  }

  if (!user) {
    return null // already redirected
  }

  // ✅ Role-based rendering
  if (user.role === "admin") {
    return <DashboardAdmin user={user} />
  }

  if (user.role === "teacher") {
    return <DashboardTeacher user={user} />
  }

  return <DashboardStudent user={user} />
}
