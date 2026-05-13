import './button.css'

export function Button({ className = '', children, ...props }) {
  return (
    <button className={`button ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  )
}
