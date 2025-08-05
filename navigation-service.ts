"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

export interface NavigationService {
  navigateToHome: () => void
  navigateToDashboard: () => void
  navigateToAdmin: () => void
  navigateToCourses: () => void
  navigateToMarketplace: () => void
  navigateToSettings: () => void
  navigateToLogin: () => void
  navigateToRegister: () => void
  navigateBack: () => void
  navigateForward: () => void
  refreshPage: () => void
}

export function useNavigation(): NavigationService {
  const router = useRouter()

  const navigateToHome = useCallback(() => {
    try {
      console.log("Navigating to home...")
      router.push("/")
    } catch (error) {
      console.error("Navigation error to home:", error)
      window.location.href = "/"
    }
  }, [router])

  const navigateToDashboard = useCallback(() => {
    try {
      console.log("Navigating to dashboard...")
      router.push("/dashboard")
    } catch (error) {
      console.error("Navigation error to dashboard:", error)
      window.location.href = "/dashboard"
    }
  }, [router])

  const navigateToAdmin = useCallback(() => {
    try {
      console.log("Navigating to admin...")
      router.push("/admin")
    } catch (error) {
      console.error("Navigation error to admin:", error)
      window.location.href = "/admin"
    }
  }, [router])

  const navigateToCourses = useCallback(() => {
    try {
      console.log("Navigating to courses...")
      router.push("/courses")
    } catch (error) {
      console.error("Navigation error to courses:", error)
      window.location.href = "/courses"
    }
  }, [router])

  const navigateToMarketplace = useCallback(() => {
    try {
      console.log("Navigating to marketplace...")
      router.push("/marketplace")
    } catch (error) {
      console.error("Navigation error to marketplace:", error)
      window.location.href = "/marketplace"
    }
  }, [router])

  const navigateToSettings = useCallback(() => {
    try {
      console.log("Navigating to settings...")
      router.push("/settings")
    } catch (error) {
      console.error("Navigation error to settings:", error)
      window.location.href = "/settings"
    }
  }, [router])

  const navigateToLogin = useCallback(() => {
    try {
      console.log("Navigating to login...")
      router.push("/login")
    } catch (error) {
      console.error("Navigation error to login:", error)
      window.location.href = "/login"
    }
  }, [router])

  const navigateToRegister = useCallback(() => {
    try {
      console.log("Navigating to register...")
      router.push("/register")
    } catch (error) {
      console.error("Navigation error to register:", error)
      window.location.href = "/register"
    }
  }, [router])

  const navigateBack = useCallback(() => {
    try {
      router.back()
    } catch (error) {
      console.error("Navigation error going back:", error)
      window.history.back()
    }
  }, [router])

  const navigateForward = useCallback(() => {
    try {
      router.forward()
    } catch (error) {
      console.error("Navigation error going forward:", error)
      window.history.forward()
    }
  }, [router])

  const refreshPage = useCallback(() => {
    try {
      router.refresh()
    } catch (error) {
      console.error("Navigation error refreshing:", error)
      window.location.reload()
    }
  }, [router])

  return {
    navigateToHome,
    navigateToDashboard,
    navigateToAdmin,
    navigateToCourses,
    navigateToMarketplace,
    navigateToSettings,
    navigateToLogin,
    navigateToRegister,
    navigateBack,
    navigateForward,
    refreshPage,
  }
}

// Utility function for external navigation
export function navigateExternal(url: string, newTab = false) {
  try {
    if (newTab) {
      window.open(url, "_blank", "noopener,noreferrer")
    } else {
      window.location.href = url
    }
  } catch (error) {
    console.error("External navigation error:", error)
  }
}

// Navigation validation
export function validateRoute(route: string): boolean {
  const validRoutes = [
    "/",
    "/dashboard",
    "/admin",
    "/courses",
    "/marketplace",
    "/settings",
    "/login",
    "/register",
    "/demo",
  ]

  return validRoutes.includes(route) || route.startsWith("/courses/") || route.startsWith("/admin/")
}

// Navigation with confirmation for unsaved changes
export function navigateWithConfirmation(
  router: ReturnType<typeof useRouter>,
  destination: string,
  hasUnsavedChanges = false,
  confirmationMessage = "You have unsaved changes. Are you sure you want to leave?",
) {
  if (hasUnsavedChanges) {
    if (window.confirm(confirmationMessage)) {
      router.push(destination)
    }
  } else {
    router.push(destination)
  }
}
