import { useEffect, useMemo, useState } from 'react'
import { Bookmark, BookOpen, Trophy, CalendarCheck, Zap, User, Camera } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  getCourses,
  getLessonsByCourse,
  getPublishedCoursesCount,
  getPublishedOpportunitiesCount,
  getLeaderboardStatsByUser,
  getUpcomingOpportunityDeadline,
  getUpcomingOpportunities,
} from '@/lib/database'

const greetings = [
  'Пожаловать добрую, ',
  'Рад тебя видеть, ',
  'Норм делишки, ',
  'Готов поступать в MIT, ',
  'Хорошая погода, ',
  'Думаю, сегодня у нас будет прогресс, ',
  'И жизнь хороша, ',
  'Эти сообщения рандомизированы, ',
  'Думаем о твоем поступлении, ',
  'ВСЕ БУДЕТ НОРМАЛЬНО, ',
  'Не парься, ',
  'Солнце светит, ',
  'Салатик бурмылдатик, ',
  'Найди себе место в жизни, ',
  'Не трогай траву, ',
  'Пошли учиться, ',
  'Да будет все прекрасно, ',
  'Отпадно выглядишь, ',
  'Сногсшибательно выглядишь, ',
  'Тут около две дюжины рандомных сообщений, ',
  'Пора учиться, ',
  'Что нового,  ',
  'И поиграй в Terraria, ',
  'Учеба, учеба и учеба, ',
  'Сдай САТ на 1600, ',
  'Будет Айлтс на 9.0, ',
]

const getRandomGreeting = (displayName) => {
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]
  return greeting.endsWith(', ') ? greeting + displayName : greeting
}

function formatDeadline(deadline) {
  if (!deadline) return null
  const date = new Date(deadline)
  if (Number.isNaN(date.getTime())) return String(deadline)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')
}

const savedOpportunities = [
  { title: 'Республиканская олимпиада по математике', deadline: '20 июня', category: 'Олимпиады', color: 'bg-blue-100 text-blue-700' },
  { title: 'KazHack 2025 — национальный IT-хакатон', deadline: '1 июля', category: 'Хакатаны', color: 'bg-purple-100 text-purple-700' },
  { title: 'Летняя школа по физике — НАО НУ', deadline: '10 июня', category: 'Летние школы', color: 'bg-rose-100 text-rose-700' },
  { title: 'Конкурс научных проектов STEM KZ', deadline: '30 июня', category: 'Конкурсы', color: 'bg-amber-100 text-amber-700' },
]

const recommended = [
  { title: 'Олимпиада по информатике (IOI Kazakhstan)', desc: 'Подходит для твоего уровня в программировании', tag: 'Олимпиады' },
  { title: 'Введение в программирование (Python)', desc: 'Продолжи развивать навыки IT', tag: 'Курс' },
  { title: 'Болашак — президентская программа', desc: 'На основе твоих академических достижений', tag: 'Грант' },
]

const deadlines = [
  { date: '10 июня', event: 'Летняя школа по физике — НАО НУ', urgent: true },
  { date: '14 июня', event: 'Сдача теста IELTS (пробный)', urgent: true },
  { date: '20 июня', event: 'Олимпиада по математике', urgent: false },
  { date: '25 июня', event: 'Олимпиада по информатике (IOI)', urgent: false },
  { date: '30 июня', event: 'Конкурс STEM KZ', urgent: false },
]

export default function DashboardPage() {
  const { user, updateProfile } = useAuth()
  const [dashboardStats, setDashboardStats] = useState({
    publishedOpportunities: 0,
    publishedCourses: 0,
    nextDeadline: null,
    leaderboardPoints: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState(null)
  const [myCourses, setMyCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState(null)
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])

  const displayName = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь'
  const initials = String(displayName).slice(0, 2).toUpperCase()
  const nameParts = String(displayName).split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  const [profileData, setProfileData] = useState({
    firstName,
    lastName,
    grade: user?.grade ?? '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    if (!user?.id) return

    const loadStats = async () => {
      try {
        setLoadingStats(true)
        setStatsError(null)

        const [publishedOpportunities, publishedCourses, nextDeadline, leaderboard] = await Promise.all([
          getPublishedOpportunitiesCount(),
          getPublishedCoursesCount(),
          getUpcomingOpportunityDeadline(),
          getLeaderboardStatsByUser(user.id),
        ])

        setDashboardStats({
          publishedOpportunities,
          publishedCourses,
          nextDeadline: formatDeadline(nextDeadline),
          leaderboardPoints: leaderboard?.points ?? 0,
        })
      } catch (error) {
        setStatsError(error?.message ?? String(error))
      } finally {
        setLoadingStats(false)
      }
    }

    const loadDeadlines = async () => {
      try {
        const opportunities = await getUpcomingOpportunities()
        setUpcomingDeadlines(
          opportunities.map((op) => ({
            id: op.id,
            date: formatDeadline(op.deadline),
            event: op.title,
            category: op.category,
            urgent: new Date(op.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }))
        )
      } catch (error) {
        console.error('Не удалось загрузить дедлайны', error)
      }
    }

    loadStats()
    loadDeadlines()
  }, [user?.id])

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        setCoursesLoading(true)
        setCoursesError(null)

        const allCourses = await getCourses()
        const publishedCourses = allCourses.filter((course) => course.is_published)

        const coursesWithStats = await Promise.all(
          publishedCourses.slice(0, 3).map(async (course) => {
            const lessons = await getLessonsByCourse(course.id)
            return {
              ...course,
              lessonCount: lessons.length,
              progress: Number(course.progress) || 0,
            }
          })
        )

        setMyCourses(coursesWithStats)
      } catch (error) {
        setCoursesError(error?.message ?? String(error))
      } finally {
        setCoursesLoading(false)
      }
    }

    loadMyCourses()
  }, [])

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    try {
      setProfileLoading(true)
      setProfileError(null)

      const full_name = `${profileData.firstName.trim()} ${profileData.lastName.trim()}`.trim()
      await updateProfile({ full_name, grade: profileData.grade })
    } catch (error) {
      setProfileError(error?.message ?? String(error))
    } finally {
      setProfileLoading(false)
    }
  }

  const metrics = useMemo(
    () => [
      {
        icon: Bookmark,
        label: 'Опубликованных возможностей',
        value: loadingStats ? '...' : dashboardStats.publishedOpportunities.toLocaleString(),
        color: 'text-primary-600 bg-primary-50',
      },
      {
        icon: BookOpen,
        label: 'Активных курсов',
        value: loadingStats ? '...' : dashboardStats.publishedCourses.toLocaleString(),
        color: 'text-emerald-600 bg-emerald-50',
      },
      {
        icon: CalendarCheck,
        label: 'Ближайший дедлайн',
        value: loadingStats ? '...' : dashboardStats.nextDeadline || 'нет',
        color: 'text-amber-600 bg-amber-50',
      },
      {
        icon: Trophy,
        label: 'Баллов на лидерборде',
        value: loadingStats ? '...' : dashboardStats.leaderboardPoints.toLocaleString(),
        color: 'text-purple-600 bg-purple-50',
      },
    ],
    [dashboardStats, loadingStats]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-1">{getRandomGreeting(displayName)}</h1>
        <p className="text-neutral-500">Вот что происходит на твоей платформе сегодня. (Сообщения сверху рандомны)</p>
      </div>

      {/* Profile Section */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <User size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Профиль</h2>
          </div>

          <div className="flex items-start gap-6 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                {initials}
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
                  value={profileData.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Фамилия</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Класс</label>
                <select
                  value={profileData.grade}
                  onChange={(e) => handleProfileChange('grade', e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white"
                >
                  <option value="">Выбери класс</option>
                  <option value="8">8 класс</option>
                  <option value="9">9 класс</option>
                  <option value="10">10 класс</option>
                  <option value="11">11 класс</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-neutral-200 bg-neutral-50 text-neutral-500 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={profileLoading}
              className="btn-primary text-sm py-2 px-4"
            >
              {profileLoading ? 'Сохранение...' : 'Сохранить профиль'}
            </button>
            {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
          </div>
        </div>

      
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 mt-6">
        {metrics.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={22} />
            </div>
            <div className="text-2xl font-bold text-neutral-900 mb-1">{value}</div>
            <div className="text-xs text-neutral-500 leading-snug">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* My Courses */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-5">Мои курсы</h2>
            <div className="flex flex-col gap-5">
              {coursesLoading ? (
                <div className="text-neutral-500 text-sm">Загрузка курсов...</div>
              ) : coursesError ? (
                <div className="text-red-500 text-sm">Ошибка: {coursesError}</div>
              ) : myCourses.length === 0 ? (
                <div className="text-neutral-500 text-sm">Пока нет опубликованных курсов.</div>
              ) : (
                myCourses.map((course) => {
                  const displaySubject = course.subject || course.category || 'Общий курс'
                  const progress = Number(course.progress) || 0
                  const lessonCount = course.lessonCount ?? 0

                  return (
                    <div key={course.id}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{course.title}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{displaySubject}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary-600 ml-4">{lessonCount} уроков</span>
                      </div>
                      <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{course.description || 'Описание курса отсутствует.'}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                        <span>{course.level || 'Уровень не указан'}</span>
                        <span>{progress}% завершено</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Saved Opportunities */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-5">Сохранённые возможности</h2>
            <div className="flex flex-col gap-3">
              {savedOpportunities.map((op) => (
                <div key={op.title} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors duration-150">
                  <Bookmark size={16} className="text-primary-500 flex-shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{op.title}</p>
                    <p className="text-xs text-neutral-400">Дедлайн: {op.deadline}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${op.color}`}>{op.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={18} className="text-amber-500" />
              <h2 className="text-lg font-semibold text-neutral-900">Рекомендовано для тебя</h2>
            </div>
            <p className="text-xs text-neutral-400 -mt-3 mb-4">На основе твоих интересов</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommended.map((item) => (
                <div key={item.title} className="border border-neutral-200 rounded-xl p-4 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer">
                  <span className="badge bg-primary-100 text-primary-700 mb-3">{item.tag}</span>
                  <p className="text-sm font-semibold text-neutral-900 mb-1">{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-neutral-900 mb-5">Ближайшие дедлайны</h2>
            <div className="flex flex-col gap-4">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-neutral-500">Нет ближайших дедлайнов.</p>
              ) : (
                upcomingDeadlines.map((d) => (
                  <div key={d.id} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-12 text-center rounded-lg py-1 ${d.urgent ? 'bg-red-100' : 'bg-neutral-100'}`}>
                      <span className={`text-xs font-bold ${d.urgent ? 'text-red-600' : 'text-neutral-500'}`}>{d.date}</span>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-700 leading-snug pt-0.5">{d.event}</p>
                      <p className="text-xs text-neutral-400">{d.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
