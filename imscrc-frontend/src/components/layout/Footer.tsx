import React, { useState, useEffect } from "react";

interface SystemStatus {
  database: "online" | "offline" | "maintenance";
  api: "online" | "offline" | "maintenance";
  backup: "completed" | "running" | "failed" | "scheduled";
}

const Footer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "online",
    api: "online",
    backup: "completed",
  });

  // Update time every second for footer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate system status checks
  useEffect(() => {
    const checkSystemStatus = () => {
      // In a real application, these would be actual API calls
      setSystemStatus({
        database: "online",
        api: "online",
        backup: "completed",
      });
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "completed":
        return "text-success";
      case "running":
      case "scheduled":
        return "text-warning";
      case "offline":
      case "failed":
        return "text-danger";
      case "maintenance":
        return "text-info";
      default:
        return "text-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
      case "completed":
        return "bi-check-circle-fill";
      case "running":
        return "bi-arrow-clockwise";
      case "scheduled":
        return "bi-clock-fill";
      case "offline":
      case "failed":
        return "bi-x-circle-fill";
      case "maintenance":
        return "bi-tools";
      default:
        return "bi-question-circle";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <footer className="main-footer">
      <div className="footer-content">
        {/* Left Section - System Info */}
        <div className="footer-left">
          <div className="system-info">
            <div className="system-name">
              <strong>IMSCRC Management System</strong>
            </div>
            <div className="system-version">
              Version 2.1.0 • Build 2024.01.15
            </div>
          </div>
        </div>

        {/* Center Section - System Status */}
        <div className="footer-center">
          <div className="system-status">
            <div className="status-item">
              <i
                className={`bi ${getStatusIcon(
                  systemStatus.database
                )} ${getStatusColor(systemStatus.database)}`}
              ></i>
              <span className="status-label">Database</span>
              <span
                className={`status-value ${getStatusColor(
                  systemStatus.database
                )}`}
              >
                {systemStatus.database.charAt(0).toUpperCase() +
                  systemStatus.database.slice(1)}
              </span>
            </div>
            <div className="status-divider">•</div>
            <div className="status-item">
              <i
                className={`bi ${getStatusIcon(
                  systemStatus.api
                )} ${getStatusColor(systemStatus.api)}`}
              ></i>
              <span className="status-label">API</span>
              <span
                className={`status-value ${getStatusColor(systemStatus.api)}`}
              >
                {systemStatus.api.charAt(0).toUpperCase() +
                  systemStatus.api.slice(1)}
              </span>
            </div>
            <div className="status-divider">•</div>
            <div className="status-item">
              <i
                className={`bi ${getStatusIcon(
                  systemStatus.backup
                )} ${getStatusColor(systemStatus.backup)}`}
              ></i>
              <span className="status-label">Backup</span>
              <span
                className={`status-value ${getStatusColor(
                  systemStatus.backup
                )}`}
              >
                {systemStatus.backup.charAt(0).toUpperCase() +
                  systemStatus.backup.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Time and Links */}
        <div className="footer-right">
          <div className="footer-time">
            <i className="bi bi-clock me-1"></i>
            {formatTime(currentTime)}
          </div>
          <div className="footer-links">
            <a href="/help" className="footer-link">
              <i className="bi bi-question-circle me-1"></i>
              Help
            </a>
            <span className="link-divider">•</span>
            <a href="/privacy" className="footer-link">
              <i className="bi bi-shield-check me-1"></i>
              Privacy
            </a>
            <span className="link-divider">•</span>
            <a href="/terms" className="footer-link">
              <i className="bi bi-file-text me-1"></i>
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <div className="copyright">
          <span>© 2024 Capiz Rehabilitation Center. All rights reserved.</span>
          <span className="separator">|</span>
          <span>
            Developed for institutional management and rehabilitation services.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
