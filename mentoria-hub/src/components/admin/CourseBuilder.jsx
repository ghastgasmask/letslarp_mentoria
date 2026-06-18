import { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, HelpCircle } from 'lucide-react'
import {
  createCourse,
  updateCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse,
} from '@/lib/database'
import QuizBuilder from './QuizBuilder'

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const CATEGORIES = ['Mathematics', 'English', 'Physics', 'Biology', 'Economics', 'Programming', 'Preparation']
const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Biology', 'Economics', 'Programming', 'SAT/IELTS Prep', 'University Prep', 'General']

export default function CourseBuilder({ course = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    category: 'Mathematics',
    subject: 'General',
    duration_hours: 10,
    image_url: '',
    is_published: false,
  })

  const [lessons, setLessons] = useState([])
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [showQuizBuilder, setShowQuizBuilder] = useState(false)
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null)
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    order: 1,
    has_quiz: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        level: course.level,
        category: course.category,
        subject: course.subject || 'General',
        duration_hours: course.duration_hours,
        image_url: course.image_url || '',
        is_published: course.is_published,
      })
      loadLessons(course.id)
    }
  }, [course])

  const loadLessons = async (courseId) => {
    try {
      const data = await getLessonsByCourse(courseId)
      setLessons(data)
    } catch (err) {
      setError('Ошибка загрузки уроков')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleLessonInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setLessonData({
      ...lessonData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleAddLesson = () => {
    setEditingLesson(null)
    setLessonData({
      title: '',
      description: '',
      content: '',
      video_url: '',
      order: lessons.length + 1,
      has_quiz: false,
    })
    setShowLessonForm(true)
  }

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson)
    setLessonData(lesson)
    setShowLessonForm(true)
  }

  const handleSaveLesson = () => {
    if (!lessonData.title.trim()) {
      setError('Название урока обязательно')
      return
    }

    if (editingLesson) {
      setLessons(
        lessons.map((l) => (l.id === editingLesson.id ? { ...lessonData } : l))
      )
    } else {
      setLessons([...lessons, { ...lessonData, id: Date.now() }])
    }

    setShowLessonForm(false)
    setError('')
  }

  const handleDeleteLesson = (id) => {
    setLessons(lessons.filter((l) => l.id !== id))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { uploadFile } = await import('@/lib/database')
        const url = await uploadFile(file, 'courses')
        setFormData({ ...formData, image_url: url })
      } catch (err) {
        setError('Ошибка загрузки изображения: ' + err.message)
      }
    }
  }

  const handleSaveCourse = async () => {
    if (loading) return; 
  
    if (!formData.title.trim()) {
      setError('Название курса обязательно')
      return
    }
  
    // Авто-маппинг предмета в категорию, чтобы база не ругалась
    const subjectToCategory = {
      'Mathematics': 'Mathematics',
      'Physics': 'Physics',
      'Biology': 'Biology',
      'Programming': 'Programming',
      'Economics': 'Economics',
      'English': 'English',
      'SAT/IELTS Prep': 'SAT/IELTS Prep',
      'University Prep': 'University Prep',
      'General': 'General'
    }
  
    const finalFormData = {
      ...formData,
      category: subjectToCategory[formData.subject] || 'General'
    }
  
    try {
      setLoading(true)
      setError('')
  
      let savedCourse
      if (course) {
        savedCourse = await updateCourse(course.id, finalFormData) // отправляем finalFormData
      } else {
        savedCourse = await createCourse(finalFormData) // отправляем finalFormData
      }

      // Save lessons
      for (const lesson of lessons) {
        if (!lesson.id || typeof lesson.id === 'number') {
          // New lesson
          await createLesson({
            ...lesson,
            course_id: savedCourse.id,
            id: undefined,
          })
        } else if (lesson.updated_at) {
          // Existing lesson
          await updateLesson(lesson.id, lesson)
        } else {
          // Just created locally
          await createLesson({
            ...lesson,
            course_id: savedCourse.id,
            id: undefined,
          })
        }
      }

      onSave && onSave(savedCourse)
      onClose()
    } catch (err) {
      setError(err.message || 'Ошибка сохранения курса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-neutral-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900">
          <h2 className="text-2xl font-bold text-white">
            {course ? 'Редактировать курс' : 'Создать новый курс'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Основная информация</h3>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Название курса
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Английский для академического успеха"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Описание курса"
                rows="3"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Сложность
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Предмет
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  {SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Длительность (часов)
                </label>
                <input
                  type="number"
                  name="duration_hours"
                  value={formData.duration_hours}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Изображение курса
              </label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  {formData.image_url && (
                    <div className="mb-3 flex gap-2 items-start">
                      <img 
                        src={formData.image_url} 
                        alt="preview" 
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-neutral-400 truncate">{formData.image_url}</p>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="text-xs text-red-400 hover:text-red-300 mt-1"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
              />
              <label htmlFor="is_published" className="text-sm text-neutral-300">
                Опубликовать курс
              </label>
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Уроки ({lessons.length})</h3>
              <button
                onClick={handleAddLesson}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
              >
                <Plus size={16} />
                Добавить урок
              </button>
            </div>

            {showLessonForm && (
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Название урока
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={lessonData.title}
                    onChange={handleLessonInputChange}
                    placeholder="Введение в основы"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={lessonData.description}
                    onChange={handleLessonInputChange}
                    placeholder="Описание урока"
                    rows="2"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Содержание
                  </label>
                  <textarea
                    name="content"
                    value={lessonData.content}
                    onChange={handleLessonInputChange}
                    placeholder="Основной текст урока"
                    rows="3"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    URL видео
                  </label>
                  <input
                    type="url"
                    name="video_url"
                    value={lessonData.video_url}
                    onChange={handleLessonInputChange}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Порядок
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={lessonData.order}
                      onChange={handleLessonInputChange}
                      min="1"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-primary-500 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-neutral-300">
                      <input
                        type="checkbox"
                        name="has_quiz"
                        checked={lessonData.has_quiz}
                        onChange={handleLessonInputChange}
                        className="w-3 h-3 rounded"
                      />
                      С тестом
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowLessonForm(false)}
                    className="px-3 py-2 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition text-sm"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveLesson}
                    className="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition text-sm"
                  >
                    Сохранить урок
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg border border-neutral-700"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      {idx + 1}. {lesson.title}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {lesson.has_quiz && '📝 С тестом'}
                      {lesson.video_url && ' 🎥 С видео'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {lesson.has_quiz && (
                      <button
                        onClick={() => {
                          setSelectedLessonForQuiz(lesson)
                          setShowQuizBuilder(true)
                        }}
                        className="p-1.5 text-neutral-400 hover:text-amber-400 transition" title="Редактировать тесты"
                      >
                        <HelpCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditLesson(lesson)}
                      className="p-1.5 text-neutral-400 hover:text-primary-400 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 justify-end p-6 border-t border-neutral-800 bg-neutral-900">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSaveCourse}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Сохранить курс'}
          </button>
        </div>
      </div>
      
      {/* Quiz Builder Modal */}
      {showQuizBuilder && selectedLessonForQuiz && (
        <QuizBuilder
          lesson={selectedLessonForQuiz}
          onClose={() => {
            setShowQuizBuilder(false)
            setSelectedLessonForQuiz(null)
          }}
          onSave={() => {
            setShowQuizBuilder(false)
            setSelectedLessonForQuiz(null)
          }}
        />
      )}
    </div>
  )
}