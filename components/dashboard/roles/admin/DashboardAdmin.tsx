"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, BarChart3, Settings } from "lucide-react"
import Link from "next/link"

type Stats = {
  users: number
  admins: number
  teachers: number
  students: number
  courses: number
  activities: number
  topClass?: { name: string; activities: number } // added for activities
}

export default function DashboardAdmin({ user }: { user: any }) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load stats:", err))
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName || "Admin"} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here’s an overview of your learning management system.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Users
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-bold">{stats ? stats.users : "..."}</p>
            <p className="text-sm text-gray-500">
              {stats
                ? `Admins: ${stats.admins}, Teachers: ${stats.teachers}, Students: ${stats.students}`
                : "Loading..."}
            </p>
            <Link href="/dashboard/users">
              <Button className="mt-2 w-full" variant="outline">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-bold">{stats ? stats.courses : "..."}</p>
            <p className="text-sm text-gray-500">Active courses</p>
            <Link href="/dashboard/classes">
              <Button className="mt-2 w-full" variant="outline">
                Manager Classes
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Activities */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-bold">{stats?.activities ?? 0}</p>
            <p className="text-sm text-gray-500">Total quizzes & assignments</p>

            <p className="text-sm text-gray-500">
              Class with highest activities:{" "}
              <strong>{stats?.topClass?.name ?? "N/A"}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Number of activities in that class:{" "}
              <strong>{stats?.topClass?.activities ?? 0}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Average activities per class:{" "}
              <strong>
                {stats?.courses ? Math.round((stats.activities ?? 0) / stats.courses) : 0}
              </strong>
            </p>
          </CardContent>
        </Card>

      </div>

      {/* System Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> System Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Link href="/dashboard/users">
            <Button variant="secondary">User Management</Button>
          </Link>
          <Link href="/dashboard/classes">
            <Button variant="secondary">Class Management</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
