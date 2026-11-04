import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineStar,
  HiOutlineChatAlt2,
  HiOutlineKey,
  HiOutlinePhotograph,
  HiOutlineLogout
} from 'react-icons/hi';

const VolunteerSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/volunteer', icon: <HiOutlineViewGrid />, label: 'Dashboard', end: true },
    { path: '/volunteer/tasks', icon: <HiOutlineClipboardList />, label: 'My Tasks' },
    { path: '/volunteer/points', icon: <HiOutlineStar />, label: 'My Points' },
    { path: '/volunteer/appeals', icon: <HiOutlineChatAlt2 />, label: 'Submit Appeal' },
    { path: '/volunteer/upload-report', icon: <HiOutlinePhotograph />, label: 'Upload Proofs' },
    { path: '/volunteer/change-password', icon: <HiOutlineKey />, label: 'Change Password' }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.webp" alt="EnVision" className="logo-img" />
            <div className="logo-text">
              <h2>EnVision</h2>
              <span>Volunteer Portal</span>
            </div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0) || 'V'}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Volunteer'}</p>
            <p className="user-role">ID: {user?.volunteerId || ''}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <HiOutlineLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default VolunteerSidebar;
