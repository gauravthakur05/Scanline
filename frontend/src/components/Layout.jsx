import { Link, NavLink } from "react-router-dom";
import { ScanLine } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/analyze", label: "Analyzer" },
  { to: "/how-it-works", label: "How it works" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-paper">
              <ScanLine size={17} strokeWidth={2.25} />
            </span>
            Scanline
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "text-ink bg-panel" : "text-ink-soft hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/analyze"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-signal-dark"
          >
            Analyze resume
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line">
        <div className="container-page py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">Scanline — no sign-up, nothing stored on our servers.</p>
          <p className="label-mono">Built for realistic, explainable ATS scoring</p>
        </div>
      </footer>
    </div>
  );
}
