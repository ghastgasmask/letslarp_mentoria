import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ChevronLeft, GraduationCap } from 'lucide-react'

const INTERESTS = [
  'Математика',
  'Английский язык',
  'Программирование',
  'Физика',
  'Биология',
  'Экономика',
  'Бизнес',
  'STEM',
]

const GRADES = ['8', '9', '10', '11']

function ProgressIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6 px-8">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            step >= 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          1
        </div>
        <span className={`text-xs font-medium transition-colors duration-300 ${step >= 1 ? 'text-primary-600' : 'text-neutral-400'}`}>
          Аккаунт
        </span>
      </div>

      <div className={`h-0.5 w-10 transition-colors duration-300 ${step >= 2 ? 'bg-primary-600' : 'bg-neutral-200'}`} />

      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            step === 2 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          2
        </div>
        <span className={`text-xs font-medium transition-colors duration-300 ${step === 2 ? 'text-primary-600' : 'text-neutral-400'}`}>
          Интересы
        </span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  // Достаем функцию signUp из хука useAuth
  const { signUp } = useAuth()

  const [isLogin, setIsLogin] = useState(true)
  const [step, setStep] = useState(1) // 1: Основное, 2: Класс и Интересы
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Поля формы
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [grade, setGrade] = useState('8')
  const [selectedInterests, setSelectedInterests] = useState([])
  const [wantsAdmin, setWantsAdmin] = useState(false)

  const handleInterestToggle = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const translateError = (err) => {
    const msg = err?.message || String(err)
    if (msg.includes('User already registered')) return 'Этот Email уже зарегистрирован.'
    if (msg.includes('Invalid login credentials')) return 'Неверный Email или пароль.'
    return msg
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isLogin && step === 1) {
      if (!email || !password || !fullName) {
        setError('Пожалуйста, заполните все поля аккаунта.')
        return
      }
      if (password.length < 6) {
        setError('Пароль должен быть не менее 6 символов.')
        return
      }
      setStep(2)
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        // Здесь твоя функция логина (если она есть в useAuth)
        const { signIn } = useAuth() 
        const data = await signIn(email, password)
        navigate(data.role === 'admin' ? '/admin' : '/dashboard')
      } else {
        // ВЫЗОВ ИСПРАВЛЕН: Передаем данные ЕДИНЫМ ОБЪЕКТОМ, как требует новый AuthContext!
        const data = await signUp({
          email,
          password,
          name: fullName,
          grade,
          interests: selectedInterests,
          wantsAdmin
        })

        if (data?.user && !data?.session) {
          setSuccess('Регистрация успешна! Пожалуйста, подтвердите ваш Email.')
        } else {
          navigate(data.role === 'admin' ? '/admin' : '/dashboard')
        }
      }
    } catch (err) {
      setError(translateError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-100 shadow-xl p-8 transition-all">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {isLogin ? 'Вход в систему' : 'Создать аккаунт'}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            {isLogin ? 'Нет аккаунта? ' : 'Уже зарегистрированы? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setStep(1)
                setError('')
                setSuccess('')
              }}
              className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition"
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>

        {!isLogin && <ProgressIndicator step={step} />}

        {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl font-medium">{error}</div>}
        {success && <div className="mb-4 p-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl font-medium">{success}</div>}

        <div className="mt-4">
          {(isLogin || step === 1) ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">ФИО</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Иван Иванов"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email адрес</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="wantsAdmin"
                    checked={wantsAdmin}
                    onChange={(e) => setWantsAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="wantsAdmin" className="text-xs font-medium text-neutral-600 select-none cursor-pointer">
                    Запросить доступ администратора (только для разрешенных email)
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 mt-2 shadow-md disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Загрузка...
                  </>
                ) : isLogin ? (
                  'Войти'
                ) : (
                  <>
                    Далее
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            // Шаг 2: Выбор класса и интересов при регистрации
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                  <GraduationCap size={18} className="text-primary-500" />
                  В каком классе ты учишься?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        grade === g
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Выбери свои основные интересы:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest)
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all truncate ${
                          isSelected
                            ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-xs font-bold'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <ChevronLeft size={18} />
                  Назад
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed text-sm shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      Зарегистрироваться
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-neutral-500">
          <button onClick={() => navigate('/')} className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition">
            ← Вернуться на главную
          </button>
        </p>
      </div>
    </div>
  )
}