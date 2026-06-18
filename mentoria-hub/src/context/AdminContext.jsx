import { createContext, useContext, useState, useEffect } from 'react'
import { getCourses, getOpportunities, getLessonsByCourse } from '@/lib/database'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [courses, setCourses] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [coursesData, opportunitiesData] = await Promise.all([
        getCourses(),
        getOpportunities(),
      ])
      setCourses(coursesData)
      setOpportunities(opportunitiesData)
    } catch (err) {
      setError(err.message)
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateCourses = async () => {
    try {
      const data = await getCourses()
      setCourses(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const updateOpportunities = async () => {
    try {
      const data = await getOpportunities()
      setOpportunities(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AdminContext.Provider
      value={{
        courses,
        opportunities,
        loading,
        error,
        loadData,
        updateCourses,
        updateOpportunities,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin должен быть внутри AdminProvider')
  }
  return context
}