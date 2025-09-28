"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, BookOpen, Activity } from "lucide-react"

type Announcement = { id: number; title: string; content: string; date: string; priority: "high" | "medium" | "low" }
type Activity = { id: number; title: string; dueDate: string; type: string }
type Course = { id: number; courseName: string; activities: Activity[] }
type Stat = { label: string; value: string; icon: any; color: string }

export default function DashboardStudent({ user }: { user: any }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    if (!user?.id) return

    // Fetch recent announcements
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${user.id}/announcements`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))

    // Fetch enrolled courses (with activities)
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${user.id}/courses`, { credentials: "include" })
      .then(res => res.json())
      .then((courses: Course[]) => {
        const totalCourses = courses.length

        // Most active course
        let maxActivities = 0
        let mostActiveCourseName = ""
        courses.forEach(c => {
          const count = c.activities?.length || 0
          if (count > maxActivities) {
            maxActivities = count
            mostActiveCourseName = c.courseName
          }
        })

        setStats([
          { label: "Total Enrolled Courses", value: totalCourses.toString(), icon: BookOpen, color: "text-blue-500" },
          { label: "Most Active Course", value: maxActivities > 0 ? `${maxActivities} in ${mostActiveCourseName}` : "0", icon: Activity, color: "text-purple-500" },
        ])

        // Flatten all activities for upcoming list
        const allActivities = courses.flatMap(c => c.activities ?? [])
        setActivities(allActivities)
      })
      .catch(() => setStats([]))
  }, [user?.id])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default: return ""
    }
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "lab": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "quiz": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "assignment": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user.username}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Here&apos;s what&apos;s happening in your courses today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Recent Announcements</CardTitle>
            <CardDescription>Stay updated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.length ? announcements.map(a => (
              <div key={a.id} className="border-b pb-4 last:pb-0 last:border-none flex justify-between">
                <div>
                  <h4 className="font-medium">{a.title}</h4>
                  <p className="text-sm">{a.content}</p>
                  <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <Badge className={getPriorityColor(a.priority)}>{a.priority}</Badge>
              </div>
            )) : <p className="text-gray-500 dark:text-gray-400">No announcements available.</p>}
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Upcoming Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length ? activities.map(act => (
              <div key={act.id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">{act.title}</h4>
                  <p className="text-xs text-gray-500">Due: {new Date(act.dueDate).toLocaleDateString()}</p>
                </div>
                <Badge className={getActivityTypeColor(act.type)}>{act.type}</Badge>
              </div>
            )) : <p className="text-gray-500 dark:text-gray-400">No upcoming activities.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
