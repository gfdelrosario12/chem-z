export interface User {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  avatar?: string
  studentId?: string
  employeeId?: string
  department?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  priority: "high" | "medium" | "low"
  author: string
}

export interface Activity {
  fileUrl: string | undefined
  id: string
  title: string
  description: string
  dueDate: string
  type: "lab" | "assignment" | "project"
  status: "pending" | "submitted" | "graded"
  grade?: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  dueDate: string
  duration: number // in minutes
  questions: number
  attempts: number
  maxAttempts: number
  status: "not_started" | "in_progress" | "completed"
  score?: number
}

export interface Material {
  id: string
  title: string
  description: string
  type: "pdf" | "video" | "simulation" | "link"
  url: string
  uploadDate: string
  size?: string
}

export interface Grade {
  id: string
  itemName: string
  type: "quiz" | "activity" | "project" | "exam"
  score: number
  maxScore: number
  date: string
  feedback?: string
}

// Mock data
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "student",
    studentId: "STU001",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "teacher",
    employeeId: "EMP001",
    department: "Chemistry Department",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    employeeId: "ADM001",
  },
]

export const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "New Chemistry Lab Safety Guidelines",
    content:
      "Please review the updated safety protocols before your next lab session. The new guidelines include mandatory safety equipment checks and updated emergency procedures.",
    date: "2024-01-15",
    priority: "high",
    author: "Dr. Johnson",
  },
  {
    id: "2",
    title: "Midterm Exam Schedule Released",
    content:
      "Check your class schedule for exam dates and locations. Make sure to arrive 15 minutes early and bring your student ID.",
    date: "2024-01-14",
    priority: "medium",
    author: "Academic Office",
  },
]

export const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "Molecular Structure Quiz",
    description: "Test your knowledge of molecular geometry and VSEPR theory.",
    dueDate: "2024-01-18",
    duration: 30,
    questions: 15,
    attempts: 1,
    maxAttempts: 2,
    status: "completed",
    score: 87,
  },
]

export const mockMaterials: Material[] = [
  {
    id: "1",
    title: "Introduction to Organic Chemistry",
    description: "Comprehensive guide to organic chemistry fundamentals.",
    type: "pdf",
    url: "/materials/organic-chemistry-intro.pdf",
    uploadDate: "2024-01-10",
    size: "2.5 MB",
  },
  {
    id: "2",
    title: "Chemical Reactions Simulation",
    description: "Interactive simulation for understanding reaction mechanisms.",
    type: "simulation",
    url: "/simulations/reactions",
    uploadDate: "2024-01-12",
  },
]

export const mockGrades: Grade[] = [
  {
    id: "1",
    itemName: "Molecular Structure Quiz",
    type: "quiz",
    score: 87,
    maxScore: 100,
    date: "2024-01-15",
    feedback: "Good understanding of VSEPR theory. Review hybridization concepts.",
  },
  {
    id: "2",
    itemName: "Chemical Bonding Assignment",
    type: "activity",
    score: 85,
    maxScore: 100,
    date: "2024-01-12",
    feedback: "Excellent work on ionic bonding. Minor errors in covalent bond examples.",
  },
]
