import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar () {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout () {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/projects">Task Board</Link>
        {user && (
          <div className="d-flex align-items-center">
            <span className="text-light me-3">{user.name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}
