import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Servicos from './pages/Servicos'
import Barbeiros from './pages/Barbeiros'
import Perfil from './pages/Perfil'
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
