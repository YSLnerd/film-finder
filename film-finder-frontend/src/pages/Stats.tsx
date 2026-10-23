import { useState } from 'react';
import api from '../api/client';

interface GenreStat {
  genre: string;
  count: number;
}

export default function Stats() {
  const [stats, setStats] = useState<GenreStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const handleShow = async () => {
    setLoading(true);
    setShown(true);
    try {
      const res = await api.get('/stats/popular-genres');
      setStats(res.data);
    } catch {
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = stats.length > 0 ? stats[0].count : 1;
  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Статистика
        </h1>

        <button
          onClick={handleShow}
          disabled={loading}
          className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold mb-6 disabled:bg-gray-500"
        >
          {loading ? 'Загрузка...' : 'Сформировать'}
        </button>

        <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-6 min-h-[300px]">
          <h2 className="text-xl font-bold mb-4 text-white">
            Любимые жанры
          </h2>

          {!shown && (
            <p className="text-gray-300 text-center mt-20">
              Нажмите «Сформировать», чтобы увидеть статистику
            </p>
          )}

          {shown && !loading && stats.length === 0 && (
            <p className="text-gray-300 text-center mt-20">
              Нет данных для отображения
            </p>
          )}

          {shown && stats.length > 0 && (
            <div className="space-y-4">
              {stats.map((s, idx) => (
                <div key={s.genre} className="flex items-center gap-3">
                  <span className="w-6 text-gray-300 text-sm">
                    {idx + 1}
                  </span>
                  <span className="w-32 text-white font-medium truncate">
                    {s.genre}
                  </span>
                  <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-white font-semibold">
                    {s.count}
                  </span>
                </div>
              ))}

              <p className="mt-6 text-right text-gray-300 text-sm">
                Всего найдено: {total}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}