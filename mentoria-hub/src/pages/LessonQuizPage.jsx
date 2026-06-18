import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { getQuizzesByLesson, saveQuizResult } from '@/lib/database'
import { useAuth } from '@/context/AuthContext'

export default function LessonQuizPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuizzes()
  }, [lessonId])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const data = await getQuizzesByLesson(lessonId)
      
      if (data.length === 0) {
        setError('Нет вопросов для этого урока')
      } else {
        setQuizzes(data)
        // Initialize answers object
        const initialAnswers = {}
        data.forEach(quiz => {
          initialAnswers[quiz.id] = null
        })
        setAnswers(initialAnswers)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (quizId, answerIndex) => {
    setAnswers({
      ...answers,
      [quizId]: answerIndex,
    })
  }

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    quizzes.forEach(quiz => {
      if (answers[quiz.id] === quiz.correct_answer_index) {
        correct++
      }
    })
    return {
      correct,
      total: quizzes.length,
      percentage: Math.round((correct / quizzes.length) * 100),
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const score = calculateScore()

      // Save result
      if (user) {
        await saveQuizResult({
          user_id: user.id,
          lesson_id: lessonId,
          score: score.percentage,
          correct_answers: score.correct,
          total_questions: score.total,
          answers_json: JSON.stringify(answers),
        })
      }

      setShowResults(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center text-neutral-500">Загрузка квиза...</div>
      </div>
    )
  }

  if (error || quizzes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} />
          Вернуться к уроку
        </button>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || 'Квиз не найден'}
        </div>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const passed = score.percentage >= 70

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="mb-6">
            {passed ? (
              <CheckCircle2 size={80} className="mx-auto text-green-600 mb-4" />
            ) : (
              <XCircle size={80} className="mx-auto text-red-600 mb-4" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            {passed ? '🎉 Отлично!' : 'Попробуйте еще раз'}
          </h2>

          <div className="mb-8">
            <p className="text-5xl font-bold text-primary-600 mb-2">{score.percentage}%</p>
            <p className="text-xl text-neutral-600">
              Вы ответили правильно на {score.correct} из {score.total} вопросов
            </p>
          </div>

          {!passed && (
            <p className="text-neutral-500 mb-8">
              Нужно набрать минимум 70% для завершения квиза. Попробуйте еще раз!
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCurrentQuizIndex(0)
                setShowResults(false)
                const initialAnswers = {}
                quizzes.forEach(quiz => {
                  initialAnswers[quiz.id] = null
                })
                setAnswers(initialAnswers)
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Пройти еще раз
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition font-medium"
            >
              Вернуться к уроку
            </button>
          </div>

          {/* Detailed Results */}
          <div className="mt-12 text-left">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Результаты по вопросам:</h3>
            <div className="space-y-4">
              {quizzes.map((quiz, index) => {
                const isCorrect = answers[quiz.id] === quiz.correct_answer_index
                const selectedAnswer = answers[quiz.id]

                return (
                  <div
                    key={quiz.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">Вопрос {index + 1}: {quiz.question}</p>
                        {!isCorrect && selectedAnswer !== null && (
                          <p className="text-sm text-neutral-600 mt-1">
                            Ваш ответ: {quiz.options[selectedAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-neutral-600">
                          Правильный ответ: {quiz.options[quiz.correct_answer_index]}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuiz = quizzes[currentQuizIndex]
  const answeredCount = Object.values(answers).filter(a => a !== null).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft size={20} />
        Вернуться к уроку
      </button>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-neutral-900">
            Вопрос {currentQuizIndex + 1} из {quizzes.length}
          </h2>
          <span className="text-sm text-neutral-500">
            Ответлено: {answeredCount}/{quizzes.length}
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz Question */}
      <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-8">
        <h3 className="text-2xl font-semibold text-neutral-900 mb-6">{currentQuiz.question}</h3>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuiz.options && currentQuiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuiz.id, index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                answers[currentQuiz.id] === index
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuiz.id] === index
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-neutral-300'
                  }`}
                >
                  {answers[currentQuiz.id] === index && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-medium text-neutral-900">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {currentQuiz.explanation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-neutral-700">
            <p className="font-medium text-blue-900 mb-1">Объяснение:</p>
            <p>{currentQuiz.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuizIndex === 0}
          className="px-6 py-3 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Предыдущий
        </button>

        <div className="flex gap-4">
          {currentQuizIndex < quizzes.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Следующий
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < quizzes.length}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Загрузка...' : 'Отправить результаты'}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
        <p className="text-sm font-medium text-neutral-700 mb-3">Быстрая навигация по вопросам:</p>
        <div className="flex flex-wrap gap-2">
          {quizzes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuizIndex(index)}
              className={`w-10 h-10 rounded-lg font-medium transition ${
                currentQuizIndex === index
                  ? 'bg-primary-600 text-white'
                  : answers[quizzes[index].id] !== null
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
