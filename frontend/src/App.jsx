import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Bookings from './pages/Bookings'
import { useAuthStore } from './store/auth'

function App() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/search" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/search" />} />
        <Route path="/search" element={user ? <Search /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user?.role === 'professional' ? <Profile /> : <Navigate to="/search" />} />
        <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/bookings" element={user ? <Bookings /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
