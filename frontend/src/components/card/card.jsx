import './card.css'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Card({ className = '', ...props }) {
  return <div data-slot="card" className={cx('card', className)} {...props} />
}

function CardHeader({ className = '', ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cx('card-header', className)}
      {...props}
    />
  )
}

function CardTitle({ className = '', ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cx('card-title', className)}
      {...props}
    />
  )
}

function CardDescription({ className = '', ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cx('card-description', className)}
      {...props}
    />
  )
}

function CardAction({ className = '', ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cx('card-action', className)}
      {...props}
    />
  )
}

function CardContent({ className = '', ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cx('card-content', className)}
      {...props}
    />
  )
}

function CardFooter({ className = '', ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cx('card-footer', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
