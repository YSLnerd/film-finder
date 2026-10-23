import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, isAdmin } from '../hooks/useUser';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const admin = isAdmin();

  const link = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-4 py-2 rounded transition ${active ? 'bg-indigo-700' : 'hover:bg-indigo-600'} text-white font-semibold`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">Film Finder</Link>

        <div className="flex gap-2">
          {link('/', 'Подбор')}
          {link('/search', 'Поиск')}
          {link('/stats', 'Статистика')}
          {link('/profile', 'Профиль')}
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}