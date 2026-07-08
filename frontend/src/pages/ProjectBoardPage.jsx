import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' }
]

export default function ProjectBoardPage () {
  const { id } = useParams()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [myRole, setMyRole] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [creating, setCreating] = useState(false)

  function loadAll () {
    setLoading(true)
    setError('')
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/members`),
      api.get(`/projects/${id}/tasks`, { params: { limit: 100, sortBy: 'position', order: 'asc' } })
    ])
      .then(([projectRes, membersRes, tasksRes]) => {
        setProject(projectRes.data.project)
        const membership = membersRes.data.members.find((m) => m.user.id === user.id)
        setMyRole(membership ? membership.role : null)
        setTasks(tasksRes.data.tasks)
      })
      .catch(() => setError('Could not load this project'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const canManage = myRole === 'admin' || myRole === 'manager'

  async function handleCreateTask (e) {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post(`/projects/${id}/tasks`, { title, priority })
      setTitle('')
      setPriority('medium')
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create task')
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusChange (taskId, status) {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status })
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not move task')
    }
  }

  function canMoveTask (task) {
    if (canManage) return true
    return task.assigneeId === user.id
  }

  if (loading) return <div className="container">Loading...</div>

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3>{project?.name}</h3>
          {project?.description && <p className="text-muted">{project.description}</p>}
        </div>
        <div className="d-flex gap-2">
          {myRole === 'admin' && (
            <Link to={`/projects/${id}/members`} className="btn btn-outline-secondary btn-sm">Members</Link>
          )}
        </div>
      </div>

      {canManage && (
        <form className="row g-2 mb-4" onSubmit={handleCreateTask}>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="New task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100" disabled={creating}>
              {creating ? 'Adding...' : 'Add task'}
            </button>
          </div>
        </form>
      )}

      <div className="row">
        {COLUMNS.map((col) => (
          <div key={col.key} className="col-md-3">
            <div className="board-column p-2 mb-3">
              <h6 className="text-uppercase text-muted">{col.label}</h6>
              {tasks.filter((t) => t.status === col.key).length === 0 && (
                <p className="text-muted small">No tasks</p>
              )}
              {tasks.filter((t) => t.status === col.key).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectId={id}
                  canMove={canMoveTask(task)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
