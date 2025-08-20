"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  BookOpen,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  Beaker,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Class {
  id: string
  name: string
  code: string
  description: string
  instructor: string
  instructorId: string
  semester: string
  year: number
  schedule: string
  room: string
  capacity: number
  enrolled: number
  status: "active" | "inactive" | "archived"
  department: string
  credits: number
  type: "lecture" | "lab" | "seminar"
}

const mockClasses: Class[] = [
  {
    id: "1",
    name: "General Chemistry I",
    code: "CHEM 101",
    description:
      "Introduction to fundamental principles of chemistry including atomic structure, bonding, and stoichiometry.",
    instructor: "Dr. Sarah Johnson",
    instructorId: "2",
    semester: "Spring",
    year: 2024,
    schedule: "MWF 9:00-10:00 AM",
    room: "Science Building 201",
    capacity: 50,
    enrolled: 45,
    status: "active",
    department: "Chemistry",
    credits: 4,
    type: "lecture",
  },
  {
    id: "2",
    name: "Organic Chemistry II",
    code: "CHEM 302",
    description: "Advanced study of organic reactions, mechanisms, and synthesis strategies.",
    instructor: "Prof. Michael Chen",
    instructorId: "4",
    semester: "Spring",
    year: 2024,
    schedule: "MWF 10:00-11:00 AM",
    room: "Science Building 203",
    capacity: 35,
    enrolled: 32,
    status: "active",
    department: "Chemistry",
    credits: 3,
    type: "lecture",
  },
  {
    id: "3",
    name: "Analytical Chemistry Lab",
    code: "CHEM 315L",
    description: "Hands-on laboratory experience with analytical techniques and instrumentation.",
    instructor: "Dr. Emily Watson",
    instructorId: "7",
    semester: "Spring",
    year: 2024,
    schedule: "W 1:00-5:00 PM",
    room: "Chemistry Lab A",
    capacity: 20,
    enrolled: 18,
    status: "active",
    department: "Chemistry",
    credits: 2,
    type: "lab",
  },
  {
    id: "4",
    name: "Physical Chemistry",
    code: "CHEM 341",
    description: "Study of thermodynamics, kinetics, and quantum mechanics as applied to chemical systems.",
    instructor: "Prof. David Lee",
    instructorId: "8",
    semester: "Spring",
    year: 2024,
    schedule: "TTh 2:00-3:30 PM",
    room: "Science Building 205",
    capacity: 30,
    enrolled: 25,
    status: "active",
    department: "Chemistry",
    credits: 3,
    type: "lecture",
  },
  {
    id: "5",
    name: "Biochemistry Seminar",
    code: "CHEM 495",
    description: "Advanced topics in biochemistry with student presentations and discussions.",
    instructor: "Dr. Lisa Park",
    instructorId: "9",
    semester: "Spring",
    year: 2024,
    schedule: "F 2:00-4:00 PM",
    room: "Conference Room B",
    capacity: 15,
    enrolled: 12,
    status: "active",
    department: "Chemistry",
    credits: 2,
    type: "seminar",
  },
  {
    id: "6",
    name: "General Chemistry II",
    code: "CHEM 102",
    description: "Continuation of CHEM 101 covering equilibrium, acids and bases, and thermodynamics.",
    instructor: "Dr. Sarah Johnson",
    instructorId: "2",
    semester: "Fall",
    year: 2023,
    schedule: "MWF 9:00-10:00 AM",
    room: "Science Building 201",
    capacity: 50,
    enrolled: 48,
    status: "archived",
    department: "Chemistry",
    credits: 4,
    type: "lecture",
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "lecture":
      return <BookOpen className="h-4 w-4" />
    case "lab":
      return <Beaker className="h-4 w-4" />
    case "seminar":
      return <Users className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "lecture":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    case "lab":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "seminar":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    case "archived":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

const getEnrollmentColor = (enrolled: number, capacity: number) => {
  const percentage = (enrolled / capacity) * 100
  if (percentage >= 90) return "text-red-600"
  if (percentage >= 75) return "text-orange-600"
  return "text-green-600"
}

export function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [isAddClassOpen, setIsAddClassOpen] = useState(false)

  const filteredClasses = mockClasses
    .filter((classItem) => {
      if (statusFilter !== "all" && classItem.status !== statusFilter) return false
      if (typeFilter !== "all" && classItem.type !== typeFilter) return false
      if (semesterFilter !== "all" && `${classItem.semester} ${classItem.year}` !== semesterFilter) return false
      if (
        searchQuery &&
        !classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !classItem.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !classItem.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "code":
          return a.code.localeCompare(b.code)
        case "instructor":
          return a.instructor.localeCompare(b.instructor)
        case "enrollment":
          return b.enrolled - a.enrolled
        default:
          return 0
      }
    })

  const stats = {
    total: mockClasses.length,
    active: mockClasses.filter((c) => c.status === "active").length,
    totalEnrolled: mockClasses.reduce((sum, c) => sum + c.enrolled, 0),
    avgEnrollment: Math.round(
      mockClasses.reduce((sum, c) => sum + (c.enrolled / c.capacity) * 100, 0) / mockClasses.length,
    ),
  }

  const semesters = Array.from(new Set(mockClasses.map((c) => `${c.semester} ${c.year}`)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage courses, schedules, and enrollments</p>
        </div>
        <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input id="className" placeholder="General Chemistry I" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classCode">Class Code</Label>
                  <Input id="classCode" placeholder="CHEM 101" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Course description..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="4">Prof. Michael Chen</SelectItem>
                      <SelectItem value="7">Dr. Emily Watson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input id="credits" type="number" placeholder="3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input id="schedule" placeholder="MWF 9:00-10:00 AM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input id="room" placeholder="Science Building 201" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" placeholder="50" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Create Class</Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAddClassOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classes</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrolled</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalEnrolled}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Enrollment</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgEnrollment}%</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lecture">Lectures</SelectItem>
              <SelectItem value="lab">Labs</SelectItem>
              <SelectItem value="seminar">Seminars</SelectItem>
            </SelectContent>
          </Select>
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="code">Sort by Code</SelectItem>
            <SelectItem value="instructor">Sort by Instructor</SelectItem>
            <SelectItem value="enrollment">Sort by Enrollment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classes ({filteredClasses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{classItem.name}</p>
                      <p className="text-sm text-gray-500">
                        {classItem.code} • {classItem.credits} credits
                      </p>
                      <p className="text-sm text-gray-500">{classItem.room}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{classItem.instructor}</p>
                    <p className="text-sm text-gray-500">{classItem.department}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(classItem.type)}>
                      {getTypeIcon(classItem.type)}
                      <span className="ml-1 capitalize">{classItem.type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {classItem.schedule}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {classItem.semester} {classItem.year}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className={getEnrollmentColor(classItem.enrolled, classItem.capacity)}>
                        {classItem.enrolled}/{classItem.capacity}
                      </span>
                      <div className="text-gray-500">
                        {Math.round((classItem.enrolled / classItem.capacity) * 100)}% full
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(classItem.status)}>
                      <span className="capitalize">{classItem.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Class
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Manage Students
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Materials
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center">
        <Button variant="outline" className="bg-transparent">
          Load More Classes
        </Button>
      </div>
    </div>
  )
}
