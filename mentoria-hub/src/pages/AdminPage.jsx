import { Users, BookOpen, Search, TrendingUp, UserPlus, Activity } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const stats = [
  { icon: Users, label: 'Всего пользователей', value: '128', change: '+12 за месяц', color: 'text-blue-400 bg-blue-500/10' },
  { icon: BookOpen, label: 'Активных курсов', value: '24', change: '3 на модерации', color: 'text-emerald-400 bg-emerald-500/10' },
  { icon: Search, label: 'Возможностей', value: '56', change: '5 новых', color: 'text-purple-400 bg-purple-500/10' },
  { icon: TrendingUp, label: 'Средний прогресс', value: '67%', change: '+4% за неделю', color: 'text-amber-400 bg-amber-500/10' },
]

const recentUsers = [
  { name: 'Айдана Исакова', email: 'aidana@mail.kz', grade: '10', joined: '2 ч назад' },
  { name: 'Нурлан Ахметов', email: 'nurlan@mail.kz', grade: '11', joined: '5 ч назад' },
  { name: 'Диана Сейткали', email: 'diana@mail.kz', grade: '9', joined: '1 д назад' },
]

const pendingItems = [
  { type: 'course', title: 'Олимпиадная геометрия', author: 'М. Касымова', status: 'На проверке' },
  { type: 'opportunity', title: 'KazHack 2026', author: 'IT Hub KZ', status: 'На проверке' },
]

export default function AdminPage() {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Админ'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">Панель администратора</h1>
        <p className="text-neutral-400">Добро пожаловать, {displayName}. Управляй платформой Mentoria Hub.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, change, color }) => (
          <div key={label} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={22} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-neutral-500 leading-snug mb-1">{label}</div>
            <div className="text-xs text-neutral-600">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <UserPlus size={20} className="text-blue-400" />
              Новые пользователи
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {recentUsers.map((u) => (
              <div key={u.email} className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-neutral-500">{u.email} · {u.grade} класс</p>
                </div>
                <span className="text-xs text-neutral-600">{u.joined}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity size={20} className="text-amber-400" />
              На модерации
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {pendingItems.map((item) => (
              <div key={item.title} className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-neutral-500">
                    {item.type === 'course' ? 'Курс' : 'Возможность'} · {item.author}
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
