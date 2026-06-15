const events = [
  { day: 3, title: 'Вебинар: олимпиадная математика' },
  { day: 10, title: 'Летняя школа физики — дедлайн' },
  { day: 14, title: 'Пробный тест IELTS' },
  { day: 20, title: 'Олимпиада по математике' },
  { day: 25, title: 'Олимпиада по информатике (IOI)' },
  { day: 30, title: 'Конкурс STEM KZ' },
]

const eventMap = Object.fromEntries(events.map((e) => [e.day, e]))

// June 2025 starts on Sunday (day 0)
const FIRST_DAY_OF_WEEK = 0 // Sunday
const DAYS_IN_MONTH = 30
const START_WEEKDAY = 0 // June 1, 2025 is Sunday

const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export default function CalendarPage() {
  const cells = []
  for (let i = 0; i < START_WEEKDAY; i++) cells.push(null)
  for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d)

  const today = 15

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Календарь дедлайнов</h1>
        <p className="text-neutral-500">Июнь 2025 — отслеживай важные даты</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar Grid */}
        <div className="card p-6 flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Июнь 2025</h2>
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
              const isToday = day === today
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
          <h2 className="text-lg font-semibold text-neutral-900 mb-5">События июня</h2>
          <div className="flex flex-col gap-4">
            {events.map((event) => {
              const isPast = event.day < today
              const isUrgent = event.day - today >= 0 && event.day - today <= 5
              return (
                <div key={event.day} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${isPast ? 'opacity-50 bg-neutral-50 border-neutral-200' : isUrgent ? 'bg-red-50 border-red-200' : 'bg-white border-neutral-200 hover:border-primary-200 hover:bg-primary-50'}`}>
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${isPast ? 'bg-neutral-200 text-neutral-500' : isUrgent ? 'bg-red-500 text-white' : 'bg-primary-100 text-primary-700'}`}>
                    <span className="text-lg leading-none">{event.day}</span>
                    <span className="text-[10px] opacity-80">июн</span>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isPast ? 'text-neutral-500' : 'text-neutral-900'}`}>{event.title}</p>
                    {isPast && <p className="text-xs text-neutral-400 mt-0.5">Прошло</p>}
                    {isUrgent && !isPast && <p className="text-xs text-red-500 mt-0.5 font-medium">Скоро!</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
