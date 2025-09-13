import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
  children?: NavigationItem[];
  roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  isOpen,
  isMobile,
  onClose,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "bi-speedometer2",
    },
    {
      path: "/pdls",
      label: "PDL Management",
      icon: "bi-people",
      children: [
        { path: "/pdls", label: "Dashboard", icon: "bi-grid" },
        {
          path: "/pdls/register",
          label: "Register PDL",
          icon: "bi-person-plus",
        },
        { path: "/pdls/list", label: "PDL List", icon: "bi-list-ul" },
      ],
    },
    {
      path: "/visitors",
      label: "Visitor Management",
      icon: "bi-person-check",
      children: [
        {
          path: "/visitors",
          label: "Check-In/Out",
          icon: "bi-box-arrow-in-right",
        },
        {
          path: "/visits/history",
          label: "Visit History",
          icon: "bi-clock-history",
        },
      ],
    },
    {
      path: "/schedules",
      label: "Scheduling",
      icon: "bi-calendar-event",
    },
    {
      path: "/reports",
      label: "Reports",
      icon: "bi-file-earmark-text",
    },
    {
      path: "/accounts",
      label: "Account Management",
      icon: "bi-person-gear",
      roles: ["admin"],
      children: [
        {
          path: "/accounts",
          label: "User Dashboard",
          icon: "bi-grid",
          roles: ["admin"],
        },
        {
          path: "/accounts/create",
          label: "Create User",
          icon: "bi-person-plus",
          roles: ["admin"],
        },
      ],
    },
  ];

  const isActiveRoute = (path: string) => {
    // Exact match for dashboard
    if (path === "/dashboard") {
      return location.pathname === path;
    }

    // Get all possible paths from navigation items to avoid conflicts
    const allPaths = navigationItems.flatMap((item) => {
      const paths = [item.path];
      if (item.children) {
        paths.push(...item.children.map((child) => child.path));
      }
      return paths;
    });

    // Sort paths by length (longest first) to prioritize more specific matches
    const sortedPaths = allPaths.sort((a, b) => b.length - a.length);

    // Find the most specific matching path
    const exactMatch = sortedPaths.find((p) => location.pathname === p);
    if (exactMatch) {
      return path === exactMatch;
    }

    // For sub-routes, check if current path starts with the route and has a trailing slash
    return location.pathname.startsWith(path + "/");
  };

  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some((child) => isActiveRoute(child.path));
  };

  const hasAccess = (item: NavigationItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    return user?.role && item.roles.includes(user.role);
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    // Check if user has access to this item
    if (!hasAccess(item)) return null;

    const isActive = isActiveRoute(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = hasActiveChild(item.children);

    // Filter children based on user role
    const accessibleChildren = item.children?.filter((child) =>
      hasAccess(child)
    );

    return (
      <li key={item.path} className="nav-item">
        {hasChildren ? (
          <>
            <div
              className={`nav-link ${isExpanded ? "active" : ""} ${
                level > 0 ? "nav-link-child" : ""
              }`}
              data-bs-toggle="collapse"
              data-bs-target={`#collapse-${item.path.replace(/\//g, "-")}`}
              aria-expanded={isExpanded}
            >
              <div className="nav-link-content">
                <i className={`bi ${item.icon} nav-icon`}></i>
                {!collapsed && (
                  <>
                    <span className="nav-text">{item.label}</span>
                    <i className="bi bi-chevron-down nav-arrow"></i>
                  </>
                )}
              </div>
            </div>
            <div
              className={`collapse ${isExpanded ? "show" : ""}`}
              id={`collapse-${item.path.replace(/\//g, "-")}`}
            >
              <ul className="nav nav-pills flex-column nav-submenu">
                {item.children?.map((child) =>
                  renderNavigationItem(child, level + 1)
                )}
              </ul>
            </div>
          </>
        ) : (
          <Link
            to={item.path}
            className={`nav-link ${isActive ? "active" : ""} ${
              level > 0 ? "nav-link-child" : ""
            }`}
            onClick={isMobile ? onClose : undefined}
          >
            <div className="nav-link-content">
              <i className={`bi ${item.icon} nav-icon`}></i>
              {!collapsed && (
                <>
                  <span className="nav-text">{item.label}</span>
                  {item.badge && (
                    <span className="badge bg-primary nav-badge">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          </Link>
        )}
      </li>
    );
  };

  return (
    <>
      <aside
        className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${
          isMobile ? (isOpen ? "mobile-open" : "mobile-closed") : ""
        }`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/crclogo.jpg" alt="CRC Logo" className="brand-logo" />
            {!collapsed && (
              <div className="brand-text">
                <h5 className="brand-title">CRIMS</h5>
                <small className="brand-subtitle">Management System</small>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="sidebar-user">
            <div className="user-avatar">
              <div className="avatar-circle">
                <i className="bi bi-person-fill"></i>
              </div>
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
              <div className="user-department">{user?.department}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav nav-pills flex-column">
            {navigationItems.map((item) => renderNavigationItem(item))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="system-status">
              <div className="status-item">
                <span className="status-indicator online"></span>
                <span className="status-text">System Online</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
