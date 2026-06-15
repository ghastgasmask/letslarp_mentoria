const leaders = [
  { place: 1, initials: 'АМ', name: 'Алибек Мусаев', points: 1240, courses: 8, bg: 'bg-amber-100 text-amber-700' },
  { place: 2, initials: 'ДС', name: 'Диана Сейткали', points: 1105, courses: 7, bg: 'bg-neutral-200 text-neutral-700' },
  { place: 3, initials: 'НА', name: 'Нурлан Ахметов', points: 980, courses: 6, bg: 'bg-orange-100 text-orange-700' },
  { place: 4, initials: 'АИ', name: 'Айдана Исакова', points: 320, courses: 3, bg: 'bg-primary-100 text-primary-700', isMe: true },
  { place: 5, initials: 'КБ', name: 'Карина Байжанова', points: 870, courses: 5, bg: 'bg-pink-100 text-pink-700' },
  { place: 6, initials: 'ЕТ', name: 'Ернур Тасболов', points: 810, courses: 5, bg: 'bg-teal-100 text-teal-700' },
  { place: 7, initials: 'СО', name: 'Салтанат Оспанова', points: 755, courses: 4, bg: 'bg-violet-100 text-violet-700' },
  { place: 8, initials: 'МН', name: 'Мадина Нурланова', points: 690, courses: 4, bg: 'bg-cyan-100 text-cyan-700' },
  { place: 9, initials: 'АД', name: 'Арман Дюсенов', points: 620, courses: 3, bg: 'bg-lime-100 text-lime-700' },
  { place: 10, initials: 'ЗК', name: 'Зарина Кожаева', points: 550, courses: 3, bg: 'bg-rose-100 text-rose-700' },
]

const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
const medalBg = {
  1: 'bg-amber-50 border-amber-200',
  2: 'bg-neutral-50 border-neutral-200',
  3: 'bg-orange-50 border-orange-200',
}

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Лидерборд</h1>
        <p className="text-neutral-500">Топ учеников по набранным баллам на платформе</p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[leaders[1], leaders[0], leaders[2]].map((leader) => (
          <div
            key={leader.place}
            className={`card p-5 flex flex-col items-center text-center border ${medalBg[leader.place]} ${leader.place === 1 ? 'scale-105 shadow-md' : ''}`}
          >
            <span className="text-3xl mb-2">{medals[leader.place]}</span>
            <div className={`w-14 h-14 rounded-full ${leader.bg} flex items-center justify-center text-lg font-bold mb-2`}>
              {leader.initials}
            </div>
            <p className="text-sm font-semibold text-neutral-900">{leader.name}</p>
            <p className="text-xl font-bold text-primary-600 mt-1">{leader.points}</p>
            <p className="text-xs text-neutral-400">баллов</p>
          </div>
        ))}
      </div>

      {/* Full Table */}
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
              {leaders.map((leader) => (
                <tr
                  key={leader.place}
                  className={`transition-colors duration-150 ${leader.isMe ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-neutral-500">
                      {medals[leader.place] ? medals[leader.place] : `#${leader.place}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${leader.bg} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                        {leader.initials}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${leader.isMe ? 'text-primary-700' : 'text-neutral-900'}`}>
                          {leader.name}
                          {leader.isMe && <span className="ml-2 badge bg-primary-100 text-primary-600">Ты</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${leader.place <= 3 ? 'text-primary-600' : 'text-neutral-700'}`}>
                      {leader.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right hidden sm:table-cell">
                    <span className="text-sm text-neutral-500">{leader.courses}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
