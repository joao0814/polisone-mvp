import styles from './Login.module.css'

function Login({ onLogin }) {
  function handleSubmit(event) {
    event.preventDefault()
    onLogin()
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginPanel} aria-label="Area de login">
        <form className={styles.card} onSubmit={handleSubmit}>
          <h1>Login</h1>
          <div className={styles.divider}></div>

          <label className={styles.field}>
            <span>E-mail</span>
            <input type="email" name="email" autoComplete="email" />
          </label>

          <label className={styles.field}>
            <span>Senha</span>
            <input type="password" name="password" autoComplete="current-password" />
          </label>

          <button type="submit">Entrar</button>
          <a href="#recuperar-senha">Esqueci minha Senha</a>
        </form>
      </section>
    </main>
  )
}

export default Login
