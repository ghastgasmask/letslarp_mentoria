import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Sparkles, Loader2 } from 'lucide-react'
import { getUserProfile, getUserRoadmap, saveUserRoadmap, updateUserGoal } from "@/lib/database"; // путь к твоему database.js

// Стили оформления классов для таймлайна (остаются статичными для дизайна)
const gradeStyles = {
  '8 класс': { color: 'bg-sky-500', lightColor: 'bg-sky-50 border-sky-200', textColor: 'text-sky-600', dotColor: 'bg-sky-500' },
  '9 класс': { color: 'bg-violet-500', lightColor: 'bg-violet-50 border-violet-200', textColor: 'text-violet-600', dotColor: 'bg-violet-500' },
  '10 класс': { color: 'bg-amber-500', lightColor: 'bg-amber-50 border-amber-200', textColor: 'text-amber-600', dotColor: 'bg-amber-500' },
  '11 класс': { color: 'bg-emerald-500', lightColor: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-600', dotColor: 'bg-emerald-500' },
}

export default function RoadmapPage({ currentUserId }) {
  const [profile, setProfile] = useState(null)
  const [roadmapData, setRoadmapData] = useState([])
  const [aiAdvice, setAiAdvice] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // 1. Загрузка данных при входе
  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getUserProfile(currentUserId)
        setProfile(userProfile)
        setGoal(userProfile.target_goal || '')

        const savedRoadmap = await getUserRoadmap(currentUserId)
        if (savedRoadmap) {
          setRoadmapData(savedRoadmap.roadmap_json)
          setAiAdvice(savedRoadmap.ai_advice)
        } else {
          // Если сохраненного нет, можно поставить дефолтный базовый массив
          setRoadmapData([]) 
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [currentUserId])

  // 2. Функция генерации роадмапа через LLM
  const handleGenerateAI = async () => {
    if (!goal.trim()) return alert('Пожалуйста, укажи куда ты хочешь поступить или свою цель!')
    
    setGenerating(true)
    try {
      // Сначала сохраняем цель в профиль
      await updateUserGoal(currentUserId, goal)

      // Имитируем запрос к твоему ИИ-бэкенду (замени на реальный fetch к вашему API)
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        body: JSON.stringify({ userId: currentUserId, goal, grade: profile.grade, interests: profile.interests })
      })
      const result = await response.json() // Ожидаем { roadmap, advice }

      // Сохраняем в базу данных Supabase
      await saveUserRoadmap(currentUserId, result.roadmap, result.advice)
      
      setRoadmapData(result.roadmap)
      setAiAdvice(result.advice)
    } catch (err) {
      console.error('Ошибка генерации ИИ:', err)
    } finally {
      setGenerating(false)
    }
  }

  // 3. Интерактив: Клик по чекбоксу шага (меняет статус done/false)
  const toggleStep = async (gradeIdx, stepIdx) => {
    const updatedRoadmap = [...roadmapData]
    updatedRoadmap[gradeIdx].steps[stepIdx].done = !updatedRoadmap[gradeIdx].steps[stepIdx].done
    
    setRoadmapData(updatedRoadmap)
    // Сохраняем прогресс в БД
    await saveUserRoadmap(currentUserId, updatedRoadmap, aiAdvice)
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /> Загрузка персонального роадмапа...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Шапка и Блок Настройки Целей */}
      <div className="mb-10 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Твой ИИ-Конструктор Роадмапа</h1>
          <p className="text-neutral-500">
            Класс: <span className="font-semibold text-neutral-700">{profile?.grade}</span> • 
            Интересы: <span className="font-semibold text-neutral-700">{profile?.interests?.join(', ') || 'Не выбраны'}</span>
          </p>
        </div>
        
        {/* Инпут для Вуза/Цели */}
        <div className="flex items-center gap-3 w-full md:w-auto max-w-md">
          <input 
            type="text" 
            placeholder="Куда хочешь поступить? (Напр: MIT, КБТУ, Назарбаев Университет)"
            className="input w-full border border-neutral-200 rounded-lg p-2.5 text-sm"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button 
            onClick={handleGenerateAI}
            disabled={generating}
            className="btn bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {roadmapData.length > 0 ? 'Перегенерировать' : 'Создать трек'}
          </button>
        </div>
      </div>

      {/* Подсказка от ИИ (AI Advice) */}
      {aiAdvice && (
        <div className="mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-5 rounded-xl text-neutral-700 text-sm leading-relaxed flex gap-3">
          <Sparkles className="text-indigo-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-indigo-900 mb-1">Совет от ИИ-наставника:</h4>
            <p>{aiAdvice}</p>
          </div>
        </div>
      )}

      {/* Если роадмап еще не создан */}
      {roadmapData.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-neutral-200 rounded-2xl">
          <p className="text-neutral-400 mb-4">У тебя пока нет персонального плана.</p>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">Введите ваш целевой университет выше и нажмите кнопку «Создать трек», чтобы нейросеть построила персональный план обучения.</p>
        </div>
      )}

      {/* Таймлайн Роадмапа */}
      <div className="relative">
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 -translate-x-1/2 z-0" />

        <div className="flex flex-col gap-10">
          {roadmapData.map((item, idx) => {
            const isLeft = idx % 2 === 0
            const style = gradeStyles[item.grade] || gradeStyles['8 класс'] // Фолбэк на дефолтные стили
            
            return (
              <div key={item.grade} className={`relative flex flex-col lg:flex-row gap-0 lg:gap-8 items-start ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                {/* Карточка */}
                <div className="flex-1 lg:max-w-[46%] w-full">
                  <div className={`card border ${style.lightColor} overflow-hidden bg-white shadow-sm rounded-xl`}>
                    <div className={`${style.color} h-1.5 w-full`} />
                    <div className="p-6">
                      <div className={`inline-flex items-center gap-2 ${style.textColor} font-bold text-xl mb-5`}>
                        <span className={`w-3 h-3 rounded-full ${style.dotColor}`} />
                        {item.grade}
                      </div>
                      <ul className="flex flex-col gap-3">
                        {item.steps.map((step, sIdx) => (
                          <li 
                            key={sIdx} 
                            onClick={() => toggleStep(idx, sIdx)}
                            className="flex items-start gap-2.5 cursor-pointer hover:bg-neutral-50 p-1.5 rounded-lg transition-colors"
                          >
                            {step.done
                              ? <CheckCircle size={18} className={`${style.textColor} flex-shrink-0 mt-0.5`} />
                              : <Circle size={18} className="text-neutral-300 flex-shrink-0 mt-0.5" />
                            }
                            <span className={`text-sm leading-snug ${step.done ? 'text-neutral-400 line-through' : 'text-neutral-800 font-medium'}`}>
                              {step.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Центральная точка */}
                <div className="hidden lg:flex flex-shrink-0 w-8 items-start justify-center pt-6">
                  <div className={`w-4 h-4 rounded-full ${style.color} border-2 border-white shadow-md z-10`} />
                </div>

                <div className="hidden lg:block flex-1 lg:max-w-[46%]" />
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}