"use client";

/**
 * Global navbar (client component) rendered on EVERY page from the root layout,
 * above <main id="main"> and after the skip link (the skip link still targets
 * #main, so it jumps PAST this nav — keyboard users skip the nav as intended).
 *
 * Session-aware via useSession() (server-hydrated → no anonymous→authenticated
 * flash). The role read here is decorative; proxy.ts + the backend authorize.
 * Active link is derived from usePathname() and marked aria-current="page".
 *
 * Responsive: desktop shows the links inline; below `sm` they collapse behind a
 * disclosure button (aria-expanded controls a panel) so nothing overflows on
 * mobile viewports.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/session/logout-button";
import { useSession } from "@/lib/session/session-context";
import { copy } from "@/lib/copy/es-AR";
import { navLinksFor, isActive, type NavLink } from "@/lib/nav/nav-links";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const session = useSession();
  // Derive "open" from the route instead of syncing via an effect: the panel is
  // open only while the pathname matches the one it was opened against, so any
  // navigation collapses it without a cascading setState-in-effect.
  const [openedAt, setOpenedAt] = React.useState<string | null>(null);
  const open = openedAt === pathname;

  const links = navLinksFor(session, copy.nav);

  const isAuthenticated = session.status === "authenticated";
  const role = session.user?.role;
  const roleLabel =
    role === "prestador" ? copy.nav.rolPrestador : copy.nav.rolCliente;

  return (
    <nav
      aria-label={copy.nav.landmark}
      className="border-b border-border-strong bg-surface"
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        {/* Left: brand → home, then a divider, then the always-on Buscar nav
            link — the divider + gap keep "Buscar" from reading as part of the
            wordmark (it is a distinct destination, not the logo). */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label={copy.nav.brandHome}
            aria-current={isActive(pathname, "/") ? "page" : undefined}
            className="rounded-md px-2 py-1 font-display text-lg font-semibold text-foreground hover:bg-surface-sunken"
          >
            {copy.nav.brand}
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-border-strong sm:block"
          />
          <NavTextLink
            href="/prestadores"
            label={copy.nav.buscar}
            pathname={pathname}
            className="hidden sm:inline-flex"
          />
        </div>

        {/* Desktop right side. */}
        <div className="hidden items-center gap-2 sm:flex">
          {isAuthenticated && (
            <span
              className="flex items-center gap-2"
              data-testid="nav-account"
            >
              {/* Role indicator — NOT a button: a muted dot + caption text, no
                  pill/border/elevation, so it never competes with the real
                  actions next to it (DESIGN-SYSTEM §5.1/§5.6). */}
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-muted-foreground"
                />
                {roleLabel}
              </span>
              {session.user?.name && session.user?.lastName ? (
                <span className="max-w-[20ch] truncate text-xs font-semibold text-foreground">
                  {session.user.name} {session.user.lastName}
                </span>
              ) : session.user?.email ? (
                <span className="max-w-[16ch] truncate text-xs text-muted-foreground">
                  {session.user.email}
                </span>
              ) : null}
            </span>
          )}
          {links.map((link) => (
            <NavAction key={link.key} link={link} pathname={pathname} />
          ))}
          {isAuthenticated && <LogoutButton />}
        </div>

        {/* Mobile disclosure toggle. */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-expanded={open}
          aria-controls="nav-mobile-panel"
          aria-label={open ? copy.nav.cerrarMenu : copy.nav.abrirMenu}
          onClick={() => setOpenedAt(open ? null : pathname)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile panel. Hidden from the a11y tree when collapsed. */}
      <div
        id="nav-mobile-panel"
        hidden={!open}
        className="flex flex-col gap-2 border-t border-border-strong px-4 py-3 sm:hidden"
      >
        <NavTextLink
          href="/prestadores"
          label={copy.nav.buscar}
          pathname={pathname}
          className="w-full justify-start"
        />
        {isAuthenticated && (
          <p className="px-2 text-xs text-muted-foreground" data-testid="nav-account-mobile">
            <span className="font-semibold text-foreground">{roleLabel}</span>
            {session.user?.name && session.user?.lastName
              ? <span className="font-semibold text-foreground">{` · ${session.user.name} ${session.user.lastName}`}</span>
              : session.user?.email
                ? ` · ${session.user.email}`
                : ""}
          </p>
        )}
        {links.map((link) => (
          <NavAction
            key={link.key}
            link={link}
            pathname={pathname}
            className="w-full justify-center"
          />
        ))}
        {isAuthenticated && <LogoutButton className="w-full" />}
      </div>
    </nav>
  );
}

/** A plain text nav link (Buscar) with active styling + aria-current. */
function NavTextLink({
  href,
  label,
  pathname,
  className,
}: {
  href: string;
  label: string;
  pathname: string;
  className?: string;
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground hover:bg-surface-sunken",
        active && "bg-surface-sunken",
        className,
      )}
    >
      {label}
    </Link>
  );
}

/** A session-derived action rendered as a Button-styled Link. */
function NavAction({
  link,
  pathname,
  className,
}: {
  link: NavLink;
  pathname: string;
  className?: string;
}) {
  const active = isActive(pathname, link.href);
  return (
    <Button
      asChild
      variant={link.primary ? "primary" : "outline"}
      size="sm"
      className={className}
    >
      <Link href={link.href} aria-current={active ? "page" : undefined}>
        {link.label}
      </Link>
    </Button>
  );
}
