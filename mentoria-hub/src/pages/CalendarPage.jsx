import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getOpportunitiesInRange } from '@/lib/database'

const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function formatDeadline(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return dateString
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function CalendarPage() {
  const now = new Date()
  const [monthOffset, setMonthOffset] = useState(0)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const displayDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const displayYear = displayDate.getFullYear()
  const displayMonth = displayDate.getMonth()
  const monthName = displayDate.toLocaleString('ru-RU', { month: 'long' })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const start = new Date(displayYear, displayMonth, 1, 0, 0, 0, 0)
        const end = new Date(displayYear, displayMonth + 1, 0, 23, 59, 59, 999)

        const data = await getOpportunitiesInRange(start.toISOString(), end.toISOString())
        const mapped = data.map((op) => ({
          id: op.id,
          title: op.title,
          deadline: op.deadline,
          category: op.category,
          type: op.type,
          day: new Date(op.deadline).getDate(),
        }))

        setEvents(mapped)
      } catch (err) {
        setError(err.message ?? String(err))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [displayYear, displayMonth])

  const firstWeekday = new Date(displayYear, displayMonth, 1).getDay()
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === displayYear && today.getMonth() === displayMonth
  const todayDay = isCurrentMonth ? today.getDate() : null

  const eventMap = Object.fromEntries(events.map((e) => [e.day, e]))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Календарь дедлайнов</h1>
        <p className="text-neutral-500">Отображаются дедлайны возможностей из базы данных</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Grid */}
        <div className="card p-6 flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setMonthOffset((m) => m - 1)} className="p-2 rounded-md hover:bg-neutral-100"><ChevronLeft size={16} /></button>
              <h2 className="text-lg font-semibold text-neutral-900">{monthName} {displayYear}</h2>
              <button onClick={() => setMonthOffset((m) => m + 1)} className="p-2 rounded-md hover:bg-neutral-100"><ChevronRight size={16} /></button>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />
              Событие
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-neutral-400 py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />
              const event = eventMap[day]
              const isToday = day === todayDay
              return (
                <div
                  key={day}
                  className={`relative rounded-xl p-2 min-h-[56px] text-center flex flex-col items-center transition-all duration-150 cursor-default
                    ${isToday ? 'bg-primary-600 text-white' : event ? 'bg-primary-50 hover:bg-primary-100' : 'hover:bg-neutral-100'}`}
                >
                  <span className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-neutral-800'}`}>{day}</span>
                  {event && !isToday && (
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 block" />
                  )}
                  {event && isToday && (
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white block" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="card p-6 w-full lg:w-80 flex-shrink-0">
          <h2 className="text-lg font-semibold text-neutral-900 mb-5">События {monthName}</h2>
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-neutral-500 text-sm">Загрузка событий...</div>
            ) : error ? (
              <div className="text-red-500 text-sm">Ошибка: {error}</div>
            ) : events.length === 0 ? (
              <div className="text-neutral-500 text-sm">Нет событий в этом месяце.</div>
            ) : (
              events.map((event) => {
                const isPast = new Date(event.deadline) < new Date()
                const diffDays = Math.ceil((new Date(event.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                const isUrgent = diffDays >= 0 && diffDays <= 5
                return (
                  <div key={event.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${isPast ? 'opacity-50 bg-neutral-50 border-neutral-200' : isUrgent ? 'bg-red-50 border-red-200' : 'bg-white border-neutral-200 hover:border-primary-200 hover:bg-primary-50'}`}>
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${isPast ? 'bg-neutral-200 text-neutral-500' : isUrgent ? 'bg-red-500 text-white' : 'bg-primary-100 text-primary-700'}`}>
                      <span className="text-lg leading-none">{new Date(event.deadline).getDate()}</span>
                      <span className="text-[10px] opacity-80">{new Date(event.deadline).toLocaleString('ru-RU', { month: 'short' })}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isPast ? 'text-neutral-500' : 'text-neutral-900'}`}>{event.title}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{formatDeadline(event.deadline)}</p>
                      {isPast && <p className="text-xs text-neutral-400 mt-0.5">Прошло</p>}
                      {isUrgent && !isPast && <p className="text-xs text-red-500 mt-0.5 font-medium">Скоро!</p>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
