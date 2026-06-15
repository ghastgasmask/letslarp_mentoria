import { useState } from 'react'
import { User, Bell, Globe, LogOut, Camera } from 'lucide-react'

const interests = ['Математика', 'Физика', 'Программирование', 'Английский', 'SAT/IELTS', 'Экономика']

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    deadlines: true,
    newCourses: true,
    leaderboard: false,
    recommendations: true,
  })
  const [language, setLanguage] = useState('RU')
  const [selectedInterests, setSelectedInterests] = useState(['Математика', 'Программирование', 'SAT/IELTS'])

  const toggleInterest = (i) => {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const toggleNotif = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Настройки</h1>
        <p className="text-neutral-500">Управляй своим профилем и предпочтениями</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Profile Section */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <User size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Профиль</h2>
          </div>

          <div className="flex items-start gap-6 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                АИ
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                <Camera size={13} />
              </button>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Имя</label>
                <input
                  type="text"
                  defaultValue="Айдана"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Фамилия</label>
                <input
                  type="text"
                  defaultValue="Исакова"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Класс</label>
                <select className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white">
                  <option>8 класс</option>
                  <option>9 класс</option>
                  <option selected>10 класс</option>
                  <option>11 класс</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue="aidana@example.kz"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-neutral-500 mb-2">Интересы</label>
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                    selectedInterests.includes(i)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary-400'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary text-sm mt-2">Сохранить изменения</button>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Уведомления</h2>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { key: 'deadlines', label: 'Напоминания о дедлайнах', desc: 'За 3 дня до окончания' },
              { key: 'newCourses', label: 'Новые курсы', desc: 'Когда появляются новые курсы' },
              { key: 'leaderboard', label: 'Изменения в лидерборде', desc: 'Когда твой рейтинг меняется' },
              { key: 'recommendations', label: 'Персональные рекомендации', desc: 'AI-подборки раз в неделю' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{label}</p>
                  <p className="text-xs text-neutral-400">{desc}</p>
                </div>
                <button
                  onClick={() => toggleNotif(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    notifications[key] ? 'bg-primary-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      notifications[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Язык интерфейса</h2>
          </div>
          <div className="flex gap-3">
            {['RU', 'EN', 'KZ'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 border ${
                  language === lang
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary-400'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Аккаунт</h2>
          <button
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
            id="logout-btn"
          >
            <LogOut size={16} />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  )
}
