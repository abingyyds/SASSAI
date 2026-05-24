import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  ChevronDown,
  CreditCard,
  Home,
  KeyRound,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PackageCheck,
  Settings2,
  Trophy,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import LanguageSwitch from '../../components/LanguageSwitch';

export default function SaasLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { site } = useSite();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [consoleMenuOpen, setConsoleMenuOpen] = useState(false);
  const closeConsoleTimer = useRef(null);

  const siteName = site?.name || 'AstraLayer';
  const isAdmin = user?.is_admin || user?.role === 'admin';
  const displayName = user?.display_name || user?.username;
  const consolePath = user ? '/dashboard' : '/login';
  const publicNavItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/models', label: 'Models', icon: Boxes, prefix: '/models' },
    { to: '/rankings', label: 'Rankings', icon: Trophy },
    { to: '/chat', label: 'Chat', icon: MessageSquareText, aliases: ['/playground'] },
    { to: '/docs/quickstart', label: 'Docs', icon: BookOpen, prefix: '/docs' },
  ];
  const consoleMenuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, auth: true },
    { to: '/tokens', label: 'API Keys', icon: KeyRound, auth: true },
    { to: '/topup', label: 'Recharge', icon: CreditCard, auth: true },
    { to: '/logs', label: 'Call logs', icon: BarChart3, auth: true },
    { to: '/tasks', label: 'Tasks', icon: Layers3, auth: true },
    { to: '/packages', label: 'Plans', icon: PackageCheck },
    ...(site?.allow_sub_dist ? [{ to: '/sub-site', label: 'Sub-site', icon: Building2 }] : []),
    ...(isAdmin ? [{ to: '/site-admin/saas', label: 'SaaS Admin', icon: Settings2, auth: true }] : []),
  ];
  const consoleNavItem = {
    to: consolePath,
    label: 'Console',
    icon: LayoutDashboard,
    aliases: ['/dashboard', '/tokens', '/logs', '/tasks', '/topup', '/packages', '/sub-site', '/site-admin/saas'],
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    if (item.prefix && location.pathname.startsWith(item.prefix)) return true;
    if (item.aliases?.some((alias) => location.pathname === alias || location.pathname.startsWith(`${alias}/`))) return true;
    return location.pathname === item.to;
  };

  const navTarget = (item) => (item.auth && !user ? '/login' : item.to);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setConsoleMenuOpen(false);
  };

  const cancelConsoleClose = () => {
    if (closeConsoleTimer.current) {
      clearTimeout(closeConsoleTimer.current);
      closeConsoleTimer.current = null;
    }
  };

  const openConsoleMenu = () => {
    cancelConsoleClose();
    setConsoleMenuOpen(true);
  };

  const scheduleConsoleClose = () => {
    cancelConsoleClose();
    closeConsoleTimer.current = setTimeout(() => {
      setConsoleMenuOpen(false);
      closeConsoleTimer.current = null;
    }, 180);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    closeMenus();
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setConsoleMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => () => cancelConsoleClose(), []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <div className="coss-page">
      {site?.announcement && (
        <div className="border-b border-slate-200 bg-slate-950 px-4 py-2 text-center text-sm font-medium text-white">
          {site.announcement}
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl">
        <div className="coss-container flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            {site?.logo ? (
              <img src={site.logo} alt={siteName} className="h-8 w-auto max-w-[138px] object-contain sm:max-w-[180px]" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-950 shadow-sm">
                {siteName.charAt(0)}
              </span>
            )}
            <span className="truncate text-base font-semibold text-slate-950">{siteName}</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1 md:flex">
            {publicNavItems.map((item) => (
              <HeaderNavLink key={item.to} item={item} active={isActive(item)} />
            ))}
            <div
              className="relative"
              onMouseEnter={openConsoleMenu}
              onMouseLeave={scheduleConsoleClose}
              onFocus={openConsoleMenu}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setConsoleMenuOpen(false);
                }
              }}
            >
              <Link
                to={consolePath}
                aria-haspopup="menu"
                aria-expanded={consoleMenuOpen}
                onClick={(event) => {
                  if (user) {
                    event.preventDefault();
                    cancelConsoleClose();
                    setConsoleMenuOpen(true);
                  }
                }}
                className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  isActive(consoleNavItem)
                    ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm'
                }`}
              >
                <LayoutDashboard size={15} />
                Console
                <ChevronDown size={14} className={`transition-transform ${consoleMenuOpen ? 'rotate-180' : ''}`} />
              </Link>

              {consoleMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/12" role="menu">
                  {user && (
                    <div className="mb-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                      <p className="text-xs text-slate-500">Signed in</p>
                    </div>
                  )}
                  <div className="grid gap-1">
                    {consoleMenuItems.map((item) => (
                      <ConsoleMenuLink key={item.to} item={item} to={navTarget(item)} active={isActive(item)} />
                    ))}
                  </div>
                  {user && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <LogOut size={16} />
                      {t('nav.logout')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitch className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" />
            {user ? (
              <Link to="/dashboard" className="hidden max-w-[210px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:flex">
                <span className="truncate">{displayName}</span>
              </Link>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="coss-button-ghost">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="coss-button-primary px-4 py-2">
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/28 backdrop-blur-sm md:hidden" role="presentation" onClick={closeMenus}>
          <div
            className="ml-auto flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={closeMenus}>
                {site?.logo ? (
                  <img src={site.logo} alt={siteName} className="h-8 w-auto max-w-[150px] object-contain" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-950 shadow-sm">
                    {siteName.charAt(0)}
                  </span>
                )}
                <span className="truncate text-base font-semibold text-slate-950">{siteName}</span>
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                onClick={closeMenus}
                aria-label="Close menu"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
              <div>
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Explore</p>
                <div className="mt-2 grid gap-1">
                  {publicNavItems.map((item) => (
                    <MobileNavLink key={item.to} item={item} to={item.to} active={isActive(item)} onClick={closeMenus} />
                  ))}
                </div>
              </div>

              <div>
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Console</p>
                <div className="mt-2 grid gap-1">
                  <MobileNavLink item={consoleNavItem} to={consolePath} active={isActive(consoleNavItem)} onClick={closeMenus} />
                  {consoleMenuItems.map((item) => (
                    <MobileNavLink key={item.to} item={item} to={navTarget(item)} active={isActive(item)} onClick={closeMenus} />
                  ))}
                </div>
              </div>

              {user && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                  <p className="mt-1 text-xs text-slate-500">Signed in</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    <LogOut size={15} />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </nav>

            {!user && (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-4">
                <Link to="/login" onClick={closeMenus} className="coss-button-secondary px-3 py-2">
                  {t('nav.login')}
                </Link>
                <Link to="/register" onClick={closeMenus} className="coss-button-primary px-3 py-2">
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="coss-container py-8">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:grid-cols-3">
            <FooterGroup title="Explore" links={[
              { to: '/models', label: 'Models' },
              { to: '/rankings', label: 'Rankings' },
              { to: '/docs/quickstart', label: 'Docs' },
            ]} />
            <FooterGroup title="Console" links={[
              { to: user ? '/tokens' : '/login', label: 'API Keys' },
              { to: user ? '/logs' : '/login', label: 'Call logs' },
              { to: '/apps', label: 'Apps' },
            ]} />
            <div>
              <p className="text-sm font-semibold text-slate-950">{siteName}</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Model APIs, plans, and usage tools in one focused workspace.</p>
              {site?.contact_email && (
                <a href={`mailto:${site.contact_email}`} className="mt-3 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-950">
                  {t('nav.contact')}
                </a>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/packages" className="hover:text-slate-950">{t('nav.packages')}</Link>
              <Link to="/docs/quickstart" className="hover:text-slate-950">Quickstart</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeaderNavLink({ item, active }) {
  const { to, label, icon: Icon } = item;
  return (
    <Link
      to={to}
      className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${
        active
          ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm'
      }`}
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}

function ConsoleMenuLink({ item, to, active }) {
  const { label, icon: Icon } = item;
  return (
    <Link
      to={to}
      role="menuitem"
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? 'border-slate-200 bg-slate-950 text-white'
          : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ item, to, active, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold ${
        active
          ? 'border-slate-950 bg-slate-950 text-white'
          : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon size={17} />
      <span>{item.label}</span>
    </Link>
  );
}

function FooterGroup({ title, links }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <div className="mt-3 grid gap-2">
        {links.map((link) => (
          <Link key={`${link.to}-${link.label}`} to={link.to} className="text-sm text-slate-500 hover:text-slate-950">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
