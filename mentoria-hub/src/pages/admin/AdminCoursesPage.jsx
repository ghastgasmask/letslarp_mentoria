import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import CourseBuilder from '@/components/admin/CourseBuilder'
import { getCourses, deleteCourse } from '@/lib/database'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCourse(null)
    setShowBuilder(true)
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setShowBuilder(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены?')) return

    try {
      setDeleting(id)
      await deleteCourse(id)
      await loadCourses()
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async () => {
    await loadCourses()
    setShowBuilder(false)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-neutral-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Курсы</h1>
          <p className="text-neutral-400">Создание и модерация учебных курсов</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
        >
          <Plus size={20} />
          Создать курс
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <div className="text-neutral-500 text-lg mb-4">📚 Нет курсов</div>
          <p className="text-neutral-600 text-sm mb-6">
            Начните создавать курсы, нажав кнопку выше
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            <Plus size={16} />
            Создать первый курс
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                    {course.is_published ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                        Опубликован
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full font-medium">
                        Черновик
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-400 text-sm mb-3">{course.description}</p>
                  <div className="flex gap-4 text-sm text-neutral-500">
                    <span>📚 {course.duration_hours} часов</span>
                    <span>📊 {course.level}</span>
                    <span>🏷️ {course.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2.5 text-neutral-400 hover:text-primary-400 hover:bg-neutral-800 rounded-lg transition"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    disabled={deleting === course.id}
                    className="p-2.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBuilder && (
        <CourseBuilder
          course={editingCourse}
          onClose={() => setShowBuilder(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}