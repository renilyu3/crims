import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  user: any;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  sidebarCollapsed,
  user,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "System Update",
      message: "System maintenance scheduled for tonight at 2:00 AM",
      type: "info",
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 2,
      title: "New Visitor",
      message: "John Doe has checked in",
      type: "success",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false,
    },
  ]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown")) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      setShowUserMenu(false); // Close the dropdown first
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local state and redirect
      navigate("/login");
    }
  };

  // Debug function to check dropdown state
  const handleUserMenuClick = () => {
    console.log("User menu clicked, current state:", showUserMenu);
    setShowUserMenu(!showUserMenu);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "bi-check-circle-fill text-success";
      case "warning":
        return "bi-exclamation-triangle-fill text-warning";
      case "error":
        return "bi-x-circle-fill text-danger";
      default:
        return "bi-info-circle-fill text-info";
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <header className="main-header">
      <div className="header-content">
        {/* Left Section */}
        <div className="header-left">
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i className="bi bi-list"></i>
          </button>

          {/* Search Bar */}
          <form className="header-search" onSubmit={handleSearch}>
            <div className="search-input-group">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search PDLs, visitors, or records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {/* Current Time */}
          <div className="header-time">
            <div className="time-display">{formatTime(currentTime)}</div>
            <div className="date-display">{formatDate(currentTime)}</div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <Link
              to="/visitors"
              className="quick-action-btn"
              title="Quick Check-in"
            >
              <i className="bi bi-person-plus"></i>
            </Link>
            <Link
              to="/reports"
              className="quick-action-btn"
              title="Generate Report"
            >
              <i className="bi bi-file-text"></i>
            </Link>
          </div>

          {/* Notifications */}
          <div className="dropdown">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="dropdown-menu notification-dropdown">
                <div className="dropdown-header">
                  <h6>Notifications</h6>
                  <span className="badge bg-primary">{unreadCount} new</span>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <i className="bi bi-bell-slash"></i>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          !notification.read ? "unread" : ""
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          <i
                            className={getNotificationIcon(notification.type)}
                          ></i>
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {getRelativeTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="dropdown-footer">
                  <Link to="/notifications" className="view-all-link">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="dropdown">
            <button className="user-menu-btn" onClick={handleUserMenuClick}>
              <div className="user-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
              <i className="bi bi-chevron-down"></i>
            </button>

            {showUserMenu && (
              <div
                className="dropdown-menu user-dropdown"
                style={{
                  display: "block",
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  zIndex: 9999,
                  backgroundColor: "white",
                  border: "1px solid #e9ecef",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  minWidth: "280px",
                  marginTop: "0.5rem",
                }}
              >
                <div className="dropdown-header">
                  <div className="user-details">
                    <div className="user-avatar-large">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <div className="user-info-detailed">
                      <div className="user-name">{user?.name}</div>
                      <div className="user-role">{user?.role}</div>
                      <div className="user-department">{user?.department}</div>
                    </div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item">
                  <i className="bi bi-person"></i>
                  My Profile
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <i className="bi bi-gear"></i>
                  Settings
                </Link>
                <Link to="/help" className="dropdown-item">
                  <i className="bi bi-question-circle"></i>
                  Help & Support
                </Link>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
