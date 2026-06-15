import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

export default function ChatButton() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/ai-assistant')}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl"
      title="AI-ассистент"
      id="chat-button"
    >
      <MessageCircle size={24} />
    </button>
  )
}
