import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Play, Download, FileText } from 'lucide-react'
import { getCourseById, getLessonsByCourse, getCourseProgress, updateCourseProgress } from '@/lib/database'
import { useAuth } from '@/context/AuthContext'

export default function CourseLessonsPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completedLessons, setCompletedLessons] = useState({})

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  useEffect(() => {
    if (user && courseId) {
      loadProgress()
    }
  }, [user, courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      const courseData = await getCourseById(courseId)
      setCourse(courseData)

      const lessonsData = await getLessonsByCourse(courseId)
      setLessons(lessonsData)

      if (lessonsData.length > 0) {
        setSelectedLesson(lessonsData[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    try {
      const progressData = await getCourseProgress(user.id, courseId)
      if (progressData) {
        const completedMap = {}
        const ids = progressData.completed_lesson_ids || []
        ids.forEach(id => {
          completedMap[id] = true
        })
        setCompletedLessons(completedMap)
      }
    } catch (err) {
      console.error('Ошибка загрузки прогресса:', err)
    }
  }

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson)
  }

  const handleLessonComplete = async (lessonId) => {
    const updatedCompleted = {
      ...completedLessons,
      [lessonId]: !completedLessons[lessonId],
    }
    setCompletedLessons(updatedCompleted)

    if (user) {
      const completedIds = Object.keys(updatedCompleted).filter(id => updatedCompleted[id])
      const totalLessons = lessons.length
      const completedCount = completedIds.length
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
      const isCompleted = percentage === 100

      try {
        await updateCourseProgress(user.id, courseId, {
          completed_lesson_ids: completedIds,
          completed_lessons: completedCount,
          progress_percentage: percentage,
          is_completed: isCompleted,
        })
      } catch (err) {
        console.error('Ошибка сохранения прогресса курса:', err)
      }
    }
  }

  const handleQuizStart = (lesson) => {
    if (lesson.has_quiz) {
      navigate(`/lesson/${lesson.id}/quiz`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-neutral-500">Загрузка курса...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Ошибка: {error}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-neutral-500">Курс не найден</div>
      </div>
    )
  }

  const totalLessons = lessons.length
  const completedCount = Object.values(completedLessons).filter(Boolean).length
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // Helper: determine which video source to use
  const getVideoContent = (lesson) => {
    // Priority 1: uploaded video file
    if (lesson.video_file_url) {
      return (
        <video
          key={lesson.video_file_url}
          controls
          className="w-full h-full object-contain bg-black"
          preload="metadata"
        >
          <source src={lesson.video_file_url} type="video/mp4" />
          <source src={lesson.video_file_url} type="video/webm" />
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      )
    }

    // Priority 2: YouTube or external URL (legacy support)
    if (lesson.video_url) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={lesson.video_url}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    // No video
    return (
      <div className="flex flex-col items-center justify-center text-neutral-400">
        <BookOpen size={48} className="mb-2" />
        <p className="text-sm">Нет видео для этого урока</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/courses')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-neutral-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">{course.title}</h1>
          <p className="text-neutral-500">{course.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 p-4 bg-neutral-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">Прогресс курса</span>
          <span className="text-sm font-semibold text-neutral-900">{progress}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-500">
          <span>{completedCount} из {totalLessons} уроков завершено</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lessons List */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-neutral-50 rounded-lg p-4">
            <h2 className="font-semibold text-neutral-900 mb-4">Уроки</h2>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedLesson?.id === lesson.id
                      ? 'bg-primary-100 border border-primary-300'
                      : 'hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedLessons[lesson.id] ? (
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle size={20} className="text-neutral-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Урок {lesson.order}</p>
                      <p className="text-xs text-neutral-500 line-clamp-1">{lesson.title}</p>
                      {/* Lesson meta icons */}
                      <div className="flex gap-1.5 mt-1">
                        {(lesson.video_file_url || lesson.video_url) && (
                          <span className="text-[10px] text-neutral-400">🎥</span>
                        )}
                        {lesson.has_quiz && (
                          <span className="text-[10px] text-neutral-400">📝</span>
                        )}
                        {lesson.attachment_url && (
                          <span className="text-[10px] text-neutral-400">📎</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-3">
          {selectedLesson ? (
            <div className="bg-white rounded-xl border border-neutral-200">
              {/* Video/Media Section */}
              <div className="bg-neutral-900 rounded-t-xl aspect-video flex items-center justify-center relative overflow-hidden">
                {getVideoContent(selectedLesson)}
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{selectedLesson.title}</h2>
                  <p className="text-neutral-500">{selectedLesson.description}</p>
                </div>

                {/* Lesson Content */}
                {selectedLesson.content && (
                  <div className="mb-8 prose prose-sm max-w-none">
                    <div className="bg-neutral-50 p-4 rounded-lg text-neutral-700 whitespace-pre-wrap">
                      {selectedLesson.content}
                    </div>
                  </div>
                )}

                {/* Attachment Download */}
                {selectedLesson.attachment_url && (
                  <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {selectedLesson.attachment_name || 'Учебный материал'}
                          </p>
                          <p className="text-xs text-neutral-500">PDF / DOCX</p>
                        </div>
                      </div>
                      <a
                        href={selectedLesson.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={selectedLesson.attachment_name || 'material'}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        <Download size={16} />
                        Скачать
                      </a>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                  <button
                    onClick={() => handleLessonComplete(selectedLesson.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      completedLessons[selectedLesson.id]
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {completedLessons[selectedLesson.id] ? '✓ Завершено' : 'Отметить как завершено'}
                  </button>

                  {selectedLesson.has_quiz && (
                    <button
                      onClick={() => handleQuizStart(selectedLesson)}
                      className="px-6 py-3 rounded-lg font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition flex items-center gap-2"
                    >
                      <Play size={18} />
                      Пройти квиз
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-xl p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-500">Выберите урок из списка слева</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
