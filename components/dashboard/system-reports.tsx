"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, TrendingUp, Download, GraduationCap, Award, FileText } from "lucide-react"

const systemStats = {
  totalUsers: 1247,
  activeUsers: 1089,
  totalClasses: 23,
  totalEnrollments: 2156,
  avgGrade: 3.4,
  systemUptime: 99.8,
}

const userActivityData = [
  { period: "Last 7 days", logins: 856, newUsers: 12, activeUsers: 743 },
  { period: "Last 30 days", logins: 3421, newUsers: 45, activeUsers: 1089 },
  { period: "Last 90 days", logins: 9876, newUsers: 134, activeUsers: 1156 },
]

const classPerformanceData = [
  { className: "General Chemistry I", students: 45, avgGrade: 3.6, completion: 92 },
  { className: "Organic Chemistry II", students: 32, avgGrade: 3.4, completion: 88 },
  { className: "Physical Chemistry", students: 25, avgGrade: 3.2, completion: 85 },
  { className: "Analytical Chemistry Lab", students: 18, avgGrade: 3.8, completion: 95 },
]

const systemHealthData = [
  { metric: "Server CPU Usage", value: 45, status: "good" },
  { metric: "Memory Usage", value: 67, status: "warning" },
  { metric: "Database Performance", value: 89, status: "good" },
  { metric: "Storage Usage", value: 34, status: "good" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "good":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

export function SystemReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor system performance and user analytics</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.activeUsers.toLocaleString()}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold text-purple-600">{systemStats.totalClasses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrollments</p>
                <p className="text-2xl font-bold text-orange-600">{systemStats.totalEnrollments.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg GPA</p>
                <p className="text-2xl font-bold text-blue-600">{systemStats.avgGrade}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.systemUptime}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="classes">Class Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Logins</TableHead>
                      <TableHead>New Users</TableHead>
                      <TableHead>Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivityData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{data.period}</TableCell>
                        <TableCell>{data.logins.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            +{data.newUsers}
                          </Badge>
                        </TableCell>
                        <TableCell>{data.activeUsers.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  {/* Placeholder for chart */}
                  <span>User growth chart coming soon...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Class Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Avg Grade</TableHead>
                    <TableHead>Completion (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classPerformanceData.map((data, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{data.className}</TableCell>
                      <TableCell>{data.students}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {data.avgGrade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {data.completion}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemHealthData.map((data, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{data.metric}</TableCell>
                      <TableCell>{data.value}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(data.status)}`}>
                          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}