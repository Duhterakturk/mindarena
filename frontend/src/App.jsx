import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import BadgeToastHost from "./components/badges/BadgeToastHost";
import StarCelebration from "./components/stars/StarCelebration";

import Home from "./pages/Home";
import Games from "./pages/Games";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Dashboard from "./pages/Dashboard";
import Exam from "./pages/Exam";
import TeacherPanel from "./pages/TeacherPanel";
import Board from "./pages/Board";

function Shell() {
  const location = useLocation();
  const onBoard = location.pathname.startsWith("/board");
  return (
    <>
      {!onBoard && <Navbar />}
      <main key={location.pathname} className={onBoard ? undefined : "page-enter"}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:slug" element={<GamePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />
          <Route
            path="/exam"
            element={
              <ProtectedRoute>
                <Exam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/board/:slug"
            element={
              <ProtectedRoute role="teacher">
                <Board />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!onBoard && <BadgeToastHost />}
      {!onBoard && <StarCelebration />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
