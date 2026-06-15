
## Задача

Добавь аутентификацию через Supabase в React проект. Создай страницу логина/регистрации и защити остальные роуты так, чтобы неавторизованные пользователи не могли их открыть.

---

## Уже установлено:
```bash
npm install @supabase/supabase-js
```

---

## Уже создано: `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xxxxx.supabase.co'  // ← вставь свой Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'  // ← вставь свой anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

Твоя задача:
## Создай файл `src/pages/AuthPage.jsx`

Эта страница должна содержать **две вкладки**: "Вход" и "Регистрация".

### Требования к AuthPage:

**Общий дизайн:**
- Фиксированный центр экрана (flex, full height, минимум 100vh)
- Белая карточка (width: max(400px, 90vw)), `shadow-lg`, `rounded-xl`
- Логотип "Mentoria Hub" сверху (синий текст, жирный)
- Две вкладки-кнопки: "Вход" и "Регистрация" (переключаются)
- Все в бело-синей теме, как было раньше

**Вкладка "Вход" (Sign In):**
- Поле ввода: Email
- Поле ввода: Пароль
- Кнопка "Войти" (синяя, `bg-primary-600`, полная ширина)
- Текст ошибки под кнопкой (красный текст, если ошибка)
- При успехе: редирект на `/dashboard`
- При нажатии кнопки: текст на кнопке меняется на "Загрузка..." и кнопка блокируется

**Вкладка "Регистрация" (Sign Up):**
- Поле ввода: Имя
- Поле ввода: Email
- Поле ввода: Пароль
- Поле ввода: Подтверждение пароля
- Кнопка "Зарегистрироваться" (синяя)
- Проверка: пароли совпадают? Если нет — красная ошибка под полем
- Текст ошибки от Supabase (если такой email уже существует и т.д.)
- При успехе: редирект на `/dashboard` (или показать сообщение "Проверь почту" если нужна верификация)
- При нажатии кнопки: аналогично "Загрузка..."

**Логика:**
- Используй функции из `src/lib/supabase.js` (см. ниже)
- Состояние: `email`, `password`, `name`, `passwordConfirm`, `loading`, `error`, `isSignUp` (для переключения вкладок)
- При успешной регистрации или входе: сохрани юзера в React Context (см. ниже)

---

## Создай файл `src/context/AuthContext.jsx`

Это контекст для хранения информации о текущем авторизованном пользователе.

```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем, авторизован ли пользователь при загрузке страницы
    supabase.auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
  }, [])

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }  // сохраняет имя в metadata пользователя
      }
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен быть внутри AuthProvider')
  }
  return context
}
```

---

## Обнови `src/App.jsx`

Оберни приложение в `AuthProvider` и добавь **ProtectedRoute** компонент для защиты страниц.

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { useState } from 'react'

// Pages
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import CoursesPage from '@/pages/CoursesPage'
import OpportunitiesPage from '@/pages/OpportunitiesPage'
import DashboardPage from '@/pages/DashboardPage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import CalendarPage from '@/pages/CalendarPage'
import RoadmapPage from '@/pages/RoadmapPage'
import SettingsPage from '@/pages/SettingsPage'
import AIAssistantPage from '@/pages/AIAssistantPage'

// Components
import Navbar from '@/components/Navbar'
import ChatButton from '@/components/ChatButton'

// Компонент для защиты роутов
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Публичные роуты */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />

        {/* Защищённые роуты */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <CoursesPage />
              </div>
              <ChatButton />
            </ProtectedRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <OpportunitiesPage />
              </div>
              <ChatButton />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <DashboardPage />
              </div>
              <ChatButton />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <LeaderboardPage />
              </div>
              <ChatButton />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <CalendarPage />
              </div>
              <ChatButton />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <RoadmapPage />
              </div>
              <ChatButton />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <SettingsPage />
              </div>
              <ChatButton />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <div className="pt-16">
                <AIAssistantPage />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
```

---

## Обнови `src/pages/HomePage.jsx`

На главной странице кнопки "Начать обучение" и "Зарегистрироваться" должны вести на `/auth`:

```javascript
// В героре-секции:
<button onClick={() => navigate('/auth')} className="...">
  Начать обучение
</button>

<button onClick={() => navigate('/auth')} className="...">
  Зарегистрироваться
</button>
```

Импорти `useNavigate` из `react-router-dom`.

---

## Обнови `src/components/Navbar.jsx`

Добавь кнопку "Выйти" (Sign Out) в меню настроек или рядом с аватаром:

```javascript
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')  // редирект на главную
  }

  return (
    // ... основной navbar ...
    // Рядом с Settings иконкой добавь:
    <button onClick={handleSignOut} className="text-sm text-neutral-600 hover:text-primary-600">
      Выйти
    </button>
  )
}
```

---

## Важные примечания

1. **Пароли:** Supabase требует минимум 6 символов для пароля
2. **Верификация email:** По умолчанию Supabase требует подтверждения email. Для разработки ты можешь отключить это в Project Settings → Authentication → Email Auth Settings → "Require email confirmation" → OFF
3. **Первый раз:** Когда первый пользователь регистрируется, таблица `auth.users` в Supabase создаётся автоматически
4. **Тестирование:** Тестируй с этим email: test@example.com / password123

---

## Запуск

После применения всех этих изменений:

```bash
npm run dev
```

Должны работать:
- `/` → главная страница (видна всем)
- `/auth` → страница логина/регистрации (видна всем)
- `/dashboard`, `/courses` и т.д. → редирект на `/auth` если не авторизован

Попробуй зарегистрироваться, потом выйти, потом залогиниться. Всё должно работать!
