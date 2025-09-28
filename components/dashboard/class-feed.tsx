"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Beaker, Calendar } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  role: "admin" | "teacher" | "student"
  firstName?: string
  middleName?: string
  lastName?: string
  [key: string]: any
}

interface Course {
  id: number
  courseName: string
  description: string
  teacher?: { id: number; firstName: string; lastName: string }
  students?: { id: number; firstName: string; lastName: string }[]
}

export function ClassFeed() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

  // Fetch user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/users/me`, { credentials: "include" })
        if (!res.ok) return setUser(null)
        const data: User = await res.json()
        data.role = data.role.toLowerCase() as User["role"]
        setUser(data)
      } catch {
        setUser(null)
      }
    }
    fetchUser()
  }, [API_BASE])

  // Fetch courses
  useEffect(() => {
    if (!user || !user.id) return

    async function fetchCourses() {
      try {
        if (!user) return;
        const res = await fetch(`${API_BASE}/students/${user.id}/courses`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch courses")
        const courseList: Course[] = await res.json()
        setCourses(courseList)
      } catch {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user?.id, API_BASE])

  // Filter + sort
  const filteredCourses = courses
    .filter((course) =>
      !searchQuery ||
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (sortBy === "newest" ? b.id - a.id : a.id - b.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Class Feed
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          All your enrolled courses in one place
        </p>
        {user && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Logged in as: <strong>{user.username}</strong> ({user.role})
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && <p className="text-center text-gray-500">Loading courses...</p>}

      {/* Course Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition cursor-pointer">
              <CardHeader className="pb-3">
                <p className="text-sm font-medium">
                  {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "Unknown Teacher"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Teacher</p>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {course.courseName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="secondary">
                    <Beaker className="h-3 w-3 mr-1" />
                    Course
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    ID {course.id}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {!loading && filteredCourses.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No courses found
          </p>
        )}
      </div>
    </div>
  )
}
