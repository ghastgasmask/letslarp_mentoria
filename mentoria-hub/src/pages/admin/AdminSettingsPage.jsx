import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

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
      <h1 className="text-3xl font-bold text-white mb-2">Настройки</h1>
      <p className="text-neutral-400 mb-8">Параметры аккаунта администратора</p>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Имя</label>
            <input
              type="text"
              defaultValue={user?.user_metadata?.full_name || ''}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
            <input
              type="email"
              defaultValue={user?.email || ''}
              disabled
              className="w-full bg-neutral-800/50 border border-neutral-700 text-neutral-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Роль</label>
            <input
              type="text"
              value="admin"
              disabled
              className="w-full bg-neutral-800/50 border border-neutral-700 text-amber-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed font-medium"
            />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
        >
          <LogOut size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
