import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import VolunteerLayout from './components/VolunteerLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Fields from './pages/admin/Fields';
import Volunteers from './pages/admin/Volunteers';
import VolunteerProfile from './pages/admin/VolunteerProfile';
import Points from './pages/admin/Points';
import AdminTasks from './pages/admin/Tasks';
import AdminAppeals from './pages/admin/Appeals';
import AdminFunding from './pages/admin/Funding';
import Expenses from './pages/admin/Expenses';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminNotifications from './pages/admin/Notifications';
import AdminPointsCategories from './pages/admin/PointsCategories';
import AdminMeetings from './pages/admin/Meetings';
import CertificatePreview from './pages/admin/CertificatePreview';
import WebsiteManagement from './pages/admin/WebsiteManagement';
import Magazines from './pages/admin/Magazines';
import Shoutouts from './pages/admin/Shoutouts';
import AdminMessages from './pages/admin/Messages';

import VolunteerDashboard from './pages/volunteer/Dashboard';
import MyTasks from './pages/volunteer/MyTasks';
import MyPoints from './pages/volunteer/MyPoints';
import AppealForm from './pages/volunteer/AppealForm';
import ChangePassword from './pages/volunteer/ChangePassword';
import UploadReport from './pages/volunteer/UploadReport';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="fields" element={<Fields />} />
            <Route path="points-categories" element={<AdminPointsCategories />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="volunteers/:id" element={<VolunteerProfile />} />
            <Route path="points" element={<Points />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="appeals" element={<AdminAppeals />} />
            <Route path="funding" element={<AdminFunding />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="meetings" element={<AdminMeetings />} />
            <Route path="certificate" element={<CertificatePreview />} />
            <Route path="website" element={<WebsiteManagement />} />
            <Route path="magazines" element={<Magazines />} />
            <Route path="shoutouts" element={<Shoutouts />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>

          {/* Volunteer Routes */}
          <Route path="/volunteer" element={
            <ProtectedRoute role="volunteer"><VolunteerLayout /></ProtectedRoute>
          }>
            <Route index element={<VolunteerDashboard />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="points" element={<MyPoints />} />
            <Route path="appeals" element={<AppealForm />} />
            <Route path="upload-report" element={<UploadReport />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
