import { Link } from 'react-router-dom'
import { Search, BookOpen, Bot, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Каталог возможностей',
    description: 'Олимпиады, хакатоны, летние школы, гранты. Всё в одном месте, с фильтрами и дедлайнами.',
    color: 'bg-blue-50 text-primary-600',
  },
  {
    icon: BookOpen,
    title: 'Курсы',
    description: 'Математика, английский, физика, SAT/IELTS. Учись в своём темпе с персональным прогрессом.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Bot,
    title: 'AI-ассистент',
    description: 'Персональные рекомендации на основе твоих интересов, целей и истории активности.',
    color: 'bg-purple-50 text-purple-600',
  },
]

const badges = ['8–11 класс', 'Казахстан и мир', 'Бесплатно']

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 px-4 overflow-hidden relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-400 rounded-full opacity-10 translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Платформа для казахстанских школьников
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Твой путь к успеху <br />
                <span className="text-primary-200">начинается здесь</span>
              </h1>
              <p className="text-lg text-primary-100 mb-10 leading-relaxed">
                Mentoria Hub — платформа для казахстанских школьников: олимпиады, конкурсы, курсы и персональные рекомендации в одном месте.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/opportunities"
                  className="flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:shadow-lg"
                  id="hero-find-opportunities"
                >
                  Найти возможности
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center justify-center gap-2 border-2 border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all duration-200"
                  id="hero-start-learning"
                >
                  Начать обучение
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:flex flex-1 justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-white/5 rounded-3xl border border-white/10" />
                <div className="absolute top-6 left-6 right-6 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-primary-200">Математика</div>
                      <div className="text-sm font-semibold">Алгебра и геометрия</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full w-[45%]" />
                  </div>
                  <div className="text-xs text-primary-200 mt-1">45% завершено</div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-xs text-primary-200 mb-1">Ближайший дедлайн</div>
                  <div className="text-sm font-semibold">Олимпиада по физике</div>
                  <div className="text-xs text-emerald-300 mt-1">📅 20 июня 2025</div>
                </div>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                  <Bot size={32} className="text-white" />
                  <div className="text-xs text-center mt-1 text-primary-200">AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Что такое Mentoria Hub?</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">Всё необходимое для успешного обучения и карьерного старта в одном месте</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="card p-8 group cursor-default">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">{title}</h3>
                <p className="text-neutral-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="bg-neutral-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-neutral-900 mb-5">Mentoria Hub создан для тебя</h2>
              <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                Ученики 8–11 классов из Казахстана и других стран, которые хотят развиваться, участвовать в олимпиадах и поступить в лучшие университеты.
              </p>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge) => (
                  <span key={badge} className="flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl px-5 py-2.5 font-semibold text-sm">
                    <CheckCircle size={16} className="text-primary-500" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md">
              {[
                { label: 'Участников', value: '2,400+' },
                { label: 'Курсов', value: '48' },
                { label: 'Возможностей', value: '120+' },
                { label: 'Партнёров', value: '15' },
              ].map(({ label, value }) => (
                <div key={label} className="card p-6 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">{value}</div>
                  <div className="text-sm text-neutral-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Готов начать?</h2>
          <p className="text-primary-200 mb-8 text-lg">Присоединяйся к тысячам школьников, которые уже строят своё будущее с Mentoria Hub</p>
          <button
            className="bg-white text-primary-700 font-bold px-10 py-4 rounded-xl hover:bg-primary-50 transition-all duration-200 hover:shadow-lg text-lg"
            id="cta-register"
          >
            Зарегистрироваться
          </button>
        </div>
      </section>
    </div>
  )
}
