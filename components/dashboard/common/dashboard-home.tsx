"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Import your role-specific dashboards
import DashboardAdmin from "@/components/dashboard/roles/admin/DashboardAdmin"
import DashboardTeacher from "@/components/dashboard/roles/teacher/DashboardTeacher"
import DashboardStudent from "@/components/dashboard/roles/student/DashboardStudent"

type User = {
  id: number
  username: string
  role: "admin" | "teacher" | "student"
  firstName?: string
  lastName?: string
  email?: string
  [key: string]: any // for any additional fields
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

        const data: User = await res.json()

        // Normalize role to lowercase for frontend
        data.role = data.role.toLowerCase() as "admin" | "teacher" | "student"

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
    return null // user is not logged in, already redirected
  }

  // ✅ Role-based rendering
  switch (user.role) {
    case "admin":
      return <DashboardAdmin user={user} />
    case "teacher":
      return <DashboardTeacher user={user} />
    case "student":
    default:
      return <DashboardStudent user={user} />
  }
}
