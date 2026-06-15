import { Bookmark, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const allOpportunities = [
  {
    id: 1, category: 'Олимпиады', title: 'Республиканская олимпиада по математике',
    description: 'Ежегодное соревнование для школьников 8–11 классов. Призы и льготы при поступлении в вузы.',
    deadline: '20 июня 2025', format: 'Офлайн', grade: [10, 11],
  },
  {
    id: 2, category: 'Хакатоны', title: 'KazHack 2025 — национальный IT-хакатон',
    description: 'Создай свой стартап за 48 часов вместе с командой. Призовой фонд: 2 000 000 тг.',
    deadline: '1 июля 2025', format: 'Онлайн', grade: [9, 10, 11],
  },
  {
    id: 3, category: 'Гранты', title: 'Болашак — президентская программа',
    description: 'Государственная программа для обучения за рубежом в лучших университетах мира.',
    deadline: '15 августа 2025', format: 'Офлайн', grade: [11],
  },
  {
    id: 4, category: 'Летние школы', title: 'Летняя школа по физике — НАО НУ',
    description: 'Двухнедельная интенсивная программа в кампусе НУ. Лекции ведущих учёных.',
    deadline: '10 июня 2025', format: 'Офлайн', grade: [8, 9, 10],
  },
  {
    id: 5, category: 'Конкурсы', title: 'Конкурс научных проектов STEM KZ',
    description: 'Представь свой исследовательский проект перед жюри из ведущих учёных и экспертов.',
    deadline: '30 июня 2025', format: 'Онлайн', grade: [8, 9, 10, 11],
  },
  {
    id: 6, category: 'Олимпиады', title: 'Олимпиада по информатике (IOI Kazakhstan)',
    description: 'Отбор на Международную олимпиаду по информатике. Для сильных программистов.',
    deadline: '25 июня 2025', format: 'Офлайн', grade: [9, 10, 11],
  },
  {
    id: 7, category: 'Гранты', title: 'Образовательный грант KIMEP University',
    description: 'Грант на частичное или полное покрытие стоимости обучения в KIMEP University.',
    deadline: '5 июля 2025', format: 'Онлайн', grade: [11],
  },
  {
    id: 8, category: 'Конкурсы', title: 'Конкурс эссе «Моё видение Казахстана 2050»',
    description: 'Напиши эссе о будущем страны. Лучшие работы будут опубликованы и авторы получат призы.',
    deadline: '12 июля 2025', format: 'Онлайн', grade: [8, 9, 10, 11],
  },
]

const categories = ['Все', 'Олимпиады', 'Хакатоны', 'Конкурсы', 'Гранты', 'Летние школы']
const formats = ['Все форматы', 'Онлайн', 'Офлайн']
const grades = ['Все классы', '8', '9', '10', '11']

const categoryColors = {
  'Олимпиады': 'bg-blue-100 text-blue-700',
  'Хакатоны': 'bg-purple-100 text-purple-700',
  'Конкурсы': 'bg-amber-100 text-amber-700',
  'Гранты': 'bg-emerald-100 text-emerald-700',
  'Летние школы': 'bg-rose-100 text-rose-700',
}

export default function OpportunitiesPage() {
  const [activeCategory, setActiveCategory] = useState('Все')
  const [activeFormat, setActiveFormat] = useState('Все форматы')
  const [activeGrade, setActiveGrade] = useState('Все классы')
  const [saved, setSaved] = useState([])

  const filtered = allOpportunities.filter((op) => {
    const catMatch = activeCategory === 'Все' || op.category === activeCategory
    const fmtMatch = activeFormat === 'Все форматы' || op.format === activeFormat
    const gradeMatch = activeGrade === 'Все классы' || op.grade.includes(Number(activeGrade))
    return catMatch && fmtMatch && gradeMatch
  })

  const toggleSave = (id) => {
    setSaved((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
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
      <p className="text-sm text-neutral-500 mb-5">Найдено: <span className="font-semibold text-neutral-900">{filtered.length}</span> возможностей</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((op) => (
          <div key={op.id} className="card p-6 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <span className={`badge ${categoryColors[op.category]}`}>{op.category}</span>
              <button
                onClick={() => toggleSave(op.id)}
                className={`p-1.5 rounded-lg transition-all duration-150 ${saved.includes(op.id) ? 'text-primary-600 bg-primary-50' : 'text-neutral-400 hover:text-primary-600 hover:bg-primary-50'}`}
                title="Сохранить"
              >
                <Bookmark size={16} fill={saved.includes(op.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <h3 className="text-base font-semibold text-neutral-900 mb-2 leading-snug">{op.title}</h3>
            <p className="text-sm text-neutral-500 mb-4 leading-relaxed flex-1">{op.description}</p>
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-4">
              <span>📅 Дедлайн: <span className="text-neutral-700 font-medium">{op.deadline}</span></span>
              <span className={`badge ${op.format === 'Онлайн' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                {op.format}
              </span>
            </div>
            <button
              className="btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
              id={`opportunity-details-${op.id}`}
            >
              Подробнее
              <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
