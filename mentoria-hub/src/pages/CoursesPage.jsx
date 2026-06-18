import { Calculator, Languages, Atom, GraduationCap, Code, TrendingUp } from 'lucide-react'

const courses = [
  {
    id: 1,
    icon: Calculator,
    title: 'Алгебра и геометрия для олимпиад',
    subject: 'Математика',
    description: 'Углублённое изучение алгебры и геометрии для подготовки к олимпиадам различного уровня.',
    level: 'Средний',
    levelColor: 'bg-amber-100 text-amber-700',
    lessons: 12,
    progress: 45,
    accentColor: 'bg-blue-500',
  },
  {
    id: 2,
    icon: Languages,
    title: 'Academic English + эссе',
    subject: 'Английский язык',
    description: 'Академический английский, написание эссе, подготовка к международным экзаменам.',
    level: 'Начинающий',
    levelColor: 'bg-emerald-100 text-emerald-700',
    lessons: 8,
    progress: 20,
    accentColor: 'bg-emerald-500',
  },
  {
    id: 3,
    icon: Atom,
    title: 'Механика и термодинамика',
    subject: 'Физика',
    description: 'Основы механики и термодинамики: теория, задачи олимпиадного уровня и практические примеры.',
    level: 'Продвинутый',
    levelColor: 'bg-red-100 text-red-700',
    lessons: 10,
    progress: 0,
    accentColor: 'bg-orange-500',
  },
  {
    id: 4,
    icon: GraduationCap,
    title: 'Стратегии и практика SAT/IELTS',
    subject: 'Подготовка к SAT/IELTS',
    description: 'Эффективные стратегии сдачи SAT и IELTS, разбор типичных ошибок и практические тесты.',
    level: 'Средний',
    levelColor: 'bg-amber-100 text-amber-700',
    lessons: 15,
    progress: 70,
    accentColor: 'bg-purple-500',
  },
  {
    id: 5,
    icon: Code,
    title: 'Введение в программирование',
    subject: 'Информатика',
    description: 'Основы алгоритмического мышления и программирования на Python с нуля.',
    level: 'Начинающий',
    levelColor: 'bg-emerald-100 text-emerald-700',
    lessons: 10,
    progress: 10,
    accentColor: 'bg-cyan-500',
  },
  {
    id: 6,
    icon: TrendingUp,
    title: 'Основы микроэкономики',
    subject: 'Экономика',
    description: 'Введение в микроэкономику: спрос, предложение, рынки и ценообразование.',
    level: 'Начинающий',
    levelColor: 'bg-emerald-100 text-emerald-700',
    lessons: 7,
    progress: 0,
    accentColor: 'bg-rose-500',
  },
]

export default function CoursesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Курсы</h1>
        <p className="text-neutral-500 text-lg">Учись в своём темпе — от математики до подготовки к SAT</p>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const Icon = course.icon
          return (
            <div key={course.id} className="card flex flex-col overflow-hidden group">
              {/* Top accent bar */}
              <div className={`h-1.5 w-full ${course.accentColor}`} />

              <div className="p-6 flex flex-col flex-1">
                {/* Icon + Subject */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-neutral-100 group-hover:scale-105 transition-transform duration-200`}>
                    <Icon size={22} className="text-neutral-700" />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{course.subject}</span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-neutral-900 mb-2 leading-snug">{course.title}</h3>

                {/* Description */}
                <p className="text-sm text-neutral-500 mb-4 leading-relaxed line-clamp-2">{course.description}</p>

                {/* Level + Lessons */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`badge ${course.levelColor}`}>{course.level}</span>
                  <span className="text-xs text-neutral-400">{course.lessons} уроков</span>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                    <span>Прогресс</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>

                {/* Button */}
                <div className="mt-auto">
                  <button
                    id={`course-btn-${course.id}`}
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
    </div>
  )
}