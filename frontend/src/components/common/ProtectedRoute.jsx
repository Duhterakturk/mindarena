import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { hasStoredSession } from "../../api/client";

export default function ProtectedRoute({ children, role }) {
  const { t } = useTranslation();
  const { user, loading, connecting } = useAuth();

  if (!user && (loading || connecting || hasStoredSession())) {
    return <p className="px-4 py-10 text-center text-slate-500">{t("auth.connecting")}</p>;
  }
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
