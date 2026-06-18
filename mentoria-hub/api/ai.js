const SYSTEM_PROMPT = `Ты — полезный и доброжелательный ассистент для Mentoria Hub.
Отвечай на вопросы студентов ясно и по делу, давай рекомендации по олимпиадам, курсам и планам подготовки.
Если пользователь просит личные рекомендации, предлагай уточняющие вопросы (класс, цели, текущее расписание).
Отвечай на русском, соблюдай дружелюбный тон и давай конкретные шаги или ссылки на возможности Mentoria Hub, когда это уместно.`

function fallbackReply(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  return `Спасибо за вопрос! Это демо-ответ ассистента. Я получил ваше сообщение: "${lastUser?.text || ''}". Могу помочь составить план подготовки или рассказать о курсах и олимпиадах.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { messages } = req.body || {}
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' })
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY

  // Если ключа нет, сразу заглушка
  if (!GROQ_API_KEY) {
    return res.status(200).json({ reply: fallbackReply(messages) })
  }

  try {
    // Берём только последние 5 сообщений, чтобы не упереться в лимит размера
    const recentMessages = messages.slice(-5)

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages.map((m) => ({ role: m.role, content: m.text })),
    ]

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'groq/compound',
        messages: groqMessages,
        temperature: 1,
        max_completion_tokens: 1024,
        compound_custom: {
          tools: { enabled_tools: ['web_search', 'visit_website'] },
        },
      }),
    })

    const data = await resp.json().catch(() => null)

    if (!resp.ok) {
      console.error('[GROQ] non-ok response:', resp.status, data)
      return res.status(200).json({ reply: fallbackReply(messages) })
    }

    const reply = data?.choices?.[0]?.message?.content || fallbackReply(messages)
    return res.status(200).json({ reply })
  } catch (err) {
    console.error('[AI API Error]', err)
    return res.status(200).json({ reply: fallbackReply(messages) })
  }
}