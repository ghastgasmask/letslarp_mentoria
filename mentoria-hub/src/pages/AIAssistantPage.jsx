import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'Привет, Айдана! 👋 Я твой персональный помощник на Mentoria Hub. Могу помочь с выбором олимпиад, курсов, расскажу о возможностях и составлю персональный план подготовки.',
    time: '11:30',
  },
  {
    id: 2,
    role: 'user',
    text: 'Какие олимпиады подходят для 10 класса по математике?',
    time: '11:31',
  },
  {
    id: 3,
    role: 'assistant',
    text: 'Отличный вопрос! Для 10 класса по математике я рекомендую:\n\n📌 **Республиканская олимпиада по математике** — дедлайн 20 июня. Хороший шанс заявить о себе на национальном уровне.\n\n📌 **Международная математическая олимпиада (IMO)** — сначала нужно пройти отбор через республиканский этап.\n\n📌 **Олимпиада «Кенгуру»** — онлайн, доступна всем ученикам.\n\nХочешь, я подробнее расскажу о любой из них или помогу составить план подготовки? 🎯',
    time: '11:31',
  },
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

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    const now = new Date()
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text, time },
      {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Спасибо за вопрос! Это демо-версия ассистента. В полной версии я подключён к базе данных Mentoria Hub и дам тебе точный персональный ответ. Пока ты можешь изучить каталог возможностей и курсов! 😊',
        time,
      },
    ])
    setInput('')
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
              Онлайн
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
          >
            <Send size={16} />
            <span className="hidden sm:inline">Отправить</span>
          </button>
        </div>
      </div>
    </div>
  )
}
