"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

type User = {
  id: number
  username: string
  role: string
}

export default function DashboardAdmin({ user }: { user: any }) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setUsers)
  }, [])

  const deleteUser = async (id: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Control Panel</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">{u.username}</p>
                <p className="text-sm text-gray-500">Role: {u.role}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Edit</Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(u.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
