"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { Film, Edit } from "lucide-react"
import { VideoEditor } from "./video-editor"

interface Lesson {
  id: string
  title: string
  description: string
  videoUrl?: string
  videoTitle?: string
  videoDuration?: number
}

const CourseCreator = () => {
  const [courseTitle, setCourseTitle] = useState("")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDescription, setLessonDescription] = useState("")
  const [showVideoEditor, setShowVideoEditor] = useState(false)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: Math.random().toString(36).substring(7),
      title: lessonTitle,
      description: lessonDescription,
    }
    setLessons([...lessons, newLesson])
    setLessonTitle("")
    setLessonDescription("")
  }

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson)
  }

  const handleUpdateLesson = () => {
    if (currentLesson) {
      const updatedLesson = {
        ...currentLesson,
        title: lessonTitle,
        description: lessonDescription,
      }
      const updatedLessons = lessons.map((lesson) => (lesson.id === currentLesson.id ? updatedLesson : lesson))
      setLessons(updatedLessons)
      setCurrentLesson(updatedLesson)
    }
  }

  const handleDeleteLesson = () => {
    if (currentLesson) {
      const updatedLessons = lessons.filter((lesson) => lesson.id !== currentLesson.id)
      setLessons(updatedLessons)
      setCurrentLesson(null)
    }
  }

  const handleCreateVideo = () => {
    setEditingVideoId(null)
    setShowVideoEditor(true)
  }

  const handleEditVideo = (videoId: string) => {
    setEditingVideoId(videoId)
    setShowVideoEditor(true)
  }

  const handleVideoSave = (project: any) => {
    // Save video to lesson
    const videoUrl = `/videos/${project.id}.mp4`

    if (currentLesson) {
      const updatedLesson = {
        ...currentLesson,
        videoUrl,
        videoTitle: project.name,
        videoDuration: project.duration,
      }

      const updatedLessons = lessons.map((lesson) => (lesson.id === currentLesson.id ? updatedLesson : lesson))

      setLessons(updatedLessons)
      setCurrentLesson(updatedLesson)
    }

    setShowVideoEditor(false)
    setEditingVideoId(null)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Course Creator</h1>
      <div className="mb-4">
        <Label htmlFor="courseTitle">Course Title</Label>
        <Input type="text" id="courseTitle" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Lesson List */}
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Lessons</h2>
          <ul>
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className={`p-2 rounded cursor-pointer ${currentLesson?.id === lesson.id ? "bg-gray-200" : ""}`}
                onClick={() => handleLessonClick(lesson)}
              >
                {lesson.title}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Lesson Title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
            />
            <Textarea
              placeholder="Lesson Description"
              className="mt-2"
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
            />
            <Button className="mt-2" onClick={handleAddLesson}>
              Add Lesson
            </Button>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="col-span-2">
          {currentLesson ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">{currentLesson.title}</h2>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={lessonDescription} onChange={(e) => setLessonDescription(e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Video Content</Label>
                  <div className="flex space-x-2">
                    <Button type="button" size="sm" variant="outline" onClick={handleCreateVideo}>
                      <Film className="h-4 w-4 mr-2" />
                      Create Video
                    </Button>
                    {currentLesson?.videoUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditVideo(currentLesson.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Video
                      </Button>
                    )}
                  </div>
                </div>

                {/* Existing video upload area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload video file or create one using our video editor</p>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Button onClick={handleUpdateLesson}>Update Lesson</Button>
                <Button variant="destructive" onClick={handleDeleteLesson}>
                  Delete Lesson
                </Button>
              </div>
            </div>
          ) : (
            <p>Select a lesson to view its content.</p>
          )}
        </div>
      </div>

      {/* Video Editor Modal */}
      {showVideoEditor && (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoEditor projectId={editingVideoId} onSave={handleVideoSave} onClose={() => setShowVideoEditor(false)} />
        </div>
      )}
    </div>
  )
}

export default CourseCreator
