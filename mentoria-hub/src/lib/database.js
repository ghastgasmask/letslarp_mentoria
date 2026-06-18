import { supabase } from './supabase'

// ==================== File Upload ====================

export async function uploadFile(file, folder = 'general') {
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function deleteFile(fileUrl) {
  if (!fileUrl) return

  try {
    // Extract path from the full URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/storage/v1/object/public/uploads/')
    if (pathParts.length < 2) return

    const filePath = decodeURIComponent(pathParts[1])
    const { error } = await supabase.storage
      .from('uploads')
      .remove([filePath])

    if (error) throw error
  } catch (err) {
    console.error('Error deleting file:', err)
  }
}

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getCourseById(id) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createCourse(courseData) {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      ...courseData,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateCourse(id, courseData) {
  const { data, error } = await supabase
    .from('courses')
    .update({
      ...courseData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteCourse(id) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getLessonsByCourse(courseId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createLesson(lessonData) {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      ...lessonData,
      created_at: new Date(),
    })
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateLesson(id, lessonData) {
  const { data, error } = await supabase
    .from('lessons')
    .update({
      ...lessonData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteLesson(id) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('deadline', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getOpportunityById(id) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createOpportunity(opportunityData) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      ...opportunityData,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateOpportunity(id, opportunityData) {
  const { data, error } = await supabase
    .from('opportunities')
    .update({
      ...opportunityData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteOpportunity(id) {
  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Quiz functions
export async function getQuizzesByLesson(lessonId) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createQuiz(quizData) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      ...quizData,
      created_at: new Date(),
    })
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateQuiz(id, quizData) {
  const { data, error } = await supabase
    .from('quizzes')
    .update({
      ...quizData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteQuiz(id) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function saveQuizResult(result) {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      ...result,
      created_at: new Date(),
    })
    .select()
  
  if (error) throw error
  return data[0]
}

export async function getUserQuizResults(userId, lessonId) {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// ==================== Course Progress ====================

export async function getCourseProgress(userId, courseId) {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()
  
  if (error) throw error
  return data
}

export async function updateCourseProgress(userId, courseId, progressData) {
  const { data, error } = await supabase
    .from('course_progress')
    .upsert({
      user_id: userId,
      course_id: courseId,
      ...progressData,
      last_accessed_at: new Date(),
    }, { onConflict: 'user_id,course_id' })
    .select()
  
  if (error) throw error
  return data[0]
}

export async function getUserCourseProgresses(userId) {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data || []
}