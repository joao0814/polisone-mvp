import { useState } from 'react'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'
import { getStoredSession, login, logout, register } from './services/auth'

function App() {
  const [session, setSession] = useState(() => getStoredSession())

  async function handleLogin(credentials) {
    const nextSession = await login(credentials)

    setSession(nextSession)
  }

  async function handleRegister(input) {
    const nextSession = await register(input)

    setSession(nextSession)
  }

  function handleLogout() {
    logout()
    setSession(null)
  }

  if (session) {
    return <Home session={session} onLogout={handleLogout} />
  }

  return <Login onLogin={handleLogin} onRegister={handleRegister} />
}

export default App
