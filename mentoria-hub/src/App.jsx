import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'

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

// Loading spinner
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-50">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-2xl font-bold text-primary-600">Mentoria</span>
        <span className="text-2xl font-light text-neutral-400">Hub</span>
      </div>
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />

        {/* Protected routes */}
        <Route path="/courses" element={
          <ProtectedRoute>
            <div className="pt-16"><CoursesPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <div className="pt-16"><OpportunitiesPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="pt-16"><DashboardPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <div className="pt-16"><LeaderboardPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <div className="pt-16"><CalendarPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/roadmap" element={
          <ProtectedRoute>
            <div className="pt-16"><RoadmapPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <div className="pt-16"><SettingsPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/ai-assistant" element={
          <ProtectedRoute>
            <div className="pt-16"><AIAssistantPage /></div>
          </ProtectedRoute>
        } />
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
