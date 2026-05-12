export function Main({ children, className = '' }) {
  return <main className={`dashboard-main ${className}`.trim()}>{children}</main>
}
