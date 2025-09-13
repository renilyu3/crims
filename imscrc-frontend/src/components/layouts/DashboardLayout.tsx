import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  return (
    <div className="dashboard-layout">
      {(title || subtitle || actions) && (
        <div className="dashboard-header">
          <div className="dashboard-title-section">
            {title && <h1 className="dashboard-title">{title}</h1>}
            {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="dashboard-actions">{actions}</div>}
        </div>
      )}
      <div className="dashboard-content">{children}</div>
    </div>
  );
};

export default DashboardLayout;
