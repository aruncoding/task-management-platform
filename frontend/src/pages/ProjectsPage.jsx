import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ProjectsPage () {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  function loadProjects () {
    setLoading(true)
    api.get('/projects')
      .then((res) => setProjects(res.data.projects))
      .catch(() => setError('Could not load projects'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function handleCreate (e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await api.post('/projects', { name, description })
      setName('')
      setDescription('')
      loadProjects()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4 mb-4">
          <h4>New project</h4>
          <form onSubmit={handleCreate}>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <textarea
                className="form-control"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create project'}
            </button>
          </form>
        </div>

        <div className="col-md-8">
          <h4>Your projects</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <p>Loading...</p>}
          {!loading && projects.length === 0 && <p className="text-muted">You're not on any projects yet.</p>}
          <div className="list-group">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{p.name}</div>
                  {p.description && <div className="text-muted small">{p.description}</div>}
                </div>
                <span className="badge bg-secondary text-uppercase">{p.myRole}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
