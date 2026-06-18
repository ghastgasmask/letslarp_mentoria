import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createOpportunity, updateOpportunity } from '@/lib/database'

const OPPORTUNITY_TYPES = [
  'Олимпиада',
  'Хакатон',
  'Грант',
  'Стажировка',
  'Летняя школа',
  'Исследовательская программа',
  'Волонтёрство',
  'Конкурс',
]

const CATEGORIES = [
  'STEM',
  'Бизнес',
  'Финансы',
  'Программирование',
  'Наука',
  'Социальное влияние',
  'Другое',
]

export default function OpportunityBuilder({ opportunity = null, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Олимпиада',
    category: 'STEM',
    format: 'Online',
    requirements: '',
    grade_from: 8,
    grade_to: 11,
    deadline: '',
    link: '',
    image_url: '',
    is_published: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        type: opportunity.type || 'Олимпиада',
        category: opportunity.category || 'STEM',
        format: opportunity.format || 'Online',
        requirements: opportunity.requirements || '',
        grade_from: opportunity.grade_from || 8,
        grade_to: opportunity.grade_to || 11,
        deadline: opportunity.deadline || '',
        link: opportunity.link || '',
        image_url: opportunity.image_url || '',
        is_published: opportunity.is_published === true || opportunity.is_published === 'true' || opportunity.is_published === 'Yes',
      })
    }
  }, [opportunity])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { uploadFile } = await import('@/lib/database')
        const url = await uploadFile(file, 'opportunities')
        setFormData({ ...formData, image_url: url })
      } catch (err) {
        setError('Ошибка загрузки изображения: ' + err.message)
      }
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Название возможности обязательно')
      return
    }

    if (!formData.deadline) {
      setError('Дедлайн обязателен')
      return
    }

    try {
      setLoading(true)
      setError('')

      let savedOpportunity
      if (opportunity) {
        savedOpportunity = await updateOpportunity(opportunity.id, formData)
      } else {
        savedOpportunity = await createOpportunity(formData)
      }

      onSave && onSave(savedOpportunity)
      onClose()
    } catch (err) {
      setError(err.message || 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-neutral-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900">
          <h2 className="text-2xl font-bold text-white">
            {opportunity ? 'Редактировать возможность' : 'Создать новую возможность'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Название
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Международная олимпиада по физике"
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Подробное описание возможности"
              rows="3"
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Тип
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                {OPPORTUNITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Категория
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Формат
              </label>
              <select
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Дедлайн
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Требования
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="Требования к участникам"
              rows="2"
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Класс (от)
              </label>
              <input
                type="number"
                name="grade_from"
                value={formData.grade_from}
                onChange={handleInputChange}
                min="1"
                max="12"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Класс (до)
              </label>
              <input
                type="number"
                name="grade_to"
                value={formData.grade_to}
                onChange={handleInputChange}
                min="1"
                max="12"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Ссылка на возможность
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Изображение возможности
            </label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                {formData.image_url && (
                  <div className="mb-3 flex gap-2 items-start">
                    <img 
                      src={formData.image_url} 
                      alt="preview" 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-neutral-400 truncate">{formData.image_url}</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="text-xs text-red-400 hover:text-red-300 mt-1"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={formData.is_published}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
            />
            <label htmlFor="is_published" className="text-sm text-neutral-300">
              Опубликовать возможность
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 justify-end p-6 border-t border-neutral-800 bg-neutral-900">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}