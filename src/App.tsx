import React from 'react';
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 32, color: 'red' }}>Something went wrong rendering the app.</div>;
    }
    return this.props.children;
  }
}
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { ProfileCard } from './components/ProfileCard';
import { ProfileEditor } from './components/ProfileEditor';
import { FeedbackComposer } from './components/FeedbackComposer';
import { FeedbackList } from './components/FeedbackList';
import { AbsenceForm } from './components/AbsenceForm';
import { AbsenceList } from './components/AbsenceList';
import { TeamDirectory } from './components/TeamDirectory';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './hooks/useAuthStore';
import { logout as apiLogout } from './api/logout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    // Only log if actually redirecting
    console.log('ProtectedRoute: redirecting to /');
    return <Navigate to="/" replace />;
  }
  // Only log if actually rendering children
  console.log('ProtectedRoute: rendering children');
  return <>{children}</>;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  // Only log once per render
  React.useEffect(() => {
    console.log('App token:', token);
  }, [token]);
  const clearToken = useAuthStore((state) => state.clearToken);

  const handleLogout = async () => {
    await apiLogout();
    clearToken();
    navigate('/', { replace: true });
  };

  return (
    <ErrorBoundary>
      <>
        {token && (
          <>
            <nav className="w-full flex items-center justify-between p-2 bg-gray-100 border-b">
              <div className="flex gap-4">
                <Link to="/me" className="text-blue-600 hover:underline">Profile</Link>
                <Link to="/edit" className="text-blue-600 hover:underline">Edit Profile</Link>
                <Link to="/feedback" className="text-blue-600 hover:underline">Leave Feedback</Link>
                <Link to="/feedback-list" className="text-blue-600 hover:underline">Feedback List</Link>
                <Link to="/absence" className="text-blue-600 hover:underline">Request Absence</Link>
                <Link to="/absences" className="text-blue-600 hover:underline">My Absences</Link>
                <Link to="/team" className="text-blue-600 hover:underline">Team Directory</Link>
              </div>
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Logout</button>
            </nav>
          </>
        )}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/me" element={<ProtectedRoute><ProfileCard /></ProtectedRoute>} />
          <Route path="/edit" element={<ProtectedRoute><ProfileEditor /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><FeedbackComposer /></ProtectedRoute>} />
          <Route path="/feedback-list" element={<ProtectedRoute><FeedbackList /></ProtectedRoute>} />
          <Route path="/absence" element={<ProtectedRoute><AbsenceForm /></ProtectedRoute>} />
          <Route path="/absences" element={<ProtectedRoute><AbsenceList /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamDirectory /></ProtectedRoute>} />
          {/* Add more routes as needed */}
        </Routes>
      </>
    </ErrorBoundary>
  );
};

export default App;
