import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'

import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import CoursesPage from '@/pages/CoursesPage'
import CourseLessonsPage from '@/pages/CourseLessonsPage'
import LessonQuizPage from '@/pages/LessonQuizPage'
import OpportunitiesPage from '@/pages/OpportunitiesPage'
import DashboardPage from '@/pages/DashboardPage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import CalendarPage from '@/pages/CalendarPage'
import RoadmapPage from '@/pages/RoadmapPage'
import SettingsPage from '@/pages/SettingsPage'
import AIAssistantPage from '@/pages/AIAssistantPage'
import AdminPage from '@/pages/AdminPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage'
import AdminOpportunitiesPage from '@/pages/admin/AdminOpportunitiesPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

import Navbar from '@/components/Navbar'
import AdminNavbar from '@/components/AdminNavbar'
import ChatButton from '@/components/ChatButton'

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

function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (isAdmin) return <Navigate to="/admin" replace />

  return children
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}

function AuthRedirect() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <AuthPage />
  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
}

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <>
      {user && (isAdmin ? <AdminNavbar /> : <Navbar />)}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthRedirect />} />

        <Route path="/courses" element={
          <ProtectedRoute>
            <div className="pt-16"><CoursesPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/course/:courseId" element={
          <ProtectedRoute>
            <div className="pt-16"><CourseLessonsPage /></div>
            <ChatButton />
          </ProtectedRoute>
        } />
        <Route path="/lesson/:lessonId/quiz" element={
          <ProtectedRoute>
            <div className="pt-16"><LessonQuizPage /></div>
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

        <Route path="/admin" element={
          <AdminRoute>
            <div className="pt-16 min-h-screen bg-neutral-950"><AdminPage /></div>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <div className="pt-16 min-h-screen bg-neutral-950"><AdminUsersPage /></div>
          </AdminRoute>
        } />
        <Route path="/admin/courses" element={
          <AdminRoute>
            <div className="pt-16 min-h-screen bg-neutral-950"><AdminCoursesPage /></div>
          </AdminRoute>
        } />
        <Route path="/admin/opportunities" element={
          <AdminRoute>
            <div className="pt-16 min-h-screen bg-neutral-950"><AdminOpportunitiesPage /></div>
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <div className="pt-16 min-h-screen bg-neutral-950"><AdminSettingsPage /></div>
          </AdminRoute>
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
