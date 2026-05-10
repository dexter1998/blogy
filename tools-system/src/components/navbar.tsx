import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/tools", label: "Tools" },
  { href: "/docs-api", label: "API Docs" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-app bg-app/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-white text-sm">
            B
          </span>
          <span>Blogy Tools</span>
          <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-fg">
            beta
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-fg transition hover:bg-muted hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle className="ml-2" />
        </nav>
      </div>
    </header>
  );
}
