"use client"

interface EmailVerification {
  email: string
  code: string
  expiresAt: string
  attempts: number
}

class EmailService {
  private static instance: EmailService
  private verificationCodes: Map<string, EmailVerification> = new Map()

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Set expiration to 10 minutes from now
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      // Store verification code
      this.verificationCodes.set(email.toLowerCase(), {
        email: email.toLowerCase(),
        code,
        expiresAt,
        attempts: 0,
      })

      // In production, send actual email here
      console.log(`Verification code for ${email}: ${code}`)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to send verification email" }
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const verification = this.verificationCodes.get(email.toLowerCase())

      if (!verification) {
        return { success: false, error: "No verification code found for this email" }
      }

      // Check if code has expired
      if (new Date() > new Date(verification.expiresAt)) {
        this.verificationCodes.delete(email.toLowerCase())
        return { success: false, error: "Verification code has expired" }
      }

      // Check attempts limit
      if (verification.attempts >= 3) {
        this.verificationCodes.delete(email.toLowerCase())
        return { success: false, error: "Too many failed attempts. Please request a new code" }
      }

      // Verify code
      if (verification.code !== code) {
        verification.attempts += 1
        return { success: false, error: "Invalid verification code" }
      }

      // Success - remove the verification code
      this.verificationCodes.delete(email.toLowerCase())
      return { success: true }
    } catch (error) {
      return { success: false, error: "Verification failed" }
    }
  }

  async resendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
    // Remove existing code and send new one
    this.verificationCodes.delete(email.toLowerCase())
    return this.sendVerificationEmail(email)
  }
}

export const emailService = EmailService.getInstance()
