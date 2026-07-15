import { useState } from 'react'
import styles from './Login.module.css'

function PrimeiroAcesso({ onChangePassword, onLogout }) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const newPassword = String(formData.get('new_password') || '')
    const confirmPassword = String(formData.get('confirm_password') || '')

    if (newPassword !== confirmPassword) {
      setError('As senhas precisam ser iguais.')
      setIsSubmitting(false)
      return
    }

    try {
      await onChangePassword({ newPassword })
    } catch (changeError) {
      setError(changeError.message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginPanel} aria-label="Primeiro acesso">
        <form className={styles.card} onSubmit={handleSubmit}>
          <h1>Primeiro acesso</h1>
          <div className={styles.divider}></div>

          <p className={styles.helperText}>
            Para continuar, defina uma nova senha para sua conta de equipe.
          </p>

          <label className={styles.field}>
            <span>Nova senha</span>
            <input type="password" name="new_password" minLength={8} maxLength={72} required />
          </label>

          <label className={styles.field}>
            <span>Confirmar senha</span>
            <input type="password" name="confirm_password" minLength={8} maxLength={72} required />
          </label>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Aguarde...' : 'Salvar nova senha'}
          </button>

          <button className={styles.modeButton} type="button" onClick={onLogout}>
            Sair
          </button>
        </form>
      </section>
    </main>
  )
}

export default PrimeiroAcesso
