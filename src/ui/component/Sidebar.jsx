import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiGrid,
  FiSearch,
  FiPlus,
  FiList,
  FiPackage,
  FiCalendar,
  FiClock,
  FiLogOut,
  FiX,
  FiCheck,
} from "react-icons/fi";
import "./Sidebar.css";

const sidebarContent = {
  Home: [
    { text: "Dashboard", path: "/dashboard", icon: <FiGrid /> },
    { text: "Notifications", path: "/notifications", icon: <FiBell /> },
  ],
  Order: [
    { text: "Search Processes", path: "/search-processes", icon: <FiSearch /> },
    { text: "View Processes", path: "/processes", icon: <FiList /> },
    { text: "New Process", path: "/add-process", icon: <FiPlus /> },
  ],
  Plan: [
    { text: "Add Plan", path: "/add-plan", icon: <FiPlus /> },
    { text: "View Plan", path: "/view-plan", icon: <FiList /> },
  ],
  Master: [
    {
      text: "Machine",
      path: "/list-comapany",
      icon: <FiPackage />,
      subRoutes: ["/machine-schedule"],
    },
    { text: "Add Machine", path: "/add-machine", icon: <FiPlus /> },
    { text: "Product", path: "/product-master", icon: <FiPackage /> },
    {
      text: "Holiday Calendar",
      path: "/holiday-calendar",
      icon: <FiCalendar />,
    },
    { text: "Shift Settings", path: "/shift-settings", icon: <FiClock /> },
  ],
};

function Sidebar({ user, setUser, activeTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const links = sidebarContent[activeTab] || [];
    if (links.length > 0) {
      // Check if current path is already part of the active tab's links or a sub-route
      const currentPathIsValid = links.some(
        (link) =>
          location.pathname === link.path ||
          (link.subRoutes &&
            link.subRoutes.some((subRoute) =>
              location.pathname.startsWith(subRoute)
            ))
      );
      if (!currentPathIsValid) {
        navigate(links[0].path);
      }
    }
  }, [activeTab, navigate, location.pathname]);

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

  const navLinks = sidebarContent[activeTab] || [];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${
              location.pathname === link.path ||
              (link.subRoutes &&
                link.subRoutes.some((subRoute) =>
                  location.pathname.startsWith(subRoute)
                ))
                ? "active"
                : ""
            }`}
          >
            <div className="sidebar-link-icon">{link.icon}</div>
            <span className="sidebar-link-text">{link.text}</span>
          </Link>
        ))}
      </nav>
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
          <span>Logout</span>
        </button>
      </div>

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
    </aside>
  );
}

export default Sidebar;
