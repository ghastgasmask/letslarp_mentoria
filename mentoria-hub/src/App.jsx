import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatButton from './components/ChatButton'
import HomePage from './pages/HomePage'
import CoursesPage from './pages/CoursesPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import CalendarPage from './pages/CalendarPage'
import RoadmapPage from './pages/RoadmapPage'
import SettingsPage from './pages/SettingsPage'
import AIAssistantPage from './pages/AIAssistantPage'

function Layout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <ChatButton />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
