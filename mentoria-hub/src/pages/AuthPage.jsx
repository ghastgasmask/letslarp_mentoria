import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setPasswordConfirm('')
    setError('')
    setSuccess('')
  }

  const handleToggle = (val) => {
    setIsSignUp(val)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (isSignUp) {
      if (!name.trim()) {
        setError('Введите ваше имя')
        return
      }
      if (password.length < 6) {
        setError('Пароль должен быть не менее 6 символов')
        return
      }
      if (password !== passwordConfirm) {
        setError('Пароли не совпадают')
        return
      }
    }

    setLoading(true)

    try {
      if (isSignUp) {
        const data = await signUp(email, password, name)
        // If email confirmation is required, user won't have a session yet
        if (data?.user && !data?.session) {
          setSuccess('Регистрация успешна! Проверьте почту для подтверждения.')
        } else {
          navigate('/dashboard')
        }
      } else {
        await signIn(email, password)
        navigate('/dashboard')
      }
    } catch (err) {
      const msg = err.message || 'Произошла ошибка'
      // Translate common Supabase errors
      if (msg.includes('Invalid login credentials')) {
        setError('Неверный email или пароль')
      } else if (msg.includes('User already registered')) {
        setError('Пользователь с таким email уже зарегистрирован')
      } else if (msg.includes('Email not confirmed')) {
        setError('Email не подтверждён. Проверьте почту.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100 flex items-center justify-center px-4 py-12">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 rounded-full opacity-15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
          {/* Header */}
          <div className="text-center pt-10 pb-6 px-8">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="text-2xl font-bold text-primary-600">Mentoria</span>
              <span className="text-2xl font-light text-neutral-400">Hub</span>
            </div>
            <p className="text-sm text-neutral-500">
              {isSignUp ? 'Создай аккаунт и начни путь к успеху' : 'Войди в свой аккаунт'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 mb-6 bg-neutral-100 rounded-xl p-1">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="flex flex-col gap-4">
              {/* Name (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Имя</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Айдана"
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      id="auth-name"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    id="auth-email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Пароль</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Подтверждение пароля</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Повторите пароль"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
                        passwordConfirm && password !== passwordConfirm
                          ? 'border-red-300 bg-red-50'
                          : 'border-neutral-200'
                      }`}
                      id="auth-password-confirm"
                    />
                  </div>
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-600">{success}</p>
              </div>
            )}

            {/* Submit */}
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
                  {isSignUp ? 'Зарегистрироваться' : 'Войти'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to home link */}
        <p className="text-center mt-6 text-sm text-neutral-500">
          <button onClick={() => navigate('/')} className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition">
            ← Вернуться на главную
          </button>
        </p>
      </div>
    </div>
  )
}
