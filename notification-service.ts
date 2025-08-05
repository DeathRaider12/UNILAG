"use client"

export interface Notification {
  id: string
  userId: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.notifications))
  }

  async createNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    }

    this.notifications.unshift(newNotification)
    this.notify()

    // In production, save to database and send push notifications
    console.log("Notification created:", newNotification)
  }

  getUserNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId)
  }

  getUnreadCount(userId: string): number {
    return this.notifications.filter((n) => n.userId === userId && !n.isRead).length
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      this.notify()
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    this.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true))
    this.notify()
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter((n) => n.id !== notificationId)
    this.notify()
  }

  // Predefined notification templates
  async notifyInstructorApproval(userId: string, approved: boolean): Promise<void> {
    await this.createNotification({
      userId,
      type: approved ? "success" : "error",
      title: approved ? "Instructor Application Approved!" : "Instructor Application Rejected",
      message: approved
        ? "Congratulations! Your instructor application has been approved. You can now create and manage courses."
        : "Your instructor application has been rejected. Please contact support for more information.",
      actionUrl: approved ? "/dashboard?tab=teaching" : "/contact",
      actionText: approved ? "Start Teaching" : "Contact Support",
    })
  }

  async notifyCourseEnrollment(userId: string, courseName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: "success",
      title: "Course Enrollment Successful",
      message: `You have successfully enrolled in "${courseName}". Start learning now!`,
      actionUrl: "/dashboard?tab=courses",
      actionText: "View Course",
    })
  }

  async notifyNewAssignment(userId: string, courseName: string, assignmentTitle: string): Promise<void> {
    await this.createNotification({
      userId,
      type: "info",
      title: "New Assignment Available",
      message: `A new assignment "${assignmentTitle}" has been posted in ${courseName}.`,
      actionUrl: "/dashboard?tab=courses",
      actionText: "View Assignment",
    })
  }

  async notifySystemUpdate(userId: string, updateMessage: string): Promise<void> {
    await this.createNotification({
      userId,
      type: "info",
      title: "System Update",
      message: updateMessage,
    })
  }
}

export const notificationService = NotificationService.getInstance()
