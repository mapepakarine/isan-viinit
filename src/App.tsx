import { lazy, Suspense, useEffect } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import UpdateBanner from './components/UpdateBanner';
import { fi } from './i18n/fi';
import { requestPersistence } from './lib/storage';
import AddEditWine from './routes/AddEditWine';
import Home from './routes/Home';
import Settings from './routes/Settings';
import WineCard from './routes/WineCard';

const Stats = lazy(() => import('./routes/Stats'));

const navItems = [
  { to: '/', label: fi.nav.home, end: true },
  { to: '/wines/new', label: fi.nav.add, end: true },
  { to: '/stats', label: fi.nav.stats, end: false },
  { to: '/settings', label: fi.nav.settings, end: false },
];

export default function App() {
  useEffect(() => {
    void requestPersistence();
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col pt-[env(safe-area-inset-top)]">
      <UpdateBanner />
      <main className="flex-1 px-4 py-4">
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
      <nav
        aria-label={fi.nav.label}
        className="sticky bottom-0 grid grid-cols-4 border-t border-line bg-cream pb-[env(safe-area-inset-bottom)]"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-14 items-center justify-center text-center font-semibold ${
                isActive ? 'bg-wine text-white' : 'text-ink'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
