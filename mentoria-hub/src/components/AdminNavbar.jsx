import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, Search, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Панель', end: true },
  { to: '/admin/users', icon: Users, label: 'Пользователи' },
  { to: '/admin/courses', icon: BookOpen, label: 'Курсы' },
  { to: '/admin/opportunities', icon: Search, label: 'Возможности' },
]

export default function AdminNavbar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Админ'
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to="/admin" className="flex items-center gap-1.5 select-none">
            <span className="text-xl font-bold text-white">Mentoria</span>
            <span className="text-xl font-light text-neutral-500">Admin</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {adminLinks.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-neutral-800'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mr-1 hidden sm:inline">
            admin
          </span>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `p-2 rounded-lg transition-all duration-150 ${
                isActive ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`
            }
            title="Настройки"
          >
            <Settings size={22} />
          </NavLink>

          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-800 transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-neutral-200 hidden sm:block">{displayName}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
            title="Выйти"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
