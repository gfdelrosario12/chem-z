"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Course {
  id: string
  name: string
  teacher?: string
  averageGrade: number
}

export function GradesView() { // <-- default export
  const [studentId, setStudentId] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem("userId")
    if (!storedId) {
      setError("No student ID found. Please log in.")
      setLoading(false)
      return
    }
    setStudentId(storedId)
  }, [])

  useEffect(() => {
    if (!studentId) return

    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)

        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""
        const res = await fetch(`${API_BASE}/enrollments/${studentId}/averages`)

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText} - ${text}`)
        }

        const data: Course[] = await res.json()
        setCourses(data)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [studentId])

  if (loading) return <p>Loading courses...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {course.name}
                <Badge
                  className={`${
                    course.averageGrade >= 90
                      ? "bg-green-100 text-green-800"
                      : course.averageGrade >= 80
                      ? "bg-blue-100 text-blue-800"
                      : course.averageGrade >= 70
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.averageGrade.toFixed(1)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.teacher && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instructor: {course.teacher}
                </p>
              )}
              <div className="mt-2">
                <Progress value={course.averageGrade} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
