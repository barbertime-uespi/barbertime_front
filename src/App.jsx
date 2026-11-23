import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Servicos from './pages/Servicos'
import Barbeiros from './pages/Barbeiros'
import Perfil from './pages/Perfil'
import Agendar from './pages/Agendar'
import Agendamentos from './pages/Agendamentos'
import AdminBarbeiros from './pages/AdminBarbeiros'
import AdminServicos from './pages/AdminServicos'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Telas de autenticação sem a casca (navbar/footer) */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Área principal com navbar + footer */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/barbeiros" element={<Barbeiros />} />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        {/* Cliente: novo agendamento */}
        <Route
          path="/agendar"
          element={
            <ProtectedRoute roles={['cliente']}>
              <Agendar />
            </ProtectedRoute>
          }
        />

        {/* Lista de agendamentos: cliente (os seus), barbeiro (sua agenda), admin (todos) */}
        <Route
          path="/agendamentos"
          element={
            <ProtectedRoute roles={['cliente', 'barbeiro', 'admin']}>
              <Agendamentos />
            </ProtectedRoute>
          }
        />

        {/* Administrador */}
        <Route
          path="/admin/barbeiros"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminBarbeiros />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/servicos"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminServicos />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
