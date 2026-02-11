import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminScenarios from "./pages/AdminScenarios.jsx";
import Workspace from "./pages/Workspace.jsx";
import AdminReview from "./pages/AdminReview.jsx";
import FeedbackView from "./pages/FeedbackView.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:scenarioId"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scenarios"
            element={
              <ProtectedRoute requireAdmin>
                <AdminScenarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute requireAdmin>
                <Navigate to="/admin/review" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review/:designId"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback/:designId"
            element={
              <ProtectedRoute>
                <FeedbackView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
