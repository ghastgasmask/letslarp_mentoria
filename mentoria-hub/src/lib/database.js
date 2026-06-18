import { supabase } from './supabase'

// =========================================================================
// 1. FILE UPLOAD & STORAGE
// =========================================================================

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

// =========================================================================
// 2. DASHBOARD, ANALYTICS & LEADERBOARD
// =========================================================================

export async function getPublishedCoursesCount() {
  const { count, error } = await supabase
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (error) throw error
  return count ?? 0
}

export async function getPublishedOpportunitiesCount() {
  const { count, error } = await supabase
    .from('opportunities')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  if (error) throw error
  return count ?? 0
}

export async function getUpcomingOpportunityDeadline() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('deadline')
    .eq('is_published', true)
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true })
    .limit(1)

  if (error) throw error
  return data?.[0]?.deadline ?? null
}

export async function getUpcomingOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, deadline, category')
    .eq('is_published', true)
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true })
    .limit(5)

  if (error) throw error
  return data || []
}

export async function getLeaderboardStatsByUser(userId) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('points, courses_completed')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

// =========================================================================
// 3. COURSES
// =========================================================================

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

// =========================================================================
// 4. LESSONS
// =========================================================================

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

// =========================================================================
// 5. OPPORTUNITIES
// =========================================================================

export async function getOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('deadline', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function getSavedOpportunities(userId) {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_id')
    .eq('user_id', userId)

  if (error) throw error
  return (data || []).map((item) => item.opportunity_id)
}

export async function getSavedOpportunityDetails(userId) {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_id')
    .eq('user_id', userId)

  if (error) throw error
  const ids = (data || []).map((item) => item.opportunity_id)
  if (ids.length === 0) return []

  const { data: opportunities, error: opportunitiesError } = await supabase
    .from('opportunities')
    .select('*')
    .in('id', ids)
    .order('deadline', { ascending: true })

  if (opportunitiesError) throw opportunitiesError
  return opportunities || []
}

export async function saveSavedOpportunity(userId, opportunityId) {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .upsert(
      {
        user_id: userId,
        opportunity_id: opportunityId,
      },
      { onConflict: ['user_id', 'opportunity_id'], ignoreDuplicates: true }
    )
    .select()

  if (error) throw error
  return data?.[0] ?? null
}

export async function removeSavedOpportunity(userId, opportunityId) {
  const { error } = await supabase
    .from('saved_opportunities')
    .delete()
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId)

  if (error) throw error
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

export async function getOpportunitiesInRange(startIso, endIso) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, deadline, category, type, is_published')
    .gte('deadline', startIso)
    .lte('deadline', endIso)
    .eq('is_published', true)
    .order('deadline', { ascending: true })

  if (error) throw error
  return data || []
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

// =========================================================================
// 6. QUIZZES & QUIZ RESULTS
// =========================================================================

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

// =========================================================================
// 7. COURSE PROGRESS
// =========================================================================

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
// В конец database.js

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserGoal(userId, goal) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ target_goal: goal })
    .eq('id', userId)
    .select()
  if (error) throw error
  return data[0]
}

export async function getUserRoadmap(userId) {
  const { data, error } = await supabase
    .from('user_roadmaps')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function saveUserRoadmap(userId, roadmapJson, aiAdvice) {
  const { data, error } = await supabase
    .from('user_roadmaps')
    .upsert({
      user_id: userId,
      roadmap_json: roadmapJson,
      ai_advice: aiAdvice,
      updated_at: new Date()
    }, { onConflict: 'user_id' })
    .select();
  
  if (error) throw error;
  return data[0];
}

// В самый конец твоего файла src/lib/database.js

// 1. Получить профиль студента (чтобы узнать его интересы и класс по умолчанию)

// Запрос к нашему созданному API-эндпоинту для работы с LLM
export async function generateRoadmapViaAI(grade, interests, targetGoal) {
  // Переводим число класса в строку для ИИ-промпта
  const normalizedGrade = grade ? `${grade} класс` : '8 класс';

  const response = await fetch('/api/roadmap-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grade: normalizedGrade, interests, targetGoal }),
  });

  if (!response.ok) {
    throw new Error('Ошибка при генерации роадмапа через Groq');
  }

  return await response.json(); 
}
export async function updateUserProfileForAi(userId, { grade, interests, targetGoal }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      grade: grade ? Number(grade) : null, // Сохраняем как число, чтобы не ломать AuthContext
      interests: interests || [],        // Сохраняем массив интересов jsonb
      target_goal: targetGoal             // Сохраняем текстовую цель
    })
    .eq('id', userId)
    .select();
  
  if (error) throw error;
  return data[0];
}