import { Link } from 'react-router-dom'

const STATUSES = ['todo', 'in_progress', 'review', 'done']
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' }

const PRIORITY_COLORS = { low: 'secondary', medium: 'info', high: 'warning', urgent: 'danger' }

export default function TaskCard ({ task, projectId, canMove, onStatusChange }) {
  return (
    <div className="card mb-2 task-card">
      <div className="card-body p-2">
        <Link to={`/projects/${projectId}/tasks/${task.id}`} className="text-decoration-none">
          <div className="fw-semibold">{task.title}</div>
        </Link>
        <div className="d-flex align-items-center justify-content-between mt-1">
          <span className={`badge bg-${PRIORITY_COLORS[task.priority] || 'secondary'}`}>{task.priority}</span>
          <span className="small text-muted">{task.assignee ? task.assignee.name : 'Unassigned'}</span>
        </div>
        <select
          className="form-select form-select-sm mt-2"
          value={task.status}
          disabled={!canMove}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
