import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'

export default function ProjectMembersPage () {
  const { id } = useParams()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [adding, setAdding] = useState(false)

  function loadMembers () {
    setLoading(true)
    api.get(`/projects/${id}/members`)
      .then((res) => setMembers(res.data.members))
      .catch(() => setError('Could not load members (admin access required)'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleAdd (e) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      await api.post(`/projects/${id}/members`, { email, role })
      setEmail('')
      setRole('member')
      loadMembers()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member')
    } finally {
      setAdding(false)
    }
  }

  async function handleRoleChange (memberId, newRole) {
    try {
      await api.patch(`/projects/${id}/members/${memberId}`, { role: newRole })
      loadMembers()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change role')
    }
  }

  async function handleRemove (memberId) {
    if (!window.confirm('Remove this member from the project?')) return
    try {
      await api.delete(`/projects/${id}/members/${memberId}`)
      loadMembers()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove member')
    }
  }

  return (
    <div className="container">
      <Link to={`/projects/${id}`} className="d-inline-block mb-3">&larr; Back to board</Link>
      <h4>Members</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      <form className="row g-2 mb-4" onSubmit={handleAdd}>
        <div className="col-md-5">
          <input
            type="email"
            className="form-control"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-4">
          <button type="submit" className="btn btn-primary w-100" disabled={adding}>
            {adding ? 'Adding...' : 'Add member'}
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.user.name}</td>
                <td>{m.user.email}</td>
                <td style={{ maxWidth: 150 }}>
                  <select className="form-select form-select-sm" value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)}>
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(m.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
