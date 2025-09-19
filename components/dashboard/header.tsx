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
import Cookies from "js-cookie"

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void
}

interface User {
  name: string
  email?: string
  role: string
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

  const [user, setUser] = useState<User>({
    name: "Guest",
    role: "student",
    email: "",
  })
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [fullProfile, setFullProfile] = useState<any>(null)

  useEffect(() => {
    const firstName = Cookies.get("firstName") || ""
    const lastName = Cookies.get("lastName") || ""
    const email = Cookies.get("email") || ""
    const role = Cookies.get("role") || "student"

    const name =
      (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName) || "Guest"

    setUser({ name, email, role })
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/logout`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        Cookies.remove("firstName")
        Cookies.remove("lastName")
        Cookies.remove("email")
        Cookies.remove("role")
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

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>

        {/* Divider for spacing */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" />

        {/* Right section */}
        <div className="flex flex-1 justify-end gap-x-4 lg:gap-x-6 items-center">
          <ModeToggle />

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer">
                <span className="text-white font-bold text-sm">Cz</span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
                  <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={fetchProfile}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSupportModalOpen(true)}>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">User Profile</h2>
            {fullProfile ? (
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {fullProfile.firstName} {fullProfile.lastName}</p>
                <p><strong>Email:</strong> {fullProfile.email}</p>
                <p><strong>Role:</strong> {fullProfile.role}</p>
                {/* Add more fields if needed */}
              </div>
            ) : (
              <p>Loading...</p>
            )}
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
