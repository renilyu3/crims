import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import FormLayout from "./components/layouts/FormLayout";
import TableLayout from "./components/layouts/TableLayout";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";
import PDLDashboard from "./pages/pdl/PDLDashboard";
import PDLRegistration from "./pages/pdl/PDLRegistration";
import PDLList from "./pages/pdl/PDLList";
import PDLDetail from "./pages/pdl/PDLDetail";
import PDLEdit from "./pages/pdl/PDLEdit";
import VisitorsDashboard from "./pages/visitors/VisitorsDashboard";
import ActiveVisitorsDashboard from "./pages/visitors/ActiveVisitorsDashboard";
import VisitorRegistration from "./pages/visitors/VisitorRegistration";
import VisitsHistory from "./pages/visitors/VisitsHistory";
import SchedulingDashboard from "./pages/scheduling/SchedulingDashboard";
import CalendarView from "./pages/scheduling/CalendarView";
import ReportsPage from "./pages/reports/ReportsPage";
import AccountsDashboard from "./pages/accounts/AccountsDashboard";
import CreateUser from "./pages/accounts/CreateUser";
import UserDetail from "./pages/accounts/UserDetail";
import EditUser from "./pages/accounts/EditUser";

// Import the layout styles
import "./styles/layout.css";
import "./styles/layout-components.css";
import "./styles/accounts.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* PDL Management Routes */}
          <Route
            path="/pdls"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardLayout
                    title="PDL Management"
                    subtitle="Manage persons deprived of liberty records and information"
                    actions={
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-download me-1"></i>
                          Export Data
                        </button>
                        <button className="btn btn-primary">
                          <i className="bi bi-person-plus me-1"></i>
                          Add New PDL
                        </button>
                      </div>
                    }
                  >
                    <PDLDashboard />
                  </DashboardLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdls/register"
            element={
              <ProtectedRoute>
                <Layout>
                  <FormLayout maxWidth="lg">
                    <PDLRegistration />
                  </FormLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdls/list"
            element={
              <ProtectedRoute>
                <Layout>
                  <TableLayout
                    searchPlaceholder="Search by name, ID, or case number..."
                    showSearch={true}
                    showFilters={true}
                  >
                    <PDLList />
                  </TableLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdls/search"
            element={
              <ProtectedRoute>
                <Layout>
                  <TableLayout
                    title="Search PDL Records"
                    subtitle="Advanced search functionality for PDL records"
                    searchPlaceholder="Enter search criteria..."
                    showSearch={true}
                    showFilters={true}
                  >
                    <PDLList />
                  </TableLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdls/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardLayout
                    title="PDL Details"
                    subtitle="Detailed information and records"
                    actions={
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary">
                          <i className="bi bi-printer me-1"></i>
                          Print Record
                        </button>
                        <button className="btn btn-warning">
                          <i className="bi bi-pencil me-1"></i>
                          Edit Details
                        </button>
                      </div>
                    }
                  >
                    <PDLDetail />
                  </DashboardLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdls/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FormLayout
                    title="Edit PDL Record"
                    subtitle="Update person deprived of liberty information"
                    maxWidth="lg"
                  >
                    <PDLEdit />
                  </FormLayout>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Visitor Management Routes */}
          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardLayout
                    title="Visitor Management"
                    subtitle="Check-in and check-out visitor management system"
                  >
                    <ActiveVisitorsDashboard />
                  </DashboardLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors/register"
            element={
              <ProtectedRoute>
                <Layout>
                  <FormLayout
                    title="Register New Visitor"
                    subtitle="Enter visitor information for check-in"
                    maxWidth="md"
                  >
                    <VisitorRegistration />
                  </FormLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors/list"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="layout-success">
                    <i className="bi bi-tools"></i>
                    <h5>Feature Coming Soon</h5>
                    <p>Visitor List functionality is under development</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/schedule"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="layout-success">
                    <i className="bi bi-calendar-plus"></i>
                    <h5>Visit Scheduling</h5>
                    <p>Advanced visit scheduling features coming soon</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/approval"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="layout-success">
                    <i className="bi bi-check-circle"></i>
                    <h5>Visit Approval System</h5>
                    <p>Visit approval workflow is being developed</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/active"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="layout-success">
                    <i className="bi bi-activity"></i>
                    <h5>Active Visits Monitor</h5>
                    <p>Real-time active visits monitoring coming soon</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/list"
            element={
              <ProtectedRoute>
                <Layout>
                  <TableLayout
                    searchPlaceholder="Search by visitor name or date..."
                    showSearch={true}
                    showFilters={true}
                  >
                    <VisitsHistory />
                  </TableLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <TableLayout
                    searchPlaceholder="Search by visitor name or date..."
                    showSearch={true}
                    showFilters={true}
                  >
                    <VisitsHistory />
                  </TableLayout>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardLayout>
                    <SchedulingDashboard />
                  </DashboardLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scheduling/calendar"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardLayout
                    title="Scheduling Calendar"
                    subtitle="Browse schedules across time ranges"
                  >
                    <CalendarView />
                  </DashboardLayout>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardLayout>
                    <ReportsPage />
                  </DashboardLayout>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Account Management Routes - Admin Only */}
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <Layout>
                    <DashboardLayout
                      title="Account Management"
                      subtitle="Manage user accounts and system access"
                      actions={
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-secondary">
                            <i className="bi bi-download me-1"></i>
                            Export Users
                          </button>
                          <button className="btn btn-primary">
                            <i className="bi bi-person-plus me-1"></i>
                            Create User
                          </button>
                        </div>
                      }
                    >
                      <AccountsDashboard />
                    </DashboardLayout>
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/create"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <Layout>
                    <FormLayout maxWidth="lg">
                      <CreateUser />
                    </FormLayout>
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <Layout>
                    <DashboardLayout
                      title="User Details"
                      subtitle="View and manage user account information"
                      actions={
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-secondary">
                            <i className="bi bi-printer me-1"></i>
                            Print Profile
                          </button>
                          <button className="btn btn-warning">
                            <i className="bi bi-pencil me-1"></i>
                            Edit User
                          </button>
                        </div>
                      }
                    >
                      <UserDetail />
                    </DashboardLayout>
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id/edit"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <Layout>
                    <FormLayout
                      title="Edit User Account"
                      subtitle="Update user account information and permissions"
                      maxWidth="lg"
                    >
                      <EditUser />
                    </FormLayout>
                  </Layout>
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
