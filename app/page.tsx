import { redirect } from "next/navigation"

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * HomePage component that redirects to the login page.
 * This serves as the entry point of the application.
 */

/*******  1e1f7ad0-26dc-4357-81c3-e100ff08e954  *******/
export default function HomePage() {
  // Redirect to login page as the entry point
  redirect("/login")
}
