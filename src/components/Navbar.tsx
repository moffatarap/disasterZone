import logo from '../assets/media/img/logo_white.svg'
import './Navbar.css'

interface NavbarProps {
  address: string | null
  onToggleSidebar: () => void
}

export function Navbar({ address, onToggleSidebar }: NavbarProps) {
  return (
    <header className="navbar">
      <img className="navbar__logo" src={logo} alt="" />
      <h1 className="navbar__title">Disaster Zone</h1>
      {address && <p className="navbar__address">{address}</p>}
      <button
        type="button"
        className="navbar__sidebar-toggle"
        onClick={onToggleSidebar}
        aria-label="Show and hide the list of recent events"
      >
        ☰
      </button>
    </header>
  )
}
