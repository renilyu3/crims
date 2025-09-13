import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pdlApi } from "../../services/pdlApi";
import type { PDLStatistics } from "../../types/pdl";

const PDLDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<PDLStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await pdlApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      } else {
        setError("Failed to load statistics");
      }
    } catch (err) {
      setError("Error loading statistics");
      console.error("Error fetching PDL statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Statistics Cards */}
      {statistics && (
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-people text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">
                      Total PDLs
                    </h6>
                    <h4 className="card-title mb-0">{statistics.total_pdls}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-person-check text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">
                      Active PDLs
                    </h6>
                    <h4 className="card-title mb-0">
                      {statistics.active_pdls}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-person-exclamation text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Detained</h6>
                    <h4 className="card-title mb-0">{statistics.detained}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-person-x text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Convicted</h6>
                    <h4 className="card-title mb-0">{statistics.convicted}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <Link
                    to="/pdls/register"
                    className="btn btn-outline-primary w-100 py-3"
                  >
                    <i className="bi bi-person-plus fs-4 d-block mb-2"></i>
                    Register New PDL
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link
                    to="/pdls/list"
                    className="btn btn-outline-success w-100 py-3"
                  >
                    <i className="bi bi-list-ul fs-4 d-block mb-2"></i>
                    View All PDLs
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link
                    to="/pdls/search"
                    className="btn btn-outline-info w-100 py-3"
                  >
                    <i className="bi bi-search fs-4 d-block mb-2"></i>
                    Search PDLs
                  </Link>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-outline-warning w-100 py-3"
                    disabled
                  >
                    <i className="bi bi-file-earmark-text fs-4 d-block mb-2"></i>
                    Generate Reports
                    <small className="d-block text-muted">Coming Soon</small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="text-center py-4">
                <i className="bi bi-clock-history fs-1 text-muted mb-3"></i>
                <p className="text-muted mb-0">No recent activity</p>
                <small className="text-muted">
                  Recent PDL registrations and updates will appear here
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics by Gender and Legal Status */}
      {statistics && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Distribution by Gender</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">
                        {statistics.by_gender.male}
                      </h4>
                      <small className="text-muted">Male</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border-end">
                      <h4 className="text-danger mb-1">
                        {statistics.by_gender.female}
                      </h4>
                      <small className="text-muted">Female</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <h4 className="text-secondary mb-1">
                      {statistics.by_gender.other}
                    </h4>
                    <small className="text-muted">Other</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Legal Status Breakdown</h5>
              </div>
              <div className="card-body">
                {Object.entries(statistics.by_legal_status).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <span className="text-capitalize">{status}</span>
                      <span className="badge bg-secondary">{count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDLDashboard;
