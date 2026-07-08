import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['todo', 'in_progress', 'review', 'done']

export default function TaskDetailPage () {
  const { id: projectId, taskId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [members, setMembers] = useState([])
  const [myRole, setMyRole] = useState(null)
  const [comments, setComments] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)

  function loadAll () {
    setLoading(true)
    Promise.all([
      api.get(`/tasks/${taskId}`),
      api.get(`/projects/${projectId}/members`),
      api.get(`/tasks/${taskId}/comments`),
      api.get(`/projects/${projectId}/activity`, { params: { limit: 100 } })
    ])
      .then(([taskRes, membersRes, commentsRes, activityRes]) => {
        const t = taskRes.data.task
        setTask(t)
        setTitle(t.title)
        setDescription(t.description || '')
        setPriority(t.priority)
        setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '')
        setMembers(membersRes.data.members)
        const membership = membersRes.data.members.find((m) => m.user.id === user.id)
        setMyRole(membership ? membership.role : null)
        setComments(commentsRes.data.comments)
        setActivity(activityRes.data.activity.filter((a) => a.metadata && Number(a.metadata.taskId) === Number(taskId)))
      })
      .catch(() => setError('Could not load this task'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const canManage = myRole === 'admin' || myRole === 'manager'
  const canMoveStatus = canManage || task?.assigneeId === user.id

  async function handleSaveDetails (e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.patch(`/tasks/${taskId}`, { title, description, priority, dueDate: dueDate || null })
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update task')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange (status) {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status })
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change status')
    }
  }

  async function handleAssign (assigneeId) {
    try {
      await api.patch(`/tasks/${taskId}/assign`, { assigneeId: assigneeId || null })
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reassign task')
    }
  }

  async function handleDelete () {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete task')
    }
  }

  async function handleAddComment (e) {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      await api.post(`/tasks/${taskId}/comments`, { body: newComment })
      setNewComment('')
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add comment')
    }
  }

  if (loading) return <div className="container">Loading...</div>
  if (!task) return <div className="container">Task not found</div>

  return (
    <div className="container">
      <Link to={`/projects/${projectId}`} className="d-inline-block mb-3">&larr; Back to board</Link>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-7">
          <form onSubmit={handleSaveDetails}>
            <div className="mb-2">
              <label className="form-label">Title</label>
              <input
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canManage}
                required
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canManage}
              />
            </div>
            <div className="row">
              <div className="col-6 mb-2">
                <label className="form-label">Priority</label>
                <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={!canManage}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="col-6 mb-2">
                <label className="form-label">Due date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!canManage}
                />
              </div>
            </div>
            {canManage && (
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            )}
          </form>

          <hr />

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={task.status}
              disabled={!canMoveStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label">Assignee</label>
            <select
              className="form-select"
              value={task.assigneeId || ''}
              disabled={!canManage}
              onChange={(e) => handleAssign(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {canManage && (
            <button className="btn btn-outline-danger btn-sm mb-4" onClick={handleDelete}>Delete task</button>
          )}

          <h5>Comments</h5>
          {comments.length === 0 && <p className="text-muted">No comments yet</p>}
          <ul className="list-group mb-3">
            {comments.map((c) => (
              <li key={c.id} className="list-group-item">
                <div className="fw-semibold">{c.user.name}</div>
                <div>{c.body}</div>
                <div className="text-muted small">{new Date(c.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddComment} className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Post</button>
          </form>
        </div>

        <div className="col-md-5">
          <h5>Activity</h5>
          {activity.length === 0 && <p className="text-muted">No activity yet</p>}
          <ul className="list-group">
            {activity.map((a) => (
              <li key={a.id} className="list-group-item small">
                <span className="fw-semibold">{a.actor?.name || 'System'}</span> {describeAction(a)}
                <div className="text-muted">{new Date(a.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function describeAction (activity) {
  switch (activity.action) {
    case 'task_created': return 'created this task'
    case 'task_status_changed': return `changed status from ${activity.metadata.from} to ${activity.metadata.to}`
    case 'task_reassigned': return 'reassigned this task'
    case 'comment_added': return 'added a comment'
    case 'task_due_soon': return 'this task is due soon'
    case 'task_overdue': return 'this task is overdue'
    default: return activity.action
  }
}
