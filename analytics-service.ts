"use client"

export interface UserEngagement {
  userId: string
  userName: string
  loginCount: number
  lastLogin: string
  totalTimeSpent: number // in minutes
  coursesEnrolled: number
  coursesCompleted: number
  averageScore: number
  activityLevel: "high" | "medium" | "low"
}

export interface CourseAnalytics {
  courseId: string
  courseName: string
  enrollmentCount: number
  completionRate: number
  averageRating: number
  totalRevenue: number
  engagementScore: number
  dropoffPoints: string[]
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  totalRevenue: number
  serverUptime: number
  averageLoadTime: number
  errorRate: number
}

export interface AnalyticsData {
  userEngagement: UserEngagement[]
  courseAnalytics: CourseAnalytics[]
  systemMetrics: SystemMetrics
  revenueData: { date: string; amount: number }[]
  userGrowth: { date: string; users: number }[]
  coursePopularity: { course: string; enrollments: number }[]
}

class AnalyticsService {
  private static instance: AnalyticsService
  private data: AnalyticsData

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
      AnalyticsService.instance.initializeData()
    }
    return AnalyticsService.instance
  }

  private initializeData(): void {
    // Generate mock analytics data
    this.data = {
      userEngagement: this.generateUserEngagement(),
      courseAnalytics: this.generateCourseAnalytics(),
      systemMetrics: this.generateSystemMetrics(),
      revenueData: this.generateRevenueData(),
      userGrowth: this.generateUserGrowth(),
      coursePopularity: this.generateCoursePopularity(),
    }
  }

  private generateUserEngagement(): UserEngagement[] {
    const users = [
      "John Doe",
      "Jane Smith",
      "Mike Johnson",
      "Sarah Wilson",
      "David Brown",
      "Lisa Davis",
      "Tom Anderson",
      "Emily Taylor",
      "Chris Martin",
      "Anna Lee",
    ]

    return users.map((name, index) => ({
      userId: `user-${index + 1}`,
      userName: name,
      loginCount: Math.floor(Math.random() * 50) + 10,
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalTimeSpent: Math.floor(Math.random() * 500) + 100,
      coursesEnrolled: Math.floor(Math.random() * 10) + 1,
      coursesCompleted: Math.floor(Math.random() * 5) + 1,
      averageScore: Math.floor(Math.random() * 40) + 60,
      activityLevel: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as "high" | "medium" | "low",
    }))
  }

  private generateCourseAnalytics(): CourseAnalytics[] {
    const courses = [
      "Introduction to Computer Science",
      "Advanced Mathematics",
      "Physics Fundamentals",
      "Chemistry Basics",
      "Biology Essentials",
      "English Literature",
      "History of Nigeria",
      "Economics Principles",
    ]

    return courses.map((name, index) => ({
      courseId: `course-${index + 1}`,
      courseName: name,
      enrollmentCount: Math.floor(Math.random() * 200) + 50,
      completionRate: Math.floor(Math.random() * 40) + 60,
      averageRating: Math.floor(Math.random() * 2) + 3.5,
      totalRevenue: Math.floor(Math.random() * 10000) + 5000,
      engagementScore: Math.floor(Math.random() * 30) + 70,
      dropoffPoints: ["Module 3", "Assignment 2", "Final Exam"],
    }))
  }

  private generateSystemMetrics(): SystemMetrics {
    return {
      totalUsers: 1247,
      activeUsers: 892,
      totalCourses: 156,
      totalRevenue: 125000,
      serverUptime: 99.8,
      averageLoadTime: 1.2,
      errorRate: 0.05,
    }
  }

  private generateRevenueData(): { date: string; amount: number }[] {
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split("T")[0],
        amount: Math.floor(Math.random() * 5000) + 2000,
      })
    }
    return data
  }

  private generateUserGrowth(): { date: string; users: number }[] {
    const data = []
    let users = 100
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      users += Math.floor(Math.random() * 20) + 5
      data.push({
        date: date.toISOString().split("T")[0],
        users,
      })
    }
    return data
  }

  private generateCoursePopularity(): { course: string; enrollments: number }[] {
    return [
      { course: "Computer Science", enrollments: 245 },
      { course: "Mathematics", enrollments: 198 },
      { course: "Physics", enrollments: 167 },
      { course: "Chemistry", enrollments: 134 },
      { course: "Biology", enrollments: 123 },
      { course: "English", enrollments: 98 },
      { course: "History", enrollments: 87 },
      { course: "Economics", enrollments: 76 },
    ]
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return this.data
  }

  async getUserEngagement(userId?: string): Promise<UserEngagement[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (userId) {
      return this.data.userEngagement.filter((u) => u.userId === userId)
    }
    return this.data.userEngagement
  }

  async getCourseAnalytics(courseId?: string): Promise<CourseAnalytics[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (courseId) {
      return this.data.courseAnalytics.filter((c) => c.courseId === courseId)
    }
    return this.data.courseAnalytics
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return this.data.systemMetrics
  }

  async exportAnalytics(format: "csv" | "json" | "pdf"): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      switch (format) {
        case "json":
          return { success: true, data: JSON.stringify(this.data, null, 2) }
        case "csv":
          // Convert to CSV format
          const csvData = this.convertToCSV(this.data)
          return { success: true, data: csvData }
        case "pdf":
          return { success: true, data: "PDF export would be generated here" }
        default:
          return { success: false, error: "Unsupported format" }
      }
    } catch (error) {
      return { success: false, error: "Export failed" }
    }
  }

  private convertToCSV(data: AnalyticsData): string {
    const headers = ["Metric", "Value"]
    const rows = [
      ["Total Users", data.systemMetrics.totalUsers.toString()],
      ["Active Users", data.systemMetrics.activeUsers.toString()],
      ["Total Courses", data.systemMetrics.totalCourses.toString()],
      ["Total Revenue", data.systemMetrics.totalRevenue.toString()],
      ["Server Uptime", data.systemMetrics.serverUptime.toString()],
    ]

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }
}

export const analyticsService = AnalyticsService.getInstance()
