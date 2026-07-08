import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
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
    <AppRoutes
      session={session}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onLogout={handleLogout}
    />
  )
}

export default App
