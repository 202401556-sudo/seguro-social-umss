import { useState } from 'react'

export default function RegisterForm({ onRegister, onVolver }) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, correo, contrasena }),
      })
      const datos = await res.json()

      if (!res.ok) {
        setError(datos.error || 'No se pudo registrar')
        return
      }
      onRegister(datos.user)
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="tarjeta" onSubmit={handleSubmit}>
      <h2>CREAR CUENTA</h2>

      <label>Nombre completo:</label>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />

      <label>Correo:</label>
      <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

      <label>Contraseña:</label>
      <input type="password" value={contrasena}
             onChange={(e) => setContrasena(e.target.value)} required minLength={8} />

      <label>Confirmar contraseña:</label>
      <input type="password" value={confirmar}
             onChange={(e) => setConfirmar(e.target.value)} required minLength={8} />

      {error && <p className="error" role="alert">{error}</p>}

      <button className="btn-principal" type="submit" disabled={cargando}>
        {cargando ? 'Creando cuenta...' : 'Registrarse'}
      </button>
      <button className="btn-google" type="button" onClick={onVolver}>
        Ya tengo cuenta
      </button>
    </form>
  )
}