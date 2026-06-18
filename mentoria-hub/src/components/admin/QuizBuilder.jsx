import { useState } from 'react'
import { X, Plus, Edit2, Trash2 } from 'lucide-react'
import { createQuiz, updateQuiz, deleteQuiz } from '@/lib/database'

export default function QuizBuilder({ lesson, onClose, onSave }) {
  const [quizzes, setQuizzes] = useState(lesson?.quizzes || [])
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer_index: 0,
    explanation: '',
    order: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) : value,
    })
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({
      ...formData,
      options: newOptions,
    })
  }

  const handleAddQuiz = () => {
    setEditingQuiz(null)
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correct_answer_index: 0,
      explanation: '',
      order: quizzes.length + 1,
    })
    setShowForm(true)
  }

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz)
    setFormData({
      question: quiz.question,
      options: quiz.options || ['', '', '', ''],
      correct_answer_index: quiz.correct_answer_index || 0,
      explanation: quiz.explanation || '',
      order: quiz.order || 1,
    })
    setShowForm(true)
  }

  const handleSaveQuiz = () => {
    // Validate
    if (!formData.question.trim()) {
      setError('Вопрос обязателен')
      return
    }

    if (formData.options.some(opt => !opt.trim())) {
      setError('Все варианты ответов должны быть заполнены')
      return
    }

    if (editingQuiz) {
      setQuizzes(
        quizzes.map(q =>
          q.id === editingQuiz.id
            ? { ...formData, id: editingQuiz.id }
            : q
        )
      )
    } else {
      setQuizzes([
        ...quizzes,
        { ...formData, id: Date.now() },
      ])
    }

    setShowForm(false)
    setError('')
  }

  const handleDeleteQuiz = (id) => {
    setQuizzes(quizzes.filter(q => q.id !== id))
  }

  const handleSaveAll = async () => {
    try {
      setLoading(true)
      
      // Save or update quizzes
      for (const quiz of quizzes) {
        const quizData = {
          ...quiz,
          lesson_id: lesson.id,
          id: undefined,
        }

        if (quiz.id && typeof quiz.id !== 'number') {
          // Existing quiz
          await updateQuiz(quiz.id, quizData)
        } else {
          // New quiz
          await createQuiz(quizData)
        }
      }

      onSave && onSave()
      onClose()
    } catch (err) {
      setError(err.message)
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
            Тесты для урока: {lesson.title}
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Вопросы ({quizzes.length})</h3>
            <button
              onClick={handleAddQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
            >
              <Plus size={16} />
              Добавить вопрос
            </button>
          </div>

          {showForm && (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Вопрос
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Введите вопрос"
                  rows="2"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Варианты ответов
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={formData.correct_answer_index === idx}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            correct_answer_index: idx,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Вариант ${idx + 1}`}
                        className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Объяснение (опционально)
                </label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  placeholder="Объяснение для правильного ответа"
                  rows="2"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Порядок
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600 transition text-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveQuiz}
                  className="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition text-sm"
                >
                  {editingQuiz ? 'Обновить' : 'Добавить'} вопрос
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {quizzes.map((quiz, idx) => (
              <div
                key={quiz.id}
                className="flex items-start justify-between bg-neutral-800 p-4 rounded-lg border border-neutral-700"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    Вопрос {idx + 1}: {quiz.question}
                  </div>
                  <div className="text-xs text-neutral-400 mt-2">
                    <p>Правильный ответ: {quiz.options[quiz.correct_answer_index]}</p>
                    {quiz.explanation && (
                      <p className="mt-1">Объяснение: {quiz.explanation}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditQuiz(quiz)}
                    className="p-1.5 text-neutral-400 hover:text-primary-400 transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
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
            onClick={handleSaveAll}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Сохранить все'}
          </button>
        </div>
      </div>
    </div>
  )
}
