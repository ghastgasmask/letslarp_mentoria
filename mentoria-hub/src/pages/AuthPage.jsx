import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isAdminEmail } from '@/lib/admin'
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
            step >= 2 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          2
        </div>
        <span className={`text-xs font-medium transition-colors duration-300 ${step >= 2 ? 'text-primary-600' : 'text-neutral-400'}`}>
          Профиль
        </span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    grade: '9',
    interests: [],
    wantsAdmin: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      grade: '9',
      interests: [],
      wantsAdmin: false,
    })
    setStep(1)
    setError('')
    setSuccess('')
  }

  const handleToggle = (val) => {
    setIsSignUp(val)
    resetForm()
  }

  const translateError = (err) => {
    const msg = err.message || 'Произошла ошибка'
    if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль'
    if (msg.includes('User already registered')) return 'Пользователь с таким email уже зарегистрирован'
    if (msg.includes('Email not confirmed')) return 'Email не подтверждён. Проверьте почту.'
    return msg
  }

  const handleStep1Next = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email.trim()) {
      setError('Введите email')
      return
    }
    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Пароли не совпадают')
      return
    }
    if (formData.wantsAdmin && !isAdminEmail(formData.email)) {
      setError('Этот email не может быть зарегистрирован как администратор')
      return
    }

    setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Введите ваше полное имя')
      return
    }

    setLoading(true)

    try {
      const data = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.grade,
        formData.interests,
        formData.wantsAdmin
      )

      if (data?.user && !data?.session) {
        setSuccess('Регистрация успешна! Проверьте почту для подтверждения.')
      } else {
        navigate(data.role === 'admin' ? '/admin' : '/dashboard')
      }
    } catch (err) {
      setError(translateError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = await signIn(formData.email, formData.password)
      navigate(data.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(translateError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 rounded-full opacity-15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px]">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="text-center pt-10 pb-4 px-8">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-2xl font-bold text-primary-600">Mentoria</span>
              <span className="text-2xl font-light text-neutral-400">Hub</span>
            </div>
            <p className="text-sm text-neutral-500">
              {isSignUp
                ? step === 1
                  ? formData.wantsAdmin
                    ? 'Создай аккаунт администратора'
                    : 'Создай аккаунт и начни путь к успеху'
                  : formData.wantsAdmin
                    ? 'Заполни профиль администратора'
                    : 'Расскажи немного о себе'
                : 'Войди в свой аккаунт'}
            </p>
          </div>

          <div className="flex mx-8 mb-4 bg-neutral-100 rounded-xl p-1">
            <button
              onClick={() => handleToggle(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isSignUp
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => handleToggle(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isSignUp
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Регистрация
            </button>
          </div>

          {isSignUp && <ProgressIndicator step={step} />}

          {/* Sign In Form */}
          {!isSignUp && (
            <form onSubmit={handleSignIn} className="px-8 pb-8">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      id="auth-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Пароль</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Введите пароль"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      id="auth-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed"
                id="auth-submit"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    Войти
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Step 1 */}
          {isSignUp && step === 1 && (
            <form
              onSubmit={handleStep1Next}
              className="px-8 pb-8 transition-opacity duration-300 opacity-100"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      id="auth-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Пароль</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Минимум 6 символов"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      id="auth-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Подтверждение пароля</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.passwordConfirm}
                      onChange={(e) => updateField('passwordConfirm', e.target.value)}
                      placeholder="Повторите пароль"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                        formData.passwordConfirm && formData.password !== formData.passwordConfirm
                          ? 'border-red-300 bg-red-50'
                          : 'border-neutral-200'
                      }`}
                      id="auth-password-confirm"
                    />
                  </div>
                  {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                    <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
                  )}
                </div>

                <label
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                    formData.wantsAdmin
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.wantsAdmin}
                    onChange={(e) => updateField('wantsAdmin', e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium">Я администратор</span>
                </label>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                id="auth-next"
              >
                Далее
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Sign Up Step 2 */}
          {isSignUp && step === 2 && (
            <form
              onSubmit={handleRegister}
              className="px-8 pb-8 transition-opacity duration-300 opacity-100"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Полное имя</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Айдана Исакова"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      id="auth-name"
                    />
                  </div>
                </div>

                {!formData.wantsAdmin && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Класс</label>
                    <div className="relative">
                      <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <select
                        value={formData.grade}
                        onChange={(e) => updateField('grade', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white appearance-none"
                        id="auth-grade"
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g} класс
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {!formData.wantsAdmin && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-2">Интересы</label>
                    <div className="grid grid-cols-2 gap-2">
                      {INTERESTS.map((interest) => (
                        <label
                          key={interest}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-all duration-150 ${
                            formData.interests.includes(interest)
                              ? 'bg-primary-50 border-primary-400 text-primary-700'
                              : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => toggleInterest(interest)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-xs font-medium leading-tight">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-600">{success}</p>
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setError('')
                  }}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                  id="auth-back"
                >
                  <ChevronLeft size={18} />
                  Назад
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed"
                  id="auth-submit"
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
