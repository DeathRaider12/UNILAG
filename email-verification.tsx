"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { emailService } from "@/lib/email-service"

interface EmailVerificationProps {
  email: string
  onVerificationComplete: (email: string, code: string) => Promise<{ success: boolean; error?: string }>
  onCancel?: () => void
}

export function EmailVerification({ email, onVerificationComplete, onCancel }: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      return
    }

    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits")
      return
    }

    setIsVerifying(true)
    setError("")
    setSuccess("")

    try {
      const result = await onVerificationComplete(email, verificationCode)

      if (result.success) {
        setSuccess("Email verified successfully!")
      } else {
        setError(result.error || "Verification failed")
      }
    } catch (error) {
      setError("An error occurred during verification")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      const result = await emailService.resendVerificationCode(email)

      if (result.success) {
        setSuccess("New verification code sent!")
        setTimeLeft(600) // Reset timer
        setCanResend(false)
        setVerificationCode("")
      } else {
        setError(result.error || "Failed to resend code")
      }
    } catch (error) {
      setError("Failed to resend verification code")
    } finally {
      setIsResending(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const cleanValue = value.replace(/\D/g, "").slice(0, 6)
    setVerificationCode(cleanValue)
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
            <br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <div className="text-center text-sm text-gray-600">
            {timeLeft > 0 ? (
              <p>Code expires in {formatTime(timeLeft)}</p>
            ) : (
              <p className="text-red-600">Verification code has expired</p>
            )}
          </div>

          <div className="space-y-3">
            <Button onClick={handleVerify} disabled={isVerifying || verificationCode.length !== 6} className="w-full">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={isResending || (!canResend && timeLeft > 0)}
                className="text-sm"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend Code
                  </>
                )}
              </Button>

              {onCancel && (
                <Button variant="ghost" onClick={onCancel} className="text-sm">
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Didn't receive the code? Check your spam folder or try resending.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
