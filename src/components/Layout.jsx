import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Casca comum das páginas internas: navbar + conteúdo + rodapé.
export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container page">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          BarberTime © {new Date().getFullYear()} — agendamentos para barbearias.
        </div>
      </footer>
    </div>
  )
}
