import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectBoardPage from './pages/ProjectBoardPage'
import ProjectMembersPage from './pages/ProjectMembersPage'
import TaskDetailPage from './pages/TaskDetailPage'

function App () {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectBoardPage /></ProtectedRoute>} />
        <Route path="/projects/:id/members" element={<ProtectedRoute><ProjectMembersPage /></ProtectedRoute>} />
        <Route path="/projects/:id/tasks/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </>
  )
}

export default App
