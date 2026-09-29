import { useState } from 'react'

  export default function LoginForm({ onLogin, onIrRegistro }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ correo, contrasena }),
      })
      const datos = await res.json()

      if (!res.ok) {
        setError(datos.error || 'No se pudo iniciar sesión')
        return
      }
      onLogin(datos.user)
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={handleSubmit}>
      <h2>INICIAR SESIÓN</h2>

      <label>Correo:</label>
      <input
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />

      <label>Contraseña:</label>
      <div className="campo-clave">
        <input
          type={mostrar ? 'text' : 'password'}
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        <button type="button" onClick={() => setMostrar(!mostrar)}>
          {mostrar ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <button className="btn-principal" type="submit" disabled={cargando}>
        {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
      </button>
      <button className="btn-google" type="button">Iniciar con Google</button>

      <p style={{ textAlign: 'center', marginTop: 14, fontSize: 14 }}>
        ¿No tienes cuenta?{' '}
         <button type="button" className="link-registro" onClick={onIrRegistro}>
         Regístrate
         </button>
        </p>
    </form>
  )
}