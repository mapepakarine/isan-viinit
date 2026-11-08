import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import BottomBar from './components/BottomBar';
import { primaryButton } from './components/buttonStyles';
import { ChartIcon, GlassIcon, PlusIcon, SettingsIcon } from './components/Icons';
import UpdateBanner from './components/UpdateBanner';
import { fi } from './i18n/fi';
import { requestPersistence } from './lib/storage';
import AddEditWine from './routes/AddEditWine';
import Home from './routes/Home';
import Settings from './routes/Settings';
import WineCard from './routes/WineCard';

const Stats = lazy(() => import('./routes/Stats'));

const navItems: { to: string; label: string; end: boolean; icon: ComponentType }[] = [
  { to: '/', label: fi.nav.home, end: true, icon: GlassIcon },
  { to: '/stats', label: fi.nav.stats, end: false, icon: ChartIcon },
  { to: '/settings', label: fi.nav.settings, end: false, icon: SettingsIcon },
];

function MainNav() {
  const { pathname } = useLocation();

  return (
    <BottomBar label={fi.nav.label}>
      {navItems.map(({ to, label, end, icon: NavIcon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          // Tapping the current tab returns to the top of a long list.
          onClick={() => pathname === to && window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={({ isActive }) =>
            `flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center text-[0.85rem] ${
              isActive ? 'font-bold text-wine' : 'text-muted'
            }`
          }
        >
          <NavIcon />
          {label}
        </NavLink>
      ))}
      {/* The most used action sits on the far right, under the right thumb. */}
      <Link to="/wines/new" className={`${primaryButton} shrink-0 !px-4`}>
        <PlusIcon />
        {fi.nav.add}
      </Link>
    </BottomBar>
  );
}

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    void requestPersistence();
  }, []);

  // Home restores its own scroll position; every other screen starts from the top.
  useEffect(() => {
    if (pathname !== '/') window.scrollTo(0, 0);
  }, [pathname]);

  // Wine screens bring their own bottom bar with the actions that matter there.
  const showNav = !pathname.startsWith('/wines');

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] pt-[env(safe-area-inset-top)]">
      <UpdateBanner />
      <main className="px-4 pt-5 pb-28">
        <Suspense fallback={<p className="text-muted">{fi.loading}</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wines/new" element={<AddEditWine />} />
            <Route path="/wines/:id" element={<WineCard />} />
            <Route path="/wines/:id/edit" element={<AddEditWine />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
      {showNav && <MainNav />}
    </div>
  );
}
