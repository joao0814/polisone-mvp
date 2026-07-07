import { useState } from 'react'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (isAuthenticated) {
    return <Home />
  }

  return <Login onLogin={() => setIsAuthenticated(true)} />
}

export default App
