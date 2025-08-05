"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Key,
  Plus,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Download,
} from "lucide-react"
import { adminKeyService, type AdminKey, type AdminKeyRotationLog, type AdminPermission } from "@/lib/admin-key-service"
import { useAuth } from "@/hooks/use-auth"

export function AdminKeyManager() {
  const { user } = useAuth()
  const [adminKeys, setAdminKeys] = useState<AdminKey[]>([])
  const [rotationLogs, setRotationLogs] = useState<AdminKeyRotationLog[]>([])
  const [keyUsageStats, setKeyUsageStats] = useState<any>(null)
  const [securityRecommendations, setSecurityRecommendations] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRotateDialog, setShowRotateDialog] = useState(false)
  const [selectedKey, setSelectedKey] = useState<AdminKey | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [newKeyData, setNewKeyData] = useState({
    description: "",
    expirationDays: 365,
    permissions: [] as AdminPermission[],
  })

  const [rotationData, setRotationData] = useState({
    reason: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const keys = adminKeyService.getAllAdminKeys()
    setAdminKeys(keys)

    const logs = adminKeyService.getRotationLogs()
    setRotationLogs(logs)

    const stats = adminKeyService.getKeyUsageStats()
    setKeyUsageStats(stats)

    const recommendations = adminKeyService.getSecurityRecommendations()
    setSecurityRecommendations(recommendations)
  }

  const handleCreateKey = async () => {
    if (!user) return

    const result = await adminKeyService.createAdminKey(
      user.id,
      newKeyData.description,
      newKeyData.expirationDays,
      newKeyData.permissions,
    )

    if (result.success) {
      loadData()
      setShowCreateDialog(false)
      setNewKeyData({
        description: "",
        expirationDays: 365,
        permissions: [],
      })
    }
  }

  const handleRotateKey = async () => {
    if (!user || !selectedKey) return

    const result = await adminKeyService.rotateAdminKey(selectedKey.id, user.id, rotationData.reason)

    if (result.success) {
      loadData()
      setShowRotateDialog(false)
      setSelectedKey(null)
      setRotationData({ reason: "" })
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!user) return

    const result = await adminKeyService.revokeAdminKey(keyId, user.id)
    if (result.success) {
      loadData()
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys)
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId)
    } else {
      newVisibleKeys.add(keyId)
    }
    setVisibleKeys(newVisibleKeys)
  }

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(keyId)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getKeyStatus = (key: AdminKey) => {
    const now = new Date()
    const expiryDate = new Date(key.expiresAt)
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (!key.isActive) return { status: "revoked", color: "destructive" }
    if (now > expiryDate) return { status: "expired", color: "destructive" }
    if (daysUntilExpiry <= 7) return { status: "expiring", color: "destructive" }
    if (daysUntilExpiry <= 30) return { status: "warning", color: "secondary" }
    return { status: "active", color: "default" }
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return key
    return key.substring(0, 4) + "•".repeat(key.length - 8) + key.substring(key.length - 4)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Admin Key Management</h2>
          <p className="text-gray-600">Secure management of administrative access keys</p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Admin Key</DialogTitle>
                <DialogDescription>
                  Generate a new administrative access key with specific permissions and expiration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Production Admin Access - John Doe"
                    value={newKeyData.description}
                    onChange={(e) => setNewKeyData({ ...newKeyData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration (Days)</Label>
                  <Select
                    value={newKeyData.expirationDays.toString()}
                    onValueChange={(value) => setNewKeyData({ ...newKeyData, expirationDays: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { resource: "users", actions: ["read", "create", "update", "delete", "verify"] },
                      { resource: "courses", actions: ["read", "create", "update", "delete", "publish"] },
                      { resource: "analytics", actions: ["read", "export"] },
                      { resource: "system", actions: ["configure", "backup", "restore"] },
                    ].map((permission) => (
                      <Card key={permission.resource} className="p-3">
                        <h4 className="font-medium capitalize mb-2">{permission.resource}</h4>
                        <div className="space-y-1">
                          {permission.actions.map((action) => (
                            <label key={action} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                className="rounded"
                                onChange={(e) => {
                                  const updatedPermissions = [...newKeyData.permissions]
                                  const existingIndex = updatedPermissions.findIndex(
                                    (p) => p.resource === permission.resource,
                                  )

                                  if (existingIndex >= 0) {
                                    if (e.target.checked) {
                                      if (!updatedPermissions[existingIndex].actions.includes(action)) {
                                        updatedPermissions[existingIndex].actions.push(action)
                                      }
                                    } else {
                                      updatedPermissions[existingIndex].actions = updatedPermissions[
                                        existingIndex
                                      ].actions.filter((a) => a !== action)
                                      if (updatedPermissions[existingIndex].actions.length === 0) {
                                        updatedPermissions.splice(existingIndex, 1)
                                      }
                                    }
                                  } else if (e.target.checked) {
                                    updatedPermissions.push({ resource: permission.resource, actions: [action] })
                                  }

                                  setNewKeyData({ ...newKeyData, permissions: updatedPermissions })
                                }}
                              />
                              <span className="text-sm capitalize">{action}</span>
                            </label>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={!newKeyData.description}>
                  Create Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Keys
          </Button>
        </div>
      </div>

      {/* Security Recommendations */}
      {securityRecommendations.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-1">
              <p className="font-medium">Security Recommendations:</p>
              <ul className="list-disc list-inside space-y-1">
                {securityRecommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Usage Stats */}
      {keyUsageStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Keys</p>
                  <p className="text-3xl font-bold">{keyUsageStats.totalKeys}</p>
                </div>
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Keys</p>
                  <p className="text-3xl font-bold">{keyUsageStats.activeKeys}</p>
                  <p className="text-sm text-green-600">Currently valid</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired Keys</p>
                  <p className="text-3xl font-bold">{keyUsageStats.expiredKeys}</p>
                  <p className="text-sm text-red-600">Need attention</p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-3xl font-bold">{keyUsageStats.totalUsage}</p>
                  <p className="text-sm text-purple-600">All time</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">Admin Keys</TabsTrigger>
          <TabsTrigger value="logs">Rotation Logs</TabsTrigger>
          <TabsTrigger value="security">Security Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Keys</CardTitle>
              <CardDescription>Manage all administrative access keys with their permissions and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminKeys.map((key) => {
                    const keyStatus = getKeyStatus(key)
                    const isVisible = visibleKeys.has(key.id)

                    return (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{key.description}</p>
                            <p className="text-sm text-gray-600">Created by {key.createdBy}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {isVisible ? key.key : maskKey(key.key)}
                            </code>
                            <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(key.id)}>
                              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.key, key.id)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            {copiedKey === key.id && <span className="text-sm text-green-600">Copied!</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={keyStatus.color as any}>{keyStatus.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(key.createdAt)}</TableCell>
                        <TableCell>{formatDate(key.expiresAt)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{key.usageCount}</p>
                            {key.lastUsedAt && (
                              <p className="text-sm text-gray-600">Last: {formatDate(key.lastUsedAt)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog
                              open={showRotateDialog && selectedKey?.id === key.id}
                              onOpenChange={(open) => {
                                setShowRotateDialog(open)
                                if (!open) setSelectedKey(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedKey(key)}
                                  disabled={!key.isActive}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rotate Admin Key</DialogTitle>
                                  <DialogDescription>
                                    This will deactivate the current key and generate a new one with the same
                                    permissions.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="reason">Rotation Reason</Label>
                                    <Textarea
                                      id="reason"
                                      placeholder="e.g., Scheduled rotation, security concern, key compromise..."
                                      value={rotationData.reason}
                                      onChange={(e) => setRotationData({ reason: e.target.value })}
                                    />
                                  </div>
                                  <Alert>
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription>
                                      The old key will be immediately deactivated. Make sure to update all systems using
                                      this key.
                                    </AlertDescription>
                                  </Alert>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowRotateDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleRotateKey} disabled={!rotationData.reason}>
                                    Rotate Key
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeKey(key.id)}
                              disabled={!key.isActive}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Rotation Logs</CardTitle>
              <CardDescription>Complete audit trail of all key rotations and revocations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Old Key</TableHead>
                    <TableHead>New Key</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rotationLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.rotatedAt)}</TableCell>
                      <TableCell>
                        <Badge variant={log.newKeyId ? "default" : "destructive"}>
                          {log.newKeyId ? "Rotated" : "Revoked"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{log.oldKeyId}</code>
                      </TableCell>
                      <TableCell>
                        {log.newKeyId ? (
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{log.newKeyId}</code>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{log.rotatedBy}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Regular Key Rotation</h4>
                      <p className="text-sm text-gray-600">
                        Rotate admin keys every 90-180 days or immediately if compromised
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Principle of Least Privilege</h4>
                      <p className="text-sm text-gray-600">Grant only the minimum permissions necessary for each key</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Secure Storage</h4>
                      <p className="text-sm text-gray-600">
                        Store keys in secure password managers or environment variables
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Monitor Usage</h4>
                      <p className="text-sm text-gray-600">Regularly review key usage logs and revoke unused keys</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Key Management Process</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">1. Key Creation</h4>
                    <p className="text-sm text-gray-600">
                      Create keys with specific descriptions and appropriate expiration dates
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">2. Secure Distribution</h4>
                    <p className="text-sm text-gray-600">
                      Share keys through secure channels and never via email or chat
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium">3. Regular Audits</h4>
                    <p className="text-sm text-gray-600">Review active keys monthly and rotate or revoke as needed</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium">4. Incident Response</h4>
                    <p className="text-sm text-gray-600">Immediately revoke compromised keys and investigate usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Admin Key Setup Guide</CardTitle>
              <CardDescription>Step-by-step process for obtaining and managing admin keys securely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Initial Admin Setup</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Contact the system administrator or use the master key for initial setup</li>
                    <li>
                      Create your first admin account using the master key:{" "}
                      <code className="bg-blue-100 px-1 rounded">UNIAG_MASTER_2024_SECURE</code>
                    </li>
                    <li>Immediately create a new admin key with limited permissions for daily use</li>
                    <li>Store the master key securely and use it only for emergency access</li>
                  </ol>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Production Environment</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
                    <li>Generate environment-specific keys for production, staging, and development</li>
                    <li>Use different keys for different team members and services</li>
                    <li>Set up automated key rotation for production systems</li>
                    <li>Implement monitoring and alerting for key usage anomalies</li>
                  </ol>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Key Rotation Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-orange-800">
                    <div>
                      <h5 className="font-medium">High-Risk Keys</h5>
                      <p>Rotate every 30-60 days</p>
                      <p className="text-xs">Production admin, full permissions</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Standard Keys</h5>
                      <p>Rotate every 90-180 days</p>
                      <p className="text-xs">Limited permissions, specific services</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Development Keys</h5>
                      <p>Rotate every 6-12 months</p>
                      <p className="text-xs">Non-production environments</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Emergency Procedures</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-red-800">
                    <li>
                      <strong>Key Compromise:</strong> Immediately revoke the compromised key and rotate all related
                      keys
                    </li>
                    <li>
                      <strong>Lost Access:</strong> Use the master key to create new admin access, then secure the
                      master key
                    </li>
                    <li>
                      <strong>Suspicious Activity:</strong> Review usage logs, revoke suspicious keys, and investigate
                    </li>
                    <li>
                      <strong>System Breach:</strong> Rotate all admin keys and implement additional security measures
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
