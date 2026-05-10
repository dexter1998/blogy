import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-app">
      <div className="container flex flex-col gap-2 py-6 text-sm text-muted-fg sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Blogy Tools — Public estimation engines, transparent scoring.</p>
        <div className="flex items-center gap-4">
          <Link href="/tools" className="hover:text-fg">Tools</Link>
          <Link href="/docs-api" className="hover:text-fg">API</Link>
          <Link href="/methodology" className="hover:text-fg">Methodology</Link>
        </div>
      </div>
    </footer>
  );
}
