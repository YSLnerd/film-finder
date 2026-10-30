import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import PersonDetail from './pages/PersonDetail';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import AdminUserEdit from './pages/AdminUserEdit';
import AdminMovieNew from './pages/AdminMovieNew';
import AdminPersonNew from './pages/AdminPersonNew';
import AdminGenres from './pages/AdminGenres';


function App() {
  return (
    <BrowserRouter>
      {/* Постоянное отображение навигационной панели */}
      <Navbar />
      
      <Routes>
        {/* Публичные маршруты (доступны всем) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Защищённые маршруты (требуют авторизации) */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/movies/:id" element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
        <Route path="/persons/:id" element={<ProtectedRoute><PersonDetail /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Административные маршруты (требуют права администратора) */}
        <Route path="/admin/users/:id" element={<ProtectedRoute adminOnly><AdminUserEdit /></ProtectedRoute>} />
        <Route path="/admin/movies/new" element={<ProtectedRoute adminOnly><AdminMovieNew /></ProtectedRoute>} />
        <Route path="/admin/movies/:id/edit" element={<ProtectedRoute adminOnly><AdminMovieNew /></ProtectedRoute>} />
        <Route path="/admin/directors/new" element={<ProtectedRoute adminOnly><AdminPersonNew /></ProtectedRoute>} />
        <Route path="/admin/actors/new" element={<ProtectedRoute adminOnly><AdminPersonNew /></ProtectedRoute>} />
        <Route path="/admin/directors/:id/edit" element={<ProtectedRoute adminOnly><AdminPersonNew /></ProtectedRoute>} />
        <Route path="/admin/actors/:id/edit" element={<ProtectedRoute adminOnly><AdminPersonNew /></ProtectedRoute>} />
        <Route path="/admin/genres" element={<ProtectedRoute adminOnly><AdminGenres /></ProtectedRoute>} />

        {/* Перенаправление для всех несуществующих путей */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;