import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false }) => {
  const { user, loading, isAdmin, isManager } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (requireManager && !isManager) {
    return <Navigate to="/" replace />
  }

  return children
}