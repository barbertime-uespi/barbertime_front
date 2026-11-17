export default function Loader({ texto = 'Carregando...' }) {
  return (
    <div className="center-box">
      <div className="spinner" />
      <span>{texto}</span>
    </div>
  )
}
