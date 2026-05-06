import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import MyResources from './pages/MyResources';

import ResourceDetail from './pages/ResourceDetail';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import RequestBoard from './pages/RequestBoard';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path="/requests" element={<RequestBoard />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
        <Route path="/resource/:id" element={<ResourceDetail />} />
        <Route path="/my-resources" element={<PrivateRoute><MyResources /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
