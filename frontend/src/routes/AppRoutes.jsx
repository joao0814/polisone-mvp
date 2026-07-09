import { Navigate, Route, Routes } from 'react-router-dom'
import Chamados from '../pages/Chamados/Chamados'
import DetalheChamado from '../pages/Chamados/DetalheChamado/DetalheChamado'
import Emendas from '../pages/Emendas/Emendas'
import NovoChamado from '../pages/Chamados/NovoChamado/NovoChamado'
import GestaoCampanha from '../pages/GestaoCampanha/GestaoCampanha'
import InteligenciaEleitoral from '../pages/InteligenciaEleitoral/InteligenciaEleitoral'
import Login from '../pages/Login/Login'
import Home from '../pages/Home/Home'
import Municipios from '../pages/Municipios/Municipios'
import PesquisaCampo from '../pages/PesquisaCampo/PesquisaCampo'

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
      <Route
        path="/gestao-campanha"
        element={
          session ? (
            <GestaoCampanha session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/inteligencia-eleitoral"
        element={
          session ? (
            <InteligenciaEleitoral session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/municipios"
        element={
          session ? (
            <Municipios session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/emendas"
        element={
          session ? (
            <Emendas session={session} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/pesquisa-campo"
        element={
          session ? (
            <PesquisaCampo session={session} onLogout={onLogout} />
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
