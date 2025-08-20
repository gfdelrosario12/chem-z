"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp, Award, Target, Calendar, FileText, Beaker, BookOpen, Eye, Download } from "lucide-react"

interface GradeItem {
  id: string
  name: string
  type: "quiz" | "activity" | "project" | "exam"
  score: number
  maxScore: number
  percentage: number
  date: string
  feedback?: string
  weight: number
  category: string
}

const mockGrades: GradeItem[] = [
  {
    id: "1",
    name: "Molecular Structure Quiz",
    type: "quiz",
    score: 87,
    maxScore: 100,
    percentage: 87,
    date: "2024-01-15",
    feedback: "Good understanding of VSEPR theory. Review hybridization concepts.",
    weight: 10,
    category: "Quizzes",
  },
  {
    id: "2",
    name: "Acid-Base Titration Lab",
    type: "activity",
    score: 92,
    maxScore: 100,
    percentage: 92,
    date: "2024-01-12",
    feedback: "Excellent lab technique and data analysis. Minor calculation error in error analysis.",
    weight: 15,
    category: "Labs",
  },
  {
    id: "3",
    name: "Organic Synthesis Project",
    type: "project",
    score: 85,
    maxScore: 100,
    percentage: 85,
    date: "2024-01-10",
    feedback: "Creative synthesis pathway. Could improve mechanism details.",
    weight: 25,
    category: "Projects",
  },
  {
    id: "4",
    name: "Thermodynamics Quiz",
    type: "quiz",
    score: 78,
    maxScore: 100,
    percentage: 78,
    date: "2024-01-08",
    feedback: "Review entropy calculations and spontaneity predictions.",
    weight: 10,
    category: "Quizzes",
  },
  {
    id: "5",
    name: "Spectroscopy Analysis",
    type: "activity",
    score: 94,
    maxScore: 100,
    percentage: 94,
    date: "2024-01-05",
    feedback: "Outstanding interpretation of spectra. Excellent attention to detail.",
    weight: 15,
    category: "Labs",
  },
  {
    id: "6",
    name: "Midterm Exam",
    type: "exam",
    score: 89,
    maxScore: 100,
    percentage: 89,
    date: "2024-01-03",
    feedback: "Strong performance overall. Focus on kinetics problems for final exam.",
    weight: 20,
    category: "Exams",
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "quiz":
      return <FileText className="h-4 w-4" />
    case "activity":
      return <Beaker className="h-4 w-4" />
    case "project":
      return <BookOpen className="h-4 w-4" />
    case "exam":
      return <Award className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getScoreColor = (percentage: number) => {
  if (percentage >= 90) return "text-green-600"
  if (percentage >= 80) return "text-blue-600"
  if (percentage >= 70) return "text-yellow-600"
  return "text-red-600"
}

const getGradeBadgeColor = (percentage: number) => {
  if (percentage >= 90) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  if (percentage >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
  return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
}

const calculateStats = (grades: GradeItem[]) => {
  const totalWeightedScore = grades.reduce((sum, grade) => sum + grade.percentage * grade.weight, 0)
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0)
  const overallGrade = totalWeightedScore / totalWeight

  const categoryStats = grades.reduce(
    (acc, grade) => {
      if (!acc[grade.category]) {
        acc[grade.category] = { total: 0, count: 0, weight: 0 }
      }
      acc[grade.category].total += grade.percentage
      acc[grade.category].count += 1
      acc[grade.category].weight += grade.weight
      return acc
    },
    {} as Record<string, { total: number; count: number; weight: number }>,
  )

  const categoryAverages = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    average: stats.total / stats.count,
    weight: stats.weight,
  }))

  return { overallGrade, categoryAverages }
}

export function GradeView() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const stats = calculateStats(mockGrades)

  const quizzes = mockGrades.filter((grade) => grade.type === "quiz")
  const activities = mockGrades.filter((grade) => grade.type === "activity")
  const projects = mockGrades.filter((grade) => grade.type === "project")
  const exams = mockGrades.filter((grade) => grade.type === "exam")

  const GradeTable = ({ grades, title }: { grades: GradeItem[]; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="secondary">{grades.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(grade.type)}
                    <span className="font-medium">{grade.name}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={getScoreColor(grade.percentage)}>
                    {grade.score}/{grade.maxScore}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getGradeBadgeColor(grade.percentage)}>{grade.percentage}%</Badge>
                </TableCell>
                <TableCell>{grade.weight}%</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grade View</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your academic progress and performance</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overall Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Grade</p>
                    <p className={`text-3xl font-bold ${getScoreColor(stats.overallGrade)}`}>
                      {stats.overallGrade.toFixed(1)}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignments</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{mockGrades.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Best Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.max(...mockGrades.map((g) => g.percentage))}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trend</p>
                    <p className="text-3xl font-bold text-blue-600">+2.3%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Breakdown by Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.categoryAverages.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className={getScoreColor(category.average)}>
                      {category.average.toFixed(1)}% (Weight: {category.weight}%)
                    </span>
                  </div>
                  <Progress value={category.average} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGrades.slice(0, 5).map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTypeIcon(grade.type)}
                      <div>
                        <p className="font-medium">{grade.name}</p>
                        <p className="text-sm text-gray-500">{new Date(grade.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getGradeBadgeColor(grade.percentage)}>{grade.percentage}%</Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {grade.score}/{grade.maxScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <GradeTable grades={quizzes} title="Quiz Grades" />
        </TabsContent>

        <TabsContent value="activities">
          <GradeTable grades={activities} title="Activity Grades" />
        </TabsContent>

        <TabsContent value="projects">
          <GradeTable grades={projects} title="Project Grades" />
        </TabsContent>

        <TabsContent value="exams">
          <GradeTable grades={exams} title="Exam Grades" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
