export function Footer() {
  return (
    <div className="footer">
      <div className="footer-links">
        <a href="https://reown.com" target="_blank" rel="noreferrer">
          Reown
        </a>{' '}
        •{' '}
        <a href="https://docs.reown.com" target="_blank" rel="noreferrer">
          Docs
        </a>{' '}
        •{' '}
        <a href="https://github.com/reown-com/appkit" target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        •{' '}
        <a href="https://dashboard.reown.com" target="_blank" rel="noreferrer">
          Cloud
        </a>
      </div>
      <p className="warning">
        This project ID only works on localhost. Visit our Dashboard to get your own.
      </p>
    </div>
  )
}
