interface PageBackLinkProps {
  children: React.ReactNode
  onClick?: () => void
}

export function PageBackLink({ children, onClick }: PageBackLinkProps) {
  function handleClick() {
    if (onClick) {
      onClick()
      return
    }
    window.history.back()
  }

  return (
    <button type="button" className="rs-back-link" onClick={handleClick}>
      {children}
    </button>
  )
}
