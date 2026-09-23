import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="px-4 py-10 text-center text-slate-500">Açılıyor…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-600">
        Bu sayfaya erişim yetkiniz yok.
      </div>
    );
  }

  return children;
}
