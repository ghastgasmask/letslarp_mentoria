import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, Languages, Atom, GraduationCap, Code, TrendingUp, BookOpen } from 'lucide-react'
import { getCourses, getLessonsByCourse } from '@/lib/database'

// Icon mapping for categories
const CATEGORY_ICONS = {
  'Mathematics': Calculator,
  'English': Languages,
  'Physics': Atom,
  'Biology': BookOpen,
  'Economics': TrendingUp,
  'Programming': Code,
  'SAT/IELTS Prep': GraduationCap,
  'University Prep': GraduationCap,
  'General': BookOpen,
}

const ACCENT_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-green-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-cyan-500',
]

const LEVEL_COLORS = {
  'Beginner': 'bg-green-100 text-green-700',
  'Intermediate': 'bg-amber-100 text-amber-700',
  'Advanced': 'bg-red-100 text-red-700',
}

export default function CoursesPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [courseStats, setCourseStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await getCourses()
      
      // Filter only published courses
      const publishedCourses = data.filter(c => c.is_published)
      setCourses(publishedCourses)

      // Load lesson stats for each course
      const stats = {}
      for (const course of publishedCourses) {
        const lessons = await getLessonsByCourse(course.id)
        stats[course.id] = lessons.length
      }
      setCourseStats(stats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getIconForCategory = (category) => {
    return CATEGORY_ICONS[category] || BookOpen
  }

  const getAccentColor = (index) => {
    return ACCENT_COLORS[index % ACCENT_COLORS.length]
  }

  const getLevelColor = (level) => {
    return LEVEL_COLORS[level] || 'bg-blue-100 text-blue-700'
  }

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-neutral-500">Загрузка курсов...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Курсы</h1>
        <p className="text-neutral-500 text-lg">Учись в своём темпе — от математики до подготовки к SAT</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="text-neutral-500 text-lg mb-4">📚 Нет доступных курсов</div>
          <p className="text-neutral-600 text-sm">Курсы появятся здесь, когда они будут опубликованы администратором</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => {
            const Icon = getIconForCategory(course.category || course.subject)
            const accentColor = getAccentColor(index)
            const levelColor = getLevelColor(course.level)
            const lessonCount = courseStats[course.id] || 0

            return (
              <div key={course.id} className="card flex flex-col overflow-hidden group cursor-pointer" onClick={() => handleCourseClick(course.id)}>
                {/* Top accent bar */}
                <div className={`h-1.5 w-full ${accentColor}`} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Icon + Subject */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-neutral-100 group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={22} className="text-neutral-700" />
                    </div>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {course.category || course.subject || 'General'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-neutral-900 mb-2 leading-snug">{course.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-neutral-500 mb-4 leading-relaxed line-clamp-2">{course.description}</p>

                  {/* Level + Lessons */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`badge ${levelColor}`}>{course.level}</span>
                    <span className="text-xs text-neutral-400">{lessonCount} уроков</span>
                  </div>

                  {/* Progress */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                      <span>Прогресс</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '0%' }} />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCourseClick(course.id)
                      }}
                      className="w-full btn-primary text-sm py-2.5"
                    >
                      Перейти к курсу
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}