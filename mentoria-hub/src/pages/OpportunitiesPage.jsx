import { Bookmark, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  getOpportunities,
  getSavedOpportunities,
  saveSavedOpportunity,
  removeSavedOpportunity,
} from '@/lib/database'

const categories = ['Все', 'Олимпиады', 'Хакатоны', 'Конкурсы', 'Гранты', 'Летние школы']
const formats = ['Все форматы', 'Онлайн', 'Офлайн']
const grades = ['Все классы', '8', '9', '10', '11']

const categoryColors = {
  'Олимпиада': 'bg-blue-100 text-blue-700',
  'Олимпиады': 'bg-blue-100 text-blue-700',
  'Хакатон': 'bg-purple-100 text-purple-700',
  'Хакатоны': 'bg-purple-100 text-purple-700',
  'Конкурс': 'bg-amber-100 text-amber-700',
  'Конкурсы': 'bg-amber-100 text-amber-700',
  'Грант': 'bg-emerald-100 text-emerald-700',
  'Гранты': 'bg-emerald-100 text-emerald-700',
  'Летняя школа': 'bg-rose-100 text-rose-700',
  'Летние школы': 'bg-rose-100 text-rose-700',
}

const getCategoryName = (type) => {
  const map = {
    'Олимпиада': 'Олимпиады',
    'Хакатон': 'Хакатоны',
    'Конкурс': 'Конкурсы',
    'Грант': 'Гранты',
    'Летняя школа': 'Летние школы',
    'Стажировка': 'Стажировки',
    'Волонтёрство': 'Волонтёрство',
    'Исследовательская программа': 'Исследования'
  }
  return map[type] || type || 'Другое'
}

export default function OpportunitiesPage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedLoading, setSavedLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('Все')
  const [activeFormat, setActiveFormat] = useState('Все форматы')
  const [activeGrade, setActiveGrade] = useState('Все классы')
  const [saved, setSaved] = useState([])

  useEffect(() => {
    loadOpportunities()
  }, [])

  useEffect(() => {
    const loadSaved = async () => {
      if (!user?.id) {
        setSaved([])
        return
      }

      try {
        setSavedLoading(true)
        const savedIds = await getSavedOpportunities(user.id)
        setSaved(savedIds)
      } catch (err) {
        setError(err.message)
      } finally {
        setSavedLoading(false)
      }
    }

    loadSaved()
  }, [user?.id])

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      const data = await getOpportunities()
      // Filter only published ones safely
      const published = data.filter(op => op.is_published === true || op.is_published === 'true' || op.is_published === 'Yes')
      setOpportunities(published)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = async (id) => {
    if (!user?.id) {
      setError('Пожалуйста, войдите, чтобы сохранять возможности.')
      return
    }

    const nextSaved = saved.includes(id)
      ? saved.filter((s) => s !== id)
      : [...saved, id]

    setSaved(nextSaved)

    try {
      if (saved.includes(id)) {
        await removeSavedOpportunity(user.id, id)
      } else {
        await saveSavedOpportunity(user.id, id)
      }
    } catch (err) {
      setSaved((prev) => (saved.includes(id) ? [...prev, id] : prev.filter((s) => s !== id)))
      setError(err.message)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const filtered = opportunities.filter((op) => {
    // Mapped category name
    const catName = getCategoryName(op.type)
    const catMatch = activeCategory === 'Все' || catName === activeCategory

    // Mapped format
    const dbFormat = op.format === 'Online' ? 'Онлайн' : op.format === 'Offline' ? 'Офлайн' : 'Гибрид'
    const fmtMatch = activeFormat === 'Все форматы' || dbFormat === activeFormat || op.format === activeFormat

    // Grade match check
    const gradeNum = Number(activeGrade)
    const gradeMatch = activeGrade === 'Все классы' || 
      (op.grade_from <= gradeNum && op.grade_to >= gradeNum)

    return catMatch && fmtMatch && gradeMatch
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-neutral-500 py-12">Загрузка возможностей...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Ошибка загрузки данных: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Каталог возможностей</h1>
        <p className="text-neutral-500">Олимпиады, хакатоны, конкурсы и гранты — всё в одном месте</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-8 flex flex-col gap-4">
        {/* Category */}
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Категория</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        {/* Format + Grade */}
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Формат</p>
            <div className="flex gap-2">
              {formats.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setActiveFormat(fmt)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                    activeFormat === fmt
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Класс</p>
            <div className="flex gap-2">
              {grades.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGrade(g)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                    activeGrade === g
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-neutral-500 mb-5">
        Найдено: <span className="font-semibold text-neutral-900">{filtered.length}</span> возможностей
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500">
          🎯 Нет доступных возможностей по выбранным фильтрам
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((op) => {
            const mappedFormat = op.format === 'Online' ? 'Онлайн' : op.format === 'Offline' ? 'Офлайн' : 'Гибрид'
            const badgeColor = categoryColors[op.type] || categoryColors[getCategoryName(op.type)] || 'bg-neutral-100 text-neutral-700'
            
            return (
              <div key={op.id} className="card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${badgeColor}`}>{op.type || op.category}</span>
                  <button
                    onClick={() => toggleSave(op.id)}
                    className={`p-1.5 rounded-lg transition-all duration-150 ${
                      saved.includes(op.id)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-400 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    title="Сохранить"
                  >
                    <Bookmark size={16} fill={saved.includes(op.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2 leading-snug">{op.title}</h3>
                <p className="text-sm text-neutral-500 mb-4 leading-relaxed flex-1">{op.description}</p>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-4">
                  <span>📅 Дедлайн: <span className="text-neutral-700 font-medium">{formatDate(op.deadline)}</span></span>
                  <span className="flex items-center gap-2">
                    <span className="text-neutral-500 font-medium">{op.grade_from}-{op.grade_to} кл.</span>
                    <span className={`badge ${mappedFormat === 'Онлайн' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                      {mappedFormat}
                    </span>
                  </span>
                </div>
                <a
                  href={op.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                  id={`opportunity-details-${op.id}`}
                >
                  Подробнее
                  <ExternalLink size={14} />
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
