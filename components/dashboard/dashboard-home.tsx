"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, BookOpen, ClipboardList, FileText, TrendingUp, Users, Calendar, Award } from "lucide-react"

// Mock data
const mockUser = {
  role: "student" as "student" | "teacher" | "admin",
}

const announcements = [
  {
    id: 1,
    title: "New Chemistry Lab Safety Guidelines",
    content: "Please review the updated safety protocols before your next lab session.",
    date: "2024-01-15",
    priority: "high" as const,
  },
  {
    id: 2,
    title: "Midterm Exam Schedule Released",
    content: "Check your class schedule for exam dates and locations.",
    date: "2024-01-14",
    priority: "medium" as const,
  },
  {
    id: 3,
    title: "Guest Lecture: Organic Chemistry Applications",
    content: "Dr. Smith will present on real-world applications this Friday.",
    date: "2024-01-13",
    priority: "low" as const,
  },
]

const upcomingActivities = [
  { id: 1, title: "Acid-Base Titration Lab", dueDate: "2024-01-20", type: "lab" },
  { id: 2, title: "Molecular Structure Quiz", dueDate: "2024-01-18", type: "quiz" },
  { id: 3, title: "Chemical Bonding Assignment", dueDate: "2024-01-22", type: "assignment" },
]

const quickStats = {
  student: [
    { label: "Completed Activities", value: "12", icon: ClipboardList, color: "text-green-600" },
    { label: "Pending Quizzes", value: "3", icon: FileText, color: "text-orange-600" },
    { label: "Average Grade", value: "87%", icon: TrendingUp, color: "text-blue-600" },
    { label: "Course Progress", value: "68%", icon: Award, color: "text-purple-600" },
  ],
  teacher: [
    { label: "Active Classes", value: "4", icon: BookOpen, color: "text-blue-600" },
    { label: "Total Students", value: "89", icon: Users, color: "text-green-600" },
    { label: "Pending Reviews", value: "15", icon: ClipboardList, color: "text-orange-600" },
    { label: "This Week's Activities", value: "8", icon: Calendar, color: "text-purple-600" },
  ],
  admin: [
    { label: "Total Users", value: "1,247", icon: Users, color: "text-blue-600" },
    { label: "Active Classes", value: "23", icon: BookOpen, color: "text-green-600" },
    { label: "System Alerts", value: "2", icon: Bell, color: "text-red-600" },
    { label: "Monthly Growth", value: "+12%", icon: TrendingUp, color: "text-purple-600" },
  ],
}

const getPriorityColor = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
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

export function DashboardHome() {
  const stats = quickStats[mockUser.role]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, John!</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's what's happening in your chemistry courses today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
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
              <Bell className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
            <CardDescription>Stay updated with the latest news and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Announcements
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Activities
            </CardTitle>
            <CardDescription>Don't miss these important deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Due: {new Date(activity.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getActivityTypeColor(activity.type)}>{activity.type}</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent">
              View All Activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used features and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <BookOpen className="h-6 w-6" />
              <span className="text-xs">Class Feed</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <ClipboardList className="h-6 w-6" />
              <span className="text-xs">Activities</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <span className="text-xs">Quizzes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              <span className="text-xs">Grades</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
