import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertCircle, Calendar } from 'lucide-react'
import OpportunityBuilder from '@/components/admin/OpportunityBuilder'
import { getOpportunities, deleteOpportunity } from '@/lib/database'

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingOpp, setEditingOpp] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      const data = await getOpportunities()
      setOpportunities(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingOpp(null)
    setShowBuilder(true)
  }

  const handleEdit = (opp) => {
    setEditingOpp(opp)
    setShowBuilder(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены?')) return

    try {
      setDeleting(id)
      await deleteOpportunity(id)
      await loadOpportunities()
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async () => {
    await loadOpportunities()
    setShowBuilder(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isExpired = (deadline) => {
    return new Date(deadline) < new Date()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-neutral-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Возможности</h1>
          <p className="text-neutral-400">
            Олимпиады, хакатоны, гранты и другие возможности
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
        >
          <Plus size={20} />
          Создать возможность
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {opportunities.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
          <div className="text-neutral-500 text-lg mb-4">🎯 Нет возможностей</div>
          <p className="text-neutral-600 text-sm mb-6">
            Начните добавлять возможности, нажав кнопку выше
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            <Plus size={16} />
            Добавить первую возможность
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className={`border rounded-xl p-6 transition ${
                isExpired(opp.deadline)
                  ? 'bg-neutral-900/50 border-neutral-800/50'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{opp.title}</h3>
                    <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full font-medium">
                      {opp.type}
                    </span>
                    {opp.is_published === true || opp.is_published === 'true' || opp.is_published === 'Yes' ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                        Активна
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full font-medium">
                        Черновик
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-400 text-sm mb-3">{opp.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                    <span>🏷️ {opp.category}</span>
                    <span>📍 {opp.format}</span>
                    <span>👥 {opp.grade_from}-{opp.grade_to} класс</span>
                    <span className={`flex items-center gap-1 ${
                      isExpired(opp.deadline) ? 'text-red-400' : 'text-orange-400'
                    }`}>
                      <Calendar size={14} />
                      {formatDate(opp.deadline)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(opp)}
                    className="p-2.5 text-neutral-400 hover:text-primary-400 hover:bg-neutral-800 rounded-lg transition"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(opp.id)}
                    disabled={deleting === opp.id}
                    className="p-2.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showBuilder && (
        <OpportunityBuilder
          opportunity={editingOpp}
          onClose={() => setShowBuilder(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}