import { useState } from 'react'
import LoginForm from './LoginForm'
import './App.css'

export default function App() {
  const [usuario, setUsuario] = useState(null)

  return (
    <>
      <header className="barra">
        <span>Seguro social universitario</span>
        <span>{usuario ? usuario.nombre : 'Iniciar Sesión'}</span>
      </header>
      <main className="contenido">
        {usuario ? (
          <div className="tarjeta">
            <h2>BIENVENIDO</h2>
            <p>Sesión iniciada como {usuario.correo}</p>
            <button className="btn-principal" onClick={() => setUsuario(null)}>
              Salir
            </button>
          </div>
        ) : (
          <LoginForm onLogin={setUsuario} />
        )}
      </main>
    </>
  )
}