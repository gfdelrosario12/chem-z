"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const pathNameMap: Record<string, string> = {
  dashboard: "Home",
  feed: "Class Feed",
  activities: "Activities",
  quizzes: "Quizzes",
  materials: "Reading Materials",
  grades: "Grades",
  profile: "Profile",
  classes: "Classes",
  students: "Students",
  users: "User Management",
  settings: "Settings",
  reports: "Reports",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length <=  // Role-specific fields
 1) {
    return null
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/")
    const name = pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === pathSegments.length - 1

    return {
      name,
      href,
      isLast,
    }
  })

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {breadcrumbs.slice(1).map((breadcrumb) => (
          <li key={breadcrumb.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            {breadcrumb.isLast ? (
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{breadcrumb.name}</span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
