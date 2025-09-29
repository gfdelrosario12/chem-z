"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

interface User {
  id?: number
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  [key: string]: any
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
  const [user, setUser] = useState<User>({
    firstName: "Guest",
    role: "student",
    email: "",
  })
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [fullProfile, setFullProfile] = useState<User | null>(null)

  // Fetch user info from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/me`, { credentials: "include" })
        if (res.ok) {
          const data: User = await res.json()
          data.role = data.role?.toLowerCase() || "student"
          setUser(data)
        } else {
          console.warn("Failed to fetch user, using default Guest")
        }
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }
    fetchUser()
  }, [API_BASE])

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/logout`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        router.push("/login")
      } else console.error("Logout failed")
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/me`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setFullProfile(data)
        setProfileModalOpen(true)
      } else console.error("Failed to fetch profile")
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }

  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Guest"

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:px-8">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex flex-1 justify-end gap-x-4 lg:gap-x-6 items-center">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer">
                <span className="text-white font-bold text-sm">{(user.firstName?.[0] || "G") + (user.lastName?.[0] || "")}</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
                  <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={fetchProfile}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSupportModalOpen(true)}>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && fullProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">User Profile</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {fullProfile.firstName} {fullProfile.lastName}</p>
              <p><strong>Email:</strong> {fullProfile.email}</p>
              <p><strong>Role:</strong> {fullProfile.role}</p>
              {/* More fields if needed */}
            </div>
            <Button className="mt-4 w-full" onClick={() => setProfileModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Support</h2>
            <div className="space-y-2 text-sm">
              <p>Contact our support team at:</p>
              <p>Email: support@example.com</p>
              <p>Phone: +1 234 567 890</p>
            </div>
            <Button className="mt-4 w-full" onClick={() => setSupportModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </>
  )
}
