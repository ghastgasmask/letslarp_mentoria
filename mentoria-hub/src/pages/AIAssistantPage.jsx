import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Я твой персональный помощник на Mentoria Hub. Могу помочь с выбором олимпиад, курсов, расскажу о возможностях. Для составления планов присутсвует другой ИИ',
    time: '11:30',
  }
]

const suggestions = [
  'Какие курсы мне рекомендуешь?',
  'Как подготовиться к IELTS?',
  'Что такое Болашак?',
  'Составь мне план на лето',
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`

    // Optimistically add user's message
    const userMessage = { id: Date.now(), role: 'user', text, time }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Call server API which will use GROQ when available
    setLoading(true)
    try {
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })
      const data = await resp.json().catch(() => null)

      let replyText = 'Не могу ответить (error)'
      if (!resp.ok) {
        const errMsg = (data && (data.error || data.message)) || `${resp.status} ${resp.statusText}`
        const details = data && data.details ? `\n
Details: ${data.details}` : ''
        replyText = `Произошла ошибка при запросе к API: ${errMsg}${details}`
      } else if (data && data.reply) {
        replyText = data.reply
      } else if (data && data.output_text) {
        replyText = data.output_text
      } else if (data && data.reply_text) {
        replyText = data.reply_text
      } else if (typeof data === 'string') {
        replyText = data
      }

      const assistantMessage = { id: Date.now() + 1, role: 'assistant', text: replyText, time }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `Произошла ошибка (error): ${err.message || err}`,
        time,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (s) => {
    setInput(s)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-md">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">AI-ассистент</h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Добрый день. Я онлайн
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="card flex-1 flex flex-col overflow-hidden mb-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                  : 'bg-primary-100 text-primary-700'
              }`}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-neutral-100 text-neutral-900 rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-primary-200' : 'text-neutral-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {/* Loading shit LOL!!!!!!!! */}
          {loading && (
            <div className="flex items-end gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <Bot size={16} />
              </div>

              {/* Typing Bubble */}
              <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-neutral-100 text-neutral-900 rounded-bl-md flex items-center gap-1">
                <span>Ассистент пишет</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-6 pb-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="text-xs bg-primary-50 text-primary-600 border border-primary-200 rounded-full px-3 py-1.5 hover:bg-primary-100 transition-colors duration-150"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 flex gap-3 border-t border-neutral-100">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Напиши вопрос ассистенту..."
            rows={1}
            className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            id="ai-chat-input"
          />
          <button
            onClick={handleSend}
            className="btn-primary px-4 py-2.5 flex items-center gap-2 flex-shrink-0 rounded-xl"
            id="ai-send-btn"
            disabled={loading}
          >
            <Send size={16} />
            <span className="hidden sm:inline">{loading ? 'Пишу...' : 'Отправить'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
