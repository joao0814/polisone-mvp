import { Navigate, Route, Routes } from 'react-router-dom'
import Chamados from '../pages/Chamados/Chamados'
import CheckIn from '../pages/CheckIn/CheckIn'
import DetalheChamado from '../pages/Chamados/DetalheChamado/DetalheChamado'
import Emendas from '../pages/Emendas/Emendas'
import Equipes from '../pages/Equipes/Equipes'
import NovoChamado from '../pages/Chamados/NovoChamado/NovoChamado'
import GestaoCampanha from '../pages/GestaoCampanha/GestaoCampanha'
import InteligenciaEleitoral from '../pages/InteligenciaEleitoral/InteligenciaEleitoral'
import Login from '../pages/Login/Login'
import PrimeiroAcesso from '../pages/Login/PrimeiroAcesso'
import Home from '../pages/Home/Home'
import Municipios from '../pages/Municipios/Municipios'
import PesquisaCampo from '../pages/PesquisaCampo/PesquisaCampo'
import Blog from '../pages/Blog/Blog'
import BlogPostDetail from '../pages/Blog/BlogPostDetail'
import BlogCreate from '../pages/Blog/BlogCreate'
import BlogManage from '../pages/Blog/BlogManage'
import PortalBannerAdmin from '../pages/PortalBannerAdmin/PortalBannerAdmin'
import MeusDados from '../pages/MeusDados/MeusDados'
import { canManageCommunications } from '../utils/communicationPermissions'

function AppRoutes({ session, onLogin, onRegister, onLogout, onUserUpdate, onChangePassword }) {
  const requiresPasswordChange = Boolean(session?.user?.must_change_password)

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
        path="/primeiro-acesso"
        element={
          session ? (
            <PrimeiroAcesso onChangePassword={onChangePassword} onLogout={onLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <Home session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <Chamados session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados/novo"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <NovoChamado session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/chamados/:id"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <DetalheChamado session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/meus-dados"
        element={session ? (requiresPasswordChange ? <Navigate to="/primeiro-acesso" replace /> : <MeusDados session={session} onLogout={onLogout} onUserUpdate={onUserUpdate} />) : <Navigate to="/login" replace />}
      />
      <Route
        path="/gestao-campanha"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <GestaoCampanha session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/inteligencia-eleitoral"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <InteligenciaEleitoral session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/municipios"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <Municipios session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/emendas"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <Emendas session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/equipes"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <Equipes session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/check-in"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <CheckIn session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/comunicados" element={session ? (requiresPasswordChange ? <Navigate to="/primeiro-acesso" replace /> : <Blog session={session} onLogout={onLogout} />) : <Navigate to="/login" replace />} />
      <Route path="/comunicados/novo" element={session ? (requiresPasswordChange ? <Navigate to="/primeiro-acesso" replace /> : (canManageCommunications(session.user) ? <BlogCreate session={session} onLogout={onLogout} /> : <Navigate to="/comunicados" replace />)) : <Navigate to="/login" replace />} />
      <Route path="/comunicados/admin" element={session ? (requiresPasswordChange ? <Navigate to="/primeiro-acesso" replace /> : (canManageCommunications(session.user) ? <BlogManage session={session} onLogout={onLogout} /> : <Navigate to="/comunicados" replace />)) : <Navigate to="/login" replace />} />
      <Route path="/banners/admin" element={session ? (requiresPasswordChange ? <Navigate to="/primeiro-acesso" replace /> : (canManageCommunications(session.user) ? <PortalBannerAdmin session={session} onLogout={onLogout} /> : <Navigate to="/" replace />)) : <Navigate to="/login" replace />} />
      <Route path="/comunicados/:slug" element={session ? (requiresPasswordChange ? <Navigate to="/primeiro-acesso" replace /> : <BlogPostDetail session={session} onLogout={onLogout} />) : <Navigate to="/login" replace />} />
      <Route
        path="/pesquisa-campo"
        element={
          session ? (
            requiresPasswordChange ? (
              <Navigate to="/primeiro-acesso" replace />
            ) : (
            <PesquisaCampo session={session} onLogout={onLogout} />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={session ? (requiresPasswordChange ? '/primeiro-acesso' : '/') : '/login'} replace />} />
    </Routes>
  )
}

export default AppRoutes
