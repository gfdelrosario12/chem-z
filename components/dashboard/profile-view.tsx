"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Award,
  Edit,
  Save,
  X,
  GraduationCap,
  Beaker,
  FileText,
  BarChart3,
} from "lucide-react"

// Mock user data - in real app this would come from auth context
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "student" as "student" | "teacher" | "admin",
  avatar: "/diverse-user-avatars.png",
  phone: "+1 (555) 123-4567",
  address: "123 University Ave, College Town, ST 12345",
  studentId: "STU001",
  enrollmentDate: "2023-09-01",
  major: "Chemistry",
  year: "Junior",
  gpa: 3.7,
  credits: 89,
  totalCredits: 120,
}

const mockEnrolledClasses = [
  {
    id: "1",
    name: "Organic Chemistry II",
    code: "CHEM 302",
    instructor: "Dr. Sarah Johnson",
    schedule: "MWF 10:00-11:00 AM",
    progress: 75,
    grade: "A-",
  },
  {
    id: "2",
    name: "Physical Chemistry",
    code: "CHEM 341",
    instructor: "Prof. Michael Chen",
    schedule: "TTh 2:00-3:30 PM",
    progress: 60,
    grade: "B+",
  },
  {
    id: "3",
    name: "Analytical Chemistry Lab",
    code: "CHEM 315L",
    instructor: "Dr. Emily Watson",
    schedule: "W 1:00-5:00 PM",
    progress: 85,
    grade: "A",
  },
]

const mockTeacherClasses = [
  {
    id: "1",
    name: "General Chemistry I",
    code: "CHEM 101",
    students: 45,
    schedule: "MWF 9:00-10:00 AM",
    semester: "Spring 2024",
  },
  {
    id: "2",
    name: "Organic Chemistry II",
    code: "CHEM 302",
    students: 32,
    schedule: "MWF 10:00-11:00 AM",
    semester: "Spring 2024",
  },
]

const mockStudentList = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    studentId: "STU101",
    grade: "A",
    attendance: 95,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.s@example.com",
    studentId: "STU102",
    grade: "B+",
    attendance: 88,
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.d@example.com",
    studentId: "STU103",
    grade: "A-",
    attendance: 92,
  },
]

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    address: mockUser.address,
  })

  const handleSave = () => {
    // In real app, save to backend
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      address: mockUser.address,
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
              <AvatarFallback className="text-lg">
                {mockUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{mockUser.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {mockUser.major} • {mockUser.year} • Student ID: {mockUser.studentId}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span>GPA: {mockUser.gpa}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>
                    Credits: {mockUser.credits}/{mockUser.totalCredits}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Enrolled: {new Date(mockUser.enrollmentDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>Dean's List (2 semesters)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="classes">Enrolled Classes</TabsTrigger>
          <TabsTrigger value="progress">Academic Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="bg-transparent">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{mockUser.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{mockUser.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{mockUser.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{mockUser.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEnrolledClasses.map((classItem) => (
                  <div key={classItem.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{classItem.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {classItem.code} • {classItem.instructor}
                        </p>
                        <p className="text-sm text-gray-500">{classItem.schedule}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {classItem.grade}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Course Progress</span>
                        <span>{classItem.progress}%</span>
                      </div>
                      <Progress value={classItem.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Credit Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {mockUser.credits}/{mockUser.totalCredits}
                    </div>
                    <p className="text-sm text-gray-500">Credits Completed</p>
                  </div>
                  <Progress value={(mockUser.credits / mockUser.totalCredits) * 100} className="h-3" />
                  <p className="text-sm text-center text-gray-600">
                    {mockUser.totalCredits - mockUser.credits} credits remaining
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GPA Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{mockUser.gpa}</div>
                    <p className="text-sm text-gray-500">Current GPA</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fall 2023</span>
                      <span>3.6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spring 2024</span>
                      <span>3.7</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const TeacherProfile = () => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
              <AvatarFallback className="text-lg">
                {mockUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{mockUser.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Chemistry Department • Associate Professor</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>Teaching: 5 years</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Students: 77</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>Excellence Award 2023</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span>Rating: 4.8/5.0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeacherClasses.map((classItem) => (
                  <div key={classItem.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{classItem.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {classItem.code} • {classItem.schedule}
                        </p>
                        <p className="text-sm text-gray-500">{classItem.semester}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{classItem.students} students</Badge>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Users className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <FileText className="h-4 w-4 mr-1" />
                            Materials
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Current Grade</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudentList.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {student.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.attendance}%</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Material Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold">Assignments</h4>
                    <p className="text-2xl font-bold text-blue-600">12</p>
                    <Button size="sm" className="mt-2">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Beaker className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">Lab Materials</h4>
                    <p className="text-2xl font-bold text-green-600">8</p>
                    <Button size="sm" className="mt-2">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold">Reading Materials</h4>
                    <p className="text-2xl font-bold text-purple-600">15</p>
                    <Button size="sm" className="mt-2">
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function ProfileView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
      </div>

      {mockUser.role === "student" ? <StudentProfile /> : <TeacherProfile />}
    </div>
  )
}
