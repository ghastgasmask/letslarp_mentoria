import { NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, Search, Trophy, Calendar, Map, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { to: '/courses', icon: BookOpen, label: 'Курсы' },
  { to: '/opportunities', icon: Search, label: 'Возможности' },
  { to: '/leaderboard', icon: Trophy, label: 'Лидерборд' },
  { to: '/calendar', icon: Calendar, label: 'Календарь' },
  { to: '/roadmap', icon: Map, label: 'Роадмап' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь'
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-1 select-none">
            <span className="text-xl font-bold text-primary-600">Mentoria</span>
            <span className="text-xl font-light text-neutral-400">Hub</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative
                  ${isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} />
                    <span>{label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-primary-600 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right: Settings + Profile + Sign Out */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `p-2 rounded-lg transition-all duration-150 ${isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'}`
            }
            title="Настройки"
          >
            <Settings size={22} />
          </NavLink>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-neutral-700 hidden sm:block">{displayName}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            title="Выйти"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
