"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BookOpen, ClipboardList, FileText, TrendingUp, Calendar, Award } from "lucide-react"

type Announcement = {
  id: number
  title: string
  content: string
  date: string
  priority: "high" | "medium" | "low"
}

type Activity = {
  id: number
  title: string
  dueDate: string
  type: string
}

type Stat = {
  label: string
  value: string
  icon: any
  color: string
}

export function DashboardStudent({ user }: { user: any }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    // Replace with your backend endpoints
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${user.id}/announcements`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setAnnouncements)

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${user.id}/activities`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setActivities)

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${user.id}/stats`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setStats)
  }, [user.id])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return ""
    }
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "lab":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "quiz":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "assignment":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user.username}!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here&apos;s what&apos;s happening in your chemistry courses today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Recent Announcements
            </CardTitle>
            <CardDescription>Stay updated with the latest news</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="border-b pb-4 last:pb-0 last:border-none">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{a.title}</h4>
                    <p className="text-sm">{a.content}</p>
                    <p className="text-xs text-gray-500">{new Date(a.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={getPriorityColor(a.priority)}>{a.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Upcoming Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">{act.title}</h4>
                  <p className="text-xs text-gray-500">Due: {new Date(act.dueDate).toLocaleDateString()}</p>
                </div>
                <Badge className={getActivityTypeColor(act.type)}>{act.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
