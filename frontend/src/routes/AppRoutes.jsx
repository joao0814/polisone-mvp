import { Navigate, Route, Routes } from 'react-router-dom'
import Chamados from '../pages/Chamados/Chamados'
import DetalheChamado from '../pages/Chamados/DetalheChamado/DetalheChamado'
import NovoChamado from '../pages/Chamados/NovoChamado/NovoChamado'
import Login from '../pages/Login/Login'
import Home from '../pages/Home/Home'

function AppRoutes({ session, onLogin, onRegister, onLogout }) {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={onLogin} onRegister={onRegister} />
          )
        }
      />
      <Route
        path="/"
        element={
          session ? (
            <Home session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados"
        element={
          session ? (
            <Chamados session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados/novo"
        element={
          session ? (
            <NovoChamado session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados/:id"
        element={
          session ? (
            <DetalheChamado session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default AppRoutes
