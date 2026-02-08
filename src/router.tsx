import { Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import Leaderboard from "./pages/Leaderboard";
import CoachPanel from "./pages/CoachPanel";
import Profile from "./pages/Profile";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/use-auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
};

export const routers = [
  {
    path: "/auth",
    name: 'auth',
    element: <Auth />,
  },
  {
    path: "/",
    name: 'home',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/check-in",
    name: 'check-in',
    element: (
      <ProtectedRoute>
        <CheckIn />
      </ProtectedRoute>
    ),
  },
  {
    path: "/leaderboard",
    name: 'leaderboard',
    element: (
      <ProtectedRoute>
        <Leaderboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach",
    name: 'coach',
    element: (
      <ProtectedRoute>
        <CoachPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    name: 'profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    name: '404',
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
