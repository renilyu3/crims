import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./layout/Layout";
import DashboardLayout from "./layouts/DashboardLayout";
import FormLayout from "./layouts/FormLayout";
import TableLayout from "./layouts/TableLayout";
import Dashboard from "./Dashboard";
import LoginForm from "./LoginForm";
import PDLDashboard from "../pages/pdl/PDLDashboard";
import PDLRegistration from "../pages/pdl/PDLRegistration";
import PDLList from "../pages/pdl/PDLList";
import PDLDetail from "../pages/pdl/PDLDetail";
import PDLEdit from "../pages/pdl/PDLEdit";
import VisitorsDashboard from "../pages/visitors/VisitorsDashboard";
import VisitorRegistration from "../pages/visitors/VisitorRegistration";
import VisitsHistory from "../pages/visitors/VisitsHistory";
import SchedulingDashboard from "../pages/scheduling/SchedulingDashboard";
import ReportsPage from "../pages/reports/ReportsPage";

// Import the enhanced layout styles
import "../styles/enhanced-layout.css";
import "../styles/layout-components.css";

function EnhancedApp() {
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
                <EnhancedLayout>
                  <DashboardLayout
                    title="Dashboard Overview"
                    subtitle="Welcome to the IMSCRC Management System"
                  >
                    <Dashboard />
                  </DashboardLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          {/* PDL Management Routes */}
          <Route
            path="/pdls"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
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
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdls/register"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <FormLayout
                    title="Register New PDL"
                    subtitle="Enter the details of the person deprived of liberty"
                    maxWidth="lg"
                  >
                    <PDLRegistration />
                  </FormLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdls/list"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <TableLayout
                    title="PDL Records"
                    subtitle="Complete list of all registered persons deprived of liberty"
                    searchPlaceholder="Search by name, ID, or case number..."
                    showSearch={true}
                    showFilters={true}
                    actions={
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary">
                          <i className="bi bi-funnel me-1"></i>
                          Advanced Filter
                        </button>
                        <button className="btn btn-success">
                          <i className="bi bi-file-excel me-1"></i>
                          Export Excel
                        </button>
                      </div>
                    }
                    filters={
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label">Status</label>
                          <select className="form-select">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="released">Released</option>
                            <option value="transferred">Transferred</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Case Type</label>
                          <select className="form-select">
                            <option value="">All Types</option>
                            <option value="criminal">Criminal</option>
                            <option value="civil">Civil</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Date Range</label>
                          <input type="date" className="form-control" />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">&nbsp;</label>
                          <button className="btn btn-primary w-100">
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <PDLList />
                  </TableLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdls/search"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <TableLayout
                    title="Search PDL Records"
                    subtitle="Advanced search functionality for PDL records"
                    searchPlaceholder="Enter search criteria..."
                    showSearch={true}
                    showFilters={true}
                  >
                    <PDLList />
                  </TableLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdls/:id"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
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
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pdls/edit/:id"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <FormLayout
                    title="Edit PDL Record"
                    subtitle="Update person deprived of liberty information"
                    maxWidth="lg"
                  >
                    <PDLEdit />
                  </FormLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          {/* Visitor Management Routes */}
          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <DashboardLayout
                    title="Visitor Management"
                    subtitle="Check-in and check-out visitor management system"
                    actions={
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-info">
                          <i className="bi bi-clock-history me-1"></i>
                          View History
                        </button>
                        <button className="btn btn-success">
                          <i className="bi bi-person-plus me-1"></i>
                          Quick Check-in
                        </button>
                      </div>
                    }
                  >
                    <VisitorsDashboard />
                  </DashboardLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visitors/register"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <FormLayout
                    title="Register New Visitor"
                    subtitle="Enter visitor information for check-in"
                    maxWidth="md"
                  >
                    <VisitorRegistration />
                  </FormLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visits/history"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <TableLayout
                    title="Visit History"
                    subtitle="Complete record of all visitor check-ins and check-outs"
                    searchPlaceholder="Search by visitor name or date..."
                    showSearch={true}
                    showFilters={true}
                    actions={
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-calendar me-1"></i>
                          Date Range
                        </button>
                        <button className="btn btn-success">
                          <i className="bi bi-download me-1"></i>
                          Export Report
                        </button>
                      </div>
                    }
                    filters={
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">Visit Status</label>
                          <select className="form-select">
                            <option value="">All Visits</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">From Date</label>
                          <input type="date" className="form-control" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">To Date</label>
                          <input type="date" className="form-control" />
                        </div>
                      </div>
                    }
                  >
                    <VisitsHistory />
                  </TableLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          {/* Scheduling Routes */}
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <DashboardLayout
                    title="Scheduling System"
                    subtitle="Manage court hearings, visits, and program schedules"
                    actions={
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary">
                          <i className="bi bi-calendar-week me-1"></i>
                          Week View
                        </button>
                        <button className="btn btn-primary">
                          <i className="bi bi-plus-circle me-1"></i>
                          New Schedule
                        </button>
                      </div>
                    }
                  >
                    <SchedulingDashboard />
                  </DashboardLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <DashboardLayout
                    title="Reports & Analytics"
                    subtitle="Generate comprehensive reports and view system analytics"
                    actions={
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-info">
                          <i className="bi bi-graph-up me-1"></i>
                          Analytics
                        </button>
                        <button className="btn btn-success">
                          <i className="bi bi-file-text me-1"></i>
                          Generate Report
                        </button>
                      </div>
                    }
                  >
                    <ReportsPage />
                  </DashboardLayout>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for future features */}
          <Route
            path="/visitors/list"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <div className="layout-success">
                    <i className="bi bi-tools"></i>
                    <h5>Feature Coming Soon</h5>
                    <p>Visitor List functionality is under development</p>
                  </div>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visits/schedule"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <div className="layout-success">
                    <i className="bi bi-calendar-plus"></i>
                    <h5>Visit Scheduling</h5>
                    <p>Advanced visit scheduling features coming soon</p>
                  </div>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visits/approval"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <div className="layout-success">
                    <i className="bi bi-check-circle"></i>
                    <h5>Visit Approval System</h5>
                    <p>Visit approval workflow is being developed</p>
                  </div>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visits/active"
            element={
              <ProtectedRoute>
                <EnhancedLayout>
                  <div className="layout-success">
                    <i className="bi bi-activity"></i>
                    <h5>Active Visits Monitor</h5>
                    <p>Real-time active visits monitoring coming soon</p>
                  </div>
                </EnhancedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default EnhancedApp;
