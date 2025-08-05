"use client"

import { useState, useEffect } from "react"
import { authService } from "@/lib/auth"

export function useAuth() {
  const [authState, setAuthState] = useState(authService.getAuthState())

  useEffect(() => {
    // Initialize auth on mount
    authService.initializeAuth()

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe(setAuthState)

    return unsubscribe
  }, [])

  return {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signOut: authService.signOut.bind(authService),
  }
}
