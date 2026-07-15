import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { changePassword, getStoredSession, login, logout, register, updateStoredUser } from './services/auth'

function App() {
  const [session, setSession] = useState(() => getStoredSession())
  const navigate = useNavigate()

  async function handleLogin(credentials) {
    const nextSession = await login(credentials)

    setSession(nextSession)
    navigate(nextSession.user?.must_change_password ? '/primeiro-acesso' : '/')
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

  function handleUserUpdate(user) {
    const nextSession = updateStoredUser(user)
    if (nextSession) setSession(nextSession)
  }

  async function handleChangePassword(input) {
    const nextSession = await changePassword(input)
    setSession(nextSession)
    navigate('/')
  }

  return (
    <AppRoutes
      session={session}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
      onChangePassword={handleChangePassword}
    />
  )
}

export default App
