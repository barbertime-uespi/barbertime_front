import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

// Mensagens rápidas de sucesso/erro, usadas por todas as telas.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const contador = useRef(0)

  const remover = useCallback((id) => {
    setToasts((lista) => lista.filter((t) => t.id !== id))
  }, [])

  const mostrar = useCallback(
    (tipo, mensagem) => {
      const id = ++contador.current
      setToasts((lista) => [...lista, { id, tipo, mensagem }])
      setTimeout(() => remover(id), 4500)
    },
    [remover]
  )

  const valor = useMemo(
    () => ({
      sucesso: (mensagem) => mostrar('success', mensagem),
      erro: (mensagem) => mostrar('error', mensagem),
    }),
    [mostrar]
  )

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`} onClick={() => remover(t.id)}>
            {t.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}
