import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, CreditCard, Home, KeyRound, LogOut, Menu, Settings2, Sparkles, X } from 'lucide-react';
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

  const siteName = site?.name || 'AstraLayer';
  const navItems = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/pricing', label: t('nav.pricing'), icon: BarChart3 },
    { to: '/packages', label: t('nav.packages'), icon: CreditCard },
    ...(user ? [
      { to: '/dashboard', label: t('nav.dashboard'), icon: Sparkles },
      { to: '/tokens', label: t('nav.apiKeys'), icon: KeyRound },
    ] : []),
    ...(user?.is_admin || user?.role === 'admin' ? [
      { to: '/site-admin/saas', label: 'SaaS Admin', icon: Settings2 },
    ] : []),
  ];

  const isActive = (to) => location.pathname === to;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#fbfcff] text-slate-950">
      {site?.announcement && (
        <div className="border-b border-cyan-100 bg-cyan-50 px-4 py-2 text-center text-sm text-cyan-800">
          {site.announcement}
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            {site?.logo ? (
              <img src={site.logo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                {siteName.charAt(0)}
              </span>
            )}
            <span className="truncate text-base font-semibold tracking-normal text-slate-950">{siteName}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitch className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" />
            {user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <span className="max-w-[160px] truncate text-sm text-slate-500">
                  {user.display_name || user.username}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                  aria-label={t('nav.logout')}
                >
                  <LogOut size={17} />
                </button>
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
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(to) ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              {!user && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white">
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
          <p>&copy; {new Date().getFullYear()} {siteName}. SaaS billing powered by subscription checkout.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/packages" className="hover:text-slate-950">{t('nav.packages')}</Link>
            <Link to="/pricing" className="hover:text-slate-950">{t('nav.pricing')}</Link>
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
