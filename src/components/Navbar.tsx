import logo from '../assets/media/img/logo_white.svg'

interface NavbarProps {
  address: string | null
  onToggleSidebar: () => void
}

export function Navbar({ address, onToggleSidebar }: NavbarProps) {
  return (
    <header className="relative z-10 flex items-center gap-3 bg-slate-800 px-4 py-2.5 text-white shadow-sm">
      <img className="h-8 w-8" src={logo} alt="" />
      <h1 className="text-base font-semibold tracking-tight whitespace-nowrap">Disaster Zone</h1>
      {address && (
        <p className="min-w-0 flex-1 truncate text-sm font-light text-white/80">{address}</p>
      )}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Show and hide the list of recent events"
        className="ml-auto flex h-11 w-11 flex-none items-center justify-center rounded-full text-lg transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        ☰
      </button>
    </header>
  )
}
