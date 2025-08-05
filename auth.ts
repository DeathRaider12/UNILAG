"use client"

import { emailService } from "./email-service"
import { notificationService } from "./notification-service"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  studentId: string
  level: string
  major: string
  gpa: number
  role: "student" | "instructor" | "admin"
  isVerified: boolean
  isEmailVerified: boolean
  transcriptUrl?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Demo users - can be easily removed
const demoUsers: User[] = [
  {
    id: "demo-student-1",
    email: "demo.student@unilag.edu.ng",
    firstName: "Demo",
    lastName: "Student",
    studentId: "DEMO001",
    level: "300",
    major: "Computer Science",
    gpa: 4.2,
    role: "student",
    isVerified: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-instructor-1",
    email: "demo.instructor@unilag.edu.ng",
    firstName: "Demo",
    lastName: "Instructor",
    studentId: "DEMO002",
    level: "500",
    major: "Computer Science",
    gpa: 4.8,
    role: "instructor",
    isVerified: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-admin-1",
    email: "demo.admin@unilag.edu.ng",
    firstName: "Demo",
    lastName: "Admin",
    studentId: "DEMO003",
    level: "Admin",
    major: "Administration",
    gpa: 5.0,
    role: "admin",
    isVerified: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  },
]

// Mock database - in production, this would be a real database
const users: User[] = [...demoUsers]

export class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.authState))
  }

  private setAuthState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates }
    this.notify()
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.setAuthState({ isLoading: true })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user by email
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        this.setAuthState({ isLoading: false })
        return { success: false, error: "Invalid email or password" }
      }

      // Demo password validation
      const isDemoUser = user.id.startsWith("demo-")
      if (isDemoUser) {
        const validPasswords = {
          "demo.student@unilag.edu.ng": "student123",
          "demo.instructor@unilag.edu.ng": "instructor123",
          "demo.admin@unilag.edu.ng": "admin123",
        }

        if (validPasswords[user.email as keyof typeof validPasswords] !== password) {
          this.setAuthState({ isLoading: false })
          return { success: false, error: "Invalid email or password" }
        }
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        this.setAuthState({ isLoading: false })
        return { success: false, error: "Please verify your email address before signing in" }
      }

      this.setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })

      localStorage.setItem("auth_user", JSON.stringify(user))
      return { success: true }
    } catch (error) {
      this.setAuthState({ isLoading: false })
      return { success: false, error: "An error occurred during sign in" }
    }
  }

  async signUp(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    studentId: string
    level: string
    major: string
    gpa: number
    wantToTeach: boolean
    transcriptFile?: File
  }): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> {
    this.setAuthState({ isLoading: true })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if user already exists
      if (users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
        this.setAuthState({ isLoading: false })
        return { success: false, error: "User with this email already exists" }
      }

      // Send verification email
      const emailResult = await emailService.sendVerificationEmail(userData.email)
      if (!emailResult.success) {
        this.setAuthState({ isLoading: false })
        return { success: false, error: "Failed to send verification email" }
      }

      // Create new user (but don't authenticate yet)
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: userData.email.toLowerCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        studentId: userData.studentId,
        level: userData.level,
        major: userData.major,
        gpa: userData.gpa,
        role: userData.wantToTeach && userData.gpa >= 3.75 ? "instructor" : "student",
        isVerified: false,
        isEmailVerified: false,
        transcriptUrl: userData.transcriptFile ? URL.createObjectURL(userData.transcriptFile) : undefined,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      this.setAuthState({ isLoading: false })

      return { success: true, requiresVerification: true }
    } catch (error) {
      this.setAuthState({ isLoading: false })
      return { success: false, error: "An error occurred during sign up" }
    }
  }

  async verifyEmailAndComplete(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const emailResult = await emailService.verifyEmail(email, code)
      if (!emailResult.success) {
        return emailResult
      }

      // Find and update user
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (!user) {
        return { success: false, error: "User not found" }
      }

      user.isEmailVerified = true

      // Auto-authenticate the user
      this.setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })

      localStorage.setItem("auth_user", JSON.stringify(user))

      // Send welcome notification
      await notificationService.createNotification({
        userId: user.id,
        type: "success",
        title: "Welcome to UNIAG Academic Hub!",
        message: `Welcome ${user.firstName}! Your account has been created successfully. ${
          user.role === "instructor"
            ? "Your instructor application is pending approval."
            : "Start exploring courses now!"
        }`,
        actionUrl: "/dashboard",
        actionText: "Go to Dashboard",
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: "Verification failed" }
    }
  }

  async signOut(): Promise<void> {
    this.setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    localStorage.removeItem("auth_user")
  }

  async initializeAuth(): Promise<void> {
    this.setAuthState({ isLoading: true })

    try {
      const storedUser = localStorage.getItem("auth_user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        // Verify user still exists and is verified
        const currentUser = users.find((u) => u.id === user.id)
        if (currentUser && currentUser.isEmailVerified) {
          this.setAuthState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          localStorage.removeItem("auth_user")
          this.setAuthState({ isLoading: false })
        }
      } else {
        this.setAuthState({ isLoading: false })
      }
    } catch (error) {
      this.setAuthState({ isLoading: false })
    }
  }

  getAuthState(): AuthState {
    return this.authState
  }

  getAllUsers(): User[] {
    return users
  }

  async updateUserVerification(userId: string, isVerified: boolean): Promise<void> {
    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex !== -1) {
      users[userIndex].isVerified = isVerified

      // Send notification
      await notificationService.notifyInstructorApproval(userId, isVerified)

      if (this.authState.user?.id === userId) {
        this.setAuthState({
          user: { ...users[userIndex] },
        })
        localStorage.setItem("auth_user", JSON.stringify(users[userIndex]))
      }
    }
  }

  // Create admin user for secure access
  async createAdminUser(
    email: string,
    password: string,
    adminKey: string,
  ): Promise<{ success: boolean; error?: string }> {
    // In production, verify adminKey against environment variable
    if (adminKey !== "UNIAG_ADMIN_2024") {
      return { success: false, error: "Invalid admin key" }
    }

    const adminUser: User = {
      id: "admin-1",
      email: email.toLowerCase(),
      firstName: "System",
      lastName: "Administrator",
      studentId: "ADMIN001",
      level: "Admin",
      major: "Administration",
      gpa: 5.0,
      role: "admin",
      isVerified: true,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    }

    // Remove existing admin and add new one
    const existingAdminIndex = users.findIndex((u) => u.role === "admin" && !u.id.startsWith("demo-"))
    if (existingAdminIndex !== -1) {
      users.splice(existingAdminIndex, 1)
    }

    users.push(adminUser)
    return { success: true }
  }

  // Method to remove demo users (for production cleanup)
  removeDemoUsers(): void {
    const demoUserIds = demoUsers.map((u) => u.id)
    for (let i = users.length - 1; i >= 0; i--) {
      if (demoUserIds.includes(users[i].id)) {
        users.splice(i, 1)
      }
    }
  }
}

export const authService = AuthService.getInstance()
