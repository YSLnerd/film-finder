import { useNavigate } from 'react-router-dom';

export default function AdminEditList() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-indigo-300 mb-4"
        >
          ← Назад
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Редактирование списка
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Доступные */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Доступные элементы</h3>
            <div className="border-2 border-gray-200 rounded p-3 min-h-[300px] text-gray-300 text-sm">
              Нет доступных элементов
            </div>
          </div>

          {/* Выбранные */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Выбранные элементы</h3>
            <div className="border-2 border-gray-200 rounded p-3 min-h-[300px] text-gray-300 text-sm">
              Нет выбранных элементов
            </div>
          </div>
        </div>

        <button className="mt-6 w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold">
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}