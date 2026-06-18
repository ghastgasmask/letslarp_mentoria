const fs = require('fs')
const path = require('path')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    return res.end('Method Not Allowed')
  }

  try {
    const { messages } = req.body || {}
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' })
    }

    // Load SYSTEM PROMPT from file
    const promptPath = path.join(process.cwd(), 'src', 'lib', 'ai', 'systemPrompt.txt')
    let systemPrompt = ''
    try {
      systemPrompt = fs.readFileSync(promptPath, 'utf8')
    } catch (err) {
      systemPrompt = 'You are a helpful assistant.'
    }

    // Build a simple text prompt combining system + conversation
    const userMessages = messages.filter((m) => m.role === 'user')
    const lastUser = userMessages.length ? userMessages[userMessages.length - 1].text : ''
    const combinedPrompt = `${systemPrompt}\n\nUser: ${lastUser}\nAssistant:`

    // If GROQ key present then try to call GROQ LLM API
    const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY
    if (GROQ_API_KEY) {
      try {
        const resp = await fetch('https://api.groq.ai/v1/models/groq-1o/outputs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            input: combinedPrompt,
            // model-specific params & shit could go here
          }),
        })

        const data = await resp.json()
        // try to find text in common locations... Json fallback..........
        let text = ''
        if (data && typeof data === 'object') {
          if (data.output && Array.isArray(data.output) && data.output[0]) {
            const o = data.output[0]
            if (o.content && Array.isArray(o.content)) {
              text = o.content.map((c) => (typeof c === 'string' ? c : c.text || '')).join(' ')
            }
          }
          if (!text && data.text) text = data.text
        }
        if (!text) text = JSON.stringify(data)

        return res.status(200).json({ reply: text })
      } catch (err) {
        // another fallback if GROQ call fails
        console.error('GROQ call failed', err)
      }
    }

    // if groq fails: 
    const fallbackReply = `Спасибо за вопрос! Это демо-ответ ассистента. Я получил ваше сообщение: "${lastUser}". Могу помочь составить план подготовки или рассказать о курсах и олимпиадах.`
    return res.status(200).json({ reply: fallbackReply })
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    return res.end('Internal Server Error')
  }
}
