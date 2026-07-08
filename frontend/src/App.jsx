import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Chamados from './pages/Chamados/Chamados'
import NovoChamado from './pages/Chamados/NovoChamado/NovoChamado'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'
import { getStoredSession, login, logout, register } from './services/auth'

function App() {
  const [session, setSession] = useState(() => getStoredSession())
  const navigate = useNavigate()

  async function handleLogin(credentials) {
    const nextSession = await login(credentials)

    setSession(nextSession)
    navigate('/')
  }

  async function handleRegister(input) {
    const nextSession = await register(input)

    setSession(nextSession)
    navigate('/')
  }

  function handleLogout() {
    logout()
    setSession(null)
    navigate('/login')
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={handleLogin} onRegister={handleRegister} />
          )
        }
      />
      <Route
        path="/"
        element={
          session ? (
            <Home session={session} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados"
        element={
          session ? (
            <Chamados session={session} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados/novo"
        element={
          session ? (
            <NovoChamado session={session} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
