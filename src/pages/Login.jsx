import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { HiOutlineShieldCheck, HiOutlineUserCircle, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const [loginType, setLoginType] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { loginAdmin, loginVolunteer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (loginType === 'admin') {
        await loginAdmin(username, password);
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        await loginVolunteer(volunteerId, password);
        toast.success('Welcome back!');
        navigate('/volunteer');
      }
    } catch (error) {
      console.error('Login Error:', error);
      let msg = 'Unknown error occurred.';
      
      if (error.response) {
        // Server responded with a status code outside 2xx range
        msg = error.response.data?.message || `Server Error: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received (Network error, CORS, or server down)
        msg = 'Network Error: Cannot connect to server. Please check your internet connection or backend URL.';
      } else {
        // Something else happened while setting up the request
        msg = error.message;
      }
      
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/logo.webp" alt="EnVision Foundation" className="login-logo-img" />
            <h1>EnVision Foundation</h1>
            <p className="login-tagline">Learning Beyond Books</p>
            <p className="login-motive">Educating, empowering and bringing out the hidden creativity in under privileged children and helping them educate and bring out their skills</p>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          <div className="login-type-toggle">
            <button
              className={`toggle-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => setLoginType('admin')}
            >
              <HiOutlineShieldCheck />
              <span>Admin</span>
            </button>
            <button
              className={`toggle-btn ${loginType === 'volunteer' ? 'active' : ''}`}
              onClick={() => setLoginType('volunteer')}
            >
              <HiOutlineUserCircle />
              <span>Volunteer</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {loginType === 'admin' ? (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="volunteerId">Volunteer ID</label>
                <input
                  id="volunteerId"
                  type="text"
                  placeholder="e.g. VOL-0001"
                  value={volunteerId}
                  onChange={(e) => setVolunteerId(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '4px', border: '1px solid #f87171' }}>
                {errorMsg}
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loader"></span>
              ) : (
                <>Sign In</>
              )}
            </button>
          </form>
        </div>
      </div>
      <footer style={{ position: 'absolute', bottom: '1rem', textAlign: 'center', width: '100%', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Designed and developed by <a href="https://piyushassudani.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Piyush Assudani</a>, Founder Assudani Developer | Contact: 9413879444
      </footer>
    </div>
  );
};

export default Login;
