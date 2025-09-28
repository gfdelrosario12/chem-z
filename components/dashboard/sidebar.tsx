"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dialog, Transition } from "@headlessui/react"
import { X, Home, BookOpen, BarChart3, User, Users, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

type User = {
  id: number
  username: string
  role: "admin" | "teacher" | "student"
  firstName?: string
  lastName?: string
  avatar?: string
  [key: string]: any
}

const getNavigationItems = (role: string) => {
  switch (role) {
    case "student":
      return [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Class Feed", href: "/dashboard/feed", icon: BookOpen },
        { name: "Grades", href: "/dashboard/grades", icon: BarChart3 },
      ]
    case "teacher":
      return [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Class Feed", href: "/dashboard/feed", icon: BookOpen },
        { name: "Grades", href: "/dashboard/grades", icon: BarChart3 },
      ]
    case "admin":
      return [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "User Management", href: "/dashboard/users", icon: Users },
        { name: "Class Management", href: "/dashboard/classes", icon: GraduationCap },
      ]
    default:
      return []
  }
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
          credentials: "include",
        })

        if (!res.ok) {
          setUser(null)
          return
        }

        const data: User = await res.json()
        data.role = data.role.toLowerCase() as "admin" | "teacher" | "student"
        setUser(data)
      } catch (err) {
        console.error("Failed to fetch user:", err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const navigation = getNavigationItems(user?.role || "student")

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Cz</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Chem-Z</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-900/50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* User Info */}
          <li className="mt-auto">
            <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-medium leading-6 text-gray-900 dark:text-white">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Cz</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Guest"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || "student"}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )

  if (loading) return <div className="hidden lg:flex lg:w-72 lg:flex-col p-4">Loading...</div>

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpen(false)}
                      className="text-white hover:text-white hover:bg-white/10"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}
