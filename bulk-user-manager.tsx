"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Download, Users, FileText, CheckCircle, AlertCircle, Loader2, Trash2, Edit } from "lucide-react"
import { bulkUserService, type BulkImportResult } from "@/lib/bulk-user-service"
import { authService } from "@/lib/auth"

export function BulkUserManager() {
  const [activeTab, setActiveTab] = useState("import")
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const [csvContent, setCsvContent] = useState("")
  const [showSampleDialog, setShowSampleDialog] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const users = authService.getAllUsers().filter((u) => u.role !== "admin")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCsvContent(content)
      }
      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!csvContent.trim()) {
      return
    }

    setIsLoading(true)
    setImportResult(null)

    try {
      const result = await bulkUserService.importUsersFromCSV(csvContent)
      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: ["An unexpected error occurred during import"],
        duplicates: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    const csvData = bulkUserService.exportUsersToCSV()
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `uniag-users-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u) => u.id))
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = bulkUserService.generateSampleCSV()
    const blob = new Blob([sampleData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-users.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk User Management</h2>
          <p className="text-gray-600">Import, export, and manage multiple users efficiently</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Users
          </Button>
          <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Sample CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sample CSV Format</DialogTitle>
                <DialogDescription>Use this format when creating your CSV file for bulk import</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {`firstName,lastName,email,studentId,level,major,gpa,role
John,Doe,john.doe@student.unilag.edu.ng,190401001,200,Computer Science,4.25,student
Jane,Smith,jane.smith@student.unilag.edu.ng,190401002,300,Mathematics,4.50,instructor
Mike,Johnson,mike.johnson@student.unilag.edu.ng,190401003,100,Physics,3.80,student`}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Required Fields:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>firstName, lastName:</strong> User's full name
                    </li>
                    <li>
                      • <strong>email:</strong> UNILAG email address
                    </li>
                    <li>
                      • <strong>studentId:</strong> Student ID/Matric number
                    </li>
                    <li>
                      • <strong>level:</strong> Academic level (100, 200, 300, 400, 500, 600)
                    </li>
                    <li>
                      • <strong>major:</strong> Department/Major
                    </li>
                    <li>
                      • <strong>gpa:</strong> Current CGPA (0.0 - 5.0)
                    </li>
                    <li>
                      • <strong>role:</strong> student or instructor (optional, defaults to student)
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSampleDialog(false)}>
                  Close
                </Button>
                <Button onClick={downloadSampleCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Sample
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">Import Users</TabsTrigger>
          <TabsTrigger value="manage">Manage Users</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Import Users from CSV</span>
              </CardTitle>
              <CardDescription>
                Upload a CSV file to add multiple users at once. Users will receive temporary passwords via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvFile">CSV File</Label>
                <Input id="csvFile" type="file" accept=".csv" onChange={handleFileUpload} disabled={isLoading} />
              </div>

              {csvContent && (
                <div className="space-y-2">
                  <Label>CSV Preview</Label>
                  <Textarea
                    value={csvContent.split("\n").slice(0, 5).join("\n")}
                    readOnly
                    rows={5}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600">
                    Showing first 5 lines. Total lines: {csvContent.split("\n").length}
                  </p>
                </div>
              )}

              <Button onClick={handleImport} disabled={!csvContent || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing Users...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Users
                  </>
                )}
              </Button>

              {importResult && (
                <div className="space-y-4">
                  <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {importResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={importResult.success ? "text-green-800" : "text-red-800"}>
                      Import completed: {importResult.imported} users imported, {importResult.failed} failed
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                        <div className="text-sm text-gray-600">Imported</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                        <div className="text-sm text-gray-600">Failed</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{importResult.duplicates.length}</div>
                        <div className="text-sm text-gray-600">Duplicates</div>
                      </CardContent>
                    </Card>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <Label>Import Errors</Label>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-800 mb-1">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {importResult.duplicates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Duplicate Emails</Label>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {importResult.duplicates.map((email, index) => (
                            <Badge key={index} variant="outline" className="text-orange-700">
                              {email}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedUsers.length === users.length ? "Deselect All" : "Select All"}
                  </Button>
                  {selectedUsers.length > 0 && (
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Bulk Edit ({selectedUsers.length})
                    </Button>
                  )}
                </div>
              </CardTitle>
              <CardDescription>Manage individual users or perform bulk operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelection(user.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.level} Level</TableCell>
                        <TableCell>{user.major}</TableCell>
                        <TableCell>{user.gpa}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "instructor" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isVerified ? "default" : "secondary"}>
                            {user.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export User Data</span>
              </CardTitle>
              <CardDescription>Export user data in various formats for backup or analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">CSV Export</h4>
                        <p className="text-sm text-gray-600">Export all user data as CSV</p>
                      </div>
                    </div>
                    <Button onClick={handleExport} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-medium">Statistics Report</h4>
                        <p className="text-sm text-gray-600">Generate user statistics</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Export Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-blue-600">{users.length}</div>
                    <div className="text-gray-600">Total Users</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-600">
                      {users.filter((u) => u.role === "instructor").length}
                    </div>
                    <div className="text-gray-600">Instructors</div>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600">
                      {users.filter((u) => u.role === "student").length}
                    </div>
                    <div className="text-gray-600">Students</div>
                  </div>
                  <div>
                    <div className="font-semibold text-orange-600">{users.filter((u) => u.isVerified).length}</div>
                    <div className="text-gray-600">Verified</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
