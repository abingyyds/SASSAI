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
    { to: '/topup', label: 'Recharge / Top up', icon: CreditCard, auth: true },
    { to: '/logs', label: 'Call logs', icon: BarChart3, auth: true },
    { to: '/tasks', label: 'Tasks', icon: Layers3, auth: true },
    { to: '/packages', label: 'Packages / Plans', icon: PackageCheck },
    ...(site?.allow_sub_dist ? [{ to: '/sub-site', label: 'Sub-site / Distributor', icon: Building2 }] : []),
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

  return (
    <div className="min-h-screen bg-[#fbfcff] text-slate-950">
      {site?.announcement && (
        <div className="border-b border-cyan-100 bg-cyan-50 px-4 py-2 text-center text-sm text-cyan-800">
          {site.announcement}
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-none" onClick={() => setMobileMenuOpen(false)}>
            {site?.logo ? (
              <img src={site.logo} alt={siteName} className="h-8 w-auto max-w-[140px] object-contain sm:max-w-[180px]" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                {siteName.charAt(0)}
              </span>
            )}
            <span className="truncate text-base font-semibold tracking-normal text-slate-950">{siteName}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {publicNavItems.map((item) => {
              const { to, label, icon: Icon } = item;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item)
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
            <div
              className="relative py-2"
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
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(consoleNavItem)
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <LayoutDashboard size={16} />
                Console
                <ChevronDown size={14} className={`transition-transform ${consoleMenuOpen ? 'rotate-180' : ''}`} />
              </Link>

              {consoleMenuOpen && (
                <div className="absolute left-0 top-full z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10" role="menu">
                  {user && (
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                      <p className="text-xs text-slate-500">Account</p>
                    </div>
                  )}
                  {consoleMenuItems.map((item) => {
                    const { label, icon: Icon } = item;
                    return (
                      <Link
                        key={item.to}
                        to={navTarget(item)}
                        role="menuitem"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive(item)
                            ? 'bg-slate-950 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                  {user && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center gap-3 rounded-lg border-t border-slate-100 px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
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
              <div className="hidden max-w-[210px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 sm:flex">
                <span className="truncate">{displayName}</span>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <nav className="mx-auto flex max-h-[calc(100dvh-4rem)] max-w-7xl flex-col gap-1 overflow-y-auto px-4 py-3">
              {publicNavItems.map((item) => {
                const { to, label, icon: Icon } = item;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeMenus}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive(item) ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-slate-100 pt-3">
                <Link
                  to={consolePath}
                  onClick={closeMenus}
                  className={`inline-flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive(consoleNavItem) ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Console
                </Link>
                <div className="mt-1 grid gap-1 pl-0 sm:pl-3">
                  {consoleMenuItems.map((item) => {
                    const { label, icon: Icon } = item;
                    return (
                      <Link
                        key={item.to}
                        to={navTarget(item)}
                        onClick={closeMenus}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                          isActive(item) ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
              {user && (
                <div className="mt-2 border-t border-slate-100 pt-3">
                  <div className="px-3 pb-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{displayName}</p>
                    <p className="text-xs text-slate-500">Account</p>
                  </div>
                  <div className="grid gap-1 pl-3">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <LogOut size={15} />
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
              {!user && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <Link to="/login" onClick={closeMenus} className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={closeMenus} className="rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>&copy; {new Date().getFullYear()} {siteName}. AI model marketplace and API gateway.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/models" className="hover:text-slate-950">Models</Link>
            <Link to="/rankings" className="hover:text-slate-950">Rankings</Link>
            <Link to="/docs/quickstart" className="hover:text-slate-950">Docs</Link>
            <Link to={user ? '/tokens' : '/login'} className="hover:text-slate-950">API Keys</Link>
            <Link to="/packages" className="hover:text-slate-950">{t('nav.packages')}</Link>
            <Link to={user ? '/logs' : '/login'} className="hover:text-slate-950">Logs</Link>
            <Link to="/apps" className="hover:text-slate-950">Apps</Link>
            {site?.contact_email && (
              <a href={`mailto:${site.contact_email}`} className="hover:text-slate-950">
                {t('nav.contact')}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
