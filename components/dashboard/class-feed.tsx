"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  MessageSquare,
  Heart,
  Share2,
  Download,
  Eye,
  FileText,
  Video,
  Link,
  Beaker,
  Calendar,
  Pin,
} from "lucide-react"

interface FeedPost {
  id: string
  type: "announcement" | "material" | "activity" | "discussion" | "quiz"
  title: string
  content: string
  author: {
    name: string
    role: "teacher" | "admin" | "student"
    avatar?: string
  }
  timestamp: string
  isPinned?: boolean
  attachments?: {
    name: string
    type: "pdf" | "video" | "link" | "simulation"
    url: string
    size?: string
  }[]
  interactions: {
    likes: number
    comments: number
    views: number
  }
  tags?: string[]
  dueDate?: string
}

const mockFeedPosts: FeedPost[] = [
  {
    id: "1",
    type: "announcement",
    title: "Important: Lab Safety Update",
    content:
      "New safety protocols are now in effect for all chemistry labs. Please review the updated guidelines before your next session. All students must complete the safety quiz by Friday.",
    author: {
      name: "Dr. Sarah Johnson",
      role: "teacher",
      avatar: "/diverse-classroom-teacher.png",
    },
    timestamp: "2024-01-15T10:30:00Z",
    isPinned: true,
    attachments: [
      {
        name: "Lab Safety Guidelines 2024.pdf",
        type: "pdf",
        url: "/safety-guidelines.pdf",
        size: "1.2 MB",
      },
    ],
    interactions: {
      likes: 23,
      comments: 5,
      views: 156,
    },
    tags: ["safety", "important", "lab"],
  },
  {
    id: "2",
    type: "material",
    title: "Organic Chemistry: Reaction Mechanisms",
    content:
      "New video lecture covering substitution and elimination reactions. This material will be covered in next week's exam.",
    author: {
      name: "Prof. Michael Chen",
      role: "teacher",
      avatar: "/diverse-professor-lecturing.png",
    },
    timestamp: "2024-01-14T14:15:00Z",
    attachments: [
      {
        name: "Reaction Mechanisms Lecture",
        type: "video",
        url: "/lectures/reaction-mechanisms.mp4",
      },
      {
        name: "Practice Problems",
        type: "pdf",
        url: "/practice-problems.pdf",
        size: "850 KB",
      },
    ],
    interactions: {
      likes: 45,
      comments: 12,
      views: 234,
    },
    tags: ["organic chemistry", "lecture", "exam prep"],
  },
  {
    id: "3",
    type: "activity",
    title: "Acid-Base Titration Lab Assignment",
    content:
      "Complete the titration experiment and submit your lab report. Remember to include error analysis and discussion of results.",
    author: {
      name: "Dr. Sarah Johnson",
      role: "teacher",
      avatar: "/diverse-classroom-teacher.png",
    },
    timestamp: "2024-01-13T09:00:00Z",
    dueDate: "2024-01-20T23:59:00Z",
    attachments: [
      {
        name: "Lab Instructions",
        type: "pdf",
        url: "/lab-instructions.pdf",
        size: "2.1 MB",
      },
      {
        name: "Data Collection Sheet",
        type: "pdf",
        url: "/data-sheet.pdf",
        size: "450 KB",
      },
    ],
    interactions: {
      likes: 18,
      comments: 8,
      views: 89,
    },
    tags: ["lab", "assignment", "titration"],
  },
  {
    id: "4",
    type: "quiz",
    title: "Thermodynamics Quiz - Chapter 6",
    content:
      "Test your understanding of enthalpy, entropy, and Gibbs free energy. 20 questions, 45 minutes time limit. Available until Friday 11:59 PM.",
    author: {
      name: "Dr. Sarah Johnson",
      role: "teacher",
      avatar: "/diverse-classroom-teacher.png",
    },
    timestamp: "2024-01-12T08:00:00Z",
    dueDate: "2024-01-19T23:59:00Z",
    attachments: [
      {
        name: "Formula Sheet",
        type: "pdf",
        url: "/formula-sheet.pdf",
        size: "320 KB",
      },
    ],
    interactions: {
      likes: 12,
      comments: 3,
      views: 78,
    },
    tags: ["quiz", "thermodynamics", "chapter 6"],
  },
  {
    id: "5",
    type: "material",
    title: "Molecular Geometry Textbook Chapter",
    content:
      "Required reading for next week's class. Focus on VSEPR theory and molecular shapes. Practice problems are at the end of the chapter.",
    author: {
      name: "Prof. Michael Chen",
      role: "teacher",
      avatar: "/diverse-professor-lecturing.png",
    },
    timestamp: "2024-01-11T16:30:00Z",
    attachments: [
      {
        name: "Chapter 9: Molecular Geometry",
        type: "pdf",
        url: "/textbook-chapter-9.pdf",
        size: "4.2 MB",
      },
      {
        name: "3D Molecular Models",
        type: "simulation",
        url: "/simulations/molecular-models",
      },
    ],
    interactions: {
      likes: 28,
      comments: 7,
      views: 142,
    },
    tags: ["reading", "molecular geometry", "VSEPR"],
  },
  {
    id: "6",
    type: "discussion",
    title: "Question about Molecular Orbital Theory",
    content:
      "Can someone explain why oxygen is paramagnetic according to MO theory? I'm having trouble understanding the electron configuration.",
    author: {
      name: "Alex Rodriguez",
      role: "student",
      avatar: "/diverse-students-studying.png",
    },
    timestamp: "2024-01-11T16:45:00Z",
    interactions: {
      likes: 7,
      comments: 15,
      views: 67,
    },
    tags: ["question", "molecular orbital", "help"],
  },
  {
    id: "7",
    type: "activity",
    title: "Crystallography Lab Report",
    content:
      "Analyze your X-ray diffraction data and determine the crystal structure. Include Miller indices and unit cell parameters in your report.",
    author: {
      name: "Dr. Emily Watson",
      role: "teacher",
      avatar: "/female-teacher-classroom.png",
    },
    timestamp: "2024-01-10T13:20:00Z",
    dueDate: "2024-01-24T23:59:00Z",
    attachments: [
      {
        name: "XRD Data Analysis Guide",
        type: "pdf",
        url: "/xrd-guide.pdf",
        size: "1.8 MB",
      },
      {
        name: "Sample Data Files",
        type: "link",
        url: "/data/xrd-samples",
      },
    ],
    interactions: {
      likes: 15,
      comments: 4,
      views: 56,
    },
    tags: ["lab", "crystallography", "XRD"],
  },
  {
    id: "8",
    type: "material",
    title: "Interactive Periodic Table Simulation",
    content:
      "Explore element properties and trends with this interactive tool. Great for understanding periodic trends and electron configurations.",
    author: {
      name: "Dr. Emily Watson",
      role: "teacher",
      avatar: "/female-teacher-classroom.png",
    },
    timestamp: "2024-01-09T11:20:00Z",
    attachments: [
      {
        name: "Periodic Table Simulator",
        type: "simulation",
        url: "/simulations/periodic-table",
      },
    ],
    interactions: {
      likes: 32,
      comments: 6,
      views: 145,
    },
    tags: ["simulation", "periodic table", "interactive"],
  },
  {
    id: "9",
    type: "quiz",
    title: "Organic Reactions Midterm Practice",
    content:
      "Practice quiz covering all reaction mechanisms from chapters 1-8. Unlimited attempts, but focus on understanding the mechanisms.",
    author: {
      name: "Prof. Michael Chen",
      role: "teacher",
      avatar: "/diverse-professor-lecturing.png",
    },
    timestamp: "2024-01-08T14:00:00Z",
    attachments: [
      {
        name: "Reaction Summary Sheet",
        type: "pdf",
        url: "/reaction-summary.pdf",
        size: "2.1 MB",
      },
    ],
    interactions: {
      likes: 41,
      comments: 18,
      views: 203,
    },
    tags: ["quiz", "practice", "organic reactions", "midterm"],
  },
]

const getPostTypeIcon = (type: string) => {
  switch (type) {
    case "announcement":
      return <Pin className="h-4 w-4" />
    case "material":
      return <FileText className="h-4 w-4" />
    case "activity":
      return <Beaker className="h-4 w-4" />
    case "quiz":
      return <FileText className="h-4 w-4" />
    case "discussion":
      return <MessageSquare className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getPostTypeColor = (type: string) => {
  switch (type) {
    case "announcement":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    case "material":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    case "activity":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "quiz":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
    case "discussion":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

const getAttachmentIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4" />
    case "video":
      return <Video className="h-4 w-4" />
    case "link":
      return <Link className="h-4 w-4" />
    case "simulation":
      return <Beaker className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 48) return "Yesterday"
  return time.toLocaleDateString()
}

const formatDueDate = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 0) return "Overdue"
  if (diffInDays === 0) return "Due today"
  if (diffInDays === 1) return "Due tomorrow"
  return `Due in ${diffInDays} days`
}

export function ClassFeed() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filteredPosts = mockFeedPosts
    .filter((post) => {
      if (selectedFilter !== "all" && post.type !== selectedFilter) return false
      if (
        searchQuery &&
        !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      return true
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      if (sortBy === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
      if (sortBy === "oldest") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      }
      if (sortBy === "popular") {
        return b.interactions.likes - a.interactions.likes
      }
      return 0
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Feed</h1>
        <p className="text-gray-600 dark:text-gray-400">
          All course materials, activities, quizzes, and announcements in one place
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="material">Materials</SelectItem>
              <SelectItem value="activity">Activities</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
              <SelectItem value="discussion">Discussions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className={post.isPinned ? "border-blue-200 dark:border-blue-800" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                    <AvatarFallback>
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{post.author.name}</p>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {post.author.role}
                      </Badge>
                      {post.isPinned && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPostTypeColor(post.type)}>
                    {getPostTypeIcon(post.type)}
                    <span className="ml-1 capitalize">{post.type}</span>
                  </Badge>
                  {post.dueDate && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDueDate(post.dueDate)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{post.content}</p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments:</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {post.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {getAttachmentIcon(attachment.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {attachment.name}
                          </p>
                          {attachment.size && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.size}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.interactions.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {post.interactions.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.interactions.comments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Heart className="h-4 w-4" />
                    Like
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                    Comment
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="bg-transparent">
          Load More Posts
        </Button>
      </div>
    </div>
  )
}
