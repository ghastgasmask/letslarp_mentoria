import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Sparkles, Loader2, Save } from 'lucide-react'
import { getUserProfile, getUserRoadmap, saveUserRoadmap, updateUserProfileForAi, generateRoadmapViaAI } from "@/lib/database";

const AVAILABLE_INTERESTS = [
  'Математика', 'Английский язык', 'Программирование', 'Физика', 'Биология', 'Экономика', 'Бизнес', 'STEM'
];

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
  
  // Поля формы
  const [goal, setGoal] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('8')
  const [selectedInterests, setSelectedInterests] = useState([])

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

useEffect(() => {
  async function loadData() {
    if (!currentUserId) return;
    try {
      const userProfile = await getUserProfile(currentUserId)
      setProfile(userProfile)
      
      if (userProfile) {
        // Защита от NULL из базы данных (как на скриншоте)
        setGoal(userProfile.target_goal || '')
        
        // Если в базе NULL (как у Суркова), ставим дефолт "8", иначе приводим к строке
        setSelectedGrade(userProfile.grade ? String(userProfile.grade) : '8')
        
        // Если в базе пустой массив или NULL, ставим пустой массив во избежание краша
        setSelectedInterests(Array.isArray(userProfile.interests) ? userProfile.interests : [])
      }

      const savedRoadmap = await getUserRoadmap(currentUserId)
      if (savedRoadmap) {
        setRoadmapData(savedRoadmap.roadmap_json || [])
        setAiAdvice(savedRoadmap.ai_advice || '')
      }
    } catch (err) {
      console.error('Ошибка загрузки данных в Роадмапе:', err)
    } finally {
      // Снимаем статус загрузки в любом случае, чтобы экран не застывал на "Загрузка профиля..."
      setLoading(false)
    }
  }
  loadData()
}, [currentUserId])

  // Переключатель чекбоксов интересов
  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  // Главная функция: Сохранение данных в БД + генерация через Groq
  const handleGenerateAI = async () => {
    if (!goal.trim()) return alert('Пожалуйста, укажи свою цель или целевой ВУЗ!')
    if (selectedInterests.length === 0) return alert('Выбери хотя бы один интерес для ИИ!')
    
    setGenerating(true)
    try {
      // 1. Сохраняем обновленные интересы, класс и цель в базу данных Supabase
      await updateUserProfileForAi(currentUserId, {
        grade: selectedGrade,
        interests: selectedInterests,
        targetGoal: goal
      })

      // 2. Отправляем запрос к Groq ИИ
      const result = await generateRoadmapViaAI(selectedGrade, selectedInterests, goal)

      // 3. Сохраняем полученный JSON роадмапа в таблицу `user_roadmaps`
      await saveUserRoadmap(currentUserId, result.roadmap, result.advice)
      
      setRoadmapData(result.roadmap)
      setAiAdvice(result.advice)
    } catch (err) {
      console.error('Ошибка ИИ:', err)
      alert('Не удалось сгенерировать трек. Проверь консоль или GROQ_API_KEY.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleStep = async (gradeIdx, stepIdx) => {
    const updatedRoadmap = [...roadmapData]
    updatedRoadmap[gradeIdx].steps[stepIdx].done = !updatedRoadmap[gradeIdx].steps[stepIdx].done
    setRoadmapData(updatedRoadmap)
    await saveUserRoadmap(currentUserId, updatedRoadmap, aiAdvice)
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /> Загрузка профиля...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Панель настройки профиля и ИИ */}
      <div className="mb-10 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Sparkles className="text-indigo-500" /> Настройка твоего AI-Роадмапа
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Класс */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Твой класс:</label>
            <select 
              value={selectedGrade} 
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl p-3 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="8">8 класс</option>
              <option value="9">9 класс</option>
              <option value="10">10 class</option>
              <option value="11">11 класс</option>
            </select>
          </div>

          {/* Цель */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Цель поступления / ВУЗ мечты:</label>
            <input 
              type="text" 
              placeholder="Например: Поступить в Назарбаев Университет на Computer Science, или в MIT"
              className="w-full border border-neutral-200 rounded-xl p-3 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        </div>

        {/* Выбор Интересов */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Выбери свои интересы (сохранятся в профиль):</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTERESTS.map(interest => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {interest}
                </button>
              )
            })}
          </div>
        </div>

        {/* Кнопка запуска генерации */}
        <div className="flex justify-end border-t border-neutral-100 pt-4">
          <button 
            onClick={handleGenerateAI}
            disabled={generating}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl px-6 py-3 font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Groq строит твой трек...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {roadmapData.length > 0 ? 'Обновить и перегенерировать трек' : 'Сделать индивидуальный трек'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Вывод совета от ИИ */}
      {aiAdvice && (
        <div className="mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-5 rounded-2xl text-neutral-700 text-sm leading-relaxed flex gap-3 shadow-sm">
          <Sparkles className="text-indigo-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-indigo-900 mb-1">Аналитика твоего профиля от ИИ-наставника:</h4>
            <p className="text-neutral-600">{aiAdvice}</p>
          </div>
        </div>
      )}

      {/* Экран заглушки */}
      {roadmapData.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-2xl bg-white">
          <p className="text-neutral-400 font-medium mb-1">У тебя еще нет сгенерированного плана.</p>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">Выберите ваши интересы, укажите целевой ВУЗ выше и нажмите кнопку генерации.</p>
        </div>
      )}

      {/* Визуализация таймлайна */}
      {roadmapData.length > 0 && (
        <div className="relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 -translate-x-1/2 z-0" />
          <div className="flex flex-col gap-10">
            {roadmapData.map((item, idx) => {
              const isLeft = idx % 2 === 0
              const style = gradeStyles[item.grade] || gradeStyles['8 класс']
              
              return (
                <div key={item.grade} className={`relative flex flex-col lg:flex-row gap-0 lg:gap-8 items-start ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className="flex-1 lg:max-w-[46%] w-full">
                    <div className={`border ${style.lightColor} overflow-hidden bg-white shadow-sm rounded-2xl`}>
                      <div className={`${style.color} h-1.5 w-full`} />
                      <div className="p-6">
                        <div className={`inline-flex items-center gap-2 ${style.textColor} font-bold text-xl mb-4`}>
                          <span className={`w-3 h-3 rounded-full ${style.dotColor}`} />
                          {item.grade}
                        </div>
                        <ul className="flex flex-col gap-2.5">
                          {item.steps.map((step, sIdx) => (
                            <li 
                              key={sIdx} 
                              onClick={() => toggleStep(idx, sIdx)}
                              className="flex items-start gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded-xl transition-all"
                            >
                              {step.done
                                ? <CheckCircle size={18} className={`${style.textColor} flex-shrink-0 mt-0.5`} />
                                : <Circle size={18} className="text-neutral-300 flex-shrink-0 mt-0.5" />
                              }
                              <span className={`text-sm leading-relaxed ${step.done ? 'text-neutral-400 line-through' : 'text-neutral-800 font-medium'}`}>
                                {step.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-shrink-0 w-8 items-start justify-center pt-6">
                    <div className={`w-4 h-4 rounded-full ${style.color} border-2 border-white shadow-md z-10`} />
                  </div>
                  <div className="hidden lg:block flex-1 lg:max-w-[46%]" />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}