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

    // If GROQ key present then try to call GROQ LLM API using the compound model
    const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY
    if (GROQ_API_KEY) {
      try {
        // Build messages expected by GROQ API: include system prompt first
        const groqMessages = [
          { role: 'system', content: systemPrompt },
          // map incoming messages to {role, content}
          ...messages.map((m) => ({ role: m.role, content: m.text })),
        ]

        const body = {
          messages: groqMessages,
          model: 'groq/compound',
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null,
          compound_custom: {
            tools: {
              enabled_tools: ['web_search', 'code_interpreter', 'visit_website'],
            },
          },
        }

        const resp = await fetch('https://api.groq.ai/v1/models/groq/compound/outputs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify(body),
        })
        const respText = await resp.text()
        let data = null
        try {
          data = JSON.parse(respText)
        } catch (e) {
          // non-json response
        }

        if (!resp.ok) {
          console.error('GROQ non-ok', resp.status, respText)
          return res.status(502).json({ error: 'GROQ API error', details: respText })
        }

        // Parse common response shapes
        let text = ''
        if (data) {
          if (typeof data.output_text === 'string' && data.output_text.length) {
            text = data.output_text
          } else if (Array.isArray(data.output) && data.output[0]) {
            const o = data.output[0]
            if (o.content && Array.isArray(o.content)) {
              text = o.content
                .map((c) => (typeof c === 'string' ? c : c.text || c.plain_text || ''))
                .join(' ')
            } else if (o.text) {
              text = o.text
            }
          } else if (data.reply) {
            text = data.reply
          }
        }

        if (!text) text = respText || JSON.stringify(data)

        return res.status(200).json({ reply: text })
      } catch (err) {
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
