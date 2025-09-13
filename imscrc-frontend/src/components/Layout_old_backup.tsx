import React, { type ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-vh-100">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid">
          <a
            className="navbar-brand fw-bold text-primary d-flex align-items-center"
            href="/dashboard"
          >
            <img
              src="/crclogo.jpg"
              alt="CRC Logo"
              style={{ height: "32px", width: "auto" }}
              className="me-2"
            />
            IMSCRC
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="/dashboard">
                  <i className="bi bi-house-door me-1"></i>
                  Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/pdls">
                  <i className="bi bi-people me-1"></i>
                  PDL Management
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/visitors">
                  <i className="bi bi-person-check me-1"></i>
                  Visitors
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/schedules">
                  <i className="bi bi-calendar-event me-1"></i>
                  Schedules
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/reports">
                  <i className="bi bi-file-earmark-text me-1"></i>
                  Reports
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              <div className="me-3 text-end">
                <div className="fw-medium">{user?.name}</div>
                <small className="text-muted text-capitalize">
                  {user?.role} • {user?.department}
                </small>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline-danger btn-sm"
                title="Logout"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container-fluid py-4">{children}</main>
    </div>
  );
};

export default Layout;
