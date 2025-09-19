"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ClipboardList } from "lucide-react"

type Student = {
  id: number
  username: string
  className: string
}

export default function DashboardTeacher({ user }: { user: any }) {
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers/${user.id}/students`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setStudents)
  }, [user.id])

  const updateStudentClass = async (studentId: number, newClass: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${studentId}/class`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ className: newClass }),
    })

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, className: newClass } : s))
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user.username} (Teacher)</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> My Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">{student.username}</p>
                <p className="text-sm text-gray-500">Class: {student.className}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => updateStudentClass(student.id, prompt("New class name:") || student.className)}
              >
                Edit Class
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
