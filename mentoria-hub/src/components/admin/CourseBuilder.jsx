import { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, HelpCircle, Upload, FileText, Video, Loader2 } from 'lucide-react'
import {
  createCourse,
  updateCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByCourse,
  uploadFile,
  deleteFile,
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
    video_file_url: '',
    attachment_url: '',
    attachment_name: '',
    order: 1,
    has_quiz: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [attachmentUploading, setAttachmentUploading] = useState(false)

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
        is_published: course.is_published === true || course.is_published === 'true' || course.is_published === 'Yes',
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
      video_file_url: '',
      attachment_url: '',
      attachment_name: '',
      order: lessons.length + 1,
      has_quiz: false,
    })
    setShowLessonForm(true)
  }

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson)
    setLessonData({
      ...lesson,
      video_file_url: lesson.video_file_url || '',
      attachment_url: lesson.attachment_url || '',
      attachment_name: lesson.attachment_name || '',
    })
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

  // ==================== Video Upload ====================
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate format
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setError('Формат видео не поддерживается. Используйте MP4, WebM или MOV.')
      return
    }

    // Validate size (50MB limit for free plan)
    if (file.size > 50 * 1024 * 1024) {
      setError('Размер видео не должен превышать 50 МБ')
      return
    }

    try {
      setVideoUploading(true)
      setVideoProgress(10)
      setError('')

      // Simulate progress steps since Supabase doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval)
            return 85
          }
          return prev + 5
        })
      }, 300)

      const url = await uploadFile(file, 'videos')
      clearInterval(progressInterval)
      setVideoProgress(100)

      setLessonData(prev => ({
        ...prev,
        video_file_url: url,
        video_url: '', // Clear old YouTube URL
      }))

      setTimeout(() => setVideoProgress(0), 500)
    } catch (err) {
      setError('Ошибка загрузки видео: ' + err.message)
    } finally {
      setVideoUploading(false)
    }
  }

  const handleRemoveVideo = async () => {
    if (lessonData.video_file_url) {
      await deleteFile(lessonData.video_file_url)
    }
    setLessonData(prev => ({
      ...prev,
      video_file_url: '',
      video_url: '',
    }))
  }

  // ==================== Attachment Upload ====================
  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate format
    const allowedExtensions = ['.pdf', '.docx']
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      setError('Формат файла не поддерживается. Используйте PDF или DOCX.')
      return
    }

    // Validate size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setError('Размер файла не должен превышать 20 МБ')
      return
    }

    try {
      setAttachmentUploading(true)
      setError('')

      const url = await uploadFile(file, 'documents')

      setLessonData(prev => ({
        ...prev,
        attachment_url: url,
        attachment_name: file.name,
      }))
    } catch (err) {
      setError('Ошибка загрузки файла: ' + err.message)
    } finally {
      setAttachmentUploading(false)
    }
  }

  const handleRemoveAttachment = async () => {
    if (lessonData.attachment_url) {
      await deleteFile(lessonData.attachment_url)
    }
    setLessonData(prev => ({
      ...prev,
      attachment_url: '',
      attachment_name: '',
    }))
  }

  // ==================== Image Upload ====================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
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
        savedCourse = await updateCourse(course.id, finalFormData)
      } else {
        savedCourse = await createCourse(finalFormData)
      }

      // Save lessons
      // Fetch existing lessons from database to handle deletions
      const dbLessons = await getLessonsByCourse(savedCourse.id)
      const currentLessonIds = lessons.map(l => l.id).filter(id => typeof id === 'string')

      // Delete lessons that were removed in the UI
      for (const dbLesson of dbLessons) {
        if (!currentLessonIds.includes(dbLesson.id)) {
          await deleteLesson(dbLesson.id)
        }
      }

      // Save or update remaining lessons
      for (const lesson of lessons) {
        const lessonPayload = {
          title: lesson.title,
          description: lesson.description || '',
          content: lesson.content || '',
          video_url: lesson.video_url || '',
          video_file_url: lesson.video_file_url || '',
          attachment_url: lesson.attachment_url || '',
          attachment_name: lesson.attachment_name || '',
          order: lesson.order || 1,
          has_quiz: lesson.has_quiz,
          course_id: savedCourse.id,
        }

        const isNew = typeof lesson.id === 'number' || !lesson.id

        if (isNew) {
          await createLesson(lessonPayload)
        } else {
          await updateLesson(lesson.id, lessonPayload)
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
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900 z-10">
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

                {/* ==================== VIDEO UPLOAD ==================== */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    <Video size={14} className="inline mr-1.5 -mt-0.5" />
                    Видео урока
                  </label>

                  {lessonData.video_file_url ? (
                    <div className="bg-neutral-900 border border-neutral-600 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <Video size={16} />
                          <span>Видео загружено</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Удалить видео
                        </button>
                      </div>
                      <video
                        src={lessonData.video_file_url}
                        controls
                        className="w-full mt-2 rounded max-h-48 bg-black"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                          onChange={handleVideoUpload}
                          disabled={videoUploading}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className={`flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer transition text-sm ${
                            videoUploading
                              ? 'border-primary-500/50 bg-primary-500/5 text-primary-400 cursor-wait'
                              : 'border-neutral-600 bg-neutral-900 text-neutral-400 hover:border-primary-500 hover:text-primary-400'
                          }`}
                        >
                          {videoUploading ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              <span>Загрузка видео... {videoProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Upload size={20} />
                              <span>Загрузить видео (MP4, WebM, MOV — до 50 МБ)</span>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Progress bar */}
                      {videoUploading && (
                        <div className="w-full bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ==================== ATTACHMENT UPLOAD ==================== */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    <FileText size={14} className="inline mr-1.5 -mt-0.5" />
                    Материалы (PDF / DOCX)
                  </label>

                  {lessonData.attachment_url ? (
                    <div className="bg-neutral-900 border border-neutral-600 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <FileText size={16} />
                          <span className="truncate max-w-[300px]">
                            {lessonData.attachment_name || 'Файл загружен'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAttachment}
                          className="text-xs text-red-400 hover:text-red-300 transition flex-shrink-0 ml-2"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleAttachmentUpload}
                        disabled={attachmentUploading}
                        className="hidden"
                        id="attachment-upload"
                      />
                      <label
                        htmlFor="attachment-upload"
                        className={`flex items-center justify-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition text-sm ${
                          attachmentUploading
                            ? 'border-blue-500/50 bg-blue-500/5 text-blue-400 cursor-wait'
                            : 'border-neutral-600 bg-neutral-900 text-neutral-400 hover:border-blue-500 hover:text-blue-400'
                        }`}
                      >
                        {attachmentUploading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Загрузка файла...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={18} />
                            <span>Загрузить PDF или DOCX (до 20 МБ)</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Order + Quiz checkbox */}
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
                    <div className="text-xs text-neutral-400 mt-1 flex flex-wrap gap-2">
                      {lesson.has_quiz && <span>📝 С тестом</span>}
                      {(lesson.video_file_url || lesson.video_url) && <span>🎥 С видео</span>}
                      {lesson.attachment_url && (
                        <span>📎 {lesson.attachment_name || 'Файл'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {lesson.has_quiz && (
                      <button
                        onClick={() => {
                          if (typeof lesson.id === 'number') {
                            alert('Пожалуйста, сначала сохраните курс, чтобы добавить тест к этому уроку.')
                            return
                          }
                          setSelectedLessonForQuiz(lesson)
                          setShowQuizBuilder(true)
                        }}
                        className={`p-1.5 transition ${
                          typeof lesson.id === 'number'
                            ? 'text-neutral-600 cursor-not-allowed'
                            : 'text-neutral-400 hover:text-amber-400'
                        }`}
                        title={
                          typeof lesson.id === 'number'
                            ? 'Сохраните курс перед добавлением теста'
                            : 'Редактировать тесты'
                        }
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