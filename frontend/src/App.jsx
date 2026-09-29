import { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import './App.css'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [vista, setVista] = useState('login') // 'login' o 'registro'

  useEffect(() => {
    fetch('http://localhost:3000/api/auth/me', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((datos) => { if (datos) setUsuario(datos) })
  }, [])

  return (
    <>
      <header className="barra">
        <span>Seguro social universitario</span>
        
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
        ) : vista === 'login' ? (
          <LoginForm onLogin={setUsuario} onIrRegistro={() => setVista('registro')} />
        ) : (
          <RegisterForm onRegister={setUsuario} onVolver={() => setVista('login')} />
        )}
      </main>
    </>
  )
}