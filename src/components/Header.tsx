import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header>
      <div className="mx-auto flex w-full flex-wrap items-start justify-between px-4 py-[11px] sm:px-8">
        <Link
          to="/"
          className="order-1 flex flex-col no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <span className="text-[18px] leading-[22px] font-semibold text-foreground">
            sideDesert
          </span>
          <span className="text-[12px] leading-[16px] text-muted-foreground">
            / thoughts in open spaces
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 mt-3 flex w-full justify-center gap-x-8 text-[13px] leading-[28px] font-normal sm:order-2 sm:mt-0 sm:ml-auto sm:mr-14 sm:w-auto sm:justify-start sm:gap-x-9 sm:leading-[22px]"
        >
          <Link
            to="/"
            className="nav-link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'nav-link is-active' }}
          >
            [ home ]
          </Link>
          <Link
            to="/blog"
            className="nav-link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'nav-link is-active' }}
          >
            [ blog ]
          </Link>
          <Link
            to="/projects"
            className="nav-link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'nav-link is-active' }}
          >
            [ projects ]
          </Link>
          <Link
            to="/about"
            className="nav-link focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'nav-link is-active' }}
          >
            [ about ]
          </Link>
        </nav>

        <div className="order-2 -mt-[11px] sm:order-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
