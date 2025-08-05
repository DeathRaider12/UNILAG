"use client"

export interface BulkImportResult {
  success: boolean
  imported: number
  failed: number
  errors: string[]
  duplicates: string[]
}

class BulkUserService {
  private static instance: BulkUserService

  static getInstance(): BulkUserService {
    if (!BulkUserService.instance) {
      BulkUserService.instance = new BulkUserService()
    }
    return BulkUserService.instance
  }

  async importUsersFromCSV(csvContent: string): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
      duplicates: [],
    }

    try {
      const lines = csvContent.trim().split("\n")
      if (lines.length < 2) {
        result.errors.push("CSV file must contain at least a header and one data row")
        return result
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const requiredHeaders = ["firstname", "lastname", "email", "studentid", "level", "major", "gpa"]

      // Validate headers
      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
      if (missingHeaders.length > 0) {
        result.errors.push(`Missing required headers: ${missingHeaders.join(", ")}`)
        return result
      }

      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())

        if (values.length !== headers.length) {
          result.errors.push(`Row ${i + 1}: Column count mismatch`)
          result.failed++
          continue
        }

        try {
          const userData: any = {}
          headers.forEach((header, index) => {
            userData[header] = values[index]
          })

          // Validate required fields
          if (
            !userData.firstname ||
            !userData.lastname ||
            !userData.email ||
            !userData.studentid ||
            !userData.level ||
            !userData.major ||
            !userData.gpa
          ) {
            result.errors.push(`Row ${i + 1}: Missing required field`)
            result.failed++
            continue
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(userData.email)) {
            result.errors.push(`Row ${i + 1}: Invalid email format`)
            result.failed++
            continue
          }

          // Validate GPA
          const gpa = Number.parseFloat(userData.gpa)
          if (isNaN(gpa) || gpa < 0 || gpa > 5) {
            result.errors.push(`Row ${i + 1}: Invalid GPA (must be 0-5)`)
            result.failed++
            continue
          }

          // Validate level
          const validLevels = ["100", "200", "300", "400", "500", "600"]
          if (!validLevels.includes(userData.level)) {
            result.errors.push(`Row ${i + 1}: Invalid level (must be 100-600)`)
            result.failed++
            continue
          }

          // Check for duplicates (simplified - in production, check against database)
          // For now, just track email duplicates within the CSV
          const existingEmails = new Set()
          if (existingEmails.has(userData.email.toLowerCase())) {
            result.duplicates.push(userData.email)
            result.failed++
            continue
          }
          existingEmails.add(userData.email.toLowerCase())

          // If we get here, the user data is valid
          result.imported++
        } catch (error) {
          result.errors.push(`Row ${i + 1}: Processing error`)
          result.failed++
        }
      }

      result.success = result.imported > 0
      return result
    } catch (error) {
      result.errors.push("Failed to parse CSV file")
      return result
    }
  }

  exportUsersToCSV(): string {
    // In production, this would fetch actual user data
    const headers = [
      "firstName",
      "lastName",
      "email",
      "studentId",
      "level",
      "major",
      "gpa",
      "role",
      "isVerified",
      "createdAt",
    ]

    const csvContent = [
      headers.join(","),
      // Sample data - in production, replace with actual user data
      "John,Doe,john.doe@student.unilag.edu.ng,190401001,200,Computer Science,4.25,student,true,2024-01-15",
      "Jane,Smith,jane.smith@student.unilag.edu.ng,190401002,300,Mathematics,4.50,instructor,true,2024-01-16",
      "Mike,Johnson,mike.johnson@student.unilag.edu.ng,190401003,100,Physics,3.80,student,false,2024-01-17",
    ].join("\n")

    return csvContent
  }

  generateSampleCSV(): string {
    const headers = ["firstName", "lastName", "email", "studentId", "level", "major", "gpa", "role"]
    const sampleData = [
      "John,Doe,john.doe@student.unilag.edu.ng,190401001,200,Computer Science,4.25,student",
      "Jane,Smith,jane.smith@student.unilag.edu.ng,190401002,300,Mathematics,4.50,instructor",
      "Mike,Johnson,mike.johnson@student.unilag.edu.ng,190401003,100,Physics,3.80,student",
      "Sarah,Williams,sarah.williams@student.unilag.edu.ng,190401004,400,Engineering,4.10,student",
      "David,Brown,david.brown@student.unilag.edu.ng,190401005,500,Medicine,4.75,instructor",
    ]

    return [headers.join(","), ...sampleData].join("\n")
  }
}

export const bulkUserService = BulkUserService.getInstance()
