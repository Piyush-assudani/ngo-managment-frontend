import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineCollection,
  HiOutlineStar,
  HiOutlineClipboardList,
  HiOutlineChatAlt2,
  HiOutlineCurrencyRupee,
  HiOutlinePhotograph,
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineCalendar,
  HiOutlineGlobeAlt,
  HiOutlineSpeakerphone,
  HiOutlineBookOpen
} from 'react-icons/hi';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: <HiOutlineViewGrid />, label: 'Dashboard', end: true },
    { path: '/admin/fields', icon: <HiOutlineCollection />, label: 'Volunteer Fields' },
    { path: '/admin/points-categories', icon: <HiOutlineCollection />, label: 'Points Categories' },
    { path: '/admin/volunteers', icon: <HiOutlineUserGroup />, label: 'Volunteers' },
    { path: '/admin/points', icon: <HiOutlineStar />, label: 'Points' },
    { path: '/admin/tasks', icon: <HiOutlineClipboardList />, label: 'Tasks' },
    { path: '/admin/appeals', icon: <HiOutlineChatAlt2 />, label: 'Appeals' },
    { path: '/admin/reports', icon: <HiOutlinePhotograph />, label: 'Daily Reports' },
    { path: '/admin/meetings', icon: <HiOutlineCalendar />, label: 'Meetings' },
    { path: '/admin/funding', icon: <HiOutlineCurrencyRupee />, label: 'Funding' },
    { path: '/admin/shoutouts', icon: <HiOutlineSpeakerphone />, label: 'Funders Shoutout' },
    { path: '/admin/notifications', icon: <HiOutlineBell />, label: 'Announcements' },
    { path: '/admin/messages', icon: <HiOutlineChatAlt2 />, label: 'Messages' },
    { path: '/admin/website', icon: <HiOutlineGlobeAlt />, label: 'Website Mgmt' },
    { path: '/admin/magazines', icon: <HiOutlineBookOpen />, label: 'Magazines' },
    { path: '/admin/settings', icon: <HiOutlineCog />, label: 'Settings' }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="EnVision" className="logo-img" />
            <div className="logo-text">
              <h2>EnVision</h2>
              <span>Admin Panel</span>
            </div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Admin'}</p>
            <p className="user-role">Administrator</p>
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

export default AdminSidebar;
