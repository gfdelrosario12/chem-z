"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookOpen, Users } from "lucide-react"

type ClassStats = {
  totalClasses: number
  totalStudents: number
}

export default function DashboardTeacher({ user }: { user: any }) {
  const [stats, setStats] = useState<ClassStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all courses for this teacher
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers/${user.id}/courses`,
          { credentials: "include" }
        )
        if (!res.ok) {
          console.error("Failed to fetch teacher courses:", res.status, res.statusText)
          return
        }
        const courses = await res.json() as { id: number; courseName: string }[]
        const totalClasses = courses.length

        // Fetch all students for each course
        let totalStudents = 0
        for (const course of courses) {
          const studentsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${course.id}/students`,
            { credentials: "include" }
          )
          if (!studentsRes.ok) continue
          const students = await studentsRes.json() as any[]
          totalStudents += students.length
        }

        setStats({ totalClasses, totalStudents })
      } catch (err) {
        console.error("Error fetching stats:", err)
      }
    }

    fetchStats()
  }, [user.id])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> My Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.totalClasses ?? "..."}</p>
          <p className="text-sm text-gray-500">Total classes assigned</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Students Enrolled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.totalStudents ?? "..."}</p>
          <p className="text-sm text-gray-500">Total students in your classes</p>
        </CardContent>
      </Card>
    </div>
  )
}