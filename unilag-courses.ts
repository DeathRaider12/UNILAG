export interface Course {
  code: string
  title: string
  faculty: string
  department: string
  levels: string[]
  creditUnits: number
  isNew?: boolean
  addedDate?: string
}

export const UNILAG_COURSES: Course[] = [
  // Faculty of Arts
  {
    code: "ENG101",
    title: "Use of English I",
    faculty: "Arts",
    department: "English",
    levels: ["100"],
    creditUnits: 2,
  },
  {
    code: "ENG102",
    title: "Use of English II",
    faculty: "Arts",
    department: "English",
    levels: ["100"],
    creditUnits: 2,
  },
  {
    code: "ENG201",
    title: "Introduction to Literature",
    faculty: "Arts",
    department: "English",
    levels: ["200"],
    creditUnits: 3,
  },
  {
    code: "HIS101",
    title: "History of Nigeria",
    faculty: "Arts",
    department: "History",
    levels: ["100"],
    creditUnits: 2,
  },
  {
    code: "LIN101",
    title: "Introduction to Linguistics",
    faculty: "Arts",
    department: "Linguistics",
    levels: ["100"],
    creditUnits: 3,
  },

  // Faculty of Science
  {
    code: "MTH101",
    title: "Elementary Mathematics I",
    faculty: "Science",
    department: "Mathematics",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "MTH102",
    title: "Elementary Mathematics II",
    faculty: "Science",
    department: "Mathematics",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "MTH201",
    title: "Mathematical Methods I",
    faculty: "Science",
    department: "Mathematics",
    levels: ["200"],
    creditUnits: 3,
  },
  {
    code: "PHY101",
    title: "General Physics I",
    faculty: "Science",
    department: "Physics",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "PHY102",
    title: "General Physics II",
    faculty: "Science",
    department: "Physics",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "CHM101",
    title: "General Chemistry I",
    faculty: "Science",
    department: "Chemistry",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "CHM102",
    title: "General Chemistry II",
    faculty: "Science",
    department: "Chemistry",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "BIO101",
    title: "General Biology I",
    faculty: "Science",
    department: "Biology",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "CSC101",
    title: "Introduction to Computer Science",
    faculty: "Science",
    department: "Computer Science",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "CSC201",
    title: "Computer Programming I",
    faculty: "Science",
    department: "Computer Science",
    levels: ["200"],
    creditUnits: 3,
  },

  // Faculty of Engineering
  {
    code: "ENG101",
    title: "Engineering Mathematics I",
    faculty: "Engineering",
    department: "General Engineering",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "MEE201",
    title: "Thermodynamics I",
    faculty: "Engineering",
    department: "Mechanical Engineering",
    levels: ["200"],
    creditUnits: 3,
  },
  {
    code: "EEE201",
    title: "Circuit Analysis I",
    faculty: "Engineering",
    department: "Electrical Engineering",
    levels: ["200"],
    creditUnits: 3,
  },
  {
    code: "CVE201",
    title: "Strength of Materials",
    faculty: "Engineering",
    department: "Civil Engineering",
    levels: ["200"],
    creditUnits: 3,
  },

  // Faculty of Social Sciences
  {
    code: "ECO101",
    title: "Principles of Economics I",
    faculty: "Social Sciences",
    department: "Economics",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "ECO102",
    title: "Principles of Economics II",
    faculty: "Social Sciences",
    department: "Economics",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "PSY101",
    title: "Introduction to Psychology",
    faculty: "Social Sciences",
    department: "Psychology",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "SOC101",
    title: "Introduction to Sociology",
    faculty: "Social Sciences",
    department: "Sociology",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "POL101",
    title: "Introduction to Political Science",
    faculty: "Social Sciences",
    department: "Political Science",
    levels: ["100"],
    creditUnits: 3,
  },

  // Faculty of Law
  {
    code: "LAW101",
    title: "Introduction to Nigerian Legal System",
    faculty: "Law",
    department: "Law",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "LAW201",
    title: "Constitutional Law I",
    faculty: "Law",
    department: "Law",
    levels: ["200"],
    creditUnits: 3,
  },

  // Faculty of Medicine
  {
    code: "ANA101",
    title: "Human Anatomy I",
    faculty: "Medicine",
    department: "Anatomy",
    levels: ["100"],
    creditUnits: 4,
  },
  {
    code: "PHY201",
    title: "Human Physiology I",
    faculty: "Medicine",
    department: "Physiology",
    levels: ["200"],
    creditUnits: 4,
  },

  // Faculty of Pharmacy
  {
    code: "PCG101",
    title: "Pharmaceutical Chemistry I",
    faculty: "Pharmacy",
    department: "Pharmaceutical Chemistry",
    levels: ["100"],
    creditUnits: 3,
  },

  // Faculty of Dentistry
  {
    code: "DOS101",
    title: "Oral Biology",
    faculty: "Dentistry",
    department: "Oral Sciences",
    levels: ["100"],
    creditUnits: 3,
  },

  // Faculty of Education
  {
    code: "EDU101",
    title: "Introduction to Education",
    faculty: "Education",
    department: "Education",
    levels: ["100"],
    creditUnits: 2,
  },
  {
    code: "EDU201",
    title: "Psychology of Learning",
    faculty: "Education",
    department: "Education",
    levels: ["200"],
    creditUnits: 3,
  },

  // Faculty of Environmental Sciences
  {
    code: "ARC101",
    title: "Introduction to Architecture",
    faculty: "Environmental Sciences",
    department: "Architecture",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "EST101",
    title: "Building Technology I",
    faculty: "Environmental Sciences",
    department: "Estate Management",
    levels: ["100"],
    creditUnits: 3,
  },

  // Faculty of Management Sciences
  {
    code: "ACC101",
    title: "Principles of Accounting I",
    faculty: "Management Sciences",
    department: "Accounting",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "BUS101",
    title: "Introduction to Business",
    faculty: "Management Sciences",
    department: "Business Administration",
    levels: ["100"],
    creditUnits: 3,
  },
  {
    code: "FIN201",
    title: "Principles of Finance",
    faculty: "Management Sciences",
    department: "Finance",
    levels: ["200"],
    creditUnits: 3,
  },
]

export const NIGERIAN_LEVELS = [
  { value: "100", label: "100 Level (Freshman)" },
  { value: "200", label: "200 Level (Sophomore)" },
  { value: "300", label: "300 Level (Junior)" },
  { value: "400", label: "400 Level (Senior)" },
  { value: "500", label: "500 Level (Final Year - 5 Year Programs)" },
  { value: "600", label: "600 Level (Final Year - 6 Year Programs)" },
]

export const UNILAG_FACULTIES = [
  "Arts",
  "Science",
  "Engineering",
  "Social Sciences",
  "Law",
  "Medicine",
  "Pharmacy",
  "Dentistry",
  "Education",
  "Environmental Sciences",
  "Management Sciences",
]

export function getCoursesByFaculty(faculty: string): Course[] {
  return UNILAG_COURSES.filter((course) => course.faculty === faculty)
}

export function getCoursesByLevel(level: string): Course[] {
  return UNILAG_COURSES.filter((course) => course.levels.includes(level))
}

export function getCoursesByFacultyAndLevel(faculty: string, level: string): Course[] {
  return UNILAG_COURSES.filter((course) => course.faculty === faculty && course.levels.includes(level))
}

export function addNewCourse(course: Course): void {
  const newCourse = {
    ...course,
    isNew: true,
    addedDate: new Date().toISOString(),
  }
  UNILAG_COURSES.push(newCourse)
}

export function getNewCourses(): Course[] {
  return UNILAG_COURSES.filter((course) => course.isNew)
}

export function canInstructorTeachLevel(instructorLevel: string, studentLevel: string): boolean {
  const levels = ["100", "200", "300", "400", "500", "600"]
  const instructorLevelIndex = levels.indexOf(instructorLevel)
  const studentLevelIndex = levels.indexOf(studentLevel)

  // Instructor can teach their level and below
  return instructorLevelIndex >= studentLevelIndex
}
