import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { user } = useAuth();

  // Check if user has required role
  const hasAccess = user?.role && allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      fallback || (
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center">
                <i className="bi bi-shield-exclamation fs-1 text-danger mb-3"></i>
                <h4>Access Denied</h4>
                <p className="mb-3">
                  You don't have permission to access this section. This area is
                  restricted to {allowedRoles.join(", ")} users only.
                </p>
                <div className="text-muted">
                  <small>
                    Current Role: <strong>{user?.role || "Unknown"}</strong>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
