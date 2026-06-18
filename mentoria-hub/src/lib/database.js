import { supabase } from './supabase'

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