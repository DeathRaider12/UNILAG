"use client"

export interface CourseLesson {
  id: string
  title: string
  description: string
  type: "video" | "text" | "quiz" | "assignment"
  content: string
  videoUrl?: string
  duration?: string
  order: number
  isPublished: boolean
  createdAt: string
}

export interface CourseAssignment {
  id: string
  title: string
  description: string
  instructions: string
  dueDate: string
  maxPoints: number
  attachments: string[]
  isPublished: boolean
  createdAt: string
}

export interface CourseResource {
  id: string
  title: string
  description: string
  type: "pdf" | "doc" | "link" | "video"
  url: string
  size?: number
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  instructorName: string
  category: string
  level: string[]
  prerequisites: string[]
  maxStudents: number
  currentStudents: number
  price: number
  duration: string
  language: string
  thumbnail: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  lessons: CourseLesson[]
  assignments: CourseAssignment[]
  resources: CourseResource[]
  enrolledStudents: string[]
}

export interface CourseEnrollment {
  id: string
  courseId: string
  studentId: string
  enrolledAt: string
  progress: number
  completedLessons: string[]
  lastAccessedAt: string
}

class CourseService {
  private static instance: CourseService
  private courses: Course[] = []
  private enrollments: CourseEnrollment[] = []

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService()
    }
    return CourseService.instance
  }

  async createCourse(
    courseData: Omit<
      Course,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "currentStudents"
      | "lessons"
      | "assignments"
      | "resources"
      | "enrolledStudents"
    >,
  ): Promise<{ success: boolean; courseId?: string; error?: string }> {
    try {
      const courseId = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const now = new Date().toISOString()

      const newCourse: Course = {
        ...courseData,
        id: courseId,
        currentStudents: 0,
        createdAt: now,
        updatedAt: now,
        lessons: [],
        assignments: [],
        resources: [],
        enrolledStudents: [],
      }

      this.courses.push(newCourse)
      return { success: true, courseId }
    } catch (error) {
      return { success: false, error: "Failed to create course" }
    }
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<{ success: boolean; error?: string }> {
    try {
      const courseIndex = this.courses.findIndex((c) => c.id === courseId)
      if (courseIndex === -1) {
        return { success: false, error: "Course not found" }
      }

      this.courses[courseIndex] = {
        ...this.courses[courseIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to update course" }
    }
  }

  async addLesson(
    courseId: string,
    lessonData: Omit<CourseLesson, "id" | "createdAt">,
  ): Promise<{ success: boolean; lessonId?: string; error?: string }> {
    try {
      const course = this.courses.find((c) => c.id === courseId)
      if (!course) {
        return { success: false, error: "Course not found" }
      }

      const lessonId = `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newLesson: CourseLesson = {
        ...lessonData,
        id: lessonId,
        createdAt: new Date().toISOString(),
      }

      course.lessons.push(newLesson)
      course.lessons.sort((a, b) => a.order - b.order)
      course.updatedAt = new Date().toISOString()

      return { success: true, lessonId }
    } catch (error) {
      return { success: false, error: "Failed to add lesson" }
    }
  }

  async addAssignment(
    courseId: string,
    assignmentData: Omit<CourseAssignment, "id" | "createdAt">,
  ): Promise<{ success: boolean; assignmentId?: string; error?: string }> {
    try {
      const course = this.courses.find((c) => c.id === courseId)
      if (!course) {
        return { success: false, error: "Course not found" }
      }

      const assignmentId = `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newAssignment: CourseAssignment = {
        ...assignmentData,
        id: assignmentId,
        createdAt: new Date().toISOString(),
      }

      course.assignments.push(newAssignment)
      course.updatedAt = new Date().toISOString()

      return { success: true, assignmentId }
    } catch (error) {
      return { success: false, error: "Failed to add assignment" }
    }
  }

  async addResource(
    courseId: string,
    resourceData: Omit<CourseResource, "id" | "createdAt">,
  ): Promise<{ success: boolean; resourceId?: string; error?: string }> {
    try {
      const course = this.courses.find((c) => c.id === courseId)
      if (!course) {
        return { success: false, error: "Course not found" }
      }

      const resourceId = `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newResource: CourseResource = {
        ...resourceData,
        id: resourceId,
        createdAt: new Date().toISOString(),
      }

      course.resources.push(newResource)
      course.updatedAt = new Date().toISOString()

      return { success: true, resourceId }
    } catch (error) {
      return { success: false, error: "Failed to add resource" }
    }
  }

  async enrollStudent(
    courseId: string,
    studentId: string,
    studentLevel: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const course = this.courses.find((c) => c.id === courseId)
      if (!course) {
        return { success: false, error: "Course not found" }
      }

      // Check level restrictions
      if (!course.level.includes(studentLevel)) {
        return { success: false, error: "You are not eligible to enroll in this course based on your academic level" }
      }

      // Check if already enrolled
      if (course.enrolledStudents.includes(studentId)) {
        return { success: false, error: "Already enrolled in this course" }
      }

      // Check capacity
      if (course.currentStudents >= course.maxStudents) {
        return { success: false, error: "Course is at maximum capacity" }
      }

      // Create enrollment
      const enrollmentId = `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const enrollment: CourseEnrollment = {
        id: enrollmentId,
        courseId,
        studentId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completedLessons: [],
        lastAccessedAt: new Date().toISOString(),
      }

      this.enrollments.push(enrollment)
      course.enrolledStudents.push(studentId)
      course.currentStudents += 1

      return { success: true }
    } catch (error) {
      return { success: false, error: "Failed to enroll in course" }
    }
  }

  getCoursesByInstructor(instructorId: string): Course[] {
    return this.courses.filter((c) => c.instructorId === instructorId)
  }

  getPublishedCourses(): Course[] {
    return this.courses.filter((c) => c.isPublished)
  }

  getCoursesByLevel(level: string): Course[] {
    return this.courses.filter((c) => c.isPublished && c.level.includes(level))
  }

  getCourseById(courseId: string): Course | undefined {
    return this.courses.find((c) => c.id === courseId)
  }

  getStudentEnrollments(studentId: string): CourseEnrollment[] {
    return this.enrollments.filter((e) => e.studentId === studentId)
  }

  getEnrolledCourses(studentId: string): Course[] {
    const enrollments = this.getStudentEnrollments(studentId)
    return enrollments.map((e) => this.getCourseById(e.courseId)).filter(Boolean) as Course[]
  }

  async updateProgress(enrollmentId: string, lessonId: string): Promise<void> {
    const enrollment = this.enrollments.find((e) => e.id === enrollmentId)
    if (enrollment && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId)
      enrollment.lastAccessedAt = new Date().toISOString()

      const course = this.getCourseById(enrollment.courseId)
      if (course) {
        enrollment.progress = (enrollment.completedLessons.length / course.lessons.length) * 100
      }
    }
  }

  getAllCourses(): Course[] {
    return this.courses
  }
}

export const courseService = CourseService.getInstance()
