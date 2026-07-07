import { useState } from 'react'
import styles from './Login.module.css'

function Login({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegisterMode = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      const credentials = {
        email: formData.get('email'),
        password: formData.get('password'),
      }

      if (isRegisterMode) {
        await onRegister({
          ...credentials,
          name: formData.get('name'),
        })
        return
      }

      await onLogin(credentials)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginPanel} aria-label="Area de login">
        <form className={styles.card} onSubmit={handleSubmit}>
          <h1>{isRegisterMode ? 'Criar conta' : 'Login'}</h1>
          <div className={styles.divider}></div>

          {isRegisterMode && (
            <label className={styles.field}>
              <span>Nome</span>
              <input type="text" name="name" autoComplete="name" maxLength={120} required />
            </label>
          )}

          <label className={styles.field}>
            <span>E-mail</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>

          <label className={styles.field}>
            <span>Senha</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde...' : isRegisterMode ? 'Criar e entrar' : 'Entrar'}
          </button>

          <button
            className={styles.modeButton}
            type="button"
            onClick={() => handleModeChange(isRegisterMode ? 'login' : 'register')}
          >
            {isRegisterMode ? 'Já tenho conta' : 'Criar conta'}
          </button>

          {!isRegisterMode && <a href="#recuperar-senha">Esqueci minha Senha</a>}
        </form>
      </section>
    </main>
  )
}

export default Login
