"use client"

export interface AdminKey {
  id: string
  key: string
  description: string
  createdBy: string
  createdAt: string
  expiresAt: string
  isActive: boolean
  lastUsedAt?: string
  usageCount: number
  permissions: AdminPermission[]
}

export interface AdminPermission {
  resource: string
  actions: string[]
}

export interface AdminKeyRotationLog {
  id: string
  oldKeyId: string
  newKeyId: string
  rotatedBy: string
  rotatedAt: string
  reason: string
}

class AdminKeyService {
  private static instance: AdminKeyService
  private adminKeys: AdminKey[] = []
  private rotationLogs: AdminKeyRotationLog[] = []
  private readonly MASTER_KEY = "UNIAG_MASTER_2024_SECURE"

  static getInstance(): AdminKeyService {
    if (!AdminKeyService.instance) {
      AdminKeyService.instance = new AdminKeyService()
      AdminKeyService.instance.initializeDefaultKeys()
    }
    return AdminKeyService.instance
  }

  private initializeDefaultKeys(): void {
    // Create default admin key
    const defaultKey: AdminKey = {
      id: "admin-key-1",
      key: "UNIAG_ADMIN_2024",
      description: "Default admin access key",
      createdBy: "system",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      isActive: true,
      usageCount: 0,
      permissions: [
        {
          resource: "users",
          actions: ["create", "read", "update", "delete", "verify"],
        },
        {
          resource: "courses",
          actions: ["create", "read", "update", "delete", "publish"],
        },
        {
          resource: "analytics",
          actions: ["read", "export"],
        },
        {
          resource: "system",
          actions: ["configure", "backup", "restore"],
        },
      ],
    }

    this.adminKeys.push(defaultKey)
  }

  async validateAdminKey(key: string): Promise<{
    isValid: boolean
    keyInfo?: AdminKey
    error?: string
  }> {
    try {
      // Check master key first
      if (key === this.MASTER_KEY) {
        return {
          isValid: true,
          keyInfo: {
            id: "master-key",
            key: this.MASTER_KEY,
            description: "Master admin key",
            createdBy: "system",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            usageCount: 0,
            permissions: [
              {
                resource: "*",
                actions: ["*"],
              },
            ],
          },
        }
      }

      const adminKey = this.adminKeys.find((k) => k.key === key && k.isActive)

      if (!adminKey) {
        return { isValid: false, error: "Invalid or inactive admin key" }
      }

      // Check expiration
      if (new Date() > new Date(adminKey.expiresAt)) {
        return { isValid: false, error: "Admin key has expired" }
      }

      // Update usage
      adminKey.usageCount += 1
      adminKey.lastUsedAt = new Date().toISOString()

      return { isValid: true, keyInfo: adminKey }
    } catch (error) {
      return { isValid: false, error: "Key validation failed" }
    }
  }

  async createAdminKey(
    createdBy: string,
    description: string,
    expirationDays = 365,
    permissions: AdminPermission[] = [],
  ): Promise<{ success: boolean; key?: AdminKey; error?: string }> {
    try {
      const keyId = `admin-key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const keyValue = `UNIAG_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`

      const newKey: AdminKey = {
        id: keyId,
        key: keyValue,
        description,
        createdBy,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        usageCount: 0,
        permissions:
          permissions.length > 0
            ? permissions
            : [
                {
                  resource: "users",
                  actions: ["read", "update", "verify"],
                },
                {
                  resource: "courses",
                  actions: ["read", "update"],
                },
              ],
      }

      this.adminKeys.push(newKey)
      return { success: true, key: newKey }
    } catch (error) {
      return { success: false, error: "Failed to create admin key" }
    }
  }

  async rotateAdminKey(
    oldKeyId: string,
    rotatedBy: string,
    reason: string,
  ): Promise<{ success: boolean; newKey?: AdminKey; error?: string }> {
    try {
      const oldKey = this.adminKeys.find((k) => k.id === oldKeyId)
      if (!oldKey) {
        return { success: false, error: "Admin key not found" }
      }

      // Deactivate old key
      oldKey.isActive = false

      // Create new key with same permissions
      const result = await this.createAdminKey(
        rotatedBy,
        `Rotated key - ${oldKey.description}`,
        365,
        oldKey.permissions,
      )

      if (!result.success || !result.key) {
        return { success: false, error: "Failed to create new key during rotation" }
      }

      // Log the rotation
      const rotationLog: AdminKeyRotationLog = {
        id: `rotation-${Date.now()}`,
        oldKeyId,
        newKeyId: result.key.id,
        rotatedBy,
        rotatedAt: new Date().toISOString(),
        reason,
      }

      this.rotationLogs.push(rotationLog)

      return { success: true, newKey: result.key }
    } catch (error) {
      return { success: false, error: "Key rotation failed" }
    }
  }

  async revokeAdminKey(keyId: string, revokedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      const key = this.adminKeys.find((k) => k.id === keyId)
      if (!key) {
        return { success: false, error: "Admin key not found" }
      }

      key.isActive = false

      // Log the revocation
      const rotationLog: AdminKeyRotationLog = {
        id: `revocation-${Date.now()}`,
        oldKeyId: keyId,
        newKeyId: "",
        rotatedBy: revokedBy,
        rotatedAt: new Date().toISOString(),
        reason: "Key revoked",
      }

      this.rotationLogs.push(rotationLog)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to revoke key" }
    }
  }

  getActiveAdminKeys(): AdminKey[] {
    return this.adminKeys.filter((k) => k.isActive && new Date() <= new Date(k.expiresAt))
  }

  getAllAdminKeys(): AdminKey[] {
    return this.adminKeys
  }

  getRotationLogs(): AdminKeyRotationLog[] {
    return this.rotationLogs.sort((a, b) => new Date(b.rotatedAt).getTime() - new Date(a.rotatedAt).getTime())
  }

  getKeyUsageStats(): {
    totalKeys: number
    activeKeys: number
    expiredKeys: number
    totalUsage: number
    averageUsage: number
  } {
    const totalKeys = this.adminKeys.length
    const activeKeys = this.adminKeys.filter((k) => k.isActive && new Date() <= new Date(k.expiresAt)).length
    const expiredKeys = this.adminKeys.filter((k) => new Date() > new Date(k.expiresAt)).length
    const totalUsage = this.adminKeys.reduce((sum, key) => sum + key.usageCount, 0)
    const averageUsage = totalKeys > 0 ? totalUsage / totalKeys : 0

    return {
      totalKeys,
      activeKeys,
      expiredKeys,
      totalUsage,
      averageUsage,
    }
  }

  // Security best practices
  getSecurityRecommendations(): string[] {
    const recommendations: string[] = []
    const now = new Date()

    // Check for keys expiring soon
    const expiringSoon = this.adminKeys.filter((k) => {
      const expiryDate = new Date(k.expiresAt)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return k.isActive && daysUntilExpiry <= 30
    })

    if (expiringSoon.length > 0) {
      recommendations.push(`${expiringSoon.length} admin key(s) expiring within 30 days`)
    }

    // Check for unused keys
    const unusedKeys = this.adminKeys.filter((k) => k.isActive && k.usageCount === 0)
    if (unusedKeys.length > 0) {
      recommendations.push(`${unusedKeys.length} unused admin key(s) should be reviewed`)
    }

    // Check for old keys
    const oldKeys = this.adminKeys.filter((k) => {
      const createdDate = new Date(k.createdAt)
      const monthsOld = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return k.isActive && monthsOld > 12
    })

    if (oldKeys.length > 0) {
      recommendations.push(`${oldKeys.length} admin key(s) older than 12 months should be rotated`)
    }

    // Check for high usage keys
    const highUsageKeys = this.adminKeys.filter((k) => k.usageCount > 1000)
    if (highUsageKeys.length > 0) {
      recommendations.push(`${highUsageKeys.length} high-usage key(s) should be monitored closely`)
    }

    if (recommendations.length === 0) {
      recommendations.push("All admin keys are following security best practices")
    }

    return recommendations
  }
}

export const adminKeyService = AdminKeyService.getInstance()
