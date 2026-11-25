import { Link } from "@tanstack/react-router";
import { useSandClickAudio } from "#/lib/hooks/useSandClickAudio";
import ThemeToggle from "./ThemeToggle";

const navLinkClass =
  "text-muted-foreground no-underline hover:text-foreground hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

export default function Header() {
  const playSandClick = useSandClickAudio();

  function handleNavClick() {
    void playSandClick();
  }

  return (
    <header>
      <div className="mx-auto pb-4 flex w-[min(100rem,calc(100%-2*clamp(1rem,4.35vw,5rem)))] flex-wrap items-start justify-between pt-[18px] header-wide:flex-nowrap">
        <Link
          to="/"
          className="order-1 flex flex-col no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <span className="text-xl leading-6 font-semibold text-foreground">
            sideDesert
          </span>
          <span className="text-sm leading-[18px] text-muted-foreground">
            / thoughts in open spaces
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="order-3 mt-2 flex w-full flex-wrap justify-evenly gap-x-2 text-xs leading-7 whitespace-nowrap sm:justify-center sm:gap-x-8 sm:text-sm header-wide:order-2 header-wide:mt-1 header-wide:mr-16 header-wide:ml-auto header-wide:w-auto header-wide:flex-nowrap header-wide:justify-start header-wide:gap-x-[42px]"
        >
          <Link
            to="/"
            className={navLinkClass}
            activeOptions={{ exact: true }}
            onClick={handleNavClick}
          >
            [ home ]
          </Link>
          <Link
            to="/blog"
            className={navLinkClass}
            activeOptions={{ exact: true }}
            onClick={handleNavClick}
          >
            [ blog ]
          </Link>
          <Link
            to="/projects"
            className={navLinkClass}
            activeOptions={{ exact: true }}
            onClick={handleNavClick}
          >
            [ projects ]
          </Link>
          <Link
            to="/about"
            className={navLinkClass}
            activeOptions={{ exact: true }}
            onClick={handleNavClick}
          >
            [ about ]
          </Link>
        </nav>

        <div className="order-2 -mt-1 -mr-2 header-wide:order-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
