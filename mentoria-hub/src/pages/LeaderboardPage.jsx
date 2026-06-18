import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLeaderboardRankings } from '@/lib/database'

const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
const medalBg = {
  1: 'bg-amber-50 border-amber-200',
  2: 'bg-neutral-50 border-neutral-200',
  3: 'bg-orange-50 border-orange-200',
}

function getInitials(name) {
  if (!name) return '??'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getLeaderboardRankings()
        setLeaders(data)
      } catch (err) {
        setError(err?.message ?? String(err))
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [])

  const currentUserId = user?.id
  const userPlace = leaders.findIndex((leader) => leader.user_id === currentUserId) + 1
  const topThree = leaders.slice(0, 3)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Лидерборд</h1>
        <p className="text-neutral-500">Топ учеников по набранным баллам на платформе</p>
      </div>

      {error ? (
        <div className="card p-6 bg-rose-50 text-rose-700">Ошибка загрузки лидерборда: {error}</div>
      ) : (
        <>
          {/* Top 3 podium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="card p-5 animate-pulse bg-neutral-100" />
                ))
              : topThree.map((leader, index) => (
                  <div
                    key={leader.user_id}
                    className={`card p-5 flex flex-col items-center text-center border ${medalBg[index + 1]} ${index === 0 ? 'scale-105 shadow-md' : ''}`}
                  >
                    <span className="text-3xl mb-2">{medals[index + 1]}</span>
                    <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold mb-2 text-primary-700">
                      {getInitials(leader.full_name)}
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">{leader.full_name}</p>
                    <p className="text-xl font-bold text-primary-600 mt-1">{leader.points}</p>
                    <p className="text-xs text-neutral-400">баллов</p>
                  </div>
                ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Место</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Участник</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Баллы</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Курсы</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index} className="animate-pulse bg-neutral-100">
                          <td className="px-6 py-4 h-12" />
                          <td className="px-6 py-4 h-12" />
                          <td className="px-6 py-4 h-12" />
                          <td className="px-6 py-4 h-12 hidden sm:table-cell" />
                        </tr>
                      ))
                    : leaders.map((leader, index) => {
                        const place = index + 1
                        const isMe = leader.user_id === currentUserId
                        return (
                          <tr
                            key={leader.user_id}
                            className={`transition-colors duration-150 ${isMe ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-neutral-500">
                                {medals[place] ? medals[place] : `#${place}`}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 flex-shrink-0">
                                  {getInitials(leader.full_name)}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${isMe ? 'text-primary-700' : 'text-neutral-900'}`}>
                                    {leader.full_name}
                                    {isMe && <span className="ml-2 badge bg-primary-100 text-primary-600">Ты</span>}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-sm font-bold ${place <= 3 ? 'text-primary-600' : 'text-neutral-700'}`}>
                                {leader.points.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right hidden sm:table-cell">
                              <span className="text-sm text-neutral-500">{leader.courses}</span>
                            </td>
                          </tr>
                        )
                      })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && currentUserId && userPlace > 0 && (
        <div className="mt-6 p-4 rounded-2xl border border-primary-100 bg-primary-50 text-sm text-neutral-700">
          Текущая позиция: <strong>#{userPlace}</strong>. Баллы считаются по прогрессу и квизам.
        </div>
      )}
    </div>
  )
}
