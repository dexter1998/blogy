"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { type ReactNode } from "react";

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return <>{children}</>;
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
        {children}
      </main>
      <Footer />
    </>
  );
}
