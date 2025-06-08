import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import {
  FiPlus,
  FiList,
  FiCalendar,
  FiLogOut,
  FiX,
  FiCheck,
  FiPackage,
} from "react-icons/fi";
import AddMachine from "./component/addMachine";
import AddComponent from "./component/addComponent";
import CompanyList from "./component/Comapnylist";
import WeeklyMachineSchedule from "./WeeklyMachineSchedule";
import Login from "./component/login";
import Signup from "./component/signup";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Header />
        <div className="right-section">
          {user && <Sidebar user={user} setUser={setUser} />}
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<Signup />} />

              {user ? (
                <>
                  <Route path="/add-machine" element={<AddMachine />} />
                  <Route path="/add-component" element={<AddComponent />} />
                  <Route path="/list-comapany" element={<CompanyList />} />
                  <Route
                    path="/machine-schedule/:id"
                    element={<WeeklyMachineSchedule />}
                  />
                </>
              ) : (
                <Route path="/" element={<Login setUser={setUser} />} />
              )}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

function Sidebar({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setUser(null);
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="sidebar">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-actions">
              <button className="logout-modal-cancel" onClick={cancelLogout}>
                <FiX /> Cancel
              </button>
              <button className="logout-modal-confirm" onClick={confirmLogout}>
                <FiCheck /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-header">
        <h2>PROCESS SCHEDULER</h2>
      </div>
      <div className="sidebar-divider" />
      <div className="sidebar-nav">
        <Link
          to="/add-machine"
          className={`sidebar-link ${
            location.pathname === "/add-machine" ? "active" : ""
          }`}
        >
          <div className="sidebar-link-content">
            <div className="sidebar-link-icon">
              <FiPlus />
            </div>
            <span className="sidebar-link-text">ADD PROCESS</span>
            {location.pathname === "/add-machine" && (
              <div className="active-indicator" />
            )}
          </div>
        </Link>
        <Link
          to="/list-comapany"
          className={`sidebar-link ${
            location.pathname === "/list-comapany" ? "active" : ""
          }`}
        >
          <div className="sidebar-link-content">
            <div className="sidebar-link-icon">
              <FiList />
            </div>
            <span className="sidebar-link-text">PROCESS LIST</span>
            {location.pathname === "/list-comapany" && (
              <div className="active-indicator" />
            )}
          </div>
        </Link>
        <Link
          to="/product-master"
          className={`sidebar-link ${
            location.pathname === "/product-master" ? "active" : ""
          }`}
        >
          <div className="sidebar-link-content">
            <div className="sidebar-link-icon">
              <FiPackage />
            </div>
            <span className="sidebar-link-text">PRODUCT MASTER</span>
            {location.pathname === "/product-master" && (
              <div className="active-indicator" />
            )}
          </div>
        </Link>
        <Link
          to="/machine-schedule"
          className={`sidebar-link ${
            location.pathname.startsWith("/machine-schedule") ? "active" : ""
          }`}
        >
          <div className="sidebar-link-content">
            <div className="sidebar-link-icon">
              <FiCalendar />
            </div>
            <span className="sidebar-link-text">SCHEDULE</span>
            {location.pathname.startsWith("/machine-schedule") && (
              <div className="active-indicator" />
            )}
          </div>
        </Link>
      </div>
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || "User"}</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut className="logout-icon" />
          Logout
        </button>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="header">
      <button
        className="header-button"
        onClick={() => window.electron.sendFrameAction("MINIMIZE")}
      >
        _
      </button>
      <button
        className="header-button"
        onClick={() => window.electron.sendFrameAction("MAXIMIZE")}
      >
        □
      </button>
      <button
        className="header-button"
        onClick={() => window.electron.sendFrameAction("CLOSE")}
      >
        ✕
      </button>
    </div>
  );
}

export default App;
