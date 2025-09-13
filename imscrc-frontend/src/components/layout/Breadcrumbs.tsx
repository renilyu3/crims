import React from "react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", path: "/dashboard", icon: "bi-house" },
    ];

    // Route mapping for better breadcrumb labels
    const routeMap: Record<string, string> = {
      dashboard: "Dashboard",
      pdls: "PDL Management",
      register: "Register",
      list: "List",
      search: "Search",
      edit: "Edit",
      visitors: "Visitor Management",
      visits: "Visits",
      history: "History",
      schedules: "Scheduling",
      reports: "Reports",
      settings: "Settings",
      profile: "Profile",
      help: "Help & Support",
    };

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip numeric IDs in breadcrumbs
      if (/^\d+$/.test(segment)) {
        return;
      }

      const label =
        routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      // Don't add link for the last segment (current page)
      if (index === pathSegments.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumbs on dashboard
  if (location.pathname === "/dashboard") {
    return null;
  }

  return (
    <nav className="breadcrumb-nav" aria-label="breadcrumb">
      <div className="breadcrumb-container">
        <ol className="breadcrumb">
          {breadcrumbs.map((item, index) => (
            <li
              key={index}
              className={`breadcrumb-item ${
                index === breadcrumbs.length - 1 ? "active" : ""
              }`}
              aria-current={
                index === breadcrumbs.length - 1 ? "page" : undefined
              }
            >
              {item.path ? (
                <Link to={item.path} className="breadcrumb-link">
                  {item.icon && <i className={`bi ${item.icon} me-1`}></i>}
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-current">
                  {item.icon && <i className={`bi ${item.icon} me-1`}></i>}
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>

        {/* Page Actions */}
        <div className="breadcrumb-actions">
          {location.pathname.includes("/reports") && (
            <div className="action-buttons">
              <button className="btn btn-sm btn-outline-primary">
                <i className="bi bi-download me-1"></i>
                Export
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
