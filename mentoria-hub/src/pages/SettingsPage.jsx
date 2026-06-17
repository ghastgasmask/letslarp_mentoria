import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Bell, Globe, LogOut, Camera } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const interests = ['Математика', 'Физика', 'Программирование', 'Английский', 'SAT/IELTS', 'Экономика']

export default function SettingsPage() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const fullName = user?.user_metadata?.full_name || ''
  const spaceIndex = fullName.indexOf(' ')
  const firstName = spaceIndex !== -1 ? fullName.substring(0, spaceIndex) : fullName || user?.email?.split('@')[0] || ''
  const lastName = spaceIndex !== -1 ? fullName.substring(spaceIndex + 1) : ''
  const initials = (firstName.slice(0, 1) + (lastName.slice(0, 1) || '')).toUpperCase() || 'U'

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

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Настройки</h1>
        <p className="text-neutral-500">Управляй своими предпочтениями</p>
      </div>

      <div className="flex flex-col gap-6">

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
            onClick={handleLogout}
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
