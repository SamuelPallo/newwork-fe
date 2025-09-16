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
import { ManagerAbsenceList } from './components/ManagerAbsenceList';
import { TeamDirectory } from './components/TeamDirectory';
import { UserManagement } from './components/UserManagement';
import { AddUser } from './components/AddUser';
import { CompanyDirectory } from './components/CompanyDirectory';
import { UserEditor } from './components/UserEditor';
import { LoginPage } from './pages/LoginPage';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { RoleSelectorDialog } from './components/RoleSelectorDialog';
import { useAuthStore } from './hooks/useAuthStore';
import { useAuth } from './hooks/useAuth';
import { logout as apiLogout } from './api/logout';

import { useQueryClient } from '@tanstack/react-query';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const { activeRole, loading } = useAuth();
  if (loading) return <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>;
  if (!token || !activeRole) {
    // Block access until token and activeRole are set
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const { user, activeRole, setActiveRole } = useAuth();
  const isManagerProfile = activeRole === 'ROLE_MANAGER';
  const isAdminProfile = activeRole === 'ROLE_ADMIN';
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [token, queryClient]);
  const clearToken = useAuthStore((state) => state.clearToken);

  const handleLogout = async () => {
    await apiLogout();
    clearToken();
    navigate('/', { replace: true });
  };

  // Show role selection dialog if user has multiple roles and no activeRole selected
  const showRoleDialog = token && user?.roles && Array.isArray(user.roles) && user.roles.length > 1 && !activeRole;

  return (
    <ErrorBoundary>
      <>
        {showRoleDialog && (
          <RoleSelectorDialog roles={user.roles} activeRole={activeRole} setActiveRole={setActiveRole} />
        )}
        {token && !showRoleDialog && (
          <>
            <nav className="w-full flex items-center justify-between p-2 bg-gray-100 border-b">
              <div className="flex gap-4 items-center">
                <Link to="/me" className="text-blue-600 hover:underline">Profile</Link>
                {!isManagerProfile && !isAdminProfile && (
                  <>
                    <Link to="/edit" className="text-blue-600 hover:underline">Edit Profile</Link>
                    <Link to="/feedback" className="text-blue-600 hover:underline">Leave Feedback</Link>
                    <Link to="/absence" className="text-blue-600 hover:underline">Request Absence</Link>
                    <Link to="/absences" className="text-blue-600 hover:underline">My Absences</Link>
                  </>
                )}
                <Link to="/feedback-list" className="text-blue-600 hover:underline">Feedback List</Link>
                <Link to="/company-directory" className="text-blue-600 hover:underline">Company Directory</Link>
                {(isManagerProfile || isAdminProfile) && (
                  <>
                    <Link to="/user-management" className="text-blue-600 hover:underline">User Management</Link>
                    <Link to="/add-user" className="text-blue-600 hover:underline">Add User</Link>
                  </>
                )}
                {isManagerProfile && (
                  <Link to="/pending-absences" className="text-blue-600 hover:underline">Pending Absences</Link>
                )}
                {/* Profile switcher dropdown */}
                <ProfileSwitcher roles={user?.roles || []} activeRole={activeRole} setActiveRole={setActiveRole} />
              </div>
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Logout</button>
            </nav>
          </>
        )}
        {!showRoleDialog && (
          <Routes>
            <Route path="/" element={token && activeRole ? <Navigate to="/me" replace /> : <LoginPage />} />
            <Route path="/me" element={<ProtectedRoute><ProfileCard /></ProtectedRoute>} />
            <Route path="/edit" element={<ProtectedRoute><ProfileEditor /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><FeedbackComposer /></ProtectedRoute>} />
            <Route path="/feedback-list" element={<ProtectedRoute><FeedbackList /></ProtectedRoute>} />
            <Route path="/absence" element={<ProtectedRoute><AbsenceForm /></ProtectedRoute>} />
            <Route path="/absences" element={<ProtectedRoute><AbsenceList /></ProtectedRoute>} />
            {/* Team Directory route removed */}
            <Route path="/pending-absences" element={<ProtectedRoute><ManagerAbsenceList /></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
            <Route path="/edit-user/:id" element={
              <ProtectedRoute>
                {(isManagerProfile || isAdminProfile)
                  ? <UserEditor />
                  : <div style={{padding:32, color:'red'}}>Access denied: Only managers or admins can edit users.</div>
                }
              </ProtectedRoute>
            } />
            <Route path="/company-directory" element={<ProtectedRoute><CompanyDirectory /></ProtectedRoute>} />
          </Routes>
        )}
      </>
    </ErrorBoundary>
  );
};

export default App;
