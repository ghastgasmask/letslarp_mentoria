import { CheckCircle, Circle } from 'lucide-react'

const roadmap = [
  {
    grade: '8 класс',
    color: 'bg-sky-500',
    lightColor: 'bg-sky-50 border-sky-200',
    textColor: 'text-sky-600',
    dotColor: 'bg-sky-500',
    steps: [
      { done: true, text: 'Пройти базовые олимпиады по математике и физике' },
      { done: true, text: 'Начать изучение английского языка (A2 → B1)' },
      { done: true, text: 'Записаться на первые курсы на Mentoria Hub' },
      { done: false, text: 'Участие в школьном конкурсе проектов' },
      { done: false, text: 'Составить личный план развития' },
    ],
  },
  {
    grade: '9 класс',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 border-violet-200',
    textColor: 'text-violet-600',
    dotColor: 'bg-violet-500',
    steps: [
      { done: false, text: 'Участие в региональных олимпиадах' },
      { done: false, text: 'Начало подготовки к SAT/IELTS' },
      { done: false, text: 'Участие в первом хакатоне или конкурсе' },
      { done: false, text: 'Изучение основ программирования (Python)' },
      { done: false, text: 'Применение на летнюю школу' },
    ],
  },
  {
    grade: '10 класс',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-600',
    dotColor: 'bg-amber-500',
    steps: [
      { done: false, text: 'Участие в международных олимпиадах (IMO, IPhO)' },
      { done: false, text: 'Написание исследовательской работы (Research)' },
      { done: false, text: 'Прохождение первой стажировки / волонтёрства' },
      { done: false, text: 'Сдача IELTS / SAT с целевым баллом' },
      { done: false, text: 'Построение портфолио достижений' },
    ],
  },
  {
    grade: '11 класс',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50 border-emerald-200',
    textColor: 'text-emerald-600',
    dotColor: 'bg-emerald-500',
    steps: [
      { done: false, text: 'Финальная подготовка к ЕНТ / международным экзаменам' },
      { done: false, text: 'Написание мотивационных эссе для вузов' },
      { done: false, text: 'Подача заявок в университеты мечты' },
      { done: false, text: 'Прохождение собеседований и отборов' },
      { done: false, text: 'Выбор и принятие оффера от вуза 🎉' },
    ],
  },
]

export default function RoadmapPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Конструктор роадмапа</h1>
        <p className="text-neutral-500">Что делать в каждом классе, чтобы поступить в лучший университет</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 -translate-x-1/2 z-0" />

        <div className="flex flex-col gap-10">
          {roadmap.map((item, idx) => {
            const isLeft = idx % 2 === 0
            return (
              <div key={item.grade} className={`relative flex flex-col lg:flex-row gap-0 lg:gap-8 items-start ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                {/* Card */}
                <div className="flex-1 lg:max-w-[46%]">
                  <div className={`card border ${item.lightColor} overflow-hidden`}>
                    <div className={`${item.color} h-1.5 w-full`} />
                    <div className="p-6">
                      <div className={`inline-flex items-center gap-2 ${item.textColor} font-bold text-xl mb-5`}>
                        <span className={`w-3 h-3 rounded-full ${item.dotColor}`} />
                        {item.grade}
                      </div>
                      <ul className="flex flex-col gap-3">
                        {item.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2.5">
                            {step.done
                              ? <CheckCircle size={18} className={`${item.textColor} flex-shrink-0 mt-0.5`} />
                              : <Circle size={18} className="text-neutral-300 flex-shrink-0 mt-0.5" />
                            }
                            <span className={`text-sm leading-snug ${step.done ? 'text-neutral-900 font-medium' : 'text-neutral-500'}`}>
                              {step.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Centre dot */}
                <div className="hidden lg:flex flex-shrink-0 w-8 items-start justify-center pt-6">
                  <div className={`w-4 h-4 rounded-full ${item.color} border-2 border-white shadow-md z-10`} />
                </div>

                {/* Spacer */}
                <div className="hidden lg:block flex-1 lg:max-w-[46%]" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
