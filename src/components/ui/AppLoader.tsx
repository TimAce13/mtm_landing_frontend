import styles from './AppLoader.module.css'

/** Full-screen spinner shown during startup auth check */
export default function AppLoader() {
  return (
    <div className={styles.wrap}>
      <span className={styles.spinner} />
    </div>
  )
}
