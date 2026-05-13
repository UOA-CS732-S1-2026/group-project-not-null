import './header.css'

export function Header({ title, eyebrow, actions, children }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button className="sidebar-trigger" type="button" aria-label="Toggle navigation">
          ≡
        </button>
        <span className="header-separator" aria-hidden="true" />

        {children ? (
          children
        ) : (
          <div>
            {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
            <h1>{title}</h1>
          </div>
        )}

        {!children && actions ? <div className="header-actions">{actions}</div> : null}
      </div>
    </header>
  )
}
